/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * FontFaceObserverFontManager loads fonts (using fontfaceobserver library)
 * from the game resources (see `loadFonts`), and allow to access to
 * the font families of the loaded fonts during the game (see `getFontFamily`).
 *
 * "@font-face" declarations must be have been added separately in the index.html
 * (or any CSS file).
 *
 * @class FontFaceObserverFontManager
 * @memberof gdjs
 * @param {Object} resources The resources data of the game.
 */
gdjs.FontFaceObserverFontManager = function(resources)
{
    this._resources = resources;
    this._loadedFontFamily = {}; // Associate font resource names to the loaded font family
    this._loadedFonts = {}; // Associate font resource names to the resources, for faster access
};

gdjs.FontManager = gdjs.FontFaceObserverFontManager; //Register the class to let the engine use it.

/**
 * Return the font family associated to the specified font resource name.
 * The font resource must have been loaded before. If that's not the case,
 * a font family will be returned but without guarantee of it being loaded (to
 * keep compatibility with GDevelop 5.0-beta56 and previous).
 *
 * @param {string} resourceName The name of the resource to get.
 * @returns {string} The font family to be used for this font resource,
 * or "Arial" if `resourceName` is empty.
 */
gdjs.FontFaceObserverFontManager.prototype.getFontFamily = function(resourceName) {
    if (this._loadedFontFamily[resourceName]) {
        return this._loadedFontFamily[resourceName];
    }

    return resourceName ?
        gdjs.FontFaceObserverFontManager._getFontFamilyFromFilename(resourceName) :
        'Arial';
}

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
gdjs.FontFaceObserverFontManager.prototype.getFontFile = function(resourceName) {
    if (this._loadedFonts[resourceName]) {
        return this._loadedFonts[resourceName].file || '';
    }

    return resourceName;
}

/**
 * Return the font family for a given filename.
 * Should be kept in sync with the declaration of "@font-face" during exports.
 *
 * @private
 * @param {string} filename The filename of the font
 * @returns {string} The font family to be used for this font resource.
 */
gdjs.FontFaceObserverFontManager._getFontFamilyFromFilename = function(filename) {
    return "gdjs_font_" + filename;
}

/**
 * Load the specified resources, so that fonts are loaded and can then be
 * used by using the font family returned by getFontFamily.
 * @param onProgress Callback called each time a new file is loaded.
 * @param onComplete Callback called when loading is done.
 * @param resources The resources to be loaded. If not specified, will load the resources
 * specified in the FontFaceObserverFontManager constructor.
 */
gdjs.FontFaceObserverFontManager.prototype.loadFonts = function(onProgress, onComplete, resources) {
	resources = resources || this._resources;

	//Construct the list of files to be loaded.
	//For one loaded file, it can have one or more resources
	//that use it.
    var filesResources = {};
	for(var i = 0, len = resources.length;i<len;++i) {
		var res = resources[i];
        if ( res.file && res.kind === "font" ) {
            filesResources[res.file] = filesResources[res.file] ? filesResources[res.file].concat(res) : [res];
        }
    }

    var totalCount = Object.keys(filesResources).length;
    if (totalCount === 0)
    	return onComplete(totalCount); //Nothing to load.

    var loadingCount = 0;
    var that = this;
    var onFontLoaded = function(fontFamily, resources) {
        resources.forEach(function(resource) {
            that._loadedFontFamily[resource.name] = fontFamily;
            that._loadedFonts[resource.name] = resource;
        });

        loadingCount++;
        onProgress(loadingCount, totalCount);
        if (loadingCount === totalCount) onComplete(totalCount);
    }

    Object.keys(filesResources).forEach(function(file) {
        var fontFamily = gdjs.FontFaceObserverFontManager._getFontFamilyFromFilename(file);
        var resources = filesResources[file];
        new FontFaceObserver(fontFamily).load().then(function() {
            onFontLoaded(fontFamily, resources);
        }, function() {
            console.error("Error loading font resource \"" + resources[0].name + "\" (file: " + file + ")");
            onFontLoaded(fontFamily, resources);
        });
    });
}
