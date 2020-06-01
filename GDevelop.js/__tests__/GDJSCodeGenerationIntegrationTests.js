const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

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
    const serializerElement = gd.Serializer.fromJSON(
      JSON.stringify([
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
      ])
    );

    var runCompiledEvents = generateCompiledEvents(gd, serializerElement);

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene);

    expect(runtimeScene.getVariables().has('Counter')).toBe(true);
    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(4);
  });

  it('generates a working function with nested Or and StrEqual', function () {
    // Create nested events using Or and StrEqual conditions
    const serializerElement = gd.Serializer.fromJSON(
      JSON.stringify([
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
      ])
    );

    var runCompiledEvents = generateCompiledEvents(gd, serializerElement);

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene);

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('generates a working function with nested And and StrEqual', function () {
    // Create nested events using And and StrEqual conditions
    const serializerElement = gd.Serializer.fromJSON(
      JSON.stringify([
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
      ])
    );

    var runCompiledEvents = generateCompiledEvents(gd, serializerElement);

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene);

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
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
function generateCompiledEvents(gd, eventsSerializerElement) {
  const project = new gd.ProjectHelper.createNewGDJSProject();
  const includeFiles = new gd.SetString();
  const eventsFunction = new gd.EventsFunction();

  eventsFunction.getEvents().unserializeFrom(project, eventsSerializerElement);

  const namespace = 'functionNamespace';
  const eventsFunctionsExtensionCodeGenerator = new gd.EventsFunctionsExtensionCodeGenerator(
    project
  );
  const code = eventsFunctionsExtensionCodeGenerator.generateFreeEventsFunctionCompleteCode(
    eventsFunction,
    namespace,
    includeFiles,
    true
  );

  // Create a function with the generated code.
  const runCompiledEvents = new Function(
    'gdjs',
    'runtimeScene',
    `${code}
return functionNamespace.func(runtimeScene, runtimeScene);`
  );

  eventsFunctionsExtensionCodeGenerator.delete();
  eventsFunction.delete();
  includeFiles.delete();
  project.delete();

  return runCompiledEvents;
}

/**
 * Create a minimal mock of GDJS with a RuntimeScene (`gdjs.RuntimeScene`),
 * supporting setting a variable (just enough to validate events logic).
 */
function makeMinimalGDJSMock() {
  const runtimeSceneVariables = {};

  return {
    gdjs: {
      evtTools: {
        common: { getVariableNumber: (variable) => variable.getAsNumber() },
      },
    },
    // A minimal implementation of `gdjs.RuntimeScene` and variables for testing:
    runtimeScene: {
      getVariables: () => ({
        get: (variableName) => ({
          add: (value) => {
            runtimeSceneVariables[variableName] += value;
          },
          setNumber: (value) => {
            runtimeSceneVariables[variableName] = value;
          },
          getAsNumber: () => {
            return runtimeSceneVariables[variableName];
          },
        }),
        has: (variableName) => !!runtimeSceneVariables[variableName],
      }),
    },
  };
}
