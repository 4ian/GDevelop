/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Model3DManager');

  const resourceKinds: Array<ResourceKind> = ['model3D'];

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
        if (!resourceName) return;
        logger.warn(
          'Unable to find texture for resource "' + resourceName + '".'
        );
        return;
      }
      const loader = this._loader;
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
        this._loadedThreeModels.set(resource, gltf);
      } catch (error) {
        logger.error(
          "Can't fetch the 3D model file " + resource.file + ', error: ' + error
        );
      }
    }

    async loadResource(resourceName: string): Promise<void> {
      const resource = this._resourceLoader.getResource(resourceName);
      if (!resource) {
        if (!resourceName) return;
        logger.warn(
          'Unable to find texture for resource "' + resourceName + '".'
        );
        return;
      }
      const loader = this._loader;
      if (!loader) {
        return;
      }
      const loadedThreeModel = this._loadedThreeModels.get(resource);
      if (loadedThreeModel && loadedThreeModel.scene.children.length > 0) {
        return;
      }
      if (loadedThreeModel) {
        this._loadedThreeModels.delete(resource);
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

    private _disposeModel(model: THREE_ADDONS.GLTF): void {
      const disposedGeometries = new Set<THREE.BufferGeometry>();
      const disposedMaterials = new Set<THREE.Material>();
      const disposedTextures = new Set<THREE.Texture>();
      const closedTextureSources = new Set<object>();

      const closeTextureSource = (textureSource: any): void => {
        if (Array.isArray(textureSource)) {
          for (const source of textureSource) closeTextureSource(source);
          return;
        }
        if (
          !textureSource ||
          typeof textureSource !== 'object' ||
          closedTextureSources.has(textureSource)
        ) {
          return;
        }

        closedTextureSources.add(textureSource);
        if (typeof textureSource.close === 'function') {
          textureSource.close();
        }
      };

      const disposeTexture = (texture: THREE.Texture): void => {
        if (disposedTextures.has(texture)) return;

        disposedTextures.add(texture);
        texture.dispose();

        // GLTFLoader uses ImageBitmapLoader when available. ImageBitmap memory
        // is not released automatically when a texture is disposed, so close
        // it explicitly when the whole runtime is being destroyed.
        const textureAsAny = texture as any;
        closeTextureSource(
          textureAsAny.source?.data || textureAsAny.image || null
        );
      };

      const disposeMaterial = (material: THREE.Material): void => {
        if (disposedMaterials.has(material)) return;

        disposedMaterials.add(material);
        for (const propertyValue of Object.values(material)) {
          if (propertyValue && (propertyValue as any).isTexture) {
            disposeTexture(propertyValue as THREE.Texture);
          }
        }
        material.dispose();
      };

      const scenes = new Set<THREE.Object3D>(model.scenes);
      scenes.add(model.scene);
      for (const scene of scenes) {
        scene.traverse((object) => {
          const objectAsAny = object as any;
          const geometry = objectAsAny.geometry as
            | THREE.BufferGeometry
            | undefined;
          if (geometry && !disposedGeometries.has(geometry)) {
            disposedGeometries.add(geometry);
            geometry.dispose();
          }

          const materialOrMaterials = objectAsAny.material as
            | THREE.Material
            | THREE.Material[]
            | undefined;
          if (!materialOrMaterials) return;
          const materials = Array.isArray(materialOrMaterials)
            ? materialOrMaterials
            : [materialOrMaterials];
          for (const material of materials) disposeMaterial(material);
        });
        scene.clear();
      }

      model.animations = [];
      model.cameras = [];
      model.scenes = [];
      model.userData = {};
      model.asset = {};
      // The GLTF parser caches dependencies including decoded buffers and
      // images. It is no longer useful once the runtime has been disposed.
      (model as any).parser = null;
    }

    /**
     * To be called when the game is disposed.
     * Clear the models, resources loaded and destroy 3D models loaders in this manager.
     */
    dispose(): void {
      for (const loadedThreeModel of this._loadedThreeModels.getAll()) {
        this._disposeModel(loadedThreeModel);
      }
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
        // Don't clear the scene: existing 3D renderers can keep a reference to
        // this GLTF during editor hot-reload. Deleting the cache entry is enough
        // to allow collection when no renderer references it anymore.
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
