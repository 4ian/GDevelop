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
 * @param {ResourceData[]} resources The resources data of the game.
 */
gdjs.PixiImageManager = function(resources)
{
	this._resources = resources;

	// The invalid texture is a 8x8 PNG file filled with magenta (#ff00ff), to be
	// easily spotted if rendered on screen.
    this._invalidTexture = PIXI.Texture.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVQoU2P8z/D/PwMewDgyFAAApMMX8Zi0uXAAAAAASUVORK5CYIIA");
    this._loadedTextures = new Hashtable();
};

gdjs.ImageManager = gdjs.PixiImageManager; //Register the class to let the engine use it.

/**
 * Update the resources data of the game. Useful for hot-reloading, should not be used otherwise.
 *
 * @param {ResourceData[]} resources The resources data of the game.
 */
gdjs.PixiImageManager.prototype.setResources = function(resources) {
    this._resources = resources;
};

/**
 * Return the PIXI texture associated to the specified resource name.
 * Returns a placeholder texture if not found.
 * @param {string} resourceName The name of the resource
 * @returns {PIXI.Texture} The requested texture, or a placeholder if not found.
 */
gdjs.PixiImageManager.prototype.getPIXITexture = function(resourceName) {
	if ( this._loadedTextures.containsKey(resourceName) ) {
		return this._loadedTextures.get(resourceName);
	}
	if ( resourceName === "" ) {
		return this._invalidTexture;
	}

	//Texture is not loaded, load it now from the resources list.
	if ( this._resources ) {
		var texture = null;

		for(var i = 0, len = this._resources.length;i<len;++i) {
			var res = this._resources[i];

			if (res.name === resourceName && res.kind === "image") {
				texture = PIXI.Texture.from(res.file);
				break;
			}
		}

		if ( texture !== null ) {
			console.log("Loaded texture for resource \""+resourceName+"\".");
			this._loadedTextures.put(resourceName, texture);
			return texture;
		}
	}

	console.warn("Unable to find texture for resource \""+resourceName+"\".");
	return this._invalidTexture;
};

/**
 * Return the PIXI video texture associated to the specified resource name.
 * Returns a placeholder texture if not found.
 * @param {string} resourceName The name of the resource to get.
 */
gdjs.PixiImageManager.prototype.getPIXIVideoTexture = function(resourceName) {
	if ( this._loadedTextures.containsKey(resourceName) ) {
		return this._loadedTextures.get(resourceName);
	}
	if ( resourceName === "" ) {
		return this._invalidTexture;
	}

	//Texture is not loaded, load it now from the resources list.
	if ( this._resources ) {
		var texture = null;

		for(var i = 0, len = this._resources.length;i<len;++i) {
			var res = this._resources[i];

			if (res.name === resourceName && res.kind === "video") {
				texture = PIXI.Texture.from(res.file);
				break;
			}
		}

		if ( texture !== null ) {
			console.log("Loaded video texture for resource \""+resourceName+"\".");
			this._loadedTextures.put(resourceName, texture);
			return texture;
		}
	}

	console.warn("Unable to find video texture for resource \""+resourceName+"\".");
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
 */
gdjs.PixiImageManager.prototype.loadTextures = function(onProgress, onComplete) {
	var resources = this._resources;

	//Construct the list of files to be loaded.
	//For one loaded file, it can have one or more resources
	//that use it.
    var files = {};
	for(var i = 0, len = resources.length;i<len;++i) {
		var res = resources[i];

        if ( res.file && res.kind === "image" ) {
        	if (this._loadedTextures.containsKey(res.name)) {
        		continue;
        	}

            files[res.file] = files[res.file] ? files[res.file].concat(res) : [res];
        }
    }

    var totalCount = Object.keys(files).length;
    if (totalCount === 0)
    	return onComplete(totalCount); //Nothing to load.

    var loader = PIXI.Loader.shared;
	var that = this;

    var loadingCount = 0;
    var progressCallbackId = loader.onProgress.add(function() {
		loadingCount++;
		onProgress(loadingCount, totalCount);
    });

	for (var file in files) {
		if (files.hasOwnProperty(file)) {
            loader.add(file, file);
        }
    }

    loader.load(function(loader, loadedFiles) {
		loader.onProgress.detach(progressCallbackId);

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

    	onComplete(totalCount);
	});
}
