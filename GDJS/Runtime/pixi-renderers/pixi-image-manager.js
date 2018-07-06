/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * PixiImageManager loads and stores textures that can be used by the Pixi.js renderers.
 *
 * @class PixiImageManager
 * @memberof gdjs
 * @param {Object} resources The resources data of the game.
 */
gdjs.PixiImageManager = function(resources)
{
    this._resources = resources;
    this._invalidTexture = PIXI.Texture.fromImage("bunny.png"); //TODO
    this._loadedTextures = new Hashtable();
};

gdjs.ImageManager = gdjs.PixiImageManager; //Register the class to let the engine use it.

/**
 * Return the PIXI texture associated to the specified name.
 * Returns a placeholder texture if not found.
 * @param {string} name The name of the resource to get.
 */
gdjs.PixiImageManager.prototype.getPIXITexture = function(name) {
	if ( this._loadedTextures.containsKey(name) ) {
		return this._loadedTextures.get(name);
	}
	if ( name === "" ) {
		return this._invalidTexture;
	}

	//Texture is not loaded, load it now from the resources list.
	if ( this._resources ) {
		var texture = null;

		for(var i = 0, len = this._resources.length;i<len;++i) {
			var res = this._resources[i];

			if (res.name === name && res.kind === "image") {
				texture = PIXI.Texture.fromImage(res.file);
				break;
			}
		}

		if ( texture !== null ) {
			console.log("Loaded texture \""+name+"\".");
			this._loadedTextures.put(name, texture);
			return texture;
		}
	}

	console.warn("Unable to find texture \""+name+"\".");
	return this._invalidTexture;
};

/**
 * Return a PIXI texture which can be used as a placeholder when no
 * suitable texture can be found.
 */
gdjs.PixiImageManager.prototype.getInvalidPIXITexture = function() {
	return this._invalidTexture;
};


/**
 * Load the specified resources, so that textures are loaded and can then be
 * used by calling `getPIXITexture`.
 * @param onProgress Callback called each time a new file is loaded.
 * @param onComplete Callback called when loading is done.
 * @param resources The resources to be loaded. If not specified, will load the resources
 * specified in the PixiImageManager constructor.
 */
gdjs.PixiImageManager.prototype.loadTextures = function(onProgress, onComplete, resources) {
	resources = resources || this._resources;

	//Construct the list of files to be loaded.
	//For one loaded file, it can have one or more resources
	//that use it.
    var files = {};
	for(var i = 0, len = resources.length;i<len;++i) {
		var res = resources[i];

        if ( res.file && res.kind === "image" ) {
        	if (this._loadedTextures.containsKey(res.name)) {
				console.log("Texture \"" + res.name + "\" is already loaded.");
        		continue;
        	}

            files[res.file] = files[res.file] ? files[res.file].concat(res) : [res];
        }
    }

    var totalCount = Object.keys(files).length;
    if (totalCount === 0)
    	return onComplete(); //Nothing to load.

    var loadingCount = 0;
    var loader = PIXI.loader;
	var that = this;
    loader.once('complete', function(loader, loadedFiles) {
    	//Store the loaded textures so that they are ready to use.
    	for (var file in loadedFiles) {
    		if (loadedFiles.hasOwnProperty(file)) {
    			if (!files.hasOwnProperty(file)) continue;

    			files[file].forEach(function(res) {
    				that._loadedTextures.put(res.name, loadedFiles[file].texture);
                    if (!res.smoothed) {
                        loadedFiles[file].texture.baseTexture.scaleMode =
                            PIXI.SCALE_MODES.NEAREST;
                    }
    			});
    		}
    	}

    	onComplete();
    });
    loader.on('progress', function() {
    	loadingCount++;
    	onProgress(loadingCount, totalCount);
    });

	for (var file in files) {
		if (files.hasOwnProperty(file)) {
            loader.add(file, file);
        }
    }

    loader.load();
}
