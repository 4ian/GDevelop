const esbuild = require('esbuild');
const path = require('path');
const shell = require('shelljs');
const {
  getAllInOutFilePaths,
  isUntransformedFile,
  getOutRootPath,
} = require('./lib/runtime-files-list');
const fs = require('fs').promises;

/** @param {string} outPath */
const renameBuiltFile = (outPath) => {
  return outPath.replace(/\.ts$/, '.js');
};

shell.mkdir('-p', getOutRootPath());

(async () => {
  const esbuildService = await esbuild.startService();

  // Generate the output file paths
  const {
    allGDJSInOutFilePaths,
    allExtensionsInOutFilePaths,
  } = await getAllInOutFilePaths();

  // Build (or copy) all the files
  let errored = false;
  const startTime = Date.now();
  await Promise.all(
    [...allGDJSInOutFilePaths, ...allExtensionsInOutFilePaths].map(
      async ({ inPath, outPath }) => {
        if (isUntransformedFile(inPath)) {
          try {
            await fs.mkdir(path.dirname(outPath), { recursive: true });
            await fs.copyFile(inPath, outPath);
          } catch (err) {
            shell.echo(`❌ Error while copying "${inPath}":` + err);
            errored = true;
          }
          return;
        }

        return esbuildService
          .build({
            sourcemap: true,
            entryPoints: [inPath],
            outfile: renameBuiltFile(outPath),
          })
          .catch(() => {
            // Error is already logged by esbuild.
            errored = true;
          });
      }
    )
  );

  esbuildService.stop();
  const buildDuration = Date.now() - startTime;
  if (!errored) shell.echo(`✅ GDJS built in ${buildDuration}ms`);
  if (errored) shell.exit(1);
})();
