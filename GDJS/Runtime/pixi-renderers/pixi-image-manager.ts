/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('PIXI Image manager');
  import PIXI = GlobalPIXIModule.PIXI;

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

  const findResourceWithNameAndKind = (
    resources: ResourceData[],
    resourceName: string,
    kind: ResourceKind
  ): ResourceData | null => {
    for (let i = 0, len = resources.length; i < len; ++i) {
      const res = resources[i];
      if (res.name === resourceName && res.kind === kind) {
        return res;
      }
    }

    return null;
  };

  const determineCrossOrigin = (url: string) => {
    // Any resource stored on the GDevelop Cloud buckets needs the "credentials" of the user,
    // i.e: its gdevelop.io cookie, to be passed.
    // Note that this is only useful during previews.
    if (
      url.startsWith('https://project-resources.gdevelop.io/') ||
      url.startsWith('https://project-resources-dev.gdevelop.io/')
    )
      return 'use-credentials';

    // For other resources, use "anonymous" as done by default by PixiJS. Note that using `false`
    // to not having `crossorigin` at all would NOT work because the browser would taint the
    // loaded resource so that it can't be read/used in a canvas (it's only working for display `<img>` on screen).
    return 'anonymous';
  };

  /**
   * PixiImageManager loads and stores textures that can be used by the Pixi.js renderers.
   */
  export class PixiImageManager {
    _resources: ResourceData[];

    /**
     * The invalid texture is a 8x8 PNG file filled with magenta (#ff00ff), to be
     * easily spotted if rendered on screen.
     */
    _invalidTexture: PIXI.Texture;

    /**
     * Map associated resource name to the loaded PixiJS texture.
     */
    _loadedTextures: Hashtable<PIXI.Texture<PIXI.Resource>>;

    /**
     * @param resources The resources data of the game.
     */
    constructor(resources: ResourceData[]) {
      this._resources = resources;
      this._invalidTexture = PIXI.Texture.from(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVQoU2P8z/D/PwMewDgyFAAApMMX8Zi0uXAAAAAASUVORK5CYIIA'
      );
      this._loadedTextures = new Hashtable();
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
      if (resourceName === '') {
        return this._invalidTexture;
      }

      // Texture is not loaded, load it now from the resources list.
      const resource = findResourceWithNameAndKind(
        this._resources,
        resourceName,
        'image'
      );

      if (!resource) {
        logger.warn(
          'Unable to find texture for resource "' + resourceName + '".'
        );
        return this._invalidTexture;
      }

      logger.log('Loading texture for resource "' + resourceName + '"...');
      const file = resource.file;
      const texture = PIXI.Texture.from(file, {
        resourceOptions: {
          crossorigin: determineCrossOrigin(file),
        },
      }).on('error', (error) => {
        logFileLoadingError(file, error);
      });
      applyTextureSettings(texture, resource);

      this._loadedTextures.put(resourceName, texture);
      return texture;
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
      if (resourceName === '') {
        return this._invalidTexture;
      }

      // Texture is not loaded, load it now from the resources list.
      const resource = findResourceWithNameAndKind(
        this._resources,
        resourceName,
        'video'
      );

      if (!resource) {
        logger.warn(
          'Unable to find video texture for resource "' + resourceName + '".'
        );
        return this._invalidTexture;
      }

      const file = resource.file;
      logger.log(
        'Loading video texture for resource "' + resourceName + '"...'
      );
      const texture = PIXI.Texture.from(file, {
        resourceOptions: {
          crossorigin: determineCrossOrigin(file),
        },
      }).on('error', (error) => {
        logFileLoadingError(file, error);
      });

      this._loadedTextures.put(resourceName, texture);
      return texture;
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
     * @param onComplete Callback called when loading is done.
     */
    loadTextures(onProgress, onComplete) {
      const resources = this._resources;

      // Construct the list of files to be loaded.
      // For one loaded file, it can have one or more resources
      // that use it.
      const resourceFiles: Record<string, ResourceData[]> = {};
      for (let i = 0, len = resources.length; i < len; ++i) {
        const res = resources[i];
        if (res.file && res.kind === 'image') {
          if (this._loadedTextures.containsKey(res.name)) {
            // This resource is already loaded.
            continue;
          }
          resourceFiles[res.file] = resourceFiles[res.file]
            ? resourceFiles[res.file].concat(res)
            : [res];
        }
      }
      const totalCount = Object.keys(resourceFiles).length;
      if (totalCount === 0) {
        // Nothing to load.
        return onComplete(totalCount);
      }

      const loader = PIXI.Loader.shared;
      let loadingCount = 0;
      const progressCallbackId = loader.onProgress.add(function () {
        loadingCount++;
        onProgress(loadingCount, totalCount);
      });
      for (const file in resourceFiles) {
        if (resourceFiles.hasOwnProperty(file)) {
          loader.add({
            name: file,
            url: file,
            crossOrigin: determineCrossOrigin(file),
          });
        }
      }
      loader.load((loader, loadedPixiResources) => {
        loader.onProgress.detach(progressCallbackId);

        // Store the loaded textures so that they are ready to use.
        for (const file in loadedPixiResources) {
          if (loadedPixiResources.hasOwnProperty(file)) {
            if (!resourceFiles.hasOwnProperty(file)) {
              continue;
            }

            resourceFiles[file].forEach((resource) => {
              const loadedTexture = loadedPixiResources[file].texture;
              if (!loadedTexture) {
                // TODO: this is erroring for things in the bucket, because the XHR is done as text?
                // Instead of img?
                const error = loadedPixiResources[file].error;
                logFileLoadingError(file, error);
                return;
              }

              this._loadedTextures.put(resource.name, loadedTexture);
              applyTextureSettings(loadedTexture, resource);
            });
          }
        }
        onComplete(totalCount);
      });
    }
  }

  //Register the class to let the engine use it.
  export const ImageManager = gdjs.PixiImageManager;
  export type ImageManager = gdjs.PixiImageManager;
}
