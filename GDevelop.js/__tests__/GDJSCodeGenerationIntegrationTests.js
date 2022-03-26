const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');

/**
 * Helper generating an event, ready to be unserialized, adding 1 to
 * "TestVariable" of the specified object (or object group).
 */
const makeAddOneToObjectTestVariableEvent = (objectName) => ({
  disabled: false,
  folded: false,
  type: 'BuiltinCommonInstructions::Standard',
  conditions: [],
  actions: [
    {
      type: { inverted: false, value: 'ModVarObjet' },
      parameters: [objectName, 'TestVariable', '+', '1'],
      subInstructions: [],
    },
  ],
  events: [],
});

describe('libGD.js - GDJS Code Generation integration tests', function () {
  let gd = null;
  beforeAll((done) =>
    initializeGDevelopJs().then((module) => {
      gd = module;
      done();
    })
  );

  it('generates a working function for While event', function () {
    // Create nested events using And and StrEqual conditions
    const serializerElement = gd.Serializer.fromJSObject([
      {
        disabled: false,
        folded: false,
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { inverted: false, value: 'ModVarScene' },
            parameters: ['Counter', '=', '0'],
            subInstructions: [],
          },
        ],
        events: [],
      },
      {
        disabled: false,
        folded: false,
        infiniteLoopWarning: true,
        type: 'BuiltinCommonInstructions::While',
        whileConditions: [
          {
            type: { inverted: false, value: 'VarScene' },
            parameters: ['Counter', '<', '4'],
            subInstructions: [],
          },
        ],
        conditions: [],
        actions: [
          {
            type: { inverted: false, value: 'ModVarScene' },
            parameters: ['Counter', '+', '1'],
            subInstructions: [],
          },
        ],
        events: [],
      },
    ]);

    var runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().has('Counter')).toBe(true);
    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(4);
  });

  it('generates a working function with nested Or and StrEqual', function () {
    // Create nested events using Or and StrEqual conditions
    const serializerElement = gd.Serializer.fromJSObject([
      {
        disabled: false,
        folded: false,
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: {
              inverted: false,
              value: 'BuiltinCommonInstructions::Or',
            },
            parameters: [],
            subInstructions: [
              {
                type: { inverted: false, value: 'Egal' },
                parameters: ['1', '=', '2'],
                subInstructions: [],
              },
              {
                type: {
                  inverted: false,
                  value: 'BuiltinCommonInstructions::Or',
                },
                parameters: [],
                subInstructions: [
                  // This should be true and make the entire conditions true.
                  {
                    type: { inverted: false, value: 'StrEqual' },
                    parameters: ['"1"', '=', '"1"'],
                    subInstructions: [],
                  },
                ],
              },
              {
                type: { inverted: false, value: 'StrEqual' },
                parameters: ['"1"', '=', '"2"'],
                subInstructions: [],
              },
            ],
          },
        ],
        actions: [
          {
            type: { inverted: false, value: 'ModVarScene' },
            parameters: ['SuccessVariable', '=', '1'],
            subInstructions: [],
          },
        ],
        events: [],
      },
    ]);

    var runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('generates a working function with nested And and StrEqual', function () {
    // Create nested events using And and StrEqual conditions
    const serializerElement = gd.Serializer.fromJSObject([
      {
        disabled: false,
        folded: false,
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: {
              inverted: false,
              value: 'BuiltinCommonInstructions::And',
            },
            parameters: [],
            subInstructions: [
              {
                type: { inverted: false, value: 'Egal' },
                parameters: ['1', '=', '1'],
                subInstructions: [],
              },
              {
                type: {
                  inverted: false,
                  value: 'BuiltinCommonInstructions::And',
                },
                parameters: [],
                subInstructions: [
                  {
                    type: { inverted: false, value: 'Egal' },
                    parameters: ['1', '=', '1'],
                    subInstructions: [],
                  },
                  {
                    type: {
                      inverted: false,
                      value: 'BuiltinCommonInstructions::And',
                    },
                    parameters: [],
                    subInstructions: [
                      {
                        type: { inverted: false, value: 'Egal' },
                        parameters: ['1', '=', '1'],
                        subInstructions: [],
                      },
                      {
                        type: { inverted: false, value: 'StrEqual' },
                        parameters: ['"1"', '=', '"1"'],
                        subInstructions: [],
                      },
                    ],
                  },
                  {
                    type: { inverted: false, value: 'StrEqual' },
                    parameters: ['"1"', '=', '"1"'],
                    subInstructions: [],
                  },
                ],
              },
              {
                type: { inverted: false, value: 'StrEqual' },
                parameters: ['"1"', '=', '"1"'],
                subInstructions: [],
              },
            ],
          },
        ],
        actions: [
          {
            type: { inverted: false, value: 'ModVarScene' },
            parameters: ['SuccessVariable', '=', '1'],
            subInstructions: [],
          },
        ],
        events: [],
      },
    ]);

    var runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('generates a working function creating objects', function () {
    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        disabled: false,
        folded: false,
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { inverted: false, value: 'Create' },
            parameters: ['', 'MyObjectA', '0', '0', ''],
            subInstructions: [],
          },
        ],
        events: [makeAddOneToObjectTestVariableEvent('MyObjectA')],
      },
      makeAddOneToObjectTestVariableEvent('MyObjectA'),
      makeAddOneToObjectTestVariableEvent('MyObjectB'),
    ]);

    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunction = new gd.EventsFunction();
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);

    // Add an object parameter to the function:
    const objectParameter = new gd.ParameterMetadata();
    objectParameter.setType('object');
    objectParameter.setName('MyObjectA');
    eventsFunction.getParameters().push_back(objectParameter);
    objectParameter.setType('object');
    objectParameter.setName('MyObjectB');
    eventsFunction.getParameters().push_back(objectParameter);
    objectParameter.delete();

    const runCompiledEvents = generateCompiledEventsForEventsFunction(
      gd,
      project,
      eventsFunction
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runtimeScene.getOnceTriggers().startNewFrame();
    const emptyMyObjectALists = gdjs.Hashtable.newFrom({ MyObjectA: [] });
    const myObjectB = runtimeScene.createObject('MyObjectB');
    const myObjectBLists = gdjs.Hashtable.newFrom({ MyObjectB: [myObjectB] });

    runCompiledEvents(gdjs, runtimeScene, [
      emptyMyObjectALists,
      myObjectBLists,
    ]);

    // Check that the object was created and its variable was incremented twice.
    expect(runtimeScene.getObjects('MyObjectA')).toHaveLength(1);
    const firstMyObjectA = runtimeScene.getObjects('MyObjectA')[0];
    expect(firstMyObjectA.getVariables().has('TestVariable')).toBe(true);
    expect(
      firstMyObjectA.getVariables().get('TestVariable').getAsNumber()
    ).toBe(2);

    // Object B has nothing to do with the "Create", its variable is just incremented once.
    expect(myObjectB.getVariables().get('TestVariable').getAsNumber()).toBe(1);

    // Check that if the function is called with the first MyObjectA as parameter, it won't change
    // the way a new object is created...
    const myObjectALists = gdjs.Hashtable.newFrom({
      MyObjectA: [firstMyObjectA],
    });
    runCompiledEvents(gdjs, runtimeScene, [myObjectALists, myObjectBLists]);
    expect(runtimeScene.getObjects('MyObjectA')).toHaveLength(2);
    const secondMyObjectA = runtimeScene.getObjects('MyObjectA')[1];
    expect(secondMyObjectA.getVariables().has('TestVariable')).toBe(true);
    expect(
      secondMyObjectA.getVariables().get('TestVariable').getAsNumber()
    ).toBe(2);

    // ... and the first, "already created" MyObjectA is only picked by the second event.
    // The first event with the "Create" will only pick the "just created" object.
    expect(
      firstMyObjectA.getVariables().get('TestVariable').getAsNumber()
    ).toBe(3);

    // Object B has nothing to do with the "Create", its variable is just incremented again.
    expect(myObjectB.getVariables().get('TestVariable').getAsNumber()).toBe(2);

    eventsFunction.delete();
    project.delete();
  });

  it('generates working functions with groups', function () {
    // Create events that increment twice the variable of a group, and
    // only once for the 3rd parameter.
    const eventsSerializerElement = gd.Serializer.fromJSObject([
      makeAddOneToObjectTestVariableEvent('MyObjectGroup'),
      makeAddOneToObjectTestVariableEvent('MyObjectGroup'),
      makeAddOneToObjectTestVariableEvent('ObjectParam3'),
    ]);

    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunction = new gd.EventsFunction();
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    const group = eventsFunction.getObjectGroups().insert('MyObjectGroup', 0);
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
    objectParameter.setType('object');
    objectParameter.setName('ObjectParam3');
    eventsFunction.getParameters().push_back(objectParameter);
    objectParameter.delete();

    const runCompiledEvents = generateCompiledEventsForEventsFunction(
      gd,
      project,
      eventsFunction
    );

    // Check that when running the function, the group works in the function.
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runtimeScene.getOnceTriggers().startNewFrame();
    const myObjectA = runtimeScene.createObject('MyObjectA');
    const myObjectB = runtimeScene.createObject('MyObjectB');
    const myObjectC = runtimeScene.createObject('MyObjectC');
    const myObjectD = runtimeScene.createObject('MyObjectD');
    const objectParam1Lists = gdjs.Hashtable.newFrom({
      // The first parameter is itself a collection of multiple objects
      // with different names.
      MyObjectA: [myObjectA],
      MyObjectB: [myObjectB],
    });
    const objectParam2Lists = gdjs.Hashtable.newFrom({
      MyObjectC: [myObjectC],
    });
    const objectParam3Lists = gdjs.Hashtable.newFrom({
      MyObjectD: [myObjectD],
    });

    runCompiledEvents(gdjs, runtimeScene, [
      objectParam1Lists,
      objectParam2Lists,
      objectParam3Lists,
    ]);

    expect(runtimeScene.getObjects('MyObjectA')).toHaveLength(1);
    const firstMyObjectA = runtimeScene.getObjects('MyObjectA')[0];
    expect(
      firstMyObjectA.getVariables().get('TestVariable').getAsNumber()
    ).toBe(2);

    expect(runtimeScene.getObjects('MyObjectB')).toHaveLength(1);
    const firstMyObjectB = runtimeScene.getObjects('MyObjectB')[0];
    expect(
      firstMyObjectB.getVariables().get('TestVariable').getAsNumber()
    ).toBe(2);

    expect(runtimeScene.getObjects('MyObjectC')).toHaveLength(1);
    const firstMyObjectC = runtimeScene.getObjects('MyObjectC')[0];
    expect(
      firstMyObjectC.getVariables().get('TestVariable').getAsNumber()
    ).toBe(2);

    expect(runtimeScene.getObjects('MyObjectD')).toHaveLength(1);
    const firstMyObjectD = runtimeScene.getObjects('MyObjectD')[0];
    expect(
      firstMyObjectD.getVariables().get('TestVariable').getAsNumber()
    ).toBe(1);

    eventsFunction.delete();
    project.delete();
  });

  it('generates a working function with BuiltinCommonInstructions::Once', function () {
    // Event to create an object, then add
    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        disabled: false,
        folded: false,
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: {
              inverted: false,
              value: 'BuiltinCommonInstructions::Once',
            },
            parameters: [],
            subInstructions: [],
          },
        ],
        actions: [
          {
            type: { inverted: false, value: 'ModVarScene' },
            parameters: ['SuccessVariable', '+', '1'],
            subInstructions: [],
          },
        ],
        events: [],
      },
      {
        disabled: false,
        folded: false,
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: {
              inverted: false,
              value: 'BuiltinCommonInstructions::Once',
            },
            parameters: [],
            subInstructions: [],
          },
        ],
        actions: [
          {
            type: { inverted: false, value: 'ModVarScene' },
            parameters: ['SuccessVariable', '+', '1'],
            subInstructions: [],
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

    const runCompiledEvents = generateCompiledEventsForEventsFunction(
      gd,
      project,
      eventsFunction
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runtimeScene.getOnceTriggers().startNewFrame();
    runCompiledEvents(gdjs, runtimeScene, []);
    runtimeScene.getOnceTriggers().startNewFrame();
    runCompiledEvents(gdjs, runtimeScene, []);

    // Check that after running the compiled events twice, actions were
    // executed only twice.
    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(2);

    eventsFunction.delete();
    project.delete();
  });

  it('generates a working function with BuiltinCommonInstructions::Once with stable IDs across compilation', function () {
    // Create events using the Trigger Once condition.
    const eventsSerializerElement = gd.Serializer.fromJSON(
      JSON.stringify([
        {
          disabled: false,
          folded: false,
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            {
              type: {
                inverted: false,
                value: 'BuiltinCommonInstructions::Once',
              },
              parameters: [],
              subInstructions: [],
            },
          ],
          actions: [
            {
              type: { inverted: false, value: 'ModVarScene' },
              parameters: ['SuccessVariable', '+', '1'],
              subInstructions: [],
            },
          ],
          events: [],
        },
        {
          disabled: false,
          folded: false,
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            {
              type: {
                inverted: false,
                value: 'BuiltinCommonInstructions::Once',
              },
              parameters: [],
              subInstructions: [],
            },
          ],
          actions: [
            {
              type: { inverted: false, value: 'ModVarScene' },
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

    const runCompiledEvents = generateCompiledEventsForEventsFunction(
      gd,
      project,
      eventsFunction
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runtimeScene.getOnceTriggers().startNewFrame();
    runCompiledEvents(gdjs, runtimeScene, []);
    runtimeScene.getOnceTriggers().startNewFrame();
    runCompiledEvents(gdjs, runtimeScene, []);

    // Check that after running the compiled events twice, actions were
    // executed only twice.
    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(2);

    // Check that compiling again the events will result in stable ids for Trigger Once conditions
    // (trigger once should not be launched again), even after a copy of the events function.
    const eventsFunctionCopy = eventsFunction.clone();
    const runCompiledEvents2 = generateCompiledEventsForEventsFunction(
      gd,
      project,
      eventsFunctionCopy
    );
    runtimeScene.getOnceTriggers().startNewFrame();
    runCompiledEvents2(gdjs, runtimeScene, []);
    runtimeScene.getOnceTriggers().startNewFrame();
    runCompiledEvents2(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(2);

    eventsFunction.delete();
    eventsFunctionCopy.delete();
    project.delete();
  });

  it('generates a working function with asynchronous actions', function () {
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
              type: {
                inverted: false,
                value: 'Wait',
              },
              parameters: ['1.5'],
              subInstructions: [],
            },
            {
              type: { inverted: false, value: 'ModVarScene' },
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
    runtimeScene.getAsyncTasksManager().markAllFakeSyncTasksAsFinished();
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
              type: {
                inverted: false,
                value: 'Wait',
              },
              parameters: ['1.5'],
              subInstructions: [],
            },
            {
              type: { inverted: false, value: 'ModVarScene' },
              parameters: ['SuccessVariable', '+', '1'],
              subInstructions: [],
            },
            {
              type: {
                inverted: false,
                value: 'Wait',
              },
              parameters: ['1.5'],
              subInstructions: [],
            },
            {
              type: { inverted: false, value: 'ModVarScene' },
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
    runtimeScene.getAsyncTasksManager().markAllFakeSyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeSyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(3);
  });

  it('generates a working function with asynchronous actions referring to the function arguments', function () {
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
              type: {
                inverted: false,
                value: 'Wait',
              },
              parameters: ['1.5'],
              subInstructions: [],
            },
            {
              type: { inverted: false, value: 'ModVarScene' },
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
    runtimeScene.getAsyncTasksManager().markAllFakeSyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(5);
  });

  it('generates a working function with asynchronous actions referring to objects', function () {
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
              type: { inverted: false, value: 'ModVarObjet' },
              parameters: [
                'MyObjectA',
                'TestVariable',
                '+',
                'GetArgumentAsNumber("IncreaseValue")',
              ],
              subInstructions: [],
            },
            {
              type: {
                inverted: false,
                value: 'Wait',
              },
              parameters: ['1.5'],
              subInstructions: [],
            },
            {
              type: { inverted: false, value: 'ModVarObjet' },
              parameters: [
                'MyObjectA',
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
    parameter.setName('MyObjectA');
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
    expect(myObjectA.getVariables().get('TestVariable').getAsNumber()).toBe(5);

    // Process the tasks (but the task is not finished yet).
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(myObjectA.getVariables().get('TestVariable').getAsNumber()).toBe(5);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeSyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(myObjectA.getVariables().get('TestVariable').getAsNumber()).toBe(10);
  });

  // TODO: Add a test simulating the deletion of an object before a task is finished,
  // and the task then updating the other object instances variable.

  it('generates a lifecycle function that registers itself, and unregister itself if hot-reloaded', function () {
    // Event to create an object, then add
    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        disabled: false,
        folded: false,
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { inverted: false, value: 'ModVarScene' },
            parameters: ['SuccessVariable', '+', '1'],
            subInstructions: [],
          },
        ],
        events: [],
      },
    ]);

    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunction = new gd.EventsFunction();
    eventsFunction.setName('onScenePreEvents');
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);

    const runCompiledEvents = generateCompiledEventsForEventsFunction(
      gd,
      project,
      eventsFunction,
      {
        dontCallGeneratedFunction: true,
      }
    );

    const { gdjs, runtimeScene, mocks } = makeMinimalGDJSMock();
    runCompiledEvents(
      gdjs,
      runtimeScene /*, Don't pass arguments to not run the function. */
    );
    mocks.runRuntimeScenePreEventsCallbacks();
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
    mocks.runRuntimeScenePreEventsCallbacks();
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(2);

    // Simulate a hot reloading by recompiling the function and running it again.
    const runHotReloadedCompiledEvents =
      generateCompiledEventsForEventsFunction(gd, project, eventsFunction, {
        dontCallGeneratedFunction: true,
      });
    runHotReloadedCompiledEvents(
      gdjs,
      runtimeScene /*, Don't pass arguments to not run the function. */
    );

    // Ensure that when we call the callbacks, it's called only once (not registered twice).
    mocks.runRuntimeScenePreEventsCallbacks();
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(3);
    mocks.runRuntimeScenePreEventsCallbacks();
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(4);

    eventsFunction.delete();
    project.delete();
  });
});

// TODO: Split this file in GDJSBasicCodeGenerationIntegrationTests.js
// TODO: Split this file in GDJSAsyncCodeGenerationIntegrationTests.js
// TODO: Split this file in GDJSTriggerOnceCodeGenerationIntegrationTests.js
// (and import the helpers below as needed).

/**
 * Generate the code from events (using GDJS platform)
 * and create a JavaScript function that runs it.
 *
 * The JavaScript function must be called with the `runtimeScene` to be used.
 * In this context, GDJS game engine does not exist, so you must pass a mock
 * to it to validate that the events are working properly.
 */
function generateCompiledEventsForEventsFunction(gd, project, eventsFunction) {
  const namespace = 'functionNamespace';
  const eventsFunctionsExtensionCodeGenerator =
    new gd.EventsFunctionsExtensionCodeGenerator(project);

  const includeFiles = new gd.SetString();
  const code =
    eventsFunctionsExtensionCodeGenerator.generateFreeEventsFunctionCompleteCode(
      eventsFunction,
      namespace,
      includeFiles,
      true
    );

  eventsFunctionsExtensionCodeGenerator.delete();
  includeFiles.delete();

  // Uncomment to see the generated code:
  // console.log(code);

  // Create a "real" JavaScript function with the generated code.
  const runCompiledEventsFunction = new Function(
    'gdjs',
    'runtimeScene',
    'functionArguments',
    // Expose some global variables that are expected by the generated code:
    `Hashtable = gdjs.Hashtable;` +
      '\n' +
      code +
      // Return the function for it to be called (if arguments are passed).
      `;
return functionArguments ?
  functionNamespace.func.apply(functionNamespace.func, [runtimeScene, ...functionArguments, runtimeScene]) :
  null;`
  );

  return runCompiledEventsFunction;
}

/** Helper to create compiled events from serialized events, creating a project and the events function. */
function generateCompiledEventsFromSerializedEvents(
  gd,
  eventsSerializerElement
) {
  const project = new gd.ProjectHelper.createNewGDJSProject();
  const eventsFunction = new gd.EventsFunction();
  eventsFunction.getEvents().unserializeFrom(project, eventsSerializerElement);

  const runCompiledEvents = generateCompiledEventsForEventsFunction(
    gd,
    project,
    eventsFunction
  );

  eventsFunction.delete();
  project.delete();

  return runCompiledEvents;
}
