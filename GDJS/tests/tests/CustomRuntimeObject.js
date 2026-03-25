// @ts-check

/**
 * Basic tests for gdjs.SpriteRuntimeObject
 */
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
     * @return {Promise<{runtimeScene: gdjs.RuntimeScene, customObject: gdjs.CustomRuntimeObject, leftSprite: gdjs.RuntimeObject, rightSprite: gdjs.RuntimeObject}>}
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
      const { runtimeScene, customObject, leftSprite, rightSprite } =
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
      const { runtimeScene, customObject, leftSprite, rightSprite } =
        await makeCustomObjectWith2Children();

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
      const { runtimeScene, customObject, leftSprite, rightSprite } =
        await makeCustomObjectWith2Children();

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
      const { runtimeScene, customObject, leftSprite, rightSprite } =
        await makeCustomObjectWith2Children();

      customObject.setRotationCenter(0, 0);

      expect(customObject.getCenterXInScene()).to.be(0);
      expect(customObject.getCenterYInScene()).to.be(0);

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
      const { runtimeScene, customObject, leftSprite, rightSprite } =
        await makeCustomObjectWith2Children();

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
      const { runtimeScene, customObject, leftSprite, rightSprite } =
        await makeCustomObjectWith2Children();

      customObject.setPosition(8, 16);
      customObject.setAngle(90);
      customObject.setWidth((100 + 400) * 0.25);
      customObject.setHeight((200 + 500) * 1.5);

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
      const { runtimeScene, customObject, leftSprite, rightSprite } =
        await makeCustomObjectWith2Children();

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
      const { runtimeScene, customObject, leftSprite, rightSprite } =
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
      const { runtimeScene, customObject, leftSprite, rightSprite } =
        await makeCustomObjectWith2Children();
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
        const { runtimeScene, customObject, leftSprite, rightSprite } =
          await makeCustomObjectWith2Children();
        const instanceContainer = customObject._instanceContainer;

        customObject.setPosition(16, 8);
        expect(instanceContainer.convertCoords(16, 8, workingPoint)).to.eql([
          0, 0,
        ]);
      });

      it('can transform a point from the scene with a negative AABB min position', async () => {
        const { runtimeScene, customObject, leftSprite, rightSprite } =
          await makeCustomObjectWith2Children();
        const instanceContainer = customObject._instanceContainer;

        leftSprite.setPosition(-16, -8);
        customObject.setPosition(0, 0);
        expect(instanceContainer.convertCoords(0, 0, workingPoint)).to.eql([
          0, 0,
        ]);
      });

      it('can transform a point from the scene with a positive AABB min position', async () => {
        const { runtimeScene, customObject, leftSprite, rightSprite } =
          await makeCustomObjectWith2Children();
        const instanceContainer = customObject._instanceContainer;

        leftSprite.setPosition(16, 8);
        customObject.setPosition(0, 0);
        expect(instanceContainer.convertCoords(0, 0, workingPoint)).to.eql([
          0, 0,
        ]);
      });
    });

    describe('convertInverseCoords', function () {
      it('can transform a point to the scene', async () => {
        const { runtimeScene, customObject, leftSprite, rightSprite } =
          await makeCustomObjectWith2Children();
        const instanceContainer = customObject._instanceContainer;

        customObject.setPosition(16, 8);
        expect(
          instanceContainer.convertInverseCoords(0, 0, workingPoint)
        ).to.eql([16, 8]);
      });

      it('can transform a point to scene with a negative AABB min position', async () => {
        const { runtimeScene, customObject, leftSprite, rightSprite } =
          await makeCustomObjectWith2Children();
        const instanceContainer = customObject._instanceContainer;

        leftSprite.setPosition(-16, -8);
        customObject.setPosition(0, 0);
        expect(
          instanceContainer.convertInverseCoords(0, 0, workingPoint)
        ).to.eql([0, 0]);
      });

      it('can transform a point to the scene with a positive AABB min position', async () => {
        const { runtimeScene, customObject, leftSprite, rightSprite } =
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
