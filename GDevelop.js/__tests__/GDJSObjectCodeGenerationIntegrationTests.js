const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsForEventsFunction,
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Object Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  describe('SceneInstancesCount', () => {
    const prepareCompiledEvents = () => {
      const eventsSerializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          // This condition should pass, but do not change the picking of the objects.
          conditions: [
            {
              type: { value: 'SceneInstancesCount' },
              parameters: ['', 'MyParamObject', '>', '0'],
            },
          ],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: [
                'ResultBeforePicking',
                '=',
                'SceneInstancesCount(MyParamObject)',
              ],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: ['MyParamObject', 'Picked', '=', '1'],
            },
            {
              type: { value: 'ModVarScene' },
              parameters: [
                'ResultAfterPicking',
                '=',
                'SceneInstancesCount(MyParamObject)',
              ],
            },
          ],
        },
      ]);

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();
      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const objectParameter = new gd.ParameterMetadata();
      objectParameter.setType('object');
      objectParameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(objectParameter);
      objectParameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();
      return { runCompiledEvents };
    };

    it('counts instances from the scene in a function, when no instances are passed as parameters', () => {
      const { runCompiledEvents } = prepareCompiledEvents();
      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      runtimeScene.getOnceTriggers().startNewFrame();

      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      const myObjectB2 = runtimeScene.createObject('MyObjectB');
      const myObjectB3 = runtimeScene.createObject('MyObjectB');

      // Run the function passing no objects as parameters.
      const emptyObjectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [],
        MyObjectB: [],
        MyObjectC: [],
      });
      runCompiledEvents(gdjs, runtimeScene, [emptyObjectsLists]);

      // Check that the instances from the scene were counted.
      expect(
        runtimeScene.getVariables().get('ResultBeforePicking').getAsNumber()
      ).toBe(5);
      expect(
        runtimeScene.getVariables().get('ResultAfterPicking').getAsNumber()
      ).toBe(5);

      // Check that the action did not modify any object.
      expect(myObjectA1.getVariables().get('Picked').getAsNumber()).toBe(0);
      expect(myObjectA2.getVariables().get('Picked').getAsNumber()).toBe(0);
      expect(myObjectB1.getVariables().get('Picked').getAsNumber()).toBe(0);
      expect(myObjectB2.getVariables().get('Picked').getAsNumber()).toBe(0);
      expect(myObjectB3.getVariables().get('Picked').getAsNumber()).toBe(0);
    });

    it('counts instances from the scene in a function, when some instances are passed as parameters', () => {
      const { runCompiledEvents } = prepareCompiledEvents();
      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      runtimeScene.getOnceTriggers().startNewFrame();

      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      const myObjectB2 = runtimeScene.createObject('MyObjectB');
      const myObjectB3 = runtimeScene.createObject('MyObjectB');

      // Run the function passing some objects as parameters.
      const objectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1],
        MyObjectB: [myObjectB2, myObjectB3],
        MyObjectC: [],
      });
      runCompiledEvents(gdjs, runtimeScene, [objectsLists]);

      // Check that the instances from the scene were counted.
      expect(
        runtimeScene.getVariables().get('ResultBeforePicking').getAsNumber()
      ).toBe(5);
      expect(
        runtimeScene.getVariables().get('ResultAfterPicking').getAsNumber()
      ).toBe(5);

      // Check that the initial condition did not modify the objects picked by the action.
      expect(myObjectA1.getVariables().get('Picked').getAsNumber()).toBe(1);
      expect(myObjectB2.getVariables().get('Picked').getAsNumber()).toBe(1);
      expect(myObjectB3.getVariables().get('Picked').getAsNumber()).toBe(1);
    });
  });

  describe('PickedInstancesCount', () => {
    it('counts picked instances in a function', function () {
      const eventsSerializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          // Verify the picked instances count is 0 at first.
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: [
                'Result1',
                '=',
                'PickedInstancesCount(MyParamObject)',
              ],
            },
          ],
          // Then verify it changes when the instances are picked by an action.
          events: [
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [
                {
                  type: { value: 'VarObjet' },
                  parameters: ['MyParamObject', 'PleaseCountMe', '=', '1'],
                },
              ],
              actions: [
                {
                  type: { value: 'ModVarScene' },
                  parameters: [
                    'Result2',
                    '=',
                    'PickedInstancesCount(MyParamObject)',
                  ],
                },
              ],
              events: [
                {
                  type: 'BuiltinCommonInstructions::Standard',
                  conditions: [],
                  actions: [],
                  events: [
                    {
                      type: 'BuiltinCommonInstructions::Standard',
                      conditions: [],
                      // Verify the picked instances count works when deeply nested in sub events.
                      actions: [
                        {
                          type: { value: 'ModVarScene' },
                          parameters: [
                            'Result3',
                            '=',
                            'PickedInstancesCount(MyParamObject)',
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [],
              // Verify the picked instances count is back to 0.
              actions: [
                {
                  type: { value: 'ModVarScene' },
                  parameters: [
                    'Result4',
                    '=',
                    'PickedInstancesCount(MyParamObject)',
                  ],
                },
              ],
            },
          ],
        },
      ]);

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();
      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const objectParameter = new gd.ParameterMetadata();
      objectParameter.setType('object');
      objectParameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(objectParameter);
      objectParameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      runtimeScene.getOnceTriggers().startNewFrame();

      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      const myObjectB2 = runtimeScene.createObject('MyObjectB');
      const myObjectB3 = runtimeScene.createObject('MyObjectB');
      const objectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1],
        MyObjectB: [myObjectB1, myObjectB3],
        MyObjectC: [],
      });

      myObjectA1.getVariables().get('PleaseCountMe').setNumber(1);
      myObjectB1.getVariables().get('PleaseCountMe').setNumber(1);
      myObjectB3.getVariables().get('PleaseCountMe').setNumber(1);

      runCompiledEvents(gdjs, runtimeScene, [objectsLists]);

      // Check that the picked instances were properly counted.
      expect(runtimeScene.getVariables().get('Result1').getAsNumber()).toBe(0);
      expect(runtimeScene.getVariables().get('Result2').getAsNumber()).toBe(3);
      expect(runtimeScene.getVariables().get('Result3').getAsNumber()).toBe(3);
      expect(runtimeScene.getVariables().get('Result4').getAsNumber()).toBe(0);

      eventsFunction.delete();
      project.delete();
    });

    it('counts picked instances in a function after creating an object', function () {
      const eventsSerializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: [
                'Result1',
                '=',
                'PickedInstancesCount(MyParamObject)',
              ],
            },
          ],
          events: [
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [],
              actions: [
                {
                  type: { value: 'ModVarScene' },
                  parameters: [
                    'Result2',
                    '=',
                    'PickedInstancesCount(MyParamObject)',
                  ],
                },
                {
                  type: { value: 'Create' },
                  parameters: ['', 'MyParamObject', '0', '0', ''],
                },
                {
                  type: { value: 'ModVarScene' },
                  parameters: [
                    'Result3',
                    '=',
                    'PickedInstancesCount(MyParamObject)',
                  ],
                },
                {
                  type: { value: 'ModVarObjet' },
                  parameters: ['MyParamObject', 'Picked', '=', '1'],
                },
                {
                  type: { value: 'ModVarScene' },
                  parameters: [
                    'Result4',
                    '=',
                    'PickedInstancesCount(MyParamObject)',
                  ],
                },
              ],
            },
          ],
        },
      ]);

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();
      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const objectParameter = new gd.ParameterMetadata();
      objectParameter.setType('object');
      objectParameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(objectParameter);
      objectParameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      runtimeScene.getOnceTriggers().startNewFrame();

      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      const objectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1],
        MyObjectB: [myObjectB1],
        MyObjectC: [],
      });

      runCompiledEvents(gdjs, runtimeScene, [objectsLists]);

      // Check that the picked instances were properly counted.
      expect(runtimeScene.getVariables().get('Result1').getAsNumber()).toBe(0);
      expect(runtimeScene.getVariables().get('Result2').getAsNumber()).toBe(0);
      expect(runtimeScene.getVariables().get('Result3').getAsNumber()).toBe(1);

      // Check that the object was created.
      expect(runtimeScene.getObjects('MyObjectA').length).toBe(2);
      expect(runtimeScene.getObjects('MyObjectB').length).toBe(1);

      // Check only the created object was modified.
      expect(
        runtimeScene
          .getObjects('MyObjectA')[0]
          .getVariables()
          .get('Picked')
          .getAsNumber()
      ).toBe(0);
      expect(
        runtimeScene
          .getObjects('MyObjectA')[1]
          .getVariables()
          .get('Picked')
          .getAsNumber()
      ).toBe(1);

      eventsFunction.delete();
      project.delete();
    });

    it('counts picked instances in a function after creating an object, including a partially picked object group', function () {
      const eventsSerializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: [
                'Result1_MyObjectGroup',
                '=',
                'PickedInstancesCount(MyObjectGroup)',
              ],
            },
            {
              type: { value: 'ModVarScene' },
              parameters: [
                'Result1_ObjectParam1',
                '=',
                'PickedInstancesCount(ObjectParam1)',
              ],
            },
          ],
          events: [
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [
                {
                  type: { value: 'VarObjet' },
                  parameters: ['ObjectParam1', 'PleaseCountMe', '=', '1'],
                },
              ],
              actions: [
                {
                  type: { value: 'ModVarScene' },
                  parameters: [
                    'Result2_MyObjectGroup',
                    '=',
                    'PickedInstancesCount(MyObjectGroup)',
                  ],
                },
                {
                  type: { value: 'ModVarScene' },
                  parameters: [
                    'Result2_ObjectParam1',
                    '=',
                    'PickedInstancesCount(ObjectParam1)',
                  ],
                },
                {
                  type: { value: 'Create' },
                  parameters: ['', 'ObjectParam1', '0', '0', ''],
                },
                {
                  type: { value: 'ModVarScene' },
                  parameters: [
                    'Result3_MyObjectGroup',
                    '=',
                    'PickedInstancesCount(MyObjectGroup)',
                  ],
                },
                {
                  type: { value: 'ModVarObjet' },
                  parameters: ['MyObjectGroup', 'Picked', '=', '1'],
                },
                {
                  type: { value: 'ModVarScene' },
                  parameters: [
                    'Result4_MyObjectGroup',
                    '=',
                    'PickedInstancesCount(MyObjectGroup)',
                  ],
                },
              ],
            },
          ],
        },
      ]);

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();
      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);
      const group = eventsFunction
        .getObjectGroups()
        .insertNew('MyObjectGroup', 0);
      group.setName('MyObjectGroup');
      group.addObject('ObjectParam1');
      group.addObject('ObjectParam2');

      const objectParameter = new gd.ParameterMetadata();
      objectParameter.setType('object');
      objectParameter.setName('ObjectParam1');
      eventsFunction.getParameters().push_back(objectParameter);
      objectParameter.setType('object');
      objectParameter.setName('ObjectParam2');
      eventsFunction.getParameters().push_back(objectParameter);
      objectParameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      runtimeScene.getOnceTriggers().startNewFrame();

      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      const myObjectB2 = runtimeScene.createObject('MyObjectB');
      myObjectA1.getVariables().get('PleaseCountMe').setNumber(1);
      myObjectB2.getVariables().get('PleaseCountMe').setNumber(1);

      const objectsLists1 = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1],
        MyObjectB: [myObjectB1],
      });
      const objectsLists2 = gdjs.Hashtable.newFrom({
        MyObjectB: [myObjectB2],
      });

      runCompiledEvents(gdjs, runtimeScene, [objectsLists1, objectsLists2]);

      // Check that the picked instances were properly counted.
      expect(runtimeScene.getVariables().has('Result1_MyObjectGroup')).toBe(
        true
      );
      expect(runtimeScene.getVariables().has('Result1_ObjectParam1')).toBe(
        true
      );
      expect(
        runtimeScene.getVariables().get('Result1_MyObjectGroup').getAsNumber()
      ).toBe(0);
      expect(
        runtimeScene.getVariables().get('Result1_ObjectParam1').getAsNumber()
      ).toBe(0);
      expect(
        runtimeScene.getVariables().get('Result2_MyObjectGroup').getAsNumber()
      ).toBe(1);
      expect(
        runtimeScene.getVariables().get('Result2_ObjectParam1').getAsNumber()
      ).toBe(1);
      expect(
        runtimeScene.getVariables().get('Result3_MyObjectGroup').getAsNumber()
      ).toBe(2);
      expect(
        runtimeScene.getVariables().get('Result4_MyObjectGroup').getAsNumber()
      ).toBe(3);

      // Check that the MyObjectA was created.
      expect(runtimeScene.getObjects('MyObjectA').length).toBe(2);
      expect(runtimeScene.getObjects('MyObjectB').length).toBe(2);

      // Check only the created object and previously picked objects were modified.
      expect(
        runtimeScene
          .getObjects('MyObjectA')[0]
          .getVariables()
          .get('Picked')
          .getAsNumber()
      ).toBe(1);
      expect(
        runtimeScene
          .getObjects('MyObjectA')[1]
          .getVariables()
          .get('Picked')
          .getAsNumber()
      ).toBe(1);
      expect(myObjectB1.getVariables().get('Picked').getAsNumber()).toBe(0);
      expect(myObjectB2.getVariables().get('Picked').getAsNumber()).toBe(1);

      eventsFunction.delete();
      project.delete();
    });
  });

  describe('"Or" condition with objects', () => {
    test('Nested "Or"', function () {
      const eventsSerializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            {
              type: {
                value: 'BuiltinCommonInstructions::Or',
              },
              parameters: [],
              subInstructions: [
                {
                  type: { value: 'VarObjet' },
                  parameters: ['MyParamObject', 'PleaseCountMe', '=', '1'],
                },
                {
                  type: {
                    value: 'BuiltinCommonInstructions::Or',
                  },
                  parameters: [],
                  subInstructions: [
                    {
                      type: { value: 'VarObjet' },
                      parameters: [
                        'MyParamObject',
                        'PleaseCountMeToo',
                        '=',
                        '1',
                      ],
                    },
                    ,
                  ],
                },
                {
                  type: { value: 'VarObjet' },
                  parameters: [
                    'MyParamObject',
                    'VariableThatDoesNotExist',
                    '=',
                    '1',
                  ],
                },
              ],
            },
          ],
          actions: [
            {
              type: { value: 'ModVarObjet' },
              parameters: ['MyParamObject', 'Picked', '=', '1'],
            },
          ],
          events: [],
        },
      ]);

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();
      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const objectParameter = new gd.ParameterMetadata();
      objectParameter.setType('object');
      objectParameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(objectParameter);
      objectParameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      runtimeScene.getOnceTriggers().startNewFrame();

      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      const myObjectB2 = runtimeScene.createObject('MyObjectB');
      const myObjectB3 = runtimeScene.createObject('MyObjectB');
      const objectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1],
        MyObjectB: [myObjectB1, myObjectB3],
        MyObjectC: [],
      });

      myObjectA1.getVariables().get('PleaseCountMe').setNumber(1);
      myObjectB1.getVariables().get('PleaseCountMe').setNumber(1);
      myObjectB3.getVariables().get('PleaseCountMeToo').setNumber(1);

      runCompiledEvents(gdjs, runtimeScene, [objectsLists]);

      // Check that the picked instances were properly counted.
      expect(myObjectA1.getVariables().get('Picked').getAsNumber()).toBe(1);
      expect(myObjectA2.getVariables().get('Picked').getAsNumber()).toBe(0);
      expect(myObjectB1.getVariables().get('Picked').getAsNumber()).toBe(1);
      expect(myObjectB2.getVariables().get('Picked').getAsNumber()).toBe(0);
      expect(myObjectB3.getVariables().get('Picked').getAsNumber()).toBe(1);

      eventsFunction.delete();
      project.delete();
    });
  });
});
