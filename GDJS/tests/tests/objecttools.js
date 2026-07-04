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

  const makeCollisionObjects = (runtimeScene) => {
    const objectA = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'ObjectA',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    objectA.setCustomWidthAndHeight(10, 10);
    objectA.setCustomCenter(0, 0);

    const objectB = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'ObjectB',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    objectB.setCustomWidthAndHeight(10, 10);
    objectB.setCustomCenter(0, 0);

    return { objectA, objectB };
  };

  const makeCollisionObjectLists = (objectA, objectB) => ({
    objectsListsA: Hashtable.newFrom({
      ObjectA: [objectA],
    }),
    objectsListsB: Hashtable.newFrom({
      ObjectB: [objectB],
    }),
  });

  const runCollisionEnterCondition = (runtimeScene, objectA, objectB) => {
    /** @type {boolean} */
    let result = false;
    /** @type {gdjs.RuntimeObject[]} */
    let pickedObjectsA = [];
    /** @type {gdjs.RuntimeObject[]} */
    let pickedObjectsB = [];
    runtimeScene.renderAndStepWithEventsFunction(1000 / 60, () => {
      const { objectsListsA, objectsListsB } = makeCollisionObjectLists(
        objectA,
        objectB
      );
      result = gdjs.evtTools.object.hitBoxesCollisionEnterTest(
        objectsListsA,
        objectsListsB,
        false,
        runtimeScene,
        1,
        false
      );
      pickedObjectsA = objectsListsA.get('ObjectA').slice();
      pickedObjectsB = objectsListsB.get('ObjectB').slice();
    });

    return { result, pickedObjectsA, pickedObjectsB };
  };

  const runCollisionExitCondition = (runtimeScene, objectA, objectB) => {
    /** @type {boolean} */
    let result = false;
    /** @type {gdjs.RuntimeObject[]} */
    let pickedObjectsA = [];
    /** @type {gdjs.RuntimeObject[]} */
    let pickedObjectsB = [];
    runtimeScene.renderAndStepWithEventsFunction(1000 / 60, () => {
      const { objectsListsA, objectsListsB } = makeCollisionObjectLists(
        objectA,
        objectB
      );
      result = gdjs.evtTools.object.hitBoxesCollisionExitTest(
        objectsListsA,
        objectsListsB,
        false,
        runtimeScene,
        2,
        false
      );
      pickedObjectsA = objectsListsA.get('ObjectA').slice();
      pickedObjectsB = objectsListsB.get('ObjectB').slice();
    });

    return { result, pickedObjectsA, pickedObjectsB };
  };

  it('can detect collision enter', function () {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    const { objectA, objectB } = makeCollisionObjects(runtimeScene);

    objectB.setPosition(20, 0);
    expect(
      runCollisionEnterCondition(runtimeScene, objectA, objectB).result
    ).to.be(false);

    objectB.setPosition(0, 0);
    const enteringCollision = runCollisionEnterCondition(
      runtimeScene,
      objectA,
      objectB
    );
    expect(enteringCollision.result).to.be(true);
    expect(getInstancesIds(enteringCollision.pickedObjectsA)).to.eql(
      getInstancesIds([objectA])
    );
    expect(getInstancesIds(enteringCollision.pickedObjectsB)).to.eql(
      getInstancesIds([objectB])
    );

    expect(
      runCollisionEnterCondition(runtimeScene, objectA, objectB).result
    ).to.be(false);
  });

  it('can detect collision exit', function () {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    const { objectA, objectB } = makeCollisionObjects(runtimeScene);

    objectB.setPosition(0, 0);
    expect(
      runCollisionExitCondition(runtimeScene, objectA, objectB).result
    ).to.be(false);

    objectB.setPosition(20, 0);
    const exitingCollision = runCollisionExitCondition(
      runtimeScene,
      objectA,
      objectB
    );
    expect(exitingCollision.result).to.be(true);
    expect(getInstancesIds(exitingCollision.pickedObjectsA)).to.eql(
      getInstancesIds([objectA])
    );
    expect(getInstancesIds(exitingCollision.pickedObjectsB)).to.eql(
      getInstancesIds([objectB])
    );

    expect(
      runCollisionExitCondition(runtimeScene, objectA, objectB).result
    ).to.be(false);
  });

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

  it('calls onPlacedInScene after creating and placing an object', function () {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    runtimeScene.addLayer({
      name: 'Ui',
      visibility: true,
      cameras: [],
      effects: [],
      ambientLightColorR: 0,
      ambientLightColorG: 0,
      ambientLightColorB: 0,
      isLightingLayer: false,
      followBaseLayerCamera: false,
    });

    runtimeScene.registerObject({
      name: 'MyObjectA',
      type: '',
      behaviors: [
        {
          name: 'TestBehavior',
          type: 'TestBehavior::TestBehavior',
        },
      ],
      variables: [],
      effects: [],
    });

    const pickedObjectList = Hashtable.newFrom({
      MyObjectA: [],
    });

    const newObjectA = gdjs.evtTools.object.createObjectOnScene(
      runtimeScene,
      pickedObjectList,
      50,
      60,
      'Ui'
    );
    if (!newObjectA) {
      throw new Error('Object was not created.');
    }

    expect(newObjectA.getVariables().get('lastState').getAsString()).to.be(
      'placed'
    );
    expect(newObjectA.getVariables().get('placedCount').getAsNumber()).to.be(1);
    expect(newObjectA.getVariables().get('placedX').getAsNumber()).to.be(50);
    expect(newObjectA.getVariables().get('placedY').getAsNumber()).to.be(60);
    expect(newObjectA.getVariables().get('placedLayer').getAsString()).to.be(
      'Ui'
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
