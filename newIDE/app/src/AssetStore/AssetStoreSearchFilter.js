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
  licenses: Set<string>;

  constructor(objectTypes: Set<string> = new Set()) {
    this.licenses = objectTypes;
  }

  isSatisfiedBy(searchItem: AssetShortHeader): boolean {
    return this.licenses.size === 0 || this.licenses.has(searchItem.license);
  }
}

export class AnimatedAssetStoreSearchFilter
  implements SearchFilter<AssetShortHeader> {
  mustBeAnimated: boolean | null;
  mustHaveSeveralState: boolean;

  constructor(mustBeAnimated: boolean, mustHaveSeveralState: boolean) {
    this.mustBeAnimated = mustBeAnimated;
    this.mustHaveSeveralState = mustHaveSeveralState;
  }

  isSatisfiedBy(searchItem: AssetShortHeader): boolean {
    const hasAnimatedState = searchItem.maxFramesCount > 1;
    const hasSeveralState = searchItem.animationCount > 1;
    return this.mustBeAnimated === null || hasAnimatedState === this.animated
    && this.mustHaveSeveralState === null || hasSeveralState === this.animated;
  }
}
