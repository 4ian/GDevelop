const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');
const {
  generateCompiledEventsFunctionFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  let project = null;
  let scene = null;
  let extension = null;
  beforeEach(() => {
    project = new gd.ProjectHelper.createNewGDJSProject();
    extension = project.insertNewEventsFunctionsExtension('Extension', 0);
    scene = project.insertNewLayout('Scene', 0);
  });
  afterEach(() => {
    project.delete();
  });

  const generateAndRunActionsForFunction = (actions, options = {}) => {
    return generateAndRunEventsForFunction(
      [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions,
          events: [],
        },
      ],
      options
    );
  };

  const generateAndRunVariableAffectationWithConditions = (
    conditions,
    options = {}
  ) => {
    extension.getSceneVariables().insertNew('SuccessVariable', 0).setValue(0);
    return generateAndRunEventsForFunction(
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
      options
    );
  };

  const generateAndRunEventsForFunction = (
    events,
    { beforeRunningEvents, logCode } = {}
  ) => {
    const serializedProjectElement = new gd.SerializerElement();
    project.serializeTo(serializedProjectElement);

    const serializedSceneElement = new gd.SerializerElement();
    scene.serializeTo(serializedSceneElement);

    const serializerElement = gd.Serializer.fromJSObject(events);

    const runCompiledEvents = generateCompiledEventsFunctionFromSerializedEvents(
      gd,
      extension,
      serializerElement,
      { logCode }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock({
      gameData: JSON.parse(gd.Serializer.toJSON(serializedProjectElement)),
      sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
    });
    serializedProjectElement.delete();
    serializedSceneElement.delete();

    if (beforeRunningEvents) {
      beforeRunningEvents(runtimeScene);
    }
    runCompiledEvents(gdjs, runtimeScene, []);

    return runtimeScene;
  };

  it('can generate a scene number variable action', function () {
    extension.getSceneVariables().insertNew('MyVariable', 0).setValue(0);
    const runtimeScene = generateAndRunActionsForFunction([
      {
        type: { value: 'SetNumberVariable' },
        parameters: ['MyVariable', '=', '1'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(1);
  });

  it('can generate a scene string variable action', function () {
    extension.getSceneVariables().insertNew('MyVariable', 0).setString('');
    const runtimeScene = generateAndRunActionsForFunction([
      {
        type: { value: 'SetStringVariable' },
        parameters: ['MyVariable', '=', '"Hello"'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('MyVariable')
        .getAsString()
    ).toBe('Hello');
  });

  it('can generate a scene boolean variable action', function () {
    extension.getSceneVariables().insertNew('MyVariable', 0).setBool(false);
    const runtimeScene = generateAndRunActionsForFunction([
      {
        type: { value: 'SetBooleanVariable' },
        parameters: ['MyVariable', 'True'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('MyVariable')
        .getAsBoolean()
    ).toBe(true);
  });

  it('can generate a scene boolean variable toggle', function () {
    extension.getSceneVariables().insertNew('MyVariable', 0).setBool(false);
    const runtimeScene = generateAndRunActionsForFunction([
      {
        type: { value: 'SetBooleanVariable' },
        parameters: ['MyVariable', 'Toggle'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('MyVariable')
        .getAsBoolean()
    ).toBe(true);
  });

  it('can generate a scene number variable condition that is true', function () {
    extension.getSceneVariables().insertNew('MyVariable', 0).setValue(123);
    const runtimeScene = generateAndRunVariableAffectationWithConditions([
      {
        type: { inverted: false, value: 'NumberVariable' },
        parameters: ['MyVariable', '=', '123'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('SuccessVariable')
        .getAsNumber()
    ).toBe(1);
  });

  it('can generate a project number variable condition that is true', function () {
    extension.getGlobalVariables().insertNew('MyVariable', 0).setValue(123);
    const runtimeScene = generateAndRunVariableAffectationWithConditions([
      {
        type: { inverted: false, value: 'NumberVariable' },
        parameters: ['MyVariable', '=', '123'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('SuccessVariable')
        .getAsNumber()
    ).toBe(1);
  });

  it('can generate a condition giving precedence to the scene variable', function () {
    extension.getGlobalVariables().insertNew('MyVariable', 0).setValue(123);
    extension.getSceneVariables().insertNew('MyVariable', 0).setValue(456);
    const runtimeScene = generateAndRunVariableAffectationWithConditions([
      {
        type: { inverted: false, value: 'NumberVariable' },
        parameters: ['MyVariable', '=', '456'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('SuccessVariable')
        .getAsNumber()
    ).toBe(1);
  });

  it('can generate a scene boolean variable condition that is true', function () {
    extension.getSceneVariables().insertNew('MyVariable', 0).setBool(true);
    const runtimeScene = generateAndRunVariableAffectationWithConditions([
      {
        type: { inverted: false, value: 'BooleanVariable' },
        parameters: ['MyVariable', 'True', ''],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('SuccessVariable')
        .getAsNumber()
    ).toBe(1);
  });

  it('can generate a scene string variable condition that is true', function () {
    extension
      .getSceneVariables()
      .insertNew('MyVariable', 0)
      .setString('Same value');
    const runtimeScene = generateAndRunVariableAffectationWithConditions([
      {
        type: { inverted: false, value: 'StringVariable' },
        parameters: ['MyVariable', '=', '"Same value"'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('SuccessVariable')
        .getAsNumber()
    ).toBe(1);
  });

  it('can generate a scene string variable condition that is false', function () {
    extension
      .getSceneVariables()
      .insertNew('MyVariable', 0)
      .setString('Not the same');
    const runtimeScene = generateAndRunVariableAffectationWithConditions([
      {
        type: { inverted: false, value: 'StringVariable' },
        parameters: ['MyVariable', '=', '"Different"'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('SuccessVariable')
        .getAsNumber()
    ).toBe(0);
  });

  it('can generate a string variable condition that is true with a contains operator', function () {
    extension
      .getSceneVariables()
      .insertNew('MyVariable', 0)
      .setString('Hello world!');
    const runtimeScene = generateAndRunVariableAffectationWithConditions([
      {
        type: { inverted: false, value: 'StringVariable' },
        parameters: ['MyVariable', 'contains', '"world"'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('SuccessVariable')
        .getAsNumber()
    ).toBe(1);
  });

  it('can generate a string variable condition that is false with a contains operator', function () {
    extension
      .getSceneVariables()
      .insertNew('MyVariable', 0)
      .setString('Hello world!');
    const runtimeScene = generateAndRunVariableAffectationWithConditions([
      {
        type: { inverted: false, value: 'StringVariable' },
        parameters: ['MyVariable', 'contains', '"Hi!"'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('SuccessVariable')
        .getAsNumber()
    ).toBe(0);
  });

  it('can generate a push number action', function () {
    extension.getSceneVariables().insertNew('MyVariable', 0).castTo('Array');
    const runtimeScene = generateAndRunActionsForFunction([
      {
        type: { value: 'PushNumber' },
        parameters: ['MyVariable', '123'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('MyVariable')
        .getChild('0')
        .getAsNumber()
    ).toBe(123);
  });

  it('can generate a push string action', function () {
    extension.getSceneVariables().insertNew('MyVariable', 0).castTo('Array');
    const runtimeScene = generateAndRunActionsForFunction([
      {
        type: { value: 'PushString' },
        parameters: ['MyVariable', '"Hello"'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('MyVariable')
        .getChild('0')
        .getAsString()
    ).toBe('Hello');
  });

  it('can generate a push boolean action', function () {
    extension.getSceneVariables().insertNew('MyVariable', 0).castTo('Array');
    const runtimeScene = generateAndRunActionsForFunction([
      {
        type: { value: 'PushBoolean' },
        parameters: ['MyVariable', 'True'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('MyVariable')
        .getChild('0')
        .getAsBoolean()
    ).toBe(true);
  });

  it('can generate a push variable action', function () {
    extension.getSceneVariables().insertNew('MyVariable', 0).castTo('Array');
    extension.getSceneVariables().insertNew('MyOtherVariable', 0).setValue(123);
    const runtimeScene = generateAndRunActionsForFunction([
      {
        type: { value: 'PushVariable' },
        parameters: ['MyVariable', 'MyOtherVariable'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('MyVariable')
        .getChild('0')
        .getAsNumber()
    ).toBe(123);
  });

  it('can generate a local variable expression', function () {
    extension.getSceneVariables().insertNew('MyVariable', 0).setValue(0);
    const runtimeScene = generateAndRunEventsForFunction([
      {
        type: 'BuiltinCommonInstructions::Standard',
        variables: [{ name: 'MyLocalVariable', type: 'number', value: 123 }],
        conditions: [],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MyVariable', '=', 'MyLocalVariable'],
          },
        ],
        events: [],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(123);
  });

  it('can generate a local variable condition', function () {
    extension.getSceneVariables().insertNew('SuccessVariable', 0).setValue(0);
    const runtimeScene = generateAndRunEventsForFunction([
      {
        type: 'BuiltinCommonInstructions::Standard',
        variables: [{ name: 'MyLocalVariable', type: 'number', value: 123 }],
        conditions: [
          {
            type: { inverted: false, value: 'NumberVariable' },
            parameters: ['MyLocalVariable', '=', '123'],
          },
        ],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['SuccessVariable', '=', '1'],
          },
        ],
        events: [],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('SuccessVariable')
        .getAsNumber()
    ).toBe(1);
  });

  it('can generate a local child-variable condition on a structure', function () {
    extension.getSceneVariables().insertNew('SuccessVariable', 0).setValue(0);
    const runtimeScene = generateAndRunEventsForFunction([
      {
        type: 'BuiltinCommonInstructions::Standard',
        variables: [
          {
            name: 'MyLocalVariable',
            type: 'structure',
            children: [{ name: 'MyChild', type: 'number', value: 123 }],
          },
        ],
        conditions: [
          {
            type: { inverted: false, value: 'NumberVariable' },
            parameters: ['MyLocalVariable.MyChild', '=', '123'],
          },
        ],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['SuccessVariable', '=', '1'],
          },
        ],
        events: [],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('SuccessVariable')
        .getAsNumber()
    ).toBe(1);
  });

  it('can generate a local child-variable condition on an array', function () {
    extension.getSceneVariables().insertNew('SuccessVariable', 0).setValue(0);
    const runtimeScene = generateAndRunEventsForFunction([
      {
        type: 'BuiltinCommonInstructions::Standard',
        variables: [
          {
            name: 'MyLocalVariable',
            type: 'array',
            children: [{ name: '0', type: 'number', value: 123 }],
          },
        ],
        conditions: [
          {
            type: { inverted: false, value: 'NumberVariable' },
            parameters: ['MyLocalVariable[0]', '=', '123'],
          },
        ],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['SuccessVariable', '=', '1'],
          },
        ],
        events: [],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('SuccessVariable')
        .getAsNumber()
    ).toBe(1);
  });

  it('can generate a local variable condition giving precedence to the closest local variable', function () {
    extension.getSceneVariables().insertNew('SuccessVariable', 0).setValue(0);

    extension.getGlobalVariables().insertNew('MyVariable', 0).setValue(123);
    extension.getSceneVariables().insertNew('MyVariable', 0).setValue(456);
    const runtimeScene = generateAndRunEventsForFunction([
      {
        type: 'BuiltinCommonInstructions::Standard',
        variables: [{ name: 'MyVariable', type: 'number', value: 789 }],
        conditions: [],
        actions: [],
        events: [
          {
            type: 'BuiltinCommonInstructions::Standard',
            variables: [
              { name: 'MyVariable', type: 'number', value: 147 },
            ],
            conditions: [
              {
                type: { inverted: false, value: 'NumberVariable' },
                parameters: ['MyVariable', '=', '147'],
              },
            ],
            actions: [
              {
                type: { value: 'SetNumberVariable' },
                parameters: ['SuccessVariable', '=', '1'],
              },
            ],
            events: [],
          },
        ],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('SuccessVariable')
        .getAsNumber()
    ).toBe(1);
  });

  it('can generate a local variable without affecting parent event local variables', function () {
    extension.getSceneVariables().insertNew('SuccessVariable', 0).setValue(0);

    extension.getGlobalVariables().insertNew('MyVariable', 0).setValue(123);
    extension.getSceneVariables().insertNew('MyVariable', 0).setValue(456);
    const runtimeScene = generateAndRunEventsForFunction([
      {
        type: 'BuiltinCommonInstructions::Standard',
        variables: [{ name: 'MyLocalVariable', type: 'number', value: 789 }],
        conditions: [],
        actions: [],
        events: [
          // Create a new local variable with the same name.
          {
            type: 'BuiltinCommonInstructions::Standard',
            variables: [
              { name: 'MyLocalVariable', type: 'number', value: 147 },
            ],
            conditions: [],
            actions: [
              {
                type: { value: 'SetNumberVariable' },
                parameters: ['MyLocalVariable', '=', '148'],
              },
            ],
          },
          // The local variable must be untouched by the previous event.
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [
              {
                type: { inverted: false, value: 'NumberVariable' },
                parameters: ['MyLocalVariable', '=', '789'],
              },
            ],
            actions: [
              {
                type: { value: 'SetNumberVariable' },
                parameters: ['SuccessVariable', '=', '1'],
              },
            ],
          },
        ],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('SuccessVariable')
        .getAsNumber()
    ).toBe(1);
  });

  it('can generate a condition on a local variable from a parent event', function () {
    extension.getSceneVariables().insertNew('SuccessVariable', 0).setValue(0);
    const runtimeScene = generateAndRunEventsForFunction([
      {
        type: 'BuiltinCommonInstructions::Standard',
        variables: [{ name: 'MyLocalVariable', type: 'number', value: 123 }],
        conditions: [],
        actions: [],
        events: [
          {
            type: 'BuiltinCommonInstructions::Standard',
            variables: [],
            conditions: [
              {
                type: { inverted: false, value: 'NumberVariable' },
                parameters: ['MyLocalVariable', '=', '123'],
              },
            ],
            actions: [
              {
                type: { value: 'SetNumberVariable' },
                parameters: ['SuccessVariable', '=', '1'],
              },
            ],
            events: [],
          },
        ],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('SuccessVariable')
        .getAsNumber()
    ).toBe(1);
  });

  it('can generate a VariableChildCount expression', function () {
    extension.getSceneVariables().insertNew('MyVariable', 0).setValue(0);
    extension
      .getSceneVariables()
      .insertNew('MyStructureVariable', 0)
      .getChild('MyChild')
      .setValue(123);
    const runtimeScene = generateAndRunActionsForFunction([
      {
        type: { value: 'SetNumberVariable' },
        parameters: [
          'MyVariable',
          '=',
          'VariableChildCount(MyStructureVariable)',
        ],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(1);
  });

  // TODO Move this test with legacy ones.
  it('can generate a VariableChildCount expression for an undeclared variable', function () {
    extension.getSceneVariables().insertNew('MyVariable', 0).setValue(0);
    const runtimeScene = generateAndRunActionsForFunction(
      [
        {
          type: { value: 'SetNumberVariable' },
          parameters: [
            'MyVariable',
            '=',
            'VariableChildCount(MyStructureVariable)',
          ],
        },
      ],
      {
        beforeRunningEvents: (runtimeScene) => {
          runtimeScene
            .getVariables()
            .get('MyStructureVariable')
            .getChild('MyChild')
            .setValue(123);
        },
      }
    );
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(1);
  });

  it('can generate a child existence condition that is true', function () {
    extension
      .getSceneVariables()
      .insertNew('MyStructureVariable', 0)
      .getChild('MyChild')
      .setValue(123);
    const runtimeScene = generateAndRunVariableAffectationWithConditions([
      {
        type: { inverted: false, value: 'VariableChildExists2' },
        parameters: ['MyStructureVariable', '"MyChild"'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('SuccessVariable')
        .getAsNumber()
    ).toBe(1);
  });

  it('can generate a child removing action', function () {
    const variable = extension
      .getSceneVariables()
      .insertNew('MyStructureVariable', 0);
    variable.getChild('MyChildA').setValue(123);
    variable.getChild('MyChildB').setValue(456);
    const runtimeScene = generateAndRunActionsForFunction([
      {
        type: { value: 'RemoveVariableChild' },
        parameters: ['MyStructureVariable', '"MyChildA"'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('MyStructureVariable')
        .hasChild('MyChildA')
    ).toBe(false);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('MyStructureVariable')
        .hasChild('MyChildB')
    ).toBe(true);
  });

  it('can generate a children clearing action', function () {
    const variable = extension
      .getSceneVariables()
      .insertNew('MyStructureVariable', 0);
    variable.getChild('MyChildA').setValue(123);
    variable.getChild('MyChildB').setValue(123);
    const runtimeScene = generateAndRunActionsForFunction([
      {
        type: { value: 'ClearVariableChildren' },
        parameters: ['MyStructureVariable'],
      },
    ]);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('MyStructureVariable')
        .hasChild('MyChildA')
    ).toBe(false);
    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('MyStructureVariable')
        .hasChild('MyChildB')
    ).toBe(false);
  });
});
