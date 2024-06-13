const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');
const {
  generateCompiledEventsForLayout,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Scene Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  describe('(Scene) variable code generation', () => {
    let project = null;
    let scene = null;
    beforeEach(() => {
      project = new gd.ProjectHelper.createNewGDJSProject();
      scene = project.insertNewLayout('Scene', 0);
      scene.getObjects().insertNewObject(project, '', 'MyObject', 0);

      // These variables are "simple" and their type will be known at code generation.
      scene.getVariables().insertNew('MyNumberVariable', 0).setValue(123);
      scene.getVariables().insertNew('MyStringVariable', 1).setString('Test');
      scene
        .getVariables()
        .insertNew('MyOtherStringVariable', 1)
        .setString('SomeChild');

      // Use a variable that has a value deep inside a structure - so code generation
      // does not know its type and will issue a `getAsNumberOrString`.
      scene
        .getVariables()
        .insertNew('MyOtherStructureVariable', 1)
        .getChild('Child')
        .getChild('SubChild')
        .setString('SomeOtherChild');
      const structureVariable = scene
        .getVariables()
        .insertNew('MyStructureVariable', 2);

      // Make a structure that we will address using other variables.
      structureVariable.getChild('Test').setValue(1);
      structureVariable.getChild('123').setValue(2);
      structureVariable.getChild('42').setValue(4);
      structureVariable.getChild('MyObject').setValue(8);
      structureVariable.getChild('SomeChild').getChild('Test').setValue(16);
      structureVariable.getChild('SomeChild').getChild('123').setValue(32);
      structureVariable.getChild('SomeChild').getChild('42').setValue(64);
      structureVariable
        .getChild('SomeChild')
        .getChild('MyObject')
        .setValue(128);
      structureVariable
        .getChild('SomeChild')
        .getChild('SomeOtherChild')
        .getChild('Test')
        .setValue(256);
      structureVariable
        .getChild('SomeChild')
        .getChild('SomeOtherChild')
        .getChild('123')
        .setValue(512);
      structureVariable
        .getChild('SomeChild')
        .getChild('SomeOtherChild')
        .getChild('42')
        .setValue(1024);
      structureVariable
        .getChild('SomeChild')
        .getChild('SomeOtherChild')
        .getChild('MyObject')
        .setValue(2048);
    });
    afterEach(() => {
      project.delete();
    });

    it('generates code for structure variables accessed by another variable (1 level)', function () {
      const serializedLayoutEvents = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: [
                'Counter',
                '+',
                'MyStructureVariable[MyStringVariable] + MyStructureVariable[MyNumberVariable] + MyStructureVariable[MyObject.X()] + MyStructureVariable[MyObject.ObjectName()]',
              ],
            },
          ],
          events: [],
        },
      ]);
      scene.getEvents().unserializeFrom(project, serializedLayoutEvents);

      const runCompiledEvents = generateCompiledEventsForLayout(
        gd,
        project,
        scene
      );

      const serializedSceneElement = new gd.SerializerElement();
      scene.serializeTo(serializedSceneElement);

      const { gdjs, runtimeScene } = makeMinimalGDJSMock({
        sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
      });
      serializedSceneElement.delete();
      const myObjectInstance = runtimeScene.createObject('MyObject');
      myObjectInstance.setX(42);
      runCompiledEvents(gdjs, runtimeScene);

      expect(runtimeScene.getVariables().has('Counter')).toBe(true);
      expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(
        1 + 2 + 4 + 8
      );
    });

    it('generates code for structure variables accessed by another variable (2 levels)', function () {
      const serializedLayoutEvents = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: [
                'Counter',
                '+',
                'MyStructureVariable.SomeChild[MyStringVariable] + MyStructureVariable.SomeChild[MyNumberVariable] + MyStructureVariable.SomeChild[MyObject.X()] + MyStructureVariable.SomeChild[MyObject.ObjectName()]',
              ],
            },
          ],
          events: [],
        },
      ]);
      scene.getEvents().unserializeFrom(project, serializedLayoutEvents);

      const runCompiledEvents = generateCompiledEventsForLayout(
        gd,
        project,
        scene
      );

      const serializedSceneElement = new gd.SerializerElement();
      scene.serializeTo(serializedSceneElement);

      const { gdjs, runtimeScene } = makeMinimalGDJSMock({
        sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
      });
      serializedSceneElement.delete();
      const myObjectInstance = runtimeScene.createObject('MyObject');
      myObjectInstance.setX(42);
      runCompiledEvents(gdjs, runtimeScene);

      expect(runtimeScene.getVariables().has('Counter')).toBe(true);
      expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(
        16 + 32 + 64 + 128
      );
    });

    it('generates code for structure variables accessed by another variable (3 levels)', function () {
      const serializedLayoutEvents = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: [
                'Counter',
                '+',
                'MyStructureVariable[MyOtherStringVariable][MyOtherStructureVariable.Child.SubChild][MyStringVariable] +MyStructureVariable[MyOtherStringVariable][MyOtherStructureVariable.Child.SubChild][MyNumberVariable] + MyStructureVariable[MyOtherStringVariable][MyOtherStructureVariable.Child.SubChild][MyObject.X()] + MyStructureVariable[MyOtherStringVariable][MyOtherStructureVariable.Child.SubChild][MyObject.ObjectName()]',
              ],
            },
          ],
          events: [],
        },
      ]);
      scene.getEvents().unserializeFrom(project, serializedLayoutEvents);

      const runCompiledEvents = generateCompiledEventsForLayout(
        gd,
        project,
        scene
      );

      const serializedSceneElement = new gd.SerializerElement();
      scene.serializeTo(serializedSceneElement);

      const { gdjs, runtimeScene } = makeMinimalGDJSMock({
        sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
      });
      serializedSceneElement.delete();
      const myObjectInstance = runtimeScene.createObject('MyObject');
      myObjectInstance.setX(42);
      runCompiledEvents(gdjs, runtimeScene);

      expect(runtimeScene.getVariables().has('Counter')).toBe(true);
      expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(
        256 + 512 + 1024 + 2048
      );
    });
  });
});
