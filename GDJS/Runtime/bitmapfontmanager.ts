/*
 * GDevelop JS Platform
 * Copyright 2021-present Aurélien Vivet (bouh.vivez@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * We patch the installed font to use a more complex name that includes the size of the font and line height,
   * to avoid conflicts between different font files using the same font name.
   */
  const patchInstalledBitmapFont = (bitmapFont: PIXI.BitmapFont) => {
    const generateSlugName = (bitmapFont) => {
      return (
        bitmapFont.font + '-' + bitmapFont.size + '-' + bitmapFont.lineHeight
      );
    };

    const defaultName = bitmapFont.font;
    const fullSlugName = generateSlugName(bitmapFont);
    // @ts-ignore - we "hack" into Pixi to change the font name
    bitmapFont.font = fullSlugName;
    PIXI.BitmapFont.available[fullSlugName] = bitmapFont;
    delete PIXI.BitmapFont.available[defaultName];
    return PIXI.BitmapFont.available[fullSlugName];
  };

  /**
   * BitmapFontManager loads fnt/xml files (using `fetch`), from the "bitmapFont" resources of the game.
   *
   * It installs the "Bitmap Font" with PixiJS to be used with PIXI.BitmapText.
   */
  export class BitmapFontManager {
    private _resources: ResourceData[];

    /** Pixi.BitmapFont used, indexed by their BitmapFont name. */
    private _pixiBitmapFontsInUse: Record<
      string,
      { objectsUsingTheFont: number }
    > = {};

    /** Pixi.BitmapFont not used anymore, but not yet uninstalled, indexed by their BitmapFont name. */
    private _pixiBitmapFontsToUninstall: string[] = [];

    /** Loaded fonts data, indexed by resource name. */
    private _loadedFontsData: Record<string, any> = {};

    /** Installed Pixi.BitmapFont, indexed by resource name. */
    private _installedPixiBitmapFont: Record<string, PIXI.BitmapFont> = {};

    private _defaultSlugFontName: string | null = null;

    /**
     * @param resources The resources data of the game.
     */
    constructor(resources: ResourceData[]) {
      this._resources = resources;
    }

    /**
     * Get the instance of the default `Pixi.BitmapFont`, always available.
     */
    getDefaultBitmapFont() {
      if (this._defaultSlugFontName !== null) {
        return PIXI.BitmapFont.available[this._defaultSlugFontName];
      }

      // Default bitmap font style
      const bitmapFontStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 20,
        padding: 5,
        align: 'left',
        fill: '#ffffff',
        wordWrap: true,
        lineHeight: 20,
      });

      // Generate default bitmapFont, and replace the name of PIXI.BitmapFont by a unique name
      const defaultBitmapFont = patchInstalledBitmapFont(
        // @ts-ignore
        PIXI.BitmapFont.from(bitmapFontStyle.fontFamily, bitmapFontStyle, {
          // All the printable ASCII characters
          chars: [[' ', '~']],
        })
      );

      // Define the default name used for the default bitmap font.
      this._defaultSlugFontName = defaultBitmapFont.font;
      return defaultBitmapFont;
    }

    /**
     * Update the resources data of the game. Useful for hot-reloading, should not be used otherwise.
     * @param resources The resources data of the game.
     */
    setResources(resources: ResourceData[]): void {
      this._resources = resources;
    }

    /**
     * When an object use a BitmapFont, call this function to register the slug of the font and how many objects use it.
     * @param pixiBitmapFontName Name of the font of the BitmapFont (`bitmapFont.font`)
     */
    setFontUsed(pixiBitmapFontName: string): void {
      this._pixiBitmapFontsInUse[pixiBitmapFontName] = this
        ._pixiBitmapFontsInUse[pixiBitmapFontName] || {
        objectsUsingTheFont: 0,
      };
      this._pixiBitmapFontsInUse[pixiBitmapFontName].objectsUsingTheFont++;

      for (let i = 0; i < this._pixiBitmapFontsToUninstall.length; ) {
        if (this._pixiBitmapFontsToUninstall[i] === pixiBitmapFontName) {
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
     * @param pixiBitmapFontName Name of the font of the BitmapFont (`bitmapFont.font`)
     */
    removeFontUsed(pixiBitmapFontName: string) {
      if (!this._pixiBitmapFontsInUse[pixiBitmapFontName]) {
        // We tried to remove font that was never marked as used.
        console.error(
          'BitmapFont with name ' +
            pixiBitmapFontName +
            ' was tried to be removed but was never marked as used.'
        );
        return;
      }
      this._pixiBitmapFontsInUse[pixiBitmapFontName].objectsUsingTheFont--;
      if (
        this._pixiBitmapFontsInUse[pixiBitmapFontName].objectsUsingTheFont === 0
      ) {
        delete this._pixiBitmapFontsInUse[pixiBitmapFontName];

        // Add the font name at the last position of the cache.
        if (!this._pixiBitmapFontsToUninstall.includes(pixiBitmapFontName)) {
          this._pixiBitmapFontsToUninstall.push(pixiBitmapFontName);
        }
        if (this._pixiBitmapFontsToUninstall.length > 10) {
          // Remove the first font (i.e: the oldest one)
          const oldestUnloadedPixiBitmapFontName = this._pixiBitmapFontsToUninstall.shift() as string;
          PIXI.BitmapFont.uninstall(oldestUnloadedPixiBitmapFontName);
          console.log(
            'Uninstalled Bitmap Font from memory: ' +
              oldestUnloadedPixiBitmapFontName
          );
        }
      }
    }

    getBitmapFontFromData(
      bitmapFontResourceName: string,
      texture: PIXI.Texture
    ): PIXI.BitmapFont {
      // Return the existing Bitmap Font that is already in memory and already installed.
      if (this._installedPixiBitmapFont[bitmapFontResourceName]) {
        return this._installedPixiBitmapFont[bitmapFontResourceName];
      }

      // The Bitmap Font is not loaded, load it in memory.
      // First get the font data:
      const fontData = this._loadedFontsData[bitmapFontResourceName];
      if (!fontData) {
        console.warn(
          'Could not find Bitmap Font for resource named "' +
            bitmapFontResourceName +
            '". The default font will be used.'
        );
        return this.getDefaultBitmapFont();
      }

      try {
        // Create and install the Pixi.BitmapFont in memory:
        const bitmapFont = patchInstalledBitmapFont(
          PIXI.BitmapFont.install(fontData, texture)
        );

        return (this._installedPixiBitmapFont[
          bitmapFontResourceName
        ] = bitmapFont);
      } catch (error) {
        console.warn(
          'Could not load the Bitmap Font for resource named "' +
            bitmapFontResourceName +
            '". The default font will be used. Error is: ' +
            error
        );
        return this.getDefaultBitmapFont();
      }
    }

    async preloadBitmapFontData(onProgress, onComplete) {
      let resources = this._resources;
      const bitmapFontResources = resources.filter(function (resource) {
        return resource.kind === 'bitmapFont' && !resource.disablePreload;
      });
      if (bitmapFontResources.length === 0) {
        return onComplete(bitmapFontResources.length);
      }
      let loaded = 0;

      function onLoad(error) {
        if (error) {
          console.error(
            'Error while preloading a bitmapFont resource:' + error
          );
        }
        loaded++;
        if (loaded === bitmapFontResources.length) {
          onComplete(bitmapFontResources.length);
        } else {
          onProgress(loaded, bitmapFontResources.length);
        }
      }
      for (let i = 0; i < bitmapFontResources.length; ++i) {
        const response = await fetch(bitmapFontResources[i].file)
          .then(function (response) {
            return response;
          })
          .catch(function (error) {
            console.error(
              "Can't fetch the bitmap font file " +
                bitmapFontResources[i].file +
                ', error: ' +
                error
            );
          });
        if (!response) {
          return;
        }
        const fontData = await response.text();
        this._loadedFontsData[bitmapFontResources[i].name] = fontData;
        onLoad(null);
      }
    }
  }
}
