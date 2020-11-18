// @ts-check
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

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {number} top
 * @param {number} right
 * @param {number} bottom
 * @param {number} left
 */
gdjs.evtTools.window.setMargins = function (
  runtimeScene,
  top,
  right,
  bottom,
  left
) {
  runtimeScene.getGame().getRenderer().setMargins(top, right, bottom, left);
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {boolean} enable
 * @param {boolean} keepAspectRatio
 */
gdjs.evtTools.window.setFullScreen = function (
  runtimeScene,
  enable,
  keepAspectRatio
) {
  runtimeScene.getGame().getRenderer().keepAspectRatio(keepAspectRatio);
  runtimeScene.getGame().getRenderer().setFullScreen(enable);
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @returns {boolean}
 */
gdjs.evtTools.window.isFullScreen = function (runtimeScene) {
  return runtimeScene.getGame().getRenderer().isFullScreen();
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {number} width
 * @param {number} height
 * @param {boolean} updateGameResolution
 */
gdjs.evtTools.window.setWindowSize = function (
  runtimeScene,
  width,
  height,
  updateGameResolution
) {
  runtimeScene.getGame().getRenderer().setWindowSize(width, height);
  if (updateGameResolution) {
    runtimeScene.getGame().setGameResolutionSize(width, height);
  }
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 */
gdjs.evtTools.window.centerWindow = function (runtimeScene) {
  runtimeScene.getGame().getRenderer().centerWindow();
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {number} width
 * @param {number} height
 */
gdjs.evtTools.window.setGameResolutionSize = function (
  runtimeScene,
  width,
  height
) {
  runtimeScene.getGame().setGameResolutionSize(width, height);
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {string} resizeMode
 */
gdjs.evtTools.window.setGameResolutionResizeMode = function (
  runtimeScene,
  resizeMode
) {
  runtimeScene.getGame().setGameResolutionResizeMode(resizeMode);
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {boolean} enable
 */
gdjs.evtTools.window.setAdaptGameResolutionAtRuntime = function (
  runtimeScene,
  enable
) {
  runtimeScene.getGame().setAdaptGameResolutionAtRuntime(enable);
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {string} title
 */
gdjs.evtTools.window.setWindowTitle = function (runtimeScene, title) {
  runtimeScene.getGame().getRenderer().setWindowTitle(title);
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @returns {string}
 */
gdjs.evtTools.window.getWindowTitle = function (runtimeScene) {
  return runtimeScene.getGame().getRenderer().getWindowTitle();
};

/**
 * @returns {number}
 */
gdjs.evtTools.window.getWindowInnerWidth = function () {
  if (gdjs.RuntimeGameRenderer && gdjs.RuntimeGameRenderer.getWindowInnerWidth)
    return gdjs.RuntimeGameRenderer.getWindowInnerWidth();

  return typeof window !== 'undefined' ? window.innerWidth : 800;
};

/**
 * @returns {number}
 */
gdjs.evtTools.window.getWindowInnerHeight = function () {
  if (gdjs.RuntimeGameRenderer && gdjs.RuntimeGameRenderer.getWindowInnerHeight)
    return gdjs.RuntimeGameRenderer.getWindowInnerHeight();

  return typeof window !== 'undefined' ? window.innerHeight : 800;
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @returns {number}
 */
gdjs.evtTools.window.getGameResolutionWidth = function (runtimeScene) {
  return runtimeScene.getGame().getGameResolutionWidth();
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @returns {number}
 */
gdjs.evtTools.window.getGameResolutionHeight = function (runtimeScene) {
  return runtimeScene.getGame().getGameResolutionHeight();
};

/**
 * @param {string} url
 * @param {gdjs.RuntimeScene} runtimeScene
 */
gdjs.evtTools.window.openURL = function (url, runtimeScene) {
  return runtimeScene.getGame().getRenderer().openURL(url);
};
