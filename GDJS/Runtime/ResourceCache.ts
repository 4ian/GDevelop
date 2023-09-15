/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export class ResourceCache<C> {
    private _nameToContent = new Map<string, C>();
    private _fileToContent = new Map<string, C>();

    constructor() {}

    getFromName(name: string): C | null {
      return this._nameToContent.get(name) || null;
    }

    /**
     * Historically, some resource parameters can be filled with a file name
     * instead of a resource name.
     */
    getFromFile(file: string): C | null {
      return this._fileToContent.get(file) || null;
    }

    get(resource: ResourceData): C | null {
      let existingContent = this._nameToContent.get(resource.name);
      if (existingContent) {
        return existingContent;
      }
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
