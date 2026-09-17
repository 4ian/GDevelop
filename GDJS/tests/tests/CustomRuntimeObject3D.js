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

  describe('transformation cost', function () {
    const tolerance = 1e-3;

    const expectNear = (actual, expected) =>
      expect(actual).to.be.within(expected - tolerance, expected + tolerance);

    /** How many times `run` used the given methods. */
    const countCalls = (spied, run) => {
      const spies = spied.map(([holder, name]) => sinon.spy(holder, name));
      try {
        run();
        return spies.map((spy) => spy.callCount);
      } finally {
        spies.forEach((spy) => spy.restore());
      }
    };

    it('converts back from the parent without any new trigonometry', async () => {
      const customObject = await makeTransformedCustomObject3D();
      const x = customObject.toParentX(10, 20, 30);
      const y = customObject.toParentY(10, 20, 30);
      const z = customObject.toParentZ(10, 20, 30);
      // Warm both ways, like a frame that was already rendered.
      customObject.fromParentX(x, y, z);

      // The transformation of an object that did not change is never built
      // again, however many points are converted with it.
      const counts = countCalls(
        [
          [Math, 'cos'],
          [Math, 'sin'],
        ],
        () => {
          for (let i = 0; i < 100; i++) {
            customObject.fromParentX(x, y, z);
            customObject.fromParentY(x, y, z);
            customObject.fromParentZ(x, y, z);
          }
        }
      );

      expect(counts).to.eql([0, 0]);
      expectNear(customObject.fromParentX(x, y, z), 10);
      expectNear(customObject.fromParentY(x, y, z), 20);
      expectNear(customObject.fromParentZ(x, y, z), 30);
    });

    /**
     * Every mutator must leave the conversion back from the parent to
     * recompute too: a point converted to the parent and back must land where
     * it started, with the values the object has now.
     */
    const expectRoundTripAfter = async (changeCustomObject) => {
      const customObject = await makeTransformedCustomObject3D();
      // Warm both ways, like a frame that was already rendered.
      customObject.fromParentX(
        customObject.toParentX(10, 20, 30),
        customObject.toParentY(10, 20, 30),
        customObject.toParentZ(10, 20, 30)
      );

      changeCustomObject(customObject);

      const x = customObject.toParentX(10, 20, 30);
      const y = customObject.toParentY(10, 20, 30);
      const z = customObject.toParentZ(10, 20, 30);
      expectNear(customObject.fromParentX(x, y, z), 10);
      expectNear(customObject.fromParentY(x, y, z), 20);
      expectNear(customObject.fromParentZ(x, y, z), 30);
    };

    it('converts back from the parent with what the object is now', async () => {
      await expectRoundTripAfter((customObject) => customObject.setX(23));
      await expectRoundTripAfter((customObject) => customObject.setZ(12));
      await expectRoundTripAfter((customObject) => customObject.setAngle(90));
      await expectRoundTripAfter((customObject) =>
        customObject.setRotationX(45)
      );
      await expectRoundTripAfter((customObject) =>
        customObject.setRotationY(-60)
      );
      await expectRoundTripAfter((customObject) =>
        customObject.turnAroundZ(23)
      );
      await expectRoundTripAfter((customObject) => customObject.setScaleX(0.5));
      await expectRoundTripAfter((customObject) => customObject.setScaleZ(2));
      await expectRoundTripAfter((customObject) => customObject.setScale(1.5));
      await expectRoundTripAfter((customObject) => customObject.flipY(true));
      await expectRoundTripAfter((customObject) => customObject.flipZ(false));
      await expectRoundTripAfter((customObject) =>
        customObject.setRotationCenter3D(17, -9, 4)
      );
      await expectRoundTripAfter((customObject) =>
        customObject.setDepth(customObject.getDepth() * 2)
      );
    });

    it('is not built again when a child of an object with an area of its own moves', async () => {
      const customObject = await makeTransformedCustomObject3D();
      const child = customObject
        .getChildrenContainer()
        .getInstancesOf('MySprite')[0];
      const beforeX = customObject.toParentX(10, 20, 30);
      const beforeZ = customObject.toParentZ(10, 20, 30);
      const beforeBounds = JSON.stringify(customObject.getAABB());
      customObject.getRenderer().ensureUpToDate();

      const counts = countCalls(
        [[customObject, '_updateLocalTransformation3D']],
        () => {
          child.setPosition(-200, 140);
          customObject.toParentX(10, 20, 30);
          customObject.getHitBoxes();
        }
      );

      // The object has an area of its own: its center of rotation stays where
      // it is, so what it contains moved and it did not.
      expect(counts).to.eql([0]);
      expect(customObject.toParentX(10, 20, 30)).to.be(beforeX);
      expect(customObject.toParentZ(10, 20, 30)).to.be(beforeZ);
      // Its hit boxes - and the ones of whatever contains it - still follow
      // its children.
      expect(JSON.stringify(customObject.getAABB())).not.to.be(beforeBounds);
    });
  });
});
