// @ts-check

/**
 * Basic tests for gdjs.SpriteRuntimeObject
 */
describe('gdjs.CustomRuntimeObject3D', function () {
  /**
   * Create a CustomRuntimeObject with a SpriteRuntimeObject using a 64x64
   * image with a custom collision mask.
   * @param {gdjs.RuntimeInstanceContainer} instanceContainer
   */
  const createCustomObject = (instanceContainer) => {
    // The corresponding event-based object declaration is done by
    // getPixiRuntimeGameWithAssets.
    const customObject = new gdjs.CustomRuntimeObject3D(instanceContainer, {
      name: 'MyCustomObject',
      type: 'MyExtension::MyEventsBasedObject',
      variant: '',
      isInnerAreaFollowingParentSize: false,
      variables: [],
      behaviors: [],
      effects: [],
      content: {},
    });
    instanceContainer.addObject(customObject);
    return customObject;
  };

  const createSceneWithLayer = (runtimeGame) => {
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.addLayer({
      name: '',
      visibility: true,
      cameras: [],
      effects: [],
      ambientLightColorR: 0,
      ambientLightColorG: 0,
      ambientLightColorB: 0,
      isLightingLayer: false,
      followBaseLayerCamera: false,
    });
    return runtimeScene;
  };

  /**
   * @param {gdjs.RuntimeInstanceContainer} parent
   */
  const createSpriteObject = (parent) => {
    const sprite = parent.createObject('MySprite');
    if (!sprite) {
      throw new Error("Object couldn't be created");
    }
    return sprite;
  };

  /**
   * @return {Promise<{runtimeScene: gdjs.RuntimeScene, customObject: gdjs.CustomRuntimeObject3D, leftSprite: gdjs.RuntimeObject, rightSprite: gdjs.RuntimeObject}>}
   */
  const makeCustomObject3D = async () => {
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
    const runtimeScene = createSceneWithLayer(runtimeGame);
    const customObject = createCustomObject(runtimeScene);
    return {
      runtimeScene,
      customObject,
    };
  };

  it('can translate, scale and rotate', async () => {
    const { runtimeScene, customObject } =
      await makeCustomObject3D();

    customObject.setPosition(8, 16);
    customObject.setZ(32);
    // Rotation has no impact on the points.
    customObject.setAngle(90);
    const width = (100 + 400) * 0.25;
    const height = (200 + 500) * 1.5;
    const depth = (300 + 600) * 0.5;
    customObject.setWidth(width);
    customObject.setHeight(height);
    customObject.setDepth(depth);

    expect(customObject.getWidth()).to.be(width);
    expect(customObject.getHeight()).to.be(height);
    expect(customObject.getDepth()).to.be(depth);
    expect(customObject.getScaleX()).to.be(0.25);
    expect(customObject.getScaleY()).to.be(1.5);
    expect(customObject.getScaleZ()).to.be(0.5);
    expect(customObject.getCenterX()).to.be(width / 2);
    expect(customObject.getCenterY()).to.be(height / 2);
    expect(customObject.getCenterZ()).to.be(depth / 2);
    expect(customObject.getCenterXInScene()).to.be(8 + width / 2 - 100 * 0.25);
    expect(customObject.getCenterYInScene()).to.be(16 + height / 2 - 200 * 1.5);
    expect(customObject.getCenterZInScene()).to.be(32 + depth / 2 - 300 * 0.5);
    expect(customObject.getDrawableX()).to.be(8 - 100 * 0.25);
    expect(customObject.getDrawableY()).to.be(16 - 200 * 1.5);
    expect(customObject.getDrawableZ()).to.be(32 - 300 * 0.5);
  });

});
