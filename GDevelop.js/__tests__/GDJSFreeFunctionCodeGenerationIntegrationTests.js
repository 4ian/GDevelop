const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const {
  generateCompiledEventsForEventsFunctionWithContext,
} = require('../TestUtils/CodeGenerationHelpers.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');
const {
  generateCompiledEventsForEventsBasedBehavior,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Free Function Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  it('Can use a parameter in a variable condition', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );

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
    const eventsFunction = eventsFunctionsExtension.insertNewEventsFunction(
      'MyFunction',
      0
    );
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    const parameter = eventsFunction
      .getParameters()
      .insertNewParameter(
        'MyParameter',
        eventsFunction.getParameters().getParametersCount()
      );
    parameter.setType('number');

    const { gdjs, runtimeScene, runCompiledEvents } = generatedFreeFunction(
      gd,
      project,
      eventsFunctionsExtension,
      eventsFunction,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    runCompiledEvents(gdjs, runtimeScene, [123]);
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
    const eventsFunction = eventsFunctionsExtension.insertNewEventsFunction(
      'MyFunction',
      0
    );
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    const parameter = eventsFunction
      .getParameters()
      .insertNewParameter(
        'MyIdentifier',
        eventsFunction.getParameters().getParametersCount()
      );
    parameter.setType('number');

    const { gdjs, runtimeScene, runCompiledEvents } = generatedFreeFunction(
      gd,
      project,
      eventsFunctionsExtension,
      eventsFunction,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    runCompiledEvents(gdjs, runtimeScene, [123]);
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
    const eventsFunction = eventsFunctionsExtension.insertNewEventsFunction(
      'MyFunction',
      0
    );
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    // Parameter with the same name as the local variable.
    const parameter = eventsFunction
      .getParameters()
      .insertNewParameter(
        'MyIdentifier',
        eventsFunction.getParameters().getParametersCount()
      );
    parameter.setType('number');

    const { gdjs, runtimeScene, runCompiledEvents } = generatedFreeFunction(
      gd,
      project,
      eventsFunctionsExtension,
      eventsFunction,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    runCompiledEvents(gdjs, runtimeScene, [333]);
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(456);
  });
});

function generatedFreeFunction(
  gd,
  project,
  eventsFunctionsExtension,
  eventsFunction,
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

  const runCompiledEvents = generateCompiledEventsForEventsFunctionWithContext(
    gd,
    project,
    eventsFunctionsExtension,
    eventsFunction,
    options.logCode
  );
  serializedProjectElement.delete();
  serializedSceneElement.delete();
  project.delete();

  return { gdjs, runtimeScene, runCompiledEvents };
}
