/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Atlas Manager');
  type AtlasManagerOnProgressCallback = (
    loadedCount: integer,
    totalCount: integer
  ) => void;
  type AtlasManagerOnCompleteCallback = (totalCount: integer) => void;

  /** The callback called when a text that was requested is loaded (or an error occurred). */
  export type AtlasManagerRequestCallback = (
    error: Error | null,
    content: Object | null
  ) => void;

  const atlasKinds: ReadonlyArray<string> = ['atlas'];
  const isTextResource = (resource: ResourceData) =>
    atlasKinds.includes(resource.kind);

  /**
   * AtlasManager loads text files (using `XMLHttpRequest`), using the "atlas" resources
   * registered in the game resources and process them to Pixi TextureAtlas.
   *
   * Contrary to audio/fonts, text files are loaded asynchronously, when requested.
   * You should properly handle errors, and give the developer/player a way to know
   * that loading failed.
   */
  export class AtlasManager {
    _resourcesLoader: RuntimeGameResourcesLoader;
    _resources: ResourceData[];
    _loadedAtlases: { [key: string]: string } = {};
    _loadedTextureAtlases: { [key: string]: PIXI_SPINE.TextureAtlas } = {};
    _callbacks: { [key: string]: Array<AtlasManagerRequestCallback> } = {};

    /**
     * @param resources The resources data of the game.
     * @param resourcesLoader The resources loader of the game.
     */
    constructor(
      resources: ResourceData[],
      resourcesLoader: RuntimeGameResourcesLoader,
      private _imageManager: ImageManager
    ) {
      this._resources = resources;
      this._resourcesLoader = resourcesLoader;
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
     * Request all the text resources to be preloaded (unless they are marked as not preloaded).
     *
     * Note that even if a text is already loaded, it will be reloaded (useful for hot-reloading,
     * as text files can have been modified without the editor knowing).
     *
     * @param onProgress The function called after each texts is loaded.
     * @param onComplete The function called when all texts are loaded.
     */
    async preload(
      onProgress: AtlasManagerOnProgressCallback,
    ): Promise<integer> {
      const textResources = this._resources.filter(
        (resource) => isTextResource(resource) && !resource.disablePreload
      );
      let loaded = 0;

      await Promise.all(
        textResources.map((resource, i) => new Promise<void>((resolve) => {
          const onLoad: AtlasManagerRequestCallback = (error) => {
            if (error) {
              logger.error('Error while preloading a text resource:' + error);
            }
            onProgress(loaded, textResources.length);
            resolve();
          };

          this.load(textResources[i].name, onLoad);
        }))
      );

      return Promise.resolve(textResources.length);
    }

    /**
     * Request the text file from the given resource name.
     * This method is asynchronous. When loaded, the `callback` is called with the error
     * (null if none) and the loaded test (a string).
     *
     * @param resourceName The resource pointing to the json file to load.
     * @param callback The callback function called when json is loaded (or an error occurred).
     */
    load(resourceName: string, callback: AtlasManagerRequestCallback): void {
      const resource = this._resources.find(
        (resource) => isTextResource(resource) && resource.name === resourceName
      );
      if (!resource) {
        return callback(
          new Error(
            `Can't find resource with name: "${resourceName}" (or is not a text resource).`
          ),
          null
        );
      }

      // Don't fetch again an object that is already in memory
      if (this.isLoaded(resourceName)) {
        return callback(null, this._loadedAtlases[resourceName]);
      }

      // Don't fetch again an object that is already being fetched.
      const callbacks = this._callbacks[resourceName];
      if (callbacks) {
        callbacks.push(callback);
        return;
      }

      this._callbacks[resourceName] = [callback];
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'text';
      xhr.withCredentials = this._resourcesLoader.checkIfCredentialsRequired(
        resource.file
      );
      xhr.open('GET', this._resourcesLoader.getFullUrl(resource.file));
      xhr.onload = () => {
        if (xhr.status !== 200) {
          this.callCallback(
            resourceName,
            `HTTP error: ${xhr.status} (${xhr.statusText})`,
            null
          );
        } else {
          this._loadedAtlases[resourceName] = xhr.response;

          new PIXI_SPINE.TextureAtlas(
            xhr.response,
            (path, textureCb) => {
              const resourceDirectory = /(^.*[\\\/]|^[^\\\/].*)/i;
              const atlasImagePath =
                resourceName.match(resourceDirectory)![0] + path;
              textureCb(
                this._imageManager.getPIXITexture(atlasImagePath).baseTexture
              );
            },
            (atlas) => {
              this._loadedTextureAtlases[resourceName] = atlas;
              this.callCallback(resourceName, null, xhr.response);
            }
          );
        }
      };
      xhr.onerror = () =>
        this.callCallback(resourceName, 'Network error', null);
      xhr.onabort = () =>
        this.callCallback(resourceName, 'Request aborted', null);
      xhr.send();
    }

    protected callCallback(
      resourceName: string,
      errorMessage: string,
      text: null
    ): void;
    protected callCallback(
      resourceName: string,
      errorMessage: null,
      text: string
    ): void;
    protected callCallback(
      resourceName: string,
      errorMessage: string | null,
      text: string | null
    ): void {
      if (!this._callbacks[resourceName]) {
        return;
      }

      for (const callback of this._callbacks[resourceName]) {
        const error =
          typeof errorMessage === 'string' ? new Error(errorMessage) : null;

        if (!text) {
          throw new Error(
            `Unavailable text for ${resourceName} atlas resource!`
          );
        }

        callback(error, text);
      }

      delete this._callbacks[resourceName];
    }

    /**
     * Check if the given text resource was loaded (preloaded or loaded with `loadText`).
     * @param resourceName The name of the text resource.
     * @returns true if the content of the text resource is loaded. false otherwise.
     */
    isLoaded(resourceName: string): boolean {
      return resourceName in this._loadedAtlases;
    }

    /**
     * Get the raw atlas text for the given resource that is already loaded (preloaded or loaded with `load`).
     * If the resource is not loaded, `null` will be returned.
     * @param resourceName The name of the text resource.
     * @returns the content of the text resource, if loaded. `null` otherwise.
     */
    getText(resourceName: string): string | null {
      return this.isLoaded(resourceName)
        ? this._loadedAtlases[resourceName]
        : null;
    }

    /**
     * Get the Pixi TextureAtlas for the given resource that is already loaded (preloaded or loaded with `load`).
     * If the resource is not loaded, `null` will be returned.
     * @param resourceName The name of the text resource.
     * @returns the TextureAtlas of the atlas, if loaded. `null` otherwise.
     */
    getAtlasTexture(resourceName: string): PIXI_SPINE.TextureAtlas | null {
      return this._loadedTextureAtlases[resourceName] || null;
    }
  }
}
