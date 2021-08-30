// @ts-check
describe('gdjs.LinksManager', function () {
  var runtimeGame = new gdjs.RuntimeGame({
    variables: [],
    properties: { windowWidth: 800, windowHeight: 600 },
    resources: { resources: [] },
  });
  var runtimeScene = new gdjs.RuntimeScene(runtimeGame);
  runtimeScene.loadFromScene({
    layers: [{ name: '', visibility: true, effects: [] }],
    variables: [],
    behaviorsSharedData: [],
    objects: [],
    instances: [],
  });

  var manager = gdjs.LinksManager.getManager(runtimeScene);

  var object1A = new gdjs.RuntimeObject(runtimeScene, {
    name: 'obj1',
    type: '',
    behaviors: [],
    effects: [],
  });
  var object1B = new gdjs.RuntimeObject(runtimeScene, {
    name: 'obj1',
    type: '',
    behaviors: [],
    effects: [],
  });
  var object1C = new gdjs.RuntimeObject(runtimeScene, {
    name: 'obj1',
    type: '',
    behaviors: [],
    effects: [],
  });

  var object2A = new gdjs.RuntimeObject(runtimeScene, {
    name: 'obj2',
    type: '',
    behaviors: [],
    effects: [],
  });
  var object2B = new gdjs.RuntimeObject(runtimeScene, {
    name: 'obj2',
    type: '',
    behaviors: [],
    effects: [],
  });
  var object2C = new gdjs.RuntimeObject(runtimeScene, {
    name: 'obj2',
    type: '',
    behaviors: [],
    effects: [],
  });

  var pickObjectsLinkedTo = (object) => {
    const objectsLists = new Hashtable();
    objectsLists.put('obj1', [object1A, object1B, object1C]);
    objectsLists.put('obj2', [object2A, object2B, object2C]);
    const pickedSomething = gdjs.evtTools.linkedObjects.pickObjectsLinkedTo(
      runtimeScene,
      objectsLists,
      object
    );
    return pickedSomething ? objectsLists : false;
  };

  runtimeScene.addObject(object1A);
  runtimeScene.addObject(object1B);
  runtimeScene.addObject(object1C);

  runtimeScene.addObject(object2A);
  runtimeScene.addObject(object2B);
  runtimeScene.addObject(object2C);

  it('can link two objects', function () {
    manager.linkObjects(object1A, object2A);

    let objectsLists = pickObjectsLinkedTo(object1A);
    expect(objectsLists.get('obj1').length).to.be(3);
    expect(objectsLists.get('obj2').length).to.be(1);
    expect(objectsLists.get('obj2')[0]).to.be(object2A);

    objectsLists = pickObjectsLinkedTo(object2A);
    expect(objectsLists.get('obj1').length).to.be(1);
    expect(objectsLists.get('obj1')[0]).to.be(object1A);
    expect(objectsLists.get('obj2').length).to.be(3);
  });
  it('can link more objects', function () {
    manager.linkObjects(object1A, object2A); //Including the same objects as before
    manager.linkObjects(object1A, object2B);
    manager.linkObjects(object1A, object2C);

    let objectsLists = pickObjectsLinkedTo(object1A);
    expect(objectsLists.get('obj1').length).to.be(3);
    expect(objectsLists.get('obj2').length).to.be(3);

    objectsLists = pickObjectsLinkedTo(object2C);
    expect(objectsLists.get('obj1').length).to.be(1);
    expect(objectsLists.get('obj1')[0]).to.be(object1A);
    expect(objectsLists.get('obj2').length).to.be(3);
  });
  it('supports removing links', function () {
    manager.removeLinkBetween(object1A, object2B);

    let objectsLists = pickObjectsLinkedTo(object1A);
    expect(objectsLists.get('obj1').length).to.be(3);
    expect(objectsLists.get('obj2').length).to.be(2);

    manager.linkObjects(object2B, object2C);
    manager.removeAllLinksOf(object1A);
    manager.removeAllLinksOf(object1A);

    objectsLists = pickObjectsLinkedTo(object1A);
    expect(objectsLists).to.be(false);

    objectsLists = pickObjectsLinkedTo(object2A);
    expect(objectsLists).to.be(false);

    objectsLists = pickObjectsLinkedTo(object2C);
    expect(objectsLists.get('obj1').length).to.be(0);
    expect(objectsLists.get('obj2').length).to.be(1);
    expect(objectsLists.get('obj2')[0]).to.be(object2B);
  });
});
