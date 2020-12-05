// @ts-check
/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Represents a layer of a scene, used to display objects.
 *
 * Viewports and multiple cameras are not supported.
 *
 * @class Layer
 * @param {LayerData} layerData The data used to initialize the layer
 * @param {gdjs.RuntimeScene} runtimeScene The scene in which the layer is used
 * @memberof gdjs
 */
gdjs.Layer = function (layerData, runtimeScene) {
  this._name = layerData.name;
  this._cameraRotation = 0;
  this._zoomFactor = 1;
  this._timeScale = 1;
  this._defaultZOrder = 0;
  this._hidden = !layerData.visibility;
  this._initialEffectsData = layerData.effects || [];
  this._cameraX = runtimeScene.getGame().getGameResolutionWidth() / 2;
  this._cameraY = runtimeScene.getGame().getGameResolutionHeight() / 2;
  this._cachedGameResolutionWidth = runtimeScene
    .getGame()
    .getGameResolutionWidth();
  this._cachedGameResolutionHeight = runtimeScene
    .getGame()
    .getGameResolutionHeight();
  this._runtimeScene = runtimeScene;

  // Lighting layer properties.
  this._isLightingLayer = layerData.isLightingLayer;
  this._followBaseLayerCamera = layerData.followBaseLayerCamera;
  this._clearColor = [
    layerData.ambientLightColorR / 255,
    layerData.ambientLightColorG / 255,
    layerData.ambientLightColorB / 255,
    1.0,
  ];

  // @ts-ignore - assume the proper renderer is passed
  this._renderer = new gdjs.LayerRenderer(this, runtimeScene.getRenderer());
  this.show(!this._hidden);

  for (var i = 0; i < layerData.effects.length; ++i) {
    this.addEffect(layerData.effects[i]);
  }
};

gdjs.Layer.prototype.getRenderer = function () {
  return this._renderer;
};

/**
 * Get the default Z order to be attributed to objects created on this layer
 * (usually from events generated code).
 * @returns {number}
 */
gdjs.Layer.prototype.getDefaultZOrder = function () {
  return this._defaultZOrder;
}

/**
 * Set the default Z order to be attributed to objects created on this layer.
 * @param {number} defaultZOrder The Z order to use when creating a new object from events.
 */
gdjs.Layer.prototype.setDefaultZOrder = function (defaultZOrder) {
  this._defaultZOrder = defaultZOrder;
}

/**
 * Called by the RuntimeScene whenever the game resolution size is changed.
 * Updates the layer width/height and position.
 */
gdjs.Layer.prototype.onGameResolutionResized = function () {
  var oldGameResolutionWidth = this._cachedGameResolutionWidth;
  var oldGameResolutionHeight = this._cachedGameResolutionHeight;
  this._cachedGameResolutionWidth = this._runtimeScene
    .getGame()
    .getGameResolutionWidth();
  this._cachedGameResolutionHeight = this._runtimeScene
    .getGame()
    .getGameResolutionHeight();

  // Adapt position of the camera center as:
  // * Most cameras following a player/object on the scene will be updating this
  // in events anyway.
  // * Cameras not following a player/object are usually UIs which are intuitively
  // expected not to "move". Not adapting the center position would make the camera
  // move from its initial position (which is centered in the screen) - and anchor
  // behavior would behave counterintuitively.
  this._cameraX +=
    (this._cachedGameResolutionWidth - oldGameResolutionWidth) / 2;
  this._cameraY +=
    (this._cachedGameResolutionHeight - oldGameResolutionHeight) / 2;
  this._renderer.updatePosition();
};

/**
 * Returns the scene the layer belongs to
 * @returns {gdjs.RuntimeScene} the scene the layer belongs to
 */
gdjs.Layer.prototype.getRuntimeScene = function () {
  return this._runtimeScene;
};

/**
 * Called at each frame, after events are run and before rendering.
 * @param {gdjs.RuntimeScene} runtimeScene The scene the layer belongs to.
 */
gdjs.Layer.prototype.update = function (runtimeScene) {
  if (this._followBaseLayerCamera) this.followBaseLayer();
  return this._renderer.update();
};

/**
 * Get the name of the layer
 * @return {String} The name of the layer
 */
gdjs.Layer.prototype.getName = function () {
  return this._name;
};

/**
 * Change the camera center X position.
 *
 * @param {number=} cameraId The camera number. Currently ignored.
 * @return The x position of the camera
 */
gdjs.Layer.prototype.getCameraX = function (cameraId) {
  return this._cameraX;
};

/**
 * Change the camera center Y position.
 *
 * @param {number=} cameraId The camera number. Currently ignored.
 * @return The y position of the camera
 */
gdjs.Layer.prototype.getCameraY = function (cameraId) {
  return this._cameraY;
};

/**
 * Set the camera center X position.
 *
 * @param {number} x The new x position
 * @param {number=} cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.setCameraX = function (x, cameraId) {
  this._cameraX = x;
  this._renderer.updatePosition();
};

/**
 * Set the camera center Y position.
 *
 * @param {number} y The new y position
 * @param {number=} cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.setCameraY = function (y, cameraId) {
  this._cameraY = y;
  this._renderer.updatePosition();
};

/**
 * Get the camera width (which can be different than the game resolution width
 * if the camera is zoomed).
 *
 * @param {number=} cameraId The camera number. Currently ignored.
 * @return {number} The width of the camera
 */
gdjs.Layer.prototype.getCameraWidth = function (cameraId) {
  return (+this._cachedGameResolutionWidth * 1) / this._zoomFactor;
};

/**
 * Get the camera height (which can be different than the game resolution height
 * if the camera is zoomed).
 *
 * @param {number=} cameraId The camera number. Currently ignored.
 * @return {number} The height of the camera
 */
gdjs.Layer.prototype.getCameraHeight = function (cameraId) {
  return (+this._cachedGameResolutionHeight * 1) / this._zoomFactor;
};

/**
 * Show (or hide) the layer.
 * @param {boolean} enable true to show the layer, false to hide it.
 */
gdjs.Layer.prototype.show = function (enable) {
  this._hidden = !enable;
  this._renderer.updateVisibility(enable);
};

/**
 * Check if the layer is visible.
 *
 * @return true if the layer is visible.
 */
gdjs.Layer.prototype.isVisible = function () {
  return !this._hidden;
};

/**
 * Set the zoom of a camera.
 *
 * @param {number} newZoom The new zoom. Must be superior to 0. 1 is the default zoom.
 * @param {number=} cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.setCameraZoom = function (newZoom, cameraId) {
  this._zoomFactor = newZoom;
  this._renderer.updatePosition();
};

/**
 * Get the zoom of a camera.
 *
 * @param {number=} cameraId The camera number. Currently ignored.
 * @return {number} The zoom.
 */
gdjs.Layer.prototype.getCameraZoom = function (cameraId) {
  return this._zoomFactor;
};

/**
 * Get the rotation of the camera, expressed in degrees.
 *
 * @param {number=} cameraId The camera number. Currently ignored.
 * @return {number} The rotation, in degrees.
 */
gdjs.Layer.prototype.getCameraRotation = function (cameraId) {
  return this._cameraRotation;
};

/**
 * Set the rotation of the camera, expressed in degrees.
 * The rotation is made around the camera center.
 *
 * @param {number} rotation The new rotation, in degrees.
 * @param {number=} cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.setCameraRotation = function (rotation, cameraId) {
  this._cameraRotation = rotation;
  this._renderer.updatePosition();
};

/**
 * Convert a point from the canvas coordinates (For example, the mouse position) to the
 * "world" coordinates.
 *
 * TODO: Update this method to store the result in a static array
 *
 * @param {number} x The x position, in canvas coordinates.
 * @param {number} y The y position, in canvas coordinates.
 * @param {number=} cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.convertCoords = function (x, y, cameraId) {
  x -= this._cachedGameResolutionWidth / 2;
  y -= this._cachedGameResolutionHeight / 2;
  x /= Math.abs(this._zoomFactor);
  y /= Math.abs(this._zoomFactor);

  // Only compute angle and cos/sin once (allow heavy optimization from JS engines).
  var angleInRadians = (this._cameraRotation / 180) * Math.PI;
  var tmp = x;
  var cosValue = Math.cos(angleInRadians);
  var sinValue = Math.sin(angleInRadians);
  x = cosValue * x - sinValue * y;
  y = sinValue * tmp + cosValue * y;

  return [x + this.getCameraX(cameraId), y + this.getCameraY(cameraId)];
};

gdjs.Layer.prototype.convertInverseCoords = function (x, y, cameraId) {
  x -= this.getCameraX(cameraId);
  y -= this.getCameraY(cameraId);

  // Only compute angle and cos/sin once (allow heavy optimization from JS engines).
  var angleInRadians = (this._cameraRotation / 180) * Math.PI;
  var tmp = x;
  var cosValue = Math.cos(-angleInRadians);
  var sinValue = Math.sin(-angleInRadians);
  x = cosValue * x - sinValue * y;
  y = sinValue * tmp + cosValue * y;

  x *= Math.abs(this._zoomFactor);
  y *= Math.abs(this._zoomFactor);

  return [
    x + this._cachedGameResolutionWidth / 2,
    y + this._cachedGameResolutionHeight / 2,
  ];
};

gdjs.Layer.prototype.getWidth = function () {
  return this._cachedGameResolutionWidth;
};

gdjs.Layer.prototype.getHeight = function () {
  return this._cachedGameResolutionHeight;
};

/**
 * Return the initial effects data for the layer. Only to
 * be used by renderers.
 */
gdjs.Layer.prototype.getInitialEffectsData = function () {
  return this._initialEffectsData;
};

/**
 * Add a new effect, or replace the one with the same name.
 * @param {EffectData} effectData The data of the effect to add.
 */
gdjs.Layer.prototype.addEffect = function (effectData) {
  this._renderer.addEffect(effectData);

  for (var name in effectData.doubleParameters) {
    this.setEffectDoubleParameter(
      effectData.name,
      name,
      effectData.doubleParameters[name]
    );
  }
  for (var name in effectData.stringParameters) {
    this.setEffectStringParameter(
      effectData.name,
      name,
      effectData.stringParameters[name]
    );
  }
  for (var name in effectData.booleanParameters) {
    this.setEffectBooleanParameter(
      effectData.name,
      name,
      effectData.booleanParameters[name]
    );
  }
};

/**
 * Remove the effect with the specified name
 * @param {string} effectName The name of the effect.
 */
gdjs.Layer.prototype.removeEffect = function (effectName) {
  this._renderer.removeEffect(effectName);
};

/**
 * Change an effect parameter value (for parameters that are numbers).
 * @param {string} name The name of the effect to update.
 * @param {string} parameterName The name of the parameter to update.
 * @param {number} value The new value (number).
 */
gdjs.Layer.prototype.setEffectDoubleParameter = function (
  name,
  parameterName,
  value
) {
  return this._renderer.setEffectDoubleParameter(name, parameterName, value);
};

/**
 * Change an effect parameter value (for parameters that are strings).
 * @param {string} name The name of the effect to update.
 * @param {string} parameterName The name of the parameter to update.
 * @param {string} value The new value (string).
 */
gdjs.Layer.prototype.setEffectStringParameter = function (
  name,
  parameterName,
  value
) {
  return this._renderer.setEffectStringParameter(name, parameterName, value);
};

/**
 * Change an effect parameter value (for parameters that are booleans).
 * @param {string} name The name of the effect to update.
 * @param {string} parameterName The name of the parameter to update.
 * @param {boolean} value The new value (boolean).
 */
gdjs.Layer.prototype.setEffectBooleanParameter = function (
  name,
  parameterName,
  value
) {
  return this._renderer.setEffectBooleanParameter(name, parameterName, value);
};

/**
 * Enable or disable an effect.
 * @param {string} name The name of the effect to enable or disable.
 * @param {boolean} enable true to enable, false to disable
 */
gdjs.Layer.prototype.enableEffect = function (name, enable) {
  this._renderer.enableEffect(name, enable);
};

/**
 * Check if an effect is enabled
 * @param {string} name The name of the effect
 * @return {boolean} true if the effect is enabled, false otherwise.
 */
gdjs.Layer.prototype.isEffectEnabled = function (name) {
  return this._renderer.isEffectEnabled(name);
};

/**
 * Check if an effect exists on this layer
 * @param {string} name The name of the effect
 * @return {boolean} true if the effect exists, false otherwise.
 */
gdjs.Layer.prototype.hasEffect = function (name) {
  return this._renderer.hasEffect(name);
};

/**
 * Set the time scale for the objects on the layer:
 * time will be slower if time scale is < 1, faster if > 1.
 * @param {number} timeScale The new time scale (must be positive).
 */
gdjs.Layer.prototype.setTimeScale = function (timeScale) {
  if (timeScale >= 0) this._timeScale = timeScale;
};

/**
 * Get the time scale for the objects on the layer.
 */
gdjs.Layer.prototype.getTimeScale = function () {
  return this._timeScale;
};

/**
 * Return the time elapsed since the last frame,
 * in milliseconds, for objects on the layer.
 */
gdjs.Layer.prototype.getElapsedTime = function () {
  return this._runtimeScene.getTimeManager().getElapsedTime() * this._timeScale;
};

/**
 * Change the position, rotation and scale (zoom) of the layer camera to be the same as the base layer camera.
 */
gdjs.Layer.prototype.followBaseLayer = function () {
  var baseLayer = this._runtimeScene.getLayer('');
  this.setCameraX(baseLayer.getCameraX());
  this.setCameraY(baseLayer.getCameraY());
  this.setCameraRotation(baseLayer.getCameraRotation());
  this.setCameraZoom(baseLayer.getCameraZoom());
};

/**
 * The clear color is defined in the format [r, g, b], with components in the range of 0 to 1.
 * @return {number[]} the clear color of layer in the range of [0, 1].
 */
gdjs.Layer.prototype.getClearColor = function () {
  return this._clearColor;
};

/**
 * Set the clear color in format [r, g, b], with components in the range of 0 to 1.;
 * @param {?number} r Red color component in the range 0-255.
 * @param {?number} g Green color component in the range 0-255.
 * @param {?number} b Blue color component in the range 0-255.
 */
gdjs.Layer.prototype.setClearColor = function (r, g, b) {
  if (r) this._clearColor[0] = r / 255;
  if (g) this._clearColor[1] = g / 255;
  if (b) this._clearColor[2] = b / 255;
  this._renderer.updateClearColor();
};

/**
 * Set whether layer's camera follows base layer's camera or not.
 * @param {boolean} follow
 */
gdjs.Layer.prototype.setFollowBaseLayerCamera = function (follow) {
  this._followBaseLayerCamera = follow;
};

/**
 * Return true if the layer is a lighting layer, false otherwise.
 * @return {boolean} true if it is a lighting layer, false otherwise.
 */
gdjs.Layer.prototype.isLightingLayer = function () {
  return this._isLightingLayer;
};
