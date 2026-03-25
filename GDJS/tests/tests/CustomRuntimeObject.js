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
      }
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

  describe('center point calculations', function () {
    /** @type {gdjs.CustomRuntimeObject} */
    let customObject;
    /** @type {gdjs.RuntimeObject} */
    let leftSprite;
    /** @type {gdjs.RuntimeObject} */
    let rightSprite;

    const makeCustomObjectWith2Children = (instanceContainer) => {
      customObject = createCustomObject(instanceContainer);
      leftSprite = createSpriteObject(customObject._instanceContainer);
      rightSprite = createSpriteObject(customObject._instanceContainer);
      rightSprite.setX(64);
    };

    describe('with default center (symmetric bounds: minX=0, minY=0)', function () {
      // Setup: leftSprite at (0,0), rightSprite at (64,0)
      // Bounds: [0,0] - [128,64], width=128, height=64
      // Default center: (64, 32)

      it('returns correct getCenterX/Y with no transforms', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);

        // getCenterX/Y are relative to getDrawableX/Y
        expect(customObject.getCenterX()).to.be(64);
        expect(customObject.getCenterY()).to.be(32);
        expect(customObject.getDrawableX()).to.be(0);
        expect(customObject.getDrawableY()).to.be(0);
        expect(customObject.getCenterXInScene()).to.be(64);
        expect(customObject.getCenterYInScene()).to.be(32);
      });

      it('returns correct getCenterX/Y with scale', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);

        customObject.setWidth(256);
        customObject.setHeight(128);

        // scaleX=2, scaleY=2
        expect(customObject.getCenterX()).to.be(128);
        expect(customObject.getCenterY()).to.be(64);
        expect(customObject.getDrawableX()).to.be(0);
        expect(customObject.getDrawableY()).to.be(0);
        expect(customObject.getCenterXInScene()).to.be(128);
        expect(customObject.getCenterYInScene()).to.be(64);
      });

      it('returns correct getCenterX/Y when flipped X', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);

        customObject.flipX(true);

        // With default center at geometric center, flipping doesn't change drawable position
        expect(customObject.getCenterX()).to.be(64);
        expect(customObject.getCenterY()).to.be(32);
        expect(customObject.getDrawableX()).to.be(0);
        expect(customObject.getDrawableY()).to.be(0);
        expect(customObject.getCenterXInScene()).to.be(64);
        expect(customObject.getCenterYInScene()).to.be(32);
      });

      it('returns correct getCenterX/Y when flipped Y', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);

        customObject.flipY(true);

        expect(customObject.getCenterX()).to.be(64);
        expect(customObject.getCenterY()).to.be(32);
        expect(customObject.getDrawableX()).to.be(0);
        expect(customObject.getDrawableY()).to.be(0);
        expect(customObject.getCenterXInScene()).to.be(64);
        expect(customObject.getCenterYInScene()).to.be(32);
      });
    });

    describe('with custom center (symmetric bounds: minX=0, minY=0)', function () {
      // Setup: leftSprite at (0,0), rightSprite at (64,0)
      // Bounds: [0,0] - [128,64], width=128, height=64
      // Custom center set at (32, 16) -- offset from geometric center

      it('returns correct getCenterX/Y with no transforms', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);

        customObject.setRotationCenter(32, 16);

        // getCenterX/Y = (unscaledCenter - unscaledMin) * scale
        // = (32 - 0) * 1 = 32 for X, (16 - 0) * 1 = 16 for Y
        expect(customObject.getCenterX()).to.be(32);
        expect(customObject.getCenterY()).to.be(16);
        expect(customObject.getDrawableX()).to.be(0);
        expect(customObject.getDrawableY()).to.be(0);
        expect(customObject.getCenterXInScene()).to.be(32);
        expect(customObject.getCenterYInScene()).to.be(16);
      });

      it('returns correct getCenterX/Y with scale', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);

        customObject.setRotationCenter(32, 16);
        customObject.setWidth(256);
        customObject.setHeight(128);

        // scaleX=2, scaleY=2
        // getCenterX = (32 - 0) * 2 = 64, getCenterY = (16 - 0) * 2 = 32
        expect(customObject.getCenterX()).to.be(64);
        expect(customObject.getCenterY()).to.be(32);
        expect(customObject.getDrawableX()).to.be(0);
        expect(customObject.getDrawableY()).to.be(0);
        expect(customObject.getCenterXInScene()).to.be(64);
        expect(customObject.getCenterYInScene()).to.be(32);
      });

      it('returns correct getCenterX/Y when flipped X', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);

        customObject.setRotationCenter(32, 16);
        customObject.flipX(true);

        // Flipped X: drawableX = x + (-minX - width + 2*unscaledCenterX) * scaleX
        //   = 0 + (-0 - 128 + 2*32) * 1 = -64
        // getCenterX = (32 - 0) * 1 = 32
        // CenterXInScene = drawableX + centerX = -64 + 32 = -32
        expect(customObject.getCenterX()).to.be(32);
        expect(customObject.getCenterY()).to.be(16);
        expect(customObject.getDrawableX()).to.be(-64);
        expect(customObject.getCenterXInScene()).to.be(-64 + 32);
      });

      it('returns correct getCenterX/Y when flipped Y', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);

        customObject.setRotationCenter(32, 16);
        customObject.flipY(true);

        // Flipped Y: drawableY = y + (-minY - height + 2*unscaledCenterY) * scaleY
        //   = 0 + (-0 - 64 + 2*16) * 1 = -32
        // getCenterY = (16 - 0) * 1 = 16
        // CenterYInScene = drawableY + centerY = -32 + 16 = -16
        expect(customObject.getCenterX()).to.be(32);
        expect(customObject.getCenterY()).to.be(16);
        expect(customObject.getDrawableY()).to.be(-32);
        expect(customObject.getCenterYInScene()).to.be(-32 + 16);
      });
    });

    describe('with default center (asymmetric bounds: minX != minY)', function () {
      // Move leftSprite to (-16, -8) to create asymmetric negative bounds.
      // Bounds: [-16,-8] - [128,64], width=144, height=72
      // Default center: (144/2 + (-16), 72/2 + (-8)) = (56, 28) from origin

      it('returns correct getCenterX/Y with no transforms', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);

        leftSprite.setPosition(-16, -8);

        // width=144, height=72
        expect(customObject.getWidth()).to.be(144);
        expect(customObject.getHeight()).to.be(72);
        // drawableX = x + minX * scale = 0 + (-16)*1 = -16
        // drawableY = y + minY * scale = 0 + (-8)*1 = -8
        expect(customObject.getDrawableX()).to.be(-16);
        expect(customObject.getDrawableY()).to.be(-8);
        // getCenterX = (unscaledCenterX - minX) * scale = (56 - (-16)) * 1 = 72
        // getCenterY = (unscaledCenterY - minY) * scale = (28 - (-8)) * 1 = 36
        expect(customObject.getCenterX()).to.be(72);
        expect(customObject.getCenterY()).to.be(36);
        // CenterXInScene = drawableX + centerX = -16 + 72 = 56
        // CenterYInScene = drawableY + centerY = -8 + 36 = 28
        expect(customObject.getCenterXInScene()).to.be(56);
        expect(customObject.getCenterYInScene()).to.be(28);
      });

      it('returns correct getCenterX/Y with scale', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);

        leftSprite.setPosition(-16, -8);
        // Scale by 2x in X (target width 288) and 3x in Y (target height 216)
        customObject.setWidth(288);
        customObject.setHeight(216);

        expect(customObject.getWidth()).to.be(288);
        expect(customObject.getHeight()).to.be(216);
        // drawableX = 0 + (-16)*2 = -32
        // drawableY = 0 + (-8)*3 = -24
        expect(customObject.getDrawableX()).to.be(-32);
        expect(customObject.getDrawableY()).to.be(-24);
        // getCenterX = (56 - (-16)) * 2 = 144
        // getCenterY = (28 - (-8)) * 3 = 108
        expect(customObject.getCenterX()).to.be(144);
        expect(customObject.getCenterY()).to.be(108);
        // CenterXInScene = -32 + 144 = 112
        // CenterYInScene = -24 + 108 = 84
        expect(customObject.getCenterXInScene()).to.be(112);
        expect(customObject.getCenterYInScene()).to.be(84);
      });
    });

    describe('with custom center (asymmetric bounds: minX != minY)', function () {
      // leftSprite at (-16, -8)
      // Bounds: [-16,-8] - [128,64], width=144, height=72
      // Custom center at (40, 20) -- from origin

      it('returns correct getCenterX/Y with no transforms', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);

        leftSprite.setPosition(-16, -8);
        customObject.setRotationCenter(40, 20);

        expect(customObject.getWidth()).to.be(144);
        expect(customObject.getHeight()).to.be(72);
        expect(customObject.getDrawableX()).to.be(-16);
        expect(customObject.getDrawableY()).to.be(-8);
        // getCenterX = (40 - (-16)) * 1 = 56
        // getCenterY = (20 - (-8)) * 1 = 28
        expect(customObject.getCenterX()).to.be(56);
        expect(customObject.getCenterY()).to.be(28);
        // CenterXInScene = -16 + 56 = 40
        // CenterYInScene = -8 + 28 = 20
        expect(customObject.getCenterXInScene()).to.be(40);
        expect(customObject.getCenterYInScene()).to.be(20);
      });

      it('returns correct getCenterX/Y with scale', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);

        leftSprite.setPosition(-16, -8);
        customObject.setRotationCenter(40, 20);
        customObject.setWidth(288);
        customObject.setHeight(216);

        // scaleX=2, scaleY=3
        expect(customObject.getDrawableX()).to.be(-32);
        expect(customObject.getDrawableY()).to.be(-24);
        // getCenterX = (40 - (-16)) * 2 = 112
        // getCenterY = (20 - (-8)) * 3 = 84
        expect(customObject.getCenterX()).to.be(112);
        expect(customObject.getCenterY()).to.be(84);
        // CenterXInScene = -32 + 112 = 80
        // CenterYInScene = -24 + 84 = 60
        expect(customObject.getCenterXInScene()).to.be(80);
        expect(customObject.getCenterYInScene()).to.be(60);
      });

      it('returns correct getCenterX/Y when flipped X', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);

        leftSprite.setPosition(-16, -8);
        customObject.setRotationCenter(40, 20);
        customObject.flipX(true);

        // Flipped X: drawableX = x + (-minX - width + 2*unscaledCenterX) * scaleX
        //   = 0 + (16 - 144 + 80) * 1 = -48
        expect(customObject.getDrawableX()).to.be(-48);
        // getCenterX = (40 - (-16)) * 1 = 56
        expect(customObject.getCenterX()).to.be(56);
        // CenterXInScene = -48 + 56 = 8
        expect(customObject.getCenterXInScene()).to.be(8);
      });

      it('returns correct getCenterX/Y when flipped Y', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);

        leftSprite.setPosition(-16, -8);
        customObject.setRotationCenter(40, 20);
        customObject.flipY(true);

        // Flipped Y: drawableY = y + (-minY - height + 2*unscaledCenterY) * scaleY
        //   = 0 + (8 - 72 + 40) * 1 = -24
        expect(customObject.getDrawableY()).to.be(-24);
        // getCenterY = (20 - (-8)) * 1 = 28
        expect(customObject.getCenterY()).to.be(28);
        // CenterYInScene = -24 + 28 = 4
        expect(customObject.getCenterYInScene()).to.be(4);
      });

      it('returns correct getCenterX/Y with scale and flip X', async () => {
        const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
        const runtimeScene = createSceneWithLayer(runtimeGame);
        makeCustomObjectWith2Children(runtimeScene);

        leftSprite.setPosition(-16, -8);
        customObject.setRotationCenter(40, 20);
        customObject.setWidth(288);
        customObject.flipX(true);

        // scaleX = 2
        // Flipped X: drawableX = 0 + (16 - 144 + 80) * 2 = -96
        expect(customObject.getDrawableX()).to.be(-96);
        // getCenterX = (40 - (-16)) * 2 = 112
        expect(customObject.getCenterX()).to.be(112);
        // CenterXInScene = -96 + 112 = 16
        expect(customObject.getCenterXInScene()).to.be(16);
      });
    });
  });
});
