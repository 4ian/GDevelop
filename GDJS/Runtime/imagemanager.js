/*
 * GDevelop JS Platform
 * Copyright 2013-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * The imageManager stores textures this.can be used by the objects
 *
 * @class ImageManager
 * @namespace gdjs
 * @param runtimeGame The runtimeGame to be imageManager belongs to.
 */
gdjs.ImageManager = function(runtimeGame)
{
    this._game = runtimeGame;
    this._invalidTexture = PIXI.Texture.fromImage("bunny.png"); //TODO
    this._loadedTextures = new Hashtable();
    this._loadedPow2ConvertedTextures = new Hashtable();
};

/**
 * Return the PIXI texture associated to the specified name.
 * Returns a placeholder texture if not found.
 * @param name The name of the texture to get.
 * @method getPIXITexture
 */
gdjs.ImageManager.prototype.getPIXITexture = function(name) {
	if ( this._loadedTextures.containsKey(name) ) {
		return this._loadedTextures.get(name);
	}
	if ( name === "" ) {
		return this._invalidTexture;
	}

	var resources = this._game.getGameData().resources.resources;
	if ( resources ) {
		var texture = null;
		gdjs.iterateOverArray(resources, function(res) {
			if ( res.name === name &&
				res.kind === "image" ) {

				texture = PIXI.Texture.fromImage(res.file);
				return false;
			}
		});

		if ( texture !== null ) {
			//console.log("Loaded texture \""+name+"\".");
			this._loadedTextures.put(name, texture);
			return texture;
		}
	}

	console.warn("Unable to find texture \""+name+"\".");
	return this._invalidTexture;
};

function isPowerOfTwo(x) {
    return (x & (x - 1)) === 0;
}

function nearestPowerOf2(x) {
    return Math.pow(2, Math.round(Math.log(x) / Math.LN2));
}

/**
 * Return a PIXI texture which can be used as a placeholder when no
 * suitable texture can be found.
 * @method getInvalidPIXITexture
 */
gdjs.ImageManager.prototype.getInvalidPIXITexture = function() {
	return this._invalidTexture;
};

