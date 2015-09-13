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

    var texture = runtimeScene.getGame().getImageManager().getPIXITexture(objectData.texture);
    if ( this._tiledSprite === undefined ) {
        this._tiledSprite = new PIXI.extras.TilingSprite(texture, 1024, 1024);
    } else {
        this._tiledSprite.texture = texture;
    }

    this.setWidth(objectData.width);
    this.setHeight(objectData.height);
    this._xOffset = 0;
    this._yOffset = 0;

    runtimeScene.getLayer("").addChildToPIXIContainer(this._tiledSprite, this.zOrder);
};

gdjs.TiledSpriteRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.TiledSpriteRuntimeObject.thisIsARuntimeObjectConstructor = "TiledSpriteObject::TiledSprite";

gdjs.TiledSpriteRuntimeObject.prototype.exposePIXIDisplayObject = function(cb) {
    cb(this._tiledSprite);
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

gdjs.TiledSpriteRuntimeObject.prototype._updateTilingSpritePosition = function() {
    this._tiledSprite.position.x = this.x + this._tiledSprite.width/2;
    this._tiledSprite.position.y = this.y + this._tiledSprite.height/2;
};

gdjs.TiledSpriteRuntimeObject.prototype.setX = function(x) {
    gdjs.RuntimeObject.prototype.setX.call(this, x);
    this._updateTilingSpritePosition();
};

gdjs.TiledSpriteRuntimeObject.prototype.setY = function(y) {
    gdjs.RuntimeObject.prototype.setY.call(this, y);
    this._updateTilingSpritePosition();
};

gdjs.TiledSpriteRuntimeObject.prototype.setTexture = function(textureName, runtimeScene) {
    var texture = runtimeScene.getGame().getImageManager().getPIXITexture(textureName);
    this._tiledSprite.texture = texture;
    this._updateTilingSpritePosition();
};

gdjs.TiledSpriteRuntimeObject.prototype.setAngle = function(angle) {
    gdjs.RuntimeObject.prototype.setAngle.call(this, angle);
    this._tiledSprite.rotation = gdjs.toRad(angle);
};

gdjs.TiledSpriteRuntimeObject.prototype.getWidth = function() {
    return this._tiledSprite.width;
};

gdjs.TiledSpriteRuntimeObject.prototype.getHeight = function() {
    return this._tiledSprite.height;
};

gdjs.TiledSpriteRuntimeObject.prototype.setWidth = function(width) {
    this._tiledSprite.width = width;
    this._tiledSprite.pivot.x = width/2;
    this._updateTilingSpritePosition();
};

gdjs.TiledSpriteRuntimeObject.prototype.setHeight = function(height) {
    this._tiledSprite.height = height;
    this._tiledSprite.pivot.y = height/2;
    this._updateTilingSpritePosition();
};

gdjs.TiledSpriteRuntimeObject.prototype.setXOffset = function(xOffset) {
    this._xOffset = xOffset;
    this._tiledSprite.tilePosition.x =  -xOffset;
};

gdjs.TiledSpriteRuntimeObject.prototype.setYOffset = function(yOffset) {
    this._yOffset = yOffset;
    this._tiledSprite.tilePosition.y =  -yOffset;
};

gdjs.TiledSpriteRuntimeObject.prototype.getXOffset = function() {
    return this._xOffset;
};

gdjs.TiledSpriteRuntimeObject.prototype.getYOffset = function() {
    return this._yOffset;
};
