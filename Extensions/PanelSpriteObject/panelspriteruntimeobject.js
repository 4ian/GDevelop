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

    if (this._renderer)
        gdjs.PanelSpriteRuntimeObjectRenderer.call(this._renderer, this, runtimeScene,
            objectData.texture, objectData.tiled);
    else
        this._renderer = new gdjs.PanelSpriteRuntimeObjectRenderer(this, runtimeScene,
            objectData.texture, objectData.tiled);
};

gdjs.PanelSpriteRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.PanelSpriteRuntimeObject.thisIsARuntimeObjectConstructor = "PanelSpriteObject::PanelSprite";

gdjs.PanelSpriteRuntimeObject.prototype.getRendererObject = function() {
    return this._renderer.getRendererObject();
};

gdjs.PanelSpriteRuntimeObject.prototype.onDeletedFromScene = function(runtimeScene) {
    gdjs.RuntimeObject.prototype.onDeletedFromScene.call(this, runtimeScene);

    if (this._renderer.ownerRemovedFromScene) {
        this._renderer.ownerRemovedFromScene();
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

gdjs.PanelSpriteRuntimeObject.prototype.setX = function(x) {
    gdjs.RuntimeObject.prototype.setX.call(this, x);
    this._renderer.updatePosition();
};

gdjs.PanelSpriteRuntimeObject.prototype.setY = function(y) {
    gdjs.RuntimeObject.prototype.setY.call(this, y);
    this._renderer.updatePosition();
};

gdjs.PanelSpriteRuntimeObject.prototype.setTexture = function(textureName, runtimeScene) {
    this._renderer.setTexture(textureName, runtimeScene);
};

gdjs.PanelSpriteRuntimeObject.prototype.setAngle = function(angle) {
    gdjs.RuntimeObject.prototype.setAngle.call(this, angle);
    this._renderer.updateAngle();
};

gdjs.PanelSpriteRuntimeObject.prototype.getWidth = function() {
    return this._width;
};

gdjs.PanelSpriteRuntimeObject.prototype.getHeight = function() {
    return this._height;
};

gdjs.PanelSpriteRuntimeObject.prototype.setWidth = function(width) {
    this._width = width;
    this._renderer.updateWidth();
};

gdjs.PanelSpriteRuntimeObject.prototype.setHeight = function(height) {
    this._height = height;
    this._renderer.updateHeight();
};
