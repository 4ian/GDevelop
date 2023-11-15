/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
    const logger = new gdjs.Logger('Spine Manager');

    /**
     * SpineManager manages pixi spine skeleton data.
     *
     * It doesn`t load data by itself but it is designed to store data that was loaded by some other managers.
     * E.g. spine skeleton can be loaded in JsonManager as we don`t know real meaning of json file.
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
       * @param resourceName The name of the spine skeleton.
       * @returns the spine skeleton if loaded, `null` otherwise.
       */
      getSpine(resourceName: string): pixi_spine.ISkeletonData {
        return this._spineData[resourceName] || null;
      }
   
      /**
       * Check if the given spine skeleton was loaded.
       * @param resourceName The name of the spine skeleton.
       * @returns true if the content of the spine skeleton is loaded, false otherwise.
       */
      isSpineLoaded(resourceName: string): boolean {
        return !!this._spineData[resourceName];
      }
    }
  }
  