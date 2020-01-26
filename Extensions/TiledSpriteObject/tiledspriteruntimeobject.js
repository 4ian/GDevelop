/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * @typedef {Object} TiledSpriteObjectDataType Initial properties for a Tiled Sprite object
 * @property {number} width The width of the object
 * @property {number} height The height of the object
 *
 * @typedef {ObjectData & TiledSpriteObjectDataType} TiledSpriteObjectData
 */

/**
 * The TiledSpriteRuntimeObject displays a tiled texture.
 *
 * @class TiledSpriteRuntimeObject
 * @extends RuntimeObject
 * @memberof gdjs
 * @param {gdjs.RuntimeScene} runtimeScene The {@link gdjs.RuntimeScene} the object belongs to
 * @param {TiledSpriteObjectData} tiledSpriteObjectData The initial properties of the object
 */
gdjs.TiledSpriteRuntimeObject = function(runtimeScene, tiledSpriteObjectData)
{
    gdjs.RuntimeObject.call(this, runtimeScene, tiledSpriteObjectData);
    this._xOffset = 0;
    this._yOffset = 0;
    this.opacity = 255;

    if (this._renderer)
        gdjs.TiledSpriteRuntimeObjectRenderer.call(this._renderer, this, runtimeScene, tiledSpriteObjectData.texture);
    else
        /** @type {gdjs.TiledSpriteRuntimeObjectRenderer} */
        this._renderer = new gdjs.TiledSpriteRuntimeObjectRenderer(this, runtimeScene, tiledSpriteObjectData.texture);

    this.setWidth(tiledSpriteObjectData.width);
    this.setHeight(tiledSpriteObjectData.height);

    // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
    this.onCreated();
};

gdjs.TiledSpriteRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.registerObject("TiledSpriteObject::TiledSprite", gdjs.TiledSpriteRuntimeObject);

gdjs.TiledSpriteRuntimeObject.prototype.getRendererObject = function() {
    return this._renderer.getRendererObject();
};

gdjs.TiledSpriteRuntimeObject.prototype.onDestroyFromScene = function(runtimeScene) {
    gdjs.RuntimeObject.prototype.onDestroyFromScene.call(this, runtimeScene);

    if (this._renderer.onDestroy) {
        this._renderer.onDestroy();
    }
};

/**
 * Initialize the extra parameters that could be set for an instance.
 */
gdjs.TiledSpriteRuntimeObject.prototype.extraInitializationFromInitialInstance = function(initialInstanceData) {
    if ( initialInstanceData.customSize ) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
    }
};

/**
 * Set the X position of the Tiled Sprite object.
 * @param {number} x The new X position.
 */
gdjs.TiledSpriteRuntimeObject.prototype.setX = function(x) {
    gdjs.RuntimeObject.prototype.setX.call(this, x);
    this._renderer.updatePosition();
};

/**
 * Set the Y position of the Tiled Sprite object.
 * @param {number} y The new Y position.
 */
gdjs.TiledSpriteRuntimeObject.prototype.setY = function(y) {
    gdjs.RuntimeObject.prototype.setY.call(this, y);
    this._renderer.updatePosition();
};

/**
 * Assign a new texture to the Tiled Sprite object.
 * @param {string} textureName The name of the image texture ressource.
 * @param {gdjs.RuntimeScene} runtimeScene The scene in which the texture is used.
 */
gdjs.TiledSpriteRuntimeObject.prototype.setTexture = function(textureName, runtimeScene) {
    this._renderer.setTexture(textureName, runtimeScene);
};

/**
 * Set the angle of the Tiled Sprite object.
 * @param {number} angle The new angle.
 */
gdjs.TiledSpriteRuntimeObject.prototype.setAngle = function(angle) {
    gdjs.RuntimeObject.prototype.setAngle.call(this, angle);
    this._renderer.updateAngle();
};

/**
 * Get the width of the Tiled Sprite object.
 * @returns {number} The width of the Tiled Sprite object
 */
gdjs.TiledSpriteRuntimeObject.prototype.getWidth = function() {
    return this._renderer.getWidth();
};

/**
 * Get the height of the Tiled Sprite object.
 * @returns {number} The height of the Tiled Sprite object
 */
gdjs.TiledSpriteRuntimeObject.prototype.getHeight = function() {
    return this._renderer.getHeight();
};

/**
 * Set the width of the Tiled Sprite object.
 * @param {number} width The new width.
 */
gdjs.TiledSpriteRuntimeObject.prototype.setWidth = function(width) {
    this._renderer.setWidth(width);
};

/**
 * Set the height of the Tiled Sprite object.
 * @param {number} height The new height.
 */
gdjs.TiledSpriteRuntimeObject.prototype.setHeight = function(height) {
    this._renderer.setHeight(height);
};

/**
 * Set the offset on the X-axis when displaying the image of the Tiled Sprite object.
 * @param {number} xOffset The new offset on the X-axis.
 */
gdjs.TiledSpriteRuntimeObject.prototype.setXOffset = function(xOffset) {
    this._xOffset = xOffset;
    this._renderer.updateXOffset();
};

/**
 * Set the offset on the Y-axis when displaying the image of the Tiled Sprite object.
 * @param {number} yOffset The new offset on the Y-axis.
 */
gdjs.TiledSpriteRuntimeObject.prototype.setYOffset = function(yOffset) {
    this._yOffset = yOffset;
    this._renderer.updateYOffset();
};

/**
 * Get the offset on the X-axis of the Tiled Sprite object.
 * @returns {number} The offset on the X-axis
 */
gdjs.TiledSpriteRuntimeObject.prototype.getXOffset = function() {
    return this._xOffset;
};

/**
 * Get the offset on the Y-axis of the Tiled Sprite object.
 * @returns {number} The offset on the Y-axis
 */
gdjs.TiledSpriteRuntimeObject.prototype.getYOffset = function() {
    return this._yOffset;
};

/**
 * Change the transparency of the object.
 * @param {number} opacity The new opacity, between 0 (transparent) and 255 (opaque).
 */
gdjs.TiledSpriteRuntimeObject.prototype.setOpacity = function(opacity) {
    if ( opacity < 0 ) opacity = 0;
    if ( opacity > 255 ) opacity = 255;

    this.opacity = opacity;
    this._renderer.updateOpacity();
};

/**
 * Get the transparency of the object.
 * @return {number} The opacity, between 0 (transparent) and 255 (opaque).
 */
gdjs.TiledSpriteRuntimeObject.prototype.getOpacity = function() {
    return this.opacity;
};

/**
 * Change the tint of the tiled sprite object.
 *
 * @param {string} rgbColor The color, in RGB format ("128;200;255").
 */
gdjs.TiledSpriteRuntimeObject.prototype.setColor = function(rgbColor) {
    this._renderer.setColor(rgbColor);
};

/**
 * Get the tint of the tiled sprite object.
 *
 * @returns {string} rgbColor The color, in RGB format ("128;200;255").
 */
gdjs.TiledSpriteRuntimeObject.prototype.getColor = function() {
    return this._renderer.getColor();
};
