// @flow

export const roundTo = (value: number, precision: number): number =>
  Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);

export const toFixedWithoutTrailingZeros = (
  value: number,
  precision: number
): string => Number.parseFloat(value.toFixed(precision)).toString();
