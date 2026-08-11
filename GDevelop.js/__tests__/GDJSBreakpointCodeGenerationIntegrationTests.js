const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeTestExtensions } = require('../TestUtils/TestExtensions');

describe('libGD.js - GDJS breakpoint code generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
    makeTestExtensions(gd);
  });

  const subEventUuid = '11111111-2222-3333-4444-555555555555';

  // An event with an async action, and a sub-event that preprocessing moves
  // into the synthetic AsyncEvent wrapper (see BaseEvent::PreprocessAsyncActions).
  const generateCodeForAsyncEventWithSubEvent = (
    generateBreakpointInstrumentation
  ) => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const eventsFunction = new gd.EventsFunction();
    eventsFunction.setName('MyFunction');

    const eventsSerializerElement = gd.Serializer.fromJSON(
      JSON.stringify([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [{ type: { value: 'Wait' }, parameters: ['1.5'] }],
          events: [
            {
              type: 'BuiltinCommonInstructions::Standard',
              persistentUuid: subEventUuid,
              conditions: [],
              actions: [
                {
                  type: { value: 'ModVarScene' },
                  parameters: ['SuccessVariable', '+', '1'],
                },
              ],
            },
          ],
        },
      ])
    );
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    eventsSerializerElement.delete();

    const extension = new gd.EventsFunctionsExtension();
    const codeGenerator = new gd.EventsFunctionsExtensionCodeGenerator(project);
    const includeFiles = new gd.SetString();
    const code = codeGenerator.generateFreeEventsFunctionCompleteCode(
      extension,
      eventsFunction,
      'namespace',
      includeFiles,
      /* compilationForRuntime= */ false,
      generateBreakpointInstrumentation
    );
    codeGenerator.delete();
    includeFiles.delete();
    extension.delete();
    eventsFunction.delete();
    project.delete();

    return code;
  };

  // Regression test: a sub-event moved into the AsyncEvent wrapper lost its
  // persistentUuid (gd::EventsList's copy always drops it), so a breakpoint
  // sequenced after an async action (e.g. a tween) never triggered.
  it('keeps a sub-event persistentUuid after it is moved into an async wrapper', function () {
    const code = generateCodeForAsyncEventWithSubEvent(true);

    expect(code).toContain(`checkBreakpoint`);
    expect(code).toContain(subEventUuid);
  });

  it('generates no instrumentation for the same events when it is not asked for', function () {
    const code = generateCodeForAsyncEventWithSubEvent(false);

    expect(code).not.toContain('checkBreakpoint');
    expect(code).not.toContain(subEventUuid);
  });
});
