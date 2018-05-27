// @flow

/**
 * Convert a rgb color value to a string hex value.
 * @note No "#" or "0x" are added.
 */
export const rgbToHex = (r: number, g: number, b: number) =>
  '' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
/**
 * Convert a rgb color value to a hex value.
 */
export const rgbToHexNumber = (r: number, g: number, b: number) =>
  (r << 16) + (g << 8) + b;
