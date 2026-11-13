/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Spine Atlas Manager');

  const atlasKinds: ResourceKind[] = ['atlas'];

  type SpineAtlasAsset = {
    textureAtlas: spine.TextureAtlas;
    alias: string;
  };

  /**
   * SpineAtlasManager loads `.atlas` files via the official `@esotericsoftware/spine-pixi-v7`
   * Pixi atlas loader, sharing texture pages with the engine's ImageManager.
   *
   * The loader is auto-registered by the `spine-pixi-v7` IIFE bundle. We simply prepare
   * the asset metadata (`data.images`) so that PIXI.Assets binds atlas pages to the
   * already-loaded base textures instead of fetching them again.
   *
   * @category Resources > Spine
   */
  export class SpineAtlasManager implements gdjs.ResourceManager {
    private _imageManager: ImageManager;
    private _resourceLoader: ResourceLoader;
    private _loadedSpineAtlases = new gdjs.ResourceCache<SpineAtlasAsset>();
    private _loadingSpineAtlases = new Map<string, Promise<SpineAtlasAsset>>();
    private _unloadingSpineAtlases = new Map<string, Promise<void>>();

    /**
     * @param resourceLoader The resources loader of the game.
     * @param imageManager The image manager of the game.
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

    async processResource(_resourceName: string): Promise<void> {
      // The spine-pixi-v7 atlas loader parses the resource itself.
    }

    async loadResource(resourceName: string): Promise<void> {
      await this.getOrLoad(resourceName);
    }

    /**
     * Returns the loaded atlas, sharing any pending load for the same file.
     */
    async getOrLoad(resourceName: string): Promise<spine.TextureAtlas> {
      const resource = this._getAtlasResource(resourceName);
      if (!resource) {
        throw new Error(`Unable to find atlas for resource '${resourceName}'.`);
      }

      const cachedAtlas = this._loadedSpineAtlases.get(resource);
      if (cachedAtlas) {
        return cachedAtlas.textureAtlas;
      }

      const inflight = this._loadingSpineAtlases.get(resource.file);
      if (inflight) {
        return (await inflight).textureAtlas;
      }

      // Capture the preceding unload before publishing this load, so a later
      // unload can wait for it without creating a circular dependency.
      const loadingPromise = Promise.resolve(
        this._unloadingSpineAtlases.get(resource.file)
      )
        .then(() => this._load(resource))
        .then((atlas) => {
          if (this._loadingSpineAtlases.get(resource.file) === loadingPromise) {
            this._loadedSpineAtlases.set(resource, atlas);
          }
          return atlas;
        })
        .finally(() => {
          if (this._loadingSpineAtlases.get(resource.file) === loadingPromise) {
            this._loadingSpineAtlases.delete(resource.file);
          }
        });
      this._loadingSpineAtlases.set(resource.file, loadingPromise);
      return (await loadingPromise).textureAtlas;
    }

    private async _load(resource: ResourceData): Promise<SpineAtlasAsset> {
      const game = this._resourceLoader.getRuntimeGame();
      const embeddedResourcesNames = game.getEmbeddedResourcesNames(
        resource.name
      );

      if (!embeddedResourcesNames.length) {
        throw new Error(`${resource.name} does not have image metadata!`);
      }

      const url = this._resourceLoader.getFullUrl(resource.file);
      const alias = url;

      const images: { [key: string]: PIXI.BaseTexture } = {};
      await Promise.all(
        embeddedResourcesNames.map(async (embeddedResourceName) => {
          const mappedResourceName = game.resolveEmbeddedResource(
            resource.name,
            embeddedResourceName
          );
          await this._imageManager.loadResource(mappedResourceName);
          // The v7 atlas loader expects BaseTexture instances when sharing pages
          // with already-loaded textures.
          images[embeddedResourceName] =
            this._imageManager.getPIXITexture(mappedResourceName).baseTexture;
        })
      );

      PIXI.Assets.setPreferences({
        preferWorkers: false,
        crossOrigin: this._resourceLoader.checkIfCredentialsRequired(url)
          ? 'use-credentials'
          : 'anonymous',
      });
      PIXI.Assets.add({ alias, src: url, data: { images } });
      // Clear PIXI.Assets.resolver._resolverHash (https://github.com/pixijs/pixijs/issues/10069)
      // so resolve() picks up the newly registered data.images BaseTextures.
      PIXI.Assets.resolver.prefer();
      return {
        textureAtlas: await PIXI.Assets.load<spine.TextureAtlas>(alias),
        alias,
      };
    }

    /**
     * Check if the given atlas resource was loaded.
     * @param resourceName The name of the atlas resource.
     */
    isLoaded(resourceName: string): boolean {
      return !!this.getAtlasTexture(resourceName);
    }

    /**
     * Returns the alias used to register the atlas in PIXI.Assets,
     * or null if the resource is not loaded.
     */
    getAtlasAlias(resourceName: string): string | null {
      const resource = this._getAtlasResource(resourceName);
      if (!resource) return null;
      const atlas = this._loadedSpineAtlases.get(resource);
      return atlas ? atlas.alias : null;
    }

    /**
     * Returns the loaded TextureAtlas for the given resource, if available.
     */
    getAtlasTexture(resourceName: string): spine.TextureAtlas | null {
      const resource = this._getAtlasResource(resourceName);
      const atlas = resource && this._loadedSpineAtlases.get(resource);
      return atlas ? atlas.textureAtlas : null;
    }

    private _getAtlasResource(resourceName: string): ResourceData | null {
      const resource = this._resourceLoader.getResource(resourceName);
      return resource && this.getResourceKinds().includes(resource.kind)
        ? resource
        : null;
    }

    /**
     * To be called when the game is disposed.
     */
    dispose(): void {
      this._loadedSpineAtlases.clear();
      this._loadingSpineAtlases.clear();
      this._unloadingSpineAtlases.clear();
    }

    unloadResource(resourceData: ResourceData): Promise<void> {
      const atlas = this._loadedSpineAtlases.get(resourceData);
      const loading = this._loadingSpineAtlases.get(resourceData.file);
      if (!atlas && !loading) {
        return (
          this._unloadingSpineAtlases.get(resourceData.file) ||
          Promise.resolve()
        );
      }

      this._loadedSpineAtlases.delete(resourceData);
      this._loadingSpineAtlases.delete(resourceData.file);

      const unloadPromise = Promise.resolve(loading || atlas)
        .then(async (loadedAtlas) => {
          if (!loadedAtlas) return;

          // Page textures are borrowed from ImageManager, which owns disposal.
          for (const page of loadedAtlas.textureAtlas.pages) {
            page.texture = null;
          }
          await PIXI.Assets.unload(loadedAtlas.alias);
        })
        .catch((error) => {
          logger.error(
            `Error while unloading spine atlas resource ${resourceData.name}: ${error}`
          );
        })
        .finally(() => {
          PIXI.Assets.resolver.prefer();
          if (
            this._unloadingSpineAtlases.get(resourceData.file) === unloadPromise
          ) {
            this._unloadingSpineAtlases.delete(resourceData.file);
          }
        });
      this._unloadingSpineAtlases.set(resourceData.file, unloadPromise);
      return unloadPromise;
    }
  }
}
