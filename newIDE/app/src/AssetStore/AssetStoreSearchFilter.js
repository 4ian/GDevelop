// @flow
import { TagSearchFilter, SearchFilter } from '../UI/Search/UseSearchItem';
import {
  type AssetShortHeader,
  type PrivateAssetPack,
  type PublicAssetPack,
} from '../Utils/GDevelopServices/Asset';
import { type PrivateAssetPackListingData } from '../Utils/GDevelopServices/Shop';
import {
  type RGBColor,
  rgbToHsl,
  hexNumberToRGBColor,
} from '../Utils/ColorTransformer';

export class TagAssetStoreSearchFilter extends TagSearchFilter<AssetShortHeader> {
  constructor(tags: Set<string> = new Set()) {
    super(tags);
  }
}

export class ObjectTypeAssetStoreSearchFilter
  implements SearchFilter<AssetShortHeader> {
  objectTypes: Set<string>;

  constructor(objectTypes: Set<string> = new Set()) {
    this.objectTypes = objectTypes;
  }

  getPertinence(searchItem: AssetShortHeader): number {
    return this.objectTypes.size === 0 ||
      this.objectTypes.has(searchItem.objectType)
      ? 1
      : 0;
  }

  hasFilters(): boolean {
    return this.objectTypes.size > 0;
  }
}

export class LicenseAssetStoreSearchFilter
  implements SearchFilter<AssetShortHeader> {
  attributionFreeOnly: boolean;

  static noAttributionLicenses = [
    'CC0 (public domain)',
    'Apache 2.0',
    'Trademark of GDevelop Ltd (fair use authorised in GDevelop games)',
    'SIL Open Font License 1.1 (OFL)',
  ];

  constructor(attributionFreeOnly: boolean = false) {
    this.attributionFreeOnly = attributionFreeOnly;
  }

  getPertinence(searchItem: AssetShortHeader): number {
    return !this.attributionFreeOnly ||
      LicenseAssetStoreSearchFilter.noAttributionLicenses.includes(
        searchItem.license
      )
      ? 1
      : 0;
  }

  hasFilters(): boolean {
    return this.attributionFreeOnly;
  }
}

export class AssetPackTypeStoreSearchFilter
  implements SearchFilter<PublicAssetPack | PrivateAssetPackListingData> {
  isFree: boolean;
  isPremium: boolean;
  isOwned: boolean;
  receivedAssetPacks: Array<PrivateAssetPack>;

  constructor({
    isFree = false,
    isPremium = false,
    isOwned = false,
    receivedAssetPacks = [],
  }: {|
    isFree?: boolean,
    isPremium?: boolean,
    isOwned?: boolean,
    receivedAssetPacks?: ?Array<PrivateAssetPack>,
  |}) {
    this.isFree = isFree;
    this.isPremium = isPremium;
    this.isOwned = isOwned;
    this.receivedAssetPacks = receivedAssetPacks || [];
  }

  getPertinence(
    searchItem: PublicAssetPack | PrivateAssetPackListingData
  ): number {
    // Return all packs when no filter is selected.
    if (!this.isFree && !this.isPremium && !this.isOwned) return 1;
    if (
      this.isOwned &&
      searchItem.prices &&
      this.receivedAssetPacks
        .map(assetPack => assetPack.id)
        .includes(searchItem.id)
    )
      return 1;
    if (this.isPremium && searchItem.prices) return 1;
    if (this.isFree && !searchItem.prices) return 1;
    return 0;
  }

  hasFilters(): boolean {
    return this.isFree || this.isPremium || this.isOwned;
  }
}

export class AnimatedAssetStoreSearchFilter
  implements SearchFilter<AssetShortHeader> {
  mustBeAnimated: boolean;
  mustHaveSeveralState: boolean;

  constructor(
    mustBeAnimated: boolean = false,
    mustHaveSeveralState: boolean = false
  ) {
    this.mustBeAnimated = mustBeAnimated;
    this.mustHaveSeveralState = mustHaveSeveralState;
  }

  getPertinence(searchItem: AssetShortHeader): number {
    const hasAnimatedState = searchItem.maxFramesCount > 1;
    const hasSeveralStates = searchItem.animationsCount > 1;
    return (!this.mustBeAnimated || hasAnimatedState) &&
      (!this.mustHaveSeveralState || hasSeveralStates)
      ? 1
      : 0;
  }

  hasFilters(): boolean {
    return this.mustBeAnimated || this.mustHaveSeveralState;
  }
}

export class DimensionAssetStoreSearchFilter
  implements SearchFilter<AssetShortHeader> {
  dimensionMin: number;
  dimensionMax: number;

  static boundMin = 8;
  static boundMax = 2048;

  constructor(
    dimensionMin: number = DimensionAssetStoreSearchFilter.boundMin,
    dimensionMax: number = DimensionAssetStoreSearchFilter.boundMax
  ) {
    this.dimensionMin = dimensionMin;
    this.dimensionMax = dimensionMax;
  }

  getPertinence(searchItem: AssetShortHeader): number {
    // Assets with no defined dimensions are always pertinent. (ex: particle emitter)
    if (!searchItem.width || !searchItem.height) {
      return 1;
    }
    return ((this.dimensionMin === DimensionAssetStoreSearchFilter.boundMin ||
      this.dimensionMin <= searchItem.width) &&
      (this.dimensionMin === DimensionAssetStoreSearchFilter.boundMax ||
        searchItem.width <= this.dimensionMax)) ||
      ((this.dimensionMin === DimensionAssetStoreSearchFilter.boundMin ||
        this.dimensionMin <= searchItem.height) &&
        (this.dimensionMin === DimensionAssetStoreSearchFilter.boundMax ||
          searchItem.height <= this.dimensionMax))
      ? 1
      : 0;
  }

  hasFilters(): boolean {
    return (
      this.dimensionMin !== DimensionAssetStoreSearchFilter.boundMin ||
      this.dimensionMax !== DimensionAssetStoreSearchFilter.boundMax
    );
  }
}

/**
 * Modulo operation
 * @param x Dividend value.
 * @param y Divisor value.
 * @returns Return the remainder using Euclidean division.
 */
const mod = function(x: number, y: number): number {
  return ((x % y) + y) % y;
};

/**
 * @param colorA
 * @param colorB
 * @returns Return the similitude between the 2 colors
 * (1 when they are the same).
 */
const getColorSimilitude = function(
  colorA: RGBColor,
  colorB: RGBColor
): number {
  const targetHsl = rgbToHsl(colorA.r, colorA.g, colorA.b);
  const dominantHsl = rgbToHsl(colorB.r, colorB.g, colorB.b);
  const targetSaturation = targetHsl[1];
  const dominantSaturation = dominantHsl[1];
  if (targetSaturation === 0) {
    // Hue is not relevant.
    const deltaSaturation = dominantSaturation - targetSaturation;
    const deltaLightness = dominantHsl[2] - targetHsl[2];
    return (
      1 -
      (deltaSaturation * deltaSaturation + deltaLightness * deltaLightness) / 2
    );
  }
  // Hue distance can only be up to 0.5 as it's looping.
  // So, it's multiplied by 2 to cover [0, 1].
  const deltaHue =
    dominantSaturation === 0
      ? 1
      : 2 * Math.abs(mod(dominantHsl[0] - targetHsl[0] + 0.5, 1) - 0.5);
  const deltaSaturation = dominantSaturation - targetSaturation;
  const deltaLightness = dominantHsl[2] - targetHsl[2];
  // Give more importance to hue as it catches human eyes.
  return (
    1 -
    (4 * deltaHue * deltaHue +
      deltaSaturation * deltaSaturation +
      deltaLightness * deltaLightness) /
      6
  );
};

export class ColorAssetStoreSearchFilter
  implements SearchFilter<AssetShortHeader> {
  color: RGBColor | null;

  constructor(color: RGBColor | null = null) {
    this.color = color;
  }

  getPertinence(searchItem: AssetShortHeader): number {
    const color = this.color;
    if (!color) {
      return 1;
    }
    // Not zero because the item should not be excluded.
    let scoreMax = Number.MIN_VALUE;
    for (const dominantColor of searchItem.dominantColors) {
      const dominantRgb = hexNumberToRGBColor(dominantColor);
      const score = getColorSimilitude(dominantRgb, color);
      scoreMax = Math.max(scoreMax, score);
    }
    return scoreMax;
  }

  hasFilters(): boolean {
    return !!this.color;
  }
}

const toAssetStoreType = (type: string) => {
  return type === 'Sprite' ? 'sprite' : type;
};

// Thematic tags are noise for asset swapping as changing the theme may be what
// users are looking for.
const ignoredThematicTags = new Set([
  'top-down',
  'isometric',
  'side view',
  'pixel art',
  'pirate',
  'space',
  'sea',
  'city',
  'medieval',
  'nature',
  'forest',
]);

export class AssetSwappingAssetStoreSearchFilter
  implements SearchFilter<AssetShortHeader> {
  isEnabled: boolean;
  objectType: string;
  hasSeveralStates: boolean;
  other: AssetShortHeader | null;
  tags: Array<string>;

  constructor(
    object: gdObject | null = null,
    assetShortHeader: AssetShortHeader | null = null
  ) {
    if (object) {
      this.isEnabled = true;
      this.objectType = assetShortHeader
        ? assetShortHeader.objectType
        : toAssetStoreType(object.getType());
      this.hasSeveralStates =
        object.getConfiguration().getAnimationsCount() > 0;
      this.other = assetShortHeader;
      // The asset pack tag (which is the first tag) is not relevant.
      this.tags = assetShortHeader
        ? assetShortHeader.tags
            .slice(1)
            .filter(tags => !ignoredThematicTags.has(tags))
        : [];
    } else {
      this.isEnabled = false;
      this.objectType = '';
      this.hasSeveralStates = false;
      this.other = null;
      this.tags = [];
    }
  }

  getPertinence(searchItem: AssetShortHeader): number {
    // As the sort is done with a dichotomy, items with similitude under 0.5
    // are not sorted at all.
    if (!this.isEnabled) {
      return 1;
    }
    if (this.objectType !== searchItem.objectType) {
      return 0;
    }

    let similitude = 1;

    const { other } = this;
    if (!other) {
      const hasSeveralStates = searchItem.animationsCount > 1;
      if (this.hasSeveralStates && !hasSeveralStates) {
        similitude *= 0.8;
      }

      return similitude;
    }

    {
      const isTopDown = searchItem.tags.includes('top-down');
      const isIsometric = searchItem.tags.includes('isometric');
      const isSideView = searchItem.tags.includes('side view');

      const otherIsTopDown = other.tags.includes('top-down');
      const otherIsIsometric = other.tags.includes('isometric');
      const otherIsSideView = other.tags.includes('side view');

      const areCompatible =
        (isTopDown && otherIsTopDown) ||
        (isIsometric && otherIsIsometric) ||
        (isSideView && otherIsSideView) ||
        (!isTopDown &&
          !isIsometric &&
          !isSideView &&
          !otherIsTopDown &&
          !otherIsIsometric &&
          !otherIsSideView);
      if (!areCompatible) {
        similitude *= 0.8;
      }
    }

    if (this.tags.length > 0) {
      const sharedTagsCount = this.tags.reduce(
        (accumulator, currentValue) =>
          accumulator + (searchItem.tags.includes(currentValue) ? 1 : 0),
        0
      );
      similitude *= 0.8 + (0.2 * sharedTagsCount) / this.tags.length;
    }

    {
      const surface = searchItem.width * searchItem.height;
      const otherSurface = other.width * other.height;
      const smallestSurface = Math.min(surface, otherSurface);
      const greatestSurface = Math.max(surface, otherSurface);

      similitude *= 0.95 + (0.05 * smallestSurface) / greatestSurface;
    }
    {
      const ratio = searchItem.width / searchItem.height;
      const otherRatio = other.width / other.height;
      const smallestRatio = Math.min(ratio, otherRatio);
      const greatestRatio = Math.max(ratio, otherRatio);

      similitude *= 0.95 + (0.05 * smallestRatio) / greatestRatio;
    }

    const hasAnimatedState = searchItem.maxFramesCount > 1;
    const hasSeveralStates = searchItem.animationsCount > 1;
    const otherHasAnimatedState = other.maxFramesCount > 1;
    const otherHasSeveralState = other.animationsCount > 1;
    if (
      (otherHasAnimatedState || otherHasSeveralState) &&
      hasAnimatedState === otherHasAnimatedState &&
      hasSeveralStates === otherHasSeveralState
    ) {
      // There is not a lot of animated assets in the store.
      // This ensures they are shown.
      similitude = 0.76 + 0.24 * ((Math.max(0.5, similitude) - 0.5) * 2);
    }

    return similitude;
  }

  hasFilters(): boolean {
    return true;
  }
}

export class SimilarAssetStoreSearchFilter
  implements SearchFilter<AssetShortHeader> {
  other: AssetShortHeader;

  constructor(other: AssetShortHeader) {
    this.other = other;
  }

  getPertinence(searchItem: AssetShortHeader): number {
    if (
      this.other === searchItem ||
      this.other.objectType !== searchItem.objectType
    ) {
      return 0;
    }

    {
      const hasAnimatedState = searchItem.maxFramesCount > 1;
      const hasSeveralStates = searchItem.animationsCount > 1;
      const otherHasAnimatedState = this.other.maxFramesCount > 1;
      const otherHasSeveralState = this.other.animationsCount > 1;
      if (
        hasAnimatedState !== otherHasAnimatedState ||
        hasSeveralStates !== otherHasSeveralState
      ) {
        return 0;
      }
    }

    {
      const isTopDown = searchItem.tags.includes('top-down');
      const isIsometric = searchItem.tags.includes('isometric');
      const isSideView = searchItem.tags.includes('side view');

      const otherIsTopDown = this.other.tags.includes('top-down');
      const otherIsIsometric = this.other.tags.includes('isometric');
      const otherIsSideView = this.other.tags.includes('side view');

      const areCompatible =
        (isTopDown && otherIsTopDown) ||
        (isIsometric && otherIsIsometric) ||
        (isSideView && otherIsSideView) ||
        (!isTopDown &&
          !isIsometric &&
          !isSideView &&
          !otherIsTopDown &&
          !otherIsIsometric &&
          !otherIsSideView);
      if (!areCompatible) {
        return 0;
      }
    }

    {
      const surface = searchItem.width * searchItem.height;
      const otherSurface = this.other.width * this.other.height;
      const smallestSurface = Math.min(surface, otherSurface);
      const greatestSurface = Math.max(surface, otherSurface);

      if (2 * smallestSurface < greatestSurface) {
        return 0;
      }
    }
    {
      const ratio = searchItem.width / searchItem.height;
      const otherRatio = this.other.width / this.other.height;
      const smallestRatio = Math.min(ratio, otherRatio);
      const greatestRatio = Math.max(ratio, otherRatio);

      if (1.5 * smallestRatio < greatestRatio) {
        return 0;
      }
    }

    let colorSimilitude;
    {
      let scoreMax = 0;
      for (const dominantColor of searchItem.dominantColors) {
        const dominantRgb = hexNumberToRGBColor(dominantColor);
        for (const otherDominantColor of this.other.dominantColors) {
          const otherDominantRgb = hexNumberToRGBColor(otherDominantColor);
          const score = getColorSimilitude(dominantRgb, otherDominantRgb);
          scoreMax = Math.max(scoreMax, score);
        }
      }
      colorSimilitude = scoreMax;
    }

    return colorSimilitude;
  }

  hasFilters(): boolean {
    return true;
  }
}
