const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');
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
      { logCode: false }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);
    return runtimeScene;
  };

  it('can generate a string comparison condition that is true', function () {
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      [
        {
          type: { inverted: false, value: 'BuiltinCommonInstructions::CompareStrings' },
          parameters: ['"Same value"', '=', '"Same value"'],
        },
      ]
    );

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('can generate a string comparison condition that is false', function () {
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      [
        {
          type: { inverted: false, value: 'BuiltinCommonInstructions::CompareStrings' },
          parameters: ['"Not the same"', '=', '"Different"'],
        },
      ]
    );

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);
  });

  it('can generate a string comparison inverted condition that is false', function () {
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      [
        {
          type: { inverted: true, value: 'BuiltinCommonInstructions::CompareStrings' },
          parameters: ['"Same value"', '=', '"Same value"'],
        },
      ]
    );

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);
  });

  it('can generate a string comparison inverted condition that is true', function () {
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      [
        {
          type: { inverted: true, value: 'BuiltinCommonInstructions::CompareStrings' },
          parameters: ['"Not the same"', '=', '"Different"'],
        },
      ]
    );

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('can generate a string comparison condition that is true with a contains operator', function () {
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      [
        {
          type: { inverted: false, value: 'BuiltinCommonInstructions::CompareStrings' },
          parameters: ['"Hello world!"', 'contains', '"world"'],
        },
      ]
    );

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('can generate a string comparison condition that is false with a contains operator', function () {
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      [
        {
          type: { inverted: false, value: 'BuiltinCommonInstructions::CompareStrings' },
          parameters: ['"Hello world!"', 'contains', '"Hi!"'],
        },
      ]
    );

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);
  });
});
