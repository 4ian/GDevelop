const shell = require('shelljs');
const { execSync } = require('child_process');
const path = require('path');
const {
  getAllInOutFilePaths,
  isUntransformedFile,
} = require('./lib/runtime-files-list');
const fs = require('fs');

(async () => {
  execSync(`node ${path.join(__dirname, 'build-symbols-table.js')}`, {
    stdio: 'inherit',
  });

  // Clear output
  fs.rmSync(path.join(__dirname, '..', 'src'), {
    recursive: true,
    force: true,
  });

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
    .filter(({ inPath }) => path.extname(inPath) === '.ts')
    .concat([
      { inPath: '.\\Runtime\\types\\global-types.d.ts' },
      { inPath: '.\\Runtime\\types\\project-data.d.ts' },
    ]);
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
    try {
      execSync(
        `node ${path.join(
          __dirname,
          'codemod-file-to-esm.js'
        )} --file ${path.relative(path.join(__dirname, '..'), inPath)}`,
        { stdio: 'inherit' }
      );
    } catch {
      // Already logged by the single-file codemod
    }
    //shell.rm(inPath);
    doneCount++;
  }
})();
