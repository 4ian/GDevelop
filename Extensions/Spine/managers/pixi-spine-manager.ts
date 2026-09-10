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
   * stored in the global `PIXI.Assets` cache under a stable alias, ready to be
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

      const skeletonUrl = this._resourceLoader.getFullUrl(resource.file);
      const skeletonAlias = skeletonUrl;

      try {
        const game = this._resourceLoader.getRuntimeGame();
        const embeddedResourcesNames = game.getEmbeddedResourcesNames(
          resource.name
        );

        // there should be exactly one embedded resource (the atlas)
        if (embeddedResourcesNames.length !== 1) {
          return logger.error(
            `Unable to find atlas metadata for resource spine skeleton ${resourceName}.`
          );
        }

        const atlasResourceName = game.resolveEmbeddedResource(
          resource.name,
          embeddedResourcesNames[0]
        );
        await this._spineAtlasManager.getOrLoad(atlasResourceName);
        const atlasAlias =
          this._spineAtlasManager.getAtlasAlias(atlasResourceName);

        if (!atlasAlias) {
          return logger.error(
            `Atlas '${atlasResourceName}' was loaded but no alias is registered.`
          );
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
        await PIXI.Assets.load(skeletonAlias);

        this._loadedSpines.set(resource, { skeletonAlias, atlasAlias });
      } catch (error) {
        logger.error(
          `Error while preloading spine resource ${resource.name}: ${error}`
        );
        await PIXI.Assets.unload(skeletonAlias).catch(() => {});
        throw error;
      }
    }

    /**
     * Returns the asset aliases required to instantiate a Spine container,
     * or `null` if the resource is not loaded yet.
     */
    getSpineAliases(resourceName: string): SpineAssetAliases | null {
      return this._loadedSpines.getFromName(resourceName);
    }

    /**
     * Check if the given spine skeleton was loaded.
     */
    isSpineLoaded(resourceName: string): boolean {
      return !!this._loadedSpines.getFromName(resourceName);
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
    }

    unloadResource(resourceData: ResourceData): void {
      const aliases = this._loadedSpines.get(resourceData);
      if (aliases) {
        // Drop cached SkeletonData entries created by Spine.from for this skeleton.
        const skeletonCache = spine.Spine.skeletonCache;
        const cachePrefix = `${aliases.skeletonAlias}-${aliases.atlasAlias}-`;
        for (const cacheKey of Object.keys(skeletonCache)) {
          if (cacheKey.startsWith(cachePrefix)) {
            delete skeletonCache[cacheKey];
          }
        }
        PIXI.Assets.unload(aliases.skeletonAlias).catch(() => {});
        this._loadedSpines.delete(resourceData);
      }
    }
  }
}
