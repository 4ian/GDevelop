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
  /** The callback called when a text that was requested is loaded (or an error occurred). */
  export type AtlasManagerRequestCallback = (
    error: Error | null,
    content?: pixi_spine.TextureAtlas
  ) => void;

  const atlasKinds: ReadonlyArray<string> = ['atlas'];
  const isAtlasResource = (resource: ResourceData) =>
    atlasKinds.includes(resource.kind);

  /**
   * AtlasManager loads atlas files with pixi loader, using the "atlas" resources
   * registered in the game resources and process them to Pixi TextureAtlas.
   *
   * Contrary to audio/fonts, text files are loaded asynchronously, when requested.
   * You should properly handle errors, and give the developer/player a way to know
   * that loading failed.
   */
  export class AtlasManager {
    _resourcesLoader: RuntimeGameResourcesLoader;
    _resources: ResourceData[];
    _loadedAtlases: { [key: string]: pixi_spine.TextureAtlas } = {};
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
     * Note that even if a atlas is already loaded, it will be reloaded (useful for hot-reloading,
     * as atlas files can have been modified without the editor knowing).
     *
     * @param onProgress The function called after each atlas is loaded.
     * @param onComplete The function called when all atlases are loaded.
     */
    async preloadAll(
      onProgress: AtlasManagerOnProgressCallback,
    ): Promise<integer> {
      const atlasResources = this._resources.filter(
        (resource) => isAtlasResource(resource) && !resource.disablePreload
      );
      let loaded = 0;

      await Promise.all(
        atlasResources.map((resource, i) => new Promise<void>((resolve) => {
          const onLoad: AtlasManagerRequestCallback = (error) => {
            if (error) {
              logger.error('Error while preloading a text resource:' + error);
            }
            onProgress(loaded, atlasResources.length);
            resolve();
          };

          this.load(atlasResources[i], onLoad);
        }))
      );

      return Promise.resolve(atlasResources.length);
    }

    /**
     * Load specified atlas resource and pass it to callback once it is loaded.
     *
     * @param resources The data of resource to load.
     * @param callback The callback to pass atlas to it once it is loaded.
     */
    load(resource: ResourceData, callback: AtlasManagerRequestCallback): void {
      if (!isAtlasResource(resource)) callback(new Error(`${resource.name} is on atlas!`));

      const metadata = resource.metadata ? JSON.parse(resource.metadata) : { };

      if (!metadata.image) callback(new Error(`${resource.name} do not have image metadata!`));

      const image = this._imageManager.getPIXITexture(metadata.image);
      const onLoad = (atlas: pixi_spine.TextureAtlas) => {
        this._loadedAtlases[resource.name] = atlas;
        callback(null, atlas);
      };


      PIXI.Assets.setPreferences({
        preferWorkers: false,
        crossOrigin: this._resourcesLoader.checkIfCredentialsRequired(
          resource.file
        )
          ? 'use-credentials'
          : 'anonymous',
      });
      PIXI.Assets.add(resource.name, resource.file, { image });
      PIXI.Assets.load<pixi_spine.TextureAtlas | string>(resource.name).then((atlas) => {
        if (typeof atlas === 'string') {
          new pixi_spine.TextureAtlas(atlas, (_, textureCb) => textureCb(image.baseTexture), onLoad);
        } else {
          onLoad(atlas);
        }
      });
    }

    /**
     * Check if the given atlas resource was loaded (preloaded or loaded with `load`).
     * @param resourceName The name of the atlas resource.
     * @returns true if the content of the atlas resource is loaded, false otherwise.
     */
    isLoaded(resourceName: string): boolean {
      return resourceName in this._loadedAtlases;
    }

    /**
     * Get the Pixi TextureAtlas for the given resource that is already loaded (preloaded or loaded with `load`).
     * If the resource is not loaded, `null` will be returned.
     * @param resourceName The name of the atlas resource.
     * @returns the TextureAtlas of the atlas if loaded, `null` otherwise.
     */
    getAtlasTexture(resourceName: string): pixi_spine.TextureAtlas | null {
      return this._loadedAtlases[resourceName] || null;
    }
  }
}
