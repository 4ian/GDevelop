const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');
const {
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS localization code generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  it('generates actions, conditions and expressions for the current locale', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'SetCurrentLocale' },
            parameters: ['', '=', '"fr-FR"'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'CurrentLocale' },
            parameters: ['', '=', '"fr-FR"'],
          },
        ],
        actions: [
          {
            type: { value: 'SetCurrentLocale' },
            parameters: ['', '=', 'CurrentLocale() + "-confirmed"'],
          },
        ],
        events: [],
      },
    ]);
    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );
    serializerElement.delete();

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    let locale = 'en';
    gdjs.evtTools.localization = {
      getLocale: () => locale,
      setLocale: (_instanceContainer, newLocale) => {
        locale = newLocale;
      },
    };

    runCompiledEvents(gdjs, runtimeScene, []);

    expect(locale).toBe('fr-FR-confirmed');
  });
});
