// @flow
import {
  createCubicBezierEasing,
  cssEasePoints,
  getBuiltInEasingFunction,
} from '../../Utils/Easings';
import {
  getInitialCubicBezierPoints,
  builtInEasingApproximationPresets,
} from './CubicBezierPresets';

describe('CubicBezierPresets', () => {
  it('keeps each approximation within 0.05 of its built-in easing', () => {
    builtInEasingApproximationPresets.forEach(preset => {
      const builtInEasing = getBuiltInEasingFunction(preset.name);
      if (!builtInEasing) {
        throw new Error(`Missing built-in easing ${preset.name}`);
      }
      const approximation = createCubicBezierEasing(preset.points);
      let maxDifference = 0;
      const sampleCount = 20;
      for (let index = 0; index < sampleCount; index++) {
        const progress = index / (sampleCount - 1);
        maxDifference = Math.max(
          maxDifference,
          Math.abs(builtInEasing(progress) - approximation(progress))
        );
      }
      expect(maxDifference).toBeLessThanOrEqual(0.05);
    });
  });

  it('starts from a custom value, an approximation, or CSS ease', () => {
    expect(
      getInitialCubicBezierPoints('cubic-bezier(.91,.17,.08,.88)')
    ).toEqual([0.91, 0.17, 0.08, 0.88]);
    expect(getInitialCubicBezierPoints('easeInQuad')).toEqual([
      0.11,
      0,
      0.5,
      0,
    ]);
    expect(getInitialCubicBezierPoints('bounce')).toEqual(cssEasePoints);
    expect(getInitialCubicBezierPoints(null)).toEqual(cssEasePoints);
  });

  it('starts linear from a straight line', () => {
    expect(getInitialCubicBezierPoints('linear')).toEqual([0, 0, 1, 1]);
  });

  it('starts an alias from the approximation of its identical easing', () => {
    [
      ['swingFrom', 'easeInBack'],
      ['swingTo', 'easeOutBack'],
      ['swingFromTo', 'easeInOutBack'],
      ['easeFrom', 'easeInQuart'],
      ['easeFromTo', 'easeInOutQuart'],
    ].forEach(([alias, easingName]) => {
      expect(getInitialCubicBezierPoints(alias)).toEqual(
        getInitialCubicBezierPoints(easingName)
      );
      expect(getInitialCubicBezierPoints(alias)).not.toEqual(cssEasePoints);
    });
  });
});
