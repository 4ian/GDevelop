const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');
const {
  generateCompiledEventsForLayout,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  let project = null;
  let scene = null;
  let object = null;
  beforeEach(() => {
    project = new gd.ProjectHelper.createNewGDJSProject();
    scene = project.insertNewLayout('Scene', 0);
    object = scene.insertNewObject(project, 'Sprite', 'MyObject', 0);
    const instance = scene.getInitialInstances().insertNewInitialInstance();
    instance.setObjectName('MyObject');
  });
  afterEach(() => {
    project.delete();
  });

  const generateAndRunActionsForLayout = (actions, logCode = false) => {
    return generateAndRunEventsForLayout(
      [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions,
          events: [],
        },
      ],
      logCode
    );
  };

  const generateAndRunVariableAffectationWithConditions = (
    conditions,
    logCode = false
  ) => {
    scene.getVariables().insertNew('SuccessVariable', 0).setValue(0);
    return generateAndRunEventsForLayout(
      [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions,
          actions: [
            {
              type: { value: 'SetNumberVariable' },
              parameters: ['SuccessVariable', '=', '1'],
            },
          ],
          events: [],
        },
      ],
      logCode
    );
  };

  const generateAndRunEventsForLayout = (events, logCode = false) => {
    const serializedProjectElement = new gd.SerializerElement();
    project.serializeTo(serializedProjectElement);

    const serializedSceneElement = new gd.SerializerElement();
    scene.serializeTo(serializedSceneElement);

    const serializedLayoutEvents = gd.Serializer.fromJSObject(events);
    scene.getEvents().unserializeFrom(project, serializedLayoutEvents);

    const runCompiledEvents = generateCompiledEventsForLayout(
      gd,
      project,
      scene,
      logCode
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock({
      gameData: JSON.parse(gd.Serializer.toJSON(serializedProjectElement)),
      sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
    });
    serializedProjectElement.delete();
    serializedSceneElement.delete();

    runCompiledEvents(gdjs, runtimeScene, []);
    return runtimeScene;
  };

  it('can generate a scene number variable action', function () {
    object.getVariables().insertNew('MyVariable', 0).setValue(0);
    const runtimeScene = generateAndRunActionsForLayout([
      {
        type: { value: 'SetNumberObjectVariable' },
        parameters: ['MyObject', 'MyVariable', '=', '1'],
      },
    ]);
    expect(
      runtimeScene
        .getObjects('MyObject')[0]
        .getVariables()
        .get('MyVariable')
        .getAsNumber()
    ).toBe(1);
  });

  it('can generate a scene string variable action', function () {
    object.getVariables().insertNew('MyVariable', 0).setString('');
    const runtimeScene = generateAndRunActionsForLayout([
      {
        type: { value: 'SetStringObjectVariable' },
        parameters: ['MyObject', 'MyVariable', '=', '"Hello"'],
      },
    ]);
    expect(
      runtimeScene
        .getObjects('MyObject')[0]
        .getVariables()
        .get('MyVariable')
        .getAsString()
    ).toBe('Hello');
  });

  it('can generate a scene boolean variable action', function () {
    object.getVariables().insertNew('MyVariable', 0).setBool(false);
    const runtimeScene = generateAndRunActionsForLayout([
      {
        type: { value: 'SetBooleanObjectVariable' },
        parameters: ['MyObject', 'MyVariable', 'True'],
      },
    ]);
    expect(
      runtimeScene
        .getObjects('MyObject')[0]
        .getVariables()
        .get('MyVariable')
        .getAsBoolean()
    ).toBe(true);
  });

  it('can generate a scene boolean variable toggle', function () {
    object.getVariables().insertNew('MyVariable', 0).setBool(false);
    const runtimeScene = generateAndRunActionsForLayout([
      {
        type: { value: 'SetBooleanObjectVariable' },
        parameters: ['MyObject', 'MyVariable', 'Toggle'],
      },
    ]);
    expect(
      runtimeScene
        .getObjects('MyObject')[0]
        .getVariables()
        .get('MyVariable')
        .getAsBoolean()
    ).toBe(true);
  });

  it('can generate a scene number variable condition that is true', function () {
    object.getVariables().insertNew('MyVariable', 0).setValue(123);
    const runtimeScene = generateAndRunVariableAffectationWithConditions([
      {
        type: { inverted: false, value: 'NumberObjectVariable' },
        parameters: ['MyObject', 'MyVariable', '=', '123'],
      },
    ]);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('can generate a scene boolean variable condition that is true', function () {
    object.getVariables().insertNew('MyVariable', 0).setBool(true);
    const runtimeScene = generateAndRunVariableAffectationWithConditions([
      {
        type: { inverted: false, value: 'BooleanObjectVariable' },
        parameters: ['MyObject', 'MyVariable'],
      },
    ]);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('can generate a scene string variable condition that is true', function () {
    object.getVariables().insertNew('MyVariable', 0).setString('Same value');
    const runtimeScene = generateAndRunVariableAffectationWithConditions([
      {
        type: { inverted: false, value: 'BooleanObjectVariable' },
        parameters: ['MyObject', 'MyVariable', '=', '"Same value"'],
      },
    ]);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });
});
