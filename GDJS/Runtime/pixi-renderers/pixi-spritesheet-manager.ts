/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const spritesheetKinds: ResourceKind[] = ['spritesheet'];

  /**
   * SpritesheetManager loads spritesheet JSON files and processes them to Pixi Spritesheet objects.
   * The spritesheet JSON files contain frame definitions that reference an image resource.
   * Unlike Spine atlases, spritesheets depend on the image manager for the base texture.
   */
  export class PixiSpritesheetManager implements gdjs.ResourceManager {
    private _imageManager: ImageManager;
    private _resourceLoader: ResourceLoader;
    private _loadedSpritesheets = new gdjs.ResourceCache<PIXI.Spritesheet>();
    private _loadingSpritesheets = new gdjs.ResourceCache<
      Promise<PIXI.Spritesheet>
    >();

    /**
     * @param resourceLoader The resources loader of the game.
     * @param imageManager The image manager of the game.
     */
    constructor(
      resourceLoader: gdjs.ResourceLoader,
      imageManager: ImageManager
    ) {
      this._resourceLoader = resourceLoader;
      this._imageManager = imageManager;
    }

    getResourceKinds(): ResourceKind[] {
      return spritesheetKinds;
    }

    async processResource(resourceName: string): Promise<void> {
      // Do nothing because we parse resources when loading.
    }

    async loadResource(resourceName: string): Promise<void> {
      await this.getOrLoad(resourceName);
    }

    /**
     * Returns promisified loaded spritesheet resource if it is available, loads it otherwise.
     *
     * @param resourceName The name of resource to load.
     */
    getOrLoad(resourceName: string): Promise<PIXI.Spritesheet> {
      const resource = this._getSpritesheetResource(resourceName);

      if (!resource) {
        return Promise.reject(
          `Unable to find spritesheet for resource '${resourceName}'.`
        );
      }

      let loadingPromise = this._loadingSpritesheets.get(resource);

      if (!loadingPromise) {
        loadingPromise = new Promise<PIXI.Spritesheet>((resolve, reject) => {
          this.load(resource, (error, spritesheet) => {
            if (error) {
              reject(`Error while loading spritesheet resource: ${error}`);
            } else if (!spritesheet) {
              reject(
                `Cannot reach spritesheet for resource '${resourceName}'.`
              );
            } else {
              resolve(spritesheet);
            }
          });
        });

        this._loadingSpritesheets.set(resource, loadingPromise);
      }

      return loadingPromise;
    }

    /**
     * Load specified spritesheet resource and pass it to callback once it is loaded.
     *
     * @param resource The data of resource to load.
     * @param callback The callback to pass spritesheet to it once it is loaded.
     */
    load(
      resource: ResourceData,
      callback: (error: Error | null, spritesheet?: PIXI.Spritesheet) => void
    ): void {
      const url = this._resourceLoader.getFullUrl(resource.file);

      // Load the JSON file first
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((spritesheetData: any) => {
          // The spritesheet JSON should have a "meta" field with an "image" field.
          // The meta.image field should contain the name of an image resource
          // (not a file path). We'll use the image manager to get the texture.
          if (!spritesheetData.meta || !spritesheetData.meta.image) {
            throw new Error(
              `Spritesheet JSON missing 'meta.image' field for resource '${resource.name}'. ` +
                `The meta.image field should contain the name of an image resource.`
            );
          }

          // The meta.image field should contain the name of an image resource
          const imageResourceName = spritesheetData.meta.image;

          // Get or load the base texture from the image manager
          // Note: We need to ensure the image is loaded before creating the spritesheet
          this._imageManager
            .loadResource(imageResourceName)
            .then(() => {
              const baseTexture = this._imageManager.getOrLoadPIXITexture(
                imageResourceName
              );

              // Create the spritesheet
              const spritesheet = new PIXI.Spritesheet(
                baseTexture,
                spritesheetData
              );

              // Parse the spritesheet to generate all frame textures
              return spritesheet.parse().then(() => {
                this._loadedSpritesheets.set(resource, spritesheet);
                callback(null, spritesheet);
              });
            })
            .catch((error) => {
              callback(
                new Error(
                  `Failed to load image '${imageResourceName}' for spritesheet '${resource.name}': ${error}`
                )
              );
            });
        })
        .catch((error) => {
          callback(
            new Error(
              `Failed to load spritesheet JSON '${resource.name}': ${error}`
            )
          );
        });
    }

    /**
     * Check if the given spritesheet resource was loaded (preloaded or loaded with `load`).
     * @param resourceName The name of the spritesheet resource.
     * @returns true if the content of the spritesheet resource is loaded, false otherwise.
     */
    isLoaded(resourceName: string): boolean {
      return !!this._loadedSpritesheets.getFromName(resourceName);
    }

    /**
     * Get the Pixi Spritesheet for the given resource that is already loaded (preloaded or loaded with `load`).
     * If the resource is not loaded, `null` will be returned.
     * @param resourceName The name of the spritesheet resource.
     * @returns the Spritesheet of the spritesheet if loaded, `null` otherwise.
     */
    getSpritesheet(resourceName: string): PIXI.Spritesheet | null {
      return this._loadedSpritesheets.getFromName(resourceName);
    }

    /**
     * Get a texture for a specific frame from a spritesheet.
     * @param spritesheetResourceName The name of the spritesheet resource.
     * @param frameName The name of the frame within the spritesheet.
     * @returns The texture for the frame, or null if not found.
     */
    getFrameTexture(
      spritesheetResourceName: string,
      frameName: string
    ): PIXI.Texture | null {
      const spritesheet = this.getSpritesheet(spritesheetResourceName);
      if (!spritesheet) {
        return null;
      }

      return spritesheet.textures[frameName] || null;
    }

    private _getSpritesheetResource(resourceName: string): ResourceData | null {
      const resource = this._resourceLoader.getResource(resourceName);
      return resource && this.getResourceKinds().includes(resource.kind)
        ? resource
        : null;
    }

    /**
     * To be called when the game is disposed.
     * Clear the spritesheets loaded in this manager.
     */
    dispose(): void {
      this._loadedSpritesheets.clear();
      this._loadingSpritesheets.clear();
    }

    unloadResource(resourceData: ResourceData): void {
      const loadedSpritesheet = this._loadedSpritesheets.getFromName(
        resourceData.name
      );
      if (loadedSpritesheet) {
        // Destroy all textures in the spritesheet
        for (const textureName in loadedSpritesheet.textures) {
          const texture = loadedSpritesheet.textures[textureName];
          if (texture && !texture.destroyed) {
            texture.destroy();
          }
        }
        this._loadedSpritesheets.delete(resourceData);
      }

      const loadingSpritesheet = this._loadingSpritesheets.getFromName(
        resourceData.name
      );
      if (loadingSpritesheet) {
        loadingSpritesheet.then((spritesheet) => {
          for (const textureName in spritesheet.textures) {
            const texture = spritesheet.textures[textureName];
            if (texture && !texture.destroyed) {
              texture.destroy();
            }
          }
        });
        this._loadingSpritesheets.delete(resourceData);
      }
    }
  }
}
