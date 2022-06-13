// @flow
import {
  formatExpressionCall,
  getVisibleParameterTypes,
} from './FormatExpressionCall';
import {
  filterExpressions,
  enumerateFreeExpressions,
  enumerateBehaviorExpressions,
  enumerateObjectExpressions,
} from '../../../InstructionOrExpression/EnumerateExpressions';

describe('FormatExpressionCall', () => {
  it('properly formats a free function, with one or more arguments', () => {
    const freeExpressions = enumerateFreeExpressions();
    const countExpression = filterExpressions(
      freeExpressions,
      'PickedInstancesCount'
    )[0];
    expect(formatExpressionCall(countExpression, ['MyObject'], false)).toBe(
      'PickedInstancesCount(MyObject)'
    );

    const atan2Expression = filterExpressions(freeExpressions, 'atan2')[0];
    expect(formatExpressionCall(atan2Expression, ['1', '2'], false)).toBe(
      'atan2(1, 2)'
    );
  });

  it('properly formats a free function, with "code-only" parameters', () => {
    const freeExpressions = enumerateFreeExpressions();
    const cameraHeightExpression = filterExpressions(
      freeExpressions,
      'CameraHeight'
    )[0];
    expect(
      formatExpressionCall(
        cameraHeightExpression,
        ['', '"My layer"', '0'],
        false
      )
    ).toBe('CameraHeight("My layer", 0)');
  });

  it('properly formats a free function, with "code-only" and optional parameters', () => {
    const freeExpressions = enumerateFreeExpressions();
    const touchExpression = filterExpressions(freeExpressions, 'TouchX')[0];
    expect(formatExpressionCall(touchExpression, ['', '1'], false)).toBe(
      'TouchX(1)'
    );
    expect(
      formatExpressionCall(touchExpression, ['', '1', '"My layer"'], false)
    ).toBe('TouchX(1, "My layer")');
    expect(
      formatExpressionCall(touchExpression, ['', '1', '', ''], false)
    ).toBe('TouchX(1)');
    expect(
      formatExpressionCall(touchExpression, ['', '1', '', '2'], false)
    ).toBe('TouchX(1, "", 2)');
  });

  it('properly formats an object function', () => {
    const objectsExpressions = enumerateObjectExpressions('Sprite');
    const variableStringExpression = filterExpressions(
      objectsExpressions,
      'Variable'
    )[0];
    expect(variableStringExpression).not.toBeUndefined();
    expect(
      formatExpressionCall(
        variableStringExpression,
        ['MyObject', 'Variable1'],
        false
      )
    ).toBe('MyObject.Variable(Variable1)');
  });

  it('properly formats an object function with an argument', () => {
    const objectsExpressions = enumerateObjectExpressions('Sprite');
    const pointXExpression = filterExpressions(objectsExpressions, 'PointX')[0];
    expect(pointXExpression).not.toBeUndefined();
    expect(
      formatExpressionCall(pointXExpression, ['MyObject', '"MyPoint"'], false)
    ).toBe('MyObject.PointX("MyPoint")');
  });

  it('properly formats an object behavior function', () => {
    const behaviorsExpressions = enumerateBehaviorExpressions(
      'PlatformBehavior::PlatformerObjectBehavior'
    );
    const jumpSpeedExpression = filterExpressions(
      behaviorsExpressions,
      'JumpSpeed'
    )[0];
    expect(jumpSpeedExpression).not.toBeUndefined();
    expect(
      formatExpressionCall(
        jumpSpeedExpression,
        ['MyObject', 'PlatformerObject'],
        false
      )
    ).toBe('MyObject.PlatformerObject::JumpSpeed()');
  });

  it('properly formats an object behavior function and converts to string', () => {
    const behaviorsExpressions = enumerateBehaviorExpressions(
      'PlatformBehavior::PlatformerObjectBehavior'
    );
    const jumpSpeedExpression = filterExpressions(
      behaviorsExpressions,
      'JumpSpeed'
    )[0];
    expect(jumpSpeedExpression).not.toBeUndefined();
    expect(
      formatExpressionCall(
        jumpSpeedExpression,
        ['MyObject', 'PlatformerObject'],
        true
      )
    ).toBe('ToString(MyObject.PlatformerObject::JumpSpeed())');
  });

  it('can return the visible parameters of a function', () => {
    const objectsExpressions = enumerateObjectExpressions('Sprite');
    const pointXExpression = filterExpressions(objectsExpressions, 'PointX')[0];
    expect(pointXExpression).not.toBeUndefined();

    expect(getVisibleParameterTypes(pointXExpression)).toEqual([
      'objectPointName',
    ]);
  });
});
