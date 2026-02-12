#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

TARGET_DIR_INPUT="${1:-src}"
if [[ "${TARGET_DIR_INPUT}" = /* ]]; then
  TARGET_DIR="${TARGET_DIR_INPUT}"
else
  TARGET_DIR="${APP_ROOT}/${TARGET_DIR_INPUT}"
fi

if [[ ! -d "${TARGET_DIR}" ]]; then
  echo "Target directory does not exist: ${TARGET_DIR}" >&2
  exit 1
fi

# Rewrite bad React.AbstractComponent types emitted by codemods into
# modern Flow-compatible React.ComponentType declarations.
node - "${TARGET_DIR}" <<'NODE'
const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2];
const fileExtensions = new Set(['.js', '.jsx', '.mjs', '.cjs']);

const topLevelDelimiters = new Set([',', '<', '>', '(', ')', '[', ']', '{', '}']);

function walkFiles(dir, files) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
      continue;
    }

    const extension = path.extname(entry.name);
    if (fileExtensions.has(extension)) {
      files.push(fullPath);
    }
  }
}

function isWhitespace(char) {
  return char === ' ' || char === '\n' || char === '\r' || char === '\t';
}

function skipString(text, index, quoteChar) {
  let i = index + 1;
  while (i < text.length) {
    const current = text[i];
    if (current === '\\') {
      i += 2;
      continue;
    }
    if (current === quoteChar) {
      return i;
    }
    i += 1;
  }
  return -1;
}

function skipLineComment(text, index) {
  let i = index + 2;
  while (i < text.length && text[i] !== '\n') i += 1;
  return i;
}

function skipBlockComment(text, index) {
  let i = index + 2;
  while (i + 1 < text.length) {
    if (text[i] === '*' && text[i + 1] === '/') return i + 1;
    i += 1;
  }
  return -1;
}

function findMatchingAngle(text, openAngleIndex) {
  let depthAngle = 0;
  let depthParens = 0;
  let depthBrackets = 0;
  let depthBraces = 0;

  for (let i = openAngleIndex; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' || char === "'" || char === '`') {
      const end = skipString(text, i, char);
      if (end === -1) return -1;
      i = end;
      continue;
    }

    if (char === '/' && next === '/') {
      i = skipLineComment(text, i);
      continue;
    }
    if (char === '/' && next === '*') {
      const end = skipBlockComment(text, i);
      if (end === -1) return -1;
      i = end;
      continue;
    }

    if (!topLevelDelimiters.has(char)) continue;

    if (char === '<') depthAngle += 1;
    else if (char === '>') {
      depthAngle -= 1;
      if (
        depthAngle === 0 &&
        depthParens === 0 &&
        depthBrackets === 0 &&
        depthBraces === 0
      ) {
        return i;
      }
    } else if (char === '(') depthParens += 1;
    else if (char === ')') depthParens -= 1;
    else if (char === '[') depthBrackets += 1;
    else if (char === ']') depthBrackets -= 1;
    else if (char === '{') depthBraces += 1;
    else if (char === '}') depthBraces -= 1;
  }

  return -1;
}

function splitTopLevelArguments(text) {
  const args = [];
  let depthAngle = 0;
  let depthParens = 0;
  let depthBrackets = 0;
  let depthBraces = 0;
  let start = 0;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' || char === "'" || char === '`') {
      const end = skipString(text, i, char);
      if (end === -1) return null;
      i = end;
      continue;
    }

    if (char === '/' && next === '/') {
      i = skipLineComment(text, i);
      continue;
    }
    if (char === '/' && next === '*') {
      const end = skipBlockComment(text, i);
      if (end === -1) return null;
      i = end;
      continue;
    }

    if (char === '<') depthAngle += 1;
    else if (char === '>') depthAngle -= 1;
    else if (char === '(') depthParens += 1;
    else if (char === ')') depthParens -= 1;
    else if (char === '[') depthBrackets += 1;
    else if (char === ']') depthBrackets -= 1;
    else if (char === '{') depthBraces += 1;
    else if (char === '}') depthBraces -= 1;
    else if (char === ',') {
      if (
        depthAngle === 0 &&
        depthParens === 0 &&
        depthBrackets === 0 &&
        depthBraces === 0
      ) {
        args.push(text.slice(start, i).trim());
        start = i + 1;
      }
    }
  }

  args.push(text.slice(start).trim());
  return args.filter(arg => arg.length > 0);
}

function normalizeRefSetterType(refTypeArg) {
  const trimmed = refTypeArg.trim();
  if (/^React\.RefSetter<[\s\S]+>$/.test(trimmed)) return trimmed;
  return `React.RefSetter<${trimmed}>`;
}

function propsAlreadyContainsRef(propsArg) {
  return /(^|[^A-Za-z0-9_$])(?:\+|-)?ref\?\s*:/.test(propsArg);
}

function addRefPropToObjectType(objectType, refSetterType) {
  const trimmed = objectType.trim();
  const isExact = trimmed.startsWith('{|') && trimmed.endsWith('|}');
  const isInexact = trimmed.startsWith('{') && trimmed.endsWith('}');
  if (!isExact && !isInexact) return null;

  if (propsAlreadyContainsRef(trimmed)) return trimmed;

  if (isExact) {
    const inner = trimmed.slice(2, -2).trim();
    if (!inner) return `{| +ref?: ${refSetterType} |}`;
    const separator = inner.endsWith(',') ? ' ' : ', ';
    return `{| ${inner}${separator}+ref?: ${refSetterType} |}`;
  }

  const inner = trimmed.slice(1, -1).trim();
  if (!inner) return `{ +ref?: ${refSetterType} }`;
  const separator = inner.endsWith(',') ? ' ' : ', ';
  return `{ ${inner}${separator}+ref?: ${refSetterType} }`;
}

function buildComponentTypeReplacement(genericArgumentsText) {
  const args = splitTopLevelArguments(genericArgumentsText);
  if (!args || args.length === 0) return null;

  const propsArg = args[0].trim();
  if (args.length === 1) return `React.ComponentType<${propsArg}>`;

  const refArg = args[1].trim();
  const refSetterType = normalizeRefSetterType(refArg);
  const objectTypeWithRef = addRefPropToObjectType(propsArg, refSetterType);
  if (objectTypeWithRef) return `React.ComponentType<${objectTypeWithRef}>`;

  if (propsAlreadyContainsRef(propsArg)) {
    return `React.ComponentType<${propsArg}>`;
  }

  return `React.ComponentType<{ ...${propsArg}, +ref?: ${refSetterType} }>`;
}

function replaceAbstractComponent(content) {
  const marker = 'React.AbstractComponent<';
  let searchStart = 0;
  let replacedSomething = false;
  let output = '';

  while (true) {
    const markerIndex = content.indexOf(marker, searchStart);
    if (markerIndex === -1) {
      output += content.slice(searchStart);
      break;
    }

    output += content.slice(searchStart, markerIndex);

    const openAngleIndex = markerIndex + 'React.AbstractComponent'.length;
    const closeAngleIndex = findMatchingAngle(content, openAngleIndex);
    if (closeAngleIndex === -1) {
      output += marker;
      searchStart = markerIndex + marker.length;
      continue;
    }

    const genericArgs = content.slice(openAngleIndex + 1, closeAngleIndex);
    const replacement = buildComponentTypeReplacement(genericArgs);
    if (!replacement) {
      output += content.slice(markerIndex, closeAngleIndex + 1);
    } else {
      output += replacement;
      replacedSomething = true;
    }

    searchStart = closeAngleIndex + 1;
  }

  return { content: output, changed: replacedSomething };
}

function removeNowObsoleteFlowFixMeSuppressions(content) {
  const before = content;

  const after = content.replace(
    /^[ \t]*\/\/ \$FlowFixMe\[prop-missing\]\n(?=(?:[ \t]*\n)*[^\n]*React\.ComponentType<)/gm,
    ''
  );

  return { content: after, changed: after !== before };
}

function rewriteFileContent(content) {
  const abstractComponentResult = replaceAbstractComponent(content);
  const flowFixmeResult = removeNowObsoleteFlowFixMeSuppressions(
    abstractComponentResult.content
  );
  return {
    content: flowFixmeResult.content,
    changed: abstractComponentResult.changed || flowFixmeResult.changed,
  };
}

const allFiles = [];
walkFiles(targetDir, allFiles);

let changedFiles = 0;
for (const filePath of allFiles) {
  const originalContent = fs.readFileSync(filePath, 'utf8');
  const rewritten = rewriteFileContent(originalContent);
  if (!rewritten.changed || rewritten.content === originalContent) continue;
  fs.writeFileSync(filePath, rewritten.content, 'utf8');
  changedFiles += 1;
}

console.log(`Processed ${allFiles.length} files, updated ${changedFiles}.`);
NODE

echo "Flow React component type fixes completed for: ${TARGET_DIR}"
