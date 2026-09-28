/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Model3DManager');

  const resourceKinds: Array<ResourceKind> = ['model3D'];

  /**
   * FNV-1a hash of some bytes, as a hexadecimal string. 32-bit words are
   * hashed at once: about 3 GB/s, so even the largest embedded textures cost
   * a few milliseconds.
   */
  const hashBytes = (buffer: ArrayBuffer): string => {
    const words = new Uint32Array(buffer, 0, buffer.byteLength >>> 2);
    let hash = 0x811c9dc5;
    for (let i = 0; i < words.length; i++) {
      hash ^= words[i];
      hash = Math.imul(hash, 0x01000193);
    }
    const bytes = new Uint8Array(buffer, words.length << 2);
    for (let i = 0; i < bytes.length; i++) {
      hash ^= bytes[i];
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16);
  };

  const forEachMaterial = (
    scene: THREE.Object3D,
    callback: (material: THREE.Material, mesh: THREE.Mesh) => void
  ) => {
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.material) return;
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      materials.forEach((material) => callback(material, mesh));
    });
  };

  const forEachTexture = (
    material: THREE.Material,
    callback: (texture: THREE.Texture) => void
  ) => {
    for (const key in material) {
      const value = material[key];
      if (value && value.isTexture) callback(value);
    }
  };

  /**
   * The textures embedded in the loaded models, by hash of their bytes, with
   * the models using each of them: a texture is disposed when the last model
   * using it is unloaded.
   */
  class SharedTextureCache {
    private _textures = new Map<string, Promise<THREE.Texture>>();
    private _keys = new Map<THREE.Texture, string>();
    private _users = new Map<string, Set<string>>();

    get(key: string): Promise<THREE.Texture> | undefined {
      return this._textures.get(key);
    }

    set(key: string, texture: Promise<THREE.Texture>): Promise<THREE.Texture> {
      const registered = texture.then((texture) => {
        this._keys.set(texture, key);
        return texture;
      });
      this._textures.set(key, registered);
      this._users.set(key, new Set());
      return registered;
    }

    /** Record that a model uses a texture, if it is a shared one. */
    retain(texture: THREE.Texture, resourceName: string): void {
      const key = this._keys.get(texture);
      if (key) this._users.get(key)!.add(resourceName);
    }

    /**
     * Record that a model does not use a texture anymore, and dispose the
     * texture when nothing uses it: a texture that is not shared belongs to
     * the model only.
     */
    release(texture: THREE.Texture, resourceName: string): void {
      const key = this._keys.get(texture);
      if (!key) {
        texture.dispose();
        return;
      }
      const users = this._users.get(key)!;
      users.delete(resourceName);
      if (users.size > 0) return;
      texture.dispose();
      this._textures.delete(key);
      this._keys.delete(texture);
      this._users.delete(key);
    }

    dispose(): void {
      this._keys.forEach((key, texture) => texture.dispose());
      this._textures.clear();
      this._keys.clear();
      this._users.clear();
    }
  }

  /**
   * Share the textures embedded in GLB files between the models of a game:
   * the models of a pack all embed the same palette image, which would
   * otherwise be decoded and uploaded to the GPU once per model.
   */
  class SharedTexturesGLTFPlugin implements THREE_ADDONS.GLTFLoaderPlugin {
    name = 'GDEVELOP_shared_textures';
    private _parser: THREE_ADDONS.GLTFParser;
    private _textures: SharedTextureCache;

    constructor(parser: THREE_ADDONS.GLTFParser, textures: SharedTextureCache) {
      this._parser = parser;
      this._textures = textures;
    }

    loadTexture(textureIndex: number): Promise<THREE.Texture> | null {
      const json = this._parser.json;
      const textureDef = json.textures[textureIndex];
      // Textures from extensions (Basis, WebP...) or from external files keep
      // the default loading.
      if (textureDef.source === undefined) return null;
      const sourceDef = json.images[textureDef.source];
      if (sourceDef.bufferView === undefined) return null;

      return this._parser
        .getDependency('bufferView', sourceDef.bufferView)
        .then((buffer: ArrayBuffer) => {
          const sampler = json.samplers
            ? json.samplers[textureDef.sampler] || null
            : null;
          const key =
            hashBytes(buffer) +
            ':' +
            buffer.byteLength +
            ':' +
            JSON.stringify(sampler);
          return (
            this._textures.get(key) ||
            this._textures.set(
              key,
              this._parser.loadTextureImage(
                textureIndex,
                textureDef.source,
                this._parser.textureLoader
              )
            )
          );
        });
    }
  }

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
    private _sharedTextures = new SharedTextureCache();

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
        // The Draco decoder files are shipped with the game engine files.
        const runtimeFilesBaseUrl =
          resourceLoader.getRuntimeGame().getAdditionalOptions()
            .runtimeFilesBaseUrl || './';
        this._dracoLoader.setDecoderPath(
          runtimeFilesBaseUrl + 'pixi-renderers/draco/gltf/'
        );
        this._loader.setDRACOLoader(this._dracoLoader);
        this._loader.register(
          (parser) => new SharedTexturesGLTFPlugin(parser, this._sharedTextures)
        );

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
        forEachMaterial(gltf.scene, (material) =>
          forEachTexture(material, (texture) =>
            this._sharedTextures.retain(texture, resource.name)
          )
        );
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
      this._sharedTextures.dispose();
      this._loader = null;
      if (this._dracoLoader) {
        // Release the web workers used to decode the compressed 3D models.
        this._dracoLoader.dispose();
        this._dracoLoader = null;
      }

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
        // Instances only clone the model, so its geometries, materials and
        // textures can be released from the GPU with it.
        forEachMaterial(loadedThreeModel.scene, (material, mesh) => {
          forEachTexture(material, (texture) =>
            this._sharedTextures.release(texture, resourceData.name)
          );
          material.dispose();
          mesh.geometry.dispose();
          const skinnedMesh = mesh as THREE.SkinnedMesh;
          if (skinnedMesh.skeleton) skinnedMesh.skeleton.dispose();
        });
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
