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
          file: 'base/GDJS/tests/tests-utils/assets/64x64.jpg',
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
                variables: [],
                behaviors: [],
                effects: [],
                // @ts-ignore This is the object configuration.
                updateIfNotVisible: false,
                // @ts-ignore This is the object configuration.
                animations: [],
              },
            ],
            instances: [],
            layers: [],
            areaMinX: 0,
            areaMinY: 0,
            areaMinZ: 0,
            areaMaxX: 0,
            areaMaxY: 0,
            areaMaxZ: 0,
            _initialInnerArea: null,
          },
          {
            name: 'MyLayoutedEventsBasedObject',
            isInnerAreaFollowingParentSize: true,
            objects: [
              {
                name: 'MySprite',
                type: 'Sprite',
                variables: [],
                behaviors: [
                  {
                    name: 'AnchorBehavior',
                    type: 'AnchorBehavior::AnchorBehavior',
                    bottomEdgeAnchor: 2,
                    leftEdgeAnchor: 1,
                    relativeToOriginalWindowSize: true,
                    rightEdgeAnchor: 2,
                    topEdgeAnchor: 1,
                    useLegacyBottomAndRightAnchors: false,
                  },
                ],
                effects: [],
                // @ts-ignore This is the object configuration.
                updateIfNotVisible: false,
                // @ts-ignore This is the object configuration.
                animations: [
                  {
                    name: 'animation',
                    directions: [
                      {
                        sprites: [
                          {
                            image: 'base/tests-utils/assets/64x64.jpg',
                            originPoint: { name: 'Origin', x: 0, y: 0 },
                            centerPoint: {
                              name: 'Center',
                              x: 32,
                              y: 32,
                              automatic: true,
                            },
                            points: [
                              { name: 'Center', x: 32, y: 32 },
                              { name: 'Origin', x: 0, y: 0 },
                            ],
                            hasCustomCollisionMask: true,
                            customCollisionMask: [
                              [
                                { x: 64, y: 64 },
                                { x: 0, y: 64 },
                                { x: 64, y: 0 },
                              ],
                            ],
                          },
                        ],
                        timeBetweenFrames: 0,
                        looping: false,
                      },
                    ],
                    useMultipleDirections: false,
                  },
                ],
              },
            ],
            instances: [
              {
                angle: 0,
                customSize: true,
                height: 64,
                layer: '',
                name: 'MySprite',
                persistentUuid: '668db48d-4e12-4b6f-aa6b-f73b74bf608e',
                width: 64,
                x: 0,
                y: 0,
                zOrder: 1,
                numberProperties: [],
                stringProperties: [],
                initialVariables: [],
                locked: false,
              },
            ],
            layers: [],
            areaMinX: 0,
            areaMinY: 0,
            areaMinZ: 0,
            areaMaxX: 64,
            areaMaxY: 64,
            areaMaxZ: 0,
            _initialInnerArea: null,
          },
        ],
        sceneVariables: [],
        globalVariables: [],
      },
    ],
  });

  gdjs.getPixiRuntimeGameWithAssets._pixiRuntimeGameWithAssetsPromise =
    new Promise((resolve) => {
      runtimeGame.loadAllAssets(
        () => {
          console.info('Done loading assets for test game');

          resolve(runtimeGame);
        },
        () => {
          /* Ignore progress */
        }
      );
    });
  return gdjs.getPixiRuntimeGameWithAssets._pixiRuntimeGameWithAssetsPromise;
};

/**
 * @type {?Promise<gdjs.RuntimeGame>}
 * @internal
 */
gdjs.getPixiRuntimeGameWithAssets._pixiRuntimeGameWithAssetsPromise = null;
