/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('JSON Manager');
  type JsonManagerOnProgressCallback = (
    loadedCount: integer,
    totalCount: integer
  ) => void;
  type JsonManagerOnCompleteCallback = (totalCount: integer) => void;

  /** The callback called when a json that was requested is loaded (or an error occured). */
  export type JsonManagerRequestCallback = (
    error: Error | null,
    content: Object | null
  ) => void;

  const checkIfCredentialsRequired = (url: string) => {
    // Any resource stored on the GDevelop Cloud buckets needs the "credentials" of the user,
    // i.e: its gdevelop.io cookie, to be passed.
    // Note that this is only useful during previews.
    if (
      url.startsWith('https://project-resources.gdevelop.io/') ||
      url.startsWith('https://project-resources-dev.gdevelop.io/')
    )
      return true;

    // For other resources, use the default way of loading resources ("anonymous" or "same-site").
    return false;
  };

  /**
   * JsonManager loads json files (using `XMLHttpRequest`), using the "json" resources
   * registered in the game resources.
   *
   * Contrary to audio/fonts, json files are loaded asynchronously, when requested.
   * You should properly handle errors, and give the developer/player a way to know
   * that loading failed.
   */
  export class JsonManager {
    _resources: ResourceData[];

    _loadedJsons: { [key: string]: Object } = {};
    _callbacks: { [key: string]: Array<JsonManagerRequestCallback> } = {};

    /**
     * @param resources The resources data of the game.
     */
    constructor(resources: ResourceData[]) {
      this._resources = resources;
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
     * Request all the json resources to be preloaded (unless they are marked as not preloaded).
     *
     * Note that even if a JSON is already loaded, it will be reloaded (useful for hot-reloading,
     * as JSON files can have been modified without the editor knowing).
     *
     * @param onProgress The function called after each json is loaded.
     * @param onComplete The function called when all jsons are loaded.
     */
    preloadJsons(
      onProgress: JsonManagerOnProgressCallback,
      onComplete: JsonManagerOnCompleteCallback
    ): void {
      const resources = this._resources;
      const jsonResources = resources.filter(function (resource) {
        return resource.kind === 'json' && !resource.disablePreload;
      });
      if (jsonResources.length === 0) {
        return onComplete(jsonResources.length);
      }
      let loaded = 0;

      const onLoad: JsonManagerRequestCallback = function (error) {
        if (error) {
          logger.error('Error while preloading a json resource:' + error);
        }
        loaded++;
        if (loaded === jsonResources.length) {
          onComplete(jsonResources.length);
        } else {
          onProgress(loaded, jsonResources.length);
        }
      };
      for (let i = 0; i < jsonResources.length; ++i) {
        this.loadJson(jsonResources[i].name, onLoad);
      }
    }

    /**
     * Request the json file from the given resource name.
     * This method is asynchronous. When loaded, the `callback` is called with the error
     * (null if none) and the loaded json (a JS Object).
     *
     * @param resourceName The resource pointing to the json file to load.
     * @param callback The callback function called when json is loaded (or an error occured).
     */
    loadJson(resourceName: string, callback: JsonManagerRequestCallback): void {
      const resource = this._resources.find(function (resource) {
        return resource.kind === 'json' && resource.name === resourceName;
      });
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
      xhr.withCredentials = checkIfCredentialsRequired(resource.file);
      xhr.open('GET', resource.file);
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
