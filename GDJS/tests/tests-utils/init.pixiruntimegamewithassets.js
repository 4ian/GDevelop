/**
 * Create and return a game with a few assets loaded, to be used in tests
 * needing real images.
 */
gdjs.getPixiRuntimeGameWithAssets = () => {
  if (gdjs.getPixiRuntimeGameWithAssets.pixiRuntimeGameWithAssets) {
    return Promise.resolve(gdjs.getPixiRuntimeGameWithAssets.pixiRuntimeGameWithAssets);
  }

  var runtimeGame = new gdjs.RuntimeGame({
    variables: [],
    properties: { windowWidth: 800, windowHeight: 600 },
    resources: {
      resources: [
        {
          kind: 'image',
          name: 'base/tests-utils/assets/64x64.jpg',
          metadata: '',
          file: 'base/tests-utils/assets/64x64.jpg',
        },
      ],
    },
  });

  return new Promise(resolve => {
    runtimeGame.loadAllAssets(
      () => {
        console.info('Done loading assets for test game');

        gdjs.getPixiRuntimeGameWithAssets.pixiRuntimeGameWithAssets = runtimeGame;
        resolve(gdjs.getPixiRuntimeGameWithAssets.pixiRuntimeGameWithAssets);
      },
      () => {/* Ignore progress */}
    );
  });
};

/** @type gdjs.RuntimeGame */
gdjs.getPixiRuntimeGameWithAssets.pixiRuntimeGameWithAssets = null;
