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

/**
 * Convert a hex color value to an rgb object value.
 */
export const getRGBColorFromHex = (hex: string) => {
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    let c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    const cols = '0x' + c.join('');
    return {
      r: parseInt((cols >> 16) & 255),
      g: parseInt((cols >> 8) & 255),
      b: parseInt(cols & 255),
      a: 255,
    };
  }
  console.warn('Bad Hex');
  return { r: 128, g: 128, b: 128, a: 255 };
};
