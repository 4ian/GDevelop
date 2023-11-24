// @ts-check
describe('gdjs.LinksManager', function () {
  const doTest = (
    object1Names,
    object2Names,
    object3Names,
    eventsFunctionContext
  ) => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
      layers: [
        {
          name: '',
          visibility: true,
          cameras: [],
          effects: [],
          ambientLightColorR: 127,
          ambientLightColorB: 127,
          ambientLightColorG: 127,
          isLightingLayer: false,
          followBaseLayerCamera: false,
        },
      ],
      variables: [],
      behaviorsSharedData: [],
      objects: [],
      instances: [],
      r: 0,
      v: 0,
      b: 0,
      mangledName: 'Scene1',
      name: 'Scene1',
      stopSoundsOnStartup: false,
      title: '',
      usedResources: [],
    });

    const manager = gdjs.LinksManager.getManager(runtimeScene);

    const object1A = new gdjs.RuntimeObject(runtimeScene, {
      name: object1Names[0],
      type: '',
      behaviors: [],
      variables: [],
      effects: [],
    });
    const object1B = new gdjs.RuntimeObject(runtimeScene, {
      name: object1Names[1],
      type: '',
      behaviors: [],
      variables: [],
      effects: [],
    });

    const object1C = new gdjs.RuntimeObject(runtimeScene, {
      name: object1Names[2],
      type: '',
      behaviors: [],
      variables: [],
      effects: [],
    });

    const object2A = new gdjs.RuntimeObject(runtimeScene, {
      name: object2Names[0],
      type: '',
      behaviors: [],
      variables: [],
      effects: [],
    });

    const object2B = new gdjs.RuntimeObject(runtimeScene, {
      name: object2Names[1],
      type: '',
      behaviors: [],
      variables: [],
      effects: [],
    });

    const object2C = new gdjs.RuntimeObject(runtimeScene, {
      name: object2Names[2],
      type: '',
      behaviors: [],
      variables: [],
      effects: [],
    });

    const object3A = new gdjs.RuntimeObject(runtimeScene, {
      name: object3Names[0],
      type: '',
      behaviors: [],
      variables: [],
      effects: [],
    });

    const object3B = new gdjs.RuntimeObject(runtimeScene, {
      name: object3Names[1],
      type: '',
      behaviors: [],
      variables: [],
      effects: [],
    });

    const object3C = new gdjs.RuntimeObject(runtimeScene, {
      name: object3Names[2],
      type: '',
      behaviors: [],
      variables: [],
      effects: [],
    });

    runtimeScene.addObject(object1A);
    runtimeScene.addObject(object1B);
    runtimeScene.addObject(object1C);

    runtimeScene.addObject(object2A);
    runtimeScene.addObject(object2B);
    runtimeScene.addObject(object2C);

    runtimeScene.addObject(object3A);
    runtimeScene.addObject(object3B);
    runtimeScene.addObject(object3C);

    /**
     * @param {gdjs.RuntimeObject} object
     * @param {Hashtable<gdjs.RuntimeObject[]>} objectsLists
     * @returns a selection of picked objects
     */
    const pickObjectsLinkedTo = (object, objectsLists) => {
      let pickedSomething = gdjs.evtTools.linkedObjects.pickObjectsLinkedTo(
        runtimeScene,
        objectsLists,
        object,
        eventsFunctionContext
      );
      return { pickedSomething, objectsLists };
    };

    it('can link two objects', function () {
      manager.linkObjects(object1A, object2A);
      {
        const { pickedSomething, objectsLists } = pickObjectsLinkedTo(
          object1A,
          Hashtable.newFrom({ obj2: [object2A, object2B, object2C] })
        );
        expect(pickedSomething).to.be(true);
        expect(objectsLists.get('obj2').length).to.be(1);
        expect(objectsLists.get('obj2')[0]).to.be(object2A);
      }
      {
        const { pickedSomething, objectsLists } = pickObjectsLinkedTo(
          object2A,
          Hashtable.newFrom({ obj1: [object1A, object1B, object1C] })
        );
        expect(pickedSomething).to.be(true);
        expect(objectsLists.get('obj1').length).to.be(1);
        expect(objectsLists.get('obj1')[0]).to.be(object1A);
      }
    });
    it('can select from already picked objects', function () {
      manager.linkObjects(object1A, object2B);
      // object1A <--> object2A, object2B
      {
        const { pickedSomething, objectsLists } = pickObjectsLinkedTo(
          object1A,
          // object2B was discarded from a parent condition
          Hashtable.newFrom({ obj2: [object2A, object2C] })
        );
        expect(pickedSomething).to.be(true);
        expect(objectsLists.get('obj2').length).to.be(1);
        expect(objectsLists.get('obj2')[0]).to.be(object2A);
      }
    });
    // This is a local group. In an event function context,
    // it can groups objects that are flatten scene groups.
    it('can select from a group', function () {
      manager.linkObjects(object1A, object3C);
      // object1A <--> object2A, object2B, object3C
      {
        const { pickedSomething, objectsLists } = pickObjectsLinkedTo(
          object1A,
          // This is a group of obj2 and obj3.
          Hashtable.newFrom({
            obj2: [object2A, object2B, object2C],
            obj3: [object3A, object3B, object3C],
          })
        );
        expect(pickedSomething).to.be(true);
        expect(objectsLists.get('obj2').length).to.be(2);
        expect(objectsLists.get('obj2')).to.contain(object2A);
        expect(objectsLists.get('obj2')).to.contain(object2B);
        expect(objectsLists.get('obj3').length).to.be(1);
        expect(objectsLists.get('obj3')[0]).to.be(object3C);
      }
    });
    it('can link more objects', function () {
      // Including the same objects as before
      manager.linkObjects(object1A, object2A);
      manager.linkObjects(object1A, object2B);
      manager.linkObjects(object1A, object2C);
      {
        const { pickedSomething, objectsLists } = pickObjectsLinkedTo(
          object1A,
          Hashtable.newFrom({ obj2: [object2A, object2B, object2C] })
        );
        expect(pickedSomething).to.be(true);
        expect(objectsLists.get('obj2').length).to.be(3);
        expect(objectsLists.get('obj2')).to.contain(object2A);
        expect(objectsLists.get('obj2')).to.contain(object2B);
        expect(objectsLists.get('obj2')).to.contain(object2C);
      }
      {
        const { pickedSomething, objectsLists } = pickObjectsLinkedTo(
          object2C,
          Hashtable.newFrom({ obj1: [object1A, object1B, object1C] })
        );
        expect(pickedSomething).to.be(true);
        expect(objectsLists.get('obj1').length).to.be(1);
        expect(objectsLists.get('obj1')[0]).to.be(object1A);
      }
    });
    it('supports removing links', function () {
      manager.removeLinkBetween(object1A, object2B);
      {
        const { pickedSomething, objectsLists } = pickObjectsLinkedTo(
          object1A,
          Hashtable.newFrom({ obj2: [object2A, object2B, object2C] })
        );
        expect(pickedSomething).to.be(true);
        expect(objectsLists.get('obj2').length).to.be(2);
        expect(objectsLists.get('obj2')).to.contain(object2A);
        expect(objectsLists.get('obj2')).to.contain(object2C);
      }
      manager.linkObjects(object1B, object2C);
      manager.removeAllLinksOf(object1A);
      manager.removeAllLinksOf(object1A);
      {
        const { pickedSomething } = pickObjectsLinkedTo(
          object1A,
          Hashtable.newFrom({ obj2: [object2A, object2B, object2C] })
        );
        expect(pickedSomething).to.be(false);
      }
      {
        const { pickedSomething } = pickObjectsLinkedTo(
          object2A,
          Hashtable.newFrom({ obj1: [object1A, object1B, object1C] })
        );
        expect(pickedSomething).to.be(false);
      }
      {
        const { pickedSomething, objectsLists } = pickObjectsLinkedTo(
          object2C,
          Hashtable.newFrom({ obj1: [object1A, object1B, object1C] })
        );
        expect(pickedSomething).to.be(true);
        expect(objectsLists.get('obj1').length).to.be(1);
        expect(objectsLists.get('obj1')[0]).to.be(object1B);
      }
    });
  };

  // Following object names are the names of the objects in the scene.
  // The test cases are using local names 'obj1', 'obj2', 'obj3'.
  [
    {
      caseName: 'scene',
      // Called from a scene, no event function context.
      // Scene names are the same as local names.
      eventsFunctionContext: null,
      object1Names: ['obj1', 'obj1', 'obj1'],
      object2Names: ['obj2', 'obj2', 'obj2'],
      object3Names: ['obj3', 'obj3', 'obj3'],
    },
    // In event functions, the object names from the scene are different
    // than the local names.
    {
      caseName: 'extension',
      // The implementation only check it exists.
      eventsFunctionContext: {},
      object1Names: ['SceneObj1', 'SceneObj1', 'SceneObj1'],
      object2Names: ['SceneObj2', 'SceneObj2', 'SceneObj2'],
      object3Names: ['SceneObj3', 'SceneObj3', 'SceneObj3'],
    },
    // When groups are passed in parameters, they are flattened as an object.
    // So, the lists will contains objects with different names.
    {
      caseName: 'extension with groups',
      // The implementation only checks it exists.
      eventsFunctionContext: {},
      object1Names: ['SceneObj1', 'SceneObj1p', 'SceneObj1p'],
      object2Names: ['SceneObj2p', 'SceneObj2p', 'SceneObj2'],
      object3Names: ['SceneObj3p', 'SceneObj3p', 'SceneObj3'],
    },
  ].forEach((testCase) => {
    describe(testCase.caseName, function () {
      doTest(
        testCase.object1Names,
        testCase.object2Names,
        testCase.object3Names,
        testCase.eventsFunctionContext
      );
    });
  });
});
