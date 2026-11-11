/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Spine Manager');

  const resourceKinds: ResourceKind[] = ['spine'];

  /**
   * Aliases used to instantiate a Spine container via `Spine.from`.
   */
  export type SpineAssetAliases = {
    skeletonAlias: string;
    atlasAlias: string;
  };

  /**
   * SpineManager loads Spine skeleton (`.json` / `.skel`) resources via the
   * official `@esotericsoftware/spine-pixi-v7` asset loader. The skeleton is
   * stored in the global `PIXI.Assets` cache under its loading URL, ready to be
   * consumed by `spine.Spine.from(...)`.
   * @category Resources > Spine
   */
  export class SpineManager implements gdjs.ResourceManager {
    private _spineAtlasManager: SpineAtlasManager;
    private _resourceLoader: ResourceLoader;
    /**
     * Stores the asset aliases needed to construct a Spine container.
     * The atlas page textures are tracked separately by the SpineAtlasManager.
     */
    private _loadedSpines = new gdjs.ResourceCache<SpineAssetAliases>();
    private _loadingSpines = new Map<
      string,
      Promise<SpineAssetAliases | null>
    >();
    private _unloadingSpines = new Map<string, Promise<void>>();

    /**
     * @param resourceLoader The resources loader of the game.
     * @param spineAtlasManager The Spine atlas manager of the game.
     */
    constructor(
      resourceLoader: gdjs.ResourceLoader,
      spineAtlasManager: SpineAtlasManager
    ) {
      this._resourceLoader = resourceLoader;
      this._spineAtlasManager = spineAtlasManager;
    }

    getResourceKinds(): ResourceKind[] {
      return resourceKinds;
    }

    async processResource(_resourceName: string): Promise<void> {
      // The spine-pixi-v7 skeleton loader parses the resource itself.
    }

    async loadResource(resourceName: string): Promise<void> {
      const resource = this._getSpineResource(resourceName);

      if (!resource) {
        return logger.error(
          `Unable to find spine skeleton for resource ${resourceName}.`
        );
      }

      if (this._loadedSpines.get(resource)) {
        return;
      }
      const inflight = this._loadingSpines.get(resource.file);
      if (inflight) {
        await inflight;
        return;
      }

      const loadingPromise = Promise.resolve(
        this._unloadingSpines.get(resource.file)
      )
        .then(() => this._load(resource))
        .then((aliases) => {
          if (
            aliases &&
            this._loadingSpines.get(resource.file) === loadingPromise
          ) {
            this._loadedSpines.set(resource, aliases);
          }
          return aliases;
        })
        .finally(() => {
          if (this._loadingSpines.get(resource.file) === loadingPromise) {
            this._loadingSpines.delete(resource.file);
          }
        });
      this._loadingSpines.set(resource.file, loadingPromise);
      await loadingPromise;
    }

    private async _load(
      resource: ResourceData
    ): Promise<SpineAssetAliases | null> {
      const skeletonUrl = this._resourceLoader.getFullUrl(resource.file);
      const skeletonAlias = skeletonUrl;

      try {
        const game = this._resourceLoader.getRuntimeGame();
        const embeddedResourcesNames = game.getEmbeddedResourcesNames(
          resource.name
        );

        // there should be exactly one embedded resource (the atlas)
        if (embeddedResourcesNames.length !== 1) {
          logger.error(
            `Unable to find atlas metadata for resource spine skeleton ${resource.name}.`
          );
          return null;
        }

        const atlasResourceName = game.resolveEmbeddedResource(
          resource.name,
          embeddedResourcesNames[0]
        );
        await this._spineAtlasManager.getOrLoad(atlasResourceName);
        const atlasAlias =
          this._spineAtlasManager.getAtlasAlias(atlasResourceName);

        if (!atlasAlias) {
          logger.error(
            `Atlas '${atlasResourceName}' was loaded but no alias is registered.`
          );
          return null;
        }

        PIXI.Assets.setPreferences({
          preferWorkers: false,
          crossOrigin: this._resourceLoader.checkIfCredentialsRequired(
            skeletonUrl
          )
            ? 'use-credentials'
            : 'anonymous',
        });
        PIXI.Assets.add({ alias: skeletonAlias, src: skeletonUrl });
        PIXI.Assets.resolver.prefer();
        await PIXI.Assets.load(skeletonAlias);

        return { skeletonAlias, atlasAlias };
      } catch (error) {
        logger.error(
          `Error while preloading spine resource ${resource.name}: ${error}`
        );
        await PIXI.Assets.unload(skeletonAlias).catch((unloadError) => {
          logger.error(
            `Error while unloading spine resource ${resource.name}: ${unloadError}`
          );
        });
        PIXI.Assets.resolver.prefer();
        throw error;
      }
    }

    /**
     * Returns the asset aliases required to instantiate a Spine container,
     * or `null` if the resource is not loaded yet.
     */
    getSpineAliases(resourceName: string): SpineAssetAliases | null {
      const resource = this._getSpineResource(resourceName);
      return resource ? this._loadedSpines.get(resource) : null;
    }

    /**
     * Check if the given spine skeleton was loaded.
     */
    isSpineLoaded(resourceName: string): boolean {
      return !!this.getSpineAliases(resourceName);
    }

    private _getSpineResource(resourceName: string): ResourceData | null {
      const resource = this._resourceLoader.getResource(resourceName);
      return resource && this.getResourceKinds().includes(resource.kind)
        ? resource
        : null;
    }

    /**
     * To be called when the game is disposed.
     */
    dispose(): void {
      this._loadedSpines.clear();
      this._loadingSpines.clear();
      this._unloadingSpines.clear();
    }

    unloadResource(resourceData: ResourceData): Promise<void> {
      const aliases = this._loadedSpines.get(resourceData);
      const loading = this._loadingSpines.get(resourceData.file);
      if (!aliases && !loading) {
        return (
          this._unloadingSpines.get(resourceData.file) || Promise.resolve()
        );
      }

      this._loadedSpines.delete(resourceData);
      this._loadingSpines.delete(resourceData.file);

      const unloadPromise = Promise.resolve(loading || aliases)
        .then(async (loadedAliases) => {
          if (!loadedAliases) return;

          // Drop cached SkeletonData entries created by Spine.from for this skeleton.
          const skeletonCache = spine.Spine.skeletonCache;
          const cachePrefix = `${loadedAliases.skeletonAlias}-${loadedAliases.atlasAlias}-`;
          for (const cacheKey of Object.keys(skeletonCache)) {
            if (cacheKey.startsWith(cachePrefix)) {
              delete skeletonCache[cacheKey];
            }
          }
          await PIXI.Assets.unload(loadedAliases.skeletonAlias);
        })
        .catch((error) => {
          logger.error(
            `Error while unloading spine resource ${resourceData.name}: ${error}`
          );
        })
        .finally(() => {
          PIXI.Assets.resolver.prefer();
          if (this._unloadingSpines.get(resourceData.file) === unloadPromise) {
            this._unloadingSpines.delete(resourceData.file);
          }
        });
      this._unloadingSpines.set(resourceData.file, unloadPromise);
      return unloadPromise;
    }
  }
}
