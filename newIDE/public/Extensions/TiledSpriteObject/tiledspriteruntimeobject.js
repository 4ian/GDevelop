/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * The TiledSpriteRuntimeObject displays a tiled texture.
 *
 * @class TiledSpriteRuntimeObject
 * @extends RuntimeObject
 * @namespace gdjs
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

gdjs.TiledSpriteRuntimeObject.prototype.setX = function(x) {
    gdjs.RuntimeObject.prototype.setX.call(this, x);
    this._renderer.updatePosition();
};

gdjs.TiledSpriteRuntimeObject.prototype.setY = function(y) {
    gdjs.RuntimeObject.prototype.setY.call(this, y);
    this._renderer.updatePosition();
};

gdjs.TiledSpriteRuntimeObject.prototype.setTexture = function(textureName, runtimeScene) {
    this._renderer.setTexture(textureName, runtimeScene);
};

gdjs.TiledSpriteRuntimeObject.prototype.setAngle = function(angle) {
    gdjs.RuntimeObject.prototype.setAngle.call(this, angle);
    this._renderer.updateAngle();
};

gdjs.TiledSpriteRuntimeObject.prototype.getWidth = function() {
    return this._renderer.getWidth();
};

gdjs.TiledSpriteRuntimeObject.prototype.getHeight = function() {
    return this._renderer.getHeight();
};

gdjs.TiledSpriteRuntimeObject.prototype.setWidth = function(width) {
    this._renderer.setWidth(width);
};

gdjs.TiledSpriteRuntimeObject.prototype.setHeight = function(height) {
    this._renderer.setHeight(height);
};

gdjs.TiledSpriteRuntimeObject.prototype.setXOffset = function(xOffset) {
    this._xOffset = xOffset;
    this._renderer.updateXOffset();
};

gdjs.TiledSpriteRuntimeObject.prototype.setYOffset = function(yOffset) {
    this._yOffset = yOffset;
    this._renderer.updateYOffset();
};

gdjs.TiledSpriteRuntimeObject.prototype.getXOffset = function() {
    return this._xOffset;
};

gdjs.TiledSpriteRuntimeObject.prototype.getYOffset = function() {
    return this._yOffset;
};
