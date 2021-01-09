const shell = require('shelljs');
const path = require('path');
const {
  getAllInOutFilePaths,
  isUntransformedFile,
} = require('./lib/runtime-files-list');

(async () => {
  // Generate the output file paths
  const {
    allGDJSInOutFilePaths,
    allExtensionsInOutFilePaths,
  } = await getAllInOutFilePaths();

  const allInOutFilePaths = [
    ...allGDJSInOutFilePaths,
    ...allExtensionsInOutFilePaths,
  ].filter(({ inPath }) => !isUntransformedFile(inPath))
  .filter(({ inPath }) => path.extname(inPath) === '.js');
  const totalCount = allInOutFilePaths.length;
  let doneCount = 0;

  shell.echo(
    `ℹ️ Will codemod these files: ${allInOutFilePaths
      .map(({ inPath }) => path.relative(__dirname, inPath))
      .join(', ')}`
  );
  for (const inOutFilePath of allInOutFilePaths) {
    const { inPath } = inOutFilePath;
    shell.echo(`ℹ️ Codemoding ${inPath}... (${doneCount}/${totalCount} done)`);
    shell.exec(
      `node codemod-file-to-ts.js --file ${path.relative(__dirname, inPath)}`
    );
    shell.rm(inPath);
    doneCount++;
  }
})();
