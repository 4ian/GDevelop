gdjs.TiledSpriteRuntimeObjectPixiRenderer = function(runtimeObject, runtimeScene, textureName)
{
    this._object = runtimeObject;


    var texture = runtimeScene.getGame().getImageManager().getPIXITexture(textureName);
    if ( this._tiledSprite === undefined ) {
        this._tiledSprite = new PIXI.TilingSprite(texture, 1024, 1024);
    } else {
        this._tiledSprite.texture = texture;
    }

    runtimeScene.getLayer("").getRenderer().addRendererObject(this._tiledSprite, runtimeObject.getZOrder());
    this.updatePosition();
    this.updateAngle();
    this.updateXOffset();
    this.updateYOffset();
};

gdjs.TiledSpriteRuntimeObjectRenderer = gdjs.TiledSpriteRuntimeObjectPixiRenderer; //Register the class to let the engine use it.

gdjs.TiledSpriteRuntimeObjectPixiRenderer.prototype.getRendererObject = function() {
    return this._tiledSprite;
};

gdjs.TiledSpriteRuntimeObjectPixiRenderer.prototype.updateOpacity = function() {
    this._tiledSprite.alpha = this._object.opacity/255;
}

gdjs.TiledSpriteRuntimeObjectPixiRenderer.prototype.updatePosition = function() {
    this._tiledSprite.position.x = this._object.x + this._tiledSprite.width/2;
    this._tiledSprite.position.y = this._object.y + this._tiledSprite.height/2;
};

gdjs.TiledSpriteRuntimeObjectPixiRenderer.prototype.setTexture = function(textureName, runtimeScene) {
    var texture = runtimeScene.getGame().getImageManager().getPIXITexture(textureName);
    this._tiledSprite.texture = texture;
    this.updatePosition();
};

gdjs.TiledSpriteRuntimeObjectPixiRenderer.prototype.updateAngle = function() {
    this._tiledSprite.rotation = gdjs.toRad(this._object.angle);
};

gdjs.TiledSpriteRuntimeObjectPixiRenderer.prototype.getWidth = function() {
    return this._tiledSprite.width;
};

gdjs.TiledSpriteRuntimeObjectPixiRenderer.prototype.getHeight = function() {
    return this._tiledSprite.height;
};

gdjs.TiledSpriteRuntimeObjectPixiRenderer.prototype.setWidth = function(width) {
    this._tiledSprite.width = width;
    this._tiledSprite.pivot.x = width/2;
    this.updatePosition();
};

gdjs.TiledSpriteRuntimeObjectPixiRenderer.prototype.setHeight = function(height) {
    this._tiledSprite.height = height;
    this._tiledSprite.pivot.y = height/2;
    this.updatePosition();
};

gdjs.TiledSpriteRuntimeObjectPixiRenderer.prototype.updateXOffset = function() {
    this._tiledSprite.tilePosition.x = -this._object._xOffset;
};

gdjs.TiledSpriteRuntimeObjectPixiRenderer.prototype.updateYOffset = function() {
    this._tiledSprite.tilePosition.y = -this._object._yOffset;
};

gdjs.TiledSpriteRuntimeObjectPixiRenderer.prototype.setColor = function(rgbColor) {
    var colors = rgbColor.split(";");
    if ( colors.length < 3 ) return;
 
    this._tiledSprite.tint = "0x" + gdjs.rgbToHex(parseInt(colors[0], 10), parseInt(colors[1], 10), parseInt(colors[2], 10));
 };
 
 gdjs.TiledSpriteRuntimeObjectPixiRenderer.prototype.getColor = function() {
     var rgb = PIXI.utils.hex2rgb(this._tiledSprite.tint)
     return Math.floor(rgb[0]*255) + ';' + Math.floor(rgb[1]*255) + ';' + Math.floor(rgb[2]*255);
 }
