const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const {
  generateCompiledEventsForEventsBasedObject,
  generateCompiledEventsForSerializedEventsBasedExtension,
} = require('../TestUtils/CodeGenerationHelpers.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');
const { makeTestExtensions } = require('../TestUtils/TestExtensions.js');

describe('libGD.js - GDJS Custom Object Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
    makeTestExtensions(gd);
  });

  it('generates a working custom object with properties (with different types), all used in an expression', () => {
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const extensionModule = generateCompiledEventsForSerializedEventsBasedExtension(
      gd,
      require('./extensions/EBObject.json'),
      gdjs,
      runtimeScene
    );

    const {
      objects: { Object },
    } = extensionModule;

    const object = new Object(runtimeScene, { content: {} });
    object.testProperties();

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(7);
    expect(runtimeScene.getVariables().has('SuccessStringVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessStringVariable').getAsString()
    ).toBe('2trueTest');
  });

  it('generates a working custom object function with parameters (with different types), all used in an expression ', () => {
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const extensionModule = generateCompiledEventsForSerializedEventsBasedExtension(
      gd,
      require('./extensions/EBObject.json'),
      gdjs,
      runtimeScene
    );

    const {
      objects: { Object },
    } = extensionModule;

    const object = new Object(runtimeScene, { content: {} });
    object.testParameters(16, '32', true, 'TestTest');

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(16 + 32 + 1);
    expect(runtimeScene.getVariables().has('SuccessStringVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessStringVariable').getAsString()
    ).toBe('16trueTestTest');
  });



  it('Can use a property in a variable action', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedObject = eventsFunctionsExtension
      .getEventsBasedObjects()
      .insertNew('MyCustomObject', 0);

    eventsBasedObject
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
    eventsBasedObject
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0)
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedObject
    );

    const { runtimeScene, object } = generatedCustomObject(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      { logCode: false }
    );

    // Check the default value is set.
    expect(object._getMyProperty()).toBe(123);

    object.MyFunction();
    expect(object._getMyProperty()).toBe(456);
  });

  it('Can use a property in a variable condition', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const scene = project.insertNewLayout('MyScene', 0);
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedObject = eventsFunctionsExtension
      .getEventsBasedObjects()
      .insertNew('MyCustomObject', 0);

    eventsBasedObject
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
    eventsBasedObject
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0)
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedObject
    );

    const { runtimeScene, object } = generatedCustomObject(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    object.MyFunction();
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
    const eventsBasedObject = eventsFunctionsExtension
      .getEventsBasedObjects()
      .insertNew('MyCustomObject', 0);

    eventsBasedObject
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
    eventsBasedObject
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0)
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedObject
    );

    const { runtimeScene, object } = generatedCustomObject(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    object.MyFunction();
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
    const eventsBasedObject = eventsFunctionsExtension
      .getEventsBasedObjects()
      .insertNew('MyCustomObject', 0);

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
    const eventsFunction = eventsBasedObject
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedObject
    );
    const parameter = eventsFunction
      .getParameters()
      .insertNewParameter(
        'MyParameter',
        eventsFunction.getParameters().getParametersCount()
      );
    parameter.setType('number');

    const { runtimeScene, object } = generatedCustomObject(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    object.MyFunction(123);
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
    const eventsBasedObject = eventsFunctionsExtension
      .getEventsBasedObjects()
      .insertNew('MyCustomObject', 0);

    // Property with the same name as the parameter.
    eventsBasedObject
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
    const eventsFunction = eventsBasedObject
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedObject
    );
    const parameter = eventsFunction
      .getParameters()
      .insertNewParameter(
        'MyIdentifier',
        eventsFunction.getParameters().getParametersCount()
      );
    parameter.setType('number');

    const { runtimeScene, object } = generatedCustomObject(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    object.MyFunction(123);
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
    const eventsBasedObject = eventsFunctionsExtension
      .getEventsBasedObjects()
      .insertNew('MyCustomObject', 0);

    // Property with the same name as the local variable.
    eventsBasedObject
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
    const eventsFunction = eventsBasedObject
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedObject
    );
    // Parameter with the same name as the local variable.
    const parameter = eventsFunction
      .getParameters()
      .insertNewParameter(
        'MyIdentifier',
        eventsFunction.getParameters().getParametersCount()
      );
    parameter.setType('number');

    const { runtimeScene, object } = generatedCustomObject(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    object.MyFunction(333);
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(456);
  });
});

function generatedCustomObject(
  gd,
  project,
  eventsFunctionsExtension,
  eventsBasedObject,
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

  const CompiledRuntimeCustomObject = generateCompiledEventsForEventsBasedObject(
    gd,
    project,
    eventsFunctionsExtension,
    eventsBasedObject,
    gdjs,
    options
  );
  serializedProjectElement.delete();
  serializedSceneElement.delete();
  project.delete();

  const object = new CompiledRuntimeCustomObject(runtimeScene, { content: {} });

  return { gdjs, runtimeScene, object };
}
