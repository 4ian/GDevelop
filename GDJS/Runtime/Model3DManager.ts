/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Model3DManager');
  type OnProgressCallback = (loadedCount: integer, totalCount: integer) => void;

  /**
   * Load GLB files (using `Three.js`), using the "model3D" resources
   * registered in the game resources.
   */
  export class Model3DManager {
    /**
     * Map associating a resource name to the loaded Three.js model.
     */
    private _loadedThreeModels = new Map<String, THREE_ADDONS.GLTF>();

    _resourcesLoader: RuntimeGameResourcesLoader;
    _resources: ResourceData[];

    _loader: THREE_ADDONS.GLTFLoader | null = null;
    _dracoLoader: THREE_ADDONS.DRACOLoader | null = null;

    //@ts-ignore Can only be null if THREE is not loaded.
    _invalidModel: THREE_ADDONS.GLTF;

    /**
     * @param resources The resources data of the game.
     * @param resourcesLoader The resources loader of the game.
     */
    constructor(
      resources: ResourceData[],
      resourcesLoader: RuntimeGameResourcesLoader
    ) {
      this._resources = resources;
      this._resourcesLoader = resourcesLoader;

      if (typeof THREE !== 'undefined') {
        this._loader = new THREE_ADDONS.GLTFLoader();

        this._dracoLoader = new THREE_ADDONS.DRACOLoader();
        this._dracoLoader.setDecoderPath('./pixi-renderers/draco/gltf/');
        this._loader.setDRACOLoader(this._dracoLoader);

        /**
         * The invalid model is a box with magenta (#ff00ff) faces, to be
         * easily spotted if rendered on screen.
         */
        const group = new THREE.Group();
        group.add(
          new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial({ color: '#ff00ff' })
          )
        );
        this._invalidModel = {
          scene: group,
          animations: [],
          cameras: [],
          scenes: [],
          asset: {},
          userData: {},
          //@ts-ignore
          parser: null,
        };
      }
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
     * Load all the 3D models.
     *
     * Note that even if a file is already loaded, it will be reloaded (useful for hot-reloading,
     * as files can have been modified without the editor knowing).
     *
     * @param onProgress The function called after each file is loaded.
     * @param onComplete The function called when all file are loaded.
     */
    async loadModels(onProgress: OnProgressCallback): Promise<integer> {
      const model3DResources = this._resources.filter(function (resource) {
        return resource.kind === 'model3D';
      });
      const loader = this._loader;
      if (model3DResources.length === 0 || !loader) {
        return 0;
      }

      let loadedCount = 0;
      await Promise.all(
        model3DResources.map(async (resource) => {
          const url = this._resourcesLoader.getFullUrl(resource.file);
          loader.withCredentials = this._resourcesLoader.checkIfCredentialsRequired(
            url
          );
          try {
            const gltf: THREE_ADDONS.GLTF = await loader.loadAsync(
              url,
              (event) => {}
            );
            this._loadedThreeModels.set(resource.name, gltf);
          } catch (error) {
            logger.error(
              "Can't fetch the 3D model file " +
                resource.file +
                ', error: ' +
                error
            );
          }
          loadedCount++;
          onProgress(loadedCount, model3DResources.length);
        })
      );
      return loadedCount;
    }

    /**
     * Return a 3D model.
     *
     * Caller should not modify the object but clone it.
     *
     * @param resourceName The name of the json resource.
     * @returns a 3D model if it exists.
     */
    getModel(resourceName: string): THREE_ADDONS.GLTF {
      return this._loadedThreeModels.get(resourceName) || this._invalidModel;
    }
  }
}
