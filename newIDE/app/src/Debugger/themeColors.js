// @flow
import { darken, lighten, getContrastRatio } from '@material-ui/core/styles';
import { type GDevelopTheme } from '../UI/Theme';

/**
 * The colors of the theme usable to tell categories apart (resource kinds,
 * profiler sections). The error color is left out: it is reserved for errors.
 */
const getBaseCategoricalColors = (
  gdevelopTheme: GDevelopTheme
): Array<string> => [
  gdevelopTheme.palette.primary,
  gdevelopTheme.statusIndicator.success,
  gdevelopTheme.statusIndicator.warning,
  gdevelopTheme.palette.secondary,
  gdevelopTheme.chart.dataColor1,
];

/** How many shades of each base color are used. */
const SHADES_COUNT = 3;

/**
 * A color of the theme for the category at this index: the base colors of
 * the theme first, then lighter and darker shades of them.
 */
export const getCategoricalColor = (
  gdevelopTheme: GDevelopTheme,
  index: number
): string => {
  const baseColors = getBaseCategoricalColors(gdevelopTheme);
  const safeIndex =
    Math.abs(Math.floor(index)) % (baseColors.length * SHADES_COUNT);
  const baseColor = baseColors[safeIndex % baseColors.length];
  const shade = Math.floor(safeIndex / baseColors.length);
  if (shade === 1) return lighten(baseColor, 0.3);
  if (shade === 2) return darken(baseColor, 0.3);
  return baseColor;
};

/** A stable hash, so that the same name always gets the same color. */
export const hashString = (text: string): number => {
  let hash = 0;
  for (let index = 0; index < text.length; index++) {
    hash = (hash * 31 + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

/** The colors of the resource kinds, in a fixed order (never cycled). */
const resourceKindsOrder = [
  'image',
  'audio',
  'font',
  'json',
  'model3D',
  'video',
  'tilemap',
  'tileset',
  'bitmapFont',
  'atlas',
  'spine',
];

/**
 * The color of a resource kind, from the theme. `variation` shifts the shade
 * so that neighbouring segments of the same kind can be told apart.
 */
export const getResourceKindColor = (
  gdevelopTheme: GDevelopTheme,
  kind: string,
  variation: number = 0
): string => {
  const kindIndex = resourceKindsOrder.indexOf(kind);
  const baseColor = getCategoricalColor(
    gdevelopTheme,
    kindIndex === -1 ? hashString(kind) : kindIndex
  );
  const shade = Math.abs(Math.floor(variation)) % SHADES_COUNT;
  if (shade === 1) return lighten(baseColor, 0.15);
  if (shade === 2) return darken(baseColor, 0.15);
  return baseColor;
};

/**
 * A stable color for a profiler section name, from the theme, so that the
 * same section keeps its color across frames and panels.
 */
export const getSectionColor = (
  gdevelopTheme: GDevelopTheme,
  sectionName: string
): string => getCategoricalColor(gdevelopTheme, hashString(sectionName));

/**
 * The contrast ratio asked by WCAG 2.1 at the AAA level for the text of a
 * label drawn over a colored background.
 */
const WCAG_AAA_CONTRAST_RATIO = 7;

const BLACK_TEXT_COLOR = '#000000';
const WHITE_TEXT_COLOR = '#ffffff';

/** How much the background is pushed away from the text at each attempt. */
const CONTRAST_ADJUSTMENT_STEP = 0.05;
const MAXIMUM_CONTRAST_ADJUSTMENT = 0.95;

/**
 * Black or white, whichever reads best over this background. Both are tried
 * because a light category color (a turquoise, a yellow) needs black text,
 * while a dark one needs white text.
 */
export const getReadableTextColorOn = (backgroundColor: string): string =>
  getContrastRatio(backgroundColor, BLACK_TEXT_COLOR) >=
  getContrastRatio(backgroundColor, WHITE_TEXT_COLOR)
    ? BLACK_TEXT_COLOR
    : WHITE_TEXT_COLOR;

/**
 * The same color, darkened (or lightened) just enough for the text drawn over
 * it to reach the AAA contrast ratio. The hue is kept, so that the categories
 * stay as easy to tell apart as before.
 */
export const getBackgroundColorReadableWith = (
  backgroundColor: string,
  textColor: string
): string => {
  let adjustedColor = backgroundColor;
  let adjustment = 0;
  const isTextDark = textColor === BLACK_TEXT_COLOR;
  while (
    getContrastRatio(adjustedColor, textColor) < WCAG_AAA_CONTRAST_RATIO &&
    adjustment < MAXIMUM_CONTRAST_ADJUSTMENT
  ) {
    adjustment += CONTRAST_ADJUSTMENT_STEP;
    adjustedColor = isTextDark
      ? lighten(backgroundColor, adjustment)
      : darken(backgroundColor, adjustment);
  }
  return adjustedColor;
};

/**
 * The background and the text color of a profiler section, guaranteed to be
 * readable together (WCAG 2.1 AAA).
 */
export const getReadableSectionColors = (
  gdevelopTheme: GDevelopTheme,
  sectionName: string
): {| backgroundColor: string, textColor: string |} => {
  const baseColor = getSectionColor(gdevelopTheme, sectionName);
  const textColor = getReadableTextColorOn(baseColor);
  return {
    backgroundColor: getBackgroundColorReadableWith(baseColor, textColor),
    textColor,
  };
};
