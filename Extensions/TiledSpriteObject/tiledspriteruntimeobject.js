/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * The TiledSpriteRuntimeObject displays a tiled texture.
 *
 * @class TiledSpriteRuntimeObject
 * @extends RuntimeObject
 * @memberof gdjs
 */
gdjs.TiledSpriteRuntimeObject = function(runtimeScene, objectData)
{
    gdjs.RuntimeObject.call(this, runtimeScene, objectData);
    this._xOffset = 0;
    this._yOffset = 0;

    if (this._renderer)
        gdjs.TiledSpriteRuntimeObjectRenderer.call(this._renderer, this, runtimeScene, objectData.texture);
    else
        this._renderer = new gdjs.TiledSpriteRuntimeObjectRenderer(this, runtimeScene, objectData.texture);

    this.setWidth(objectData.width);
    this.setHeight(objectData.height);
};

gdjs.TiledSpriteRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.TiledSpriteRuntimeObject.thisIsARuntimeObjectConstructor = "TiledSpriteObject::TiledSprite";

gdjs.TiledSpriteRuntimeObject.prototype.getRendererObject = function() {
    return this._renderer.getRendererObject();
};

gdjs.TiledSpriteRuntimeObject.prototype.onDeletedFromScene = function(runtimeScene) {
    gdjs.RuntimeObject.prototype.onDeletedFromScene.call(this, runtimeScene);

    if (this._renderer.ownerRemovedFromScene) {
        this._renderer.ownerRemovedFromScene();
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
