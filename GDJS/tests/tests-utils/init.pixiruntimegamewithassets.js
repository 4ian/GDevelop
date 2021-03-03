// @ts-check

/**
 * Create and return a game with a few assets loaded, to be used in tests
 * needing real images.
 * @returns {Promise<gdjs.RuntimeGame>} A promise resolving with the game with loaded assets.
 */
gdjs.getPixiRuntimeGameWithAssets = () => {
  if (gdjs.getPixiRuntimeGameWithAssets._pixiRuntimeGameWithAssetsPromise) {
    return gdjs.getPixiRuntimeGameWithAssets._pixiRuntimeGameWithAssetsPromise;
  }

  var runtimeGame = new gdjs.RuntimeGame({
    variables: [],
    properties: {
      adaptGameResolutionAtRuntime: true,
      folderProject: false,
      orientation: 'landscape',
      packageName: 'com.gdevelop.integrationtest',
      projectFile: '',
      scaleMode: 'linear',
      sizeOnStartupMode: 'adaptWidth',
      useExternalSourceFiles: true,
      version: '1.0.0',
      name: 'Test game with real assets',
      author: '',
      windowWidth: 800,
      windowHeight: 600,
      latestCompilationDirectory: '',
      maxFPS: 60,
      minFPS: 20,
      verticalSync: true,
      loadingScreen: {
        showGDevelopSplash: true,
      },
      currentPlatform: '',
      extensionProperties: [],
    },
    firstLayout: '',
    gdVersion: {
      major: 5,
      minor: 0,
      build: 0,
      revision: 0,
    },
    objects: [],
    layouts: [],
    externalLayouts: [],
    resources: {
      resources: [
        {
          kind: 'image',
          name: 'base/tests-utils/assets/64x64.jpg',
          metadata: '',
          file: 'base/tests-utils/assets/64x64.jpg',
          userAdded: true,
        },
      ],
    },
  });

  gdjs.getPixiRuntimeGameWithAssets._pixiRuntimeGameWithAssetsPromise = new Promise(
    (resolve) => {
      runtimeGame.loadAllAssets(
        () => {
          console.info('Done loading assets for test game');

          resolve(runtimeGame);
        },
        () => {
          /* Ignore progress */
        }
      );
    }
  );
  return gdjs.getPixiRuntimeGameWithAssets._pixiRuntimeGameWithAssetsPromise;
};

/** @type {?Promise<gdjs.RuntimeGame>} */
gdjs.getPixiRuntimeGameWithAssets._pixiRuntimeGameWithAssetsPromise = null;
