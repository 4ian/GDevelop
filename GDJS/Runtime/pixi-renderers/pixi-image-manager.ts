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

  const isGifResource = (resourceData: ResourceData): boolean => {
    const resourcePaths = [resourceData.file, resourceData.name];
    return resourcePaths.some((resourcePath) =>
      resourcePath.split('?')[0].toLowerCase().endsWith('.gif')
    );
  };

  const resourceKinds: Array<ResourceKind> = ['image', 'video'];

  type ImageDecoderConstructor = new (options: {
    data: ArrayBuffer;
    type: string;
  }) => any;

  /**
   * PixiImageManager loads and stores textures that can be used by the Pixi.js renderers.
   * @category Resources > Images/Textures
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
    private _loadedGifFrameTextures = new gdjs.ResourceCache<PIXI.Texture[]>();
    private _loadedGifFrameTextureSets = new Set<PIXI.Texture[]>();

    /**
     * Map associating a resource name to the loaded Three.js texture.
     */
    private _loadedThreeTextures: Hashtable<THREE.Texture>;
    private _loadedThreeMaterials = new ThreeMaterialCache();
    private _loadedThreeCubeTextures = new Map<string, THREE.CubeTexture>();
    private _loadedThreeCubeTextureKeysByResourceName = new ArrayMap<
      string,
      string
    >();
    private _threeTextureFailures: Array<{
      code: string;
      resourceName: string;
      sourceType: string;
      objectName?: string;
      faceIndex?: number;
      message: string;
    }> = [];
    private _threeTextureFailureKeys = new Set<string>();
    private _threeTextureFailureRegistryTruncated = false;

    private _diskTextures = new Map<float, PIXI.Texture>();
    private _rectangleTextures = new Map<string, PIXI.Texture>();
    private _scaledTextures = new Map<string, PIXI.Texture>();

    private _resourceLoader: gdjs.ResourceLoader;

    /**
     * @param resourceLoader The resources loader of the game.
     */
    constructor(resourceLoader: gdjs.ResourceLoader) {
      this._resourceLoader = resourceLoader;
      this._invalidTexture = PIXI.Texture.from(
        'data:image/png;base64,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',
        { width: 192, height: 192 }
      );
      this._loadedThreeTextures = new Hashtable();
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
        if (!resourceName) return this._invalidTexture;
        logger.warn(
          'Unable to find texture for resource "' + resourceName + '".'
        );
        return this._invalidTexture;
      }

      const existingTexture = this._loadedTextures.get(resource);
      if (!existingTexture) {
        return this._invalidTexture;
      }
      if (existingTexture.destroyed) {
        logger.error('Texture for ' + resourceName + ' is not valid anymore.');
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
     * Return a PIXI texture for a frame inside an animated image resource.
     * It falls back to the whole-image texture for non-animated images.
     */
    getPIXITextureForImageFrame(
      resourceName: string,
      imageFrameIndex: integer
    ): PIXI.Texture {
      const resource = this._getImageResource(resourceName);
      if (!resource) {
        if (!resourceName) return this._invalidTexture;
        logger.warn(
          'Unable to find texture for resource "' + resourceName + '".'
        );
        return this._invalidTexture;
      }

      const gifFrameTextures = this._loadedGifFrameTextures.get(resource);
      if (gifFrameTextures && gifFrameTextures.length) {
        const wrappedFrameIndex =
          ((imageFrameIndex % gifFrameTextures.length) +
            gifFrameTextures.length) %
          gifFrameTextures.length;
        const frameTexture = gifFrameTextures[wrappedFrameIndex];
        if (frameTexture && !frameTexture.destroyed && frameTexture.valid) {
          return frameTexture;
        }
      }

      return this.getPIXITexture(resourceName);
    }

    /**
     * Return a PIXI texture for a rectangle inside an image resource.
     * The returned texture shares the same base texture as the full image.
     */
    getPIXITextureForSourceRect(
      resourceName: string,
      sourceRect: gdjs.SpriteFrameSourceRectData
    ): PIXI.Texture {
      const texture = this.getPIXITexture(resourceName);
      if (
        texture === this._invalidTexture ||
        !texture.baseTexture ||
        !texture.baseTexture.valid ||
        texture.destroyed ||
        sourceRect.width <= 0 ||
        sourceRect.height <= 0
      ) {
        return texture;
      }

      const key = `sourceRect:${resourceName}:${sourceRect.x}:${sourceRect.y}:${
        sourceRect.width
      }:${sourceRect.height}`;
      const existingTexture = this._rectangleTextures.get(key);
      if (
        existingTexture &&
        !existingTexture.destroyed &&
        existingTexture.baseTexture === texture.baseTexture
      ) {
        return existingTexture;
      }

      try {
        const frame = new PIXI.Rectangle(
          sourceRect.x,
          sourceRect.y,
          sourceRect.width,
          sourceRect.height
        );
        const sourceRectTexture = new PIXI.Texture(texture.baseTexture, frame);
        this._rectangleTextures.set(key, sourceRectTexture);
        return sourceRectTexture;
      } catch (error) {
        logger.error(
          `Unable to create a texture for source rectangle in "${resourceName}".`,
          error
        );
        return this._invalidTexture;
      }
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
        if (!resourceName) return this._invalidTexture;
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
      }).on('error', error => {
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
    getThreeTexture(
      resourceName: string,
      diagnosticContext?: {
        objectName?: string;
        faceIndex?: number;
      }
    ): THREE.Texture {
      const loadedThreeTexture = this._loadedThreeTextures.get(resourceName);
      if (loadedThreeTexture) {
        return loadedThreeTexture;
      }
      let image: TexImageSource;
      try {
        image = this._getThreeTextureSource(resourceName);
      } catch (error) {
        const message =
          error && (error as Error).message
            ? (error as Error).message
            : String(error);
        const sourceTypeMatch = message.match(/source type "([^"]+)"/);
        const failure = {
          code: message.includes('THREE_TEXTURE_UNSUPPORTED_SOURCE')
            ? 'THREE_TEXTURE_UNSUPPORTED_SOURCE'
            : 'THREE_TEXTURE_LOAD_FAILED',
          resourceName,
          sourceType: sourceTypeMatch ? sourceTypeMatch[1] : 'unknown',
          objectName:
            diagnosticContext && diagnosticContext.objectName
              ? diagnosticContext.objectName
              : undefined,
          faceIndex:
            diagnosticContext && typeof diagnosticContext.faceIndex === 'number'
              ? diagnosticContext.faceIndex
              : undefined,
          message,
        };
        const failureKey = [
          failure.code,
          failure.resourceName,
          failure.objectName || '',
          failure.faceIndex === undefined ? '' : failure.faceIndex,
        ].join(':');
        if (!this._threeTextureFailureKeys.has(failureKey)) {
          this._threeTextureFailureKeys.add(failureKey);
          if (this._threeTextureFailures.length < 64) {
            this._threeTextureFailures.push(failure);
          } else {
            this._threeTextureFailureRegistryTruncated = true;
          }
        }
        throw error;
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

    getThreeTextureDebugInfo(): Object {
      return {
        failedTextureCount: this._threeTextureFailureKeys.size,
        returnedFailureCount: this._threeTextureFailures.length,
        failures: this._threeTextureFailures.slice(),
        truncated: this._threeTextureFailureRegistryTruncated,
        limit: 64,
      };
    }

    private _getThreeTextureSource(resourceName: string): TexImageSource {
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
      const isSupportedThreeTextureSource =
        (typeof HTMLImageElement !== 'undefined' &&
          image instanceof HTMLImageElement) ||
        (typeof HTMLCanvasElement !== 'undefined' &&
          image instanceof HTMLCanvasElement) ||
        (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) ||
        (typeof ImageData !== 'undefined' && image instanceof ImageData) ||
        (typeof HTMLVideoElement !== 'undefined' &&
          image instanceof HTMLVideoElement) ||
        (typeof OffscreenCanvas !== 'undefined' &&
          image instanceof OffscreenCanvas);
      if (!isSupportedThreeTextureSource) {
        const sourceType =
          image && image.constructor && image.constructor.name
            ? image.constructor.name
            : typeof image;
        throw new Error(
          `[THREE_TEXTURE_UNSUPPORTED_SOURCE] Can't load texture for resource "${resourceName}" ` +
            `because the loaded source type "${sourceType}" cannot be uploaded to Three.js.`
        );
      }
      return image as TexImageSource;
    }

    /**
     * Return the three.js texture associated to the specified resource name.
     * Returns a placeholder texture if not found.
     * @param xPositiveResourceName The name of the resource
     * @returns The requested cube texture, or a placeholder if not found.
     */
    getThreeCubeTexture(
      xPositiveResourceName: string,
      xNegativeResourceName: string,
      yPositiveResourceName: string,
      yNegativeResourceName: string,
      zPositiveResourceName: string,
      zNegativeResourceName: string
    ): THREE.CubeTexture {
      const key =
        xPositiveResourceName +
        '|' +
        xNegativeResourceName +
        '|' +
        yPositiveResourceName +
        '|' +
        yNegativeResourceName +
        '|' +
        zPositiveResourceName +
        '|' +
        zNegativeResourceName;
      const loadedThreeTexture = this._loadedThreeCubeTextures.get(key);
      if (loadedThreeTexture) {
        return loadedThreeTexture;
      }

      const cubeTexture = new THREE.CubeTexture();
      // Faces on X axis need to be swapped.
      cubeTexture.images[0] = this._getThreeTextureSource(
        xNegativeResourceName
      );
      cubeTexture.images[1] = this._getThreeTextureSource(
        xPositiveResourceName
      );
      // Faces on Y keep the same order.
      cubeTexture.images[2] = this._getThreeTextureSource(
        yPositiveResourceName
      );
      cubeTexture.images[3] = this._getThreeTextureSource(
        yNegativeResourceName
      );
      // Faces on Z keep the same order.
      cubeTexture.images[4] = this._getThreeTextureSource(
        zPositiveResourceName
      );
      cubeTexture.images[5] = this._getThreeTextureSource(
        zNegativeResourceName
      );
      // The images also need to be mirrored horizontally by users.

      cubeTexture.magFilter = THREE.LinearFilter;
      cubeTexture.minFilter = THREE.LinearFilter;
      cubeTexture.colorSpace = THREE.SRGBColorSpace;
      cubeTexture.needsUpdate = true;

      const resource = this._getImageResource(xPositiveResourceName);
      applyThreeTextureSettings(cubeTexture, resource);
      this._loadedThreeCubeTextures.set(key, cubeTexture);
      this._loadedThreeCubeTextureKeysByResourceName.add(
        xPositiveResourceName,
        key
      );
      this._loadedThreeCubeTextureKeysByResourceName.add(
        xNegativeResourceName,
        key
      );
      this._loadedThreeCubeTextureKeysByResourceName.add(
        yPositiveResourceName,
        key
      );
      this._loadedThreeCubeTextureKeysByResourceName.add(
        yNegativeResourceName,
        key
      );
      this._loadedThreeCubeTextureKeysByResourceName.add(
        zPositiveResourceName,
        key
      );
      this._loadedThreeCubeTextureKeysByResourceName.add(
        zNegativeResourceName,
        key
      );

      return cubeTexture;
    }

    /**
     * Return the three.js material associated to the specified resource name.
     * @param resourceName The name of the resource
     * @param options
     * @returns The requested material.
     */
    getThreeMaterial(
      resourceName: string,
      options: {
        useTransparentTexture: boolean;
        forceBasicMaterial: boolean;
        vertexColors: boolean;
        diagnosticContext?: {
          objectName?: string;
          faceIndex?: number;
        };
      }
    ): THREE.Material {
      const loadedThreeMaterial = this._loadedThreeMaterials.get(
        resourceName,
        options
      );
      if (loadedThreeMaterial) return loadedThreeMaterial;

      const material = options.forceBasicMaterial
        ? new THREE.MeshBasicMaterial({
            map: this.getThreeTexture(resourceName, options.diagnosticContext),
            side: options.useTransparentTexture
              ? THREE.DoubleSide
              : THREE.FrontSide,
            transparent: options.useTransparentTexture,
            vertexColors: options.vertexColors,
          })
        : new THREE.MeshStandardMaterial({
            map: this.getThreeTexture(resourceName, options.diagnosticContext),
            side: options.useTransparentTexture
              ? THREE.DoubleSide
              : THREE.FrontSide,
            transparent: options.useTransparentTexture,
            metalness: 0,
            vertexColors: options.vertexColors,
          });
      this._loadedThreeMaterials.set(resourceName, options, material);
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
        if (!resourceName) return;
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

    private async _loadGifFrameTextures(
      resource: ResourceData,
      resourceUrl: string
    ): Promise<PIXI.Texture[] | null> {
      if (!isGifResource(resource)) {
        return null;
      }

      const ImageDecoderClass = (globalThis as any).ImageDecoder as
        | ImageDecoderConstructor
        | undefined;
      if (!ImageDecoderClass) {
        return null;
      }

      let decoder: any = null;
      try {
        const response = await fetch(resourceUrl, {
          credentials: this._resourceLoader.checkIfCredentialsRequired(
            resource.file
          )
            ? 'include'
            : 'same-origin',
        });
        if (!response.ok) {
          throw new Error(
            `Failed to fetch GIF "${resource.file}": ${response.status} ${
              response.statusText
            }`
          );
        }

        const arrayBuffer = await response.arrayBuffer();
        decoder = new ImageDecoderClass({
          data: arrayBuffer,
          type: 'image/gif',
        });
        if (decoder.tracks && decoder.tracks.ready) {
          await decoder.tracks.ready;
        }

        const selectedTrack = decoder.tracks
          ? decoder.tracks.selectedTrack
          : null;
        const frameCount =
          selectedTrack &&
          Number.isFinite(selectedTrack.frameCount) &&
          selectedTrack.frameCount > 0
            ? selectedTrack.frameCount
            : 1;
        const frameTextures: PIXI.Texture[] = [];

        for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
          const decodedFrame = await decoder.decode({ frameIndex });
          const image = decodedFrame.image;
          const width = image.displayWidth || image.codedWidth || image.width;
          const height =
            image.displayHeight || image.codedHeight || image.height;
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d');
          if (!context) {
            if (typeof image.close === 'function') {
              image.close();
            }
            throw new Error('Unable to create a canvas context for a GIF.');
          }

          context.drawImage(image, 0, 0);
          if (typeof image.close === 'function') {
            image.close();
          }

          const texture = PIXI.Texture.from(canvas);
          applyTextureSettings(texture, resource);
          frameTextures.push(texture);
        }

        return frameTextures.length ? frameTextures : null;
      } finally {
        if (decoder && typeof decoder.close === 'function') {
          decoder.close();
        }
      }
    }

    /**
     * Load the specified resources, so that textures are loaded and can then be
     * used by calling `getPIXITexture`.
     * @param onProgress Callback called each time a new file is loaded.
     */
    async _loadTexture(resource: ResourceData): Promise<void> {
      const existingTexture = this._loadedTextures.get(resource);
      if (
        existingTexture &&
        !existingTexture.destroyed &&
        existingTexture.valid
      ) {
        return;
      }
      if (existingTexture) {
        this._destroyLoadedGifFrameTextures(resource);
        this._loadedTextures.delete(resource);
      }

      const resourceUrl = this._resourceLoader.getFullUrl(resource.file);
      try {
        if (resource.kind === 'video') {
          // For videos, we want to preload them so they are available as soon as we want to use them.
          // We cannot use Pixi.assets.load() as it does not allow passing options (autoplay) to the resource loader.
          // Pixi.Texture.from() does not return a promise, so we need to ensure we look at the 'loaded' event of the baseTexture,
          // to continue, otherwise if we try to play the video too soon (at the beginning of scene for instance),
          // it will fail.
          await new Promise<void>((resolve, reject) => {
            // The resource is explicitly built as a video one: `PIXI.Texture.from`
            // picks the kind of resource from the file extension of the URL,
            // and there is none when the game resources were packed at export
            // (the video is then read from a `blob:` URL).
            const videoResource = new PIXI.VideoResource(resourceUrl, {
              crossorigin: this._resourceLoader.checkIfCredentialsRequired(
                resource.file
              )
                ? 'use-credentials'
                : 'anonymous',
              autoPlay: false,
            });
            const texture = new PIXI.Texture(
              new PIXI.BaseTexture(videoResource)
            );

            const baseTexture = texture.baseTexture;
            baseTexture
              .on('loaded', () => {
                this._loadedTextures.set(resource, texture);
                applyTextureSettings(texture, resource);
                resolve();
              })
              .on('error', error => {
                reject(error);
              });
          });
        } else {
          try {
            const gifFrameTextures = await this._loadGifFrameTextures(
              resource,
              resourceUrl
            );
            if (gifFrameTextures && gifFrameTextures.length) {
              this._loadedGifFrameTextures.set(resource, gifFrameTextures);
              this._loadedGifFrameTextureSets.add(gifFrameTextures);
              this._loadedTextures.set(resource, gifFrameTextures[0]);
              return;
            }
          } catch (error) {
            logger.warn(
              'Unable to decode GIF frames for file ' +
                resource.file +
                '. Falling back to a standard texture.',
              error
            );
          }

          // If the file has no extension, PIXI.assets.load cannot find
          // an adequate load parser and does not load the file although
          // we would like to force it to load (we are confident it's an image).
          // TODO: When PIXI v8+ is used, PIXI.Assets.load can be used because
          // loadParser can be forced in PIXI.Assets.load
          // (see https://github.com/pixijs/pixijs/blob/71ed56c569ebc6b53da19e3c49258a0a84892101/packages/assets/src/loader/Loader.ts#L68)
          const loadedTexture = PIXI.Texture.from(resourceUrl, {
            resourceOptions: {
              autoLoad: false,
              crossorigin: this._resourceLoader.checkIfCredentialsRequired(
                resource.file
              )
                ? 'use-credentials'
                : 'anonymous',
            },
          });
          await loadedTexture.baseTexture.resource.load();

          this._loadedTextures.set(resource, loadedTexture);
          // TODO What if 2 assets share the same file with different settings?
          applyTextureSettings(loadedTexture, resource);
        }
      } catch (error) {
        logFileLoadingError(resource.file, error as Error);
        PIXI.Texture.removeFromCache(resourceUrl);
        PIXI.BaseTexture.removeFromCache(resourceUrl);
        throw error;
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

    private _destroyGifFrameTextures(gifFrameTextures: PIXI.Texture[]): void {
      for (const gifFrameTexture of gifFrameTextures) {
        if (gifFrameTexture.destroyed) {
          continue;
        }

        gifFrameTexture.destroy(true);
      }
    }

    private _destroyLoadedGifFrameTextures(resourceData: ResourceData): void {
      const gifFrameTextures = this._loadedGifFrameTextures.get(resourceData);
      if (!gifFrameTextures) {
        return;
      }

      this._destroyGifFrameTextures(gifFrameTextures);
      this._loadedGifFrameTextures.delete(resourceData);
      this._loadedGifFrameTextureSets.delete(gifFrameTextures);
    }

    /**
     * To be called when the game is disposed.
     * Clear caches of loaded textures and materials.
     */
    dispose(): void {
      for (const gifFrameTextures of this._loadedGifFrameTextureSets.values()) {
        this._destroyGifFrameTextures(gifFrameTextures);
      }
      this._loadedGifFrameTextureSets.clear();
      this._loadedGifFrameTextures.clear();
      this._loadedTextures.clear();

      const threeTextures: THREE.Texture[] = [];
      this._loadedThreeTextures.values(threeTextures);
      this._loadedThreeTextures.clear();
      for (const threeTexture of threeTextures) {
        threeTexture.dispose();
      }
      for (const cubeTexture of this._loadedThreeCubeTextures.values()) {
        cubeTexture.dispose();
      }
      this._loadedThreeCubeTextures.clear();
      this._loadedThreeCubeTextureKeysByResourceName.clear();

      this._loadedThreeMaterials.disposeAll();

      for (const pixiTexture of this._diskTextures.values()) {
        if (pixiTexture.destroyed) {
          continue;
        }

        pixiTexture.destroy();
      }
      this._diskTextures.clear();

      for (const pixiTexture of this._rectangleTextures.values()) {
        if (pixiTexture.destroyed) {
          continue;
        }

        pixiTexture.destroy();
      }
      this._rectangleTextures.clear();

      for (const pixiTexture of this._scaledTextures.values()) {
        if (pixiTexture.destroyed) {
          continue;
        }

        pixiTexture.destroy();
      }
      this._scaledTextures.clear();
    }

    unloadResource(resourceData: ResourceData): void {
      const resourceName = resourceData.name;
      this._destroyLoadedGifFrameTextures(resourceData);

      const texture = this._loadedTextures.getFromName(resourceName);
      if (texture) {
        if (!texture.destroyed) {
          texture.destroy(true);
        }
        this._loadedTextures.delete(resourceData);
      }

      const threeTexture = this._loadedThreeTextures.get(resourceName);
      if (threeTexture) {
        threeTexture.dispose();
        this._loadedThreeTextures.remove(resourceName);
      }

      this._loadedThreeMaterials.dispose(resourceName);

      const cubeTextureKeys = this._loadedThreeCubeTextureKeysByResourceName.getValuesFor(
        resourceName
      );
      if (cubeTextureKeys) {
        for (const cubeTextureKey of cubeTextureKeys) {
          const cubeTexture = this._loadedThreeCubeTextures.get(cubeTextureKey);
          if (cubeTexture) {
            cubeTexture.dispose();
            this._loadedThreeCubeTextures.delete(cubeTextureKey);
          }
        }
      }
    }
  }

  class ArrayMap<K, V> {
    map = new Map<K, Array<V>>();

    getValuesFor(key: K): Array<V> | undefined {
      return this.map.get(key);
    }

    add(key: K, value: V): void {
      let values = this.map.get(key);
      if (!values) {
        values = [];
        this.map.set(key, values);
      }
      values.push(value);
    }

    deleteValuesFor(key: K): void {
      this.map.delete(key);
    }

    clear(): void {
      this.map.clear();
    }
  }

  class ThreeMaterialCache {
    private _flaggedMaterials = new Map<string, THREE.Material>();
    private _materialFlaggedKeys = new ArrayMap<string, string>();

    /**
     * Return the three.js material associated to the specified resource name
     * and options.
     * @param resourceName The name of the resource
     * @param options
     * @returns The requested material.
     */
    get(
      resourceName: string,
      {
        useTransparentTexture,
        forceBasicMaterial,
        vertexColors,
      }: {
        useTransparentTexture: boolean;
        forceBasicMaterial: boolean;
        vertexColors: boolean;
      }
    ): THREE.Material | null {
      const flaggedKey = `${resourceName}|${useTransparentTexture ? 1 : 0}|${
        forceBasicMaterial ? 1 : 0
      }|${vertexColors ? 1 : 0}`;
      return this._flaggedMaterials.get(flaggedKey) || null;
    }

    /**
     * Set the three.js material associated to the specified resource name
     * and options.
     * @param resourceName The name of the resource
     * @param options
     * @param material The material to add to the cache
     */
    set(
      resourceName: string,
      {
        useTransparentTexture,
        forceBasicMaterial,
        vertexColors,
      }: {
        useTransparentTexture: boolean;
        forceBasicMaterial: boolean;
        vertexColors: boolean;
      },
      material: THREE.Material
    ): void {
      const cacheKey = `${resourceName}|${useTransparentTexture ? 1 : 0}|${
        forceBasicMaterial ? 1 : 0
      }|${vertexColors ? 1 : 0}`;
      this._flaggedMaterials.set(cacheKey, material);
      this._materialFlaggedKeys.add(resourceName, cacheKey);
    }

    /**
     * Delete and dispose all the three.js material associated to the specified
     * resource name.
     * @param resourceName The name of the resource
     */
    dispose(resourceName: string): void {
      const flaggedKeys = this._materialFlaggedKeys.getValuesFor(resourceName);
      if (flaggedKeys) {
        for (const flaggedKey of flaggedKeys) {
          const threeMaterial = this._flaggedMaterials.get(flaggedKey);
          if (threeMaterial) {
            threeMaterial.dispose();
          }
          this._flaggedMaterials.delete(flaggedKey);
        }
      }
      this._materialFlaggedKeys.deleteValuesFor(resourceName);
    }

    /**
     * Delete and dispose all the three.js material in the cache.
     */
    disposeAll(): void {
      for (const material of this._flaggedMaterials.values()) {
        material.dispose();
      }
      this._flaggedMaterials.clear();
      this._materialFlaggedKeys.clear();
    }
  }

  //Register the class to let the engine use it.
  /** @category Resources > Images/Textures */
  export const ImageManager = gdjs.PixiImageManager;
  /** @category Resources > Images/Textures */
  export type ImageManager = gdjs.PixiImageManager;
}
