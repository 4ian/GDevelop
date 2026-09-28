// @flow
import {
  easingFunctions,
  createCubicBezierEasing,
  customEasingExampleIdentifier,
  formatCubicBezier,
  getEasingFunction,
  isEasingChoiceList,
  parseCubicBezierOrNull,
} from './Easings';
import { getEasingPreviewPaths } from '../UI/EasingPreview';

describe('Easings', () => {
  it('has all the easings of the Tween extension', () => {
    // Keep in sync with Extensions/TweenBehavior/JsExtension.js
    expect(Object.keys(easingFunctions)).toEqual([
      'linear',
      'easeInQuad',
      'easeOutQuad',
      'easeInOutQuad',
      'easeInCubic',
      'easeOutCubic',
      'easeInOutCubic',
      'easeInQuart',
      'easeOutQuart',
      'easeInOutQuart',
      'easeInQuint',
      'easeOutQuint',
      'easeInOutQuint',
      'easeInSine',
      'easeOutSine',
      'easeInOutSine',
      'easeInExpo',
      'easeOutExpo',
      'easeInOutExpo',
      'easeInCirc',
      'easeOutCirc',
      'easeInOutCirc',
      'easeOutBounce',
      'easeInBack',
      'easeOutBack',
      'easeInOutBack',
      'elastic',
      'swingFromTo',
      'swingFrom',
      'swingTo',
      'bounce',
      'bouncePast',
      'easeFromTo',
      'easeFrom',
      'easeTo',
    ]);
  });

  it('has easings going from 0 to 1', () => {
    Object.keys(easingFunctions).forEach(name => {
      // "elastic" is peculiar as it does not start at 0 in the game engine.
      if (name === 'elastic') return;

      const easingFunction = easingFunctions[name];
      expect(easingFunction(0)).toBeCloseTo(0, 5);
      expect(easingFunction(1)).toBeCloseTo(1, 5);
    });
  });

  it('can get an easing function', () => {
    expect(getEasingFunction('linear')).toBe(easingFunctions.linear);
    expect(getEasingFunction('unknown')).toBe(null);
    expect(getEasingFunction('toString')).toBe(null);
  });

  it('can detect a list of easings', () => {
    expect(isEasingChoiceList(Object.keys(easingFunctions))).toBe(true);
    expect(isEasingChoiceList(['linear', 'easeInQuad'])).toBe(true);
    expect(isEasingChoiceList(['linear'])).toBe(false);
    expect(isEasingChoiceList(['linear', 'Something else'])).toBe(false);
    expect(isEasingChoiceList([])).toBe(false);
    expect(isEasingChoiceList(['cubic-bezier(0,0,1,1)', 'linear'])).toBe(false);
  });

  it('parses a cubic-bezier value', () => {
    expect(parseCubicBezierOrNull('cubic-bezier(.91,.17,.08,.88)')).toEqual([
      0.91,
      0.17,
      0.08,
      0.88,
    ]);
    expect(
      parseCubicBezierOrNull('  CUBIC-BEZIER( .91 , .17 , .08 , .88 )  ')
    ).toEqual([0.91, 0.17, 0.08, 0.88]);
    expect(parseCubicBezierOrNull('cubic-bezier(1e-1,2.5e1,1E0,-3)')).toEqual([
      0.1,
      25,
      1,
      -3,
    ]);
  });

  it('rejects an invalid cubic-bezier value', () => {
    expect(parseCubicBezierOrNull('cubic-bezier(-0.1,0,1,1)')).toBe(null);
    expect(parseCubicBezierOrNull('cubic-bezier(0,0,1.1,1)')).toBe(null);
    expect(parseCubicBezierOrNull('cubic-bezier(0,0,1)')).toBe(null);
    expect(parseCubicBezierOrNull('cubic-bezier(0,0,1,1,0)')).toBe(null);
    expect(parseCubicBezierOrNull('cubic-bezier(NaN,0,1,1)')).toBe(null);
    expect(parseCubicBezierOrNull('')).toBe(null);
    expect(parseCubicBezierOrNull('easeInQuad')).toBe(null);
  });

  it('gives the same values as linear for cubic-bezier(0,0,1,1)', () => {
    const easing = createCubicBezierEasing([0, 0, 1, 1]);
    [0, 0.25, 0.5, 0.75, 1].forEach(progress => {
      expect(easing(progress)).toBe(easingFunctions.linear(progress));
    });
  });

  it('matches CSS ease-in-out', () => {
    const easing = createCubicBezierEasing([0.42, 0, 0.58, 1]);
    const references = [
      [0, 0],
      [0.25, 0.129162],
      [0.5, 0.5],
      [0.75, 0.870838],
      [1, 1],
    ];
    references.forEach(([progress, expected]) => {
      expect(easing(progress)).toBeCloseTo(expected, 3);
    });
  });

  it('returns exactly 0 at 0 and exactly 1 at 1', () => {
    const easing = createCubicBezierEasing([0.91, 0.17, 0.08, 0.88]);
    expect(easing(0)).toBe(0);
    expect(easing(1)).toBe(1);
  });

  it('formats a cubic-bezier value', () => {
    expect(formatCubicBezier([0.9126, 0.17, 0.08, 0.88])).toBe(
      'cubic-bezier(.913,.17,.08,.88)'
    );
    expect(formatCubicBezier([0.5, -0.56, 0, 1])).toBe(
      'cubic-bezier(.5,-.56,0,1)'
    );
    expect(formatCubicBezier([0.25, 0.1, 0.25, 1])).toBe(
      customEasingExampleIdentifier
    );
    expect(parseCubicBezierOrNull(customEasingExampleIdentifier)).toEqual([
      0.25,
      0.1,
      0.25,
      1,
    ]);
  });

  it('computes a preview path staying in the given box', () => {
    const paths = getEasingPreviewPaths('easeOutBack', 40, 28, 2);
    if (!paths) throw new Error('Expected paths to be computed.');

    expect(paths.curvePath.startsWith('M2.00 26.00')).toBe(true);
    // easeOutBack overshoots 1, so the "end" guide is not at the top of the box.
    expect(paths.endGuideY).toBeGreaterThan(2);
    expect(paths.startGuideY).toBe(26);

    const linearPaths = getEasingPreviewPaths('linear', 40, 28, 2);
    if (!linearPaths) throw new Error('Expected paths to be computed.');
    expect(linearPaths.startGuideY).toBe(26);
    expect(linearPaths.endGuideY).toBe(2);

    expect(getEasingPreviewPaths('unknown', 40, 28, 2)).toBe(null);

    const customPaths = getEasingPreviewPaths(
      'cubic-bezier(.34,1.56,.64,1)',
      40,
      28,
      2
    );
    if (!customPaths) throw new Error('Expected paths to be computed.');
    expect(customPaths.endGuideY).toBeGreaterThan(2);
  });
});
