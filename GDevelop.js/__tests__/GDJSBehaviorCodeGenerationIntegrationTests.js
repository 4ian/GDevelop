const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsForEventsBasedBehavior,
  generateCompiledEventsForLayout,
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

  it('Can use a property in a variable action when a parameter with the same name exits', () => {
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
      .insertNew('MyIdentifier', 0)
      .setValue('123')
      .setType('Number');

    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MyIdentifier', '=', '456'],
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
    // Add a parameter with the same name as the property.
    // It won't be used as SetNumberVariable has a variableOrProperty parameter.
    const eventsFunction = eventsBasedBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
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
    expect(behavior._getMyIdentifier()).toBe(123);

    behavior.MyFunction(222);
    expect(behavior._getMyIdentifier()).toBe(456);
  });

  it('Can use a shared property in a variable action', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedBehavior = eventsFunctionsExtension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);

    eventsBasedBehavior
      .getSharedPropertyDescriptors()
      .insertNew('MySharedProperty', 0)
      .setValue('123')
      .setType('Number');

    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MySharedProperty', '=', '456'],
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
    expect(behavior._sharedData._getMySharedProperty()).toBe(123);

    behavior.MyFunction();
    expect(behavior._sharedData._getMySharedProperty()).toBe(456);
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

  it('Can use a shared property in a variable condition', () => {
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
      .getSharedPropertyDescriptors()
      .insertNew('MySharedProperty', 0)
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
            parameters: ['MySharedProperty', '=', '123'],
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

  describe('Object parameter creation (FireBullet-like behavior)', () => {
    it('Picks only the instances created by a behavior action via an object parameter', () => {
      // A behavior MyBehavior has a custom action MyAction that takes an
      // object as parameter. The action's events use Create twice on the
      // object passed as parameter, mimicking a FireBullet behavior.
      //
      // The scene contains two objects: Bullet (the parameter type) and
      // Cannon (the object holding the behavior). The scene events first
      // create one Bullet directly (without going through the behavior),
      // and in a subsequent event call MyBehavior::MyAction(Bullet) on the
      // Cannon, then increment a Counter on the picked Bullet. Only the
      // two newly created Bullets must be picked by this increment - not
      // the one created in the previous scene event.
      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
        'MyExtension',
        0
      );
      const eventsBasedBehavior = eventsFunctionsExtension
        .getEventsBasedBehaviors()
        .insertNew('MyBehavior', 0);

      // Behavior's MyAction creates the parameter object twice.
      const behaviorEventsSerializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Create' },
              parameters: ['', 'MyObjectParam', '0', '0', ''],
            },
            {
              type: { value: 'Create' },
              parameters: ['', 'MyObjectParam', '0', '0', ''],
            },
          ],
        },
      ]);
      const behaviorEventsFunction = eventsBasedBehavior
        .getEventsFunctions()
        .insertNewEventsFunction('MyAction', 0);
      behaviorEventsFunction
        .getEvents()
        .unserializeFrom(project, behaviorEventsSerializerElement);
      behaviorEventsSerializerElement.delete();
      gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
        eventsFunctionsExtension,
        eventsBasedBehavior
      );
      // Add the object parameter used in the behavior's events.
      const objectParameter = behaviorEventsFunction
        .getParameters()
        .insertNewParameter(
          'MyObjectParam',
          behaviorEventsFunction.getParameters().getParametersCount()
        );
      objectParameter.setType('object');

      // Scene with the two objects:
      // - Bullet, the object passed as parameter
      // - Cannon, the object holding the behavior
      const layout = project.insertNewLayout('MyScene', 0);
      layout.getObjects().insertNewObject(project, 'Sprite', 'Bullet', 0);
      const cannon = layout
        .getObjects()
        .insertNewObject(project, 'Sprite', 'Cannon', 1);
      cannon.addNewBehavior(
        project,
        'MyExtension::MyBehavior',
        'MyBehavior'
      );

      // Scene events:
      // - First event: create one Bullet directly.
      // - Second event: call the behavior's MyAction passing Bullet, then
      //   increment Counter on the picked Bullets.
      const layoutEventsSerializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Create' },
              parameters: ['', 'Bullet', '0', '0', ''],
            },
          ],
        },
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'MyExtension::MyBehavior::MyAction' },
              parameters: ['Cannon', 'MyBehavior', 'Bullet'],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: ['Bullet', 'Counter', '+', '1'],
            },
          ],
        },
      ]);
      layout
        .getEvents()
        .unserializeFrom(project, layoutEventsSerializerElement);
      layoutEventsSerializerElement.delete();

      // Serialize before we delete the project, since the mock needs the
      // project/scene data to instantiate the runtime scene.
      const serializedProjectElement = new gd.SerializerElement();
      project.serializeTo(serializedProjectElement);
      const serializedSceneElement = new gd.SerializerElement();
      layout.serializeTo(serializedSceneElement);

      const { gdjs, runtimeScene } = makeMinimalGDJSMock({
        gameData: JSON.parse(gd.Serializer.toJSON(serializedProjectElement)),
        sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
      });

      // Compile the behavior - this also registers it on the gdjs mock.
      const CompiledRuntimeBehavior =
        generateCompiledEventsForEventsBasedBehavior(
          gd,
          project,
          eventsFunctionsExtension,
          eventsBasedBehavior,
          gdjs,
          { logCode: false }
        );

      // Compile the layout events.
      const runCompiledLayoutEvents = generateCompiledEventsForLayout(
        gd,
        project,
        layout,
        false
      );

      serializedProjectElement.delete();
      serializedSceneElement.delete();
      project.delete();

      // Manually create a Cannon instance with MyBehavior attached: the
      // minimal GDJS mock does not auto-instantiate behaviors from the
      // scene data.
      const cannonInstance = runtimeScene.createObject('Cannon');
      const behaviorInstance = new CompiledRuntimeBehavior(
        runtimeScene,
        { name: 'MyBehavior', type: 'MyExtension::MyBehavior' },
        cannonInstance
      );
      cannonInstance.addBehavior(behaviorInstance);

      runCompiledLayoutEvents(gdjs, runtimeScene);

      // Three Bullets should exist on the scene: one created directly in
      // the first scene event, plus the two created by the behavior's
      // action via the object parameter.
      const bulletInstances = runtimeScene.getObjects('Bullet');
      expect(bulletInstances.length).toBe(3);

      // Only the two Bullets created through the behavior's action must
      // be picked by the increment that follows the action call. The
      // Bullet created directly in the previous scene event must keep
      // its Counter at 0.
      const counterValues = bulletInstances
        .map((instance) =>
          instance.getVariables().get('Counter').getAsNumber()
        )
        .sort();
      expect(counterValues).toEqual([0, 1, 1]);
    });
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
