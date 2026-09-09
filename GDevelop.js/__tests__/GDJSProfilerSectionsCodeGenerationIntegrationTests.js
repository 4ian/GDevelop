const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

describe('libGD.js - GDJS profiler sections code generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  const makeExtensionWithFunctionUsingAGroup = (project) => {
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsFunction = eventsFunctionsExtension
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventsFunction.getEvents().unserializeFrom(
      project,
      gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Group',
          name: 'My group',
          events: [
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [],
              actions: [],
            },
          ],
        },
      ])
    );
    return { eventsFunctionsExtension, eventsFunction };
  };

  const generateFreeFunctionCode = (
    project,
    eventsFunctionsExtension,
    eventsFunction,
    compilationForRuntime
  ) => {
    const codeGenerator = new gd.EventsFunctionsExtensionCodeGenerator(project);
    const includeFiles = new gd.SetString();
    const code = codeGenerator.generateFreeEventsFunctionCompleteCode(
      eventsFunctionsExtension,
      eventsFunction,
      'functionNamespace',
      includeFiles,
      compilationForRuntime,
      false
    );
    codeGenerator.delete();
    includeFiles.delete();
    return code;
  };

  it('wraps the events of a function in a profiler section, for previews only', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const { eventsFunctionsExtension, eventsFunction } =
      makeExtensionWithFunctionUsingAGroup(project);

    const previewCode = generateFreeFunctionCode(
      project,
      eventsFunctionsExtension,
      eventsFunction,
      false
    );
    // The function itself is a section...
    expect(previewCode).toContain(
      'runtimeScene.getScene().getProfiler().begin("MyExtension::MyFunction")'
    );
    // ...closed even when the events return early.
    expect(previewCode).toMatch(
      /try \{[\s\S]*\} finally \{\s*if \(runtimeScene\.getScene\(\)\.getProfiler\(\)\) \{ runtimeScene\.getScene\(\)\.getProfiler\(\)\.end\("MyExtension::MyFunction"\); \}/
    );
    // ...and the groups inside it are sections too, through `getScene()` so
    // that it also works in the functions of events-based objects.
    expect(previewCode).toContain(
      'runtimeScene.getScene().getProfiler().begin("My group")'
    );
    expect(previewCode).not.toContain('runtimeScene.getProfiler()');

    // Exported games are never slowed down by the profiler.
    const runtimeCode = generateFreeFunctionCode(
      project,
      eventsFunctionsExtension,
      eventsFunction,
      true
    );
    expect(runtimeCode).not.toContain('getProfiler');
    expect(runtimeCode).not.toContain('finally');

    project.delete();
  });

  it('names the sections of behavior and object functions after the behavior or object', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedBehavior = eventsFunctionsExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);
    eventsBasedBehavior.setObjectType('');
    eventsBasedBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('MyMethod', 0);

    const behaviorCodeGenerator = new gd.BehaviorCodeGenerator(project);
    const includeFiles = new gd.SetString();
    const behaviorCode =
      behaviorCodeGenerator.generateRuntimeBehaviorCompleteCode(
        eventsFunctionsExtension,
        eventsBasedBehavior,
        'behaviorNamespace',
        new gd.MapStringString(),
        includeFiles,
        false,
        false
      );
    behaviorCodeGenerator.delete();
    includeFiles.delete();
    expect(behaviorCode).toContain(
      '.begin("MyExtension::MyBehavior::MyMethod")'
    );
    expect(behaviorCode).toContain('.end("MyExtension::MyBehavior::MyMethod")');

    project.delete();
  });
});
