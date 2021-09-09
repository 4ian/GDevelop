// @ts-check
describe('gdjs.LinksManager', function () {
  const doTest = (
    caseName,
    object1Names,
    object2Names,
    eventsFunctionContext,
    legacy
  ) => {
    const runtimeGame = new gdjs.RuntimeGame({
      variables: [],
      // @ts-ignore - missing properties.
      properties: { windowWidth: 800, windowHeight: 600 },
      resources: { resources: [] },
    });
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
      // @ts-ignore - missing properties.
      layers: [{ name: '', visibility: true, effects: [] }],
      variables: [],
      behaviorsSharedData: [],
      objects: [],
      instances: [],
    });

    const manager = gdjs.LinksManager.getManager(runtimeScene);

    // @ts-ignore - missing properties.
    const object1A = new gdjs.RuntimeObject(runtimeScene, {
      name: object1Names[0],
      type: '',
      behaviors: [],
      effects: [],
    });
    // @ts-ignore - missing properties.
    const object1B = new gdjs.RuntimeObject(runtimeScene, {
      name: object1Names[1],
      type: '',
      behaviors: [],
      effects: [],
    });
    // @ts-ignore - missing properties.
    const object1C = new gdjs.RuntimeObject(runtimeScene, {
      name: object1Names[2],
      type: '',
      behaviors: [],
      effects: [],
    });

    // @ts-ignore - missing properties.
    const object2A = new gdjs.RuntimeObject(runtimeScene, {
      name: object2Names[0],
      type: '',
      behaviors: [],
      effects: [],
    });

    // @ts-ignore - missing properties.
    const object2B = new gdjs.RuntimeObject(runtimeScene, {
      name: object2Names[1],
      type: '',
      behaviors: [],
      effects: [],
    });
    // @ts-ignore - missing properties.
    const object2C = new gdjs.RuntimeObject(runtimeScene, {
      name: object2Names[2],
      type: '',
      behaviors: [],
      effects: [],
    });

    const pickObjectsLinkedTo = (object) => {
      const objectsLists = new Hashtable();
      objectsLists.put('obj1', [object1A, object1B, object1C]);
      objectsLists.put('obj2', [object2A, object2B, object2C]);
      let pickedSomething = false;
      if (legacy) {
        pickedSomething = gdjs.evtTools.linkedObjects.pickObjectsLinkedTo(
          runtimeScene,
          objectsLists,
          object
        );
      } else {
        pickedSomething = gdjs.evtTools.linkedObjects.quickPickObjectsLinkedTo(
          runtimeScene,
          eventsFunctionContext,
          objectsLists,
          object
        );
      }
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
  };

  [
    {
      caseName: 'scene',
      // Called from a scene, no event function context.
      eventsFunctionContext: null,
      object1Names: ['obj1', 'obj1', 'obj1'],
      object2Names: ['obj2', 'obj2', 'obj2'],
    },
    // In event functions, the names in the ObjectList are different than
    // the names of the objects from that list.
    {
      caseName: 'extension',
      // The implementation only check it exists.
      eventsFunctionContext: {},
      object1Names: ['SceneObj1', 'SceneObj1', 'SceneObj1'],
      object2Names: ['SceneObj2', 'SceneObj2', 'SceneObj2'],
    },
    // When groups are passed in parameters, the lists can even contains
    // objects with different names.
    {
      caseName: 'extension with groups',
      // The implementation only check it exists.
      eventsFunctionContext: {},
      object1Names: ['SceneObj1', 'SceneObj1p', 'SceneObj1p'],
      object2Names: ['SceneObj2p', 'SceneObj2p', 'SceneObj2'],
    },
  ].forEach((testCase) => {
    describe(testCase.caseName, function () {
      [true, false].forEach((legacy) => {
        describe(legacy ? '(legacy)' : '(quick)', function () {
          doTest(
            testCase.caseName,
            testCase.object1Names,
            testCase.object2Names,
            testCase.eventsFunctionContext,
            legacy
          );
        });
      });
    });
  });
});
