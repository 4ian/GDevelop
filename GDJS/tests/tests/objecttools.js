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
