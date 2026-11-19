// @ts-check

describe('gdjs.evtTools.object', function () {
  it('can count picked instances of objects', function () {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);

    runtimeScene.registerEmptyObjectWithName('MyObjectA');
    const objectA1 = runtimeScene.createObject('MyObjectA');
    const objectA2 = runtimeScene.createObject('MyObjectA');
    runtimeScene.registerEmptyObjectWithName('MyObjectB');
    const objectB1 = runtimeScene.createObject('MyObjectB');

    expect(
      gdjs.evtTools.object.getPickedInstancesCount(
        Hashtable.newFrom({
          MyObjectA: [objectA1, objectA2],
          MyObjectB: [objectB1],
        })
      )
    ).to.be(3);
    expect(
      gdjs.evtTools.object.getPickedInstancesCount(
        Hashtable.newFrom({
          MyObjectA: [],
          MyObjectB: [],
        })
      )
    ).to.be(0);

    // Also test the deprecated name for this function:
    expect(
      gdjs.evtTools.object.pickedObjectsCount(
        Hashtable.newFrom({
          MyObjectA: [objectA1, objectA2],
          MyObjectB: [objectB1],
        })
      )
    ).to.be(3);
  });

  it('can count instances of objects living on the scene', function () {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);

    runtimeScene.registerEmptyObjectWithName('MyObjectA');
    const objectA1 = runtimeScene.createObject('MyObjectA');
    runtimeScene.createObject('MyObjectA');
    runtimeScene.registerEmptyObjectWithName('MyObjectB');
    const objectB1 = runtimeScene.createObject('MyObjectB');

    expect(
      gdjs.evtTools.object.getSceneInstancesCount(
        runtimeScene,
        Hashtable.newFrom({
          MyObjectA: [objectA1],
          MyObjectB: [objectB1],
        })
      )
    ).to.be(2 + 1);
    expect(
      gdjs.evtTools.object.getSceneInstancesCount(
        runtimeScene,
        Hashtable.newFrom({
          MyObjectA: [objectA1],
          MyObjectB: [],
        })
      )
    ).to.be(2 + 1);
    expect(
      gdjs.evtTools.object.getSceneInstancesCount(
        runtimeScene,
        Hashtable.newFrom({
          MyObjectA: [objectA1],
        })
      )
    ).to.be(2);
    expect(
      gdjs.evtTools.object.getSceneInstancesCount(
        runtimeScene,
        Hashtable.newFrom({
          MyObjectA: [],
        })
      )
    ).to.be(2);
    expect(
      gdjs.evtTools.object.getSceneInstancesCount(
        runtimeScene,
        Hashtable.newFrom({
          MyObjectC: [],
        })
      )
    ).to.be(0);
  });

  const getInstancesIds = (instances) =>
    instances.map((instance) => instance && instance.id);

  it('can create and pick an instance when some instances were not picked', function () {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);

    runtimeScene.registerEmptyObjectWithName('MyObjectA');
    const objectA1 = runtimeScene.createObject('MyObjectA');
    // This instance is not picked.
    runtimeScene.createObject('MyObjectA');

    // 1 of 2 instances are picked.
    const pickedObjectList = Hashtable.newFrom({
      MyObjectA: [objectA1],
    });

    const newObjectA = gdjs.evtTools.object.createObjectOnScene(
      runtimeScene,
      pickedObjectList,
      0,
      0,
      ''
    );

    // The created instance has been added to the picked instances.
    expect(getInstancesIds(pickedObjectList.get('MyObjectA'))).to.eql(
      getInstancesIds([objectA1, newObjectA])
    );
  });

  it('can create and pick an instance when no instance was picked', function () {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);

    runtimeScene.registerEmptyObjectWithName('MyObjectA');
    // These instances are not picked.
    runtimeScene.createObject('MyObjectA');
    runtimeScene.createObject('MyObjectA');

    // 0 of 2 instances are picked.
    const pickedObjectList = Hashtable.newFrom({
      MyObjectA: [],
    });

    const newObjectA = gdjs.evtTools.object.createObjectOnScene(
      runtimeScene,
      pickedObjectList,
      0,
      0,
      ''
    );

    // The created instance has been added to the picked instances.
    expect(getInstancesIds(pickedObjectList.get('MyObjectA'))).to.eql(
      getInstancesIds([newObjectA])
    );
  });

  it('can create an instance and keep all instances picked', function () {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);

    runtimeScene.registerEmptyObjectWithName('MyObjectA');
    const objectA1 = runtimeScene.createObject('MyObjectA');
    const objectA2 = runtimeScene.createObject('MyObjectA');

    // All instances are picked.
    const pickedObjectList = Hashtable.newFrom({
      MyObjectA: [objectA1, objectA2],
    });

    const newObjectA = gdjs.evtTools.object.createObjectOnScene(
      runtimeScene,
      pickedObjectList,
      0,
      0,
      ''
    );

    // All instances are still picked.
    expect(getInstancesIds(pickedObjectList.get('MyObjectA'))).to.eql(
      getInstancesIds([objectA1, objectA2, newObjectA])
    );
  });

  it('can create and pick an instance when some instances of the group were not picked', function () {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);

    runtimeScene.registerEmptyObjectWithName('MyObjectA');
    const objectA1 = runtimeScene.createObject('MyObjectA');
    runtimeScene.registerEmptyObjectWithName('MyObjectB');
    const objectB1 = runtimeScene.createObject('MyObjectB');
    // This instance is not picked.
    runtimeScene.createObject('MyObjectB');

    // 2 of 3 instances are picked.
    const pickedObjectList = Hashtable.newFrom({
      MyObjectA: [objectA1],
      MyObjectB: [objectB1],
    });

    const newObjectA = gdjs.evtTools.object.createObjectOnScene(
      runtimeScene,
      pickedObjectList,
      0,
      0,
      ''
    );

    // The created instance has been added to the picked instances.
    expect(getInstancesIds(pickedObjectList.get('MyObjectA'))).to.eql(
      getInstancesIds([objectA1, newObjectA])
    );
    expect(getInstancesIds(pickedObjectList.get('MyObjectB'))).to.eql(
      getInstancesIds([objectB1])
    );
  });

  it('can create an instance and keep all instances picked for a group', function () {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);

    runtimeScene.registerEmptyObjectWithName('MyObjectA');
    const objectA1 = runtimeScene.createObject('MyObjectA');
    const objectA2 = runtimeScene.createObject('MyObjectA');
    runtimeScene.registerEmptyObjectWithName('MyObjectB');
    const objectB1 = runtimeScene.createObject('MyObjectB');

    // All instances are picked.
    const pickedObjectList = Hashtable.newFrom({
      MyObjectA: [objectA1, objectA2],
      MyObjectB: [objectB1],
    });

    const newObjectA = gdjs.evtTools.object.createObjectOnScene(
      runtimeScene,
      pickedObjectList,
      0,
      0,
      ''
    );

    // All instances are still picked.
    expect(getInstancesIds(pickedObjectList.get('MyObjectA'))).to.eql(
      getInstancesIds([objectA1, objectA2, newObjectA])
    );
    expect(getInstancesIds(pickedObjectList.get('MyObjectB'))).to.eql(
      getInstancesIds([objectB1])
    );
  });
});

describe('gdjs.evtTools.object.hitBoxesCollisionTest', function () {
  /**
   * An object with its hit box partly outside of its size (like a sprite with
   * a custom collision mask larger than its image).
   */
  class ObjectWithHitBoxOutsideOfItsSize extends gdjs.TestRuntimeObject {
    updateHitBoxes() {
      super.updateHitBoxes();
      this.hitBoxes[0].move(this.getWidth() * 0.4, 0);
    }
  }

  /** @param {number} seed */
  const makeSeededRandom = (seed) => {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  /**
   * Objects of various sizes (some huge), positions (some exactly touching
   * each other, a few invalid), angles and hit boxes.
   * @param {gdjs.RuntimeScene} runtimeScene
   * @param {string} name
   * @param {number} count
   * @param {() => number} random
   */
  const createObjects = (runtimeScene, name, count, random) => {
    const objects = [];
    for (let i = 0; i < count; i++) {
      const objectData = {
        name,
        type: '',
        behaviors: [],
        effects: [],
        variables: [],
      };
      const object =
        random() < 0.2
          ? new ObjectWithHitBoxOutsideOfItsSize(runtimeScene, objectData)
          : new gdjs.TestRuntimeObject(runtimeScene, objectData);
      const size = random() < 0.02 ? 2000 : 32;
      object.setCustomWidthAndHeight(size, size);
      if (random() < 0.5) {
        // On a grid of the size of the objects: some objects touch others.
        object.setPosition(
          32 * Math.floor(random() * 30),
          32 * Math.floor(random() * 30)
        );
      } else {
        object.setPosition(random() * 1000 - 100, random() * 1000 - 100);
      }
      if (random() < 0.3) object.setAngle(random() * 360);
      if (random() < 0.1) object.setCustomCenter(0, 0);
      if (random() < 0.005) object.setX(NaN);
      if (random() < 0.01) {
        // Extreme positions, but finite bounds (at opposite corners).
        const extremeX = random() < 0.5 ? 1e308 : -1e308;
        object.setPosition(extremeX, -extremeX);
      }
      if (random() < 0.01) {
        // Far from the others: more grid cells away than 32-bit integers.
        object.setX((random() < 0.5 ? 1 : -1) * 10 ** (10 + 4 * random()));
      }
      objects.push(object);
    }
    return objects;
  };

  /**
   * @param {(objectsLists1: ObjectsLists, objectsLists2: ObjectsLists) => boolean} collisionTest
   * @param {gdjs.RuntimeObject[]} objects1
   * @param {gdjs.RuntimeObject[] | null} objects2 The second objects, or null to test the first objects with themselves.
   */
  const getPickedObjectIds = (collisionTest, objects1, objects2) => {
    const pickedObjects1 = [...objects1];
    const objectsLists1 = Hashtable.newFrom({ Enemy: pickedObjects1 });
    const pickedObjects2 = objects2 ? [...objects2] : pickedObjects1;
    const objectsLists2 = objects2
      ? Hashtable.newFrom({ Bullet: pickedObjects2 })
      : objectsLists1;
    const result = collisionTest(objectsLists1, objectsLists2);
    return {
      result,
      pickedObjectIds1: pickedObjects1.map((object) => object.id),
      pickedObjectIds2: pickedObjects2.map((object) => object.id),
    };
  };

  it('picks the same objects as testing every pair of objects', function () {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    /** @type {Array<[number, number | null]>} The objects counts of each list (null to test the first list with itself). */
    const scenarios = [
      [5, 5],
      [40, 40],
      [300, 300],
      [10, 2000],
      [2000, 10],
      [300, null],
    ];
    for (const seed of [1, 2, 3]) {
      const random = makeSeededRandom(seed);
      for (const [objects1Count, objects2Count] of scenarios) {
        const objects1 = createObjects(
          runtimeScene,
          'Enemy',
          objects1Count,
          random
        );
        const objects2 =
          objects2Count === null
            ? null
            : createObjects(runtimeScene, 'Bullet', objects2Count, random);
        for (const inverted of [false, true]) {
          for (const ignoreTouchingEdges of [false, true]) {
            const expectedPickedObjectIds = getPickedObjectIds(
              (objectsLists1, objectsLists2) =>
                gdjs.evtTools.object.twoListsTest(
                  gdjs.RuntimeObject.collisionTest,
                  objectsLists1,
                  objectsLists2,
                  inverted,
                  ignoreTouchingEdges
                ),
              objects1,
              objects2
            );
            const pickedObjectIds = getPickedObjectIds(
              (objectsLists1, objectsLists2) =>
                gdjs.evtTools.object.hitBoxesCollisionTest(
                  objectsLists1,
                  objectsLists2,
                  inverted,
                  runtimeScene,
                  ignoreTouchingEdges
                ),
              objects1,
              objects2
            );
            expect(pickedObjectIds).to.eql(expectedPickedObjectIds);
            if (!inverted && objects1Count > 5) {
              // Ensure the scenarios using a grid are not trivial.
              expect(expectedPickedObjectIds.result).to.be(true);
            }
          }
        }
      }
    }
  });
});
