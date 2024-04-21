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

  const resourceKinds: Array<ResourceKind> = ['image', 'video'];

  /**
   * PixiImageManager loads and stores textures that can be used by the Pixi.js renderers.
   */
  export class PixiImageManager implements gdjs.ResourceManager {
    /**
     * The invalid texture is a 8x8 PNG file filled with magenta (#ff00ff), to be
     * easily spotted if rendered on screen.
     */
    private _invalidTexture: PIXI.Texture;

    /**
     * Map associating a resource name to the loaded PixiJS texture.
     */
    private _loadedTextures = new gdjs.ResourceCache<PIXI.Texture>();

    /**
     * Map associating a resource name to the loaded Three.js texture.
     */
    private _loadedThreeTextures: Hashtable<THREE.Texture>;
    private _loadedThreeMaterials: Hashtable<THREE.Material>;

    private _diskTextures = new Map<float, PIXI.Texture>();
    private _rectangleTextures = new Map<string, PIXI.Texture>();
    private _scaledTextures = new Map<string, PIXI.Texture>();

    private _resourceLoader: gdjs.ResourceLoader;

    /**
     * @param resources The resources data of the game.
     * @param resourceLoader The resources loader of the game.
     */
    constructor(resourceLoader: gdjs.ResourceLoader) {
      this._resourceLoader = resourceLoader;
      this._invalidTexture = PIXI.Texture.from(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVQoU2P8z/D/PwMewDgyFAAApMMX8Zi0uXAAAAAASUVORK5CYIIA'
      );
      this._loadedThreeTextures = new Hashtable();
      this._loadedThreeMaterials = new Hashtable();
    }

    getResourceKinds(): ResourceKind[] {
      return resourceKinds;
    }

    /**
     * Return the PIXI texture associated to the specified resource name.
     * Returns a placeholder texture if not found.
     * @param resourceName The name of the resource
     * @returns The requested texture, or a placeholder if not found.
     */
    getPIXITexture(resourceName: string): PIXI.Texture {
      const resource = this._getImageResource(resourceName);
      if (!resource) {
        logger.warn(
          'Unable to find texture for resource "' + resourceName + '".'
        );
        return this._invalidTexture;
      }

      const existingTexture = this._loadedTextures.get(resource);
      if (!existingTexture) {
        return this._invalidTexture;
      }
      if (!existingTexture.valid) {
        logger.error(
          'Texture for ' +
            resourceName +
            ' is not valid anymore (or never was).'
        );
        return this._invalidTexture;
      }

      return existingTexture;
    }

    /**
     * Return the PIXI texture associated to the specified resource name.
     * If not found in the loaded textures, this method will try to load it.
     * Warning: this method should only be used in specific cases that cannot rely on
     * the initial resources loading of the game, such as the splashscreen.
     * @param resourceName The name of the resource
     * @returns The requested texture, or a placeholder if not valid.
     */
    getOrLoadPIXITexture(resourceName: string): PIXI.Texture {
      const resource = this._getImageResource(resourceName);
      if (!resource) {
        logger.warn(
          'Unable to find texture for resource "' + resourceName + '".'
        );
        return this._invalidTexture;
      }

      const existingTexture = this._loadedTextures.get(resource);
      if (existingTexture) {
        if (existingTexture.valid) {
          return existingTexture;
        } else {
          logger.error(
            'Texture for ' +
              resourceName +
              ' is not valid anymore (or never was).'
          );
          return this._invalidTexture;
        }
      }

      logger.log('Loading texture for resource "' + resourceName + '"...');
      const file = resource.file;
      const url = this._resourceLoader.getFullUrl(file);
      const texture = PIXI.Texture.from(url, {
        resourceOptions: {
          // Note that using `false`
          // to not having `crossorigin` at all would NOT work because the browser would taint the
          // loaded resource so that it can't be read/used in a canvas (it's only working for display `<img>` on screen).
          crossorigin: this._resourceLoader.checkIfCredentialsRequired(file)
            ? 'use-credentials'
            : 'anonymous',
        },
      }).on('error', (error) => {
        logFileLoadingError(file, error);
      });
      if (!texture) {
        throw new Error(
          'Texture loading by PIXI returned nothing for file ' +
            file +
            ' behind url ' +
            url
        );
      }
      applyTextureSettings(texture, resource);

      this._loadedTextures.set(resource, texture);
      return texture;
    }

    /**
     * Return the three.js texture associated to the specified resource name.
     * Returns a placeholder texture if not found.
     * @param resourceName The name of the resource
     * @returns The requested texture, or a placeholder if not found.
     */
    getThreeTexture(resourceName: string): THREE.Texture {
      const loadedThreeTexture = this._loadedThreeTextures.get(resourceName);
      if (loadedThreeTexture) {
        return loadedThreeTexture;
      }

      // Texture is not loaded, load it now from the PixiJS texture.
      // TODO (3D) - optimization: don't load the PixiJS Texture if not used by PixiJS.
      // TODO (3D) - optimization: Ideally we could even share the same WebGL texture.
      const pixiTexture = this.getPIXITexture(resourceName);
      const pixiRenderer = this._resourceLoader._runtimeGame
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

      const resource = this._getImageResource(resourceName);

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
    ): THREE.Material {
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
      if (resourceName === '') {
        return this._invalidTexture;
      }
      const resource = this._getImageResource(resourceName);
      if (!resource) {
        logger.warn(
          'Unable to find video texture for resource "' + resourceName + '".'
        );
        return this._invalidTexture;
      }

      const texture = this._loadedTextures.get(resource);
      if (!texture) {
        return this._invalidTexture;
      }
      return texture;
    }

    private _getImageResource = (resourceName: string): ResourceData | null => {
      const resource = this._resourceLoader.getResource(resourceName);
      return resource && this.getResourceKinds().includes(resource.kind)
        ? resource
        : null;
    };

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
     */
    async loadResource(resourceName: string): Promise<void> {
      const resource = this._resourceLoader.getResource(resourceName);
      if (!resource) {
        logger.warn(
          'Unable to find texture for resource "' + resourceName + '".'
        );
        return;
      }
      await this._loadTexture(resource);
    }

    async processResource(resourceName: string): Promise<void> {
      // Do nothing because images are light enough to be parsed in background.
    }

    /**
     * Load the specified resources, so that textures are loaded and can then be
     * used by calling `getPIXITexture`.
     * @param onProgress Callback called each time a new file is loaded.
     */
    async _loadTexture(resource: ResourceData): Promise<void> {
      if (this._loadedTextures.get(resource)) {
        return;
      }
      try {
        if (resource.kind === 'video') {
          // For videos, we want to preload them so they are available as soon as we want to use them.
          // We cannot use Pixi.assets.load() as it does not allow passing options (autoplay) to the resource loader.
          // Pixi.Texture.from() does not return a promise, so we need to ensure we look at the 'loaded' event of the baseTexture,
          // to continue, otherwise if we try to play the video too soon (at the beginning of scene for instance),
          // it will fail.
          await new Promise<void>((resolve, reject) => {
            const texture = PIXI.Texture.from(
              this._resourceLoader.getFullUrl(resource.file),
              {
                resourceOptions: {
                  crossorigin: this._resourceLoader.checkIfCredentialsRequired(
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
                this._loadedTextures.set(resource, texture);
                applyTextureSettings(texture, resource);
                resolve();
              })
              .on('error', (error) => {
                reject(error);
              });
          });
        } else {
          // If the file has no extension, PIXI.assets.load cannot find
          // an adequate load parser and does not load the file although
          // we would like to force it to load (we are confident it's an image).
          // TODO: When PIXI v8+ is used, PIXI.Assets.load can be used because
          // loadParser can be forced in PIXI.Assets.load
          // (see https://github.com/pixijs/pixijs/blob/71ed56c569ebc6b53da19e3c49258a0a84892101/packages/assets/src/loader/Loader.ts#L68)
          const loadedTexture = PIXI.Texture.from(
            this._resourceLoader.getFullUrl(resource.file),
            {
              resourceOptions: {
                autoLoad: false,
                crossorigin: this._resourceLoader.checkIfCredentialsRequired(
                  resource.file
                )
                  ? 'use-credentials'
                  : 'anonymous',
              },
            }
          );
          await loadedTexture.baseTexture.resource.load();

          this._loadedTextures.set(resource, loadedTexture);
          // TODO What if 2 assets share the same file with different settings?
          applyTextureSettings(loadedTexture, resource);
        }
      } catch (error) {
        logFileLoadingError(resource.file, error);
      }
    }

    /**
     * Return a texture containing a circle filled with white.
     * @param radius The circle radius
     * @param pixiRenderer The renderer used to generate the texture
     */
    getOrCreateDiskTexture(
      radius: float,
      pixiRenderer: PIXI.Renderer
    ): PIXI.Texture {
      let particleTexture = this._diskTextures.get(radius);
      if (!particleTexture) {
        const graphics = new PIXI.Graphics();
        graphics.lineStyle(0, 0, 0);
        graphics.beginFill(gdjs.rgbToHexNumber(255, 255, 255), 1);
        graphics.drawCircle(0, 0, radius);
        graphics.endFill();
        particleTexture = pixiRenderer.generateTexture(graphics);
        graphics.destroy();

        this._diskTextures.set(radius, particleTexture);
      }
      return particleTexture;
    }

    /**
     * Return a texture filled with white.
     * @param width The texture width
     * @param height The texture height
     * @param pixiRenderer The renderer used to generate the texture
     */
    getOrCreateRectangleTexture(
      width: float,
      height: float,
      pixiRenderer: PIXI.Renderer
    ): PIXI.Texture {
      const key = `${width}_${height}`;
      let particleTexture = this._rectangleTextures.get(key);
      if (!particleTexture) {
        const graphics = new PIXI.Graphics();
        graphics.lineStyle(0, 0, 0);
        graphics.beginFill(gdjs.rgbToHexNumber(255, 255, 255), 1);
        graphics.drawRect(0, 0, width, height);
        graphics.endFill();
        particleTexture = pixiRenderer.generateTexture(graphics);
        graphics.destroy();

        this._rectangleTextures.set(key, particleTexture);
      }
      return particleTexture;
    }

    /**
     * Return a texture rescaled according to given dimensions.
     * @param width The texture width
     * @param height The texture height
     * @param pixiRenderer The renderer used to generate the texture
     */
    getOrCreateScaledTexture(
      imageResourceName: string,
      width: float,
      height: float,
      pixiRenderer: PIXI.Renderer
    ): PIXI.Texture {
      const key = `${imageResourceName}_${width}_${height}`;
      let particleTexture = this._scaledTextures.get(key);
      if (!particleTexture) {
        const graphics = new PIXI.Graphics();
        const sprite = new PIXI.Sprite(this.getPIXITexture(imageResourceName));
        sprite.width = width;
        sprite.height = height;
        graphics.addChild(sprite);
        particleTexture = pixiRenderer.generateTexture(graphics);
        graphics.destroy();

        this._scaledTextures.set(key, particleTexture);
      }
      return particleTexture;
    }
  }

  //Register the class to let the engine use it.
  export const ImageManager = gdjs.PixiImageManager;
  export type ImageManager = gdjs.PixiImageManager;
}
