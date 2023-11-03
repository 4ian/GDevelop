/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
    const logger = new gdjs.Logger('Spine Manager');

    /**
     * JsonManager loads json files (using `XMLHttpRequest`), using the "json" resources
     * registered in the game resources.
     *
     * Contrary to audio/fonts, json files are loaded asynchronously, when requested.
     * You should properly handle errors, and give the developer/player a way to know
     * that loading failed.
     */
    export class SpineManager {
      _spineData: { [key: string]: pixi_spine.ISkeletonData } = {};

      setSpine(resourceName: string, spineData: pixi_spine.ISkeletonData) {
        this._spineData[resourceName] = spineData;
      }

      /**
       * Get the object for the given resource that is already loaded (preloaded or loaded with `loadJson`).
       * If the resource is not loaded, `null` will be returned.
       *
       * @param resourceName The name of the json resource.
       * @returns the content of the json resource, if loaded. `null` otherwise.
       */
      getSpine(resourceName: string): pixi_spine.ISkeletonData {
        return this._spineData[resourceName] || null;
      }
   
      /**
       * Check if the given json resource was loaded (preloaded or loaded with `loadJson`).
       * @param resourceName The name of the json resource.
       * @returns true if the content of the json resource is loaded. false otherwise.
       */
      isSpineLoaded(resourceName: string): boolean {
        return !!this._spineData[resourceName];
      }
    }
  }
  