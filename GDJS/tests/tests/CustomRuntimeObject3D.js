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

  describe('toParentDirection / fromParentDirection', function () {
    const tolerance = 1e-9;
    /** @type {Array<[number, number, number]>} */
    const directions = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [3, -2, 5],
      [-0.2, 0.7, -0.4],
    ];

    /**
     * @param {gdjs.CustomRuntimeObject3D} customObject
     * @param {[number, number, number]} direction
     */
    const getDirectionBetweenConvertedPoints = (customObject, [x, y, z]) =>
      new THREE.Vector3(
        customObject.toParentX(10 + x, 20 + y, 30 + z) -
          customObject.toParentX(10, 20, 30),
        customObject.toParentY(10 + x, 20 + y, 30 + z) -
          customObject.toParentY(10, 20, 30),
        customObject.toParentZ(10 + x, 20 + y, 30 + z) -
          customObject.toParentZ(10, 20, 30)
      ).normalize();

    /**
     * @param {THREE.Vector3} actual
     * @param {THREE.Vector3} expected
     */
    const expectSameVector = (actual, expected) => {
      expect(actual.distanceTo(expected)).to.be.below(tolerance);
    };

    it('gives the direction between two points converted inside, as a unit vector', async () => {
      const customObject = await makeTransformedCustomObject3D();
      for (const direction of directions) {
        expectSameVector(
          new THREE.Vector3(
            customObject.toParentDirectionX(...direction),
            customObject.toParentDirectionY(...direction),
            customObject.toParentDirectionZ(...direction)
          ),
          getDirectionBetweenConvertedPoints(customObject, direction)
        );
      }
    });

    it('brings a direction back inside', async () => {
      const customObject = await makeTransformedCustomObject3D();
      for (const direction of directions) {
        const parentX = customObject.toParentDirectionX(...direction);
        const parentY = customObject.toParentDirectionY(...direction);
        const parentZ = customObject.toParentDirectionZ(...direction);
        expectSameVector(
          new THREE.Vector3(
            customObject.fromParentDirectionX(parentX, parentY, parentZ),
            customObject.fromParentDirectionY(parentX, parentY, parentZ),
            customObject.fromParentDirectionZ(parentX, parentY, parentZ)
          ),
          new THREE.Vector3(...direction).normalize()
        );
      }
    });

    it('follows a change made just before it, with nothing rendered in between', async () => {
      const customObject = await makeTransformedCustomObject3D();
      const before = customObject.toParentDirectionZ(1, 0, 0);

      customObject.setRotationY(customObject.getRotationY() + 30);

      expect(customObject.toParentDirectionZ(1, 0, 0)).not.to.be(before);
      expectSameVector(
        new THREE.Vector3(
          customObject.toParentDirectionX(1, 0, 0),
          customObject.toParentDirectionY(1, 0, 0),
          customObject.toParentDirectionZ(1, 0, 0)
        ),
        getDirectionBetweenConvertedPoints(customObject, [1, 0, 0])
      );
    });

    it('answers no direction, never NaN, along a collapsed axis', async () => {
      const customObject = await makeTransformedCustomObject3D();
      customObject.setScaleX(0);

      // Everything along X is flattened: nothing is left of the direction.
      expect(customObject.toParentDirectionX(1, 0, 0)).to.be(0);
      expect(customObject.toParentDirectionY(1, 0, 0)).to.be(0);
      expect(customObject.toParentDirectionZ(1, 0, 0)).to.be(0);
      // The way back gives 0 on the collapsed axis, like for a point.
      expect(customObject.fromParentDirectionX(1, 2, 3)).to.be(0);
      expect(Number.isFinite(customObject.fromParentDirectionY(1, 2, 3))).to.be(
        true
      );
    });
  });

  describe('distances in 3D', function () {
    /**
     * @param {gdjs.RuntimeScene} runtimeScene
     * @param {string} name
     * @param {[number, number, number]} position
     */
    const createPlacedCustomObject = (runtimeScene, name, [x, y, z]) => {
      const customObject = new gdjs.CustomRuntimeObject3D(runtimeScene, {
        name,
        type: 'MyExtension::MyEventsBasedObject',
        variant: '',
        isInnerAreaFollowingParentSize: false,
        variables: [],
        behaviors: [],
        effects: [],
        content: { width: 0, height: 0, depth: 0 },
      });
      runtimeScene.addObject(customObject);
      customObject.setPosition(x, y);
      customObject.setZ(z);
      return customObject;
    };

    it('computes the distance between two 3D positions', () => {
      expect(
        gdjs.evtTools.common.distanceBetween3DPositions(1, 2, 3, 3, 5, 9)
      ).to.be(7);
    });

    it('compares the distance between the centers of objects in 3D', async () => {
      const { runtimeScene } = await makeCustomObject3D();
      const tank = createPlacedCustomObject(runtimeScene, 'Tank', [0, 0, 0]);
      const plane = createPlacedCustomObject(
        runtimeScene,
        'Plane',
        [0, 0, 200]
      );
      const truck = createPlacedCustomObject(
        runtimeScene,
        'Truck',
        [60, 80, 0]
      );
      const centerToCenter = Math.hypot(
        truck.getCenterXInScene() - tank.getCenterXInScene(),
        truck.getCenterYInScene() - tank.getCenterYInScene()
      );

      /** @param {Array<gdjs.RuntimeObject>} vehicles */
      const makeLists = (vehicles) => [
        Hashtable.newFrom({ Tank: [tank] }),
        Hashtable.newFrom({ Vehicle: vehicles }),
      ];
      // Above the tank: right next to it in 2D, 200 pixels away in 3D.
      let [tanks, vehicles] = makeLists([plane, truck]);
      expect(
        gdjs.evtTools.object.distanceTest(tanks, vehicles, 150, false)
      ).to.be(true);
      expect(vehicles.get('Vehicle')).to.eql([plane, truck]);

      [tanks, vehicles] = makeLists([plane, truck]);
      expect(
        gdjs.evtTools.object.distance3DTest(tanks, vehicles, 150, false)
      ).to.be(true);
      expect(vehicles.get('Vehicle')).to.eql([truck]);

      // Inverted: the tank is picked when it is farther than the distance
      // from every vehicle, which only the 3D distance says for the plane.
      [tanks, vehicles] = makeLists([plane]);
      expect(
        gdjs.evtTools.object.distance3DTest(tanks, vehicles, 150, true)
      ).to.be(true);
      expect(tanks.get('Tank')).to.eql([tank]);
      [tanks, vehicles] = makeLists([plane]);
      expect(
        gdjs.evtTools.object.distanceTest(tanks, vehicles, 150, true)
      ).to.be(false);

      [tanks, vehicles] = makeLists([plane, truck]);
      expect(
        gdjs.evtTools.object.distance3DTest(
          tanks,
          vehicles,
          centerToCenter - 1,
          false
        )
      ).to.be(false);
    });

    it('counts a 2D object at a Z of 0', async () => {
      const { runtimeScene } = await makeCustomObject3D();
      const plane = createPlacedCustomObject(
        runtimeScene,
        'Plane',
        [0, 0, 200]
      );
      const flatObject = new gdjs.CustomRuntimeObject2D(runtimeScene, {
        name: 'Flat',
        type: 'MyExtension::MyEventsBasedObject',
        variant: '',
        isInnerAreaFollowingParentSize: false,
        variables: [],
        behaviors: [],
        effects: [],
        content: {},
      });
      runtimeScene.addObject(flatObject);
      // Right below the center of the plane.
      flatObject.setPosition(
        flatObject.getX() +
          plane.getCenterXInScene() -
          flatObject.getCenterXInScene(),
        flatObject.getY() +
          plane.getCenterYInScene() -
          flatObject.getCenterYInScene()
      );
      const deltaZ = plane.getCenterZInScene();

      const isWithin = (distance) =>
        gdjs.evtTools.object.distance3DTest(
          Hashtable.newFrom({ Plane: [plane] }),
          Hashtable.newFrom({ Flat: [flatObject] }),
          distance,
          false
        );
      expect(isWithin(deltaZ + 1)).to.be(true);
      expect(isWithin(deltaZ - 1)).to.be(false);
    });

    it('gives the distance between the center of an object and a 3D position', async () => {
      const { runtimeScene } = await makeCustomObject3D();
      const tank = createPlacedCustomObject(runtimeScene, 'Tank', [10, 20, 30]);
      const object3D = new gdjs.Base3DBehavior(
        runtimeScene,
        { name: 'Object3D', type: 'Scene3D::Base3DBehavior' },
        tank
      );

      expect(
        object3D.getDistanceTo3DPosition(
          tank.getCenterXInScene() + 2,
          tank.getCenterYInScene() + 3,
          tank.getCenterZInScene() + 6
        )
      ).to.be(7);
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
