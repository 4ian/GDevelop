const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsForEventsFunction,
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  const generateAndRunVariableAffectationWithConditions = (
    parameterTypes,
    parameterValues,
    conditions
  ) => {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions,
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['SuccessVariable', '=', '1'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      { parameterTypes, logCode: false }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, parameterValues);
    return runtimeScene;
  };

  it('can generate a number parameter condition that is true', function () {
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      { MyParameter: 'number' },
      [123],
      [
        {
          type: { value: 'CompareArgumentAsNumber' },
          parameters: ['"MyParameter"', '=', '123'],
        },
      ]
    );

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('can generate a number parameter condition that is false', function () {
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      { MyParameter: 'number' },
      [123],
      [
        {
          type: { value: 'BuiltinAdvanced::CompareArgumentAsNumber' },
          parameters: ['MyParameter', '=', '456'],
        },
      ]
    );

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);
  });

  it('can generate a string parameter condition that is true', function () {
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      { MyParameter: 'number' },
      ['123'],
      [
        {
          type: { value: 'CompareArgumentAsString' },
          parameters: ['"MyParameter"', '=', '"123"'],
        },
      ]
    );

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('can generate a string parameter condition that is false', function () {
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      { MyParameter: 'number' },
      ['123'],
      [
        {
          type: { value: 'BuiltinAdvanced::CompareArgumentAsString' },
          parameters: ['MyParameter', '=', '"456"'],
        },
      ]
    );

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);
  });

  it('can generate a string parameter condition that is true with a contains operator', function () {
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      { MyParameter: 'string' },
      ['Hello word!'],
      [
        {
          type: { value: 'CompareArgumentAsString' },
          parameters: ['"MyParameter"', 'contains', '"word"'],
        },
      ]
    );

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('can generate a string parameter condition that is false with a contains operator', function () {
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      { MyParameter: 'string' },
      ['Hello word!'],
      [
        {
          type: { value: 'CompareArgumentAsString' },
          parameters: ['"MyParameter"', 'contains', '"Hi!"'],
        },
      ]
    );

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);
  });

  it('can copy a variable parameter variable', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'CopyArgumentToVariable' },
            parameters: ['"MyParameter"', '__MyExtensionVariable'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      { parameterTypes: { MyParameter: 'scenevar' }, logCode: false }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const myVariable = runtimeScene.getVariables().get('MyVariable');
    myVariable.getChild('MyChildVariable').setNumber(123);
    runCompiledEvents(gdjs, runtimeScene, [myVariable]);

    // The user variable is copied into a variable with the extension namespace.
    expect(runtimeScene.getVariables().has('__MyExtensionVariable')).toBe(true);
    expect(
      runtimeScene
        .getVariables()
        .get('__MyExtensionVariable')
        .getChild('MyChildVariable')
        .getAsNumber()
    ).toBe(123);
  });

  it('can write a variable parameter variable', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['__MyExtensionVariable.MyChildVariable', '=', '123'],
          },
          {
            type: { value: 'CopyVariableToArgument' },
            parameters: ['"MyParameter"', '__MyExtensionVariable'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      { parameterTypes: { MyParameter: 'scenevar' }, logCode: false }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const myVariable = runtimeScene.getVariables().get('MyVariable');
    runCompiledEvents(gdjs, runtimeScene, [myVariable]);

    // The extension variable is copied into the user variable.
    expect(runtimeScene.getVariables().has('MyVariable')).toBe(true);
    expect(
      runtimeScene
        .getVariables()
        .get('MyVariable')
        .getChild('MyChildVariable')
        .getAsNumber()
    ).toBe(123);
  });

  it('can generate function returning objects', function () {
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();

    const myObjectA1 = runtimeScene.createObject('MyObjectA');
    const myObjectA2 = runtimeScene.createObject('MyObjectA');
    const myObjectB1 = runtimeScene.createObject('MyObjectB');
    const myObjectB2 = runtimeScene.createObject('MyObjectB');
    const myObjectB3 = runtimeScene.createObject('MyObjectB');

    const variableA1 = new gdjs.Variable();
    variableA1.setNumber(1);
    myObjectA1.getVariables().add('Pick', variableA1);
    const variableB3 = new gdjs.Variable();
    variableB3.setNumber(1);
    myObjectB3.getVariables().add('Pick', variableB3);

    // Run the function passing some objects as parameters.
    const objectsLists = gdjs.Hashtable.newFrom({
      MyObjectA: [myObjectA1],
      MyObjectB: [myObjectB2, myObjectB3],
      MyObjectC: [],
    });
    
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'VarObjet' },
            parameters: ["Object","Pick","!=","0"],
          },
        ],
        actions: [
          {
            type: { value: 'SetReturnObject' },
            parameters: ['Object'],
          },
        ],
        events: [],
      },
    ]);
    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      { parameterTypes: { Object: 'object' }, logCode: false }
    );
    runCompiledEvents(gdjs, runtimeScene, [objectsLists]);

    expect(objectsLists.get('MyObjectA')).toEqual([myObjectA1]);
    expect(objectsLists.get('MyObjectB')).toEqual([myObjectB3]);
    expect(objectsLists.get('MyObjectC')).toEqual([]);
  });

  it('can generate function creating 2 instances and returning only one', function () {
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();

    const myObjectA1 = runtimeScene.createObject('MyObjectA');
    const myObjectA2 = runtimeScene.createObject('MyObjectA');
    const myObjectB1 = runtimeScene.createObject('MyObjectB');

    // According to the parameter type objectListOrEmptyIfJustDeclared,
    // no instances is passed to the function because the ObjectsLists has not
    // been filtered before.
    const objectsLists = gdjs.Hashtable.newFrom({
      MyObjectA: [],
      MyObjectB: [],
      MyObjectC: [],
    });
    
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
        ],
        actions: [
          {
            type: { value: 'Create' },
            parameters: ['', 'Object', '0','0',''],
          },
          {
            type: {'value':'ModVarObjet'},
            parameters: ['Object','Pick','=','1']
          },
          {
            type: { value: 'Create' },
            parameters: ['', 'Object', '0','0',''],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'VarObjet' },
            parameters: ['Object','Pick','!=','0'],
          },
        ],
        actions: [
          {
            type: { value: 'SetReturnObject' },
            parameters: ['Object'],
          },
        ],
        events: [],
      },
    ]);
    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      { parameterTypes: { Object: 'objectListOrEmptyIfJustDeclared' }, logCode: false }
    );
    runCompiledEvents(gdjs, runtimeScene, [objectsLists]);

    expect(objectsLists.get('MyObjectA').length).toBe(1);
  });
});
