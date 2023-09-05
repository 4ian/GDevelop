/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('JSON Manager');

  /** The callback called when a json that was requested is loaded (or an error occurred). */
  export type JsonManagerRequestCallback = (
    error: Error | null,
    content: Object | null
  ) => void;

  /**
   * JsonManager loads json files (using `XMLHttpRequest`), using the "json" resources
   * registered in the game resources.
   *
   * Contrary to audio/fonts, json files are loaded asynchronously, when requested.
   * You should properly handle errors, and give the developer/player a way to know
   * that loading failed.
   */
  export class JsonManager {
    _resourcesLoader: RuntimeGameResourcesLoader;
    _resources: Map<string, ResourceData>;

    _loadedJsons: { [key: string]: Object } = {};
    _callbacks: { [key: string]: Array<JsonManagerRequestCallback> } = {};

    /**
     * @param resourceDataArray The resources data of the game.
     * @param resourcesLoader The resources loader of the game.
     */
    constructor(
      resourceDataArray: ResourceData[],
      resourcesLoader: RuntimeGameResourcesLoader
    ) {
      this._resources = new Map<string, ResourceData>();
      this.setResources(resourceDataArray);
      this._resourcesLoader = resourcesLoader;
    }

    /**
     * Update the resources data of the game. Useful for hot-reloading, should not be used otherwise.
     *
     * @param resourceDataArray The resources data of the game.
     */
    setResources(resourceDataArray: ResourceData[]): void {
      this._resources.clear();
      for (const resourceData of resourceDataArray) {
        if (
          resourceData.kind === 'json' ||
          resourceData.kind === 'tilemap' ||
          resourceData.kind === 'tileset'
        ) {
          this._resources.set(resourceData.name, resourceData);
        }
      }
    }

    /**
     * Request all the json resources to be preloaded (unless they are marked as not preloaded).
     *
     * Note that even if a JSON is already loaded, it will be reloaded (useful for hot-reloading,
     * as JSON files can have been modified without the editor knowing).
     *
     * @param onProgress The function called after each json is loaded.
     */
    async preloadJsons(
      onProgress: (loadedCount: integer, totalCount: integer) => void
    ): Promise<integer> {
      const preloadedResources = [...this._resources.values()].filter(
        (resource) => !resource.disablePreload
      );

      let loadedCount = 0;
      await Promise.all(
        preloadedResources.map(async (resource) => {
          try {
            await this.loadJsonAsync(resource.name);
          } catch (error) {
            logger.error('Error while preloading a json resource:' + error);
          }
          loadedCount++;
          onProgress(loadedCount, this._resources.size);
        })
      );
      return loadedCount;
    }

    loadJsonAsync(resourceName: string): Promise<Object | null> {
      const that = this;
      return new Promise((resolve, reject) => {
        that.loadJson(resourceName, (error, content) => {
          if (error) {
            reject(error.message);
          }
          resolve(content);
        });
      });
    }

    /**
     * Request the json file from the given resource name.
     * This method is asynchronous. When loaded, the `callback` is called with the error
     * (null if none) and the loaded json (a JS Object).
     *
     * @param resourceName The resource pointing to the json file to load.
     * @param callback The callback function called when json is loaded (or an error occurred).
     */
    loadJson(resourceName: string, callback: JsonManagerRequestCallback): void {
      const resource = this._resources.get(resourceName);
      if (!resource) {
        callback(
          new Error(
            'Can\'t find resource with name: "' +
              resourceName +
              '" (or is not a json resource).'
          ),
          null
        );
        return;
      }

      // Don't fetch again an object that is already in memory
      if (this._loadedJsons[resourceName]) {
        callback(null, this._loadedJsons[resourceName]);
        return;
      }
      // Don't fetch again an object that is already being fetched.
      {
        const callbacks = this._callbacks[resourceName];
        if (callbacks) {
          callbacks.push(callback);
          return;
        } else {
          this._callbacks[resourceName] = [callback];
        }
      }
      const that = this;
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'json';
      xhr.withCredentials = this._resourcesLoader.checkIfCredentialsRequired(
        resource.file
      );
      xhr.open('GET', this._resourcesLoader.getFullUrl(resource.file));
      xhr.onload = function () {
        const callbacks = that._callbacks[resourceName];
        if (!callbacks) {
          return;
        }
        if (xhr.status !== 200) {
          for (const callback of callbacks) {
            callback(
              new Error(
                'HTTP error: ' + xhr.status + '(' + xhr.statusText + ')'
              ),
              null
            );
          }
          delete that._callbacks[resourceName];
          return;
        }

        // Cache the result
        that._loadedJsons[resourceName] = xhr.response;
        for (const callback of callbacks) {
          callback(null, xhr.response);
        }
        delete that._callbacks[resourceName];
      };
      xhr.onerror = function () {
        const callbacks = that._callbacks[resourceName];
        if (!callbacks) {
          return;
        }
        for (const callback of callbacks) {
          callback(new Error('Network error'), null);
        }
        delete that._callbacks[resourceName];
      };
      xhr.onabort = function () {
        const callbacks = that._callbacks[resourceName];
        if (!callbacks) {
          return;
        }
        for (const callback of callbacks) {
          callback(new Error('Request aborted'), null);
        }
        delete that._callbacks[resourceName];
      };
      xhr.send();
    }

    /**
     * Check if the given json resource was loaded (preloaded or loaded with `loadJson`).
     * @param resourceName The name of the json resource.
     * @returns true if the content of the json resource is loaded. false otherwise.
     */
    isJsonLoaded(resourceName: string): boolean {
      return !!this._loadedJsons[resourceName];
    }

    /**
     * Get the object for the given resource that is already loaded (preloaded or loaded with `loadJson`).
     * If the resource is not loaded, `null` will be returned.
     *
     * @param resourceName The name of the json resource.
     * @returns the content of the json resource, if loaded. `null` otherwise.
     */
    getLoadedJson(resourceName: string): Object | null {
      return this._loadedJsons[resourceName] || null;
    }
  }
}
