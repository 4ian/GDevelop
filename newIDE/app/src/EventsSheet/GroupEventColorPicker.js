// @flow
import { type RGBColor } from '../Utils/ColorTransformer';

const gd: libGDevelop = global.gd;

const colorSpaceSize = 256 * 256 * 256;
const randomColorAttempts = 100;

export const getGroupEventColorKey = (groupEvent: gdGroupEvent): string =>
  `${groupEvent.getBackgroundColorR()};${groupEvent.getBackgroundColorG()};${groupEvent.getBackgroundColorB()}`;

const getColorKey = (color: RGBColor): string =>
  `${color.r};${color.g};${color.b}`;

const colorNumberToRGBColor = (colorNumber: number): RGBColor => ({
  r: (colorNumber >> 16) & 0xff,
  g: (colorNumber >> 8) & 0xff,
  b: colorNumber & 0xff,
});

const getRandomColorNumber = (random: () => number): number =>
  Math.min(colorSpaceSize - 1, Math.floor(random() * colorSpaceSize));

const addUsedGroupEventColorKeys = (
  eventsList: gdEventsList,
  usedColorKeys: Set<string>
) => {
  for (let index = 0; index < eventsList.getEventsCount(); index++) {
    const event = eventsList.getEventAt(index);

    if (event.getType() === 'BuiltinCommonInstructions::Group') {
      usedColorKeys.add(getGroupEventColorKey(gd.asGroupEvent(event)));
    }

    if (event.canHaveSubEvents()) {
      addUsedGroupEventColorKeys(event.getSubEvents(), usedColorKeys);
    }
  }
};

export const collectUsedGroupEventColorKeys = (
  eventsList: gdEventsList
): Set<string> => {
  const usedColorKeys = new Set<string>();
  addUsedGroupEventColorKeys(eventsList, usedColorKeys);
  return usedColorKeys;
};

export const pickRandomUniqueGroupEventColor = (
  usedColorKeys: Set<string>,
  random: () => number = Math.random
): RGBColor => {
  for (let attempt = 0; attempt < randomColorAttempts; attempt++) {
    const color = colorNumberToRGBColor(getRandomColorNumber(random));
    if (!usedColorKeys.has(getColorKey(color))) return color;
  }

  const startColorNumber = getRandomColorNumber(random);
  for (let offset = 0; offset < colorSpaceSize; offset++) {
    const color = colorNumberToRGBColor(
      (startColorNumber + offset) % colorSpaceSize
    );
    if (!usedColorKeys.has(getColorKey(color))) return color;
  }

  // No unique RGB color exists in a fully exhausted color space.
  return colorNumberToRGBColor(startColorNumber);
};

export const setRandomUniqueGroupEventColor = (
  groupEvent: gdGroupEvent,
  usedColorKeys: Set<string>,
  random?: () => number
) => {
  const color = pickRandomUniqueGroupEventColor(usedColorKeys, random);
  groupEvent.setBackgroundColor(color.r, color.g, color.b);
};
