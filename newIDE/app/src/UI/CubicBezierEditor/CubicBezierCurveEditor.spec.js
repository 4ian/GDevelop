// @flow
import {
  curveEditorPadding,
  getPointsFromPointerPosition,
} from './CubicBezierCurveEditor';

describe('getPointsFromPointerPosition', () => {
  const size = 240;
  const drawable = size - 2 * curveEditorPadding;
  const yMin = -0.5;
  const yMax = 1.5;
  const points = [0.25, 0.1, 0.25, 1];
  const svgXForUnitX = (x: number): number => curveEditorPadding + x * drawable;
  const svgYForUnitY = (y: number): number =>
    curveEditorPadding + ((yMax - y) / (yMax - yMin)) * drawable;

  it('clamps x to [0, 1] and rounds both coordinates to 0.01', () => {
    const clampedLow = getPointsFromPointerPosition({
      points,
      handleIndex: 0,
      svgX: -1000,
      svgY: svgYForUnitY(0.1),
      size,
      yMin,
      yMax,
      skipRounding: false,
    });
    expect(clampedLow[0]).toBe(0);
    expect(clampedLow[2]).toBe(0.25);
    expect(clampedLow[3]).toBe(1);

    const clampedHigh = getPointsFromPointerPosition({
      points,
      handleIndex: 0,
      svgX: 100000,
      svgY: svgYForUnitY(0.1),
      size,
      yMin,
      yMax,
      skipRounding: false,
    });
    expect(clampedHigh[0]).toBe(1);

    const rounded = getPointsFromPointerPosition({
      points,
      handleIndex: 1,
      svgX: svgXForUnitX(0.333),
      svgY: svgYForUnitY(1.256),
      size,
      yMin,
      yMax,
      skipRounding: false,
    });
    expect(rounded[2]).toBeCloseTo(0.33, 2);
    expect(rounded[3]).toBeCloseTo(1.26, 2);
    expect(rounded[0]).toBe(0.25);
    expect(rounded[1]).toBe(0.1);

    const fine = getPointsFromPointerPosition({
      points,
      handleIndex: 1,
      svgX: svgXForUnitX(0.333),
      svgY: svgYForUnitY(1.256),
      size,
      yMin,
      yMax,
      skipRounding: true,
    });
    expect(fine[2]).toBeCloseTo(0.333, 5);
    expect(fine[3]).toBeCloseTo(1.256, 5);
  });
});
