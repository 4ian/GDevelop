// @ts-check

/**
 * Basic tests for gdjs.SpriteRuntimeObject
 */
describe('gdjs.CustomRuntimeObject', function () {
  const extensions = {
    eventsFunctionsExtensions: [
      {
        name: 'MyExtension',
        eventsBasedObjects: [
          {
            name: 'MyEventsBasedObject',
            description: '',
            fullName: '',
            eventsFunctions: [],
            propertyDescriptors: [],
            objects: [
              {
                name: 'MySprite',
                type: 'Sprite',
                updateIfNotVisible: false,
                variables: [],
                behaviors: [],
                animations: [],
                effects: [],
              },
            ],
          },
        ],
      },
    ],
  };

  /**
   * Create a CustomRuntimeObject with a SpriteRuntimeObject using a 64x64
   * image with a custom collision mask.
   * @param {gdjs.RuntimeScene} runtimeScene
   */
  const makeCustomObject = (runtimeScene) =>
    new gdjs.CustomRuntimeObject(runtimeScene, {
      name: 'MyCustomObject',
      type: 'MyExtension::MyEventsBasedObject',
      variables: [],
      behaviors: [],
      effects: [],
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

  /** @type {gdjs.CustomRuntimeObject} */
  let customObject;
  /** @type {gdjs.RuntimeObject} */
  let leftSprite;
  /** @type {gdjs.RuntimeObject} */
  let rightSprite;

  const makeCustomObjectWith2Children = (runtimeScene) => {
    customObject = makeCustomObject(runtimeScene);

    // Child-object creation should be done in the onCreate method of custom object.
    // TODO EBO Rewrite this test when an events-based object has initialInstances.
    leftSprite = customObject._instanceContainer.createObject('MySprite');
    rightSprite = customObject._instanceContainer.createObject('MySprite');
    if (!leftSprite || !rightSprite) {
      throw new Error("Object couldn't be created");
    }
    rightSprite.setX(64);
    // The onCreate method would have rebuilt the instance list.
    customObject.update(runtimeScene);
  };

  it('can return hit-boxes according to its children', function () {
    return gdjs.getPixiRuntimeGameWithAssets(extensions).then((runtimeGame) => {
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
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

      expect(customObject.getAABB()).to.eql({ min: [0, 0], max: [128, 64] });

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
  });

  it('can translate its hit-boxes', function () {
    return gdjs.getPixiRuntimeGameWithAssets(extensions).then((runtimeGame) => {
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
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
  });

  it('can rotate its hit-boxes', function () {
    return gdjs.getPixiRuntimeGameWithAssets(extensions).then((runtimeGame) => {
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
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
        [31.999999999999993, -31.999999999999996],
        [96, 31.999999999999996],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [32, 96],
        [32, 32],
        [96, 96],
      ]);
    });
  });

  it('can scale its hit-boxes', function () {
    return gdjs.getPixiRuntimeGameWithAssets(extensions).then((runtimeGame) => {
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
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
  });

  it('can translate, scale and rotate its hit-boxes', function () {
    return gdjs.getPixiRuntimeGameWithAssets(extensions).then((runtimeGame) => {
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
      makeCustomObjectWith2Children(runtimeScene);

      customObject.setPosition(8, 16);
      customObject.setAngle(90);
      customObject.setWidth(32);
      customObject.setHeight(96);

      expect(customObject.getWidth()).to.be(32);
      expect(customObject.getHeight()).to.be(96);

      expect(customObject.getCenterXInScene()).to.be(32 / 2 + 8);
      expect(customObject.getCenterYInScene()).to.be(96 / 2 + 16);

      expect(customObject.getHitBoxes().length).to.be(2);
      expect(customObject.getHitBoxes()[0].vertices).to.eql([
        [-12, 100],
        [-12, 84],
        [84, 100],
      ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([
        [-12, 116],
        [-12, 100],
        [84, 116],
      ]);
    });
  });

  it('keeps hit-boxes up to date when its children move and push the bottom-right corner', function () {
    return gdjs.getPixiRuntimeGameWithAssets(extensions).then((runtimeGame) => {
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
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
  });

  it('keeps hit-boxes up to date when its children move and push the top-left corner', function () {
    return gdjs.getPixiRuntimeGameWithAssets(extensions).then((runtimeGame) => {
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
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
  });

  it('keeps hit-boxes up to date when its children move and shrink the top-left corner', function () {
    return gdjs.getPixiRuntimeGameWithAssets(extensions).then((runtimeGame) => {
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
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
      expect(customObject.getHitBoxes()[0].vertices).to.eql([ [ 96, 72 ], [ 32, 72 ], [ 96, 8 ] ]);
      expect(customObject.getHitBoxes()[1].vertices).to.eql([ [ 128, 72 ], [ 64, 72 ], [ 128, 8 ] ]);
    });
  });

  it('keeps hit-boxes up to date when new children are added in life-cycle function', function () {
    return gdjs.getPixiRuntimeGameWithAssets(extensions).then((runtimeGame) => {
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
      makeCustomObjectWith2Children(runtimeScene);

      // doStepPostEvents create a child
      const middleSprite = customObject._instanceContainer.createObject(
        'MySprite'
      );
      middleSprite.setX(32);

      // It refreshes the instance list
      customObject.update(runtimeScene);

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
  });

  it('keeps hit-boxes up to date when new children are added with an action', function () {
    return gdjs.getPixiRuntimeGameWithAssets(extensions).then((runtimeGame) => {
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
      makeCustomObjectWith2Children(runtimeScene);

      // An action of the object create a child.
      const middleSprite = customObject._instanceContainer.createObject(
        'MySprite'
      );
      middleSprite.setX(32);

      // A collision test need the hit-boxes of the parent
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
  });
});
