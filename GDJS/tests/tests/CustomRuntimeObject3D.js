// @ts-check

describe('gdjs.CustomRuntimeObject3D', function () {
  /**
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
      // Custom objects don't use these dimensions.
      content: { width: 0, height: 0, depth: 0 },
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
   * @return {Promise<{runtimeScene: gdjs.RuntimeScene, customObject: gdjs.CustomRuntimeObject3D}>}
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
    const { customObject } = await makeCustomObject3D();

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

  it('can translate, scale and rotate with a custom center at (0 ; 0)', async () => {
    const { customObject } = await makeCustomObject3D();

    customObject.setRotationCenter3D(0, 0, 0);

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
    expect(customObject.getCenterX()).to.be(100 * 0.25);
    expect(customObject.getCenterY()).to.be(200 * 1.5);
    expect(customObject.getCenterZ()).to.be(300 * 0.5);
    expect(customObject.getCenterXInScene()).to.be(8);
    expect(customObject.getCenterYInScene()).to.be(16);
    expect(customObject.getCenterZInScene()).to.be(32);
    expect(customObject.getDrawableX()).to.be(8 - 100 * 0.25);
    expect(customObject.getDrawableY()).to.be(16 - 200 * 1.5);
    expect(customObject.getDrawableZ()).to.be(32 - 300 * 0.5);
  });

  describe('toParent / fromParent', function () {
    const tolerance = 1e-3;

    /** A custom object with every part of its transformation in play. */
    const makeTransformedCustomObject3D = async () => {
      const { customObject } = await makeCustomObject3D();
      customObject.setPosition(16, 8);
      customObject.setZ(24);
      customObject.setAngle(30);
      customObject.setRotationX(20);
      customObject.setRotationY(-40);
      customObject.setScaleX(2);
      customObject.setScaleY(3);
      customObject.setScaleZ(0.5);
      customObject.flipX(true);
      customObject.flipZ(true);
      customObject.setRotationCenter3D(7, 11, 5);
      return customObject;
    };

    const expectNear = (value, expected) =>
      expect(value).to.be.within(expected - tolerance, expected + tolerance);

    it('puts a point of the inside where the renderer draws it', async () => {
      const customObject = await makeTransformedCustomObject3D();

      // The renderer composes the transformation of its THREE group on its
      // own: the two must agree, or the conversions answer for an object the
      // game does not show.
      customObject.getRenderer().ensureUpToDate();
      const threeObject = customObject.get3DRendererObject();
      threeObject.updateMatrix();
      const drawn = new THREE.Vector3(10, 20, 30).applyMatrix4(
        threeObject.matrix
      );

      expectNear(customObject.toParentX(10, 20, 30), drawn.x);
      expectNear(customObject.toParentY(10, 20, 30), drawn.y);
      expectNear(customObject.toParentZ(10, 20, 30), drawn.z);
    });

    it('brings a point of the containing space back inside', async () => {
      const customObject = await makeTransformedCustomObject3D();
      const parentX = customObject.toParentX(10, 20, 30);
      const parentY = customObject.toParentY(10, 20, 30);
      const parentZ = customObject.toParentZ(10, 20, 30);

      expectNear(customObject.fromParentX(parentX, parentY, parentZ), 10);
      expectNear(customObject.fromParentY(parentX, parentY, parentZ), 20);
      expectNear(customObject.fromParentZ(parentX, parentY, parentZ), 30);
    });

    it('answers a collapsed axis with the closest point it can reach', async () => {
      const customObject = await makeTransformedCustomObject3D();
      customObject.setScaleY(0);

      const parentX = customObject.toParentX(10, 20, 30);
      const parentY = customObject.toParentY(10, 20, 30);
      const parentZ = customObject.toParentZ(10, 20, 30);

      expect(customObject.fromParentY(parentX, parentY, parentZ)).to.be(0);
      expectNear(customObject.fromParentX(parentX, parentY, parentZ), 10);
      expectNear(customObject.fromParentZ(parentX, parentY, parentZ), 30);
    });

    it('answers a point, never NaN, when every axis is collapsed', async () => {
      const customObject = await makeTransformedCustomObject3D();
      customObject.setScale(0);
      customObject.setScaleZ(0);

      expect(customObject.fromParentX(100, 200, 300)).to.be(0);
      expect(customObject.fromParentY(100, 200, 300)).to.be(0);
      expect(customObject.fromParentZ(100, 200, 300)).to.be(0);
    });

    it('follows a change made just before it, with nothing rendered in between', async () => {
      const customObject = await makeTransformedCustomObject3D();
      customObject.getRenderer().ensureUpToDate();
      const before = customObject.toParentZ(10, 20, 30);

      customObject.setZ(customObject.getZ() + 100);

      expectNear(customObject.toParentZ(10, 20, 30), before + 100);
    });
  });

  describe('turning around an axis of the scene', function () {
    it('turns from the rotations set before it, with nothing rendered in between', async () => {
      const { customObject } = await makeCustomObject3D();
      customObject.getRenderer().ensureUpToDate();

      customObject.setRotationX(45);
      customObject.turnAroundY(10);

      // The turn used to be composed with what the renderer last drew, which
      // was still the object at rest: the 45 degrees were lost.
      expect(customObject.getRotationX()).to.be.within(44.9, 45.1);
      expect(customObject.getRotationY()).to.be.within(9.9, 10.1);
    });

    it('turns around the axes of the scene, not its own', async () => {
      const { customObject } = await makeCustomObject3D();
      customObject.setAngle(90);

      customObject.turnAroundX(30);

      // Turned by 90 degrees on Z, a turn around the X of the scene is a turn
      // around the Y of the object - the same the renderer gave with
      // `Object3D.rotateOnWorldAxis`.
      expect(customObject.getRotationX()).to.be.within(-0.1, 0.1);
      expect(customObject.getRotationY()).to.be.within(-30.1, -29.9);
      expect(customObject.getAngle()).to.be.within(89.9, 90.1);
    });
  });
});
