/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /** The callback called when a text that was requested is loaded (or an error occurred). */
  export type SpineAtlasManagerRequestCallback = (
    error: Error | null,
    content?: pixi_spine.TextureAtlas
  ) => void;

  const atlasKinds: ResourceKind[] = ['atlas'];

  /**
   * AtlasManager loads atlas files with pixi loader, using the "atlas" resources
   * registered in the game resources and process them to Pixi TextureAtlas.
   *
   * Contrary to audio/fonts, text files are loaded asynchronously, when requested.
   * You should properly handle errors, and give the developer/player a way to know
   * that loading failed.
   */
  export class SpineAtlasManager implements gdjs.ResourceManager {
    private _imageManager: ImageManager;
    private _resourceLoader: ResourceLoader;
    private _loadedSpineAtlases = new gdjs.ResourceCache<
      pixi_spine.TextureAtlas
    >();
    private _loadingSpineAtlases = new gdjs.ResourceCache<
      Promise<pixi_spine.TextureAtlas>
    >();

    /**
     * @param resources The resources data of the game.
     * @param resourcesLoader The resources loader of the game.
     */
    constructor(
      resourceLoader: gdjs.ResourceLoader,
      imageManager: ImageManager
    ) {
      this._resourceLoader = resourceLoader;
      this._imageManager = imageManager;
    }

    getResourceKinds(): ResourceKind[] {
      return atlasKinds;
    }

    async processResource(resourceName: string): Promise<void> {
      // Do nothing because pixi-spine parses resources by itself.
    }

    async loadResource(resourceName: string): Promise<void> {
      await this.getOrLoad(resourceName);
    }

    /**
     * Returns promisified loaded atlas resource if it is availble, loads it otherwise.
     *
     * @param resources The data of resource to load.
     */
    getOrLoad(resourceName: string): Promise<pixi_spine.TextureAtlas> {
      const resource = this._getAtlasResource(resourceName);

      if (!resource) {
        return Promise.reject(
          `Unable to find atlas for resource '${resourceName}'.`
        );
      }

      let loadingPromise = this._loadingSpineAtlases.get(resource);

      if (!loadingPromise) {
        loadingPromise = new Promise<pixi_spine.TextureAtlas>(
          (resolve, reject) => {
            const onLoad: SpineAtlasManagerRequestCallback = (
              error,
              content
            ) => {
              if (error) {
                return reject(
                  `Error while preloading a spine atlas resource: ${error}`
                );
              }
              if (!content) {
                return reject(
                  `Cannot reach texture atlas for resource '${resourceName}'.`
                );
              }

              resolve(content);
            };

            this.load(resource, onLoad);
          }
        );

        this._loadingSpineAtlases.set(resource, loadingPromise);
      }

      return loadingPromise;
    }

    /**
     * Load specified atlas resource and pass it to callback once it is loaded.
     *
     * @param resources The data of resource to load.
     * @param callback The callback to pass atlas to it once it is loaded.
     */
    load(
      resource: ResourceData,
      callback: SpineAtlasManagerRequestCallback
    ): void {
      const game = this._resourceLoader.getRuntimeGame();
      const embeddedResourcesNames = game.getEmbeddedResourcesNames(
        resource.name
      );

      if (!embeddedResourcesNames.length)
        return callback(
          new Error(`${resource.name} do not have image metadata!`)
        );

      const images = embeddedResourcesNames.reduce<{
        [key: string]: PIXI.Texture;
      }>((imagesMap, embeddedResourceName) => {
        const mappedResourceName = game.resolveEmbeddedResource(
          resource.name,
          embeddedResourceName
        );
        imagesMap[
          embeddedResourceName
        ] = this._imageManager.getOrLoadPIXITexture(mappedResourceName);

        return imagesMap;
      }, {});
      const onLoad = (atlas: pixi_spine.TextureAtlas) => {
        this._loadedSpineAtlases.set(resource, atlas);
        callback(null, atlas);
      };
      const url = this._resourceLoader.getFullUrl(resource.file);

      PIXI.Assets.setPreferences({
        preferWorkers: false,
        crossOrigin: this._resourceLoader.checkIfCredentialsRequired(url)
          ? 'use-credentials'
          : 'anonymous',
      });
      PIXI.Assets.add(resource.name, url, { images });
      PIXI.Assets.load<pixi_spine.TextureAtlas | string>(resource.name).then(
        (atlas) => {
          /**
           * Ideally atlas of TextureAtlas should be passed here
           * but there is known issue in case of preloaded images (see https://github.com/pixijs/spine/issues/537)
           *
           * Here covered all possible ways to make it work fine if issue is fixed in pixi-spine or after migration to spine-pixi
           */
          if (typeof atlas === 'string') {
            new pixi_spine.TextureAtlas(
              atlas,
              (textureName, textureCb) =>
                textureCb(images[textureName].baseTexture),
              onLoad
            );
          } else {
            onLoad(atlas);
          }
        }
      );
    }

    /**
     * Check if the given atlas resource was loaded (preloaded or loaded with `load`).
     * @param resourceName The name of the atlas resource.
     * @returns true if the content of the atlas resource is loaded, false otherwise.
     */
    isLoaded(resourceName: string): boolean {
      return !!this._loadedSpineAtlases.getFromName(resourceName);
    }

    /**
     * Get the Pixi TextureAtlas for the given resource that is already loaded (preloaded or loaded with `load`).
     * If the resource is not loaded, `null` will be returned.
     * @param resourceName The name of the atlas resource.
     * @returns the TextureAtlas of the atlas if loaded, `null` otherwise.
     */
    getAtlasTexture(resourceName: string): pixi_spine.TextureAtlas | null {
      return this._loadedSpineAtlases.getFromName(resourceName);
    }

    private _getAtlasResource(resourceName: string): ResourceData | null {
      const resource = this._resourceLoader.getResource(resourceName);
      return resource && this.getResourceKinds().includes(resource.kind)
        ? resource
        : null;
    }
  }
}
