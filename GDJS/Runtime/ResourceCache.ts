/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * A cache of resources that helps ensuring that files are only downloaded
   * once.
   */
  export class ResourceCache<C> {
    private _nameToContent = new Map<string, C>();
    private _fileToContent = new Map<string, C>();

    constructor() {}

    /**
     * Gives a fast access to asset content when they were pre-loaded and
     * on-the-fly loading is not allowed.
     */
    getFromName(name: string): C | null {
      return this._nameToContent.get(name) || null;
    }

    get(resource: ResourceData): C | null {
      let existingContent = this._nameToContent.get(resource.name);
      if (existingContent) {
        return existingContent;
      }
      // When several assets use the same file, it avoids to download it again.
      existingContent = this._fileToContent.get(resource.file);
      if (existingContent) {
        this._nameToContent.set(resource.name, existingContent);
        return existingContent;
      }
      return null;
    }

    set(resource: ResourceData, content: C) {
      this._nameToContent.set(resource.name, content);
      this._fileToContent.set(resource.file, content);
    }

    delete(resource: ResourceData) {
      this._nameToContent.delete(resource.name);
      this._fileToContent.delete(resource.file);
    }

    clear() {
      this._nameToContent.clear();
      this._fileToContent.clear();
    }
  }
}
