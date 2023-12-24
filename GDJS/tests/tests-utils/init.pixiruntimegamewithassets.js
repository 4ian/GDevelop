// @ts-check

/**
 * Create and return a game with a few assets loaded, to be used in tests
 * needing real images.
 * @internal
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
      pixelsRounding: false,
      sizeOnStartupMode: 'adaptWidth',
      antialiasingMode: 'MSAA',
      antialisingEnabledOnMobile: false,
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
        backgroundImageResourceName: '',
        backgroundColor: 0,
        backgroundFadeInDuration: 0.2,
        minDuration: 0,
        logoAndProgressFadeInDuration: 0.2,
        logoAndProgressLogoFadeInDelay: 0.2,
        showProgressBar: true,
        progressBarMinWidth: 40,
        progressBarMaxWidth: 300,
        progressBarWidthPercent: 40,
        progressBarHeight: 20,
        progressBarColor: 0xffffff,
      },
      authorIds: [],
      authorUsernames: [],
      watermark: { showWatermark: true, placement: 'bottom' },
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
    layouts: [
      {
        r: 0,
        v: 0,
        b: 0,
        mangledName: '',
        name: '',
        objects: [],
        layers: [],
        instances: [],
        behaviorsSharedData: [],
        stopSoundsOnStartup: false,
        title: '',
        variables: [],
        usedResources: [],
      },
    ],
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
    usedResources: [{ name: 'base/tests-utils/assets/64x64.jpg' }],
    // Used in CustomRuntimeObjects.js
    eventsFunctionsExtensions: [
      {
        name: 'MyExtension',
        eventsBasedObjects: [
          {
            name: 'MyEventsBasedObject',
            objects: [
              {
                name: 'MySprite',
                type: 'Sprite',
                updateIfNotVisible: false,
                variables: [],
                behaviors: [],
                animations: [],
                effects: [],
              },
            ],
          },
        ],
      },
    ],
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

/**
 * @type {?Promise<gdjs.RuntimeGame>}
 * @internal
 */
gdjs.getPixiRuntimeGameWithAssets._pixiRuntimeGameWithAssetsPromise = null;
