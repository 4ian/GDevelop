// @flow
import { TagSearchFilter, SearchFilter } from '../UI/Search/UseSearchItem';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';

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
