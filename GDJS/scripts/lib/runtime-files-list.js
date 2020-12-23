const path = require('path');
const recursive = require('recursive-readdir');
const fs = require('fs').promises;

const gdevelopRootPath = path.join(__dirname, '..', '..', '..');
const gdjsRootPath = path.join(__dirname, '..', '..');

const extensionsRuntimePath = path.join(gdevelopRootPath, 'Extensions');
const gdjsRuntimePath = path.join(gdjsRootPath, 'Runtime');
const bundledOutPath = path.join(gdjsRootPath, 'Runtime-bundled');

// The extensions to be included in the bundled Runtime (will be built with esbuild or copied).
const allowedExtensions = ['.js', '.ts', '.html', '.json', '.xml'];

// These extensions will be built with esbuild (the other will be copied).
const transformIncludedExtensions = ['.js', '.ts'];

// Among the files matching the previous extensions, these extensions won't be built with esbuild
// (they will be copied).
const transformExcludedExtensions = ['.d.ts'];

// Files under these paths (relative to the GDevelop root path) won't
// be built with esbuild, but simply copied.
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

/** @typedef {{inPath: string; outPath: string;}} InOutPath */

/** Returns a function to generate the file paths in the bundled runtime. */
const getInOutPaths = (basePath) => (inPath) => {
  const relativePath = path.relative(basePath, inPath);
  return {
    inPath,
    outPath: path.join(bundledOutPath, relativePath),
  };
};

module.exports = {
  /**
   * Returns the path where the bundled Runtime will be generated.
   */
  getOutRootPath: () => bundledOutPath,
  /**
   * Check if a file must be copied without being built with esbuild.
   * @param {string} path
   */
  isUntransformedFile: (path) => {
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
  },
  /**
   * Get the list of all files part of the runtime, and their destination file when the runtime is bundled.
   * @returns {Promise<{allGDJSInOutFilePaths: InOutPath[]; allExtensionsInOutFilePaths: InOutPath[];}>}
   */
  getAllInOutFilePaths: async () => {
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

    return { allGDJSInOutFilePaths, allExtensionsInOutFilePaths };
  },
};
