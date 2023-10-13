/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('PIXI Image manager');

  const logFileLoadingError = (file: string, error: Error | undefined) => {
    logger.error(
      'Unable to load file ' + file + ' with error:',
      error ? error : '(unknown error)'
    );
  };

  const applyTextureSettings = (
    texture: PIXI.Texture | undefined,
    resourceData: ResourceData
  ) => {
    if (!texture) return;

    if (!resourceData.smoothed) {
      texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    }
  };

  const applyThreeTextureSettings = (
    threeTexture: THREE.Texture,
    resourceData: ResourceData | null
  ) => {
    if (resourceData && !resourceData.smoothed) {
      threeTexture.magFilter = THREE.NearestFilter;
      threeTexture.minFilter = THREE.NearestFilter;
    }
  };

  const findResourceWithNameAndKind = (
    resources: Map<string, ResourceData>,
    resourceName: string,
    kind: ResourceKind
  ): ResourceData | null => {
    const resource = resources.get(resourceName);
    return resource && resource.kind === kind ? resource : null;
  };

  /**
   * PixiImageManager loads and stores textures that can be used by the Pixi.js renderers.
   */
  export class PixiImageManager {
    _resources: Map<string, ResourceData>;

    /**
     * The invalid texture is a 8x8 PNG file filled with magenta (#ff00ff), to be
     * easily spotted if rendered on screen.
     */
    private _invalidTexture: PIXI.Texture;

    /**
     * Map associating a resource name to the loaded PixiJS texture.
     */
    private _loadedTextures: Hashtable<PIXI.Texture<PIXI.Resource>>;

    /**
     * Map associating a resource name to the loaded Three.js texture.
     */
    private _loadedThreeTextures: Hashtable<THREE.Texture>;
    private _loadedThreeMaterials: Hashtable<THREE.Material>;

    private _resourcesLoader: RuntimeGameResourcesLoader;

    /**
     * @param resources The resources data of the game.
     * @param resourcesLoader The resources loader of the game.
     */
    constructor(
      resourceDataArray: ResourceData[],
      resourcesLoader: RuntimeGameResourcesLoader
    ) {
      this._resources = new Map<string, ResourceData>();
      this.setResources(resourceDataArray);
      this._resourcesLoader = resourcesLoader;
      this._invalidTexture = PIXI.Texture.from(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVQoU2P8z/D/PwMewDgyFAAApMMX8Zi0uXAAAAAASUVORK5CYIIA'
      );
      this._loadedTextures = new Hashtable();
      this._loadedThreeTextures = new Hashtable();
      this._loadedThreeMaterials = new Hashtable();
    }

    /**
     * Update the resources data of the game. Useful for hot-reloading, should not be used otherwise.
     *
     * @param resources The resources data of the game.
     */
    setResources(resourceDataArray: ResourceData[]): void {
      this._resources.clear();
      for (const resourceData of resourceDataArray) {
        if (resourceData.kind === 'image' || resourceData.kind === 'video') {
          this._resources.set(resourceData.name, resourceData);
        }
      }
    }

    /**
     * Return the PIXI texture associated to the specified resource name.
     * Returns a placeholder texture if not found.
     * @param resourceName The name of the resource
     * @returns The requested texture, or a placeholder if not found.
     */
    getPIXITexture(resourceName: string): PIXI.Texture {
      if (this._loadedTextures.containsKey(resourceName)) {
        const texture = this._loadedTextures.get(resourceName);
        if (texture.valid) {
          return texture;
        } else {
          logger.error(
            'Texture for ' +
              resourceName +
              ' is not valid anymore (or never was).'
          );
        }
      }
      return this._invalidTexture;
    }

    /**
     * Return the three.js texture associated to the specified resource name.
     * Returns a placeholder texture if not found.
     * @param resourceName The name of the resource
     * @returns The requested texture, or a placeholder if not found.
     */
    getThreeTexture(resourceName: string): THREE.Texture {
      const loadedThreeTexture = this._loadedThreeTextures.get(resourceName);
      if (loadedThreeTexture) return loadedThreeTexture;

      // Texture is not loaded, load it now from the PixiJS texture.
      // TODO (3D) - optimization: don't load the PixiJS Texture if not used by PixiJS.
      // TODO (3D) - optimization: Ideally we could even share the same WebGL texture.
      const pixiTexture = this.getPIXITexture(resourceName);
      const pixiRenderer = this._resourcesLoader._runtimeGame
        .getRenderer()
        .getPIXIRenderer();
      if (!pixiRenderer) throw new Error('No PIXI renderer was found.');

      // @ts-ignore - source does exist on resource.
      const image = pixiTexture.baseTexture.resource.source;
      if (!(image instanceof HTMLImageElement)) {
        throw new Error(
          `Can't load texture for resource "${resourceName}" as it's not an image.`
        );
      }

      const threeTexture = new THREE.Texture(image);
      threeTexture.magFilter = THREE.LinearFilter;
      threeTexture.minFilter = THREE.LinearFilter;
      threeTexture.wrapS = THREE.RepeatWrapping;
      threeTexture.wrapT = THREE.RepeatWrapping;
      threeTexture.colorSpace = THREE.SRGBColorSpace;
      threeTexture.needsUpdate = true;

      const resource = findResourceWithNameAndKind(
        this._resources,
        resourceName,
        'image'
      );

      applyThreeTextureSettings(threeTexture, resource);
      this._loadedThreeTextures.put(resourceName, threeTexture);

      return threeTexture;
    }

    /**
     * Return the three.js material associated to the specified resource name.
     * @param resourceName The name of the resource
     * @param options
     * @returns The requested material.
     */
    getThreeMaterial(
      resourceName: string,
      {
        useTransparentTexture,
        forceBasicMaterial,
      }: { useTransparentTexture: boolean; forceBasicMaterial: boolean }
    ) {
      const cacheKey = `${resourceName}|${useTransparentTexture ? 1 : 0}|${
        forceBasicMaterial ? 1 : 0
      }`;

      const loadedThreeMaterial = this._loadedThreeMaterials.get(cacheKey);
      if (loadedThreeMaterial) return loadedThreeMaterial;

      const material = forceBasicMaterial
        ? new THREE.MeshBasicMaterial({
            map: this.getThreeTexture(resourceName),
            side: useTransparentTexture ? THREE.DoubleSide : THREE.FrontSide,
            transparent: useTransparentTexture,
          })
        : new THREE.MeshStandardMaterial({
            map: this.getThreeTexture(resourceName),
            side: useTransparentTexture ? THREE.DoubleSide : THREE.FrontSide,
            transparent: useTransparentTexture,
            metalness: 0,
          });
      this._loadedThreeMaterials.put(cacheKey, material);
      return material;
    }

    /**
     * Return the PIXI video texture associated to the specified resource name.
     * Returns a placeholder texture if not found.
     * @param resourceName The name of the resource to get.
     */
    getPIXIVideoTexture(resourceName: string) {
      if (this._loadedTextures.containsKey(resourceName)) {
        return this._loadedTextures.get(resourceName);
      }
      return this._invalidTexture;
    }

    /**
     * Return a PIXI texture which can be used as a placeholder when no
     * suitable texture can be found.
     */
    getInvalidPIXITexture() {
      return this._invalidTexture;
    }

    /**
     * Load the specified resources, so that textures are loaded and can then be
     * used by calling `getPIXITexture`.
     * @param onProgress Callback called each time a new file is loaded.
     */
    async loadTextures(
      onProgress: (loadingCount: integer, totalCount: integer) => void
    ): Promise<integer> {
      let loadedCount = 0;
      await Promise.all(
        [...this._resources.values()].map(async (resource) => {
          try {
            if (resource.kind === 'video') {
              // For videos, we want to preload them so they are available as soon as we want to use them.
              // We cannot use Pixi.assets.load() as it does not allow passing options (autoplay) to the resource loader.
              // Pixi.Texture.from() does not return a promise, so we need to ensure we look at the 'loaded' event of the baseTexture,
              // to continue, otherwise if we try to play the video too soon (at the beginning of scene for instance),
              // it will fail.
              await new Promise<void>((resolve, reject) => {
                const texture = PIXI.Texture.from(
                  this._resourcesLoader.getFullUrl(resource.file),
                  {
                    resourceOptions: {
                      crossOrigin: this._resourcesLoader.checkIfCredentialsRequired(
                        resource.file
                      )
                        ? 'use-credentials'
                        : 'anonymous',
                      autoPlay: false,
                    },
                  }
                ).on('error', (error) => {
                  reject(error);
                });

                const baseTexture = texture.baseTexture;

                baseTexture
                  .on('loaded', () => {
                    this._loadedTextures.put(resource.name, texture);
                    applyTextureSettings(texture, resource);
                    resolve();
                  })
                  .on('error', (error) => {
                    reject(error);
                  });
              });
            } else {
              PIXI.Assets.setPreferences({
                preferWorkers: false,
                preferCreateImageBitmap: false,
                crossOrigin: this._resourcesLoader.checkIfCredentialsRequired(
                  resource.file
                )
                  ? 'use-credentials'
                  : 'anonymous',
              });
              const loadedTexture = await PIXI.Assets.load(resource.file);
              if (!loadedTexture) {
                throw new Error(
                  'Texture loading by PIXI returned nothing for file ' +
                    resource.file
                );
              }
              this._loadedTextures.put(resource.name, loadedTexture);
              // TODO What if 2 assets share the same file with different settings?
              applyTextureSettings(loadedTexture, resource);
            }
          } catch (error) {
            logFileLoadingError(resource.file, error);
          }
          loadedCount++;
          onProgress(loadedCount, this._resources.size);
        })
      );
      return loadedCount;
    }
  }

  //Register the class to let the engine use it.
  export const ImageManager = gdjs.PixiImageManager;
  export type ImageManager = gdjs.PixiImageManager;
}
