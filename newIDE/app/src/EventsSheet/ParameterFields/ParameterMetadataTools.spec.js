// @flow
import { getLastObjectParameterValue } from './ParameterMetadataTools';
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
