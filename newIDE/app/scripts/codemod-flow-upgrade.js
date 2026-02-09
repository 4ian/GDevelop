#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const recast = require('recast');
const flowParser = require('recast/parsers/flow');

const appRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appRoot, '..', '..');

const TARGET_DIRS = [
  path.join(appRoot, 'flow-typed'),
  path.join(repoRoot, 'GDevelop.js', 'types'),
];

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

function run() {
  const jsFiles = TARGET_DIRS.flatMap(collectJsFiles);
  let updatedFiles = 0;

  for (const filePath of jsFiles) {
    if (replaceExistentials(filePath)) updatedFiles += 1;
  }

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
  ];

  for (const target of flowTypedReplacements) {
    if (applyTextReplacements(target.filePath, target.replacements)) updatedFiles += 1;
  }

  if (ensureGDevelopShims()) updatedFiles += 1;

  console.log(`Flow upgrade codemod complete. Updated ${updatedFiles} file(s).`);
}

run();
