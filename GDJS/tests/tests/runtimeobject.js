// @ts-check
/**
 * Common tests for gdjs game engine.
 * See README.md for more information.
 */

describe('gdjs.RuntimeObject', () => {
  /** @type {gdjs.RuntimeGame} */
  let runtimeGame;
  /** @type {gdjs.TestRuntimeScene} */
  let runtimeScene;
  beforeEach(function () {
    runtimeGame = gdjs.getPixiRuntimeGame();
    runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
  });

  it('should compute distances properly', () => {
    const object = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    object.setPosition(15, 20);

    expect(object.getSqDistanceToPosition(-110, 200)).to.be(48025);
  });

  it('should compute angles properly', () => {
    const object = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    object.setPosition(15, 20);

    expect(object.getAngleToPosition(-110, 200)).to.be(124.77783136636388);
  });

  it('should compute AABB properly', () => {
    const object = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    object.setCustomWidthAndHeight(10, 20);

    expect(object.getAABB()).to.eql({
      min: [0, 0],
      max: [10, 20],
    });

    // Verify the shortcut functions too:
    expect(object.getAABBLeft()).to.be(0);
    expect(object.getAABBTop()).to.be(0);
    expect(object.getAABBRight()).to.be(10);
    expect(object.getAABBBottom()).to.be(20);
    expect(object.getAABBCenterX()).to.be(5);
    expect(object.getAABBCenterY()).to.be(10);

    object.setPosition(15, 20);
    expect(object.getAABB()).to.eql({
      min: [15, 20],
      max: [25, 40],
    });

    object.setAngle(90);
    expect(object.getAABB()).to.eql({
      min: [10, 25],
      max: [30, 35],
    });

    object.setAngle(0);
    object.setCustomCenter(0, 0);
    expect(object.getAABB()).to.eql({
      min: [15, 20],
      max: [25, 40],
    });

    object.setPosition(15, 20);
    object.setAngle(90);
    expect(object.getAABB()).to.eql({
      min: [-5, 20],
      max: [15, 30],
    });

    // Verify the shortcut functions again too:
    expect(object.getAABBLeft()).to.be(-5);
    expect(object.getAABBTop()).to.be(20);
    expect(object.getAABBRight()).to.be(15);
    expect(object.getAABBBottom()).to.be(30);
    expect(object.getAABBCenterX()).to.be(5);
    expect(object.getAABBCenterY()).to.be(25);
  });

  it('handles collision', () => {
    const object1 = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    object1.setCustomWidthAndHeight(10, 20);
    object1.setCustomCenter(0, 0);

    const object2 = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    object2.setCustomWidthAndHeight(10, 20);
    object2.setCustomCenter(0, 0);

    // Overlapping objects.
    expect(gdjs.RuntimeObject.collisionTest(object1, object2, false)).to.be(
      true
    );

    // Edge-touching objects.
    object2.setPosition(10, 0); // Move object2 to be to the right of object1.
    expect(gdjs.RuntimeObject.collisionTest(object1, object2, false)).to.be(
      true
    );
    expect(gdjs.RuntimeObject.collisionTest(object1, object2, true)).to.be(
      false
    );
    object2.setPosition(10, 6); // Move object2 to be to the right of object1, slightly under it but still edge touching.
    expect(gdjs.RuntimeObject.collisionTest(object1, object2, false)).to.be(
      true
    );
    expect(gdjs.RuntimeObject.collisionTest(object1, object2, true)).to.be(
      false
    );

    // Rotated objects.
    object2.setPosition(10, 0);
    object1.setAngle(45); // Set both objects to be rotated
    object2.setAngle(45);
    expect(gdjs.RuntimeObject.collisionTest(object1, object2, false)).to.be(
      true
    );
    expect(gdjs.RuntimeObject.collisionTest(object1, object2, true)).to.be(
      true
    );
    object2.setPosition(10, 6); // Move object 2 to be slightly under object 1. They are not touching anymore then, because they are rotated.
    expect(gdjs.RuntimeObject.collisionTest(object1, object2, false)).to.be(
      false
    );
    expect(gdjs.RuntimeObject.collisionTest(object1, object2, true)).to.be(
      false
    );

    // Objects not even close.
    object2.setPosition(20, 0);
    expect(gdjs.RuntimeObject.collisionTest(object1, object2, false)).to.be(
      false
    );
    expect(gdjs.RuntimeObject.collisionTest(object1, object2, false)).to.be(
      false
    );
  });

  it('handles raycast', () => {
    const object1 = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    object1.setCustomWidthAndHeight(10, 20);
    object1.setCustomCenter(10, 10);

    // Raycast of length 0:
    object1.setPosition(20, 30);
    expect(object1.raycastTest(10, 10, 10, 10, true).collision).to.be(false);

    // Raycast too short:
    object1.setPosition(20, 30);
    expect(object1.raycastTest(10, 10, 15, 15, true).collision).to.be(false);

    // Raycast inside the object:
    object1.setPosition(20, 30);
    expect(object1.raycastTest(10, 10, 25, 35, true)).to.eql({
      collision: true,
      closeX: 22,
      closeY: 30,
      closeSqDist: 544,
      farX: 22,
      farY: 30,
      farSqDist: 544,
    });

    // Raycast beyond the object, still colliding with it:
    object1.setPosition(20, 30);
    expect(object1.raycastTest(10, 10, 55, 55, true)).to.eql({
      collision: true,
      closeX: 30,
      closeY: 30,
      closeSqDist: 800,
      farX: 30,
      farY: 30,
      farSqDist: 800,
    });

    // Raycast with an end point far beyond the object, still colliding with it:
    object1.setPosition(20, 30);
    expect(object1.raycastTest(10, 10, 5000, 5000, true)).to.eql({
      collision: true,
      closeX: 30,
      closeY: 30,
      closeSqDist: 800,
      farX: 30,
      farY: 30,
      farSqDist: 800,
    });

    // Vertical raycast, far from the origin:
    object1.setPosition(20, 300);
    expect(object1.raycastTest(25, 500, 25, 250, true).collision).to.be(true);

    // Vertical raycast, far from the origin, to the edge of the object:
    object1.setPosition(20, 300);
    expect(object1.raycastTest(25, 500, 25, 300 + 19, true).collision).to.be(
      true
    );
    expect(object1.raycastTest(25, 500, 25, 300 + 20, true).collision).to.be(
      true
    );
    expect(object1.raycastTest(25, 500, 25, 300 + 20.1, true).collision).to.be(
      false
    );
    expect(object1.raycastTest(25, 500, 25, 300 + 20.5, true).collision).to.be(
      false
    );
    expect(object1.raycastTest(25, 500, 25, 300 + 21, true).collision).to.be(
      false
    );

    // Horizontal raycast, far from the origin:
    object1.setPosition(200, 30);
    expect(object1.raycastTest(500, 35, 190, 35, true).collision).to.be(true);

    // Horizontal raycast, far from the origin, to the edge of the object:
    object1.setPosition(200, 30);
    expect(object1.raycastTest(500, 35, 200 + 9, 35, true).collision).to.be(
      true
    );
    expect(object1.raycastTest(500, 35, 200 + 10, 35, true).collision).to.be(
      true
    );
    expect(object1.raycastTest(500, 35, 200 + 10.1, 35, true).collision).to.be(
      false
    );
    expect(object1.raycastTest(500, 35, 200 + 10.5, 35, true).collision).to.be(
      false
    );
    expect(object1.raycastTest(500, 35, 200 + 11, 35, true).collision).to.be(
      false
    );

    // Raycast not intersecting with the object
    object1.setPosition(20, 30);
    expect(object1.raycastTest(10, 10, 105, 55, true).collision).to.be(false);
  });

  it('handles raycast (object with multiple hitboxes)', () => {
    const objectWithTwoHitboxes = new gdjs.TestSpriteRuntimeObject(
      runtimeScene,
      {
        name: 'objectWithTwoHitboxes',
        type: '',
        behaviors: [],
        effects: [],
        animations: [
          {
            name: 'animation',
            directions: [
              {
                sprites: [
                  {
                    originPoint: { x: 0, y: 0 },
                    centerPoint: { x: 50, y: 50 },
                    points: [
                      { name: 'Center', x: 0, y: 0 },
                      { name: 'Origin', x: 50, y: 50 },
                    ],
                    hasCustomCollisionMask: true,
                    customCollisionMask: [
                      [
                        { x: 75, y: 100 },
                        { x: 0, y: 100 },
                        { x: 0, y: 25 },
                      ],
                      [
                        { x: 25, y: 0 },
                        { x: 100, y: 75 },
                        { x: 100, y: 0 },
                      ],
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }
    );
    runtimeScene.addObject(objectWithTwoHitboxes);
    objectWithTwoHitboxes.setUnscaledWidthAndHeight(100, 100);
    objectWithTwoHitboxes.setCustomWidthAndHeight(100, 100);

    // Ray going through the "tunnel" left by the two triangle hitboxes:
    objectWithTwoHitboxes.setPosition(0, 0);
    expect(
      objectWithTwoHitboxes.raycastTest(0, 0, 300, 300, true).collision
    ).to.be(false);
    expect(
      objectWithTwoHitboxes.raycastTest(0, 10, 300, 300 + 10, true).collision
    ).to.be(false);
    expect(
      objectWithTwoHitboxes.raycastTest(10, 0, 300 + 10, 300, true).collision
    ).to.be(false);

    const rayCastFromCenterToRightResult = objectWithTwoHitboxes.raycastTest(
      50,
      50,
      300,
      50,
      true
    );
    expect(rayCastFromCenterToRightResult.collision).to.be(true);
    expect(rayCastFromCenterToRightResult.closeX).to.be(75);
    expect(rayCastFromCenterToRightResult.closeY).to.be(50);

    const rayCastFromCenterToRightFarResult = objectWithTwoHitboxes.raycastTest(
      50,
      50,
      300,
      50,
      false
    );
    expect(rayCastFromCenterToRightFarResult.collision).to.be(true);
    expect(rayCastFromCenterToRightFarResult.farX).to.be(100);
    expect(rayCastFromCenterToRightFarResult.farY).to.be(50);

    const rayCastFromCenterToLeftResult = objectWithTwoHitboxes.raycastTest(
      50,
      50,
      -300,
      50,
      true
    );
    expect(rayCastFromCenterToLeftResult.collision).to.be(true);
    expect(rayCastFromCenterToLeftResult.closeX).to.be(25);
    expect(rayCastFromCenterToLeftResult.closeY).to.be(50);

    const rayCastFromCenterToLeftFarResult = objectWithTwoHitboxes.raycastTest(
      50,
      50,
      -300,
      50,
      true
    );
    expect(rayCastFromCenterToLeftFarResult.collision).to.be(true);
    expect(rayCastFromCenterToLeftFarResult.farX).to.be(0);
    expect(rayCastFromCenterToLeftFarResult.farY).to.be(50);

    const rayCastFromMiddleTopResult = objectWithTwoHitboxes.raycastTest(
      50,
      -20,
      50,
      300,
      true
    );
    expect(rayCastFromMiddleTopResult.collision).to.be(true);
    expect(rayCastFromMiddleTopResult.closeX).to.be(50);
    expect(rayCastFromMiddleTopResult.closeY).to.be(0);

    const rayCastFromMiddleTopFarResult = objectWithTwoHitboxes.raycastTest(
      50,
      -20,
      50,
      300,
      false
    );
    expect(rayCastFromMiddleTopFarResult.collision).to.be(true);
    expect(rayCastFromMiddleTopFarResult.farX).to.be(50);
    expect(rayCastFromMiddleTopFarResult.farY).to.be(100);

    const rayCastFromMiddleLeftResult = objectWithTwoHitboxes.raycastTest(
      -20,
      50,
      300,
      50,
      true
    );
    expect(rayCastFromMiddleLeftResult.collision).to.be(true);
    expect(rayCastFromMiddleLeftResult.closeX).to.be(0);
    expect(rayCastFromMiddleLeftResult.closeY).to.be(50);

    const rayCastFromMiddleLeftFarResult = objectWithTwoHitboxes.raycastTest(
      -20,
      50,
      300,
      50,
      false
    );
    expect(rayCastFromMiddleLeftFarResult.collision).to.be(true);
    expect(rayCastFromMiddleLeftFarResult.farX).to.be(100);
    expect(rayCastFromMiddleLeftFarResult.farY).to.be(50);
  });

  it('can be moved with a permanent force', () => {
    const object = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    runtimeScene.addObject(object);
    object.setPosition(15, 20);

    object.addForce(100, 40, 1);

    expect(object.getX()).to.be(15);
    expect(object.getY()).to.be(20);

    for (let index = 0; index < 15; index++) {
      const oldX = object.getX();
      const oldY = object.getY();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getX()).to.above(oldX);
      expect(object.getY()).to.above(oldY);
    }
    expect(object.getX()).to.be(15 + 100 / 4);
    expect(object.getY()).to.be(20 + 40 / 4 + 0.000000000000018);
  });

  it('can be moved with 2 permanent forces', () => {
    const object = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    runtimeScene.addObject(object);
    object.setPosition(15, 20);

    object.addForce(75, 10, 1);
    object.addForce(25, 30, 1);

    expect(object.getX()).to.be(15);
    expect(object.getY()).to.be(20);

    for (let index = 0; index < 15; index++) {
      const oldX = object.getX();
      const oldY = object.getY();
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getX()).to.above(oldX);
      expect(object.getY()).to.above(oldY);
    }
    expect(object.getX()).to.be(15 + 100 / 4);
    expect(object.getY()).to.be(20 + 40 / 4 + 0.000000000000018);
  });

  it('can be moved with an instant force', () => {
    const object = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    runtimeScene.addObject(object);
    object.setPosition(15, 20);

    for (let index = 0; index < 15; index++) {
      const oldX = object.getX();
      const oldY = object.getY();
      object.addForce(100, 40, 0);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getX()).to.above(oldX);
      expect(object.getY()).to.above(oldY);
    }
    expect(object.getX()).to.be(15 + 100 / 4);
    expect(object.getY()).to.be(20 + 40 / 4 + 0.000000000000018);

    // The object no longer moves.
    runtimeScene.renderAndStep(1000 / 60);
    expect(object.getX()).to.be(15 + 100 / 4);
    expect(object.getY()).to.be(20 + 40 / 4 + 0.000000000000018);
  });

  it('can be moved with 2 instant forces', () => {
    const object = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    runtimeScene.addObject(object);
    object.setPosition(15, 20);

    for (let index = 0; index < 15; index++) {
      const oldX = object.getX();
      const oldY = object.getY();
      object.addForce(75, 10, 0);
      object.addForce(25, 30, 0);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getX()).to.above(oldX);
      expect(object.getY()).to.above(oldY);
    }
    expect(object.getX()).to.be(15 + 100 / 4);
    expect(object.getY()).to.be(20 + 40 / 4 + 0.000000000000018);

    // The object no longer moves.
    runtimeScene.renderAndStep(1000 / 60);
    expect(object.getX()).to.be(15 + 100 / 4);
    expect(object.getY()).to.be(20 + 40 / 4 + 0.000000000000018);
  });

  it('can be moved with permanent and instant forces', () => {
    const object = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    runtimeScene.addObject(object);
    object.setPosition(15, 20);

    object.addForce(75, 10, 1);

    for (let index = 0; index < 15; index++) {
      const oldX = object.getX();
      const oldY = object.getY();
      object.addForce(25, 30, 0);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getX()).to.above(oldX);
      expect(object.getY()).to.above(oldY);
    }
    expect(object.getX()).to.be(15 + 100 / 4);
    expect(object.getY()).to.be(20 + 40 / 4 + 0.000000000000018);
  });

  it('can clear forces', () => {
    const object = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    runtimeScene.addObject(object);
    object.setPosition(15, 20);

    object.addForce(75, 10, 1);
    object.addForce(25, 30, 0);
    object.addForce(75, 10, 0);
    object.addForce(25, 30, 1);
    object.clearForces();

    runtimeScene.renderAndStep(1000 / 60);
    expect(object.getX()).to.be(15);
    expect(object.getY()).to.be(20);
  });
});
