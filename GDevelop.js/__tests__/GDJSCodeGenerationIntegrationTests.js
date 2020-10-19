const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');

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
    runCompiledEvents(gdjs, runtimeScene);

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
    runCompiledEvents(gdjs, runtimeScene);

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
    runCompiledEvents(gdjs, runtimeScene);

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('generates a working function with BuiltinCommonInstructions::Once', function () {
    // Create events using the Trigger Once condition.
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
    runCompiledEvents(gdjs, runtimeScene);
    runtimeScene.getOnceTriggers().startNewFrame();
    runCompiledEvents(gdjs, runtimeScene);

    // Check that after running the compiled events twice, actions were
    // executed only twice.
    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(2);

    eventsFunction.delete();
    project.delete();
  });

  it('generates a working function with BuiltinCommonInstructions::Once', function () {
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
    runCompiledEvents(gdjs, runtimeScene);
    runtimeScene.getOnceTriggers().startNewFrame();
    runCompiledEvents(gdjs, runtimeScene);

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
    runCompiledEvents2(gdjs, runtimeScene);
    runtimeScene.getOnceTriggers().startNewFrame();
    runCompiledEvents2(gdjs, runtimeScene);

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(2);

    eventsFunction.delete();
    eventsFunctionCopy.delete();
    project.delete();
  });
});

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
  const eventsFunctionsExtensionCodeGenerator = new gd.EventsFunctionsExtensionCodeGenerator(
    project
  );

  const includeFiles = new gd.SetString();
  const code = eventsFunctionsExtensionCodeGenerator.generateFreeEventsFunctionCompleteCode(
    eventsFunction,
    namespace,
    includeFiles,
    true
  );

  eventsFunctionsExtensionCodeGenerator.delete();
  includeFiles.delete();

  // Create a "real" JavaScript function with the generated code.
  const runCompiledEvents = new Function(
    'gdjs',
    'runtimeScene',
    `${code};
return functionNamespace.func(runtimeScene, runtimeScene);`
  );

  return runCompiledEvents;
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
