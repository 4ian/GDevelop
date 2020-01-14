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

gdjs.evtTools.window.setWindowSize = function(runtimeScene, width, height, updateGameResolution) {
	runtimeScene.getGame().getRenderer().setWindowSize(width, height);
	if (updateGameResolution) {
		runtimeScene.getGame().setGameResolutionSize(width, height);
	}
};

gdjs.evtTools.window.centerWindow = function(runtimeScene) {
	runtimeScene.getGame().getRenderer().centerWindow();
};

gdjs.evtTools.window.setGameResolutionSize = function(runtimeScene, width, height) {
	runtimeScene.getGame().setGameResolutionSize(width, height);
};

gdjs.evtTools.window.setGameResolutionResizeMode = function(runtimeScene, resizeMode) {
	runtimeScene.getGame().setGameResolutionResizeMode(resizeMode);
};

gdjs.evtTools.window.setAdaptGameResolutionAtRuntime = function(runtimeScene, enable) {
	runtimeScene.getGame().setAdaptGameResolutionAtRuntime(enable);
};

gdjs.evtTools.window.setWindowTitle = function(runtimeScene, title) {
    runtimeScene.getGame().getRenderer().setWindowTitle(title);
};

gdjs.evtTools.window.getWindowTitle = function(runtimeScene) {
	runtimeScene.getGame().getRenderer().getWindowTitle();
};

gdjs.evtTools.window.getWindowInnerWidth = function() {
	if (gdjs.RuntimeGameRenderer && gdjs.RuntimeGameRenderer.getWindowInnerWidth)
		return gdjs.RuntimeGameRenderer.getWindowInnerWidth();

    return (typeof window !== "undefined") ? window.innerWidth : 800;
};

gdjs.evtTools.window.getWindowInnerHeight = function() {
	if (gdjs.RuntimeGameRenderer && gdjs.RuntimeGameRenderer.getWindowInnerHeight)
		return gdjs.RuntimeGameRenderer.getWindowInnerHeight();

    return (typeof window !== "undefined") ? window.innerHeight : 800;
};

gdjs.evtTools.window.getGameResolutionWidth = function(runtimeScene) {
	return runtimeScene.getGame().getGameResolutionWidth();
};

gdjs.evtTools.window.getGameResolutionHeight = function(runtimeScene) {
	return runtimeScene.getGame().getGameResolutionHeight();
};

gdjs.evtTools.window.openURL = function(url, runtimeScene) {
	return runtimeScene.getGame().getRenderer().openURL(url);
};
