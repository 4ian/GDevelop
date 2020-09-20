/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * The renderer for a gdjs.RuntimeGame using Cocos2D-JS.
 *
 * @class RuntimeGameCocosRenderer
 * @memberof gdjs
 * @param {gdjs.RuntimeGame} game
 * @param {boolean} forceFullscreen
 */
gdjs.RuntimeGameCocosRenderer = function(game, forceFullscreen)
{
    this._directorManager = new gdjs.CocosDirectorManager();
    this._game = game;
}

gdjs.RuntimeGameRenderer = gdjs.RuntimeGameCocosRenderer; //Register the class to let the engine use it.

gdjs.RuntimeGameCocosRenderer.prototype.updateRendererSize = function() {
    cc.view.setDesignResolutionSize(this._game.getGameResolutionWidth(),
        this._game.getGameResolutionHeight(), cc.view.getResolutionPolicy());
};

/**
 * Set if the aspect ratio must be kept when the game rendering area is resized.
 */
gdjs.RuntimeGameCocosRenderer.prototype.keepAspectRatio = function(enable) {
    // Not supported.
    console.warn("Aspect ratio is not supported.");
};

/**
 * Change the margin that must be preserved around the game.
 */
gdjs.RuntimeGameCocosRenderer.prototype.setMargins = function(top, right, bottom, left) {
    // Not supported.
    console.warn("Margins are not supported.");
};

/**
 * De/activate fullscreen for the game.
 */
gdjs.RuntimeGameCocosRenderer.prototype.setFullScreen = function(enable) {
    // TODO - not implemented yet
    console.warn("Fullscreen is not implemented yet.");
};

/**
 * Checks if the game is in full screen.
 */
gdjs.RuntimeGamePixiRenderer.prototype.isFullScreen = function() {
    var electron = this.getElectron();
    if (electron) {
      return electron.remote.getCurrentWindow().isFullScreen();
    }
    return false; // Unsupported
  }

/**
 * Update the window size, if possible.
 * @param {number} width The new width, in pixels.
 * @param {number} height The new height, in pixels.
 */
gdjs.RuntimeGameCocosRenderer.prototype.setWindowSize = function(width, height) {
    var electron = this.getElectron();
    if (electron) { // Use Electron BrowserWindow API
        var browserWindow = electron.remote.getCurrentWindow();
        if (browserWindow) {
            browserWindow.setContentSize(width, height);
        }
    } else {
        console.warn("Window size can't be changed on this platform.");
    }
};

/**
 * Center the window on screen.
 */
gdjs.RuntimeGameCocosRenderer.prototype.centerWindow = function() {
    var electron = this.getElectron();
    if (electron) { // Use Electron BrowserWindow API
        var browserWindow = electron.remote.getCurrentWindow();
        if (browserWindow) {
            browserWindow.center();
        }
    } else {
        // Not supported
    }
}

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

gdjs.RuntimeGameCocosRenderer.getWindowInnerWidth = function() {
    return cc.view.getFrameSize().width;
}

gdjs.RuntimeGameCocosRenderer.getWindowInnerHeight = function() {
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
    console.warn("Stopping the game is not supported.");
}

/**
 * Get the canvas DOM element.
 */
gdjs.RuntimeGameCocosRenderer.prototype.getCanvas = function() {
    return cc.game.canvas;
}

/**
 * Check if the device supports WebGL.
 * @returns {boolean} true if WebGL is supported
 */
gdjs.RuntimeGameCocosRenderer.prototype.isWebGLSupported = function() {
	return cc._renderType === cc.game.RENDER_TYPE_WEBGL;
};

/**
 * Get the electron module, if running as a electron renderer process.
 */
gdjs.RuntimeGameCocosRenderer.prototype.getElectron = function() {
    if (typeof require !== "undefined") {
        return require('electron');
    }

    return null;
}
