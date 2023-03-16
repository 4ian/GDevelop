const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsForEventsFunction,
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Code Generation integration tests', function () {
  let gd = null;
  beforeAll((done) =>
    initializeGDevelopJs().then((module) => {
      gd = module;
      done();
    })
  );

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
      { parameterTypes }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, parameterValues);
    return runtimeScene;
  };

  it('can generate a number parameter condition that is true', function () {
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      { ParameterName: 'number' },
      [123],
      [
        {
          type: { value: 'CompareArgumentAsNumber' },
          parameters: ['"ParameterName"', '=', '123'],
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
      { ParameterName: 'number' },
      [123],
      [
        {
          type: { value: 'BuiltinAdvanced::CompareArgumentAsNumber' },
          parameters: ['ParameterName', '=', '456'],
        },
      ]
    );

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);
  });

  it('can generate a string parameter condition that is true', function () {
    const runtimeScene = generateAndRunVariableAffectationWithConditions(
      { ParameterName: 'number' },
      ['123'],
      [
        {
          type: { value: 'CompareArgumentAsString' },
          parameters: ['"ParameterName"', '=', '"123"'],
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
      { ParameterName: 'number' },
      ['123'],
      [
        {
          type: { value: 'BuiltinAdvanced::CompareArgumentAsString' },
          parameters: ['ParameterName', '=', '"456"'],
        },
      ]
    );

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);
  });
});
