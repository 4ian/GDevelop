// @flow
import { formatExpressionCall } from './FormatExpressionCall';
import {
  enumerateExpressions,
  filterExpressions,
} from '../../InstructionOrExpressionSelector/EnumerateExpressions';

describe('HelpButton', () => {
  const {
    freeExpressions,
    objectsExpressions,
    behaviorsExpressions,
  } = enumerateExpressions('number');

  it('should properly format a free function', () => {
    const countExpression = filterExpressions(freeExpressions, 'Count')[0];
    expect(formatExpressionCall(countExpression, ['MyObject'])).toBe(
      'Count(MyObject)'
    );

    const atan2Expression = filterExpressions(freeExpressions, 'atan2')[0];
    expect(formatExpressionCall(atan2Expression, ['1', '2'])).toBe(
      'atan2(1, 2)'
    );
  });

  it('should properly format an object function', () => {
    const variableStringExpression = filterExpressions(
      objectsExpressions,
      'Variable'
    )[0];
    expect(
      formatExpressionCall(variableStringExpression, ['MyObject', 'Variable1'])
    ).toBe('MyObject.Variable(Variable1)');
  });

  it('should properly format an object function with an argument', () => {
    const pointXExpression = filterExpressions(objectsExpressions, 'PointX')[0];
    expect(
      formatExpressionCall(pointXExpression, ['MyObject', 'MyPoint'])
    ).toBe('MyObject.PointX(MyPoint)');
  });

  it('should properly format an object behavior function', () => {
    const variableStringExpression = filterExpressions(
      behaviorsExpressions,
      'JumpSpeed'
    )[0];
    expect(
      formatExpressionCall(variableStringExpression, [
        'MyObject',
        'PlatformerObject',
      ])
    ).toBe('MyObject.PlatformerObject::JumpSpeed()');
  });
});
