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
 * Convert a RGB string ("rr;gg;bb") to a Hex string (#000000).
 */
export const rgbStringToHexString = (rgbString: string) => {
  const rgbColor = rgbStringAndAlphaToRGBColor(rgbString);
  if (!rgbColor) return '#000000';
  return rgbColorToHex(rgbColor.r, rgbColor.g, rgbColor.b);
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
export const hexNumberToRGBColor = (hexNumber: number) => {
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
export const hexToRGBColor = (hex: string) => {
  const hexNumber = parseInt(hex.replace('#', ''), 16);
  return hexNumberToRGBColor(hexNumber);
};

/**
 * Convert a RGB color to a Hex string.
 */
export const rgbColorToHex = (r: number, g: number, b: number): string => {
  const hexNumber = rgbToHexNumber(r, g, b);
  const hexString = hexNumber.toString(16);
  return '#' + '000000'.substr(hexString.length) + hexString;
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
export const rgbOrHexToRGBString = function(value: string): string {
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

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 * https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 */
export const hslToRgb = (h: number, s: number, l: number): number[] => {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    let hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 * https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 */
export const rgbToHsl = (r: number, g: number, b: number): number[] => {
  r /= 255;
  g /= 255;
  b /= 255;
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return [h, s, l];
};

/**
 * Return true if the specified color is mostly light (and so a dark text/shape
 * should be displayed on it for being readable).
 */
export const isLightRgbColor = (rgbColor: RGBColor) => {
  return rgbColor.r * 0.299 + rgbColor.g * 0.587 + rgbColor.b * 0.114 > 186;
};
