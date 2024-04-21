const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');

describe('libGD.js - GDJS Behavior Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

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

    // Instantiate the behavior
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

    // Instantiate the behavior twice
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

  it('generates working behavior with properties (shared or not, with different types), all used in an expression', function () {
    // Create a new behavior with events in doStepPreEvents
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsBasedBehavior = new gd.EventsBasedBehavior();
    eventsBasedBehavior.setName('MyBehavior');
    eventsBasedBehavior.setFullName('My descriptive name');
    eventsBasedBehavior.setDescription('My description');

    // Set up some properties.
    eventsBasedBehavior
      .getPropertyDescriptors()
      .insertNew('MyProperty', 0)
      .setValue('true')
      .setType('Boolean');
    eventsBasedBehavior
      .getPropertyDescriptors()
      .insertNew('MyProperty2', 0)
      .setValue('2')
      .setType('Number');
    eventsBasedBehavior
      .getSharedPropertyDescriptors()
      .insertNew('MySharedProperty', 0)
      .setValue('4')
      .setType('String');
    eventsBasedBehavior
      .getSharedPropertyDescriptors()
      .insertNew('MySharedProperty2', 0)
      .setValue('Test')
      .setType('String');

    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: [
              'SuccessVariable',
              '+',
              'MyProperty + MyProperty2 + MySharedProperty',
            ],
          },
          {
            type: { value: 'ModVarSceneTxt' },
            parameters: [
              'SuccessStringVariable',
              '=',
              'MyProperty + MyProperty2 + MySharedProperty2',
            ],
          },
        ],
      },
    ]);
    eventsBasedBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('doStepPreEvents', 0)
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);

    // Instantiate the behavior
    const makeCompiledRuntimeBehavior = generateCompiledRuntimeBehaviorMaker(
      gd,
      project,
      eventsBasedBehavior,
      { logCode: false }
    );
    eventsBasedBehavior.delete();
    project.delete();

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const CompiledRuntimeBehavior = makeCompiledRuntimeBehavior(gdjs);
    const behaviorData = {
      name: 'MyBehavior',
      type: 'MyBehaviorType',
    };
    const ownerRuntimeObject = new gdjs.RuntimeObject(runtimeScene, {
      name: 'MyObject',
      type: '',
    });
    const behavior = new CompiledRuntimeBehavior(
      runtimeScene,
      behaviorData,
      ownerRuntimeObject
    );
    ownerRuntimeObject.addBehavior(behavior);

    // Check the default values are set.
    expect(behavior._getMyProperty()).toBe(true);
    expect(behavior._getMyProperty2()).toBe(2);
    expect(behavior._sharedData._getMySharedProperty()).toBe('4');

    // Check that all properties getters are working when used in the events:
    behavior.doStepPreEvents();
    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(7);

    expect(runtimeScene.getVariables().has('SuccessStringVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessStringVariable').getAsString()
    ).toBe('true2Test');
  });
});

function generateCompiledRuntimeBehaviorMaker(
  gd,
  project,
  eventsBasedBehavior,
  { logCode } = {}
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

  if (logCode) console.log(code);

  // Create a function returning the generated behavior.
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
