// @flow
import {
  easingFunctions,
  getEasingFunction,
  isEasingChoiceList,
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
  });
});
