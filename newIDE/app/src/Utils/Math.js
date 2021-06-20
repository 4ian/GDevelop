// @flow
/**
 * Keep track of the sum of a given number of values.
 */
export class Softener {
  _lastValues: number[];
  _lastIndex: number = 0;
  _sum: number = 0;

  constructor(length: number) {
    this._lastValues = new Array(length).fill(0);
  }

  push(value: number) {
    this._lastIndex = (this._lastIndex + 1) % this._lastValues.length;
    this._sum -= this._lastValues[this._lastIndex];
    this._lastValues[this._lastIndex] = value;
    this._sum += value;
  }

  getSum() {
    return this._sum;
  }
}

/**
 * Modulo operation (the remainder after dividing one number by another)
 * @param x Dividend value.
 * @param y Divisor value.
 * @returns Return the remainder for the values.
 */
export const mod = function(x: float, y: float): number {
  return x - y * Math.floor(x / y);
};

/**
 * Returns the difference between two angles, in degrees.
 * @param angle1 First angle, in degrees.
 * @param angle2 Second angle, in degrees.
 * @returns Return the difference of the angles, in degrees.
 */
export const angleDifference = function(
  angle1: number,
  angle2: number
): number {
  return mod(mod(angle1 - angle2, 360.0) + 180.0, 360.0) - 180.0;
};
