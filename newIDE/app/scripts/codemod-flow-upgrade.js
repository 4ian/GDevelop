#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const recast = require('recast');
const flowParser = require('recast/parsers/flow');
const { execFileSync } = require('child_process');

const appRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appRoot, '..', '..');
const FLOW_JSON_MAX_BUFFER = 1024 * 1024 * 200;

const TARGET_DIRS = [
  path.join(appRoot, 'flow-typed'),
  path.join(repoRoot, 'GDevelop.js', 'types'),
];
const SRC_DIR = path.join(appRoot, 'src');
const APP_FLOW_SHIMS_PATH = path.join(appRoot, 'flow-typed', 'flow-upgrade-shims.js');

function collectJsFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  const stack = [directory];

  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === 'node_modules') continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function replaceExistentials(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  let ast;
  try {
    ast = recast.parse(source, { parser: flowParser });
  } catch (error) {
    console.error(`Failed to parse ${filePath}`);
    throw error;
  }

  let changed = false;
  recast.types.visit(ast, {
    visitExistsTypeAnnotation(path) {
      changed = true;
      path.replace(recast.types.builders.anyTypeAnnotation());
      return false;
    },
  });

  if (!changed) return false;

  const output = recast.print(ast, { reuseWhitespace: true }).code;
  if (output !== source) {
    fs.writeFileSync(filePath, output, 'utf8');
    return true;
  }

  return false;
}

function insertFlowFixMe(filePath, methodNames) {
  if (!fs.existsSync(filePath)) return false;
  const source = fs.readFileSync(filePath, 'utf8');
  const lines = source.split('\n');
  let changed = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const methodName of methodNames) {
      const matcher = new RegExp(`^\\s+${methodName}\\(`);
      if (!matcher.test(line)) continue;

      const previousLine = lines[i - 1] || '';
      if (previousLine.includes('$FlowFixMe')) continue;

      const indentMatch = line.match(/^\s*/);
      const indent = indentMatch ? indentMatch[0] : '';
      lines.splice(i, 0, `${indent}// $FlowFixMe[incompatible-type]`);
      i += 1;
      changed = true;
    }
  }

  if (!changed) return false;
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  return true;
}

function applyTextReplacements(filePath, replacements) {
  if (!fs.existsSync(filePath)) return false;
  const source = fs.readFileSync(filePath, 'utf8');
  let updated = source;

  for (const replacement of replacements) {
    const { searchValue, replaceValue } = replacement;
    if (searchValue instanceof RegExp) {
      updated = updated.replace(searchValue, replaceValue);
    } else {
      updated = updated.split(searchValue).join(replaceValue);
    }
  }

  if (updated === source) return false;
  fs.writeFileSync(filePath, updated, 'utf8');
  return true;
}

function ensureFileEndsWith(filePath, suffix) {
  if (!fs.existsSync(filePath)) return false;
  const source = fs.readFileSync(filePath, 'utf8');
  if (source.trimEnd().endsWith(suffix)) return false;
  fs.writeFileSync(filePath, `${source.trimEnd()}\n${suffix}\n`, 'utf8');
  return true;
}

function collectFlowErrors() {
  let output = '';
  try {
    output = execFileSync('npx', ['flow', 'status', '--json'], {
      cwd: appRoot,
      maxBuffer: FLOW_JSON_MAX_BUFFER,
    }).toString();
  } catch (error) {
    if (error.stdout) {
      output = error.stdout.toString();
    } else {
      throw error;
    }
  }

  const parsed = JSON.parse(output);
  return parsed.errors || [];
}

function mergeFlowFixMeCodes(line, codes) {
  const match = line.match(/^(\s*\/\/\s*\$FlowFixMe)(\[[^\]]+\])*(.*)$/);
  if (!match) return line;
  const prefix = match[1];
  const suffix = match[3] || '';
  const existingCodes = new Set();
  const codeMatches = match[2] ? match[2].match(/\[[^\]]+\]/g) : null;
  if (codeMatches) {
    for (const codeMatch of codeMatches) {
      existingCodes.add(codeMatch.slice(1, -1));
    }
  }
  for (const code of codes) existingCodes.add(code);
  const mergedCodes = Array.from(existingCodes).sort();
  const codeString = mergedCodes.map(code => `[${code}]`).join('');
  return `${prefix}${codeString}${suffix}`;
}

function applyFlowSuppressions(errors) {
  const errorsByFile = new Map();

  for (const error of errors) {
    const codes = Array.isArray(error.error_codes) ? error.error_codes : [];
    if (!codes.length) continue;
    const messageWithLoc = (error.message || []).find(
      message => message.loc && message.loc.source
    );
    if (!messageWithLoc) continue;
    const sourcePath = messageWithLoc.loc.source || messageWithLoc.path;
    if (!sourcePath || !sourcePath.startsWith(appRoot)) continue;
    if (sourcePath.includes(`${path.sep}node_modules${path.sep}`)) continue;

    const line = messageWithLoc.loc.start ? messageWithLoc.loc.start.line : messageWithLoc.line;
    if (!line) continue;

    if (!errorsByFile.has(sourcePath)) {
      errorsByFile.set(sourcePath, new Map());
    }
    const byLine = errorsByFile.get(sourcePath);
    if (!byLine.has(line)) byLine.set(line, new Set());
    const codesSet = byLine.get(line);
    for (const code of codes) {
      codesSet.add(code);
    }
  }

  let updatedFiles = 0;
  for (const [filePath, byLine] of errorsByFile.entries()) {
    if (!fs.existsSync(filePath)) continue;
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    const entries = Array.from(byLine.entries())
      .map(([line, codesSet]) => ({
        line,
        codes: Array.from(codesSet).sort(),
      }))
      .sort((a, b) => a.line - b.line);

    let offset = 0;
    let changed = false;
    for (const entry of entries) {
      const targetIndex = entry.line - 1 + offset;
      if (targetIndex < 0 || targetIndex >= lines.length) continue;
      const previousLineIndex = targetIndex - 1;
      const previousLine = previousLineIndex >= 0 ? lines[previousLineIndex] : '';
      if (previousLine.includes('$FlowFixMe')) {
        const merged = mergeFlowFixMeCodes(previousLine, entry.codes);
        if (merged !== previousLine) {
          lines[previousLineIndex] = merged;
          changed = true;
        }
        continue;
      }

      const indentMatch = lines[targetIndex].match(/^\s*/);
      const indent = indentMatch ? indentMatch[0] : '';
      lines.splice(targetIndex, 0, `${indent}// $FlowFixMe${entry.codes.map(code => `[${code}]`).join('')}`);
      offset += 1;
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      updatedFiles += 1;
    }
  }

  return updatedFiles;
}

function ensureGDevelopShims() {
  const filePath = path.join(repoRoot, 'GDevelop.js', 'types', 'flow-upgrade-shims.js');
  const declarations = [
    'declare class gdVectorParameterMetadata {}',
    'declare class gdAdMobObject {}',
    'declare class gdExporter {}',
  ];

  if (!fs.existsSync(filePath)) {
    const contents = [
      '// Added by codemod-flow-upgrade.js for Flow 0.299',
      ...declarations,
      '',
    ].join('\n');
    fs.writeFileSync(filePath, contents, 'utf8');
    return true;
  }

  const source = fs.readFileSync(filePath, 'utf8');
  let updated = source;
  let changed = false;

  for (const declaration of declarations) {
    if (updated.includes(declaration)) continue;
    updated = `${updated.trimEnd()}\n${declaration}\n`;
    changed = true;
  }

  if (!changed) return false;
  fs.writeFileSync(filePath, updated, 'utf8');
  return true;
}

function ensureAppShims() {
  const declarations = ['declare var navigator: any;'];

  if (!fs.existsSync(APP_FLOW_SHIMS_PATH)) {
    const contents = [
      '// Added by codemod-flow-upgrade.js for Flow 0.299',
      ...declarations,
      '',
    ].join('\n');
    fs.writeFileSync(APP_FLOW_SHIMS_PATH, contents, 'utf8');
    return true;
  }

  const source = fs.readFileSync(APP_FLOW_SHIMS_PATH, 'utf8');
  let updated = source;
  let changed = false;

  for (const declaration of declarations) {
    if (updated.includes(declaration)) continue;
    updated = `${updated.trimEnd()}\n${declaration}\n`;
    changed = true;
  }

  if (!changed) return false;
  fs.writeFileSync(APP_FLOW_SHIMS_PATH, updated, 'utf8');
  return true;
}

function run() {
  const jsFiles = TARGET_DIRS.flatMap(collectJsFiles);
  let updatedFiles = 0;

  const overrideTargets = [
    {
      filePath: path.join(repoRoot, 'GDevelop.js', 'types', 'gdbehaviorjsimplementation.js'),
      methodNames: ['getProperties', 'updateProperty', 'initializeContent'],
    },
    {
      filePath: path.join(repoRoot, 'GDevelop.js', 'types', 'gdbehaviorshareddatajsimplementation.js'),
      methodNames: ['getProperties', 'updateProperty', 'initializeContent'],
    },
  ];

  for (const target of overrideTargets) {
    if (insertFlowFixMe(target.filePath, target.methodNames)) updatedFiles += 1;
  }

  const flowTypedReplacements = [
    {
      filePath: path.join(appRoot, 'flow-typed', 'npm', 'axios_v0.16.x.js'),
      replacements: [
        { searchValue: /progressEvent: Event/g, replaceValue: 'progressEvent: any' },
        {
          searchValue: /http\$ClientRequest\s*\|\s*XMLHttpRequest/g,
          replaceValue: 'any',
        },
        { searchValue: /http\$ClientRequest\s*\|\s*any/g, replaceValue: 'any' },
      ],
    },
    {
      filePath: path.join(appRoot, 'flow-typed', 'npm', '@storybook', 'react_v6.x.x.js'),
      replacements: [{ searchValue: 'React$Element<any>', replaceValue: 'any' }],
    },
    {
      filePath: path.join(appRoot, 'flow-typed', 'npm', 'jest_v24.x.x.js'),
      replacements: [
        { searchValue: 'React$Element<any>', replaceValue: 'any' },
        { searchValue: /\bHTMLElement\b/g, replaceValue: 'any' },
      ],
    },
    {
      filePath: path.join(appRoot, 'flow-typed', 'npm', 'lodash_v4.x.x.js'),
      replacements: [
        {
          searchValue: /declare module\.exports:\s*\$PropertyType<[^;]+>;/g,
          replaceValue: 'declare module.exports: any;',
        },
        { searchValue: /\$ComposeReverse/g, replaceValue: 'any' },
        { searchValue: /\$Compose/g, replaceValue: 'any' },
        { searchValue: /isElement\(value: Element\)/g, replaceValue: 'isElement(value: any)' },
      ],
    },
    {
      filePath: path.join(appRoot, 'flow-typed', 'npm', 'prettier_v1.x.x.js'),
      replacements: [
        { searchValue: /\$PropertyType<[^>]+>/g, replaceValue: 'any' },
      ],
    },
    {
      filePath: path.join(appRoot, 'flow-typed', 'npm', 'react-color_v2.x.x.js'),
      replacements: [
        { searchValue: /SyntheticMouseEvent<[^>]+>/g, replaceValue: 'any' },
        { searchValue: /\$Diff<[^>]+>[^>]*>/g, replaceValue: 'any' },
        { searchValue: /\$Diff<[^>]+>/g, replaceValue: 'any' },
        { searchValue: /React\$ElementConfig<[^>]+>/g, replaceValue: 'any' },
      ],
    },
    {
      filePath: path.join(appRoot, 'flow-typed', 'npm', 'react-dnd-html5-backend_v2.x.x.js'),
      replacements: [{ searchValue: /\bImage\b/g, replaceValue: 'any' }],
    },
    {
      filePath: path.join(appRoot, 'flow-typed', 'npm', 'react-dnd_v2.x.x.js'),
      replacements: [
        {
          searchValue:
            /declare type Connector<SP: \{\.\.\.\}, CP: \{\.\.\.\}> = [\s\S]*?\);\n/,
          replaceValue: 'declare type Connector<SP: {...}, CP: {...}> = any;\n',
        },
        { searchValue: /DropTargetTypes<[^>]+>/g, replaceValue: 'any' },
        { searchValue: /\bDropTargetTypes\b/g, replaceValue: 'any' },
        { searchValue: /React\$Element<[^>]+>/g, replaceValue: 'any' },
        { searchValue: /\bHTMLElement\b/g, replaceValue: 'any' },
        { searchValue: /React\$ComponentType<[^>]+>/g, replaceValue: 'any' },
        { searchValue: /React\$ComponentType\b/g, replaceValue: 'any' },
        { searchValue: /React\$Component<[^>]+>/g, replaceValue: 'any' },
        { searchValue: /React\$Component\b/g, replaceValue: 'any' },
        { searchValue: /\$Diff<[^>]+>[^>]*>/g, replaceValue: 'any' },
        { searchValue: /\$Diff<[^>]+>/g, replaceValue: 'any' },
        { searchValue: /\$Shape<([^>]+)>/g, replaceValue: 'Partial<$1>' },
        { searchValue: /extends any/g, replaceValue: 'extends Object' },
      ],
    },
    {
      filePath: path.join(appRoot, 'flow-typed', 'npm', 'react-test-renderer_v16.x.x.js'),
      replacements: [{ searchValue: /React\$Element<[^>]+>/g, replaceValue: 'any' }],
    },
    {
      filePath: path.join(appRoot, 'node_modules', 'fbjs', 'lib', 'keyMirrorRecursive.js.flow'),
      replacements: [{ searchValue: '@flow weak', replaceValue: '@flow' }],
    },
    {
      filePath: path.join(appRoot, 'flow-typed', 'zip.js'),
      replacements: [{ searchValue: /\bBlob\b/g, replaceValue: 'any' }],
    },
  ];

  for (const target of flowTypedReplacements) {
    if (applyTextReplacements(target.filePath, target.replacements)) updatedFiles += 1;
  }

  if (ensureGDevelopShims()) updatedFiles += 1;
  if (ensureAppShims()) updatedFiles += 1;

  const renderReplacements = [
    {
      searchValue: /:\s*component\(\.\.\.([A-Za-z0-9_$]+)\)\s*renders\*/g,
      replaceValue: ': React.ComponentType<$1>',
    },
    {
      searchValue: /:\s*component\(\.\.\.\{[\s\S]*?\bProps\b[\s\S]*?\}\)\s*React\.Node/g,
      replaceValue: ': React.ComponentType<Props>',
    },
    { searchValue: /renders\*/g, replaceValue: 'React.Node' },
    { searchValue: /renders React\.Node\b/g, replaceValue: 'React.Node' },
    { searchValue: /renders React\$Node\b/g, replaceValue: 'React.Node' },
    { searchValue: /renders Fragment\b/g, replaceValue: 'React.Node' },
    { searchValue: /renders any\b/g, replaceValue: 'React.Node' },
  ];

  const srcFiles = collectJsFiles(SRC_DIR);
  for (const filePath of srcFiles) {
    if (applyTextReplacements(filePath, renderReplacements)) updatedFiles += 1;
  }

  const flowFixMeReplacements = [
    {
      searchValue: /\/\/\s*\$FlowFixMe(?!\[)/g,
      replaceValue: '// $FlowFixMe[incompatible-type]',
    },
  ];
  for (const filePath of srcFiles) {
    if (applyTextReplacements(filePath, flowFixMeReplacements)) updatedFiles += 1;
  }

  const literalReplacements = [
    {
      searchValue: /(const|let)\s+([A-Za-z0-9_$]+)\s*=\s*\{\}\s*;?/g,
      replaceValue: '$1 $2: {[string]: any} = {};',
    },
    {
      searchValue: /(const|let)\s+([A-Za-z0-9_$]+)\s*=\s*\[\]\s*;?/g,
      replaceValue: '$1 $2: Array<any> = [];',
    },
  ];
  for (const filePath of srcFiles) {
    if (applyTextReplacements(filePath, literalReplacements)) updatedFiles += 1;
  }

  const chatMarkdownTextPath = path.join(
    appRoot,
    'src',
    'AiGeneration',
    'AiRequestChat',
    'ChatMarkdownText.js'
  );
  if (
    applyTextReplacements(chatMarkdownTextPath, [
      {
        searchValue: /const elements = \[\];/g,
        replaceValue: 'const elements: Array<React.Node> = [];',
      },
      {
        searchValue: /img: \(\{ node, \.\.\.props \}\) => \(/g,
        replaceValue: 'img: ({ node, ...props }: any) => (',
      },
      {
        searchValue:
          /const className = classNames[\s\S]*?return <span className=\{className\}>\{markdownElement\}<\/span>;/g,
        replaceValue:
          `const className = classNames(({
    'gd-markdown': true,
    [classes.chatMarkdown]: true,
  }: any));

  return <span className={className}>{markdownElement}</span>;`,
      },
    ])
  ) {
    updatedFiles += 1;
  }

  if (ensureFileEndsWith(chatMarkdownTextPath, '});')) updatedFiles += 1;

  const aiRequestChatIndexPath = path.join(
    appRoot,
    'src',
    'AiGeneration',
    'AiRequestChat',
    'index.js'
  );
  if (
    applyTextReplacements(aiRequestChatIndexPath, [
      {
        searchValue:
          /export const AiRequestChat: component[\s\S]*?\)\s*React\.Node\s*=\s*React\.forwardRef/g,
        replaceValue:
          'export const AiRequestChat: React.ComponentType<Props> = React.forwardRef',
      },
      {
        searchValue: /import \{ I18n as I18nType \} from '@lingui\/core';/g,
        replaceValue: "import type { I18n as I18nType } from '@lingui/core';",
      },
      {
        searchValue: /React\.useRef<ScrollViewInterface \| null>\(null\)/g,
        replaceValue: 'React.useRef<any>(null)',
      },
    ])
  ) {
    updatedFiles += 1;
  }

  const chatMessagesPath = path.join(
    appRoot,
    'src',
    'AiGeneration',
    'AiRequestChat',
    'ChatMessages.js'
  );
  if (
    applyTextReplacements(chatMessagesPath, [
      {
        searchValue: /const items = \[\];/g,
        replaceValue: 'const items: Array<any> = [];',
      },
      {
        searchValue: /let currentFunctionCallItems = \[\];/g,
        replaceValue: 'let currentFunctionCallItems: Array<any> = [];',
      },
      {
        searchValue: /let pendingFunctionCallItems = \[\];/g,
        replaceValue: 'let pendingFunctionCallItems: Array<any> = [];',
      },
      {
        searchValue: /return \[\];/g,
        replaceValue: 'return ([]: Array<any>);',
      },
      {
        searchValue: /React\.useState\(\{\}\)/g,
        replaceValue: "React.useState<{[string]: 'like' | 'dislike'}>({})",
      },
      {
        searchValue: /React\.useState\(null\)/g,
        replaceValue:
          "React.useState<?{| aiRequestId: string, messageIndex: number |}>(null)",
      },
    ])
  ) {
    updatedFiles += 1;
  }

  const functionCallRowPath = path.join(
    appRoot,
    'src',
    'AiGeneration',
    'AiRequestChat',
    'FunctionCallRow.js'
  );
  if (
    applyTextReplacements(functionCallRowPath, [
      {
        searchValue: /hasDetailsToShow = result\.hasDetailsToShow;/g,
        replaceValue: 'hasDetailsToShow = !!result.hasDetailsToShow;',
      },
    ])
  ) {
    updatedFiles += 1;
  }

  for (const filePath of jsFiles) {
    if (replaceExistentials(filePath)) updatedFiles += 1;
  }

  execFileSync(
    'npx',
    ['flow', 'codemod', 'annotate-exports', '--write', '--default-any', 'src'],
    {
    cwd: appRoot,
    stdio: 'inherit',
    }
  );

  const flowErrors = collectFlowErrors();
  const suppressedFiles = applyFlowSuppressions(flowErrors);
  if (suppressedFiles) updatedFiles += suppressedFiles;

  console.log(`Flow upgrade codemod complete. Updated ${updatedFiles} file(s).`);
}

run();
