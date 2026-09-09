// @flow
import { darken, lighten } from '@material-ui/core/styles';
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
