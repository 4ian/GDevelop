/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('PIXI Spritesheet manager');

  /**
   * The standard PixiJS/TexturePacker spritesheet JSON format.
   * This follows the format described at: https://pixijs.com/7.x/guides/components/sprite-sheets
   *
   * This interface extends PIXI.ISpritesheetData to ensure compatibility with PIXI.Spritesheet.
   */
  export interface SpritesheetJsonData extends PIXI.ISpritesheetData {
    // Optional: animations can be defined in the spritesheet JSON.
    // These are arrays of frame names that can be used to import entire animations.
    // Note: GDevelop's Direction/Animation classes could be extended to support
    // importing these animation definitions directly.
    // Example: animations: { "walk": ["walk1", "walk2", "walk3"], "idle": ["idle1", "idle2"] }
    meta: PIXI.ISpritesheetData['meta'] & {
      animations?: {
        [animationName: string]: string[];
      };
    };
  }

  const spritesheetKinds: ResourceKind[] = ['spritesheet'];

  /**
   * PixiSpritesheetManager loads and manages spritesheet JSON files and their associated
   * PIXI.Spritesheet objects. A spritesheet contains frame definitions that reference
   * regions within a texture atlas image.
   *
   * The spritesheet JSON format follows the standard PixiJS/TexturePacker format with:
   * - "frames": Object mapping frame names to their coordinates/dimensions in the atlas
   * - "meta": Object containing the texture image reference and optional metadata
   *
   * Usage flow:
   * 1. The spritesheet JSON resource is loaded and parsed
   * 2. The base texture (from meta.image) is obtained from the image manager
   * 3. A PIXI.Spritesheet is created and parsed to generate individual frame textures
   * 4. Frame textures can then be accessed by spritesheet resource name and frame name
   */
  export class PixiSpritesheetManager implements gdjs.ResourceManager {
    private _imageManager: gdjs.PixiImageManager;
    private _resourceLoader: gdjs.ResourceLoader;

    /**
     * Parsed spritesheet data (the raw JSON) for each spritesheet resource.
     */
    private _loadedSpritesheetData = new gdjs.ResourceCache<SpritesheetJsonData>();

    /**
     * PIXI.Spritesheet objects that have been created and parsed.
     */
    private _loadedPixiSpritesheets = new gdjs.ResourceCache<PIXI.Spritesheet>();

    /**
     * Promises for spritesheets that are currently being loaded.
     */
    private _loadingSpritesheets = new gdjs.ResourceCache<Promise<PIXI.Spritesheet>>();

    /**
     * @param resourceLoader The resources loader of the game.
     * @param imageManager The image manager of the game.
     */
    constructor(
      resourceLoader: gdjs.ResourceLoader,
      imageManager: gdjs.PixiImageManager
    ) {
      this._resourceLoader = resourceLoader;
      this._imageManager = imageManager;
    }

    getResourceKinds(): ResourceKind[] {
      return spritesheetKinds;
    }

    async processResource(resourceName: string): Promise<void> {
      // Do nothing because spritesheets are parsed during loading.
    }

    async loadResource(resourceName: string): Promise<void> {
      await this.getOrLoad(resourceName);
    }

    /**
     * Get the spritesheet resource data for the given resource name.
     */
    private _getSpritesheetResource(
      resourceName: string
    ): ResourceData | null {
      const resource = this._resourceLoader.getResource(resourceName);
      return resource && this.getResourceKinds().includes(resource.kind)
        ? resource
        : null;
    }

    /**
     * Returns the PIXI.Spritesheet for the given resource if already loaded,
     * or loads it if not yet available.
     *
     * @param resourceName The name of the spritesheet resource.
     * @returns A promise that resolves to the PIXI.Spritesheet.
     */
    getOrLoad(resourceName: string): Promise<PIXI.Spritesheet> {
      const resource = this._getSpritesheetResource(resourceName);

      if (!resource) {
        return Promise.reject(
          `Unable to find spritesheet resource '${resourceName}'.`
        );
      }

      // Check if already loaded
      const loadedSpritesheet = this._loadedPixiSpritesheets.get(resource);
      if (loadedSpritesheet) {
        return Promise.resolve(loadedSpritesheet);
      }

      // Check if loading is in progress
      let loadingPromise = this._loadingSpritesheets.get(resource);
      if (loadingPromise) {
        return loadingPromise;
      }

      // Start loading
      loadingPromise = this._loadSpritesheet(resource);
      this._loadingSpritesheets.set(resource, loadingPromise);

      return loadingPromise;
    }

    /**
     * Load and parse a spritesheet resource.
     */
    private async _loadSpritesheet(
      resource: ResourceData
    ): Promise<PIXI.Spritesheet> {
      try {
        // Fetch the JSON data
        const url = this._resourceLoader.getFullUrl(resource.file);
        const response = await fetch(url, {
          credentials: this._resourceLoader.checkIfCredentialsRequired(
            resource.file
          )
            ? 'include'
            : 'same-origin',
        });

        if (!response.ok) {
          throw new Error(
            `Failed to load spritesheet JSON: ${response.status} ${response.statusText}`
          );
        }

        const jsonData: SpritesheetJsonData = await response.json();
        this._loadedSpritesheetData.set(resource, jsonData);

        // Get the base texture from the image referenced in the spritesheet
        if (!jsonData.meta.image) {
          throw new Error(
            `Spritesheet JSON is missing the 'meta.image' field: ${resource.name}`
          );
        }

        const game = this._resourceLoader.getRuntimeGame();
        const imageResourceName = game.resolveEmbeddedResource(
          resource.name,
          jsonData.meta.image
        );

        // Ensure the image is loaded
        await this._imageManager.loadResource(imageResourceName);
        const baseTexture = this._imageManager.getPIXITexture(imageResourceName);

        if (!baseTexture || !baseTexture.valid) {
          throw new Error(
            `Failed to get base texture for spritesheet: ${imageResourceName}`
          );
        }

        // Create the PIXI.Spritesheet
        const spritesheet = new PIXI.Spritesheet(
          baseTexture.baseTexture,
          jsonData
        );

        // Parse the spritesheet to generate frame textures
        await spritesheet.parse();

        this._loadedPixiSpritesheets.set(resource, spritesheet);
        return spritesheet;
      } catch (error) {
        logger.error(
          `Error loading spritesheet '${resource.name}':`,
          error
        );
        throw error;
      }
    }

    /**
     * Check if the given spritesheet resource is loaded.
     * @param resourceName The name of the spritesheet resource.
     * @returns true if the spritesheet is loaded, false otherwise.
     */
    isLoaded(resourceName: string): boolean {
      return !!this._loadedPixiSpritesheets.getFromName(resourceName);
    }

    /**
     * Get the PIXI.Spritesheet for the given resource that is already loaded.
     * If the resource is not loaded, null will be returned.
     * @param resourceName The name of the spritesheet resource.
     * @returns The PIXI.Spritesheet if loaded, null otherwise.
     */
    getSpritesheet(resourceName: string): PIXI.Spritesheet | null {
      return this._loadedPixiSpritesheets.getFromName(resourceName);
    }

    /**
     * Get a specific frame texture from a loaded spritesheet.
     * @param resourceName The name of the spritesheet resource.
     * @param frameName The name of the frame within the spritesheet.
     * @returns The PIXI.Texture for the frame, or the invalid texture if not found.
     */
    getFrameTexture(
      resourceName: string,
      frameName: string
    ): PIXI.Texture {
      const spritesheet = this._loadedPixiSpritesheets.getFromName(resourceName);

      if (!spritesheet) {
        logger.warn(
          `Spritesheet '${resourceName}' is not loaded. Returning invalid texture.`
        );
        return this._imageManager.getInvalidPIXITexture();
      }

      const texture = spritesheet.textures[frameName];

      if (!texture) {
        logger.warn(
          `Frame '${frameName}' not found in spritesheet '${resourceName}'. Returning invalid texture.`
        );
        return this._imageManager.getInvalidPIXITexture();
      }

      return texture;
    }

    /**
     * Get the parsed JSON data for a loaded spritesheet.
     * @param resourceName The name of the spritesheet resource.
     * @returns The spritesheet JSON data, or null if not loaded.
     */
    getSpritesheetData(resourceName: string): SpritesheetJsonData | null {
      return this._loadedSpritesheetData.getFromName(resourceName);
    }

    /**
     * Get the list of frame names in a loaded spritesheet.
     * @param resourceName The name of the spritesheet resource.
     * @returns An array of frame names, or an empty array if not loaded.
     */
    getFrameNames(resourceName: string): string[] {
      const data = this._loadedSpritesheetData.getFromName(resourceName);
      if (!data) {
        return [];
      }
      return Object.keys(data.frames);
    }

    /**
     * Get the animation definitions from a loaded spritesheet.
     * These are optional arrays of frame names defined in the spritesheet JSON.
     *
     * Note: These animation definitions could be used to automatically import
     * animations into GDevelop's Direction/Animation classes. The format maps
     * animation names to arrays of frame names, e.g.:
     * { "walk": ["walk1", "walk2", "walk3"], "idle": ["idle1", "idle2"] }
     *
     * @param resourceName The name of the spritesheet resource.
     * @returns The animations object from the spritesheet, or null if not available.
     */
    getAnimations(
      resourceName: string
    ): { [animationName: string]: string[] } | null {
      const data = this._loadedSpritesheetData.getFromName(resourceName);
      if (!data || !data.meta.animations) {
        return null;
      }
      return data.meta.animations;
    }

    /**
     * To be called when the game is disposed.
     * Clear all loaded spritesheets.
     */
    dispose(): void {
      for (const spritesheet of this._loadedPixiSpritesheets.getAllValues()) {
        spritesheet.destroy(false); // Don't destroy base texture (image manager handles that)
      }
      this._loadedPixiSpritesheets.clear();
      this._loadedSpritesheetData.clear();
      this._loadingSpritesheets.clear();
    }

    unloadResource(resourceData: ResourceData): void {
      const spritesheet = this._loadedPixiSpritesheets.getFromName(
        resourceData.name
      );
      if (spritesheet) {
        spritesheet.destroy(false); // Don't destroy base texture (image manager handles that)
        this._loadedPixiSpritesheets.delete(resourceData);
      }

      this._loadedSpritesheetData.delete(resourceData);
      this._loadingSpritesheets.delete(resourceData);
    }
  }
}
