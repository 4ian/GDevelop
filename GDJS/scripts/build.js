const { build } = require('esbuild');
const path = require('path');
const shell = require('shelljs');
const {
  getAllInOutFilePaths,
  isUntransformedFile,
  gdjsEntryPoints,
} = require('./lib/runtime-files-list');
const args = require('minimist')(process.argv.slice(2), {
  string: ['out'],
});
const fs = require('fs').promises;

/** @param {string} outPath */
const renameBuiltFile = (outPath) => {
  return outPath.replace(/\.ts$/, '.js');
};

const bundledOutPath =
  args.out || path.join(__dirname, '../../newIDE/app/resources/GDJS/Runtime');
if (!args.out) {
  shell.echo(
    `ℹ️  --out (path where to build GDJS Runtime and Extensions) not specified. Using "../../newIDE/app/resources/GDJS/Runtime" by default (used by electron-app and GDJS tests).`
  );
}

shell.mkdir('-p', bundledOutPath);

(async () => {
  const allExtensionsInOutFilePaths = await getAllInOutFilePaths({
    bundledOutPath,
  });

  // Build (or copy) all the files
  let errored = false;
  const startTime = Date.now();
  await Promise.all([
    ...allExtensionsInOutFilePaths.map(async ({ inPath, outPath }) => {
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

      return build({
        sourcemap: true,
        minify: true,
        entryPoints: [inPath],
        outfile: renameBuiltFile(outPath),
      }).catch(() => {
        // Error is already logged by esbuild.
        errored = true;
      });
    }),

    build({
      entryPoints: gdjsEntryPoints,
      entryNames: '[name]',
      bundle: true,
      sourcemap: true,
      minify: true,
      legalComments: 'external',
      treeShaking: true,
      external: ['electron'],
      outdir: bundledOutPath,
    }).catch(() => {
      // Error is already logged by esbuild.
      errored = true;
    }),
  ]);

  const buildDuration = Date.now() - startTime;
  if (!errored) shell.echo(`✅ GDJS built in ${buildDuration}ms`);
  if (errored) shell.exit(1);
})();
