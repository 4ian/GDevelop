// @ts-check

describe('gdjs.CustomRuntimeObject', function () {
  /**
   * Create a CustomRuntimeObject with a SpriteRuntimeObject using a 64x64
   * image with a custom collision mask.
   * @param {gdjs.RuntimeInstanceContainer} instanceContainer
   */
  const createCustomObject = (instanceContainer) => {
    // The corresponding event-based object declaration is done by
    // getPixiRuntimeGameWithAssets.
    const customObject = new gdjs.CustomRuntimeObject2D(instanceContainer, {
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

  describe('with 2 sprites', function () {
    const instancesSideBySide = [
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
        behaviorOverridings: [],
      },
      {
        angle: 0,
        customSize: true,
        height: 64,
        layer: '',
        name: 'MySprite',
        persistentUuid: '668db48d-4e12-4b6f-aa6b-f73b74bf608e',
        width: 64,
        x: 64,
        y: 0,
        zOrder: 1,
        numberProperties: [],
        stringProperties: [],
        initialVariables: [],
        behaviorOverridings: [],
      },
    ];

    /**
     * @return {Promise<{runtimeScene: gdjs.RuntimeScene, customObject: gdjs.CustomRuntimeObject2D, leftSprite: gdjs.RuntimeObject, rightSprite: gdjs.RuntimeObject}>}
     */
    const makeCustomObjectWith2Children = async () => {
      const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets({
        customObjectInstances: instancesSideBySide,
      });
      const runtimeScene = createSceneWithLayer(runtimeGame);
      const customObject = createCustomObject(runtimeScene);
      const childrenContainer = customObject.getChildrenContainer();
      const childrenInstances = childrenContainer.getInstancesOf('MySprite');
      return {
        runtimeScene,
        customObject,
        leftSprite: childrenInstances[0],
        rightSprite: childrenInstances[1],
      };
    };

    it('can return hit-boxes according to its children', async () => {
      const { customObject, leftSprite, rightSprite } =
        await makeCustomObjectWith2Children();

      expect(leftSprite.getHitBoxes().length).to.be(1);
      expect(leftSprite.getHitBoxes()[0].vertices).to.eql([
        [64, 64],
        [0, 64],
        [64, 0],
      ]);

      expect(rightSprite.getHitBoxes().length).to.be(1);
      expect(rightSprite.getHitBoxes()[0].vertices).to.eql([
        [128, 64],
        [64, 64],
        [128, 0],
      ]);

      expect(customObject.getHitBoxes().length).to.be(2);
      expect(customObject.getHitBoxes()[0].vertices).to.eql([
        [64, 64],
        [0, 64],
        [64, 0],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [128, 64],
        [64, 64],
        [128, 0],
      ]);
    });

    it('can translate its hit-boxes', async () => {
      const { customObject } = await makeCustomObjectWith2Children();

      customObject.setPosition(8, 16);

      expect(customObject.getHitBoxes().length).to.be(2);
      expect(customObject.getHitBoxes()[0].vertices).to.eql([
        [72, 80],
        [8, 80],
        [72, 16],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [136, 80],
        [72, 80],
        [136, 16],
      ]);
    });

    it('can rotate its hit-boxes', async () => {
      const { customObject } = await makeCustomObjectWith2Children();

      expect(customObject.getCenterXInScene()).to.be((-100 + 400) / 2);
      expect(customObject.getCenterYInScene()).to.be((-200 + 500) / 2);

      customObject.setAngle(90);

      expect(customObject.getHitBoxes().length).to.be(2);
      expect(customObject.getHitBoxes()[0].vertices).to.eql([
        [236, 64],
        [236, 0],
        [300, 64],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [236, 128],
        [236, 64],
        [300, 128],
      ]);
    });

    it('can rotate its hit-boxes around a custom center at (0 ; 0)', async () => {
      const { customObject } = await makeCustomObjectWith2Children();

      customObject.setRotationCenter(0, 0);

      expect(customObject.getCenterX()).to.be(100);
      expect(customObject.getCenterY()).to.be(200);
      expect(customObject.getCenterXInScene()).to.be(0);
      expect(customObject.getCenterYInScene()).to.be(0);
      expect(customObject.getDrawableX()).to.be(-100);
      expect(customObject.getDrawableY()).to.be(-200);

      customObject.setAngle(90);

      expect(customObject.getHitBoxes().length).to.be(2);
      expect(customObject.getHitBoxes()[0].vertices).to.eql([
        [-64, 64],
        [-64, 0],
        [0, 64],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [-64, 128],
        [-64, 64],
        [0, 128],
      ]);
    });

    it('can scale its hit-boxes', async () => {
      const { customObject } = await makeCustomObjectWith2Children();

      expect(customObject.getWidth()).to.be(100 + 400);
      expect(customObject.getHeight()).to.be(200 + 500);

      customObject.setWidth((100 + 400) * 0.25);
      customObject.setHeight((200 + 500) * 1.5);

      expect(customObject.getHitBoxes().length).to.be(2);
      expect(customObject.getHitBoxes()[0].vertices).to.eql([
        [16, 96],
        [0, 96],
        [16, 0],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [32, 96],
        [16, 96],
        [32, 0],
      ]);
    });

    it('can translate, scale and rotate its hit-boxes', async () => {
      const { customObject } = await makeCustomObjectWith2Children();

      customObject.setPosition(8, 16);
      customObject.setAngle(90);
      const width = (100 + 400) * 0.25;
      const height = (200 + 500) * 1.5;
      customObject.setWidth(width);
      customObject.setHeight(height);

      expect(customObject.getWidth()).to.be(width);
      expect(customObject.getHeight()).to.be(height);
      expect(customObject.getScaleX()).to.be(0.25);
      expect(customObject.getScaleY()).to.be(1.5);
      expect(customObject.getCenterX()).to.be(width / 2);
      expect(customObject.getCenterY()).to.be(height / 2);
      expect(customObject.getCenterXInScene()).to.be(
        8 + width / 2 - 100 * 0.25
      );
      expect(customObject.getCenterYInScene()).to.be(
        16 + height / 2 - 200 * 1.5
      );
      expect(customObject.getDrawableX()).to.be(8 - 100 * 0.25);
      expect(customObject.getDrawableY()).to.be(16 - 200 * 1.5);

      // To draw the transformed shapes:
      // - draw 2 squares side-by-side
      // - scale them and keep the top-left corner in place
      // - rotate the shape keeping the center of the scaled drawing in place
      // - translate it according to the object new position.

      expect(customObject.getHitBoxes().length).to.be(2);
      expect(customObject.getHitBoxes()[0].vertices).to.eql([
        [174.5, 219.5],
        [174.5, 203.5],
        [270.5, 219.5],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [174.5, 235.5],
        [174.5, 219.5],
        [270.5, 235.5],
      ]);
    });

    it('keeps hit-boxes up to date when new children is added', async () => {
      const { customObject } = await makeCustomObjectWith2Children();

      const middleSprite = createSpriteObject(customObject._instanceContainer);
      middleSprite.setX(32);

      expect(customObject.getHitBoxes().length).to.be(3);
      expect(customObject.getHitBoxes()[0].vertices).to.eql([
        [64, 64],
        [0, 64],
        [64, 0],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [128, 64],
        [64, 64],
        [128, 0],
      ]);
      expect(customObject.getHitBoxes()[2].vertices).to.eql([
        [96, 64],
        [32, 64],
        [96, 0],
      ]);
    });

    it('properly computes hitboxes and point positions after the scene layer camera has moved', async () => {
      const { runtimeScene, customObject } =
        await makeCustomObjectWith2Children();
      const sceneLayer = runtimeScene.getLayer('');

      // Check the hitboxes and positions with default camera position
      expect(customObject.getHitBoxes().length).to.be(2);
      expect(customObject.getHitBoxes()[0].vertices).to.eql([
        [64, 64],
        [0, 64],
        [64, 0],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [128, 64],
        [64, 64],
        [128, 0],
      ]);

      // Move the layer camera.
      sceneLayer.setCameraX(2000);
      sceneLayer.setCameraY(4000);
      customObject.invalidateHitboxes();

      // The object hitboxes and positions stay the same.
      expect(customObject.getHitBoxes().length).to.be(2);
      expect(customObject.getHitBoxes()[0].vertices).to.eql([
        [64, 64],
        [0, 64],
        [64, 0],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [128, 64],
        [64, 64],
        [128, 0],
      ]);
    });

    it('properly computes hitboxes and point positions after the custom object layer camera has moved', async () => {
      const { customObject } = await makeCustomObjectWith2Children();
      const customObjectLayer = customObject
        .getInstanceContainer()
        .getLayer('');

      // Check the hitboxes and positions with default camera position
      expect(customObject.getHitBoxes().length).to.be(2);
      expect(customObject.getHitBoxes()[0].vertices).to.eql([
        [64, 64],
        [0, 64],
        [64, 0],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [128, 64],
        [64, 64],
        [128, 0],
      ]);

      // Move the layer camera.
      customObjectLayer.setCameraX(2000);
      customObjectLayer.setCameraY(4000);
      customObject.invalidateHitboxes();

      // The object hitboxes and positions stay the same.
      expect(customObject.getHitBoxes().length).to.be(2);
      expect(customObject.getHitBoxes()[0].vertices).to.eql([
        [64, 64],
        [0, 64],
        [64, 0],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [128, 64],
        [64, 64],
        [128, 0],
      ]);
    });

    /** @type {FloatPoint} */
    const workingPoint = [0, 0];

    describe('convertCoords', function () {
      it('can transform a point from the scene', async () => {
        const { customObject } = await makeCustomObjectWith2Children();
        const instanceContainer = customObject._instanceContainer;

        customObject.setPosition(16, 8);
        expect(instanceContainer.convertCoords(16, 8, workingPoint)).to.eql([
          0, 0,
        ]);
      });

      it('can transform a point from the scene with a negative AABB min position', async () => {
        const { customObject, leftSprite } =
          await makeCustomObjectWith2Children();
        const instanceContainer = customObject._instanceContainer;

        leftSprite.setPosition(-16, -8);
        customObject.setPosition(0, 0);
        expect(instanceContainer.convertCoords(0, 0, workingPoint)).to.eql([
          0, 0,
        ]);
      });

      it('can transform a point from the scene with a positive AABB min position', async () => {
        const { customObject, leftSprite } =
          await makeCustomObjectWith2Children();
        const instanceContainer = customObject._instanceContainer;

        leftSprite.setPosition(16, 8);
        customObject.setPosition(0, 0);
        expect(instanceContainer.convertCoords(0, 0, workingPoint)).to.eql([
          0, 0,
        ]);
      });
    });

    describe('transformation freshness', function () {
      /** The point the object puts its local (x ; y) at, as it is now. */
      const convert = (customObject, x, y) => {
        /** @type {FloatPoint} */
        const point = [0, 0];
        customObject.applyObjectTransformation(x, y, point);
        return point;
      };

      /** The same point, from a transformation recomputed on the spot. */
      const convertAfterRecomputing = (customObject, x, y) => {
        customObject._updateLocalTransformation();
        return convert(customObject, x, y);
      };

      /**
       * Every mutator must leave the transformation of the object to
       * recompute: a value read before it (the cache is warmed here, as a
       * frame being rendered would) must never survive the change.
       */
      const expectFreshAfter = async (changeCustomObject) => {
        const { customObject } = await makeCustomObjectWith2Children();
        customObject.setPosition(16, 8);
        customObject.setAngle(90);
        // Warm the cached transformation, like a read or a rendered frame.
        convert(customObject, 10, 20);

        changeCustomObject(customObject);

        expect(convert(customObject, 10, 20)).to.eql(
          convertAfterRecomputing(customObject, 10, 20)
        );
      };

      it('is fresh after the scale changed', async () => {
        await expectFreshAfter((customObject) => customObject.setScaleX(3));
        await expectFreshAfter((customObject) => customObject.setScaleY(2));
        await expectFreshAfter((customObject) => customObject.setScale(4));
      });

      it('is fresh after a flip', async () => {
        await expectFreshAfter((customObject) => customObject.flipX(true));
        await expectFreshAfter((customObject) => customObject.flipY(true));
      });

      it('is fresh after the center of rotation changed', async () => {
        await expectFreshAfter((customObject) =>
          customObject.setRotationCenter(0, 0)
        );
      });

      it('is fresh after the children moved', async () => {
        const { customObject, leftSprite } =
          await makeCustomObjectWith2Children();
        customObject.setAngle(90);
        convert(customObject, 10, 20);

        leftSprite.setPosition(-100, -50);

        expect(convert(customObject, 10, 20)).to.eql(
          convertAfterRecomputing(customObject, 10, 20)
        );
      });

      it('is what the renderer draws', async () => {
        const { customObject } = await makeCustomObjectWith2Children();
        customObject.setPosition(16, 8);
        customObject.setAngle(30);
        customObject.setScaleX(2);
        customObject.setScaleY(3);
        customObject.flipX(true);
        customObject.setRotationCenter(7, 11);

        customObject.getRenderer().ensureUpToDate();
        const container = customObject.getRendererObject();
        container.transform.updateLocalTransform();
        const drawn = container.localTransform.apply({ x: 10, y: 20 });

        const converted = convert(customObject, 10, 20);
        expect(converted[0]).to.be.within(drawn.x - 1e-3, drawn.x + 1e-3);
        expect(converted[1]).to.be.within(drawn.y - 1e-3, drawn.y + 1e-3);
      });
    });

    describe('transformation cost', function () {
      const tolerance = 1e-3;

      /** A custom object with every part of its transformation in play. */
      const makeTransformedCustomObject = async () => {
        const made = await makeCustomObjectWith2Children();
        made.customObject.setPosition(900, 400);
        made.customObject.setAngle(31);
        made.customObject.setScaleX(2);
        made.customObject.setScaleY(3);
        made.customObject.flipX(true);
        made.customObject.setRotationCenter(7, 11);
        return made;
      };

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
        const { customObject } = await makeTransformedCustomObject();
        const x = customObject.toParentX(10, 20);
        const y = customObject.toParentY(10, 20);
        // Warm both ways, like a frame that was already rendered.
        customObject.fromParentX(x, y);

        // The cursor is converted by every object it may be over, on every
        // frame: an object that did not change builds nothing again.
        const counts = countCalls(
          [
            [Math, 'cos'],
            [Math, 'sin'],
          ],
          () => {
            for (let i = 0; i < 100; i++) {
              customObject.fromParentX(x, y);
              customObject.fromParentY(x, y);
            }
          }
        );

        expect(counts).to.eql([0, 0]);
        expectNear(customObject.fromParentX(x, y), 10);
        expectNear(customObject.fromParentY(x, y), 20);
      });

      /**
       * Every mutator must leave the conversion back from the parent to
       * recompute too: a point converted to the parent and back must land
       * where it started, with the values the object has now.
       */
      const expectRoundTripAfter = async (changeCustomObject) => {
        const { customObject } = await makeTransformedCustomObject();
        // Warm both ways, like a frame that was already rendered.
        customObject.fromParentX(
          customObject.toParentX(10, 20),
          customObject.toParentY(10, 20)
        );

        changeCustomObject(customObject);

        const x = customObject.toParentX(10, 20);
        const y = customObject.toParentY(10, 20);
        expectNear(customObject.fromParentX(x, y), 10);
        expectNear(customObject.fromParentY(x, y), 20);
      };

      it('converts back from the parent with what the object is now', async () => {
        await expectRoundTripAfter((customObject) => customObject.setX(23));
        await expectRoundTripAfter((customObject) => customObject.setY(47));
        await expectRoundTripAfter((customObject) => customObject.setAngle(90));
        await expectRoundTripAfter((customObject) =>
          customObject.setScaleX(0.5)
        );
        await expectRoundTripAfter((customObject) => customObject.setScaleY(4));
        await expectRoundTripAfter((customObject) => customObject.setScale(2));
        await expectRoundTripAfter((customObject) => customObject.flipX(false));
        await expectRoundTripAfter((customObject) => customObject.flipY(true));
        await expectRoundTripAfter((customObject) =>
          customObject.setRotationCenter(-13, 29)
        );
        await expectRoundTripAfter((customObject) =>
          customObject.setWidth(customObject.getWidth() * 1.2)
        );
        await expectRoundTripAfter((customObject) =>
          customObject.setHeight(customObject.getHeight() * 0.8)
        );
      });

      /** Where the renderer draws a point of the inside of the object. */
      const drawn = (customObject, x, y) => {
        customObject.getRenderer().ensureUpToDate();
        const container = customObject.getRendererObject();
        container.transform.updateLocalTransform();
        return container.localTransform.apply({ x, y });
      };

      it('moves without building the container of the renderer again', async () => {
        const { customObject } = await makeTransformedCustomObject();
        drawn(customObject, 10, 20);

        const counts = countCalls(
          [[customObject.getRenderer(), '_updatePIXIContainer']],
          () => {
            customObject.setX(51);
            customObject.setY(72);
            customObject.setAngle(67);
            customObject.getRenderer().ensureUpToDate();
          }
        );

        // Only the position and the angle of the container changed: the
        // renderer writes them, where everything else it is built from (the
        // pivot, the scales, the flips) is untouched.
        expect(counts).to.eql([0]);
        const point = drawn(customObject, 10, 20);
        expectNear(point.x, customObject.toParentX(10, 20));
        expectNear(point.y, customObject.toParentY(10, 20));
      });

      it('keeps a container build asked for earlier while it moves', async () => {
        const { customObject } = await makeTransformedCustomObject();
        drawn(customObject, 10, 20);

        // The center of rotation is the pivot of the container: it needs the
        // whole container built again, which moving must not take away.
        customObject.setRotationCenter(-13, 29);
        customObject.setX(51);
        customObject.setAngle(67);

        const point = drawn(customObject, 10, 20);
        expectNear(point.x, customObject.toParentX(10, 20));
        expectNear(point.y, customObject.toParentY(10, 20));
      });

      it('is not built again when a child of an object with an area of its own moves', async () => {
        const { customObject, leftSprite } =
          await makeTransformedCustomObject();
        const beforeX = customObject.toParentX(10, 20);
        const beforeY = customObject.toParentY(10, 20);
        const beforeBounds = JSON.stringify(customObject.getAABB());
        drawn(customObject, 10, 20);

        const counts = countCalls(
          [[customObject, '_updateLocalTransformation']],
          () => {
            leftSprite.setPosition(-200, 140);
            customObject.toParentX(10, 20);
            customObject.getHitBoxes();
          }
        );

        // The object has an area of its own: its center of rotation stays
        // where it is, so what it contains moved and it did not.
        expect(counts).to.eql([0]);
        expect(customObject.toParentX(10, 20)).to.be(beforeX);
        expect(customObject.toParentY(10, 20)).to.be(beforeY);
        // Its hit boxes - and the ones of whatever contains it - still follow
        // its children.
        expect(JSON.stringify(customObject.getAABB())).not.to.be(beforeBounds);
      });
    });

    describe('toParent / fromParent', function () {
      /**
       * A custom object placed, turned, scaled and flipped: every part of its
       * transformation is in play in the conversions below.
       */
      const makeTransformedCustomObject = async () => {
        const { customObject } = await makeCustomObjectWith2Children();
        customObject.setPosition(16, 8);
        customObject.setAngle(30);
        customObject.setScaleX(2);
        customObject.setScaleY(3);
        customObject.flipX(true);
        customObject.setRotationCenter(7, 11);
        return customObject;
      };

      it('puts a point of the inside where the object puts its children', async () => {
        const customObject = await makeTransformedCustomObject();
        /** @type {FloatPoint} */
        const point = [0, 0];
        customObject.applyObjectTransformation(10, 20, point);

        expect(customObject.toParentX(10, 20)).to.be(point[0]);
        expect(customObject.toParentY(10, 20)).to.be(point[1]);
      });

      it('brings a point of the containing space back inside', async () => {
        const customObject = await makeTransformedCustomObject();
        const parentX = customObject.toParentX(10, 20);
        const parentY = customObject.toParentY(10, 20);

        expect(customObject.fromParentX(parentX, parentY)).to.be.within(
          10 - 1e-3,
          10 + 1e-3
        );
        expect(customObject.fromParentY(parentX, parentY)).to.be.within(
          20 - 1e-3,
          20 + 1e-3
        );
      });

      it('crosses one boundary at a time', async () => {
        const customObject = await makeTransformedCustomObject();
        // The conversion is the transformation of THIS object only: the point
        // it gives is in the space containing it, which is the scene here.
        /** @type {FloatPoint} */
        const point = [0, 0];
        customObject.applyObjectTransformation(0, 0, point);
        expect(customObject.toParentX(0, 0)).to.be(point[0]);
        expect(customObject.toParentY(0, 0)).to.be(point[1]);
      });

      it('answers a collapsed object with the closest point it can reach', async () => {
        const customObject = await makeTransformedCustomObject();
        customObject.setScaleX(0);

        const parentX = customObject.toParentX(10, 20);
        const parentY = customObject.toParentY(10, 20);
        // X collapsed: every point of that axis has the same image, and 0
        // answers for all of them. Y is untouched.
        expect(customObject.fromParentX(parentX, parentY)).to.be(0);
        expect(customObject.fromParentY(parentX, parentY)).to.be.within(
          20 - 1e-3,
          20 + 1e-3
        );
      });

      it('follows a change made just before it, with nothing rendered in between', async () => {
        const customObject = await makeTransformedCustomObject();
        const before = customObject.toParentX(10, 20);

        customObject.setX(customObject.getX() + 100);

        // The transformation is stored in a Float32Array: compared with a
        // tolerance, never bit for bit.
        expect(customObject.toParentX(10, 20)).to.be.within(
          before + 100 - 1e-3,
          before + 100 + 1e-3
        );
      });
    });

    describe('a collapsed object (a scale of 0)', function () {
      it('answers the closest point it can reach, never NaN', async () => {
        const { customObject } = await makeCustomObjectWith2Children();
        customObject.setPosition(16, 8);
        customObject.setScaleX(0);

        /** @type {FloatPoint} */
        const point = [0, 0];
        customObject.applyObjectInverseTransformation(100, 40, point);

        expect(Number.isFinite(point[0])).to.be(true);
        expect(Number.isFinite(point[1])).to.be(true);
        // Nothing of the object is on X anymore: 0 answers for every point of
        // the collapsed axis. Y is untouched and still exact.
        expect(point[0]).to.be(0);
        /** @type {FloatPoint} */
        const inverseOfTheOrigin = [0, 0];
        customObject.applyObjectInverseTransformation(
          16,
          8,
          inverseOfTheOrigin
        );
        expect(inverseOfTheOrigin[1]).to.be(0);
      });

      it('brings a point back exactly where it was at a right angle', async () => {
        const { customObject } = await makeCustomObjectWith2Children();
        customObject.setPosition(100, 100);
        customObject.setRotationCenter(0, 0);
        customObject.setAngle(90);

        /** @type {FloatPoint} */
        const point = [0, 0];
        customObject.applyObjectTransformation(0, 32, point);
        /** @type {FloatPoint} */
        const back = [0, 0];
        customObject.applyObjectInverseTransformation(point[0], point[1], back);

        // Exactly, not nearly: a point on the edge of a child would otherwise
        // come back a fraction of a pixel outside of it, and the cursor would
        // miss it.
        expect(back[0]).to.be(0);
        expect(back[1]).to.be(32);
      });

      it('answers a position that is nowhere with one that is nowhere', async () => {
        const { customObject } = await makeCustomObjectWith2Children();
        const instanceContainer = customObject._instanceContainer;
        customObject.setPosition(16, 8);
        customObject.setAngle(90);

        // What a collapsed custom object containing this one answers for the
        // cursor: nothing of it is under any position, so nothing of this one
        // is either. The layer between the two may give it another value that
        // is not a position (the camera turns an infinity into a NaN): what
        // matters is that no child is under it, and that the object does not
        // make one up.
        const converted = instanceContainer.convertCoords(
          Number.POSITIVE_INFINITY,
          Number.POSITIVE_INFINITY,
          workingPoint
        );

        expect(Number.isFinite(converted[0])).to.be(false);
        expect(Number.isFinite(converted[1])).to.be(false);
      });

      it('keeps its children out of reach of the cursor', async () => {
        const { customObject } = await makeCustomObjectWith2Children();
        const instanceContainer = customObject._instanceContainer;
        customObject.setPosition(16, 8);

        expect(instanceContainer.convertCoords(16, 8, workingPoint)).to.eql([
          0, 0,
        ]);

        customObject.setScaleY(0);

        // Every position of the scene would otherwise land on the same line
        // inside the object, putting all of its children under the cursor.
        const converted = instanceContainer.convertCoords(16, 8, workingPoint);
        expect(converted[0]).to.be(Number.POSITIVE_INFINITY);
        expect(converted[1]).to.be(Number.POSITIVE_INFINITY);
      });
    });

    describe('convertInverseCoords', function () {
      it('can transform a point to the scene', async () => {
        const { customObject } = await makeCustomObjectWith2Children();
        const instanceContainer = customObject._instanceContainer;

        customObject.setPosition(16, 8);
        expect(
          instanceContainer.convertInverseCoords(0, 0, workingPoint)
        ).to.eql([16, 8]);
      });

      it('can transform a point to scene with a negative AABB min position', async () => {
        const { customObject, leftSprite } =
          await makeCustomObjectWith2Children();
        const instanceContainer = customObject._instanceContainer;

        leftSprite.setPosition(-16, -8);
        customObject.setPosition(0, 0);
        expect(
          instanceContainer.convertInverseCoords(0, 0, workingPoint)
        ).to.eql([0, 0]);
      });

      it('can transform a point to the scene with a positive AABB min position', async () => {
        const { customObject, leftSprite } =
          await makeCustomObjectWith2Children();
        const instanceContainer = customObject._instanceContainer;

        leftSprite.setPosition(16, 8);
        customObject.setPosition(0, 0);
        expect(
          instanceContainer.convertInverseCoords(0, 0, workingPoint)
        ).to.eql([0, 0]);
      });
    });
  });
});
