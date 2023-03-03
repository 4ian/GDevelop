const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
const args = require('minimist')(process.argv.slice(2), {
  string: ['file'],
});

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
  file.matchAll(/namespace ([a-zA-Z\_]*) {/gim)
).map((array) => array[1]);

// Generate output path
const sourceFolder = path.join(__dirname, '..', 'Runtime');
const outFolder = path.join(__dirname, '..', 'src');
function getOutPath(sourcePath) {
  return path.join(outFolder, path.relative(sourceFolder, sourcePath));
}
const outPath = getOutPath(sourcePath);

// Remove namespace declarations
for (const match of file.matchAll(/namespace [a-zA-Z\_]* {/gim)) {
  file = file.slice(
    file.indexOf(match[0]) + match[0].length,
    file.lastIndexOf('}')
  );
}

// Extract all dependencies
const symbols = require('./symbols.json');
const imports = new Map();
for (const match of file.matchAll(/gdjs.([a-zA-Z\_]*)/gim)) {
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
  )}\n${file}`;
}

// Remove references to `gdjs`
file = file.replace(/gdjs./gim, '');

// Replace declare statements with exports
//file = file.replace(/declare /gim, 'export ');

// Write codemoded file
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, file, 'utf-8');
