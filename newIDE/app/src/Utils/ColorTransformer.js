// @flow

export type RGBColor = {|
  r: number,
  g: number,
  b: number,
  a?: number,
|};

export const rgbColorToHexNumber = (rgbColor: RGBColor) => {
  const { r, g, b } = rgbColor;
  return rgbToHexNumber(r, g, b);
};

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
export const hexToRGBColor = (hex: string) => {
  const hexNumber = parseInt(hex.replace('#', ''), 16);
  return {
    r: (hexNumber >> 16) & 0xff,
    g: (hexNumber >> 8) & 0xff,
    b: hexNumber & 0xff,
    a: 255,
  };
};
