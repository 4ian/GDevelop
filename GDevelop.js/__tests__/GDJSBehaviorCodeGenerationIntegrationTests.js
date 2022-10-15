const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');

describe('libGD.js - GDJS Behavior Code Generation integration tests', function () {
  let gd = null;
  beforeAll((done) =>
    initializeGDevelopJs().then((module) => {
      gd = module;
      done();
    })
  );

  it('generates a working empty behavior', function () {
    // Create an empty behavior
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsBasedBehavior = new gd.EventsBasedBehavior();
    eventsBasedBehavior.setName('MyBehavior');
    eventsBasedBehavior.setFullName('My descriptive name');
    eventsBasedBehavior.setDescription('My description');

    const makeCompiledRuntimeBehavior = generateCompiledRuntimeBehaviorMaker(
      gd,
      project,
      eventsBasedBehavior
    );
    eventsBasedBehavior.delete();
    project.delete();

    // Instanciate the behavior
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const CompiledRuntimeBehavior = makeCompiledRuntimeBehavior(gdjs);
    const behaviorData = {};
    const ownerRuntimeObject = {};
    const behavior = new CompiledRuntimeBehavior(
      runtimeScene,
      behaviorData,
      ownerRuntimeObject
    );

    // Check that doStepPreEvents is always defined
    expect(behavior.doStepPreEvents).not.toBeUndefined();
  });

  it('generates a working behavior with doStepPreEvents using "Trigger Once" condition', function () {
    // Create a new behavior with events in doStepPreEvents
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsBasedBehavior = new gd.EventsBasedBehavior();
    eventsBasedBehavior.setName('MyBehavior');
    eventsBasedBehavior.setFullName('My descriptive name');
    eventsBasedBehavior.setDescription('My description');

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
      },
    ]);
    eventsBasedBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('doStepPreEvents', 0)
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);

    // Instanciate the behavior twice
    const makeCompiledRuntimeBehavior = generateCompiledRuntimeBehaviorMaker(
      gd,
      project,
      eventsBasedBehavior
    );
    eventsBasedBehavior.delete();
    project.delete();

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const CompiledRuntimeBehavior = makeCompiledRuntimeBehavior(gdjs);
    const behaviorData = {};
    const ownerRuntimeObject = {};
    const behavior = new CompiledRuntimeBehavior(
      runtimeScene,
      behaviorData,
      ownerRuntimeObject
    );
    const behavior2 = new CompiledRuntimeBehavior(
      runtimeScene,
      behaviorData,
      ownerRuntimeObject
    );

    // Check that Trigger once is working, separately handled by each behavior instance:
    expect(behavior.doStepPreEvents).not.toBeUndefined();
    behavior.doStepPreEvents();
    behavior2.doStepPreEvents();
    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(2);

    behavior.doStepPreEvents();
    behavior2.doStepPreEvents();
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(2);
  });
});

function generateCompiledRuntimeBehaviorMaker(
  gd,
  project,
  eventsBasedBehavior
) {
  const includeFiles = new gd.SetString();

  const codeNamespace = 'behaviorNamespace';
  const behaviorCodeGenerator = new gd.BehaviorCodeGenerator(project);

  // Generate "mangled names" as required by the code generation
  const behaviorMethodMangledNames = new gd.MapStringString();
  for (
    let i = 0;
    i < eventsBasedBehavior.getEventsFunctions().getEventsFunctionsCount();
    i++
  ) {
    const eventsFunction = eventsBasedBehavior
      .getEventsFunctions()
      .getEventsFunctionAt(i);
    behaviorMethodMangledNames.set(
      eventsFunction.getName(),
      eventsFunction.getName()
    );
  }

  const code = behaviorCodeGenerator.generateRuntimeBehaviorCompleteCode(
    'MyExtension',
    eventsBasedBehavior,
    codeNamespace,
    behaviorMethodMangledNames,
    includeFiles,
    true
  );

  // Create a function with the generated behavior.
  const makeCompiledBehavior = new Function(
    'gdjs',
    `let behaviorNamespace = {};
     let Hashtable = gdjs.Hashtable;
${code}
return behaviorNamespace.MyBehavior;`
  );

  includeFiles.delete();

  return makeCompiledBehavior;
}
