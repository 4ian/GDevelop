// @flow
import { getTrackPosition } from './CubicBezierAnimatedPreview';

describe('getTrackPosition', () => {
  it('uses the whole track for a value range of [0, 1]', () => {
    const range = { min: 0, max: 1 };
    expect(getTrackPosition(0, range)).toBe(0);
    expect(getTrackPosition(0.5, range)).toBe(0.5);
    expect(getTrackPosition(1, range)).toBe(1);
  });

  it('keeps an overshooting value inside the track', () => {
    const range = { min: -1, max: 2 };
    expect(getTrackPosition(-1, range)).toBe(0);
    expect(getTrackPosition(0, range)).toBeCloseTo(1 / 3, 5);
    expect(getTrackPosition(1, range)).toBeCloseTo(2 / 3, 5);
    expect(getTrackPosition(2, range)).toBe(1);
    expect(getTrackPosition(5, range)).toBe(1);
    expect(getTrackPosition(-5, range)).toBe(0);
  });

  it('does not return NaN for an empty range', () => {
    expect(getTrackPosition(1, { min: 1, max: 1 })).toBe(0);
  });
});
