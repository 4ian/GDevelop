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
    const freeEventsFunctions = eventsFunctionsExtension.getEventsFunctions();
    const eventsFunction = freeEventsFunctions.insertNewEventsFunction(
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
    const freeEventsFunctions = eventsFunctionsExtension.getEventsFunctions();
    const eventsFunction = freeEventsFunctions.insertNewEventsFunction(
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
    const freeEventsFunctions = eventsFunctionsExtension.getEventsFunctions();
    const eventsFunction = freeEventsFunctions.insertNewEventsFunction(
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

  it.each([
    'new',
    'class',
    'this',
    'gdjs',
    'runtimeScene',
    'eventsFunctionContext',
    'parentEventsFunctionContext',
  ])(
    'Can use a parameter named like a JavaScript keyword or a generated identifier (%s)',
    (parameterName) => {
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
              parameters: [parameterName, '=', '123'],
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
      const eventsFunction = eventsFunctionsExtension
        .getEventsFunctions()
        .insertNewEventsFunction('MyFunction', 0);
      eventsFunction
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);
      eventsFunction
        .getParameters()
        .insertNewParameter(parameterName, 0)
        .setType('number');

      const { gdjs, runtimeScene, runCompiledEvents } = generatedFreeFunction(
        gd,
        project,
        eventsFunctionsExtension,
        eventsFunction,
        { logCode: false }
      );

      runCompiledEvents(gdjs, runtimeScene, [123]);
      expect(
        runtimeScene
          .getVariablesForExtension('MyExtension')
          .get('MyVariable')
          .getAsNumber()
      ).toBe(456);
    }
  );

  it('Can use parameters whose names would be mangled the same way without escaping underscores', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    eventsFunctionsExtension
      .getSceneVariables()
      .insertNew('MyVariable', 0)
      .setValue(0);

    // "é" is mangled as "_233" when underscores are not escaped.
    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'NumberVariable' },
            parameters: ['é', '=', '1'],
          },
          {
            type: { value: 'NumberVariable' },
            parameters: ['_233', '=', '2'],
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
    const eventsFunction = eventsFunctionsExtension
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    eventsFunction.getParameters().insertNewParameter('é', 0).setType('number');
    eventsFunction
      .getParameters()
      .insertNewParameter('_233', 1)
      .setType('number');

    const { gdjs, runtimeScene, runCompiledEvents } = generatedFreeFunction(
      gd,
      project,
      eventsFunctionsExtension,
      eventsFunction,
      { logCode: false }
    );

    runCompiledEvents(gdjs, runtimeScene, [1, 2]);
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
