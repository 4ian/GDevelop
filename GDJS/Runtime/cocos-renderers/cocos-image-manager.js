/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

gdjs.CocosImageManager = function(resources)
{
    this._resources = {};

    var that = this;
    resources.forEach(function(res) {
        that._resources[res.name] = res;
    })

};

gdjs.ImageManager = gdjs.CocosImageManager; //Register the class to let the engine use it.

gdjs.CocosImageManager.prototype.getTexture = function(imageName) {
    var file;
    if (this._resources.hasOwnProperty(imageName)) {
        file = this._resources[imageName].file;
    } else {
        file = this.getInvalidTexture();
    }

    var texture = cc.textureCache.addImage('res/' + file);
    return texture;
};

gdjs.CocosImageManager.prototype.getInvalidTexture = function() {
    return "res/HelloWorld.png"; //TODO
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
        onComplete();
    });
}
