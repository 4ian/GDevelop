const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsForEventsFunction,
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Code Generation integration tests', () => {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  describe('can generate a function that create an instance', () => {
    const generateFunctionWithCreateAction = (gd) => {
      const serializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Create' },
              parameters: ['', 'MyObject', '123', '456', ''],
            },
          ],
          events: [],
        },
      ]);

      return generateCompiledEventsFromSerializedEvents(gd, serializerElement, {
        parameterTypes: { MyObject: 'objectList' },
        logCode: false,
      });
    };

    it('can create an instance and keep all instances picked', function () {
      const runCompiledEvents = generateFunctionWithCreateAction(gd);
      const { gdjs, runtimeScene } = makeMinimalGDJSMock();

      const objectName = 'MyObject';
      const myObjectLists = new gdjs.Hashtable();
      const myObject1 = runtimeScene.createObject(objectName);
      const myObject2 = runtimeScene.createObject(objectName);
      myObjectLists.put(objectName, [myObject1, myObject2]);

      // All instances are picked.
      expect(myObjectLists.get('MyObject').length).toBe(2);

      runCompiledEvents(gdjs, runtimeScene, [myObjectLists]);

      // All instances are still picked.
      expect(myObjectLists.get('MyObject').length).toBe(3);
    });

    it('can create and pick an instance when some instances were not picked', function () {
      const runCompiledEvents = generateFunctionWithCreateAction(gd);
      const { gdjs, runtimeScene } = makeMinimalGDJSMock();

      const objectName = 'MyObject';
      const myObjectLists = new gdjs.Hashtable();
      const myObject1 = runtimeScene.createObject(objectName);
      const myObject2 = runtimeScene.createObject(objectName);
      // These objects are not added to the list.
      runtimeScene.createObject(objectName);
      runtimeScene.createObject(objectName);
      runtimeScene.createObject(objectName);
      myObjectLists.put(objectName, [myObject1, myObject2]);

      // 2 of 5 instances are picked.
      expect(myObjectLists.get('MyObject').length).toBe(2);

      runCompiledEvents(gdjs, runtimeScene, [myObjectLists]);

      // The created instance has been added to the picked instances.
      expect(myObjectLists.get('MyObject').length).toBe(3);
    });

    it('can create and pick an instance when no instance was picked', function () {
      const runCompiledEvents = generateFunctionWithCreateAction(gd);
      const { gdjs, runtimeScene } = makeMinimalGDJSMock();

      const objectName = 'MyObject';
      const myObjectLists = new gdjs.Hashtable();
      // These objects are not added to the list.
      runtimeScene.createObject(objectName);
      runtimeScene.createObject(objectName);
      runtimeScene.createObject(objectName);
      // The list can be empty when the object parameter is a
      // objectListOrEmptyIfJustDeclared.
      myObjectLists.put(objectName, []);

      // 2 of 5 instances are picked.
      expect(myObjectLists.get('MyObject').length).toBe(0);

      runCompiledEvents(gdjs, runtimeScene, [myObjectLists]);

      // The created instance has been added to the picked instances.
      expect(myObjectLists.get('MyObject').length).toBe(1);
    });

    it('can create an instance and keep all instances picked of a group', function () {
      const runCompiledEvents = generateFunctionWithCreateAction(gd);
      const { gdjs, runtimeScene } = makeMinimalGDJSMock();

      const myObjectLists = new gdjs.Hashtable();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      myObjectLists.put('MyObjectA', [myObjectA1, myObjectA2]);
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      myObjectLists.put('MyObjectB', [myObjectB1]);

      // All instances are picked.
      expect(myObjectLists.get('MyObjectA').length).toBe(2);
      expect(myObjectLists.get('MyObjectB').length).toBe(1);

      runCompiledEvents(gdjs, runtimeScene, [myObjectLists]);

      // All instances are still picked.
      expect(myObjectLists.get('MyObjectA').length).toBe(3);
      expect(myObjectLists.get('MyObjectB').length).toBe(1);
    });

    it('can create and pick an instance when some instances of a group were not picked', function () {
      const runCompiledEvents = generateFunctionWithCreateAction(gd);
      const { gdjs, runtimeScene } = makeMinimalGDJSMock();

      const myObjectLists = new gdjs.Hashtable();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      myObjectLists.put('MyObjectA', [myObjectA1, myObjectA2]);
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      myObjectLists.put('MyObjectB', [myObjectB1]);

      // These objects are not added to the list.
      runtimeScene.createObject('MyObjectB');
      runtimeScene.createObject('MyObjectB');
      runtimeScene.createObject('MyObjectB');

      // 2 of 5 instances are picked.
      expect(myObjectLists.get('MyObjectA').length).toBe(2);
      expect(myObjectLists.get('MyObjectB').length).toBe(1);

      runCompiledEvents(gdjs, runtimeScene, [myObjectLists]);

      // The created instance has been added to the picked instances.
      expect(myObjectLists.get('MyObjectA').length).toBe(3);
      expect(myObjectLists.get('MyObjectB').length).toBe(1);
    });
  });
});
