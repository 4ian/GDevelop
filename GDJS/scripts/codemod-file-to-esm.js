const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
const args = require('minimist')(process.argv.slice(2), {
  string: ['file'],
});
const prettier = require('prettier');

if (typeof args['file'] !== 'string') {
  shell.echo(`❌ No source file (--file) was given!`);
  shell.exit(1);
  return;
}

const sourcePath = path.resolve(__dirname, '..', args['file'] || '');
if (path.extname(sourcePath) !== '.ts') {
  shell.echo(`❌ Source file "${sourcePath}" should be a .ts source file`);
  shell.exit(1);
}
try {
  if (!fs.statSync(sourcePath).isFile()) {
    shell.echo(`❌ Source file "${sourcePath}" is not a real file!`);
    shell.exit(1);
  }
} catch {
  shell.echo(`❌ Source file "${sourcePath}" not found!`);
  shell.exit(1);
}

let file = fs.readFileSync(sourcePath, 'utf-8');

// Get the namespace the file works with
const namespaceArborescence = Array.from(
  file.matchAll(/namespace ([a-zA-Z0-9\_]*) {/gim)
).map((array) => array[1]);

// Generate output path
const sourceFolder = path.join(__dirname, '..', 'Runtime');
const outFolder = path.join(__dirname, '..', 'src');
function getOutPath(sourcePath) {
  return path.join(outFolder, path.relative(sourceFolder, sourcePath));
}
const outPath = getOutPath(sourcePath);

// Remove namespace declarations
for (const match of file.matchAll(/namespace [a-zA-Z0-9\_]* {/gim)) {
  file = file.slice(
    file.indexOf(match[0]) + match[0].length,
    file.lastIndexOf('}')
  );
}

// Extract all dependencies
const symbols = require('./symbols.json');
const imports = new Map();

// Extract Hashtable dependencies
for (const match of file.matchAll(/(?:^[^*\n]+)(?<!class )Hashtable/gim)) {
  const moduleFile = `libs/jshashtable.ts`;
  let symbolsToImport = imports.get(moduleFile);
  if (!symbolsToImport) imports.set(moduleFile, (symbolsToImport = new Set()));
  symbolsToImport.add('Hashtable');
}

// Extract evtTools dependencies
for (const match of file.matchAll(
  /(?:^[^*\n]+)gdjs\.evtTools\.([a-zA-Z0-9\_]*)\.([a-zA-Z0-9\_]*)/gim
)) {
  const namespace = match[1];
  const symbol = match[2];

  const moduleFile = `events-tools/${namespace}tools.ts`;
  let symbolsToImport = imports.get(moduleFile);
  if (!symbolsToImport) imports.set(moduleFile, (symbolsToImport = new Set()));
  symbolsToImport.add(symbol);
}

// Extract normal dependencies
for (const match of file.matchAll(
  /(?:^[^*\n]+)gdjs\.(?!evtTools)([a-zA-Z0-9\_]*)/gim
)) {
  const symbol = match[1];
  if (!symbols.hasOwnProperty(symbol)) {
    console.error(`⚠ Unrecognized symbol: ${symbol}`);
    continue;
  }
  const moduleFile = symbols[symbol];
  let symbolsToImport = imports.get(moduleFile);
  if (!symbolsToImport) imports.set(moduleFile, (symbolsToImport = new Set()));
  symbolsToImport.add(symbol);
}

// Make .d.ts global
if (sourcePath.includes('.d.ts')) {
  file = `declare global {\n ${file.replace(/declare/gim, 'export')} \n}`;
}

// For some reason typescript absolutely wants this file to import anything (???) so we import the other global types declaration file
if (sourcePath.includes('project-data.d.ts')) {
  file = `import "./global-types";\n${file}`;
}

// Add imports for all dependencies
for (const [moduleFile, symbolsToImport] of imports.entries()) {
  // Don't import symbols already in the current file
  if (moduleFile === path.basename(sourcePath)) continue;

  file = `import { ${Array.from(symbolsToImport.values()).join(
    ', '
  )} } from ${JSON.stringify(
    path
      .relative(
        outPath,
        getOutPath(path.join(sourceFolder, moduleFile.slice(0, -3)))
      )
      .slice(1) // Node assumes the paths are directories instead of files, so it outputs `../` instead of `./`
      .replace(/\\/g, '/') // Node outputs backslashes on windows, and prettier does not fix that automatically
  )}\n${file}`;
}

// Goodbye, PIXI hack o7
file = file.replace(
  '// @ts-expect-error - the effects manager is typed with the PIXI object.',
  ''
);
//TODO - import only what is used
file = file.replace(
  'import PIXI = GlobalPIXIModule.PIXI;',
  `import * as PIXI from "pixi.js"`
);

// Export Hashtable
file = file.replace('class Hashtable', 'export class Hashtable');

// Remove references to `gdjs.evtTools`
file = file.replace(/gdjs\.evtTools\.[a-zA-Z0-9\_]+\./gim, '');

// Remove references to `gdjs`
file = file.replace(/gdjs\./gim, '');

// Format the file
try {
  file = prettier.format(file, {
    parser: 'babel-ts',
    singleQuote: true,
    trailingComma: 'es5',
  });
} catch {
  console.warn('Formatting impossible - there may be a syntax error!');
}

// Write codemoded file
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, file, 'utf-8');
