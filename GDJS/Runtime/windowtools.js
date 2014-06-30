/*
 * Game Develop JS Platform
 * Copyright 2013-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * Tools related to runtime scene, for events generated code.
 * @namespace gdjs.evtTools
 * @class window
 * @static
 * @private
 */
gdjs.evtTools.window = gdjs.evtTools.window || {};

gdjs.evtTools.window.setMargins = function(runtimeScene, top, right, bottom, left) {
	runtimeScene.getGame().setMargins(top, right, bottom, left);
};

gdjs.evtTools.window.setFullScreen = function(runtimeScene, enable, keepAspectRatio) {
	runtimeScene.getGame().keepAspectRatio(keepAspectRatio);
    runtimeScene.getGame().setFullScreen(enable);
};

gdjs.evtTools.window.setCanvasSize = function(runtimeScene, width, height, changeDefaultSize) {
    runtimeScene.getGame().setCanvasSize(width, height);
    if ( changeDefaultSize ) {
        runtimeScene.getGame().setDefaultWidth(width);
        runtimeScene.getGame().setDefaultHeight(height);
    }
};

gdjs.evtTools.window.setWindowTitle = function(runtimeScene, title) {
    document.title = title;
};

gdjs.evtTools.window.getWindowTitle = function() {
    return document.title;
};

gdjs.evtTools.window.getWindowWidth = function() {
    return window.innerWidth;
};
gdjs.evtTools.window.getWindowHeight = function() {
    return window.innerHeight;
};
