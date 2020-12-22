const esbuild = require('esbuild');
const path = require('path');
const recursive = require('recursive-readdir');
const shell = require('shelljs');
const fs = require('fs').promises;

const gdevelopRootPath = path.join(__dirname, '..', '..');
const gdjsRootPath = path.join(__dirname, '..');

const extensionsRuntimePath = path.join(gdevelopRootPath, 'Extensions');
const gdjsRuntimePath = path.join(gdjsRootPath, 'Runtime');
const bundledOutPath = path.join(gdjsRootPath, 'Runtime-bundled');

// Files under these paths (relative to the GDevelop root path) won't
// be built. They will simply be copied.
const untransformedPaths = [
  // GDJS prebuilt files:
  'GDJS/Runtime/pixi-renderers/pixi.js',
  'GDJS/Runtime/Cocos2d',
  'GDJS/Runtime/Cordova',
  'GDJS/Runtime/Electron',
  'GDJS/Runtime/FacebookInstantGames',
  'GDJS/Runtime/libs/CocoonJS',

  // Extensions pre-built files:
  'Extensions/Firebase/B_firebasejs',
  'Extensions/BBText/pixi-multistyle-text/dist',
  'Extensions/DialogueTree/bondage.js/dist',
  'Extensions/Effects/pixi-filters',
  'Extensions/P2P/A_peer.js',
  'Extensions/ParticleSystem/pixi-particles-pixi-renderer.min.js',
  'Extensions/Physics2Behavior/box2d.js',
  'Extensions/PhysicsBehavior/box2djs',
  'Extensions/Shopify/shopify-buy.umd.polyfilled.min.js',
  'Extensions/TweenBehavior/shifty.js',
].map((untransformedPath) => path.resolve(gdevelopRootPath, untransformedPath));

// Only these files will be copied/built.
const transformIncludedExtensions = ['.js', '.ts'];
const transformExcludedExtensions = ['.d.ts'];

/**
 * Check if a file must be copied without being built with esbuild.
 * @param {string} path
 */
const isUntransformedFile = (path) => {
  const isSupportedExtension =
    transformIncludedExtensions.some((includedExtension) =>
      path.endsWith(includedExtension)
    ) &&
    !transformExcludedExtensions.some((excludedExtension) =>
      path.endsWith(excludedExtension)
    );

  return (
    !isSupportedExtension ||
    untransformedPaths.some((untransformedPath) =>
      path.startsWith(untransformedPath)
    )
  );
};

// Only these files will be copied/built.
const allowedExtensions = ['.js', '.ts', '.html', '.json', '.xml'];

/**
 * Check if a file is not a source file (should not be included in the built Runtime).
 * @param {string} fileOrDirectoryPath
 * @param {fs.Stats} stats
 */
const isNotAllowedExtension = (fileOrDirectoryPath, stats) => {
  return (
    !stats.isDirectory() &&
    !allowedExtensions.includes(path.extname(fileOrDirectoryPath))
  );
};

/**
 * Check if a folder is a test folder (should not be included in the built Runtime).
 * @param {string} fileOrDirectoryPath
 * @param {fs.Stats} stats
 */
const isTestDirectory = (fileOrDirectoryPath, stats) => {
  if (!stats.isDirectory()) return false;

  const directoryName = path.basename(fileOrDirectoryPath);
  return (
    directoryName === 'test' ||
    directoryName === 'tests' ||
    directoryName === '__tests__'
  );
};

/**
 * Check if a file is declaration of an extension (should not be included in the built Runtime).
 * @param {string} fileOrDirectoryPath
 * @param {fs.Stats} stats
 */
const isJsExtensionDeclaration = (fileOrDirectoryPath, stats) => {
  return (
    !stats.isDirectory() &&
    path.basename(fileOrDirectoryPath) === 'JsExtension.js'
  );
};

/** Returns a function to generate the file paths in the bundled runtime. */
const getInOutPaths = (basePath) => (inPath) => {
  const relativePath = path.relative(basePath, inPath);
  return {
    inPath,
    outPath: path.join(bundledOutPath, relativePath),
  };
};

/** @param {string} outPath */
const renameBuiltFile = (outPath) => {
  return outPath.replace(/\.ts$/, '.js');
};

shell.mkdir('-p', bundledOutPath);

(async () => {
  const esbuildService = await esbuild.startService();

  // List all the files of the runtime
  const allGDJSInFilePaths = await recursive(gdjsRuntimePath, [
    isNotAllowedExtension,
  ]);
  const allExtensionsInFilePaths = await recursive(extensionsRuntimePath, [
    isNotAllowedExtension,
    isTestDirectory,
    isJsExtensionDeclaration,
  ]);

  // Generate the output file paths
  const allGDJSInOutFilePaths = allGDJSInFilePaths.map(
    getInOutPaths(gdjsRuntimePath)
  );
  const allExtensionsInOutFilePaths = allExtensionsInFilePaths.map(
    getInOutPaths(gdevelopRootPath)
  );

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
