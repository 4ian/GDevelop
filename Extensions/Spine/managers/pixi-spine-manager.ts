/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Spine Manager');

  const resourceKinds: ResourceKind[] = ['spine'];

  /**
   * SpineManager manages pixi spine skeleton data.
   */
  export class SpineManager implements gdjs.ResourceManager {
    private _spineAtlasManager: SpineAtlasManager;
    private _resourceLoader: ResourceLoader;
    private _loadedSpines = new gdjs.ResourceCache<pixi_spine.ISkeletonData>();

    /**
     * @param resourceDataArray The resources data of the game.
     * @param resourcesLoader The resources loader of the game.
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

    async processResource(resourceName: string): Promise<void> {
      // Do nothing because pixi-spine parses resources by itself.
    }

    async loadResource(resourceName: string): Promise<void> {
      const resource = this._getSpineResource(resourceName);

      if (!resource) {
        return logger.error(
          `Unable to find spine json for resource ${resourceName}.`
        );
      }

      try {
        const game = this._resourceLoader.getRuntimeGame();
        const embeddedResourcesNames = game.getEmbeddedResourcesNames(
          resource.name
        );

        // there should be exactly one file which is pointing to atlas
        if (embeddedResourcesNames.length !== 1) {
          return logger.error(
            `Unable to find atlas metadata for resource spine json ${resourceName}.`
          );
        }

        const atlasResourceName = game.resolveEmbeddedResource(
          resource.name,
          embeddedResourcesNames[0]
        );
        const spineAtlas = await this._spineAtlasManager.getOrLoad(
          atlasResourceName
        );
        const url = this._resourceLoader.getFullUrl(resource.file);
        PIXI.Assets.setPreferences({
          preferWorkers: false,
          crossOrigin: this._resourceLoader.checkIfCredentialsRequired(url)
            ? 'use-credentials'
            : 'anonymous',
        });
        PIXI.Assets.add(resource.name, url, { spineAtlas });
        const loadedJson = await PIXI.Assets.load(resource.name);

        if (loadedJson.spineData) {
          this._loadedSpines.set(resource, loadedJson.spineData);
        } else {
          logger.error(
            `Loader cannot process spine resource ${resource.name} correctly.`
          );
        }
      } catch (error) {
        logger.error(
          `Error while preloading spine resource ${resource.name}: ${error}`
        );
      }
    }

    /**
     * Get the object for the given resource that is already loaded (preloaded or loaded with `loadJson`).
     * If the resource is not loaded, `null` will be returned.
     *
     * @param resourceName The name of the spine skeleton.
     * @returns the spine skeleton if loaded, `null` otherwise.
     */
    getSpine(resourceName: string): pixi_spine.ISkeletonData | null {
      return this._loadedSpines.getFromName(resourceName);
    }

    /**
     * Check if the given spine skeleton was loaded.
     * @param resourceName The name of the spine skeleton.
     * @returns true if the content of the spine skeleton is loaded, false otherwise.
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
  }
}
