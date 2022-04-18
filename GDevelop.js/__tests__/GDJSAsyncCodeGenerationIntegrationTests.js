const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const {
  generateCompiledEventsForEventsFunction,
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const { makeTestExtensions } = require('../TestUtils/TestExtensions');

describe('libGD.js - GDJS Async Code Generation integration tests', function () {
  let gd = null;
  beforeAll((done) =>
    initializeGDevelopJs().then((module) => {
      gd = module;
      makeTestExtensions(gd);
      done();
    })
  );

  describe('Basics', () => {
    it('generates a working function with asynchronous actions', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            disabled: false,
            folded: false,
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
              {
                type: { value: 'ModVarScene' },
                parameters: ['SuccessVariable', '+', '1'],
                subInstructions: [],
              },
            ],
            events: [],
          },
        ])
      );

      var runCompiledEvents = generateCompiledEventsFromSerializedEvents(
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
            disabled: false,
            folded: false,
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
              {
                type: { value: 'ModVarScene' },
                parameters: ['SuccessVariable', '+', '1'],
                subInstructions: [],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
              {
                type: { value: 'ModVarScene' },
                parameters: ['SuccessVariable', '+', '2'],
                subInstructions: [],
              },
            ],
            events: [],
          },
        ])
      );

      var runCompiledEvents = generateCompiledEventsFromSerializedEvents(
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
            disabled: false,
            folded: false,
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
              {
                type: { value: 'ModVarScene' },
                parameters: [
                  'SuccessVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
                subInstructions: [],
              },
            ],
            events: [],
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
    it('works with asynchronous actions', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            disabled: false,
            folded: false,
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
                subInstructions: [],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
                subInstructions: [],
              },
            ],
            events: [],
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

    it('works with two asynchronous actions and a condition before the async actions filtering objects', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            disabled: false,
            folded: false,
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [
              {
                type: { value: 'VarObjet' },
                parameters: ['MyParamObject', 'TestVariable', '=', '1'],
                subInstructions: [],
              },
            ],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
            ],
            events: [
              {
                disabled: false,
                folded: false,
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [],
                actions: [
                  {
                    type: {
                      value: 'Wait',
                    },
                    parameters: ['1.5'],
                    subInstructions: [],
                  },
                  {
                    type: { value: 'ModVarObjet' },
                    parameters: [
                      'MyParamObject',
                      'TestVariable',
                      '+',
                      'GetArgumentAsNumber("IncreaseValue")',
                    ],
                    subInstructions: [],
                  },
                ],
                events: [],
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
      expect(myObjectA1.getVariables().has('TestVariable')).toBe(false);
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1
      );

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Only the "myObjectA2" instance was modified by the action.
      expect(myObjectA1.getVariables().has('TestVariable')).toBe(false);
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        6
      );
    });

    it('works with two asynchronous actions and a condition in between filtering objects', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            disabled: false,
            folded: false,
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
            ],
            events: [
              {
                disabled: false,
                folded: false,
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [
                  {
                    type: { value: 'VarObjet' },
                    parameters: ['MyParamObject', 'TestVariable', '=', '1'],
                    subInstructions: [],
                  },
                ],
                actions: [
                  {
                    type: {
                      value: 'Wait',
                    },
                    parameters: ['1.5'],
                    subInstructions: [],
                  },
                  {
                    type: { value: 'ModVarObjet' },
                    parameters: [
                      'MyParamObject',
                      'TestVariable',
                      '+',
                      'GetArgumentAsNumber("IncreaseValue")',
                    ],
                    subInstructions: [],
                  },
                ],
                events: [],
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
      expect(myObjectA1.getVariables().has('TestVariable')).toBe(false);
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        1
      );

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

      // Only the "myObjectA2" instance was modified by the action.
      expect(myObjectA1.getVariables().has('TestVariable')).toBe(false);
      expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
      expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
        6
      );
    });

    it('works with two asynchronous actions and conditions filtering objects in sub events after a filtering outside the async context', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            disabled: false,
            folded: false,
            type: 'BuiltinCommonInstructions::Standard',
            // Do a first filtering.
            conditions: [
              {
                type: { value: 'VarObjet' },
                parameters: ['MyParamObject', 'TestVariable', '>=', '1'],
                subInstructions: [],
              },
            ],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
            ],
            events: [
              {
                disabled: false,
                folded: false,
                type: 'BuiltinCommonInstructions::Standard',
                // Filter with the more precise condition first.
                conditions: [
                  {
                    type: { value: 'VarObjet' },
                    parameters: ['MyParamObject', 'TestVariable', '>=', '3'],
                    subInstructions: [],
                  },
                ],
                actions: [],
                events: [
                  {
                    disabled: false,
                    folded: false,
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
                        subInstructions: [],
                      },
                    ],
                    actions: [
                      {
                        type: {
                          value: 'Wait',
                        },
                        parameters: ['1.5'],
                        subInstructions: [],
                      },
                      {
                        type: { value: 'ModVarObjet' },
                        parameters: [
                          'MyParamObject',
                          'TestVariable',
                          '+',
                          'GetArgumentAsNumber("IncreaseValue")',
                        ],
                        subInstructions: [],
                      },
                    ],
                    events: [],
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
      expect(myObjectA1.getVariables().has('TestVariable')).toBe(false);
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
      expect(myObjectA1.getVariables().has('TestVariable')).toBe(false);
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
      expect(myObjectA1.getVariables().has('TestVariable')).toBe(false);
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

    it('works with two asynchronous actions and conditions filtering objects in sub events after a filtering outside the async context, with a third condition having its result discarded', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            disabled: false,
            folded: false,
            type: 'BuiltinCommonInstructions::Standard',
            // Do a first filtering.
            conditions: [
              {
                type: { value: 'VarObjet' },
                parameters: ['MyParamObject', 'TestVariable', '>=', '1'],
                subInstructions: [],
              },
            ],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
            ],
            events: [
              {
                disabled: false,
                folded: false,
                type: 'BuiltinCommonInstructions::Standard',
                // Filter with the more precise condition first.
                conditions: [
                  {
                    type: { value: 'VarObjet' },
                    parameters: ['MyParamObject', 'TestVariable', '>=', '3'],
                    subInstructions: [],
                  },
                ],
                actions: [],
                events: [
                  {
                    disabled: false,
                    folded: false,
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
                        subInstructions: [],
                      },
                    ],
                    actions: [
                      {
                        type: {
                          value: 'Wait',
                        },
                        parameters: ['1.5'],
                        subInstructions: [],
                      },
                      {
                        type: { value: 'ModVarObjet' },
                        parameters: [
                          'MyParamObject',
                          'TestVariable',
                          '+',
                          'GetArgumentAsNumber("IncreaseValue")',
                        ],
                        subInstructions: [],
                      },
                    ],
                    events: [],
                  },
                  // Add an event to prevent optimisation (reuse of the same objects list)
                  // in the previous event.
                  {
                    disabled: false,
                    folded: false,
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
                        subInstructions: [],
                      },
                    ],
                    actions: [],
                    events: [],
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
      expect(myObjectA1.getVariables().has('TestVariable')).toBe(false);
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
      expect(myObjectA1.getVariables().has('TestVariable')).toBe(false);
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
      expect(myObjectA1.getVariables().has('TestVariable')).toBe(false);
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

    it('works with two asynchronous actions and two conditions in different sub-events in between filtering objects, with a third condition having its result discarded', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            disabled: false,
            folded: false,
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
            ],
            events: [
              {
                disabled: false,
                folded: false,
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [
                  {
                    type: { value: 'VarObjet' },
                    parameters: ['MyParamObject', 'TestVariable', '>=', '2'],
                    subInstructions: [],
                  },
                ],
                actions: [],
                events: [
                  {
                    disabled: false,
                    folded: false,
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
                        subInstructions: [],
                      },
                    ],
                    actions: [
                      {
                        type: {
                          value: 'Wait',
                        },
                        parameters: ['1.5'],
                        subInstructions: [],
                      },
                      {
                        type: { value: 'ModVarObjet' },
                        parameters: [
                          'MyParamObject',
                          'TestVariable',
                          '+',
                          'GetArgumentAsNumber("IncreaseValue")',
                        ],
                        subInstructions: [],
                      },
                    ],
                    events: [],
                  },
                  // Add an event to prevent optimisation (reuse of the same objects list)
                  // in the previous event.
                  {
                    disabled: false,
                    folded: false,
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
                        subInstructions: [],
                      },
                    ],
                    actions: [],
                    events: [],
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

      // Only the "myObjectA3" instance was modified by the action.
      expect(myObjectA1.getVariables().has('TestVariable')).toBe(false);
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
    it('works with asynchronous actions, and it handles deleted objects', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            disabled: false,
            folded: false,
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
                subInstructions: [],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
                subInstructions: [],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
                subInstructions: [],
              },
            ],
            events: [],
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

    it('works with two asynchronous actions immediately following each other, and it handles deleted objects', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            disabled: false,
            folded: false,
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
                subInstructions: [],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
                subInstructions: [],
              },
            ],
            events: [],
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

    it('works with asynchronous actions, and using object groups', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            disabled: false,
            folded: false,
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [
              {
                type: { value: 'VarObjet' },
                parameters: ['MyGroup', 'TestVariable', '=', '1'],
                subInstructions: [],
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
                subInstructions: [],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject2',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
                subInstructions: [],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyGroup',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
                subInstructions: [],
              },
            ],
            events: [],
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

      // All the remaining objects, refered by "MyGroup" in the function, should have their variable increased.
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

    it('works with asynchronous actions, and it handles deleted objects in object groups', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            disabled: false,
            folded: false,
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
                subInstructions: [],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject2',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
                subInstructions: [],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyGroup',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
                subInstructions: [],
              },
            ],
            events: [],
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

      // All the remaining objects, refered by "MyGroup" in the function, should have their variable increased.
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

    it('works with asynchronous actions, and it handles created and deleted objects, using object groups', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            disabled: false,
            folded: false,
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [
              {
                type: { value: 'VarObjet' },
                parameters: ['MyParamObject', 'TestVariable', '>=', '1'],
                subInstructions: [],
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
                subInstructions: [],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
              {
                type: { value: 'Create' },
                parameters: ['', 'MyParamObject', '0', '0', ''],
                subInstructions: [],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
                subInstructions: [],
              },
            ],
            events: [],
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

    it('works with created and then immediately deleted objects', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            disabled: false,
            folded: false,
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [
              {
                type: { value: 'VarObjet' },
                parameters: ['MyParamObject', 'TestVariable', '>=', '1'],
                subInstructions: [],
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
                subInstructions: [],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
              {
                type: { value: 'Create' },
                parameters: ['', 'MyParamObject', '0', '0', ''],
                subInstructions: [],
              },
              {
                type: { value: 'Create' },
                parameters: ['', 'MyParamObject', '0', '0', ''],
                subInstructions: [],
              },
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
                subInstructions: [],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
                subInstructions: [],
              },
            ],
            events: [],
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

    it('works with async object actions, waiting for all objects to be finished', function () {
      const eventsSerializerElement = gd.Serializer.fromJSON(
        JSON.stringify([
          {
            disabled: false,
            folded: false,
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: {
                  value:
                    'FakeObjectWithAsyncAction::FakeObjectWithAsyncAction::DoAsyncAction',
                },
                parameters: ['MyParamObject'],
                subInstructions: [],
              },
              {
                type: { value: 'ModVarObjet' },
                parameters: [
                  'MyParamObject',
                  'TestVariable',
                  '+',
                  'GetArgumentAsNumber("IncreaseValue")',
                ],
                subInstructions: [],
              },
              {
                type: { value: 'ModVarScene' },
                parameters: ['SuccessVariable', '+', '1'],
                subInstructions: [],
              },
            ],
            events: [],
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

      // Process the tasks again (but not everything is finished).
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
      expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
      expect(
        runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
      ).toBe(1);

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
    });
  });
});
