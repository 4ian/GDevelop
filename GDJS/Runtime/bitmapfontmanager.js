/*
 * GDevelop JS Platform
 * Copyright 2021-present Aurélien Vivet (bouh.vivez@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * BitmapFontManager loads fnt/xml files (using `fetch`), using the "bitmapFont" resource
 * registered in the game resources, and install the "bitmapFont" with PixiJS for using it with PIXI.BitmapText
 * @class BitmapFontManager
 * @memberof gdjs
 * @param {ResourceData[]} resources The resources data of the game.
 */
gdjs.BitmapFontManager = function (resources) {
  this._resources = resources;
  /** @type Object.<string, Object> */
  this._fontUsed = {};
  /** @type Array.<Object> */
  this._fontTobeUnloaded = [];
  this._loadedFontsData = {};
  this._defaultSlugFontName = ''; // Define once from styles in getDefaultBitmapFont()
};

gdjs.BitmapFontManager.prototype.getDefaultSlugFontName = function () {
  return this._defaultSlugFontName;
};

// Use element from PIXI.BitmapFont for generate a unique name and replace the original by the new one in PIXI.BitmapFont
gdjs.BitmapFontManager.prototype.generateSlugName = function (bitmapFont) {
  return bitmapFont.font + '-' + bitmapFont.size + '-' + bitmapFont.lineHeight;
};

// We patch the installed font to use a more complex name that includes the size of the font and line height,
// to avoid conflicts between different font files using the same font name.
gdjs.BitmapFontManager.prototype.patchInstalledBitmapFont = function (
  bitmapFont
) {
  const defaultName = bitmapFont.font;
  const fullSlugName = this.generateSlugName(bitmapFont);
  bitmapFont.font = fullSlugName;
  PIXI.BitmapFont.available[fullSlugName] = bitmapFont;

  delete PIXI.BitmapFont.available[defaultName];
  return PIXI.BitmapFont.available[fullSlugName];
};

gdjs.BitmapFontManager.prototype.getDefaultBitmapFont = function () {
  if (this._defaultSlugFontName !== '') {
    return PIXI.BitmapFont.available[this.getDefaultSlugFontName()];
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
  this.bitmapFont = this.patchInstalledBitmapFont(
    PIXI.BitmapFont.from(bitmapFontStyle.fontFamily, bitmapFontStyle, {
      chars: [
        [' ', '~'], // All the printable ASCII characters
      ],
    })
  );

  // Define the default name used for the default bitmap font.
  this._defaultSlugFontName = this.bitmapFont.font;
  return this.bitmapFont;
};

/**
 * Update the resources data of the game. Useful for hot-reloading, should not be used otherwise.
 * @param {ResourceData[]} resources The resources data of the game.
 */
gdjs.BitmapFontManager.prototype.setResources = function (resources) {
  this._resources = resources;
};

/**
 * When an object use an bitmapFont register the slug of the font and how many objects use it.
 * @param {string} name Slug of the bitmapFont
 */
gdjs.BitmapFontManager.prototype.setFontUsed = function (name) {
  this._fontUsed[name] = this._fontUsed[name] || { objectsUsingTheFont: 0 };
  this._fontUsed[name].objectsUsingTheFont++;

  const fontCache = this._fontTobeUnloaded[name];
  if (fontCache) {
    // The font is in the cache of unloaded font, because it was previously used and then marked as not used anymore.
    // Remove it from the cache to avoid the font getting unloaded.
    delete this._fontTobeUnloaded.name;
  }
};

/**
 * When an bitmapText object is removed, decrease the count of objects related to the font in the manager.
 * When a font is not unused anymore, it goes in a temporary cache. The cache holds up to 10 fonts.
 * If the cache reaches its maximum capacity, the oldest font is unloaded from memory.
 * @param {string} name Slug of the bitmapFont
 */
gdjs.BitmapFontManager.prototype.removeFontUsed = function (name) {
  if (!this._fontUsed[name]) {
    // We tried to remove font that was never marked as used.
    console.error(
      'BitmapFont with name ' +
        name +
        ' was tried to be removed but was never marked as used.'
    );
    return;
  }

  this._fontUsed[name].objectsUsingTheFont--;

  if (this._fontUsed[name].objectsUsingTheFont <= 0) {
    delete this._fontUsed[name];

    // Add the font name at the last position of the cache.
    if (!this._fontTobeUnloaded.includes(name))
      this._fontTobeUnloaded.push(name);

    if (this._fontTobeUnloaded.length > 10) {
      // Remove the first font (i.e: the oldest one)
      const oldestUnloadedFont = this._fontTobeUnloaded.shift();
      PIXI.BitmapFont.uninstall(oldestUnloadedFont);
      console.log('Uninstall bitmapFont: ' + oldestUnloadedFont);
    }
  }
};

/**
 * @param {string} bitmapFontResourceName
 * @param {PIXI.Texture} texture
 * @returns {PIXI.BitmapFont}
 */
gdjs.BitmapFontManager.prototype.getBitmapFontFromData = function (
  bitmapFontResourceName,
  texture
) {
  // Reuse an existing bitmapFont that is already in memory and already installed.
  if (this._loadedFontsData[bitmapFontResourceName]) {
    const fontName = this._loadedFontsData[bitmapFontResourceName].bitmapFont
      .font;
    return PIXI.BitmapFont.available[fontName];
  }

  // Otherwise check in resources if the resource exist and is a bitmap font file.
  let bitmapFontResource = this._resources.find(function (resource) {
    return (
      resource.kind === 'bitmapFont' && resource.name === bitmapFontResourceName
    );
  });

  //A resource file was given, but the resource doesn't exist or isn't a bitmap font file.
  if (bitmapFontResourceName !== '' && !bitmapFontResource) {
    console.warn(
      'Unable to find bitmap font for resource "' +
        bitmapFontResourceName +
        '" (or is not a bitmapFont file).'
    );
  }

  // There is no bitmap font file or resource related to this resource name.
  if (!bitmapFontResource || bitmapFontResourceName === '') {
    // We the default Arial bitmap font
    return this.getDefaultBitmapFont();
  }

  // Is case of a resource file is found and is a bitmap font file and this file was preloaded
  if (
    this._loadedFontsData[bitmapFontResourceName].fontResourceFileName ===
    bitmapFontResourceName
  ) {
    // Get the fontData of this resource, install the bitmap font and patch the fontName.
    const fontData = this._loadedFontsData[bitmapFontResourceName].fontData;
    const bitmapFont = this.patchInstalledBitmapFont(
      PIXI.BitmapFont.install(fontData, texture)
    );

    // Finally save the bitmap font previously patched and return it.
    this._loadedFontsData[bitmapFontResourceName].bitmapFont = bitmapFont;
    return this._loadedFontsData[bitmapFontResourceName].bitmapFont;
  }
};

/**
 * Check if a bitmap font exist by this name.
 * The font name is defined in the font file (.fnt/.xml)
 * @param {string} fontName Name of the bitmap font
 */
gdjs.BitmapFontManager.prototype.isBitmapFontLoaded = function (fontName) {
  return !!PIXI.BitmapFont.available[fontName];
};

gdjs.BitmapFontManager.prototype.preloadBitmapFontData = async function (
  onProgress,
  onComplete
) {
  let resources = this._resources;

  const bitmapFontResources = resources.filter(function (resource) {
    return resource.kind === 'bitmapFont' && !resource.disablePreload;
  });
  if (bitmapFontResources.length === 0)
    return onComplete(bitmapFontResources.length);

  let loaded = 0;
  /** @type BitmapFontManagerRequestCallback */
  var onLoad = function (error) {
    if (error) {
      console.error('Error while preloading a bitmapFont resource:' + error);
    }

    loaded++;
    if (loaded === bitmapFontResources.length) {
      onComplete(bitmapFontResources.length);
    } else {
      onProgress(loaded, bitmapFontResources.length);
    }
  };

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

    if (!response) return;

    const fontData = await response.text();

    this._loadedFontsData[bitmapFontResources[i].name] = {
      fontResourceFileName: bitmapFontResources[i].name,
      fontData: fontData,
      bitmapFont: {},
    };
    onLoad();
  }
};

/**
 * The callback called when a bitmap font that was requested is loaded (or an error occured).
 * @callback BitmapFontManagerRequestCallback
 * @param {?Error} error The error, if any. `null` otherwise.
 * @param {?Object} jsonContent The content of the json file (or null if an error occured).
 * @returns {void} Nothing
 */
