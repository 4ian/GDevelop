/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Model3DManager');

  const resourceKinds: Array<ResourceKind> = ['model3D'];

  /**
   * Escape a string so that it can be used in a `RegExp` matching it exactly.
   */
  const escapeRegExp = (text: string): string =>
    text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  /**
   * A Three.js loader that gives back textures already loaded by the
   * `ImageManager`, instead of downloading the image files that a 3D model file
   * refers to.
   *
   * A 3D model can be exported with its textures kept in separate files. In this
   * case, the editor creates an image resource for each of these files when the
   * model is imported, and remembers which resource matches which file path
   * written in the model ("embedded resources"). This loader does this lookup so
   * that textures are shared with the rest of the game and no additional file is
   * ever downloaded.
   */
  class EmbeddedTextureLoader extends THREE.Loader<THREE.Texture> {
    private _runtimeGame: gdjs.RuntimeGame;
    private _modelResourceName: string;

    constructor(runtimeGame: gdjs.RuntimeGame, modelResourceName: string) {
      super();
      this._runtimeGame = runtimeGame;
      this._modelResourceName = modelResourceName;
    }

    override load(
      url: string,
      onLoad: (texture: THREE.Texture) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (error: unknown) => void
    ): void {
      const imageResourceName = this._runtimeGame.resolveEmbeddedResource(
        this._modelResourceName,
        url
      );
      const imageManager = this._runtimeGame.getImageManager();

      // The image resource is usually already loaded, as it's listed with the
      // other resources used by the scene. Ensure it's loaded anyway, because
      // resources can also be loaded one by one (for objects loaded on demand).
      imageManager
        .loadResource(imageResourceName)
        .then(() => {
          // Give a copy of the texture: the glTF loader configures it according
          // to the model (flipping, wrapping, color space...) and this must not
          // alter the texture shared with the other objects using this image.
          // Note that copies still share the same image on the GPU.
          const threeTexture = imageManager
            .getThreeTexture(imageResourceName)
            .clone();
          threeTexture.userData.gdevelopImageResourceName = imageResourceName;
          onLoad(threeTexture);
        })
        .catch((error) => {
          logger.error(
            'Unable to load the texture "' +
              imageResourceName +
              '" used by the 3D model "' +
              this._modelResourceName +
              '", error: ' +
              error
          );
          if (onError) onError(error);
        });
    }
  }

  /**
   * Apply the settings of an image resource to every texture that was loaded
   * from it, as the glTF loader configures textures according to the model only.
   */
  const applyImageResourceSettingsToTextures = (
    node: THREE.Object3D,
    getResource: (imageResourceName: string) => ResourceData | null
  ): void => {
    const applyToMaterial = (material: THREE.Material) => {
      for (const value of Object.values(material)) {
        if (!(value instanceof THREE.Texture)) continue;

        const imageResourceName = value.userData.gdevelopImageResourceName;
        if (typeof imageResourceName !== 'string') continue;

        const resource = getResource(imageResourceName);
        if (resource && !resource.smoothed) {
          value.magFilter = THREE.NearestFilter;
          value.minFilter = THREE.NearestFilter;
        }
      }
    };

    node.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.material) return;

      if (Array.isArray(mesh.material)) {
        for (const material of mesh.material) applyToMaterial(material);
      } else {
        applyToMaterial(mesh.material);
      }
    });
  };

  /**
   * Load GLB files (using `Three.js`), using the "model3D" resources
   * registered in the game resources.
   * @category Resources > 3D Models
   */
  export class Model3DManager implements gdjs.ResourceManager {
    /**
     * Map associating a resource name to the loaded Three.js model.
     */
    private _loadedThreeModels = new gdjs.ResourceCache<THREE_ADDONS.GLTF>();
    private _downloadedArrayBuffers = new gdjs.ResourceCache<ArrayBuffer>();

    _resourceLoader: gdjs.ResourceLoader;

    _loader: THREE_ADDONS.GLTFLoader | null = null;
    _dracoLoader: THREE_ADDONS.DRACOLoader | null = null;

    //@ts-ignore Can only be null if THREE is not loaded.
    _invalidModel: THREE_ADDONS.GLTF;

    /**
     * @param resourceLoader The resources loader of the game.
     */
    constructor(resourceLoader: gdjs.ResourceLoader) {
      this._resourceLoader = resourceLoader;

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

    getResourceKinds(): ResourceKind[] {
      return resourceKinds;
    }

    async processResource(resourceName: string): Promise<void> {
      const resource = this._resourceLoader.getResource(resourceName);
      if (!resource) {
        logger.warn(
          'Unable to find texture for resource "' + resourceName + '".'
        );
        return;
      }
      const loader = this._getLoaderFor(resourceName);
      if (!loader) {
        return;
      }
      const data = this._downloadedArrayBuffers.get(resource);
      if (!data) {
        return;
      }
      this._downloadedArrayBuffers.delete(resource);
      try {
        const gltf: THREE_ADDONS.GLTF = await loader.parseAsync(data, '');
        applyImageResourceSettingsToTextures(gltf.scene, (imageResourceName) =>
          this._resourceLoader.getResource(imageResourceName)
        );
        this._loadedThreeModels.set(resource, gltf);
      } catch (error) {
        logger.error(
          "Can't fetch the 3D model file " + resource.file + ', error: ' + error
        );
      }
    }

    /**
     * Return the loader to use to parse the given model.
     *
     * Models with textures stored in separate files need a loader that knows how
     * to find these textures in the image resources of the game.
     */
    private _getLoaderFor(
      resourceName: string
    ): THREE_ADDONS.GLTFLoader | null {
      const sharedLoader = this._loader;
      if (!sharedLoader) {
        return null;
      }

      const runtimeGame = this._resourceLoader.getRuntimeGame();
      const textureFilePaths =
        runtimeGame.getEmbeddedResourcesNames(resourceName);
      if (textureFilePaths.length === 0) {
        // The model has no texture stored in a separate file.
        return sharedLoader;
      }

      const loadingManager = new THREE.LoadingManager();
      loadingManager.addHandler(
        new RegExp('^(' + textureFilePaths.map(escapeRegExp).join('|') + ')$'),
        new EmbeddedTextureLoader(runtimeGame, resourceName)
      );

      const loader = new THREE_ADDONS.GLTFLoader(loadingManager);
      if (this._dracoLoader) {
        loader.setDRACOLoader(this._dracoLoader);
      }
      return loader;
    }

    async loadResource(resourceName: string): Promise<void> {
      const resource = this._resourceLoader.getResource(resourceName);
      if (!resource) {
        logger.warn(
          'Unable to find texture for resource "' + resourceName + '".'
        );
        return;
      }
      const loader = this._loader;
      if (!loader) {
        return;
      }
      if (this._loadedThreeModels.get(resource)) {
        return;
      }
      const url = this._resourceLoader.getFullUrl(resource.file);
      try {
        const response = await fetch(url, {
          credentials: this._resourceLoader.checkIfCredentialsRequired(url)
            ? 'include'
            : 'omit',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.arrayBuffer();
        this._downloadedArrayBuffers.set(resource, data);
      } catch (error) {
        logger.error(
          "Can't fetch the 3D model file " + resource.file + ', error: ' + error
        );
        throw error;
      }
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
      return (
        this._loadedThreeModels.getFromName(resourceName) || this._invalidModel
      );
    }

    /**
     * To be called when the game is disposed.
     * Clear the models, resources loaded and destroy 3D models loaders in this manager.
     */
    dispose(): void {
      this._loadedThreeModels.clear();
      this._downloadedArrayBuffers.clear();
      this._loader = null;
      this._dracoLoader = null;

      if (this._invalidModel) {
        this._invalidModel.cameras = [];
        this._invalidModel.animations = [];
        this._invalidModel.scenes = [];
        this._invalidModel.userData = {};
        this._invalidModel.asset = {};
        this._invalidModel.scene.clear();
      }
    }

    unloadResource(resourceData: ResourceData): void {
      const loadedThreeModel = this._loadedThreeModels.getFromName(
        resourceData.name
      );
      if (loadedThreeModel) {
        loadedThreeModel.scene.clear();
        this._loadedThreeModels.delete(resourceData);
      }

      const downloadedArrayBuffer = this._downloadedArrayBuffers.getFromName(
        resourceData.name
      );
      if (downloadedArrayBuffer) {
        this._downloadedArrayBuffers.delete(resourceData);
      }
    }
  }
}
