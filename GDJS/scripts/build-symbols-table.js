const shell = require('shelljs');
const { execSync } = require('child_process');
const path = require('path');
const {
  getAllInOutFilePaths,
  isUntransformedFile,
} = require('./lib/runtime-files-list');
const fs = require('fs');

const symbols = {};

const runtimePath = path.join(__dirname, '..', 'Runtime');
async function extractSymbolsFrom(file) {
  const contents = await fs.promises.readFile(file, 'utf-8');
  for (const symbol of contents.matchAll(
    /export(?: abstract)? (class|const|let|var|type|interface|(?:const )?enum) ([a-zA-Z0-9\_]*)/gim
  )) {
    symbols[symbol[2]] = path.relative(runtimePath, file);
  }
}

(async () => {
  // Generate the output file paths
  const {
    allGDJSInOutFilePaths,
    allExtensionsInOutFilePaths,
  } = await getAllInOutFilePaths({ bundledOutPath: './' });

  const allInOutFilePaths = [
    ...allGDJSInOutFilePaths,
    //    ...allExtensionsInOutFilePaths,
  ]
    .filter(({ inPath }) => !isUntransformedFile(inPath))
    .filter(({ inPath }) => path.extname(inPath) === '.ts');

  shell.echo(
    `ℹ️ Creating a symbols table for those files: ${allInOutFilePaths
      .map(({ inPath }) => path.relative(__dirname, inPath))
      .join(', ')}`
  );

  await Promise.all(
    allInOutFilePaths.map(({ inPath }) => extractSymbolsFrom(inPath))
  );

  shell.echo(`ℹ️ Writing symbols table to "symbols.json"...`);

  await fs.writeFileSync(
    path.join(__dirname, 'symbols.json'),
    JSON.stringify(symbols),
    'utf-8'
  );
})();
