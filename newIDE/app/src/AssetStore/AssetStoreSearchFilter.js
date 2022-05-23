// @flow
import { TagSearchFilter, SearchFilter } from '../UI/Search/UseSearchItem';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';
import {
  type RGBColor,
  rgbToHsl,
  hexNumberToRGBColor,
} from '../Utils/ColorTransformer';

export class TagAssetStoreSearchFilter extends TagSearchFilter<AssetShortHeader> {
  constructor(tags: Set<string> = new Set()) {
    super(tags);
  }

  isSatisfiedBy(searchItem: AssetShortHeader): boolean {
    return (
      this.tags.size === 0 || searchItem.tags.some(tag => this.tags.has(tag))
    );
  }
}

export class ObjectTypeAssetStoreSearchFilter
  implements SearchFilter<AssetShortHeader> {
  objectTypes: Set<string>;

  constructor(objectTypes: Set<string> = new Set()) {
    this.objectTypes = objectTypes;
  }

  isSatisfiedBy(searchItem: AssetShortHeader): boolean {
    return (
      this.objectTypes.size === 0 || this.objectTypes.has(searchItem.objectType)
    );
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

  isSatisfiedBy(searchItem: AssetShortHeader): boolean {
    return (
      !this.attributionFreeOnly ||
      LicenseAssetStoreSearchFilter.noAttributionLicenses.includes(
        searchItem.license
      )
    );
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

  isSatisfiedBy(searchItem: AssetShortHeader): boolean {
    const hasAnimatedState = searchItem.maxFramesCount > 1;
    const hasSeveralState = searchItem.animationsCount > 1;
    return (
      (!this.mustBeAnimated || hasAnimatedState) &&
      (!this.mustHaveSeveralState || hasSeveralState)
    );
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

  isSatisfiedBy(searchItem: AssetShortHeader): boolean {
    return (
      ((this.dimensionMin === DimensionAssetStoreSearchFilter.boundMin ||
        this.dimensionMin <= searchItem.width) &&
        (this.dimensionMin === DimensionAssetStoreSearchFilter.boundMax ||
          searchItem.width <= this.dimensionMax)) ||
      ((this.dimensionMin === DimensionAssetStoreSearchFilter.boundMin ||
        this.dimensionMin <= searchItem.height) &&
        (this.dimensionMin === DimensionAssetStoreSearchFilter.boundMax ||
          searchItem.height <= this.dimensionMax))
    );
  }
}

/**
 * Modulo operation (the remainder after dividing one number by another)
 * @param x Dividend value.
 * @param y Divisor value.
 * @returns Return the remainder for the values.
 */
const mod = function(x: number, y: number): number {
  return x - y * Math.floor(x / y);
};

export class ColorAssetStoreSearchFilter
  implements SearchFilter<AssetShortHeader> {
  color: RGBColor | null;

  constructor(color: RGBColor | null = null) {
    this.color = color;
  }

  isSatisfiedBy(searchItem: AssetShortHeader): boolean {
    if (!this.color) return true;
    const targetHsl = rgbToHsl(this.color.r, this.color.g, this.color.b);
    const dominantRgb = hexNumberToRGBColor(searchItem.dominantColors[0]);
    const dominantHsl = rgbToHsl(dominantRgb.r, dominantRgb.g, dominantRgb.b);
    const targetSaturation = targetHsl[1];
    const dominantSaturation = dominantHsl[1];
    let score = 0;
    if (targetSaturation === 0) {
      // Hue is not relevent.
      const deltaSaturation = dominantSaturation - targetSaturation;
      const deltaLightness = dominantHsl[2] - targetHsl[2];
      score =
        1 -
        (deltaSaturation * deltaSaturation + deltaLightness * deltaLightness) /
          2;
    } else {
      // Hue distance can only be up to 0.5 as it's looping.
      // So, it's multiplied by 2 to cover [0, 1].
      const deltaHue =
        dominantSaturation === 0
          ? 1
          : 2 * Math.abs(mod(dominantHsl[0] - targetHsl[0] + 0.5, 1) - 0.5);
      const deltaSaturation = dominantSaturation - targetSaturation;
      const deltaLightness = dominantHsl[2] - targetHsl[2];
      // Give more importance to hue as it catches human eyes.
      score =
        1 -
        (4 * deltaHue * deltaHue +
          deltaSaturation * deltaSaturation +
          deltaLightness * deltaLightness) /
          6;
    }
    return score > 0.94;
  }
}
