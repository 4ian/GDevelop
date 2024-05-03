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
      variables: [],
      behaviors: [],
      effects: [],
      content: {},
      childrenContent: {
        MySprite: {
          updateIfNotVisible: false,
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
                        automatic: false,
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
      },
    });
    instanceContainer.addObject(customObject);
    return customObject;
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

  describe('with 2 sprites', function () {
    /** @type {gdjs.CustomRuntimeObject} */
    let customObject;
    /** @type {gdjs.RuntimeObject} */
    let leftSprite;
    /** @type {gdjs.RuntimeObject} */
    let rightSprite;

    const makeCustomObjectWith2Children = (instanceContainer) => {
      customObject = createCustomObject(instanceContainer);

      // Child-object creation should be done in the onCreate method of custom object.
      // TODO EBO Rewrite this test when an events-based object has initialInstances.
      leftSprite = createSpriteObject(customObject._instanceContainer);
      rightSprite = createSpriteObject(customObject._instanceContainer);

      rightSprite.setX(64);
    };

    it('can return hit-boxes according to its children', async () => {
      const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
      const runtimeScene = createSceneWithLayer(runtimeGame);
      makeCustomObjectWith2Children(runtimeScene);

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

      expect(customObject.getWidth()).to.be(128);
      expect(customObject.getHeight()).to.be(64);

      expect(customObject.getAABB()).to.eql({
        min: [0, 0],
        max: [128, 64],
      });

      expect(customObject.getCenterXInScene()).to.be(64);
      expect(customObject.getCenterYInScene()).to.be(32);

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
      const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
      const runtimeScene = createSceneWithLayer(runtimeGame);
      makeCustomObjectWith2Children(runtimeScene);

      customObject.setPosition(8, 16);

      expect(customObject.getWidth()).to.be(128);
      expect(customObject.getHeight()).to.be(64);

      expect(customObject.getCenterXInScene()).to.be(64 + 8);
      expect(customObject.getCenterYInScene()).to.be(32 + 16);

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
      const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
      const runtimeScene = createSceneWithLayer(runtimeGame);
      makeCustomObjectWith2Children(runtimeScene);

      customObject.setAngle(90);

      expect(customObject.getWidth()).to.be(128);
      expect(customObject.getHeight()).to.be(64);

      expect(customObject.getCenterXInScene()).to.be(64);
      expect(customObject.getCenterYInScene()).to.be(32);

      // sin(pi/2) can't be exactly 0
      // but cos(pi/2) is rounded to 1 because of the mantissa length.
      expect(customObject.getHitBoxes().length).to.be(2);
      expect(customObject.getHitBoxes()[0].vertices).to.eql([
        [32, 32],
        [32, -32],
        [96, 32],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [32, 96],
        [32, 32],
        [96, 96],
      ]);
    });

    it('can scale its hit-boxes', async () => {
      const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
      const runtimeScene = createSceneWithLayer(runtimeGame);
      makeCustomObjectWith2Children(runtimeScene);

      customObject.setWidth(32);
      customObject.setHeight(96);

      expect(customObject.getWidth()).to.be(32);
      expect(customObject.getHeight()).to.be(96);

      expect(customObject.getCenterXInScene()).to.be(16);
      expect(customObject.getCenterYInScene()).to.be(48);

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
      const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
      const runtimeScene = createSceneWithLayer(runtimeGame);
      makeCustomObjectWith2Children(runtimeScene);

      customObject.setPosition(8, 16);
      customObject.setAngle(90);
      customObject.setWidth(32);
      customObject.setHeight(96);

      // To draw the transformed shapes:
      // - draw 2 squares side-by-side
      // - scale them and keep the top-left corner in place
      // - rotate the shape keeping the center of the scaled drawing in place
      // - translate it according to the object new position.

      expect(customObject.getWidth()).to.be(32);
      expect(customObject.getHeight()).to.be(96);

      expect(customObject.getCenterXInScene()).to.be(32 / 2 + 8);
      expect(customObject.getCenterYInScene()).to.be(96 / 2 + 16);

      expect(customObject.getHitBoxes().length).to.be(2);
      expect(customObject.getHitBoxes()[0].vertices).to.eql([
        [-24, 64],
        [-24, 48],
        [72, 64],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [-24, 80],
        [-24, 64],
        [72, 80],
      ]);
    });

    it('keeps hit-boxes up to date when its children move and push the bottom-right corner', async () => {
      const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
      const runtimeScene = createSceneWithLayer(runtimeGame);
      makeCustomObjectWith2Children(runtimeScene);

      rightSprite.setPosition(64 + 32, 0 + 8);

      expect(customObject.getWidth()).to.be(128 + 32);
      expect(customObject.getHeight()).to.be(64 + 8);

      expect(customObject.getX()).to.be(0);
      expect(customObject.getY()).to.be(0);

      expect(customObject.getCenterXInScene()).to.be(64 + 16);
      expect(customObject.getCenterYInScene()).to.be(32 + 4);

      expect(customObject.getHitBoxes().length).to.be(2);
      expect(customObject.getHitBoxes()[0].vertices).to.eql([
        [64, 64],
        [0, 64],
        [64, 0],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [160, 72],
        [96, 72],
        [160, 8],
      ]);
    });

    it('keeps hit-boxes up to date when its children move and push the top-left corner', async () => {
      const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
      const runtimeScene = createSceneWithLayer(runtimeGame);
      makeCustomObjectWith2Children(runtimeScene);

      leftSprite.setPosition(0 - 32, 0 - 8);

      expect(customObject.getWidth()).to.be(128 + 32);
      expect(customObject.getHeight()).to.be(64 + 8);

      expect(customObject.getX()).to.be(0);
      expect(customObject.getY()).to.be(0);

      expect(customObject.getDrawableX()).to.be(-32);
      expect(customObject.getDrawableY()).to.be(-8);

      expect(customObject.getCenterXInScene()).to.be(64 - 16);
      expect(customObject.getCenterYInScene()).to.be(32 - 4);

      expect(customObject.getHitBoxes().length).to.be(2);
      expect(customObject.getHitBoxes()[0].vertices).to.eql([
        [32, 56],
        [-32, 56],
        [32, -8],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [128, 64],
        [64, 64],
        [128, 0],
      ]);
    });

    it('keeps hit-boxes up to date when its children move and shrink the top-left corner', async () => {
      const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
      const runtimeScene = createSceneWithLayer(runtimeGame);
      makeCustomObjectWith2Children(runtimeScene);

      leftSprite.setPosition(0 + 32, 0 + 8);
      rightSprite.setPosition(64, 0 + 8);

      expect(customObject.getWidth()).to.be(128 - 32);
      expect(customObject.getHeight()).to.be(64);

      expect(customObject.getX()).to.be(0);
      expect(customObject.getY()).to.be(0);

      expect(customObject.getDrawableX()).to.be(32);
      expect(customObject.getDrawableY()).to.be(8);

      expect(customObject.getCenterXInScene()).to.be(64 + 16);
      expect(customObject.getCenterYInScene()).to.be(32 + 8);

      expect(customObject.getHitBoxes().length).to.be(2);
      expect(customObject.getHitBoxes()[0].vertices).to.eql([
        [96, 72],
        [32, 72],
        [96, 8],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [128, 72],
        [64, 72],
        [128, 8],
      ]);
    });

    it('keeps hit-boxes up to date when new children is added', async () => {
      const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
      const runtimeScene = createSceneWithLayer(runtimeGame);
      makeCustomObjectWith2Children(runtimeScene);

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
      const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
      const runtimeScene = createSceneWithLayer(runtimeGame);
      makeCustomObjectWith2Children(runtimeScene);
      const sceneLayer = runtimeScene.getLayer('');

      // Check the hitboxes and positions with default camera position
      expect(customObject.getCenterXInScene()).to.be(64);
      expect(customObject.getCenterYInScene()).to.be(32);

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
      expect(customObject.getCenterXInScene()).to.be(64);
      expect(customObject.getCenterYInScene()).to.be(32);

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
      const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
      const runtimeScene = createSceneWithLayer(runtimeGame);
      makeCustomObjectWith2Children(runtimeScene);
      const customObjectLayer = customObject
        .getInstanceContainer()
        .getLayer('');

      // Check the hitboxes and positions with default camera position
      expect(customObject.getCenterXInScene()).to.be(64);
      expect(customObject.getCenterYInScene()).to.be(32);

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
      expect(customObject.getCenterXInScene()).to.be(64);
      expect(customObject.getCenterYInScene()).to.be(32);

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
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);
        const instanceContainer = customObject._instanceContainer;

        customObject.setPosition(16, 8);
        expect(instanceContainer.convertCoords(16, 8, workingPoint)).to.eql([
          0,
          0,
        ]);
      });

      it('can transform a point from the scene with a negative AABB min position', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);
        const instanceContainer = customObject._instanceContainer;

        leftSprite.setPosition(-16, -8);
        customObject.setPosition(0, 0);
        expect(instanceContainer.convertCoords(0, 0, workingPoint)).to.eql([
          0,
          0,
        ]);
      });

      it('can transform a point from the scene with a positive AABB min position', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);
        const instanceContainer = customObject._instanceContainer;

        leftSprite.setPosition(16, 8);
        customObject.setPosition(0, 0);
        expect(instanceContainer.convertCoords(0, 0, workingPoint)).to.eql([
          0,
          0,
        ]);
      });
    });

    describe('convertInverseCoords', function () {
      it('can transform a point to the scene', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);
        const instanceContainer = customObject._instanceContainer;

        customObject.setPosition(16, 8);
        expect(
          instanceContainer.convertInverseCoords(0, 0, workingPoint)
        ).to.eql([16, 8]);
      });

      it('can transform a point to scene with a negative AABB min position', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);
        const instanceContainer = customObject._instanceContainer;

        leftSprite.setPosition(-16, -8);
        customObject.setPosition(0, 0);
        expect(
          instanceContainer.convertInverseCoords(0, 0, workingPoint)
        ).to.eql([0, 0]);
      });

      it('can transform a point to the scene with a positive AABB min position', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);
        const instanceContainer = customObject._instanceContainer;

        leftSprite.setPosition(16, 8);
        customObject.setPosition(0, 0);
        expect(
          instanceContainer.convertInverseCoords(0, 0, workingPoint)
        ).to.eql([0, 0]);
      });
    });
  });

  describe('with custom objects as children', function () {
    /** @type {gdjs.CustomRuntimeObject} */
    let rootCustomObject;
    /** @type {gdjs.CustomRuntimeObject} */
    let topCustomObject;
    /** @type {gdjs.RuntimeObject} */
    // @ts-ignore - we do not use this variable
    let topLeftSprite;
    /** @type {gdjs.RuntimeObject} */
    let topRightSprite;
    /** @type {gdjs.CustomRuntimeObject} */
    let bottomCustomObject;
    /** @type {gdjs.RuntimeObject} */
    // @ts-ignore - we do not use this variable
    let bottomLeftSprite;
    /** @type {gdjs.RuntimeObject} */
    let bottomRightSprite;

    const makeCustomObjectWith2ChildrenAt2Levels = (instanceContainer) => {
      rootCustomObject = createCustomObject(instanceContainer);
      topCustomObject = createCustomObject(rootCustomObject._instanceContainer);
      // Child-object creation should be done in the onCreate method of custom object.
      // TODO EBO Rewrite this test when an events-based object has initialInstances.
      topLeftSprite = createSpriteObject(topCustomObject._instanceContainer);
      topRightSprite = createSpriteObject(topCustomObject._instanceContainer);
      topRightSprite.setX(64);

      bottomCustomObject = createCustomObject(
        rootCustomObject._instanceContainer
      );
      // Child-object creation should be done in the onCreate method of custom object.
      // TODO EBO Rewrite this test when an events-based object has initialInstances.
      bottomLeftSprite = createSpriteObject(
        bottomCustomObject._instanceContainer
      );
      bottomRightSprite = createSpriteObject(
        bottomCustomObject._instanceContainer
      );
      bottomRightSprite.setX(64);

      bottomCustomObject.setY(64);
    };

    it('can return hit-boxes according to its children', async () => {
      const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
      const runtimeScene = createSceneWithLayer(runtimeGame);
      makeCustomObjectWith2ChildrenAt2Levels(runtimeScene);

      expect(rootCustomObject.getWidth()).to.be(128);
      expect(rootCustomObject.getHeight()).to.be(128);

      expect(rootCustomObject.getAABB()).to.eql({
        min: [0, 0],
        max: [128, 128],
      });

      expect(rootCustomObject.getCenterXInScene()).to.be(64);
      expect(rootCustomObject.getCenterYInScene()).to.be(64);

      expect(rootCustomObject.getHitBoxes().length).to.be(4);
      expect(rootCustomObject.getHitBoxes()[0].vertices).to.eql([
        [64, 64],
        [0, 64],
        [64, 0],
      ]);
      expect(rootCustomObject.getHitBoxes()[1].vertices).to.eql([
        [128, 64],
        [64, 64],
        [128, 0],
      ]);
      expect(rootCustomObject.getHitBoxes()[2].vertices).to.eql([
        [64, 128],
        [0, 128],
        [64, 64],
      ]);
      expect(rootCustomObject.getHitBoxes()[3].vertices).to.eql([
        [128, 128],
        [64, 128],
        [128, 64],
      ]);
    });

    it('keeps hit-boxes up to date when its children move and push the bottom-right corner', async () => {
      const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
      const runtimeScene = createSceneWithLayer(runtimeGame);
      makeCustomObjectWith2ChildrenAt2Levels(runtimeScene);

      bottomRightSprite.setPosition(64 + 32, 0 + 8);

      expect(rootCustomObject.getWidth()).to.be(128 + 32);
      expect(rootCustomObject.getHeight()).to.be(128 + 8);

      expect(rootCustomObject.getX()).to.be(0);
      expect(rootCustomObject.getY()).to.be(0);

      expect(rootCustomObject.getCenterXInScene()).to.be(64 + 16);
      expect(rootCustomObject.getCenterYInScene()).to.be(64 + 4);

      expect(rootCustomObject.getHitBoxes().length).to.be(4);
      expect(rootCustomObject.getHitBoxes()[0].vertices).to.eql([
        [64, 64],
        [0, 64],
        [64, 0],
      ]);
      expect(rootCustomObject.getHitBoxes()[1].vertices).to.eql([
        [128, 64],
        [64, 64],
        [128, 0],
      ]);
      expect(rootCustomObject.getHitBoxes()[2].vertices).to.eql([
        [64, 128],
        [0, 128],
        [64, 64],
      ]);
      expect(rootCustomObject.getHitBoxes()[3].vertices).to.eql([
        [160, 136],
        [96, 136],
        [160, 72],
      ]);
    });

    it('keeps hit-boxes up to date when new children is added', async () => {
      const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
      const runtimeScene = createSceneWithLayer(runtimeGame);
      makeCustomObjectWith2ChildrenAt2Levels(runtimeScene);

      const topMiddleSprite = createSpriteObject(
        topCustomObject._instanceContainer
      );
      topMiddleSprite.setX(32);

      expect(rootCustomObject.getHitBoxes().length).to.be(5);
      expect(rootCustomObject.getHitBoxes()[0].vertices).to.eql([
        [64, 64],
        [0, 64],
        [64, 0],
      ]);
      expect(rootCustomObject.getHitBoxes()[1].vertices).to.eql([
        [128, 64],
        [64, 64],
        [128, 0],
      ]);
      // This is the new child.
      expect(rootCustomObject.getHitBoxes()[2].vertices).to.eql([
        [96, 64],
        [32, 64],
        [96, 0],
      ]);
      expect(rootCustomObject.getHitBoxes()[3].vertices).to.eql([
        [64, 128],
        [0, 128],
        [64, 64],
      ]);
      expect(rootCustomObject.getHitBoxes()[4].vertices).to.eql([
        [128, 128],
        [64, 128],
        [128, 64],
      ]);
    });
  });
});
