// @flow
import {
  quicklyAnalyzeVariableName,
  VariableNameQuickAnalyzeResults,
} from './VariableField';

describe('VariableField', () => {
  it('can quickly analyze if a variable name or expression looks good', () => {
    expect(quicklyAnalyzeVariableName('Test')).toBe(
      VariableNameQuickAnalyzeResults.OK
    );
    expect(quicklyAnalyzeVariableName('Test123')).toBe(
      VariableNameQuickAnalyzeResults.OK
    );
    expect(quicklyAnalyzeVariableName('Hello world')).toBe(
      VariableNameQuickAnalyzeResults.WRONG_SPACE
    );
    expect(quicklyAnalyzeVariableName(' "Test"')).toBe(
      VariableNameQuickAnalyzeResults.WRONG_SPACE
    );
    expect(quicklyAnalyzeVariableName('"Test"')).toBe(
      VariableNameQuickAnalyzeResults.WRONG_QUOTE
    );
    expect(quicklyAnalyzeVariableName('VariableString(MySubVariable)')).toBe(
      VariableNameQuickAnalyzeResults.WRONG_EXPRESSION
    );
    expect(quicklyAnalyzeVariableName('Test+2')).toBe(
      VariableNameQuickAnalyzeResults.WRONG_EXPRESSION
    );
    expect(quicklyAnalyzeVariableName('MyVariable.MySubVariable')).toBe(
      VariableNameQuickAnalyzeResults.OK
    );
    expect(quicklyAnalyzeVariableName('MyVariable.MySubVariable["Test"]')).toBe(
      VariableNameQuickAnalyzeResults.OK
    );
    expect(quicklyAnalyzeVariableName('MyVariable.MySubVariable[1 + 2]')).toBe(
      VariableNameQuickAnalyzeResults.OK
    );
    expect(quicklyAnalyzeVariableName('MyVariable.MySubVariable+2')).toBe(
      VariableNameQuickAnalyzeResults.WRONG_EXPRESSION
    );
    expect(
      quicklyAnalyzeVariableName('MyVariable[VariableString(AnotherVariable)]')
    ).toBe(VariableNameQuickAnalyzeResults.OK);
    expect(
      quicklyAnalyzeVariableName('MyVariable[Variable(AnotherVariable)]')
    ).toBe(VariableNameQuickAnalyzeResults.OK);
    expect(
      quicklyAnalyzeVariableName('MyVariable[Variable(AnotherVariable) + 2]')
    ).toBe(VariableNameQuickAnalyzeResults.OK);
  });
});
