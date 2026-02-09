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

      const indent = line.match(/^\s*/)?.[0] ?? '';
      lines.splice(i, 0, `${indent}// $FlowFixMe[incompatible-type]`);
      i += 1;
      changed = true;
    }
  }

  if (!changed) return false;
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
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

  console.log(`Flow upgrade codemod complete. Updated ${updatedFiles} file(s).`);
}

run();
