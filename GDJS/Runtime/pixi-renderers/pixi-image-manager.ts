/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * PixiImageManager loads and stores textures that can be used by the Pixi.js renderers.
   */
  export class PixiImageManager {
    _resources: any;

    // The invalid texture is a 8x8 PNG file filled with magenta (#ff00ff), to be
    // easily spotted if rendered on screen.
    _invalidTexture: any;
    _loadedTextures: any;

    /**
     * @param resources The resources data of the game.
     */
    constructor(resources: ResourceData[]) {
      this._resources = resources;
      this._invalidTexture = PIXI.Texture.from(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVQoU2P8z/D/PwMewDgyFAAApMMX8Zi0uXAAAAAASUVORK5CYIIA'
      );
      this._loadedTextures = new Hashtable();
    }

    /**
     * Update the resources data of the game. Useful for hot-reloading, should not be used otherwise.
     *
     * @param resources The resources data of the game.
     */
    setResources(resources: ResourceData[]): void {
      this._resources = resources;
    }

    /**
     * Return the PIXI texture associated to the specified resource name.
     * Returns a placeholder texture if not found.
     * @param resourceName The name of the resource
     * @returns The requested texture, or a placeholder if not found.
     */
    getPIXITexture(resourceName: string): PIXI.Texture {
      if (this._loadedTextures.containsKey(resourceName)) {
        return this._loadedTextures.get(resourceName);
      }
      if (resourceName === '') {
        return this._invalidTexture;
      }

      //Texture is not loaded, load it now from the resources list.
      if (this._resources) {
        let texture: PIXI.Texture | null = null;
        for (let i = 0, len = this._resources.length; i < len; ++i) {
          const res = this._resources[i];
          if (res.name === resourceName && res.kind === 'image') {
            texture = PIXI.Texture.from(res.file);
            break;
          }
        }
        if (texture !== null) {
          console.log('Loaded texture for resource "' + resourceName + '".');
          this._loadedTextures.put(resourceName, texture);
          return texture;
        }
      }
      console.warn(
        'Unable to find texture for resource "' + resourceName + '".'
      );
      return this._invalidTexture;
    }

    /**
     * Return the PIXI video texture associated to the specified resource name.
     * Returns a placeholder texture if not found.
     * @param resourceName The name of the resource to get.
     */
    getPIXIVideoTexture(resourceName: string) {
      if (this._loadedTextures.containsKey(resourceName)) {
        return this._loadedTextures.get(resourceName);
      }
      if (resourceName === '') {
        return this._invalidTexture;
      }

      //Texture is not loaded, load it now from the resources list.
      if (this._resources) {
        let texture: PIXI.Texture | null = null;
        for (let i = 0, len = this._resources.length; i < len; ++i) {
          const res = this._resources[i];
          if (res.name === resourceName && res.kind === 'video') {
            texture = PIXI.Texture.from(res.file);
            break;
          }
        }
        if (texture !== null) {
          console.log(
            'Loaded video texture for resource "' + resourceName + '".'
          );
          this._loadedTextures.put(resourceName, texture);
          return texture;
        }
      }
      console.warn(
        'Unable to find video texture for resource "' + resourceName + '".'
      );
      return this._invalidTexture;
    }

    /**
     * Return a PIXI texture which can be used as a placeholder when no
     * suitable texture can be found.
     */
    getInvalidPIXITexture() {
      return this._invalidTexture;
    }

    /**
     * Load the specified resources, so that textures are loaded and can then be
     * used by calling `getPIXITexture`.
     * @param onProgress Callback called each time a new file is loaded.
     * @param onComplete Callback called when loading is done.
     */
    loadTextures(onProgress, onComplete) {
      const resources = this._resources;

      //Construct the list of files to be loaded.
      //For one loaded file, it can have one or more resources
      //that use it.
      const files = {};
      for (let i = 0, len = resources.length; i < len; ++i) {
        const res = resources[i];
        if (res.file && res.kind === 'image') {
          if (this._loadedTextures.containsKey(res.name)) {
            continue;
          }
          files[res.file] = files[res.file]
            ? files[res.file].concat(res)
            : [res];
        }
      }
      const totalCount = Object.keys(files).length;
      if (totalCount === 0) {
        return onComplete(
          //Nothing to load.
          totalCount
        );
      }
      const loader = PIXI.Loader.shared;
      const that = this;
      let loadingCount = 0;
      const progressCallbackId = loader.onProgress.add(function () {
        loadingCount++;
        onProgress(loadingCount, totalCount);
      });
      for (const file in files) {
        if (files.hasOwnProperty(file)) {
          loader.add(file, file);
        }
      }
      loader.load(function (loader, loadedFiles) {
        loader.onProgress.detach(progressCallbackId);

        //Store the loaded textures so that they are ready to use.
        for (const file in loadedFiles) {
          if (loadedFiles.hasOwnProperty(file)) {
            if (!files.hasOwnProperty(file)) {
              continue;
            }
            files[file].forEach(function (res) {
              // @ts-ignore
              that._loadedTextures.put(res.name, loadedFiles[file].texture);
              if (!res.smoothed) {
                // @ts-ignore
                loadedFiles[file].texture.baseTexture.scaleMode =
                  PIXI.SCALE_MODES.NEAREST;
              }
            });
          }
        }
        onComplete(totalCount);
      });
    }
  }

  //Register the class to let the engine use it.
  export const ImageManager = gdjs.PixiImageManager;
  export type ImageManager = gdjs.PixiImageManager;
}
