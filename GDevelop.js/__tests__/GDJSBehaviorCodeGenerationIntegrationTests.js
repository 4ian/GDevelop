const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsForEventsBasedBehavior,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Behavior Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  it('generates a working empty behavior', function () {
    // Create an empty behavior
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedBehavior = eventsFunctionsExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);

    const { behavior } = generatedBehavior(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      { logCode: false }
    );

    // Check that doStepPreEvents is always defined
    expect(behavior.doStepPreEvents).not.toBeUndefined();
  });

  it('generates a working behavior with doStepPreEvents using "Trigger Once" condition', function () {
    // Create a new behavior with events in doStepPreEvents
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedBehavior = eventsFunctionsExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);

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
    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedBehavior
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const CompiledRuntimeBehavior = generateCompiledEventsForEventsBasedBehavior(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      gdjs,
      {logCode: false}
    );
    project.delete();

    const behaviorData = {};
    const ownerRuntimeObject = {};
    // Instantiate the behavior twice
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
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedBehavior = eventsFunctionsExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);

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
    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedBehavior
    );

    const { runtimeScene, behavior } = generatedBehavior(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      { logCode: false }
    );

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

  it('Can use a property in a variable action', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedBehavior = eventsFunctionsExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);

    eventsBasedBehavior
      .getPropertyDescriptors()
      .insertNew('MyProperty', 0)
      .setValue('123')
      .setType('Number');

    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MyProperty', '=', '456'],
          },
        ],
      },
    ]);
    eventsBasedBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0)
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedBehavior
    );

    const { runtimeScene, behavior } = generatedBehavior(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      { logCode: false }
    );

    // Check the default value is set.
    expect(behavior._getMyProperty()).toBe(123);

    behavior.MyFunction();
    expect(behavior._getMyProperty()).toBe(456);
  });

  it('Can use a property in a variable condition', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const scene = project.insertNewLayout('MyScene', 0);
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedBehavior = eventsFunctionsExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);

    eventsBasedBehavior
      .getPropertyDescriptors()
      .insertNew('MyProperty', 0)
      .setValue('123')
      .setType('Number');

    eventsFunctionsExtension
      .getSceneVariables()
      .insertNew('MyVariable', 0)
      .setValue(0);

    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'NumberVariable' },
            parameters: ['MyProperty', '=', '123'],
          },
        ],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MyVariable', '=', '456'],
          },
        ],
      },
    ]);
    eventsBasedBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0)
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedBehavior
    );

    const { runtimeScene, behavior } = generatedBehavior(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    behavior.MyFunction();
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(456);
  });

  it('Can use a property in a variable condition (with name collisions)', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const scene = project.insertNewLayout('MyScene', 0);
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedBehavior = eventsFunctionsExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);

    eventsBasedBehavior
      .getPropertyDescriptors()
      .insertNew('MyIdentifier', 0)
      .setValue('123')
      .setType('Number');

    // Extension scene variable with the same name as the property.
    eventsFunctionsExtension
      .getSceneVariables()
      .insertNew('MyIdentifier', 0)
      .setValue(222);

    eventsFunctionsExtension
      .getSceneVariables()
      .insertNew('MyVariable', 0)
      .setValue(0);

    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'NumberVariable' },
            parameters: ['MyIdentifier', '=', '123'],
          },
        ],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MyVariable', '=', '456'],
          },
        ],
      },
    ]);
    eventsBasedBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0)
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedBehavior
    );

    const { runtimeScene, behavior } = generatedBehavior(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    behavior.MyFunction();
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(456);
  });

  it('Can use a parameter in a variable condition', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedBehavior = eventsFunctionsExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);

    eventsFunctionsExtension
      .getSceneVariables()
      .insertNew('MyVariable', 0)
      .setValue(0);

    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'NumberVariable' },
            parameters: ['MyParameter', '=', '123'],
          },
        ],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MyVariable', '=', '456'],
          },
        ],
      },
    ]);
    const eventsFunction = eventsBasedBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedBehavior
    );
    const parameter = eventsFunction
      .getParameters()
      .insertNewParameter(
        'MyParameter',
        eventsFunction.getParameters().getParametersCount()
      );
    parameter.setType('number');

    const { runtimeScene, behavior } = generatedBehavior(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    behavior.MyFunction(123);
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(456);
  });

  it('Can use a parameter in a variable condition (with name collisions)', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedBehavior = eventsFunctionsExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);

    // Property with the same name as the parameter.
    eventsBasedBehavior
      .getPropertyDescriptors()
      .insertNew('MyIdentifier', 0)
      .setValue('111')
      .setType('Number');

    // Extension scene variable with the same name as the parameter.
    eventsFunctionsExtension
      .getSceneVariables()
      .insertNew('MyIdentifier', 0)
      .setValue(222);

    eventsFunctionsExtension
      .getSceneVariables()
      .insertNew('MyVariable', 0)
      .setValue(0);

    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'NumberVariable' },
            parameters: ['MyIdentifier', '=', '123'],
          },
        ],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MyVariable', '=', '456'],
          },
        ],
      },
    ]);
    const eventsFunction = eventsBasedBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedBehavior
    );
    const parameter = eventsFunction
      .getParameters()
      .insertNewParameter(
        'MyIdentifier',
        eventsFunction.getParameters().getParametersCount()
      );
    parameter.setType('number');

    const { runtimeScene, behavior } = generatedBehavior(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    behavior.MyFunction(123);
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(456);
  });

  it('Can use a local variable in a variable condition (with name collisions)', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedBehavior = eventsFunctionsExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);

    // Property with the same name as the local variable.
    eventsBasedBehavior
      .getPropertyDescriptors()
      .insertNew('MyIdentifier', 0)
      .setValue('111')
      .setType('Number');

    // Extension scene variable with the same name as the local variable.
    eventsFunctionsExtension
      .getSceneVariables()
      .insertNew('MyIdentifier', 0)
      .setValue(222);

    eventsFunctionsExtension
      .getSceneVariables()
      .insertNew('MyVariable', 0)
      .setValue(0);

    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        variables: [
          {
            name: 'MyIdentifier',
            type: 'number',
            value: 123,
          },
        ],
        conditions: [
          {
            type: { value: 'NumberVariable' },
            parameters: ['MyIdentifier', '=', '123'],
          },
        ],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MyVariable', '=', '456'],
          },
        ],
      },
    ]);
    const eventsFunction = eventsBasedBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedBehavior
    );
    // Parameter with the same name as the local variable.
    const parameter = eventsFunction
      .getParameters()
      .insertNewParameter(
        'MyIdentifier',
        eventsFunction.getParameters().getParametersCount()
      );
    parameter.setType('number');

    const { runtimeScene, behavior } = generatedBehavior(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    behavior.MyFunction(333);
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(456);
  });
});

function generatedBehavior(
  gd,
  project,
  eventsFunctionsExtension,
  eventsBasedBehavior,
  options = {}
) {
  const serializedProjectElement = new gd.SerializerElement();
  project.serializeTo(serializedProjectElement);
  const serializedSceneElement = new gd.SerializerElement();
  const scene = project.insertNewLayout('MyScene', 0);
  scene.serializeTo(serializedSceneElement);
  const { gdjs, runtimeScene } = makeMinimalGDJSMock({
    gameData: JSON.parse(gd.Serializer.toJSON(serializedProjectElement)),
    sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
  });

  const CompiledRuntimeBehavior = generateCompiledEventsForEventsBasedBehavior(
    gd,
    project,
    eventsFunctionsExtension,
    eventsBasedBehavior,
    gdjs,
    options
  );
  serializedProjectElement.delete();
  serializedSceneElement.delete();
  project.delete();

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

  return { gdjs, runtimeScene, behavior };
}
