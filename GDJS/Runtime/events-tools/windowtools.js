/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Tools related to window, for events generated code.
 * @memberof gdjs.evtTools
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
	return runtimeScene.getGame().getRenderer().openURL(url);
};
