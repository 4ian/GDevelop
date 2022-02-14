// @ts-check
/**
 * Common tests for gdjs game engine.
 * See README.md for more information.
 */

 describe('gdjs.RuntimeObject', () => {
  const runtimeGame = new gdjs.RuntimeGame({
    variables: [],
    // @ts-ignore TODO: make a function to create an empty game and use it across tests.
    properties: { windowWidth: 800, windowHeight: 600 },
    resources: { resources: [] },
  });
  const runtimeScene = new gdjs.RuntimeScene(runtimeGame);

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
    expect(object1.raycastTest(25, 500, 25, 300+19, true).collision).to.be(true);
    expect(object1.raycastTest(25, 500, 25, 300+20, true).collision).to.be(true);
    expect(object1.raycastTest(25, 500, 25, 300+20.1, true).collision).to.be(false);
    expect(object1.raycastTest(25, 500, 25, 300+20.5, true).collision).to.be(false);
    expect(object1.raycastTest(25, 500, 25, 300+21, true).collision).to.be(false);

    // Horizontal raycast, far from the origin:
    object1.setPosition(200, 30);
    expect(object1.raycastTest(500, 35, 190, 35, true).collision).to.be(true);

    // Horizontal raycast, far from the origin, to the edge of the object:
    object1.setPosition(200, 30);
    expect(object1.raycastTest(500, 35, 200+9, 35, true).collision).to.be(true);
    expect(object1.raycastTest(500, 35, 200+10, 35, true).collision).to.be(true);
    expect(object1.raycastTest(500, 35, 200+10.1, 35, true).collision).to.be(false);
    expect(object1.raycastTest(500, 35, 200+10.5, 35, true).collision).to.be(false);
    expect(object1.raycastTest(500, 35, 200+11, 35, true).collision).to.be(false);

    // Raycast not intersecting with the object
    object1.setPosition(20, 30);
    expect(object1.raycastTest(10, 10, 105, 55, true).collision).to.be(false);
  });
});
