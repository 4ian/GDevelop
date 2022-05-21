// @flow

export type RGBColor = {|
  r: number,
  g: number,
  b: number,
  a?: number,
|};

/**
 * Convert a RGB color to a RGB string.
 */
export const rgbColorToRGBString = (rgbColor: ?RGBColor) => {
  if (!rgbColor) return '';
  return `${rgbColor.r};${rgbColor.g};${rgbColor.b}`;
};

/**
 * Convert a RGB color value to a Hex string.
 * @note No "#" or "0x" are added.
 */
export const rgbToHex = (r: number, g: number, b: number) =>
  '' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

/**
 * Convert a RGB color to a Hex number.
 */
export const rgbToHexNumber = (r: number, g: number, b: number) =>
  (r << 16) + (g << 8) + b;

/**
 * Convert a RGB string ("rr;gg;bb") to a Hex number.
 */
export const rgbStringToHexNumber = (rgbString: string) => {
  const rgbColor = rgbStringAndAlphaToRGBColor(rgbString);
  if (!rgbColor) return 0;
  return rgbToHexNumber(rgbColor.r, rgbColor.g, rgbColor.b);
};

/**
 * Convert a RGB string ("rrr;ggg;bbb") or a Hex string ("#112244") to a Hex number.
 */
export const rgbOrHexToHexNumber = (value: string): number => {
  const splitValue = value.split(';');
  // If a RGB string is provided, convert it to HexNumber and return it.
  if (splitValue.length === 3) {
    return rgbStringToHexNumber(value);
  }
  // Otherwise, convert the Hex to a number.
  return parseInt(value.replace('#', ''), 16);
};

/**
 * Convert a Hex number to a RGB color.
 */
const hexNumberToRGBColor = (hexNumber: number) => {
  return {
    r: (hexNumber >> 16) & 0xff,
    g: (hexNumber >> 8) & 0xff,
    b: hexNumber & 0xff,
    a: 255,
  };
};

/**
 * Convert a Hex string to a RGB color.
 */
const hexToRGBColor = (hex: string) => {
  const hexNumber = parseInt(hex.replace('#', ''), 16);
  return hexNumberToRGBColor(hexNumber);
};

/**
 * Convert a Hex number to a RGB string.
 */
export const hexNumberToRGBString = (hex: number) => {
  const rgbColor = hexNumberToRGBColor(hex);
  return rgbColorToRGBString(rgbColor);
};

/**
 * Convert a RGB string ("rrr;ggg;bbb") or a Hex string (#rrggbb) to a RGB string.
 * @param value The color as a RGB string or Hex string
 */
export const rgbOrHexToRGBString = function (value: string): string {
  const splitValue = value.split(';');
  // If a RGB string is provided, just return it.
  if (splitValue.length === 3) {
    return value;
  }
  // Otherwise, convert the Hex to RGB.
  const rgbColor = hexToRGBColor(value);
  return `${rgbColor.r};${rgbColor.g};${rgbColor.b}`;
};

/**
 * Convert a RGB string ("rrr;ggg;bbb") and an alpha number to a RGB color.
 * If alpha is not defined, defaults to 1 (fully opaque)
 */
export const rgbStringAndAlphaToRGBColor = (
  rgbColor: string,
  alpha?: number
): RGBColor | null => {
  const colors = rgbColor.replace(/"/g, '').split(';');
  if (colors.length !== 3) {
    return null;
  }

  const r = parseInt(colors[0], 10);
  const g = parseInt(colors[1], 10);
  const b = parseInt(colors[2], 10);
  // alpha can be 0, and we need to handle this case.
  const a = alpha === undefined || alpha === null ? 1 : alpha;

  // Check if parsing of number was done properly (if not,
  // we receive NaN which is not equal to itself).
  // eslint-disable-next-line
  if (r !== r || g !== g || b !== b) return null;

  return {
    r,
    g,
    b,
    a,
  };
};
