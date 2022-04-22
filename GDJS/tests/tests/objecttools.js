// @ts-check

describe('gdjs.evtTools.object', function () {
  it('can count picked instances of objects', function () {
    const runtimeGame = new gdjs.RuntimeGame({
      variables: [],
      // @ts-ignore TODO: make a function to create an empty game and use it across tests.
      properties: { windowWidth: 800, windowHeight: 600 },
      resources: { resources: [] },
    });
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);

    const objectA1 = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'MyObjectA',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    const objectA2 = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'MyObjectA',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    const objectB1 = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'MyObjectB',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });

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
    const runtimeGame = new gdjs.RuntimeGame({
      variables: [],
      // @ts-ignore TODO: make a function to create an empty game and use it across tests.
      properties: { windowWidth: 800, windowHeight: 600 },
      resources: { resources: [] },
    });
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);

    const objectA1 = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'MyObjectA',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    const objectA2 = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'MyObjectA',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    const objectB1 = new gdjs.TestRuntimeObject(runtimeScene, {
      name: 'MyObjectB',
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });
    runtimeScene.addObject(objectA1);
    runtimeScene.addObject(objectA2);
    runtimeScene.addObject(objectB1);

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
});
