/*
 * GDevelop JS Platform
 * Copyright 2013-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Tools related to window, for events generated code.
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

gdjs.evtTools.window.getCanvasWidth = function(runtimeScene) {
	return runtimeScene.getGame().getCurrentWidth();
};

gdjs.evtTools.window.getCanvasHeight = function(runtimeScene) {
	return runtimeScene.getGame().getCurrentHeight();
};

gdjs.evtTools.window.openURL = function(url) {
    //Try to detect the environment to use the most adapted
    //way of opening an URL.
    if (typeof Cocoon !== "undefined" && Cocoon.App && Cocoon.App.openURL ) {
        Cocoon.App.openURL(url);
    } else {
        var target = window.cordova ? "_system" : "_blank";
        window.open(url, target);
    }
};
