/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * The PanelSpriteRuntimeObject displays a tiled texture.
 *
 * @class PanelSpriteRuntimeObject
 * @extends RuntimeObject
 * @memberof gdjs
 */
gdjs.PanelSpriteRuntimeObject = function(runtimeScene, objectData)
{
    gdjs.RuntimeObject.call(this, runtimeScene, objectData);

    this._rBorder = objectData.rightMargin;
    this._lBorder = objectData.leftMargin;
    this._tBorder = objectData.topMargin;
    this._bBorder = objectData.bottomMargin;
    this._tiled = objectData.tiled;
    this._width = objectData.width;
    this._height = objectData.height;
    this.opacity = 255;

    if (this._renderer)
        gdjs.PanelSpriteRuntimeObjectRenderer.call(this._renderer, this, runtimeScene,
            objectData.texture, objectData.tiled);
    else
        this._renderer = new gdjs.PanelSpriteRuntimeObjectRenderer(this, runtimeScene,
            objectData.texture, objectData.tiled);

    // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
    this.onCreated();
};

gdjs.PanelSpriteRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.PanelSpriteRuntimeObject.thisIsARuntimeObjectConstructor = "PanelSpriteObject::PanelSprite";

gdjs.PanelSpriteRuntimeObject.prototype.getRendererObject = function() {
    return this._renderer.getRendererObject();
};

gdjs.PanelSpriteRuntimeObject.prototype.onDestroyFromScene = function(runtimeScene) {
    gdjs.RuntimeObject.prototype.onDestroyFromScene.call(this, runtimeScene);

    if (this._renderer.onDestroy) {
        this._renderer.onDestroy();
    }
};

gdjs.PanelSpriteRuntimeObject.prototype.update = function() {
    this._renderer.ensureUpToDate();
}

/**
 * Initialize the extra parameters that could be set for an instance.
 */
gdjs.PanelSpriteRuntimeObject.prototype.extraInitializationFromInitialInstance = function(initialInstanceData) {
    if ( initialInstanceData.customSize ) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
    }
};

/**
 * Set the x position of the panel sprite.
 * @param {number} x The new x position in pixels.
 */
gdjs.PanelSpriteRuntimeObject.prototype.setX = function(x) {
    gdjs.RuntimeObject.prototype.setX.call(this, x);
    this._renderer.updatePosition();
};

/**
 * Set the y position of the panel sprite.
 * @param {number} y The new y position in pixels.
 */
gdjs.PanelSpriteRuntimeObject.prototype.setY = function(y) {
    gdjs.RuntimeObject.prototype.setY.call(this, y);
    this._renderer.updatePosition();
};

/**
 * Set the texture of the panel sprite.
 * @param {string} textureName The name of the texture.
 * @param {gdjs.RuntimeScene} runtimeScene The scene the object lives in.
 */
gdjs.PanelSpriteRuntimeObject.prototype.setTexture = function(textureName, runtimeScene) {
    this._renderer.setTexture(textureName, runtimeScene);
};

/**
 * Set the angle of the panel sprite.
 * @param {number} angle The new angle in degrees.
 */
gdjs.PanelSpriteRuntimeObject.prototype.setAngle = function(angle) {
    gdjs.RuntimeObject.prototype.setAngle.call(this, angle);
    this._renderer.updateAngle();
};

/**
 * Get the width of the panel sprite in pixels
 * @return {number} The width in pixels
 */
gdjs.PanelSpriteRuntimeObject.prototype.getWidth = function() {
    return this._width;
};

/**
 * Get the height of the panel sprite in pixels
 * @return {number} The height in pixels
 */
gdjs.PanelSpriteRuntimeObject.prototype.getHeight = function() {
    return this._height;
};

/**
 * Set the width of the panel sprite.
 * @param {number} width The new width in pixels.
 */
gdjs.PanelSpriteRuntimeObject.prototype.setWidth = function(width) {
    this._width = width;
    this._renderer.updateWidth();
};

/**
 * Set the height of the panel sprite.
 * @param {number} height The new height in pixels.
 */
gdjs.PanelSpriteRuntimeObject.prototype.setHeight = function(height) {
    this._height = height;
    this._renderer.updateHeight();
};

/**
 * Change the transparency of the object.
 * @param {number} opacity The new opacity, between 0 (transparent) and 255 (opaque).
 */
gdjs.PanelSpriteRuntimeObject.prototype.setOpacity = function(opacity) {
    if ( opacity < 0 ) opacity = 0;
    if ( opacity > 255 ) opacity = 255;

    this.opacity = opacity;
    this._renderer.updateOpacity();
};

/**
 * Get the transparency of the object.
 * @return {number} The opacity, between 0 (transparent) and 255 (opaque).
 */
gdjs.PanelSpriteRuntimeObject.prototype.getOpacity = function() {
    return this.opacity;
};

/**
 * Change the tint of the panel sprite object.
 *
 * @param {string} rgbColor The color, in RGB format ("128;200;255").
 */
gdjs.PanelSpriteRuntimeObject.prototype.setColor = function(rgbColor) {
    this._renderer.setColor(rgbColor);
};

/**
 * Get the tint of the panel sprite object.
 *
 * @returns {string} rgbColor The color, in RGB format ("128;200;255").
 */
gdjs.PanelSpriteRuntimeObject.prototype.getColor = function() {
    return this._renderer.getColor();
};
