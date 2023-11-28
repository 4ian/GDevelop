const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const {
  generateCompiledEventsForEventsFunction,
  generateCompiledEventsFromSerializedEvents,
  generateCompiledEventsForSerializedEventsBasedExtension,
} = require('../TestUtils/CodeGenerationHelpers.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const { makeTestExtensions } = require('../TestUtils/TestExtensions');

describe('libGD.js - GDJS Async Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
    makeTestExtensions(gd);
  });

  describe('Basics', () => {
    it('generates a working function with asynchronous actions', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'ModVarScene' },
                parameters: ['SuccessVariable', '+', '1'],
              },
            ],
          },
        ])
      );

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        eventsSerializerElement
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      runCompiledEvents(gdjs, runtimeScene, []);
      expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

      // Process the tasks (but the task is not finished yet).
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
      expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
      expect(
        runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
      ).toBe(1);
    });

    it('generates a working function with an optionally asynchronous action, that is not set as async', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: {
                  value: 'FakeOptionallyAsyncAction::DoOptionallyAsyncAction',
                },
                parameters: ['1.5'],
              },
              {
                type: { value: 'ModVarScene' },
                parameters: ['SuccessVariable', '+', '1'],
              },
            ],
          },
        ])
      );

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        eventsSerializerElement
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      runCompiledEvents(gdjs, runtimeScene, []);

      // Nothing is async, the actions are all executed.
      expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    });

    it('generates a working function with an optionally asynchronous action, that is set as async', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: {
                  value: 'FakeOptionallyAsyncAction::DoOptionallyAsyncAction',
                  await: true,
                },
                parameters: ['1.5'],
              },
              {
                type: { value: 'ModVarScene' },
                parameters: ['SuccessVariable', '+', '1'],
              },
            ],
          },
        ])
      );

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        eventsSerializerElement
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      runCompiledEvents(gdjs, runtimeScene, []);
      expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

      // Process the tasks (but the task is not finished yet).
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
      expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
      expect(
        runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
      ).toBe(1);
    });

    it('generates a working function with two asynchronous actions', function () {
      // Create events using the Trigger Once condition.
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'ModVarScene' },
                parameters: ['SuccessVariable', '+', '1'],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'ModVarScene' },
                parameters: ['SuccessVariable', '+', '2'],
              },
            ],
          },
        ])
      );

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        eventsSerializerElement
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      runCompiledEvents(gdjs, runtimeScene, []);
      expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

      // Process the tasks (but the task is not finished yet).
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
      expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
      expect(
        runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
      ).toBe(1);

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
      expect(
        runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
      ).toBe(3);
    });

    it('generates a working function with asynchronous actions referring to the function arguments', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'ModVarScene' },
                parameters: [
                  'SuccessVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
            ],
          },
        ])
      );

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();
      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      runCompiledEvents(gdjs, runtimeScene, [5]);
      expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

      // Process the tasks (but the task is not finished yet).
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
      expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
      expect(
        runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
      ).toBe(5);
    });
  });

  describe('With objects', () => {
    test('one asynchronous action', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
            ],
          },
        ])
      );

      const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
        gd,
        eventsSerializerElement,
        {
          parameterTypes: { IncreaseValue: 'number', MyParamObject: 'object' },
        }
      );

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA = runtimeScene.createObject('MyObjectA');
      const myObjectALists = gdjs.Hashtable.newFrom({ MyObjectA: [myObjectA] });
      runCompiledEvents(gdjs, runtimeScene, [5, myObjectALists]);
      expect(myObjectA.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );

      // Process the tasks (but the task is not finished yet).
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
      expect(myObjectA.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
      expect(myObjectA.getVariables().get('TestVariable').getAsNumber()).toBe(
        10
      );
    });

    test('two asynchronous actions and a condition before the async actions filtering objects', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [
              {
                type: { value: 'VarObjet' },
                parameters: ['MyParamObject', 'TestVariable', '=', '1'],
              },
            ],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
            ],
            events: [
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [],
                actions: [
                  {
                    type: {
                      value: 'Wait',
                    },
                    parameters: ['1.5'],
                  },
                  {
                    type: { value: 'ModVarObjet' },
                    parameters: [
                      'MyParamObject',
                      'TestVariable',
                      '+',
                      'GetArgumentAsNumber("IncreaseValue")',
                    ],
                  },
                ],
              },
            ],
          },
        ])
      );

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectALists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1, myObjectA2],
      });
      myObjectA2.getVariables().get('TestVariable').setNumber(1);

      runCompiledEvents(gdjs, runtimeScene, [5, myObjectALists]);

      // Initial state is unchanged because the first wait task is not done.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1
      );

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Initial state is still unchanged because the condition ran but the second wait task
      // is not done.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1
      );

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Only the "myObjectA2" instance was modified by the action.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        6
      );
    });

    test('two asynchronous actions and a condition in between filtering objects', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
            ],
            events: [
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [
                  {
                    type: { value: 'VarObjet' },
                    parameters: ['MyParamObject', 'TestVariable', '=', '1'],
                  },
                ],
                actions: [
                  {
                    type: {
                      value: 'Wait',
                    },
                    parameters: ['1.5'],
                  },
                  {
                    type: { value: 'ModVarObjet' },
                    parameters: [
                      'MyParamObject',
                      'TestVariable',
                      '+',
                      'GetArgumentAsNumber("IncreaseValue")',
                    ],
                  },
                ],
              },
            ],
          },
        ])
      );

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectALists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1, myObjectA2],
      });
      myObjectA2.getVariables().get('TestVariable').setNumber(1);

      runCompiledEvents(gdjs, runtimeScene, [5, myObjectALists]);

      // Initial state is unchanged because the first wait task is not done.
      expect(myObjectA1.getVariables().has('TestVariable')).toBe(false);
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1
      );

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Initial state is still unchanged because the condition ran but the second wait task
      // is not done.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1
      );

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Only the "myObjectA2" instance was modified by the action.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        6
      );
    });

    test('two asynchronous actions and conditions filtering objects in sub events after a filtering outside the async context', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            // Do a first filtering.
            conditions: [
              {
                type: { value: 'VarObjet' },
                parameters: ['MyParamObject', 'TestVariable', '>=', '1'],
              },
            ],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
            ],
            events: [
              {
                type: 'BuiltinCommonInstructions::Standard',
                // Filter with the more precise condition first.
                conditions: [
                  {
                    type: { value: 'VarObjet' },
                    parameters: ['MyParamObject', 'TestVariable', '>=', '3'],
                  },
                ],
                actions: [],
                events: [
                  {
                    type: 'BuiltinCommonInstructions::Standard',
                    // Filter with a less precise condition then.
                    conditions: [
                      {
                        type: { value: 'VarObjet' },
                        parameters: [
                          'MyParamObject',
                          'TestVariable',
                          '>=',
                          '2',
                        ],
                      },
                    ],
                    actions: [
                      {
                        type: {
                          value: 'Wait',
                        },
                        parameters: ['1.5'],
                      },
                      {
                        type: { value: 'ModVarObjet' },
                        parameters: [
                          'MyParamObject',
                          'TestVariable',
                          '+',
                          'GetArgumentAsNumber("IncreaseValue")',
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ])
      );

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectA3 = runtimeScene.createObject('MyObjectA');
      const myObjectA4 = runtimeScene.createObject('MyObjectA');
      const myObjectALists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1, myObjectA2, myObjectA3, myObjectA4],
      });
      myObjectA2.getVariables().get('TestVariable').setNumber(1);
      myObjectA3.getVariables().get('TestVariable').setNumber(2);
      myObjectA4.getVariables().get('TestVariable').setNumber(3);

      runCompiledEvents(gdjs, runtimeScene, [5, myObjectALists]);

      // Initial state is unchanged because the first wait task is not done.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        2
      );
      expect(myObjectA4.getVariables().get('TestVariable').getAsNumber()).toBe(
        3
      );

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Initial state is still unchanged because the conditions ran but the second wait task
      // is not done.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        2
      );
      expect(myObjectA4.getVariables().get('TestVariable').getAsNumber()).toBe(
        3
      );

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Only the "myObjectA3" instance was modified by the action.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        2
      );
      expect(myObjectA4.getVariables().get('TestVariable').getAsNumber()).toBe(
        3 + 5
      );
    });

    test('two asynchronous actions and conditions filtering objects in sub events after a filtering outside the async context, with a third condition having its result discarded', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            // Do a first filtering.
            conditions: [
              {
                type: { value: 'VarObjet' },
                parameters: ['MyParamObject', 'TestVariable', '>=', '1'],
              },
            ],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
            ],
            events: [
              {
                type: 'BuiltinCommonInstructions::Standard',
                // Filter with the more precise condition first.
                conditions: [
                  {
                    type: { value: 'VarObjet' },
                    parameters: ['MyParamObject', 'TestVariable', '>=', '3'],
                  },
                ],
                actions: [],
                events: [
                  {
                    type: 'BuiltinCommonInstructions::Standard',
                    // Filter with a less precise condition then.
                    conditions: [
                      {
                        type: { value: 'VarObjet' },
                        parameters: [
                          'MyParamObject',
                          'TestVariable',
                          '>=',
                          '2',
                        ],
                      },
                    ],
                    actions: [
                      {
                        type: {
                          value: 'Wait',
                        },
                        parameters: ['1.5'],
                      },
                      {
                        type: { value: 'ModVarObjet' },
                        parameters: [
                          'MyParamObject',
                          'TestVariable',
                          '+',
                          'GetArgumentAsNumber("IncreaseValue")',
                        ],
                      },
                    ],
                  },
                  // Add an event to prevent optimisation (reuse of the same objects list)
                  // in the previous event.
                  {
                    type: 'BuiltinCommonInstructions::Standard',
                    conditions: [
                      {
                        type: { value: 'VarObjet' },
                        parameters: [
                          'MyParamObject',
                          'TestVariable',
                          '>=',
                          '0',
                        ],
                      },
                    ],
                    actions: [],
                  },
                ],
              },
            ],
          },
        ])
      );

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectA3 = runtimeScene.createObject('MyObjectA');
      const myObjectA4 = runtimeScene.createObject('MyObjectA');
      const myObjectALists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1, myObjectA2, myObjectA3, myObjectA4],
      });
      myObjectA2.getVariables().get('TestVariable').setNumber(1);
      myObjectA3.getVariables().get('TestVariable').setNumber(2);
      myObjectA4.getVariables().get('TestVariable').setNumber(3);

      runCompiledEvents(gdjs, runtimeScene, [5, myObjectALists]);

      // Initial state is unchanged because the first wait task is not done.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        2
      );
      expect(myObjectA4.getVariables().get('TestVariable').getAsNumber()).toBe(
        3
      );

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Initial state is still unchanged because the conditions ran but the second wait task
      // is not done.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        2
      );
      expect(myObjectA4.getVariables().get('TestVariable').getAsNumber()).toBe(
        3
      );

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Only the "myObjectA3" instance was modified by the action.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        2
      );
      expect(myObjectA4.getVariables().get('TestVariable').getAsNumber()).toBe(
        3 + 5
      );
    });

    test('two asynchronous actions and two conditions in different sub-events in between filtering objects, with a third condition having its result discarded', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
            ],
            events: [
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [
                  {
                    type: { value: 'VarObjet' },
                    parameters: ['MyParamObject', 'TestVariable', '>=', '2'],
                  },
                ],
                actions: [],
                events: [
                  {
                    type: 'BuiltinCommonInstructions::Standard',
                    conditions: [
                      {
                        type: { value: 'VarObjet' },
                        parameters: [
                          'MyParamObject',
                          'TestVariable',
                          '>=',
                          '1',
                        ],
                      },
                    ],
                    actions: [
                      {
                        type: {
                          value: 'Wait',
                        },
                        parameters: ['1.5'],
                      },
                      {
                        type: { value: 'ModVarObjet' },
                        parameters: [
                          'MyParamObject',
                          'TestVariable',
                          '+',
                          'GetArgumentAsNumber("IncreaseValue")',
                        ],
                      },
                    ],
                  },
                  // Add an event to prevent optimisation (reuse of the same objects list)
                  // in the previous event.
                  {
                    type: 'BuiltinCommonInstructions::Standard',
                    conditions: [
                      {
                        type: { value: 'VarObjet' },
                        parameters: [
                          'MyParamObject',
                          'TestVariable',
                          '>=',
                          '0',
                        ],
                      },
                    ],
                    actions: [],
                  },
                ],
              },
            ],
          },
        ])
      );

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectA3 = runtimeScene.createObject('MyObjectA');
      const myObjectALists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1, myObjectA2, myObjectA3],
      });
      myObjectA2.getVariables().get('TestVariable').setNumber(1);
      myObjectA3.getVariables().get('TestVariable').setNumber(2);

      runCompiledEvents(gdjs, runtimeScene, [5, myObjectALists]);

      // Initial state is unchanged because the first wait task is not done.
      expect(myObjectA1.getVariables().has('TestVariable')).toBe(false);
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        2
      );

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Initial state is still unchanged because the conditions ran but the second wait task
      // is not done.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        2
      );

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Only the "myObjectA3" instance was modified by the action.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        2 + 5
      );
    });
  });

  describe('With objects, object groups and deleted/created objects', () => {
    test('asynchronous actions and deleted objects', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
            ],
          },
        ])
      );

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectA3 = runtimeScene.createObject('MyObjectA');
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      const myObjectB2 = runtimeScene.createObject('MyObjectB');
      const myObjectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1, myObjectA2, myObjectA3],
        MyObjectB: [myObjectB1, myObjectB2],
      });
      runCompiledEvents(gdjs, runtimeScene, [5, myObjectsLists]);
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );

      // Delete an object while the task is running.
      myObjectA1.deleteFromScene(runtimeScene);

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        10
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        10
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        10
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        10
      );

      // Delete other objects while the task is running.
      myObjectA3.deleteFromScene(runtimeScene);
      myObjectB1.deleteFromScene(runtimeScene);

      // Process the tasks again (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check only non deleted objects are updated by the final action.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        15
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        10
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        10
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        15
      );
    });

    test('two asynchronous actions immediately following each other, and deleted objects', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
            ],
          },
        ])
      );

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectA3 = runtimeScene.createObject('MyObjectA');
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      const myObjectB2 = runtimeScene.createObject('MyObjectB');
      const myObjectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1, myObjectA2, myObjectA3],
        MyObjectB: [myObjectB1, myObjectB2],
      });
      runCompiledEvents(gdjs, runtimeScene, [5, myObjectsLists]);
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );

      // Delete an object while the task is running.
      myObjectA1.deleteFromScene(runtimeScene);

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Nothing is changed (no action run).
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );

      // Delete other objects while the task is running.
      myObjectA3.deleteFromScene(runtimeScene);
      myObjectB1.deleteFromScene(runtimeScene);

      // Process the tasks again (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check only non deleted objects are updated by the final action.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        10
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        10
      );
    });

    test('asynchronous actions and object groups', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [
              {
                type: { value: 'VarObjet' },
                parameters: ['MyGroup', 'TestVariable', '=', '1'],
              },
            ],
            actions: [
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject1',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject2',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyGroup',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
            ],
          },
        ])
      );

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject1');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject2');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      // Create a group that refers to both objects passed as parameters.
      const myGroup = eventsFunction.getObjectGroups().insertNew('MyGroup', 0);
      myGroup.addObject('MyParamObject1');
      myGroup.addObject('MyParamObject2');

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectA3 = runtimeScene.createObject('MyObjectA');
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      const myObjectB2 = runtimeScene.createObject('MyObjectB');
      const myObjectALists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1, myObjectA2, myObjectA3],
      });
      const myObjectBLists = gdjs.Hashtable.newFrom({
        MyObjectB: [myObjectB1, myObjectB2],
      });

      myObjectA2.getVariables().get('TestVariable').setNumber(1);
      myObjectB2.getVariables().get('TestVariable').setNumber(1);

      runCompiledEvents(gdjs, runtimeScene, [
        5,
        myObjectALists,
        myObjectBLists,
      ]);

      // Only objects passed to the "MyParamObject1" parameter have their variable increased.
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1 + 5
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1
      );

      // Object filtered in the initial condition are not updated.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Now, only objects passed to the "MyParamObject2" parameter have their variable increased.
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1 + 5
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1 + 5
      );

      // Object filtered in the initial condition are not updated.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );

      // Process the tasks again (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // All the remaining objects, referred by "MyGroup" in the function, should have their variable increased.
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1 + 5 + 5
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1 + 5 + 5
      );

      // Object filtered in the initial condition are not updated.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
    });

    test('asynchronous actions and deleted objects in object groups', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject1',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject2',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyGroup',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
            ],
          },
        ])
      );

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject1');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject2');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      // Create a group that refers to both objects passed as parameters.
      const myGroup = eventsFunction.getObjectGroups().insertNew('MyGroup', 0);
      myGroup.addObject('MyParamObject1');
      myGroup.addObject('MyParamObject2');

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectA3 = runtimeScene.createObject('MyObjectA');
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      const myObjectB2 = runtimeScene.createObject('MyObjectB');
      const myObjectALists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1, myObjectA2, myObjectA3],
      });
      const myObjectBLists = gdjs.Hashtable.newFrom({
        MyObjectB: [myObjectB1, myObjectB2],
      });

      runCompiledEvents(gdjs, runtimeScene, [
        5,
        myObjectALists,
        myObjectBLists,
      ]);

      // Only objects passed to the "MyParamObject1" parameter have their variable increased.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );

      // Delete an object while the task is running.
      myObjectA1.deleteFromScene(runtimeScene);

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Now, only objects passed to the "MyParamObject2" parameter have their variable increased.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );

      // Delete other objects while the task is running.
      myObjectA3.deleteFromScene(runtimeScene);
      myObjectB1.deleteFromScene(runtimeScene);

      // Process the tasks again (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // All the remaining objects, referred by "MyGroup" in the function, should have their variable increased.
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        10
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        10
      );

      // Objects deleted, even if they are in "MyGroup", don't have their variable increased.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
    });

    test('asynchronous actions and multiple created objects (that were not used before)', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'Create' },
                parameters: ['', 'MyParamObject', '0', '0', ''],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'Create' },
                parameters: ['', 'MyParamObject', '0', '0', ''],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
            ],
          },
        ])
      );

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [],
      });

      runCompiledEvents(gdjs, runtimeScene, [5, myObjectsLists]);

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check an object was created.
      expect(runtimeScene.getObjects('MyObjectA').length).toBe(2);
      const myObjectA2 = runtimeScene.getObjects('MyObjectA')[1];

      // Process the tasks again (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check an object was created.
      expect(runtimeScene.getObjects('MyObjectA').length).toBe(3);
      const myObjectA3 = runtimeScene.getObjects('MyObjectA')[2];

      // Check that both objects that have been created are updated by
      // the last action (like if there was no wait action).
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
    });

    test('asynchronous actions and multiple created objects (that were not used before, with a usage after the first is created)', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'Create' },
                parameters: ['', 'MyParamObject', '0', '0', ''],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'Create' },
                parameters: ['', 'MyParamObject', '0', '0', ''],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
            ],
          },
        ])
      );

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [],
      });

      runCompiledEvents(gdjs, runtimeScene, [5, myObjectsLists]);

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check an object was created.
      expect(runtimeScene.getObjects('MyObjectA').length).toBe(2);
      const myObjectA2 = runtimeScene.getObjects('MyObjectA')[1];

      // Check that the instance just created is updated by
      // the action (like if there was no wait action).
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );

      // Process the tasks again (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check an object was created.
      expect(runtimeScene.getObjects('MyObjectA').length).toBe(3);
      const myObjectA3 = runtimeScene.getObjects('MyObjectA')[2];

      // Check that both objects that have been created are updated by
      // the last action (like if there was no wait action).
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 + 5
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
    });

    test('asynchronous actions and multiple created objects (that were not used before, with a usage after an async action after the first is created)', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'Create' },
                parameters: ['', 'MyParamObject', '0', '0', ''],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
              {
                type: { value: 'Create' },
                parameters: ['', 'MyParamObject', '0', '0', ''],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
            ],
          },
        ])
      );

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [],
      });

      runCompiledEvents(gdjs, runtimeScene, [5, myObjectsLists]);

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check an object was created.
      expect(runtimeScene.getObjects('MyObjectA').length).toBe(2);
      const myObjectA2 = runtimeScene.getObjects('MyObjectA')[1];

      // Check that the instance just created is updated by
      // the action (like if there was no wait action).
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );

      // Process the tasks again (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check an object was created.
      expect(runtimeScene.getObjects('MyObjectA').length).toBe(3);
      const myObjectA3 = runtimeScene.getObjects('MyObjectA')[2];

      // Check that both objects that have been created are updated by
      // the last action (like if there was no wait action).
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 + 5
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
    });

    test('asynchronous actions and created and deleted objects, using object groups', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [
              {
                type: { value: 'VarObjet' },
                parameters: ['MyParamObject', 'TestVariable', '>=', '1'],
              },
            ],
            actions: [
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'Create' },
                parameters: ['', 'MyParamObject', '0', '0', ''],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
            ],
          },
        ])
      );

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectA3 = runtimeScene.createObject('MyObjectA');
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      const myObjectB2 = runtimeScene.createObject('MyObjectB');
      const myObjectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1, myObjectA2, myObjectA3],
        MyObjectB: [myObjectB1, myObjectB2],
      });
      myObjectA1.getVariables().get('TestVariable').setNumber(1);
      myObjectA2.getVariables().get('TestVariable').setNumber(1);
      myObjectB1.getVariables().get('TestVariable').setNumber(1);

      runCompiledEvents(gdjs, runtimeScene, [5, myObjectsLists]);

      // Only objects filtered by the first condition should have been impacted.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        1 + 5
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1 + 5
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        1 + 5
      );

      // Other objects, not picked by the first condition, are not impacted.
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check an object was created.
      expect(runtimeScene.getObjects('MyObjectA').length).toBe(4);
      const newMyObjectA = runtimeScene.getObjects('MyObjectA')[3];

      // Delete some objects while the second Wait task is running.
      myObjectA1.deleteFromScene(runtimeScene);
      myObjectB1.deleteFromScene(runtimeScene);

      // Process the tasks again (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check the newly created object was updated by the last action
      expect(
        newMyObjectA.getVariables().get('TestVariable').getAsNumber()
      ).toBe(5);

      // Check the object picked by the condition (and not deleted) is updated
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1 + 5 + 5
      );

      // Check the deleted objects and objects not picked are not updated
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        1 + 5
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        1 + 5
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
    });

    test('created and then immediately deleted objects', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [
              {
                type: { value: 'VarObjet' },
                parameters: ['MyParamObject', 'TestVariable', '>=', '1'],
              },
            ],
            actions: [
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'Create' },
                parameters: ['', 'MyParamObject', '0', '0', ''],
              },
              {
                type: { value: 'Create' },
                parameters: ['', 'MyParamObject', '0', '0', ''],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
            ],
          },
        ])
      );

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectA3 = runtimeScene.createObject('MyObjectA');
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      const myObjectB2 = runtimeScene.createObject('MyObjectB');
      const myObjectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1, myObjectA2, myObjectA3],
        MyObjectB: [myObjectB1, myObjectB2],
      });
      myObjectA1.getVariables().get('TestVariable').setNumber(1);
      myObjectA2.getVariables().get('TestVariable').setNumber(1);
      myObjectB1.getVariables().get('TestVariable').setNumber(1);

      runCompiledEvents(gdjs, runtimeScene, [5, myObjectsLists]);

      // Only objects filtered by the first condition should have been impacted.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        1 + 5
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1 + 5
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        1 + 5
      );

      // Other objects, not picked by the first condition, are not impacted.
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check that two objects were created.
      expect(runtimeScene.getObjects('MyObjectA').length).toBe(5);
      const newMyObjectA1 = runtimeScene.getObjects('MyObjectA')[3];
      const newMyObjectA2 = runtimeScene.getObjects('MyObjectA')[4];

      // Delete some objects while the second Wait task is running.
      myObjectA1.deleteFromScene(runtimeScene);
      myObjectB1.deleteFromScene(runtimeScene);
      newMyObjectA1.deleteFromScene(runtimeScene);

      // Process the tasks again (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check the newly created and then deleted object was not updated by the last action
      expect(
        newMyObjectA1.getVariables().get('TestVariable').getAsNumber()
      ).toBe(0);

      // Check the newly created object was updated by the last action
      expect(
        newMyObjectA2.getVariables().get('TestVariable').getAsNumber()
      ).toBe(5);

      // Check the object picked by the condition (and not deleted) is updated
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1 + 5 + 5
      );

      // Check the deleted objects and objects not picked are not updated
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        1 + 5
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        1 + 5
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
    });

    describe('async object actions, waiting for all objects to be finished', () => {
      const expectProgressivelyResolvedTasksForObjects = (
        runCompiledEvents
      ) => {
        const { gdjs, runtimeScene } = makeMinimalGDJSMock();
        const myObjectA1 = runtimeScene.createObject('MyObjectA');
        const myObjectA2 = runtimeScene.createObject('MyObjectA');
        const myObjectA3 = runtimeScene.createObject('MyObjectA');
        const myObjectB1 = runtimeScene.createObject('MyObjectB');
        const myObjectB2 = runtimeScene.createObject('MyObjectB');
        const myObjectsLists = gdjs.Hashtable.newFrom({
          MyObjectA: [myObjectA1, myObjectA2, myObjectA3],
          MyObjectB: [myObjectB1, myObjectB2],
        });

        runCompiledEvents(gdjs, runtimeScene, [5, myObjectsLists]);
        expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

        // Process the tasks again (but none is finished).
        runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
        expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

        // Mark some tasks as done.
        myObjectA1.markFakeAsyncActionAsFinished();
        myObjectA2.markFakeAsyncActionAsFinished();
        myObjectB1.markFakeAsyncActionAsFinished();

        // Process the tasks again (but not everything is finished).
        runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
        expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

        // Mark the rest of tasks as done.
        myObjectA3.markFakeAsyncActionAsFinished();
        myObjectB2.markFakeAsyncActionAsFinished();

        // Process the tasks again (everything is finished this time).
        runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
        expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
        expect(
          runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
        ).toBe(1);

        expect(
          myObjectA1.getVariables().get('TestVariable').getAsNumber()
        ).toBe(5);
        expect(
          myObjectA2.getVariables().get('TestVariable').getAsNumber()
        ).toBe(5);
        expect(
          myObjectA3.getVariables().get('TestVariable').getAsNumber()
        ).toBe(5);
        expect(
          myObjectB1.getVariables().get('TestVariable').getAsNumber()
        ).toBe(5);
        expect(
          myObjectB2.getVariables().get('TestVariable').getAsNumber()
        ).toBe(5);
      };

      test('async object actions, waiting for all objects to be finished', function () {
        const eventsSerializerElement = gd.Serializer.fromJSON(
          JSON.stringify([
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [],
              actions: [
                {
                  type: {
                    value:
                      'FakeObjectWithAsyncAction::FakeObjectWithAsyncAction::DoAsyncAction',
                  },
                  parameters: ['MyParamObject'],
                },
                {
                  type: { value: 'ModVarObjet' },
                  parameters: [
                    'MyParamObject',
                    'TestVariable',
                    '+',
                    'GetArgumentAsNumber("IncreaseValue")',
                  ],
                },
                {
                  type: { value: 'ModVarScene' },
                  parameters: ['SuccessVariable', '+', '1'],
                },
              ],
            },
          ])
        );

        const project = new gd.ProjectHelper.createNewGDJSProject();
        const eventsFunction = new gd.EventsFunction();

        eventsFunction
          .getEvents()
          .unserializeFrom(project, eventsSerializerElement);

        const parameter = new gd.ParameterMetadata();
        parameter.setType('number');
        parameter.setName('IncreaseValue');
        eventsFunction.getParameters().push_back(parameter);
        parameter.setType('object');
        parameter.setName('MyParamObject');
        parameter.setExtraInfo(
          'FakeObjectWithAsyncAction::FakeObjectWithAsyncAction'
        );
        eventsFunction.getParameters().push_back(parameter);
        parameter.delete();

        const runCompiledEvents = generateCompiledEventsForEventsFunction(
          gd,
          project,
          eventsFunction
        );

        eventsFunction.delete();
        project.delete();

        expectProgressivelyResolvedTasksForObjects(runCompiledEvents);
      });

      test('optionally async object action, set as async', function () {
        const eventsSerializerElement = gd.Serializer.fromJSON(
          JSON.stringify([
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [],
              actions: [
                {
                  type: {
                    value:
                      'FakeObjectWithAsyncAction::FakeObjectWithAsyncAction::DoOptionallyAsyncAction',
                    await: true,
                  },
                  parameters: ['MyParamObject'],
                },
                {
                  type: { value: 'ModVarObjet' },
                  parameters: [
                    'MyParamObject',
                    'TestVariable',
                    '+',
                    'GetArgumentAsNumber("IncreaseValue")',
                  ],
                },
                {
                  type: { value: 'ModVarScene' },
                  parameters: ['SuccessVariable', '+', '1'],
                },
              ],
            },
          ])
        );

        const project = new gd.ProjectHelper.createNewGDJSProject();
        const eventsFunction = new gd.EventsFunction();

        eventsFunction
          .getEvents()
          .unserializeFrom(project, eventsSerializerElement);

        const parameter = new gd.ParameterMetadata();
        parameter.setType('number');
        parameter.setName('IncreaseValue');
        eventsFunction.getParameters().push_back(parameter);
        parameter.setType('object');
        parameter.setName('MyParamObject');
        parameter.setExtraInfo(
          'FakeObjectWithAsyncAction::FakeObjectWithAsyncAction'
        );
        eventsFunction.getParameters().push_back(parameter);
        parameter.delete();

        const runCompiledEvents = generateCompiledEventsForEventsFunction(
          gd,
          project,
          eventsFunction
        );

        eventsFunction.delete();
        project.delete();

        expectProgressivelyResolvedTasksForObjects(runCompiledEvents);
      });

      test('optionally async object action, not set as async', function () {
        const eventsSerializerElement = gd.Serializer.fromJSON(
          JSON.stringify([
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [],
              actions: [
                {
                  type: {
                    value:
                      'FakeObjectWithAsyncAction::FakeObjectWithAsyncAction::DoOptionallyAsyncAction',
                    await: false,
                  },
                  parameters: ['MyParamObject'],
                },
                {
                  type: { value: 'ModVarObjet' },
                  parameters: [
                    'MyParamObject',
                    'TestVariable',
                    '+',
                    'GetArgumentAsNumber("IncreaseValue")',
                  ],
                },
                {
                  type: { value: 'ModVarScene' },
                  parameters: ['SuccessVariable', '+', '1'],
                },
              ],
            },
          ])
        );

        const project = new gd.ProjectHelper.createNewGDJSProject();
        const eventsFunction = new gd.EventsFunction();

        eventsFunction
          .getEvents()
          .unserializeFrom(project, eventsSerializerElement);

        const parameter = new gd.ParameterMetadata();
        parameter.setType('number');
        parameter.setName('IncreaseValue');
        eventsFunction.getParameters().push_back(parameter);
        parameter.setType('object');
        parameter.setName('MyParamObject');
        parameter.setExtraInfo(
          'FakeObjectWithAsyncAction::FakeObjectWithAsyncAction'
        );
        eventsFunction.getParameters().push_back(parameter);
        parameter.delete();

        const runCompiledEvents = generateCompiledEventsForEventsFunction(
          gd,
          project,
          eventsFunction
        );

        eventsFunction.delete();
        project.delete();

        const { gdjs, runtimeScene } = makeMinimalGDJSMock();
        const myObjectA1 = runtimeScene.createObject('MyObjectA');
        const myObjectA2 = runtimeScene.createObject('MyObjectA');
        const myObjectA3 = runtimeScene.createObject('MyObjectA');
        const myObjectB1 = runtimeScene.createObject('MyObjectB');
        const myObjectB2 = runtimeScene.createObject('MyObjectB');
        const myObjectsLists = gdjs.Hashtable.newFrom({
          MyObjectA: [myObjectA1, myObjectA2, myObjectA3],
          MyObjectB: [myObjectB1, myObjectB2],
        });

        runCompiledEvents(gdjs, runtimeScene, [5, myObjectsLists]);

        // Nothing is async, everything is done in a single run.
        expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
        expect(
          runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
        ).toBe(1);

        expect(
          myObjectA1.getVariables().get('TestVariable').getAsNumber()
        ).toBe(5);
        expect(
          myObjectA2.getVariables().get('TestVariable').getAsNumber()
        ).toBe(5);
        expect(
          myObjectA3.getVariables().get('TestVariable').getAsNumber()
        ).toBe(5);
        expect(
          myObjectB1.getVariables().get('TestVariable').getAsNumber()
        ).toBe(5);
        expect(
          myObjectB2.getVariables().get('TestVariable').getAsNumber()
        ).toBe(5);
      });
    });
  });

  describe('With objects, and advanced conditions', () => {
    test('with "Or" conditions', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
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
                    type: { value: 'VarObjet' },
                    parameters: ['MyParamObject', 'PleaseCountMeToo', '=', '1'],
                  },
                ],
              },
            ],
            actions: [
              {
                type: {
                  value:
                    'FakeObjectWithAsyncAction::FakeObjectWithAsyncAction::DoAsyncAction',
                },
                parameters: ['MyParamObject'],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
              },
            ],
            events: [
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
                        parameters: [
                          'MyParamObject',
                          'PleaseCountMeASecondTime',
                          '=',
                          '1',
                        ],
                      },
                      {
                        type: { value: 'VarObjet' },
                        parameters: [
                          'MyParamObject',
                          'PleaseCountMeASecondTimeToo',
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
                    parameters: [
                      'MyParamObject',
                      'TestVariable',
                      '+',
                      'GetArgumentAsNumber("IncreaseValue")',
                    ],
                  },
                ],
              },
            ],
          },
        ])
      );

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      parameter.setExtraInfo(
        'FakeObjectWithAsyncAction::FakeObjectWithAsyncAction'
      );
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectA3 = runtimeScene.createObject('MyObjectA');
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      const myObjectB2 = runtimeScene.createObject('MyObjectB');
      const myObjectB3 = runtimeScene.createObject('MyObjectB');
      const myObjectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1, myObjectA2, myObjectA3],
        MyObjectB: [myObjectB1, myObjectB2, myObjectB3],
      });
      myObjectA1.getVariables().get('PleaseCountMe').setNumber(1);
      myObjectA1.getVariables().get('PleaseCountMeASecondTime').setNumber(1);
      myObjectA2.getVariables().get('PleaseCountMeToo').setNumber(1);
      myObjectB1.getVariables().get('PleaseCountMe').setNumber(1);
      myObjectB1.getVariables().get('PleaseCountMeASecondTimeToo').setNumber(1);
      myObjectB2.getVariables().get('PleaseCountMeToo').setNumber(1);

      runCompiledEvents(gdjs, runtimeScene, [5, myObjectsLists]);
      expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

      // Mark tasks as done.
      myObjectA1.markFakeAsyncActionAsFinished();
      myObjectA2.markFakeAsyncActionAsFinished();
      myObjectA3.markFakeAsyncActionAsFinished();
      myObjectB1.markFakeAsyncActionAsFinished();
      myObjectB2.markFakeAsyncActionAsFinished();
      myObjectB3.markFakeAsyncActionAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check that only objects passing the "Or" sub-conditions have been
      // updated.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 + 5 // Pass both "Or" conditions.
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 // Pass the first "Or" conditions.
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        0 // Pass no conditions.
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 + 5 // Pass both "Or" conditions.
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 // Pass the first "Or" conditions.
      );
      expect(myObjectB3.getVariables().get('TestVariable').getAsNumber()).toBe(
        0 // Pass no conditions.
      );
    });
  });

  describe('With non standard events', () => {
    test('a While event', function () {
      const eventsSerializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: ['Counter', '=', '0'],
            },
          ],
        },
        {
          infiniteLoopWarning: true,
          type: 'BuiltinCommonInstructions::While',
          whileConditions: [
            {
              type: { value: 'VarScene' },
              parameters: ['Counter', '<', '4'],
            },
          ],
          conditions: [
            {
              type: { value: 'VarObjet' },
              parameters: ['MyParamObject', 'PleasePickMe', '=', '1'],
            },
          ],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: ['Counter', '+', '1'],
            },
            {
              type: { value: 'Wait' },
              parameters: ['1.5'],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: [
                'MyParamObject',
                'TestVariable',
                '+',
                'GetArgumentAsNumber("IncreaseValue")',
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

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectA3 = runtimeScene.createObject('MyObjectA');
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      const myObjectB2 = runtimeScene.createObject('MyObjectB');
      const myObjectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1, myObjectA2, myObjectA3],
        MyObjectB: [myObjectB1, myObjectB2],
      });
      myObjectA1.getVariables().get('PleasePickMe').setNumber(1);
      myObjectA2.getVariables().get('PleasePickMe').setNumber(1);
      myObjectB1.getVariables().get('PleasePickMe').setNumber(1);

      runCompiledEvents(gdjs, runtimeScene, [5, myObjectsLists]);

      // Check that the loop is done.
      expect(runtimeScene.getVariables().has('Counter')).toBe(true);
      expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(4);

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check that all the tasks are done
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 * 4
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 * 4
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 * 4
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
    });

    test('a While event, with sub-events', function () {
      const eventsSerializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: ['Counter', '=', '0'],
            },
          ],
        },
        {
          infiniteLoopWarning: true,
          type: 'BuiltinCommonInstructions::While',
          whileConditions: [
            {
              type: { value: 'VarScene' },
              parameters: ['Counter', '<', '4'],
            },
          ],
          conditions: [
            {
              type: { value: 'VarObjet' },
              parameters: ['MyParamObject', 'PleasePickMe', '=', '1'],
            },
          ],
          actions: [],
          events: [
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [
                // (Same condition as before)
                {
                  type: { value: 'VarObjet' },
                  parameters: ['MyParamObject', 'PleasePickMe', '=', '1'],
                },
              ],
              actions: [
                {
                  type: { value: 'ModVarScene' },
                  parameters: ['Counter', '+', '1'],
                },
                {
                  type: { value: 'Wait' },
                  parameters: ['1.5'],
                },
                {
                  type: { value: 'ModVarObjet' },
                  parameters: [
                    'MyParamObject',
                    'TestVariable',
                    '+',
                    'GetArgumentAsNumber("IncreaseValue")',
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

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectA3 = runtimeScene.createObject('MyObjectA');
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      const myObjectB2 = runtimeScene.createObject('MyObjectB');
      const myObjectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1, myObjectA2, myObjectA3],
        MyObjectB: [myObjectB1, myObjectB2],
      });
      myObjectA1.getVariables().get('PleasePickMe').setNumber(1);
      myObjectA2.getVariables().get('PleasePickMe').setNumber(1);
      myObjectB1.getVariables().get('PleasePickMe').setNumber(1);

      runCompiledEvents(gdjs, runtimeScene, [5, myObjectsLists]);

      // Check that the loop is done.
      expect(runtimeScene.getVariables().has('Counter')).toBe(true);
      expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(4);

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check that all the tasks are done
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 * 4
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 * 4
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 * 4
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
    });

    test('a Repeat event', function () {
      const eventsSerializerElement = gd.Serializer.fromJSObject([
        {
          infiniteLoopWarning: true,
          type: 'BuiltinCommonInstructions::Repeat',
          repeatExpression: '3',
          conditions: [
            {
              type: { value: 'VarObjet' },
              parameters: ['MyParamObject', 'PleasePickMe', '=', '1'],
            },
          ],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: ['Counter', '+', '1'],
            },
            {
              type: { value: 'Wait' },
              parameters: ['1.5'],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: [
                'MyParamObject',
                'TestVariable',
                '+',
                'GetArgumentAsNumber("IncreaseValue")',
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

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectA3 = runtimeScene.createObject('MyObjectA');
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      const myObjectB2 = runtimeScene.createObject('MyObjectB');
      const myObjectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1, myObjectA2, myObjectA3],
        MyObjectB: [myObjectB1, myObjectB2],
      });
      myObjectA1.getVariables().get('PleasePickMe').setNumber(1);
      myObjectA2.getVariables().get('PleasePickMe').setNumber(1);
      myObjectB1.getVariables().get('PleasePickMe').setNumber(1);

      runCompiledEvents(gdjs, runtimeScene, [5, myObjectsLists]);

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check that all the tasks are done
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 * 3
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 * 3
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 * 3
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
    });

    test('a ForEach event', function () {
      const eventsSerializerElement = gd.Serializer.fromJSObject([
        {
          infiniteLoopWarning: true,
          type: 'BuiltinCommonInstructions::ForEach',
          object: 'MyParamObject',
          conditions: [
            {
              type: { value: 'VarObjet' },
              parameters: ['MyParamObject', 'PleasePickMe', '=', '1'],
            },
          ],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: ['Counter', '+', '1'],
            },
            // Add a wait action to check that 3 different waits will be done
            {
              type: { value: 'Wait' },
              parameters: ['1.5'],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: [
                'MyParamObject',
                'TestVariable',
                '+',
                'GetArgumentAsNumber("IncreaseValue")',
              ],
            },
            // Add another wait action to check that 3 different waits will be done
            {
              type: { value: 'Wait' },
              parameters: ['1.5'],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: [
                'MyParamObject',
                'TestVariable',
                '+',
                'GetArgumentAsNumber("IncreaseValue")',
              ],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: ['MyOtherParamObject', 'TestVariable', '+', '4'],
            },
            // Add an async object action that can be resolved at different time by each object.
            {
              type: {
                value:
                  'FakeObjectWithAsyncAction::FakeObjectWithAsyncAction::DoAsyncAction',
              },
              parameters: ['MyParamObject'],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: [
                'MyParamObject',
                'TestVariable',
                '+',
                'GetArgumentAsNumber("IncreaseValue")',
              ],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: ['MyOtherParamObject', 'TestVariable', '+', '4'],
            },
          ],
        },
      ]);

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      parameter.setExtraInfo(
        'FakeObjectWithAsyncAction::FakeObjectWithAsyncAction'
      );
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyOtherParamObject');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectA2 = runtimeScene.createObject('MyObjectA');
      const myObjectA3 = runtimeScene.createObject('MyObjectA');
      const myObjectB1 = runtimeScene.createObject('MyObjectB');
      const myObjectB2 = runtimeScene.createObject('MyObjectB');
      const myObjectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [myObjectA1, myObjectA2, myObjectA3],
        MyObjectB: [myObjectB1, myObjectB2],
      });

      myObjectA1.getVariables().get('PleasePickMe').setNumber(1);
      myObjectA2.getVariables().get('PleasePickMe').setNumber(1);
      myObjectB1.getVariables().get('PleasePickMe').setNumber(1);
      const myObjectC1 = runtimeScene.createObject('MyObjectC');
      const myObjectC2 = runtimeScene.createObject('MyObjectC');
      const myOtherObjectsLists = gdjs.Hashtable.newFrom({
        MyObjectC: [myObjectC1, myObjectC2],
      });

      runCompiledEvents(gdjs, runtimeScene, [
        5,
        myObjectsLists,
        myOtherObjectsLists,
      ]);

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check that each object A and B got its variable updated.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check that each object A and B got its variable updated.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 + 5
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 + 5
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 + 5
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );

      // Check that the objects C are also updated: the two of them are updated
      // 3 times (once for each object of the ForEach)
      // (4 is added each time to the variable).
      expect(myObjectC1.getVariables().get('TestVariable').getAsNumber()).toBe(
        3 * 4
      );
      expect(myObjectC2.getVariables().get('TestVariable').getAsNumber()).toBe(
        3 * 4
      );

      // Process some object (myObjectA1, myObjectB1) async tasks:
      myObjectA1.markFakeAsyncActionAsFinished();
      myObjectB1.markFakeAsyncActionAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check that each object A and B got its variable updated.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 + 5 + 5
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 + 5 // This was not updated
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 + 5 + 5
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );

      // Check that the objects C are also updated: the two of them are updated
      // 2 times (once for each object that finished its task)
      // (4 is added each time to the variable).
      expect(myObjectC1.getVariables().get('TestVariable').getAsNumber()).toBe(
        3 * 4 + 2 * 4
      );
      expect(myObjectC2.getVariables().get('TestVariable').getAsNumber()).toBe(
        3 * 4 + 2 * 4
      );

      // Process the last object (myObjectA2) async tasks:
      myObjectA2.markFakeAsyncActionAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check that each object A and B got its variable updated.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 + 5 + 5
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 + 5 + 5 // This was just updated.
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 + 5 + 5
      );
      expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );

      // Check that the objects C are also updated: the two of them are updated
      // 1 more time (once the last object) (4 is added each time to the variable).
      expect(myObjectC1.getVariables().get('TestVariable').getAsNumber()).toBe(
        3 * 4 + 2 * 4 + 1 * 4
      );
      expect(myObjectC2.getVariables().get('TestVariable').getAsNumber()).toBe(
        3 * 4 + 2 * 4 + 1 * 4
      );
    });

    test('a ForEach on created objects', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'Create' },
                parameters: ['', 'MyParamObject', '0', '0', ''],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              {
                type: { value: 'Create' },
                parameters: ['', 'MyParamObject', '0', '0', ''],
              },
              // Set a variable for the last two created instances:
              {
                type: { value: 'ModVarObjet' },
                parameters: ['MyParamObject', 'PleasePickMe', '=', '1'],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              // Create an additional object but without a variable, so
              // that it's discarded in the for each
              {
                type: { value: 'Create' },
                parameters: ['', 'MyParamObject', '0', '0', ''],
              },
            ],
            events: [
              {
                infiniteLoopWarning: true,
                type: 'BuiltinCommonInstructions::ForEach',
                object: 'MyParamObject',
                conditions: [
                  {
                    type: { value: 'VarObjet' },
                    parameters: ['MyParamObject', 'PleasePickMe', '=', '1'],
                  },
                ],
                actions: [
                  // Add an async object action that can be resolved at different time by each object.
                  {
                    type: {
                      value:
                        'FakeObjectWithAsyncAction::FakeObjectWithAsyncAction::DoAsyncAction',
                    },
                    parameters: ['MyParamObject'],
                  },
                  {
                    type: { value: 'ModVarObjet' },
                    parameters: [
                      'MyParamObject',
                      'TestVariable',
                      '+',
                      'GetArgumentAsNumber("IncreaseValue")',
                    ],
                  },
                  {
                    type: { value: 'ModVarObjet' },
                    parameters: [
                      'MyOtherParamObject',
                      'TestVariable',
                      '+',
                      '4',
                    ],
                  },
                ],
              },
            ],
          },
        ])
      );

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();

      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);

      const parameter = new gd.ParameterMetadata();
      parameter.setType('number');
      parameter.setName('IncreaseValue');
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyParamObject');
      parameter.setExtraInfo(
        'FakeObjectWithAsyncAction::FakeObjectWithAsyncAction'
      );
      eventsFunction.getParameters().push_back(parameter);
      parameter.setType('object');
      parameter.setName('MyOtherParamObject');
      eventsFunction.getParameters().push_back(parameter);
      parameter.delete();

      const runCompiledEvents = generateCompiledEventsForEventsFunction(
        gd,
        project,
        eventsFunction
      );

      eventsFunction.delete();
      project.delete();

      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const myObjectA1 = runtimeScene.createObject('MyObjectA');
      const myObjectC1 = runtimeScene.createObject('MyObjectC');
      const myObjectC2 = runtimeScene.createObject('MyObjectC');
      const myObjectsLists = gdjs.Hashtable.newFrom({
        MyObjectA: [],
      });
      const myOtherObjectsLists = gdjs.Hashtable.newFrom({
        MyObjectC: [myObjectC1, myObjectC2],
      });

      runCompiledEvents(gdjs, runtimeScene, [
        5,
        myObjectsLists,
        myOtherObjectsLists,
      ]);

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check an object was created.
      expect(runtimeScene.getObjects('MyObjectA').length).toBe(2);
      const myObjectA2 = runtimeScene.getObjects('MyObjectA')[1];

      // Process the tasks again (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check an object was created.
      expect(runtimeScene.getObjects('MyObjectA').length).toBe(3);
      const myObjectA3 = runtimeScene.getObjects('MyObjectA')[2];

      // Process the tasks again (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check an object was created.
      expect(runtimeScene.getObjects('MyObjectA').length).toBe(4);
      const myObjectA4 = runtimeScene.getObjects('MyObjectA')[3];

      // Process some object async tasks:
      myObjectA2.markFakeAsyncActionAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check that object A got its variable updated.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 // This was just updated.
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA4.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );

      // Check that the objects C are also updated: the two of them are updated
      // once (4 is added each time to the variable).
      expect(myObjectC1.getVariables().get('TestVariable').getAsNumber()).toBe(
        4
      );
      expect(myObjectC2.getVariables().get('TestVariable').getAsNumber()).toBe(
        4
      );

      // Process the remaining object async tasks:
      myObjectA3.markFakeAsyncActionAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Check that object A got its variable updated.
      expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        5
      );
      expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
        5 // This was just updated.
      );
      expect(myObjectA4.getVariables().get('TestVariable').getAsNumber()).toBe(
        0
      );

      // Check that the objects C are also updated: the two of them are updated
      // once more.
      expect(myObjectC1.getVariables().get('TestVariable').getAsNumber()).toBe(
        4 + 4
      );
      expect(myObjectC2.getVariables().get('TestVariable').getAsNumber()).toBe(
        4 + 4
      );
    });
  });

  describe('Events based asynchronous functions', () => {
    it('Resolves after awaiting an async action', () => {
      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const extensionModule =
        generateCompiledEventsForSerializedEventsBasedExtension(
          gd,
          require('./extensions/EBAsyncAction.json'),
          gdjs,
          runtimeScene
        );

      const {
        freeFunctions: { wait },
        behaviors: { Behavior },
        objects: { Object },
      } = extensionModule;

      const freeFunctionExtensionTask = wait();
      expect(freeFunctionExtensionTask.update()).toBe(false);
      expect(runtimeScene.getAsyncTasksManager().tasks.size).toBe(1);
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks();
      expect(freeFunctionExtensionTask.update()).toBe(true);

      const object = new Object(runtimeScene, {});
      const objectExtensionTask = object.wait();
      expect(objectExtensionTask.update()).toBe(false);
      expect(runtimeScene.getAsyncTasksManager().tasks.size).toBe(1);
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks();
      expect(objectExtensionTask.update()).toBe(true);

      const behavior = new Behavior(runtimeScene, {});
      const behaviorExtensionTask = behavior.wait();
      expect(behaviorExtensionTask.update()).toBe(false);
      expect(runtimeScene.getAsyncTasksManager().tasks.size).toBe(1);
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks();
      expect(behaviorExtensionTask.update()).toBe(true);
    });

    it('Resolves without awaiting an async action', () => {
      const { gdjs, runtimeScene } = makeMinimalGDJSMock();
      const extensionModule =
        generateCompiledEventsForSerializedEventsBasedExtension(
          gd,
          require('./extensions/EBAsyncAction.json'),
          gdjs,
          runtimeScene
        );

      const {
        freeFunctions: { noWait },
        behaviors: { Behavior },
        objects: { Object },
      } = extensionModule;

      const extensionTask = noWait();
      expect(extensionTask.update()).toBe(true);
      expect(runtimeScene.getAsyncTasksManager().tasks.size).toBe(0);

      const obj = new Object(runtimeScene, {});
      const objectExtensionTask = obj.noWait();
      expect(objectExtensionTask.update()).toBe(true);
      expect(runtimeScene.getAsyncTasksManager().tasks.size).toBe(0);

      const behavior = new Behavior(runtimeScene, {});
      const behaviorExtensionTask = behavior.noWait();
      expect(behaviorExtensionTask.update()).toBe(true);
      expect(runtimeScene.getAsyncTasksManager().tasks.size).toBe(0);
    });
  });
});
