/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Spine Manager');

  /**
   * SpineManager manages pixi spine skeleton data.
   */
  export class SpineManager {
    private _resourcesLoader: RuntimeGameResourcesLoader;
    private _resources: Map<string, ResourceData>;
    private _spineData: { [key: string]: pixi_spine.ISkeletonData } = {};
    private _spineAtlasManager: SpineAtlasManager;

    /**
     * @param resourceDataArray The resources data of the game.
     * @param resourcesLoader The resources loader of the game.
     */
    constructor(
      resourceDataArray: ResourceData[],
      resourcesLoader: RuntimeGameResourcesLoader,
      spineAtlasManager: SpineAtlasManager
    ) {
      this._resources = new Map<string, ResourceData>();
      this.setResources(resourceDataArray);
      this._resourcesLoader = resourcesLoader;
      this._spineAtlasManager = spineAtlasManager;
    }

    /**
     * Update the resources data of the game. Useful for hot-reloading, should not be used otherwise.
     *
     * @param resourceDataArray The resources data of the game.
     */
    setResources(resourceDataArray: ResourceData[]): void {
      this._resources.clear();
      for (const resourceData of resourceDataArray) {
        if (resourceData.kind === 'spine') {
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
     * @returns the promise of loaded jsons count.
     */
    async preloadAll(
      onProgress: (loadingCount: integer, totalCount: integer) => void
    ): Promise<integer> {
      let loadedNumber = 0;
      const getPreferences = (file: string) =>
        ({
          preferWorkers: false,
          crossOrigin: this._resourcesLoader.checkIfCredentialsRequired(file)
            ? 'use-credentials'
            : 'anonymous',
        } as Partial<PIXI.AssetsPreferences>);
      const jsonPromises = Array.from(
        this._resources.values(),
        async (resource) => {
          try {
            const metadata = resource.metadata
              ? JSON.parse(resource.metadata)
              : {};
            const atlasInDependencies =
              !!metadata.atlas &&
              this._spineAtlasManager.isLoaded(metadata.atlas);

            PIXI.Assets.setPreferences(getPreferences(resource.file));
            PIXI.Assets.add(
              resource.name,
              resource.file,
              atlasInDependencies
                ? {
                    spineAtlas: this._spineAtlasManager.getAtlasTexture(
                      metadata.atlas
                    ),
                  }
                : undefined
            );
            const loadedJson = await PIXI.Assets.load(resource.name);

            if (loadedJson.spineData) {
              this._spineData[resource.name] = loadedJson.spineData;
            } else {
              logger.error(
                `Loader cannot process spine resource ${resource.name} correctly.`
              );
            }
          } catch (error) {
            logger.error(
              `Error while preloading spine resource ${resource.name}:`,
              error
            );
          }

          onProgress(loadedNumber++, this._resources.size);
        }
      );

      await Promise.all(jsonPromises);

      return loadedNumber;
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
