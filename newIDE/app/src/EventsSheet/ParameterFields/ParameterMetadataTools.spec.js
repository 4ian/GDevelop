// @flow
import {
  getLastObjectParameterValue,
  getSpecializedParameterFieldType,
} from './ParameterMetadataTools';
const gd: libGDevelop = global.gd;

describe('getLastObjectParameterValue', () => {
  it('returns null if no parameter index passed', () => {
    expect(
      getLastObjectParameterValue({
        instructionMetadata: null,
        instruction: null,
        expressionMetadata: null,
        expression: null,
        parameterIndex: null,
      })
    ).toBe(null);
  });

  it('returns the object if there is one before the requested parameter index', () => {
    const instructionMetadata = new gd.InstructionMetadata();

    instructionMetadata.addParameter('string', 'Some string', '', false);
    instructionMetadata.addParameter('object', 'Some object', '', false);
    instructionMetadata.addParameter('behavior', 'Some behavior', '', false);

    const instruction = new gd.Instruction();
    instruction.setParametersCount(3);
    instruction.setParameter(0, '"Hello world"');
    instruction.setParameter(1, 'MyObject');
    instruction.setParameter(2, 'MyBehavior');

    // $FlowFixMe[missing-local-annot]
    const getValueForParameter = parameterIndex =>
      getLastObjectParameterValue({
        instructionMetadata,
        instruction,
        expressionMetadata: null,
        expression: null,
        parameterIndex,
      });

    expect(getValueForParameter(0)).toBe(null);
    expect(getValueForParameter(1)).toBe('MyObject');
    expect(getValueForParameter(2)).toBe('MyObject');
  });

  it('returns the object, even if other parameters exist in between', () => {
    const instructionMetadata = new gd.InstructionMetadata();

    instructionMetadata.addParameter('string', 'Some string', '', false);
    instructionMetadata.addParameter('object', 'First object', '', false);
    instructionMetadata.addParameter('behavior', 'Some behavior', '', false);
    instructionMetadata.addParameter('object', 'Second object', '', false);
    instructionMetadata.addParameter('behavior', 'Some behavior', '', false);
    instructionMetadata.addParameter('behavior', 'Some behavior', '', false);
    instructionMetadata.addParameter(
      'objectvar',
      'Some object variable',
      '',
      false
    );

    const instruction = new gd.Instruction();
    instruction.setParametersCount(7);
    instruction.setParameter(0, '"Hello world"');
    instruction.setParameter(1, 'MyObject');
    instruction.setParameter(2, 'MyBehavior');
    instruction.setParameter(3, 'MyOtherObject');
    instruction.setParameter(4, 'MyOtherBehavior');
    instruction.setParameter(5, 'MyOtherBehavior');
    instruction.setParameter(6, 'MyOtherVariable');

    // $FlowFixMe[missing-local-annot]
    const getValueForParameter = parameterIndex =>
      getLastObjectParameterValue({
        instructionMetadata,
        instruction,
        expressionMetadata: null,
        expression: null,
        parameterIndex,
      });

    expect(getValueForParameter(0)).toBe(null);
    expect(getValueForParameter(1)).toBe('MyObject');
    expect(getValueForParameter(2)).toBe('MyObject');
    expect(getValueForParameter(3)).toBe('MyOtherObject');
    expect(getValueForParameter(4)).toBe('MyOtherObject');
    expect(getValueForParameter(5)).toBe('MyOtherObject');
    expect(getValueForParameter(6)).toBe('MyOtherObject');
  });
});

describe('getSpecializedParameterFieldType', () => {
  const makeParameterMetadata = (type: string, choices: ?Array<string>) => {
    const parameterMetadata = new gd.ParameterMetadata();
    parameterMetadata.setType(type);
    if (choices) parameterMetadata.setExtraInfo(JSON.stringify(choices));
    return parameterMetadata;
  };

  it('keeps the "easing" type', () => {
    const parameterMetadata = makeParameterMetadata('easing', null);
    expect(getSpecializedParameterFieldType('easing', parameterMetadata)).toBe(
      'easing'
    );
    parameterMetadata.delete();
  });

  it('considers a list of choices containing only easings as easings', () => {
    const parameterMetadata = makeParameterMetadata('stringWithSelector', [
      'linear',
      'easeInQuad',
      'bounce',
    ]);
    expect(
      getSpecializedParameterFieldType('stringWithSelector', parameterMetadata)
    ).toBe('easing');
    parameterMetadata.delete();
  });

  it('keeps other lists of choices as they are', () => {
    const parameterMetadata = makeParameterMetadata('stringWithSelector', [
      'linear',
      'Something else',
    ]);
    expect(
      getSpecializedParameterFieldType('stringWithSelector', parameterMetadata)
    ).toBe('stringWithSelector');
    expect(getSpecializedParameterFieldType('stringWithSelector', null)).toBe(
      'stringWithSelector'
    );
    expect(getSpecializedParameterFieldType('string', parameterMetadata)).toBe(
      'string'
    );
    parameterMetadata.delete();
  });
});
