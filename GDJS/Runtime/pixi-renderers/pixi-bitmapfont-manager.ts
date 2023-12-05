/*
 * GDevelop JS Platform
 * Copyright 2021-present Aurélien Vivet (bouh.vivez@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Bitmap text');

  const defaultBitmapFontKey = 'GDJS-DEFAULT-BITMAP-FONT';

  // When a font is unused, we put it in a cache of unused fonts. It's unloaded
  // from memory only when the cache is full and the font is at the last position
  // in the cache.
  // Set this to 0 to unload from memory ("uninstall") as soon as a font is unused.
  const uninstallCacheSize = 5;

  /**
   * We patch the installed font to use a name that is unique for each font data and texture,
   * to avoid conflicts between different font files using the same font name (by default, the
   * font name used by Pixi is the one inside the font data, but this name is not necessarily unique.
   * For example, 2 resources can use the same font, or we can have multiple objects with the same
   * font data and different textures).
   */
  const patchInstalledBitmapFont = (
    bitmapFont: PIXI.BitmapFont,
    bitmapFontInstallKey: string
  ) => {
    const defaultName = bitmapFont.font;
    // @ts-ignore - we "hack" into Pixi to change the font name
    bitmapFont.font = bitmapFontInstallKey;
    PIXI.BitmapFont.available[bitmapFontInstallKey] = bitmapFont;
    delete PIXI.BitmapFont.available[defaultName];
    return PIXI.BitmapFont.available[bitmapFontInstallKey];
  };

  const resourceKinds: Array<ResourceKind> = ['bitmapFont'];

  /**
   * PixiBitmapFontManager loads fnt/xml files (using `fetch`), from the "bitmapFont" resources of the game.
   *
   * It installs the "BitmapFont" with PixiJS to be used with PIXI.BitmapText.
   */
  export class PixiBitmapFontManager implements gdjs.ResourceManager {
    private _imageManager: gdjs.PixiImageManager;

    /** Pixi.BitmapFont used, indexed by their BitmapFont name. */
    private _pixiBitmapFontsInUse: Record<
      string,
      { objectsUsingTheFont: number }
    > = {};

    /** Pixi.BitmapFont not used anymore, but not yet uninstalled, indexed by their BitmapFont name. */
    private _pixiBitmapFontsToUninstall: string[] = [];

    /** Loaded fonts data, indexed by resource name. */
    private _loadedFontsData = new gdjs.ResourceCache<any>();

    private _defaultSlugFontName: string | null = null;

    _resourceLoader: gdjs.ResourceLoader;

    /**
     * @param resourceDataArray The resources data of the game.
     * @param resourceLoader The resources loader of the game.
     * @param imageManager The image manager to be used to get textures used by fonts.
     */
    constructor(
      resourceLoader: gdjs.ResourceLoader,
      imageManager: gdjs.PixiImageManager
    ) {
      this._imageManager = imageManager;
      this._resourceLoader = resourceLoader;
    }

    getResourceKinds(): ResourceKind[] {
      return resourceKinds;
    }

    /**
     * Get the instance of the default `Pixi.BitmapFont`, always available.
     */
    getDefaultBitmapFont() {
      if (this._defaultSlugFontName !== null) {
        return PIXI.BitmapFont.available[this._defaultSlugFontName];
      }

      // Default bitmap font style
      const fontFamily = 'Arial';
      const bitmapFontStyle = new PIXI.TextStyle({
        fontFamily: fontFamily,
        fontSize: 20,
        padding: 5,
        align: 'left',
        fill: '#ffffff',
        wordWrap: true,
        lineHeight: 20,
      });

      // Generate default bitmapFont, and replace the name of PIXI.BitmapFont by a unique name
      const defaultBitmapFont = patchInstalledBitmapFont(
        PIXI.BitmapFont.from(fontFamily, bitmapFontStyle, {
          // All the printable ASCII characters
          chars: [[' ', '~']],
        }),
        defaultBitmapFontKey
      );

      // Define the default name used for the default bitmap font.
      this._defaultSlugFontName = defaultBitmapFont.font;
      return defaultBitmapFont;
    }

    /**
     * Called to specify that the bitmap font with the specified key is used by an object
     * (i.e: this is reference counting).
     * `releaseBitmapFont` *must* be called to mark the font as not used anymore when the
     * object is destroyed or its font changed.
     *
     * @param bitmapFontInstallKey Name of the font of the BitmapFont (`bitmapFont.font`)
     */
    private _markBitmapFontAsUsed(bitmapFontInstallKey: string): void {
      this._pixiBitmapFontsInUse[bitmapFontInstallKey] = this
        ._pixiBitmapFontsInUse[bitmapFontInstallKey] || {
        objectsUsingTheFont: 0,
      };
      this._pixiBitmapFontsInUse[bitmapFontInstallKey].objectsUsingTheFont++;

      for (let i = 0; i < this._pixiBitmapFontsToUninstall.length; ) {
        if (this._pixiBitmapFontsToUninstall[i] === bitmapFontInstallKey) {
          // The font is in the cache of fonts to uninstall, because it was previously used and then marked as not used anymore.
          // Remove it from the cache to avoid the font getting uninstalled.
          this._pixiBitmapFontsToUninstall.splice(i, 1);
        } else {
          i++;
        }
      }
    }

    /**
     * When a font is not used by an object anymore (object destroyed or font changed),
     * call this function to decrease the internal count of objects using the font.
     *
     * When a font is not unused anymore, it goes in a temporary cache. The cache holds up to 10 fonts.
     * If the cache reaches its maximum capacity, the oldest font is uninstalled from memory.
     *
     * @param bitmapFontInstallKey Name of the font of the BitmapFont (`bitmapFont.font`)
     */
    releaseBitmapFont(bitmapFontInstallKey: string) {
      if (bitmapFontInstallKey === defaultBitmapFontKey) {
        // Never uninstall the default font.
        return;
      }

      if (!this._pixiBitmapFontsInUse[bitmapFontInstallKey]) {
        logger.warn(
          'BitmapFont with name ' +
            bitmapFontInstallKey +
            ' was tried to be released but was never marked as used.'
        );
        return;
      }
      this._pixiBitmapFontsInUse[bitmapFontInstallKey].objectsUsingTheFont--;

      if (
        this._pixiBitmapFontsInUse[bitmapFontInstallKey].objectsUsingTheFont ===
        0
      ) {
        delete this._pixiBitmapFontsInUse[bitmapFontInstallKey];

        // Add the font name at the last position of the cache.
        if (!this._pixiBitmapFontsToUninstall.includes(bitmapFontInstallKey)) {
          this._pixiBitmapFontsToUninstall.push(bitmapFontInstallKey);
        }
        if (this._pixiBitmapFontsToUninstall.length > uninstallCacheSize) {
          // Remove the first font (i.e: the oldest one)
          const oldestUnloadedPixiBitmapFontName = this._pixiBitmapFontsToUninstall.shift() as string;

          PIXI.BitmapFont.uninstall(oldestUnloadedPixiBitmapFontName);
          logger.log(
            'Bitmap Text',
            'Uninstalled BitmapFont "' +
              oldestUnloadedPixiBitmapFontName +
              '" from memory.'
          );
        }
      }
    }

    /**
     * Given a bitmap font resource name and a texture atlas resource name, returns the PIXI.BitmapFont
     * for it.
     * The font is register and should be released with `releaseBitmapFont` - so that it can be removed
     * from memory when unused.
     */
    obtainBitmapFont(
      bitmapFontResourceName: string,
      textureAtlasResourceName: string
    ): PIXI.BitmapFont {
      const bitmapFontInstallKey =
        bitmapFontResourceName + '@' + textureAtlasResourceName;

      if (PIXI.BitmapFont.available[bitmapFontInstallKey]) {
        // Return the existing BitmapFont that is already in memory and already installed.
        this._markBitmapFontAsUsed(bitmapFontInstallKey);
        return PIXI.BitmapFont.available[bitmapFontInstallKey];
      }

      // The Bitmap Font is not loaded, load it in memory.

      // First get the font data:
      const fontData = this._loadedFontsData.getFromName(
        bitmapFontResourceName
      );
      if (!fontData) {
        logger.warn(
          'Could not find Bitmap Font for resource named "' +
            bitmapFontResourceName +
            '". The default font will be used.'
        );
        return this.getDefaultBitmapFont();
      }

      // Get the texture to be used in the font:
      const texture = this._imageManager.getPIXITexture(
        textureAtlasResourceName
      );

      try {
        // Create and install the Pixi.BitmapFont in memory:
        const bitmapFont = patchInstalledBitmapFont(
          PIXI.BitmapFont.install(fontData, texture),
          bitmapFontInstallKey
        );
        this._markBitmapFontAsUsed(bitmapFontInstallKey);
        return bitmapFont;
      } catch (error) {
        logger.error(
          'Could not load the Bitmap Font for resource named "' +
            bitmapFontResourceName +
            '". The default font will be used. Error is: ' +
            error
        );
        return this.getDefaultBitmapFont();
      }
    }

    async processResource(resourceName: string): Promise<void> {
      // Do nothing because fonts are light enough to be parsed in background.
    }

    /**
     * Load the "bitmapFont" resources of the game, so that they are ready
     * to be used when `obtainBitmapFont` is called.
     */
    async loadResource(resourceName: string): Promise<void> {
      const resource = this._resourceLoader.getResource(resourceName);
      if (!resource) {
        logger.warn(
          'Unable to find bitmap font for resource "' + resourceName + '".'
        );
        return;
      }
      if (this._loadedFontsData.get(resource)) {
        return;
      }

      try {
        const response = await fetch(
          this._resourceLoader.getFullUrl(resource.file),
          {
            credentials: this._resourceLoader.checkIfCredentialsRequired(
              resource.file
            )
              ? // Any resource stored on the GDevelop Cloud buckets needs the "credentials" of the user,
                // i.e: its gdevelop.io cookie, to be passed.
                'include'
              : // For other resources, use "same-origin" as done by default by fetch.
                'same-origin',
          }
        );
        const fontData = await response.text();
        this._loadedFontsData.set(resource, fontData);
      } catch (error) {
        logger.error(
          "Can't fetch the bitmap font file " +
            resource.file +
            ', error: ' +
            error
        );
      }
    }
  }

  // Register the class to let the engine use it.
  export const BitmapFontManager = gdjs.PixiBitmapFontManager;
  export type BitmapFontManager = gdjs.PixiBitmapFontManager;
}
