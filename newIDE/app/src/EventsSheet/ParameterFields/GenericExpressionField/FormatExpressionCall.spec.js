// @flow
import { formatExpressionCall } from './FormatExpressionCall';
import {
  enumerateExpressions,
  filterExpressions,
} from '../../InstructionEditor/InstructionOrExpressionSelector/EnumerateExpressions';

describe('HelpButton', () => {
  it('properly format a free function, with one or more arguments', () => {
    const { freeExpressions } = enumerateExpressions('number');
    const countExpression = filterExpressions(freeExpressions, 'Count')[0];
    expect(formatExpressionCall(countExpression, ['MyObject'])).toBe(
      'Count(MyObject)'
    );

    const atan2Expression = filterExpressions(freeExpressions, 'atan2')[0];
    expect(formatExpressionCall(atan2Expression, ['1', '2'])).toBe(
      'atan2(1, 2)'
    );
  });

  it('properly format a free function, with "code-only" parameters', () => {
    const { freeExpressions } = enumerateExpressions('number');
    const cameraHeightExpression = filterExpressions(
      freeExpressions,
      'CameraHeight'
    )[0];
    expect(
      formatExpressionCall(cameraHeightExpression, ['', '"My layer"', '0'])
    ).toBe('CameraHeight("My layer", 0)');
  });

  it('properly format an object function', () => {
    const { objectsExpressions } = enumerateExpressions('number');
    const variableStringExpression = filterExpressions(
      objectsExpressions,
      'Variable'
    )[0];
    expect(
      formatExpressionCall(variableStringExpression, ['MyObject', 'Variable1'])
    ).toBe('MyObject.Variable(Variable1)');
  });

  it('properly format an object function with an argument', () => {
    const { objectsExpressions } = enumerateExpressions('number');
    const pointXExpression = filterExpressions(objectsExpressions, 'PointX')[0];
    expect(
      formatExpressionCall(pointXExpression, ['MyObject', 'MyPoint'])
    ).toBe('MyObject.PointX(MyPoint)');
  });

  it('properly format an object behavior function', () => {
    const { behaviorsExpressions } = enumerateExpressions('number');
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
