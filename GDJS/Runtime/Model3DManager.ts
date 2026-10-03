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

  type SharedTextureEntry = {
    key: string;
    texture: Promise<THREE.Texture>;
    source?: THREE.Source<unknown>;
  };

  /**
   * Cache reusable textures and manage the lifetime of model textures.
   * Clone cached textures before assigning them to materials. Register each
   * model's textures with retain, then release them when that model unloads.
   */
  class SharedTextureCache {
    private _textures = new Map<string, SharedTextureEntry>();
    private _sources = new Map<
      THREE.Source<unknown>,
      { entries: Set<SharedTextureEntry>; users: Set<string> }
    >();
    private _retainedTextures = new Set<THREE.Texture>();

    /**
     * Return the cached loading promise, or undefined if the key is absent.
     * Clone the resulting texture before modifying it or using it in a material.
     */
    get(key: string): Promise<THREE.Texture> | undefined {
      const entry = this._textures.get(key);
      return entry && entry.texture;
    }

    /**
     * Cache a loading promise under an unused key identifying an image and its
     * sampler settings. Call get first to reuse an existing entry.
     * The returned promise preserves the loading result or error; null results
     * and rejected promises are removed from the cache.
     */
    set(key: string, texture: Promise<THREE.Texture>): Promise<THREE.Texture> {
      const entry: SharedTextureEntry = {
        key,
        texture: texture.then(
          (texture) => {
            // GLTFLoader returns null when an image cannot be decoded, despite
            // its TypeScript declaration. Do not cache failed image loads.
            if (!texture) {
              this._removeEntry(key, entry);
              return texture;
            }
            entry.source = texture.source;
            let source = this._sources.get(texture.source);
            if (!source) {
              source = { entries: new Set(), users: new Set() };
              this._sources.set(texture.source, source);
            }
            // GLTFLoader can also share a Source between different samplers
            // within one model. Keep all of their cache entries together.
            source.entries.add(entry);
            return texture;
          },
          (error) => {
            this._removeEntry(key, entry);
            throw error;
          }
        ),
      };
      this._textures.set(key, entry);
      return entry.texture;
    }

    private _removeEntry(key: string, entry: SharedTextureEntry): void {
      if (this._textures.get(key) !== entry) return;
      this._textures.delete(key);
      if (entry.source) {
        const source = this._sources.get(entry.source);
        if (source) {
          source.entries.delete(entry);
          if (source.entries.size === 0) this._sources.delete(entry.source);
        }
      }
    }

    /**
     * Register a texture as used by the named model. Call for every texture in
     * the model's materials after loading it. Repeated registration of the same
     * texture and model has no additional effect.
     */
    retain(texture: THREE.Texture, resourceName: string): void {
      this._retainedTextures.add(texture);
      // UV transforms and channel overrides clone the Texture but keep its Source.
      const source = this._sources.get(texture.source);
      if (source) source.users.add(resourceName);
    }

    /**
     * Dispose a retained texture when its model unloads. Pass the resource name
     * used for retain and release all of that model's textures together.
     * Cached images remain available while another retained model uses them.
     * Releasing the same texture again has no effect.
     */
    release(texture: THREE.Texture, resourceName: string): void {
      if (!this._retainedTextures.delete(texture)) return;
      // Three.js reference-counts shared GPU allocations, so disposing this
      // texture leaves allocations used by other model textures intact.
      texture.dispose();
      const source = this._sources.get(texture.source);
      if (!source) return;
      source.users.delete(resourceName);
      if (source.users.size > 0) return;
      source.entries.forEach((entry) => this._removeEntry(entry.key, entry));
    }

    /** Dispose all retained textures and clear the cache when the game ends. */
    dispose(): void {
      this._retainedTextures.forEach((texture) => texture.dispose());
      this._retainedTextures.clear();
      this._textures.clear();
      this._sources.clear();
    }
  }

  /**
   * Load embedded GLB textures through a shared cache. Register one plugin per
   * GLTFLoader parser, reusing the same cache across models.
   */
  class SharedTexturesGLTFPlugin implements THREE_ADDONS.GLTFLoaderPlugin {
    name = 'GDEVELOP_shared_textures';
    private _parser: THREE_ADDONS.GLTFParser;
    private _textures: SharedTextureCache;

    constructor(parser: THREE_ADDONS.GLTFParser, textures: SharedTextureCache) {
      this._parser = parser;
      this._textures = textures;
    }

    /**
     * Load the indexed texture with independently mutable settings.
     * Return null to let GLTFLoader handle textures unsupported by this plugin.
     * The returned promise resolves to null if the image cannot be decoded.
     */
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
          ).then((texture) => {
            if (!texture) return texture;
            // assignTexture changes colorSpace and may apply UV transforms.
            // Never expose the cached template to those per-material changes.
            // Cloning preserves the Source, allowing Three.js to share GPU
            // allocations when the texture settings match.
            const modelTexture = texture.clone();
            this._parser.associations.set(modelTexture, {
              textures: textureIndex,
            });
            return modelTexture;
          });
        });
    }
  }

  /**
   * Load, access, and unload the game's registered model3D resources.
   * Call loadResource to download a GLB, then processResource to make it
   * available through getModel.
   * @category Resources > 3D Models
   */
  export class Model3DManager implements gdjs.ResourceManager {
    // Associate resource names with loaded Three.js models.
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
