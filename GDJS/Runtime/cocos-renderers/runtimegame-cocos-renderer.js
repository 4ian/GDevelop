/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * The renderer for a gdjs.RuntimeGame using Cocos2D-JS.
 * @class RuntimeGameCocosRenderer
 * @memberof gdjs
 */
gdjs.RuntimeGameCocosRenderer = function(game, width, height, forceFullscreen)
{
    this._directorManager = new gdjs.CocosDirectorManager();
    this._currentWidth = width; //Current size of the canvas
    this._currentHeight = height;
}

gdjs.RuntimeGameRenderer = gdjs.RuntimeGameCocosRenderer; //Register the class to let the engine use it.

gdjs.RuntimeGameCocosRenderer.prototype.getCurrentWidth = function() {
    return this._currentWidth;
};

gdjs.RuntimeGameCocosRenderer.prototype.getCurrentHeight = function() {
    return this._currentHeight;
};

gdjs.RuntimeGameCocosRenderer.prototype.setSize = function(width, height) {
    this._currentWidth = width;
    this._currentHeight = height;

    cc.view.setDesignResolutionSize(width, height, cc.view.getResolutionPolicy());
};

/**
 * Set if the aspect ratio must be kept when the game rendering area is resized.
 */
gdjs.RuntimeGameCocosRenderer.prototype.keepAspectRatio = function(enable) {
    //TODO
};

/**
 * Change the margin that must be preserved around the game.
 */
gdjs.RuntimeGameCocosRenderer.prototype.setMargins = function(top, right, bottom, left) {
    //TODO
};

/**
 * De/activate fullscreen for the game.
 */
gdjs.RuntimeGameCocosRenderer.prototype.setFullScreen = function(enable) {
    //TODO
};

gdjs.RuntimeGameCocosRenderer.prototype.setWindowTitle = function(title) {
    if (typeof document !== 'undefined') document.title = title;
}

gdjs.RuntimeGameCocosRenderer.prototype.getWindowTitle = function() {
    return (typeof document !== 'undefined') ? document.title : '';
}

gdjs.RuntimeGameCocosRenderer.prototype.startGameLoop = function(fn) {
    this._gameLoopFn = fn;
    this._gameLoopFn(0);
}

gdjs.RuntimeGameCocosRenderer.prototype.getDirectorManager = function() {
    return this._directorManager;
}

/**
 * As Cocos2d is managing the game loop, the Cocos scenes need to call this
 * function to step the game engine. See gdjs.RuntimeSceneCocosRenderer.
 */
gdjs.RuntimeGameCocosRenderer.prototype.onSceneUpdated = function(dt) {
    if (!this._gameLoopFn(dt)) {
        this._directorManager.end();
    }
}

gdjs.RuntimeGameCocosRenderer.prototype.convertYPosition = function(y) {
    //Cocos2D Y axis is inverted, with origin at the bottom of the window.
    return this._currentHeight - y;
}

gdjs.RuntimeGameCocosRenderer.getScreenWidth = function() {
    return cc.view.getFrameSize().width;
}

gdjs.RuntimeGameCocosRenderer.getScreenHeight = function() {
    return cc.view.getFrameSize().height;
}

/**
 * Open the given URL in the system browser
 */
gdjs.RuntimeGameCocosRenderer.prototype.openURL = function(url) {
    // Try to detect the environment to use the most adapted
    // way of opening an URL.
    if (typeof cc !== "undefined" && cc.sys && cc.sys.openURL) {
        cc.sys.openURL(url);
    } else if (typeof window !== "undefined") {
        var target = window.cordova ? "_system" : "_blank";
        window.open(url, target);
    }
}

gdjs.RuntimeGameCocosRenderer.prototype.stopGame = function() {
    // TODO - Not implemented as not useful for most games on mobile and browsers
}
