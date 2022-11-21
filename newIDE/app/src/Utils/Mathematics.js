// @flow

export const roundTo = (value: number, precision: number): number =>
  Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);

export const truncTo = (value: number, precision: number): number =>
  Math.trunc(value * Math.pow(10, precision)) / Math.pow(10, precision);
