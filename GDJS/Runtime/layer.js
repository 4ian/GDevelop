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
 * @param {Object} layerData The data used to initialize the layer
 * @param {gdjs.RuntimeScene} runtimeScene The scene in which the layer is used
 * @memberof gdjs
 */
gdjs.Layer = function(layerData, runtimeScene)
{
    this._name = layerData.name;
    this._cameraRotation = 0;
    this._zoomFactor = 1;
    this._timeScale = 1;
    this._hidden = !layerData.visibility;
    this._effects = layerData.effects || [];
    this._cameraX = runtimeScene.getGame().getDefaultWidth()/2;
    this._cameraY = runtimeScene.getGame().getDefaultHeight()/2;
    this._width = runtimeScene.getGame().getDefaultWidth();
    this._height = runtimeScene.getGame().getDefaultHeight();

    this._renderer = new gdjs.LayerRenderer(this, runtimeScene.getRenderer());
    this.show(!this._hidden);
    this.setEffectsDefaultParameters();
};

gdjs.Layer.prototype.getRenderer = function() {
   return this._renderer;
};

/**
 * Get the name of the layer
 * @return {String} The name of the layer
 */
gdjs.Layer.prototype.getName = function() {
	return this._name;
};

/**
 * Change the camera center X position.
 *
 * @param cameraId The camera number. Currently ignored.
 * @return The x position of the camera
 */
gdjs.Layer.prototype.getCameraX = function(cameraId) {
	return this._cameraX;
};

/**
 * Change the camera center Y position.
 *
 * @param cameraId The camera number. Currently ignored.
 * @return The y position of the camera
 */
gdjs.Layer.prototype.getCameraY = function(cameraId) {
	return this._cameraY;
};

/**
 * Set the camera center X position.
 *
 * @param {number} x The new x position
 * @param {number} cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.setCameraX = function(x, cameraId) {
	this._cameraX = x;
	this._renderer.updatePosition();
};

/**
 * Set the camera center Y position.
 *
 * @param {number} y The new y position
 * @param {number} cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.setCameraY = function(y, cameraId) {
	this._cameraY = y;
	this._renderer.updatePosition();
};

gdjs.Layer.prototype.getCameraWidth = function(cameraId) {
	return (+this._width)*1/this._zoomFactor;
};

gdjs.Layer.prototype.getCameraHeight = function(cameraId) {
	return (+this._height)*1/this._zoomFactor;
};

/**
 * Show (or hide) the layer.
 * @param {boolean} enable true to show the layer, false to hide it.
 */
gdjs.Layer.prototype.show = function(enable) {
	this._hidden = !enable;
    this._renderer.updateVisibility(enable);
};

/**
 * Check if the layer is visible.
 *
 * @return true if the layer is visible.
 */
gdjs.Layer.prototype.isVisible = function() {
	return !this._hidden;
};

/**
 * Set the zoom of a camera.
 *
 * @param {number} newZoom The new zoom. Must be superior to 0. 1 is the default zoom.
 * @param {number} cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.setCameraZoom = function(newZoom, cameraId) {
	this._zoomFactor = newZoom;
	this._renderer.updatePosition();
};

/**
 * Get the zoom of a camera.
 *
 * @param {number} cameraId The camera number. Currently ignored.
 * @return {number} The zoom.
 */
gdjs.Layer.prototype.getCameraZoom = function(cameraId) {
	return this._zoomFactor;
};

/**
 * Get the rotation of the camera, expressed in degrees.
 *
 * @param {number} cameraId The camera number. Currently ignored.
 * @return {number} The rotation, in degrees.
 */
gdjs.Layer.prototype.getCameraRotation = function(cameraId) {
	return this._cameraRotation;
};

/**
 * Set the rotation of the camera, expressed in degrees.
 * The rotation is made around the camera center.
 *
 * @param {number} rotation The new rotation, in degrees.
 * @param {number} cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.setCameraRotation = function(rotation, cameraId) {
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
 * @param {number} cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.convertCoords = function(x, y, cameraId) {
	x -= this._width/2;
	y -= this._height/2;
	x /= Math.abs(this._zoomFactor);
	y /= Math.abs(this._zoomFactor);

	// Only compute angle and cos/sin once (allow heavy optimization from JS engines).
	var angleInRadians = this._cameraRotation/180*Math.PI;
	var tmp = x;
	var cosValue = Math.cos(angleInRadians);
	var sinValue = Math.sin(angleInRadians);
	x = cosValue*x - sinValue*y;
	y = sinValue*tmp + cosValue*y;

	return [x + this.getCameraX(cameraId), y + this.getCameraY(cameraId)];
};

gdjs.Layer.prototype.convertInverseCoords = function(x, y, cameraId) {
	x -= this.getCameraX(cameraId);
	y -= this.getCameraY(cameraId);

	// Only compute angle and cos/sin once (allow heavy optimization from JS engines).
	var angleInRadians = this._cameraRotation/180*Math.PI;
	var tmp = x;
	var cosValue = Math.cos(-angleInRadians);
	var sinValue = Math.sin(-angleInRadians);
	x = cosValue*x - sinValue*y;
	y = sinValue*tmp + cosValue*y;

	x *= Math.abs(this._zoomFactor);
	y *= Math.abs(this._zoomFactor);

	return [x + this._width/2, y + this._height/2];
};

gdjs.Layer.prototype.getWidth = function() {
    return this._width;
};

gdjs.Layer.prototype.getHeight = function() {
    return this._height;
};

gdjs.Layer.prototype.getEffects = function() {
    return this._effects;
};

gdjs.Layer.prototype.setEffectParameter = function(name, parameterIndex, value) {
    return this._renderer.setEffectParameter(name, parameterIndex, value);
};

gdjs.Layer.prototype.setEffectsDefaultParameters = function() {
    for (var i = 0; i < this._effects.length; ++i) {
        var effect = this._effects[i];
        for (var name in effect.parameters) {
            this.setEffectParameter(effect.name, name, effect.parameters[name]);
        }
    }
};

/**
 * Set the time scale for the objects on the layer:
 * time will be slower if time scale is < 1, faster if > 1.
 * @param {number} timeScale The new time scale (must be positive).
 */
gdjs.Layer.prototype.setTimeScale = function(timeScale) {
	if ( timeScale >= 0 ) this._timeScale = timeScale;
};

/**
 * Get the time scale for the objects on the layer.
 */
gdjs.Layer.prototype.getTimeScale = function() {
	return this._timeScale;
};

/**
 * Return the time elapsed since the last frame,
 * in milliseconds, for objects on the layer.
 */
gdjs.Layer.prototype.getElapsedTime = function(runtimeScene) {
   return runtimeScene.getTimeManager().getElapsedTime() * this._timeScale;
}
