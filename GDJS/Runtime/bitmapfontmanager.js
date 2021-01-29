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
  this._loadedFontsData = [];
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

  const fontCachePosition = this._fontTobeUnloaded.indexOf(name);
  if (fontCachePosition !== -1) {
    // The font is in the cache of unloaded font, because it was previously used and then marked as not used anymore.
    // Remove it from the cache to avoid the font getting unloaded.
    this._fontTobeUnloaded.splice(fontCachePosition, 1);
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
  // Reuse an existing bitmapFont that is already in memory and already installed
  for (var i = 0; i < this._loadedFontsData.length; ++i) {
    let loadedFontData = this._loadedFontsData[i];
    if (
      loadedFontData.fontResourceFileName === bitmapFontResourceName &&
      PIXI.BitmapFont.available[loadedFontData.fontName]
    ) {
      return PIXI.BitmapFont.available[loadedFontData.fontName];
    }
  }

  let bitmapFontResource = this._resources.find(function (resource) {
    return (
      resource.kind === 'bitmapFont' && resource.name === bitmapFontResourceName
    );
  });

  if (!bitmapFontResource) {
    console.warn(
      'Can\'t find resource with name: "' +
        bitmapFontResourceName +
        '" (or is not a bitmapFont file).'
    );

    if (!PIXI.BitmapFont.available['Arial-20-#ffffff-bitmapFont']) {
      let bitmapFontStyle = new PIXI.TextStyle();
      bitmapFontStyle.fontFamily = 'Arial';
      bitmapFontStyle.fontSize = 20;
      bitmapFontStyle.align = 'left';
      bitmapFontStyle.wordWrap = true;
      bitmapFontStyle.fill = '#ffffff';

      const defaultSlugFontName =
        bitmapFontStyle.fontFamily +
        '-' +
        bitmapFontStyle.fontSize +
        '-' +
        bitmapFontStyle.fill +
        '-bitmapFont';

      //Generate default bitmap font
      PIXI.BitmapFont.from(defaultSlugFontName, bitmapFontStyle, {
        chars: [
          [' ', '~'], // All the printable ASCII characters
        ],
      });
      PIXI.BitmapFont.available['Arial-20-#ffffff-bitmapFont'].font =
        'Arial-20-#ffffff-bitmapFont';

      console.warn('The default bitmap font Arial will be used.');
    }

    return PIXI.BitmapFont.available['Arial-20-#ffffff-bitmapFont']; // TODO retourné une font par default, le slug Arial par default ou alors une bitmapFont include par default dans GD?
  }

  for (var i = 0; i < this._loadedFontsData.length; ++i) {
    if (
      this._loadedFontsData[i].fontResourceFileName === bitmapFontResourceName
    ) {
      let fontData = this._loadedFontsData[i].fontData;
      let bitmapFont = PIXI.BitmapFont.install(fontData, texture);

      this.setFontUsed(bitmapFont.font);

      this._loadedFontsData[i].fontName = bitmapFont.font;
      return bitmapFont;
    }
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

  let bitmapFontResources = resources.filter(function (resource) {
    return resource.kind === 'bitmapFont' && !resource.disablePreload;
  });
  if (bitmapFontResources.length === 0)
    return onComplete(bitmapFontResources.length);

  var loaded = 0;
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

  for (var i = 0; i < bitmapFontResources.length; ++i) {
    let response = await fetch(bitmapFontResources[i].file)
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        console.log(
          "Can't fetch the bitmap font file " + bitmapFontResources[i].file + ", error: "+ error
        );
      });

      if(!response) return;
  

    let fontData = await response.text();

    this._loadedFontsData.push({
      fontResourceFileName: bitmapFontResources[i].name,
      fontData: fontData,
      fontName: '',
    });
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
