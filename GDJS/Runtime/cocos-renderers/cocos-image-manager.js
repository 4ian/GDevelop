/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * CocosImageManager loads and stores textures that can be used by the Cocos2D-JS renderers.
 *
 * @class CocosImageManager
 * @memberof gdjs
 * @param {ResourceData[]} resources The resources data of the game.
 */
gdjs.CocosImageManager = function(resources)
{
    this._resources = {};

    var that = this;
    resources.forEach(function(res) {
        if ( res.file && res.kind === "image" ) {
            that._resources[res.name] = res;
        }
    })

};

gdjs.ImageManager = gdjs.CocosImageManager; //Register the class to let the engine use it.

/**
 * Update the resources data of the game. Useful for hot-reloading, should not be used otherwise.
 *
 * @param {ResourceData[]} resources The resources data of the game.
 */
gdjs.CocosImageManager.prototype.setResources = function(resources) {
    this._resources = resources;
};

/**
 * Return the texture associated to the specified name.
 * Returns a placeholder texture if not found.
 * @param {string} name The name of the resource to get.
 */
gdjs.CocosImageManager.prototype.getTexture = function(imageName) {
    var texture;
    if (this._resources.hasOwnProperty(imageName)) {
        texture = cc.textureCache.addImage('res/' + this._resources[imageName].file);
        if (!this._resources[imageName].smoothed) {
            texture.setAliasTexParameters();
        }
    } else {
        texture = cc.textureCache.addImage('res/' + this.getInvalidTexture());
    }

    return texture;
};

/**
 * Return a texture which can be used as a placeholder when no
 * suitable texture can be found.
 * TODO: The path to the file is hardcoded and can create crash if not existing,
 * especially when compiled to a native game on iOS/Android/macOS.
 */
gdjs.CocosImageManager.prototype.getInvalidTexture = function() {
    // TODO: use a valid texture from memory and ensure that each usage of _textureLoaded
    // is updated to compare the texture with invalid texture.
    return "res/HelloWorld.png";
};

gdjs.CocosImageManager.prototype.isPowerOf2 = function(texture) {
    if (texture.pixelsWidth !== texture.pixelsHeight) return false;

    var n = texture.pixelsWidth;
    return (n & (n - 1)) == 0;
};

gdjs.CocosImageManager.prototype.loadTextures = function(onProgress, onComplete) {
    var that = this;
    var files = Object.keys(this._resources).map(function(name) {
        return 'res/' + that._resources[name].file;
    });

    cc.LoaderScene.preload(files, function () {
        onComplete(files.length);
    });
}
