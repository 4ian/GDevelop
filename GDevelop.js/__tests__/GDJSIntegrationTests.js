const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

describe('libGD.js - GDJS integration tests', function () {
  let gd = null;
  beforeAll((done) =>
    initializeGDevelopJs().then((module) => {
      gd = module;
      done();
    })
  );

  describe('EventsFunctionsExtensionCodeGenerator', () => {
    it('can generate code for an events function', function () {
      const project = new gd.ProjectHelper.createNewGDJSProject();

      const includeFiles = new gd.SetString();
      const eventsFunction = new gd.EventsFunction();

      // Create a repeat event with...
      const eventsList = eventsFunction.getEvents();
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
                parameters: ['MyVariable', '=', '1'],
                subInstructions: [],
              },
            ],
            events: [],
          },
        ])
      );
      eventsList.unserializeFrom(project, serializerElement);

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

      var compiledFunction = new Function(
        'runtimeScene',
        `${code}
      return functionNamespace.func(runtimeScene, runtimeScene);`
      );
      expect.assertions(2);
      compiledFunction({
        getVariables: () => ({
          get: (variableName) => {
            expect(variableName).toBe('MyVariable');
            return {
              setNumber: (value) => {
                expect(value).toBe(1);
              },
            };
          },
        }),
      });
    });
  });
});
