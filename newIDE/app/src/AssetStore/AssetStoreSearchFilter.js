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
  animated: boolean | null;

  constructor(animated: boolean | null = null) {
    this.animated = animated;
  }

  isSatisfiedBy(searchItem: AssetShortHeader): boolean {
    const hasAnimatedAnimation = searchItem.maxFramesCount > 1;
    return this.animated === null || hasAnimatedAnimation === this.animated;
  }
}

export class StatedAssetStoreSearchFilter
  implements SearchFilter<AssetShortHeader> {
  stated: boolean | null;

  constructor(stated: boolean | null = null) {
    this.stated = stated;
  }

  isSatisfiedBy(searchItem: AssetShortHeader): boolean {
    const hasAnimations = searchItem.animationsCount > 1;
    return this.stated === null || hasAnimations === this.stated;
  }
}
