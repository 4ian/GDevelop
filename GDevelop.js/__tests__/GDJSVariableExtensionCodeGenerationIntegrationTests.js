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
  beforeEach(() => {
    project = new gd.ProjectHelper.createNewGDJSProject();
    scene = project.insertNewLayout('Scene', 0);
  });

  const generateAndRunActionsForLayout = (
    actions
  ) => {
    return generateAndRunEventsForLayout([], actions);
  };

  const generateAndRunVariableAffectationWithConditions = (
    conditions
  ) => {
    scene.getVariables().insertNew('SuccessVariable', 0).setValue(0);
    return generateAndRunEventsForLayout(conditions, [
      {
        type: { value: 'SetNumberVariable' },
        parameters: ['SuccessVariable', '=', '1'],
      },
    ]);
  };
  afterEach(() => {
    project.delete();
  });

  const generateAndRunEventsForLayout = (
    conditions,
    actions
  ) => {
    const serializedProjectElement = new gd.SerializerElement();
    project.serializeTo(serializedProjectElement);

    const serializedSceneElement = new gd.SerializerElement();
    scene.serializeTo(serializedSceneElement);

    const serializedLayoutEvents = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions,
        actions,
        events: [],
      },
    ]);
    scene.getEvents().unserializeFrom(project, serializedLayoutEvents);

    const runCompiledEvents = generateCompiledEventsForLayout(
      gd,
      project,
      scene
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
    scene.getVariables().insertNew('MyVariable', 0).setValue(0);
    const runtimeScene = generateAndRunActionsForLayout(
      [
        {
          type: { value: 'SetNumberVariable' },
          parameters: ['MyVariable', '=', '1'],
        },
      ]
    );

    expect(
      runtimeScene.getVariables().get('MyVariable').getAsNumber()
    ).toBe(1);
  });

  it('can generate a scene string variable action', function () {
    scene.getVariables().insertNew('MyVariable', 0).setString("");
    const runtimeScene = generateAndRunActionsForLayout(
      [
        {
          type: { value: 'SetStringVariable' },
          parameters: ['MyVariable', '=', '"Hello"'],
        },
      ]
    );

    expect(
      runtimeScene.getVariables().get('MyVariable').getAsString()
    ).toBe("Hello");
  });

  it('can generate a scene boolean variable action', function () {
    scene.getVariables().insertNew('MyVariable', 0).setBool(false);
    const runtimeScene = generateAndRunActionsForLayout(
      [
        {
          type: { value: 'SetBooleanVariable' },
          parameters: ['MyVariable', 'True'],
        },
      ]
    );

    expect(
      runtimeScene.getVariables().get('MyVariable').getAsBoolean()
    ).toBe(true);
  });

  it('can generate a scene boolean variable toggle', function () {
    scene.getVariables().insertNew('MyVariable', 0).setBool(false);
    const runtimeScene = generateAndRunActionsForLayout(
      [
        {
          type: { value: 'SetBooleanVariable' },
          parameters: ['MyVariable', 'Toggle'],
        },
      ]
    );

    expect(
      runtimeScene.getVariables().get('MyVariable').getAsBoolean()
    ).toBe(true);
  });

  it('can generate a scene number variable condition that is true', function () {
    scene.getVariables().insertNew('MyVariable', 0).setValue(123);
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      [
        {
          type: { inverted: false, value: 'NumberVariable' },
          parameters: ['MyVariable', '=', '123'],
        },
      ]
    );

    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('can generate a project number variable condition that is true', function () {
    project.getVariables().insertNew('MyVariable', 0).setValue(123);
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      [
        {
          type: { inverted: false, value: 'NumberVariable' },
          parameters: ['MyVariable', '=', '123'],
        },
      ]
    );

    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('can generate a condition giving precedence to the scene variable', function () {
    project.getVariables().insertNew('MyVariable', 0).setValue(123);
    scene.getVariables().insertNew('MyVariable', 0).setValue(456);
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      [
        {
          type: { inverted: false, value: 'NumberVariable' },
          parameters: ['MyVariable', '=', '456'],
        },
      ]
    );

    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('can generate a scene boolean variable condition that is true', function () {
    scene.getVariables().insertNew('MyVariable', 0).setBool(true);
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      [
        {
          type: { inverted: false, value: 'BooleanVariable' },
          parameters: ['MyVariable'],
        },
      ]
    );

    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('can generate a scene string variable condition that is true', function () {
    scene.getVariables().insertNew('MyVariable', 0).setString("Same value");
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      [
        {
          type: { inverted: false, value: 'BooleanVariable' },
          parameters: ['MyVariable', '=', '"Same value"'],
        },
      ]
    );

    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('can generate a scene string variable condition that is false', function () {
    scene.getVariables().insertNew('MyVariable', 0).setString("Not the same");
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      [
        {
          type: { inverted: false, value: 'StringVariable' },
          parameters: ['MyVariable', '=', '"Different"'],
        },
      ]
    );

    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(0);
  });

  it('can generate a string variable condition that is true with a contains operator', function () {
    scene.getVariables().insertNew('MyVariable', 0).setString("Hello world!");
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      [
        {
          type: { inverted: false, value: 'StringVariable' },
          parameters: ['MyVariable', 'contains', '"world"'],
        },
      ]
    );

    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('can generate a string variable condition that is false with a contains operator', function () {
    scene.getVariables().insertNew('MyVariable', 0).setString("Hello world!");
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      [
        {
          type: { inverted: false, value: 'StringVariable' },
          parameters: ['MyVariable', 'contains', '"Hi!"'],
        },
      ]
    );

    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(0);
  });
});
