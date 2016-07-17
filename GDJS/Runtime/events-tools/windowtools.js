/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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
	runtimeScene.getGame().getRenderer().setMargins(top, right, bottom, left);
};

gdjs.evtTools.window.setFullScreen = function(runtimeScene, enable, keepAspectRatio) {
	runtimeScene.getGame().getRenderer().keepAspectRatio(keepAspectRatio);
    runtimeScene.getGame().getRenderer().setFullScreen(enable);
};

gdjs.evtTools.window.setCanvasSize = function(runtimeScene, width, height, changeDefaultSize) {
    runtimeScene.getGame().getRenderer().setSize(width, height);
    if ( changeDefaultSize ) {
        runtimeScene.getGame().setDefaultWidth(width);
        runtimeScene.getGame().setDefaultHeight(height);
    }
};

gdjs.evtTools.window.setWindowTitle = function(runtimeScene, title) {
    runtimeScene.getGame().getRenderer().setWindowTitle(title);
};

gdjs.evtTools.window.getWindowTitle = function(runtimeScene) {
	runtimeScene.getGame().getRenderer().getWindowTitle();
};

gdjs.evtTools.window.getWindowWidth = function() {
	if (gdjs.RuntimeGameRenderer && gdjs.RuntimeGameRenderer.getScreenWidth)
		return gdjs.RuntimeGameRenderer.getScreenWidth();

    return (typeof window !== "undefined") ? window.innerWidth : 800;
};

gdjs.evtTools.window.getWindowHeight = function() {
	if (gdjs.RuntimeGameRenderer && gdjs.RuntimeGameRenderer.getScreenHeight)
		return gdjs.RuntimeGameRenderer.getScreenHeight();

    return (typeof window !== "undefined") ? window.innerHeight : 800;
};

gdjs.evtTools.window.getCanvasWidth = function(runtimeScene) {
	return runtimeScene.getGame().getRenderer().getCurrentWidth();
};

gdjs.evtTools.window.getCanvasHeight = function(runtimeScene) {
	return runtimeScene.getGame().getRenderer().getCurrentHeight();
};

gdjs.evtTools.window.openURL = function(url) {
    //Try to detect the environment to use the most adapted
    //way of opening an URL.
    if (typeof cc !== "undefined" && cc.sys && cc.sys.openURL) {
        cc.sys.openURL(url);
    } else if (typeof Cocoon !== "undefined" && Cocoon.App && Cocoon.App.openURL) {
        Cocoon.App.openURL(url);
    } else if (typeof window !== "undefined") {
        var target = window.cordova ? "_system" : "_blank";
        window.open(url, target);
    }
};
