// @flow
import {
  createCubicBezierEasing,
  cssEasePoints,
  getNamedEasingFunction,
} from '../../Utils/Easings';
import {
  getInitialCubicBezierPoints,
  namedEasingApproximationPresets,
} from './CubicBezierPresets';

describe('CubicBezierPresets', () => {
  it('keeps each approximation within 0.05 of its named easing', () => {
    namedEasingApproximationPresets.forEach(preset => {
      const namedEasing = getNamedEasingFunction(preset.name);
      if (!namedEasing) {
        throw new Error(`Missing named easing ${preset.name}`);
      }
      const approximation = createCubicBezierEasing(preset.points);
      let maxDifference = 0;
      const sampleCount = 20;
      for (let index = 0; index < sampleCount; index++) {
        const progress = index / (sampleCount - 1);
        maxDifference = Math.max(
          maxDifference,
          Math.abs(namedEasing(progress) - approximation(progress))
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
});
