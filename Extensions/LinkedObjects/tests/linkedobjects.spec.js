// @ts-check
describe('gdjs.LinksManager', function () {
  var runtimeGame = new gdjs.RuntimeGame({
    variables: [],
    // @ts-ignore - missing properties.
    properties: { windowWidth: 800, windowHeight: 600 },
    resources: { resources: [] },
  });
  var runtimeScene = new gdjs.RuntimeScene(runtimeGame);
  runtimeScene.loadFromScene({
    // @ts-ignore - missing properties.
    layers: [{ name: '', visibility: true, effects: [] }],
    variables: [],
    behaviorsSharedData: [],
    objects: [],
    instances: [],
  });

  var manager = gdjs.LinksManager.getManager(runtimeScene);

  // @ts-ignore - missing properties.
  var object1A = new gdjs.RuntimeObject(runtimeScene, {
    name: 'obj1',
    type: '',
    behaviors: [],
    effects: [],
  });
  // @ts-ignore - missing properties.
  var object1B = new gdjs.RuntimeObject(runtimeScene, {
    name: 'obj1',
    type: '',
    behaviors: [],
    effects: [],
  });
  // @ts-ignore - missing properties.
  var object1C = new gdjs.RuntimeObject(runtimeScene, {
    name: 'obj1',
    type: '',
    behaviors: [],
    effects: [],
  });

  // @ts-ignore - missing properties.
  var object2A = new gdjs.RuntimeObject(runtimeScene, {
    name: 'obj2',
    type: '',
    behaviors: [],
    effects: [],
  });

  // @ts-ignore - missing properties.
  var object2B = new gdjs.RuntimeObject(runtimeScene, {
    name: 'obj2',
    type: '',
    behaviors: [],
    effects: [],
  });
  // @ts-ignore - missing properties.
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
    return { pickedSomething, objectsLists };
  };

  runtimeScene.addObject(object1A);
  runtimeScene.addObject(object1B);
  runtimeScene.addObject(object1C);

  runtimeScene.addObject(object2A);
  runtimeScene.addObject(object2B);
  runtimeScene.addObject(object2C);

  it('can link two objects', function () {
    manager.linkObjects(object1A, object2A);
    {
      const { pickedSomething, objectsLists } = pickObjectsLinkedTo(object1A);
      expect(pickedSomething).to.be(true);
      expect(objectsLists.get('obj1').length).to.be(0);
      expect(objectsLists.get('obj2').length).to.be(1);
      expect(objectsLists.get('obj2')[0]).to.be(object2A);
    }
    {
      const { pickedSomething, objectsLists } = pickObjectsLinkedTo(object2A);
      expect(pickedSomething).to.be(true);
      expect(objectsLists.get('obj1').length).to.be(1);
      expect(objectsLists.get('obj1')[0]).to.be(object1A);
      expect(objectsLists.get('obj2').length).to.be(0);
    }
  });
  it('can link more objects', function () {
    manager.linkObjects(object1A, object2A); //Including the same objects as before
    manager.linkObjects(object1A, object2B);
    manager.linkObjects(object1A, object2C);
    {
      const { pickedSomething, objectsLists } = pickObjectsLinkedTo(object1A);
      expect(pickedSomething).to.be(true);
      expect(objectsLists.get('obj1').length).to.be(0);
      expect(objectsLists.get('obj2').length).to.be(3);
    }
    {
      const { pickedSomething, objectsLists } = pickObjectsLinkedTo(object2C);
      expect(pickedSomething).to.be(true);
      expect(objectsLists.get('obj1').length).to.be(1);
      expect(objectsLists.get('obj1')[0]).to.be(object1A);
      expect(objectsLists.get('obj2').length).to.be(0);
    }
  });
  it('supports removing links', function () {
    manager.removeLinkBetween(object1A, object2B);
    {
      const { pickedSomething, objectsLists } = pickObjectsLinkedTo(object1A);
      expect(pickedSomething).to.be(true);
      expect(objectsLists.get('obj1').length).to.be(0);
      expect(objectsLists.get('obj2').length).to.be(2);
    }
    manager.linkObjects(object2B, object2C);
    manager.removeAllLinksOf(object1A);
    manager.removeAllLinksOf(object1A);
    {
      const { pickedSomething, objectsLists } = pickObjectsLinkedTo(object1A);
      expect(pickedSomething).to.be(false);
    }
    {
      const { pickedSomething, objectsLists } = pickObjectsLinkedTo(object2A);
      expect(pickedSomething).to.be(false);
    }
    {
      const { pickedSomething, objectsLists } = pickObjectsLinkedTo(object2C);
      expect(pickedSomething).to.be(true);
      expect(objectsLists.get('obj1').length).to.be(0);
      expect(objectsLists.get('obj2').length).to.be(1);
      expect(objectsLists.get('obj2')[0]).to.be(object2B);
    }
  });
});
