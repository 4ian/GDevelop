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
 * Convert a rgb color to a string rgb.
 */
export const rgbColorToRGBString = (rgbColor: ?RGBColor) => {
  if (!rgbColor) return '';
  return `${rgbColor.r};${rgbColor.g};${rgbColor.b}`;
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
 * Convert a rgb string ("rr;gg;bb") to a hex number.
 */
export const rgbStringToHexNumber = (rgbString: string) => {
  const rgbColor = rgbStringToRGBColor(rgbString);
  if (!rgbColor) return 0;
  return rgbToHexNumber(rgbColor.r, rgbColor.g, rgbColor.b);
};

/**
 * Convert a rgb string ("rr;gg;bb") or a hex string ("#112244") to a hex number.
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
 * Convert a hex color value to an rgb object value.
 */
export const hexNumberToRGBColor = (hexNumber: number) => {
  return {
    r: (hexNumber >> 16) & 0xff,
    g: (hexNumber >> 8) & 0xff,
    b: hexNumber & 0xff,
    a: 255,
  };
};

/**
 * Convert a hex color string to an rgb object value.
 */
export const hexToRGBColor = (hex: string) => {
  const hexNumber = parseInt(hex.replace('#', ''), 16);
  return hexNumberToRGBColor(hexNumber);
};

/**
 * Convert a hex number to an rgb string.
 */
export const hexNumberToRGBString = (hex: number) => {
  const rgbColor = hexNumberToRGBColor(hex);
  return rgbColorToRGBString(rgbColor);
};

/**
 * Convert a string RGB color ("rrr;ggg;bbb") or a hex string (#rrggbb) to a rgb string.
 * @param value The color as a RGB string or hex string
 */
export const rgbOrHexToRGBString = function(value: string): string {
  const splitValue = value.split(';');
  // If a RGB string is provided, just return it.
  if (splitValue.length === 3) {
    return value;
  }
  // Otherwise, convert the Hex to RGB.
  const rgbNumber = hexToRGBColor(value);
  return `${parseInt(rgbNumber.r, 0)};${parseInt(rgbNumber.g, 0)};${parseInt(
    rgbNumber.b,
    0
  )}`;
};

/**
 * Convert a string RGB color ("rrr;ggg;bbb") to a rgb object.
 * @param value The color as a RGB string
 */
export const rgbStringToRGBColor = (rgbColor: string): RGBColor | null => {
  const colors = rgbColor.replace(/"/g, '').split(';');
  if (colors.length !== 3) {
    return null;
  }

  const r = parseInt(colors[0], 10);
  const g = parseInt(colors[1], 10);
  const b = parseInt(colors[2], 10);

  // Check if parsing of number was done properly (if not,
  // we receive NaN which is not equal to itself).
  // eslint-disable-next-line
  if (r !== r || g !== g || b !== b) return null;

  return {
    r,
    g,
    b,
    a: 255,
  };
};
