const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsForEventsFunction,
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

/**
 * Helper generating an event, ready to be unserialized, adding 1 to
 * "TestVariable" of the specified object (or object group).
 */
const makeAddOneToObjectTestVariableEvent = (objectName) => ({
  type: 'BuiltinCommonInstructions::Standard',
  conditions: [],
  actions: [
    {
      type: { value: 'ModVarObjet' },
      parameters: [objectName, 'TestVariable', '+', '1'],
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
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Counter', '=', '0'],
          },
        ],
        events: [],
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
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Counter', '+', '1'],
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
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: {
              value: 'BuiltinCommonInstructions::Or',
            },
            parameters: [],
            subInstructions: [
              {
                type: { value: 'Egal' },
                parameters: ['1', '=', '2'],
              },
              {
                type: {
                  value: 'BuiltinCommonInstructions::Or',
                },
                parameters: [],
                subInstructions: [
                  // This should be true and make the entire conditions true.
                  {
                    type: { value: 'StrEqual' },
                    parameters: ['"1"', '=', '"1"'],
                  },
                ],
              },
              {
                type: { value: 'StrEqual' },
                parameters: ['"1"', '=', '"2"'],
              },
            ],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['SuccessVariable', '=', '1'],
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
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: {
              value: 'BuiltinCommonInstructions::And',
            },
            parameters: [],
            subInstructions: [
              {
                type: { value: 'Egal' },
                parameters: ['1', '=', '1'],
              },
              {
                type: {
                  value: 'BuiltinCommonInstructions::And',
                },
                parameters: [],
                subInstructions: [
                  {
                    type: { value: 'Egal' },
                    parameters: ['1', '=', '1'],
                  },
                  {
                    type: {
                      value: 'BuiltinCommonInstructions::And',
                    },
                    parameters: [],
                    subInstructions: [
                      {
                        type: { value: 'Egal' },
                        parameters: ['1', '=', '1'],
                      },
                      {
                        type: { value: 'StrEqual' },
                        parameters: ['"1"', '=', '"1"'],
                      },
                    ],
                  },
                  {
                    type: { value: 'StrEqual' },
                    parameters: ['"1"', '=', '"1"'],
                  },
                ],
              },
              {
                type: { value: 'StrEqual' },
                parameters: ['"1"', '=', '"1"'],
              },
            ],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['SuccessVariable', '=', '1'],
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
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'Create' },
            parameters: ['', 'MyObjectA', '0', '0', ''],
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
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: {
              value: 'BuiltinCommonInstructions::Once',
            },
            parameters: [],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['SuccessVariable', '+', '1'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: {
              value: 'BuiltinCommonInstructions::Once',
            },
            parameters: [],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['SuccessVariable', '+', '1'],
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
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            {
              type: {
                value: 'BuiltinCommonInstructions::Once',
              },
              parameters: [],
            },
          ],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: ['SuccessVariable', '+', '1'],
            },
          ],
          events: [],
        },
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            {
              type: {
                value: 'BuiltinCommonInstructions::Once',
              },
              parameters: [],
            },
          ],
          actions: [
            {
              type: { value: 'ModVarScene' },
              parameters: ['SuccessVariable', '+', '1'],
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

  it('generates a lifecycle function that registers itself, and unregister itself if hot-reloaded', function () {
    // Event to create an object, then add
    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['SuccessVariable', '+', '1'],
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
      eventsFunction
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
      generateCompiledEventsForEventsFunction(gd, project, eventsFunction);
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
