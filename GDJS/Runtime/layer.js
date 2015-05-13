/*
 * GDevelop JS Platform
 * Copyright 2013-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Represents a layer used to display objects.
 *
 * The layer connects its Pixi container to the Pixi stage during its construction,
 * but then it is objects responsibility to connect themselves to the layer's container
 * (see addChildToPIXIContainer method).
 *
 * Layers do not provide direct access to their pixi container as they do some extra work
 * to ensure that z orders remains correct.
 *
 * *Not yet implemented:* Viewports and support for multiple cameras
 *
 * @class Layer
 * @namespace gdjs
 * @constructor
 */
gdjs.Layer = function(layerData, runtimeScene)
{
    this._name = layerData.name;
    this._cameraRotation = 0;
    this._zoomFactor = 1;
    this._hidden = !layerData.visibility;
    this._pixiRenderer = runtimeScene.getPIXIRenderer();
    this._pixiContainer = new PIXI.Container(); //The container of the layer
    this._cameraX = runtimeScene.getGame().getDefaultWidth()/2;
    this._cameraY = runtimeScene.getGame().getDefaultHeight()/2;
    this._defaultWidth = runtimeScene.getGame().getDefaultWidth();
    this._defaultHeight = runtimeScene.getGame().getDefaultHeight();

    runtimeScene.getPIXIContainer().addChild(this._pixiContainer);
    this.show(!this._hidden);
};

/**
 * Update the position of the PIXI container. To be called after each change
 * made to position, zoom or rotation of the camera.
 * @private
 */
gdjs.Layer.prototype._updatePixiContainerPosition = function() {
	var angle = -gdjs.toRad(this._cameraRotation);
	this._pixiContainer.rotation = angle;
	this._pixiContainer.scale.x = this._zoomFactor;
	this._pixiContainer.scale.y = this._zoomFactor;

	var centerX = (this._cameraX*this._zoomFactor)*Math.cos(angle)-(this._cameraY*this._zoomFactor)*Math.sin(angle);
	var centerY = (this._cameraX*this._zoomFactor)*Math.sin(angle)+(this._cameraY*this._zoomFactor)*Math.cos(angle);

	this._pixiContainer.position.x = -centerX;
	this._pixiContainer.position.y = -centerY;
	this._pixiContainer.position.x += this._defaultWidth/2;
	this._pixiContainer.position.y += this._defaultHeight/2;
};

/**
 * Get the name of the layer
 * @method getName
 * @return {String} The name of the layer
 */
gdjs.Layer.prototype.getName = function() {
	return this._name;
};

/**
 * Get the PIXI.Container associated to the layer
 * @method getPIXIContainer
 */
gdjs.Layer.prototype.getPIXIContainer = function() {
	return this._pixiContainer;
};

/**
 * Add a child to the pixi container associated to the layer.<br>
 * All objects which are on this layer must be children of this container.<br>
 *
 * @method addChildToPIXIContainer
 * @param child The child ( PIXI object ) to be added.
 * @param zOrder The z order of the associated object.
 */
gdjs.Layer.prototype.addChildToPIXIContainer = function(child, zOrder) {
	child.zOrder = zOrder; //Extend the pixi object with a z order.

	for( var i = 0, len = this._pixiContainer.children.length; i < len;++i) {
		if ( this._pixiContainer.children[i].zOrder >= zOrder ) { //TODO : Dichotomic search
			this._pixiContainer.addChildAt(child, i);
			return;
		}
	}
	this._pixiContainer.addChild(child);
};

/**
 * Change the z order of a child associated to an object.
 *
 * @method changePIXIContainerChildZOrder
 * @param child The child ( PIXI object ) to be modified.
 * @param newZOrder The z order of the associated object.
 */
gdjs.Layer.prototype.changePIXIContainerChildZOrder = function(child, newZOrder) {
	this._pixiContainer.removeChild(child);
	this.addChildToPIXIContainer(child, newZOrder);
};

/**
 * Remove a child from the internal pixi container.<br>
 * Should be called when an object is deleted or removed from the layer.
 *
 * @method removePIXIContainerChild
 * @param child The child ( PIXI object ) to be removed.
 */
gdjs.Layer.prototype.removePIXIContainerChild = function(child) {
	this._pixiContainer.removeChild(child);
};

/**
 * Change the camera center X position.<br>
 *
 * @method getCameraX
 * @param cameraId The camera number. Currently ignored.
 * @return The x position of the camera
 */
gdjs.Layer.prototype.getCameraX = function(cameraId) {
	return this._cameraX;
};

/**
 * Change the camera center Y position.<br>
 *
 * @method getCameraY
 * @param cameraId The camera number. Currently ignored.
 * @return The y position of the camera
 */
gdjs.Layer.prototype.getCameraY = function(cameraId) {
	return this._cameraY;
};

/**
 * Set the camera center X position.<br>
 *
 * @method setCameraX
 * @param x {Number} The new x position
 * @param cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.setCameraX = function(x, cameraId) {
	this._cameraX = x;
	this._updatePixiContainerPosition();
};

/**
 * Set the camera center Y position.<br>
 *
 * @method setCameraY
 * @param y {Number} The new y position
 * @param cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.setCameraY = function(y, cameraId) {
	this._cameraY = y;
	this._updatePixiContainerPosition();
};

gdjs.Layer.prototype.getCameraWidth = function(cameraId) {
	return (+this._defaultWidth)*1/this._pixiContainer.scale.x;
};

gdjs.Layer.prototype.getCameraHeight = function(cameraId) {
	return (+this._defaultHeight)*1/this._pixiContainer.scale.y;
};

gdjs.Layer.prototype.show = function(enable) {
	this._hidden = !enable;
	this._pixiContainer.visible = !!enable;
};

/**
 * Check if the layer is visible.<br>
 *
 * @method isVisible
 * @return true if the layer is visible.
 */
gdjs.Layer.prototype.isVisible = function() {
	return !this._hidden;
};

/**
 * Set the zoom of a camera.<br>
 *
 * @method setCameraZoom
 * @param The new zoom. Must be superior to 0. 1 is the default zoom.
 * @param cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.setCameraZoom = function(newZoom, cameraId) {

	this._zoomFactor = newZoom;
	this._updatePixiContainerPosition();
};

/**
 * Get the zoom of a camera.<br>
 *
 * @method getZoom
 * @param cameraId The camera number. Currently ignored.
 * @return The zoom.
 */
gdjs.Layer.prototype.getCameraZoom = function(cameraId) {
	return this._zoomFactor;
};

/**
 * Get the rotation of the camera, expressed in degrees.<br>
 *
 * @method getCameraRotation
 * @param cameraId The camera number. Currently ignored.
 * @return The rotation, in degrees.
 */
gdjs.Layer.prototype.getCameraRotation = function(cameraId) {
	return this._cameraRotation;
};

/**
 * Set the rotation of the camera, expressed in degrees.<br>
 * The rotation is made around the camera center.
 *
 * @method setCameraRotation
 * @param rotation {Number} The new rotation, in degrees.
 * @param cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.setCameraRotation = function(rotation, cameraId) {
	this._cameraRotation = rotation;
	this._updatePixiContainerPosition();
};

/**
 * Convert a point from the canvas coordinates (For example, the mouse position) to the
 * "world" coordinates.
 *
 * @method convertCoords
 * @param x {Number} The x position, in canvas coordinates.
 * @param y {Number} The y position, in canvas coordinates.
 * @param cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.convertCoords = function(x,y, cameraId) {

	x -= this._defaultWidth/2;
	y -= this._defaultHeight/2;
	x /= Math.abs(this._pixiContainer.scale.x);
	y /= Math.abs(this._pixiContainer.scale.y);

	var tmp = x;
	x = Math.cos(this._cameraRotation/180*3.14159)*x - Math.sin(this._cameraRotation/180*3.14159)*y;
	y = Math.sin(this._cameraRotation/180*3.14159)*tmp + Math.cos(this._cameraRotation/180*3.14159)*y;

	return [x+this.getCameraX(cameraId), y+this.getCameraY(cameraId)];
};

