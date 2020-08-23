// @ts-check
/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * FontFaceObserverFontManager loads fonts (using `FontFace` or `fontfaceobserver` library)
 * from the game resources (see `loadFonts`), and allow to access to
 * the font families of the loaded fonts during the game (see `getFontFamily`).
 *
 * @class FontFaceObserverFontManager
 * @memberof gdjs
 * @param {ResourceData[]} resources The resources data of the game.
 */
gdjs.FontFaceObserverFontManager = function (resources) {
  this._resources = resources;

  /** @type {Object.<string, string>} */
  this._loadedFontFamily = {}; // Associate font resource names to the loaded font family

  /** @type {Object.<string, ResourceData>} */
  this._loadedFonts = {}; // Associate font resource names to the resources, for faster access

  /** @type {Object.<string, string>} */
  this._filenameToFontFamily = {}; // Cache the result of transforming a filename to a font family - useful to avoid duplicates.
};

gdjs.FontManager = gdjs.FontFaceObserverFontManager; //Register the class to let the engine use it.

/**
 * Update the resources data of the game. Useful for hot-reloading, should not be used otherwise.
 *
 * @param {ResourceData[]} resources The resources data of the game.
 */
gdjs.FontFaceObserverFontManager.prototype.setResources = function(resources) {
    this._resources = resources;
};

/**
 * Return the font family associated to the specified font resource name.
 * The font resource must have been loaded before. If that's not the case,
 * a default font family will be returned ("Arial").
 *
 * @param {string} resourceName The name of the resource to get.
 * @returns {string} The font family to be used for this font resource,
 * or "Arial" if not loaded.
 */
gdjs.FontFaceObserverFontManager.prototype.getFontFamily = function (
  resourceName
) {
  if (this._loadedFontFamily[resourceName]) {
    return this._loadedFontFamily[resourceName];
  }

  return 'Arial';
};

/**
 * Return the font file associated to the specified font resource name.
 * The font resource must have been loaded before. If that's not the case,
 * the resource name will be returned (to
 * keep compatibility with GDevelop 5.0-beta56 and previous).
 *
 * Should only be useful for renderers running on a non HTML5/non browser environment.
 *
 * @param {string} resourceName The name of the resource to get.
 * @returns {string} The file of the font resource.
 */
gdjs.FontFaceObserverFontManager.prototype.getFontFile = function (
  resourceName
) {
  if (this._loadedFonts[resourceName]) {
    return this._loadedFonts[resourceName].file || '';
  }

  return resourceName;
};

/**
 * Return the font family to use for a given filename.
 * Each filename is guaranteed to have a unique font family. You should not rely
 * on the font family formatting (consider it as an "opaque string") - it's slugified
 * (no spaces, no dots, no non-alphanumeric characters) to avoid issues when using the
 * font family in various contexts.
 *
 * @param {string} filename The filename of the font.
 * @returns {string} The font family to be used for this font resource.
 */
gdjs.FontFaceObserverFontManager.prototype._getFontFamilyFromFilename = function (
  filename
) {
  if (this._filenameToFontFamily[filename]) {
    return this._filenameToFontFamily[filename];
  }

  // Replaces all non-alphanumeric characters with dashes to ensure no issues when
  // refering to this font family (see https://github.com/4ian/GDevelop/issues/1521).
  var baseSlugifiedName = 'gdjs_font_' + filename.toLowerCase().replace(/[^\w]/gi, '-');

  // Ensure the generated font family is unique.
  var slugifiedName = baseSlugifiedName;
  var uniqueSuffix = 2;
  while (!!this._filenameToFontFamily[baseSlugifiedName]) {
    baseSlugifiedName = baseSlugifiedName + '-' + uniqueSuffix;
    uniqueSuffix++;
  }

  // Cache the result to avoid collision with a similar slugified name for another filename.
  return (this._filenameToFontFamily[filename] = slugifiedName);
};

/**
 * Load the font at the given `src` location (relative to the project), giving
 * it the specified `fontFamily` name.
 *
 * This uses FontFace (if supported) or @font-face + FontFaceObserver
 * to load a font from an url and be notified when loading is done (or failed).
 *
 * @param {string} fontFamily The font
 * @returns {Promise<void>} The font family to be used for this font resource.
 */
gdjs.FontFaceObserverFontManager._loadFont = function (fontFamily, src) {
  var descriptors = {};
  var srcWithUrl = 'url(' + encodeURI(src) + ')';
  // @ts-ignore
  if (typeof FontFace !== 'undefined') {
    // Load the given font using CSS Font Loading API.
    // @ts-ignore
    var fontFace = new FontFace(fontFamily, srcWithUrl, descriptors);
    // @ts-ignore
    document.fonts.add(fontFace);
    return fontFace.load();
  } else {
    // Add @font-face and use FontFaceObserver to be notified when the
    // font is ready.
    var newStyle = document.createElement('style');
    newStyle.appendChild(
      document.createTextNode(
        "@font-face { font-family: '" +
          fontFamily +
          "'; src: " +
          srcWithUrl +
          '; }'
      )
    );

    document.head.appendChild(newStyle);
    // @ts-ignore
    return new FontFaceObserver(fontFamily, descriptors).load();
  }
};

/**
 * Load the specified resources, so that fonts are loaded and can then be
 * used by using the font family returned by getFontFamily.
 * @param onProgress Callback called each time a new file is loaded.
 * @param onComplete Callback called when loading is done.
 */
gdjs.FontFaceObserverFontManager.prototype.loadFonts = function (
  onProgress,
  onComplete
) {
  var resources = this._resources;

  // Construct the list of files to be loaded.
  // For one loaded file, it can have one or more resources
  // that use it.
  /** @type {Object.<string, Array<ResourceData>>} */
  var filesResources = {};
  for (var i = 0, len = resources.length; i < len; ++i) {
    var res = resources[i];
    if (res.file && res.kind === 'font') {
      if (!!this._loadedFonts[res.name]) {
        continue;
      }

      filesResources[res.file] = filesResources[res.file]
        ? filesResources[res.file].concat(res)
        : [res];
    }
  }

  var totalCount = Object.keys(filesResources).length;
  if (totalCount === 0) return onComplete(totalCount); //Nothing to load.

  var loadingCount = 0;
  var that = this;
  var onFontLoaded =
    /**
     * @param {string} fontFamily
     * @param {ResourceData[]} fontResources
     */
    function (fontFamily, fontResources) {
      fontResources.forEach(function (resource) {
        that._loadedFontFamily[resource.name] = fontFamily;
        that._loadedFonts[resource.name] = resource;
      });

      loadingCount++;
      onProgress(loadingCount, totalCount);
      if (loadingCount === totalCount) onComplete(totalCount);
    };

  Object.keys(filesResources).forEach(function (file) {
    var fontFamily = that._getFontFamilyFromFilename(file);
    var fontResources = filesResources[file];
    gdjs.FontFaceObserverFontManager._loadFont(fontFamily, file).then(
      function () {
        onFontLoaded(fontFamily, fontResources);
      },
      function (error) {
        console.error(
          'Error loading font resource "' +
            fontResources[0].name +
            '" (file: ' +
            file +
            '): ' +
            (error.message || 'Unknown error')
        );
        onFontLoaded(fontFamily, fontResources);
      }
    );
  });
};
