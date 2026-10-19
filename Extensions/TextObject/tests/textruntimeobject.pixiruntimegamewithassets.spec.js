// @ts-check

describe('gdjs.TextRuntimeObject (using a PixiJS RuntimeGame)', function () {
  /**
   * @param {gdjs.RuntimeScene} runtimeScene
   */
  const loadScene = (runtimeScene) => {
    runtimeScene.loadFromScene({
      sceneData: {
        layers: [
          {
            name: '',
            visibility: true,
            effects: [],
            cameras: [],
            ambientLightColorR: 0,
            ambientLightColorG: 0,
            ambientLightColorB: 0,
            isLightingLayer: false,
            followBaseLayerCamera: true,
          },
        ],
        r: 0,
        v: 0,
        b: 0,
        mangledName: 'Scene1',
        name: 'Scene1',
        stopSoundsOnStartup: false,
        title: '',
        behaviorsSharedData: [],
        objects: [],
        objectsGroups: [],
        instances: [],
        variables: [],
        usedResources: [],
        uiSettings: {
          grid: false,
          gridType: 'rectangular',
          gridWidth: 10,
          gridHeight: 10,
          gridDepth: 10,
          gridOffsetX: 0,
          gridOffsetY: 0,
          gridOffsetZ: 0,
          gridColor: 0,
          gridAlpha: 1,
          snap: false,
        },
      },
      usedExtensionsWithVariablesData: [],
    });
  };

  /**
   * @param {string} text
   * @returns {gdjs.TextObjectData}
   */
  const makeTextObjectData = (text) => ({
    name: 'score',
    type: 'TextObject::Text',
    variables: [],
    behaviors: [],
    effects: [],
    content: {
      characterSize: 40,
      font: '',
      bold: false,
      italic: false,
      underlined: false,
      color: '255;255;255',
      text,
      textAlignment: 'left',
      verticalTextAlignment: 'top',
      lineHeight: 0,
      isOutlineEnabled: false,
      outlineThickness: 0,
      outlineColor: '0;0;0',
      isShadowEnabled: false,
      shadowColor: '0;0;0',
      shadowOpacity: 255,
      shadowDistance: 0,
      shadowAngle: 90,
      shadowBlurRadius: 0,
    },
  });

  const makeTextRuntimeObject = async () => {
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    loadScene(runtimeScene);

    const gameContainer = document.createElement('div');
    runtimeGame.getRenderer().createStandardCanvas(gameContainer);

    const object = new gdjs.TextRuntimeObject(
      runtimeScene,
      makeTextObjectData('9')
    );
    runtimeScene.addObject(object);
    object.setPosition(200, 200);
    object.setAngle(90);
    runtimeScene.renderAndStep(1000 / 60);

    return { runtimeScene, object };
  };

  it('keeps the same rotated origin when the text changes size', async () => {
    const { runtimeScene, object } = await makeTextRuntimeObject();
    const originalWidth = object.getWidth();
    const originalRotatedOrigin = object.getHitBoxes()[0].vertices[0].slice();

    object.setText('100000');
    runtimeScene.renderAndStep(1000 / 60);

    expect(object.getWidth()).to.be.greaterThan(originalWidth);
    const updatedRotatedOrigin = object.getHitBoxes()[0].vertices[0];
    expect(updatedRotatedOrigin[0]).to.be.within(
      originalRotatedOrigin[0] - 0.001,
      originalRotatedOrigin[0] + 0.001
    );
    expect(updatedRotatedOrigin[1]).to.be.within(
      originalRotatedOrigin[1] - 0.001,
      originalRotatedOrigin[1] + 0.001
    );

    runtimeScene.unloadScene();
  });
});
