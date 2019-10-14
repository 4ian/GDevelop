// @flow
import * as PIXI from 'pixi.js';

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

/**
 * Convert a hex color value to an rgb object value.
 */
export const getRGBColorFromHex = (hex: string) => {
  const rgb = PIXI.utils.hex2rgb(`0x${hex.replace('#', '')}`);
  return {
    r: Math.floor(rgb[0] * 255),
    g: Math.floor(rgb[1] * 255),
    b: Math.floor(rgb[2] * 255),
    a: 255,
  };
};
