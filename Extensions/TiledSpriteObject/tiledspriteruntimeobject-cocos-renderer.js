gdjs.TiledSpriteRuntimeObjectCocosRenderer = function(runtimeObject, runtimeScene, textureName)
{
    this._object = runtimeObject;
    this._cachedWidth = 32;
    this._cachedHeight = 32;

    this._sprite = new cc.Sprite(runtimeScene.getGame().getImageManager().getInvalidTexture());

    var renderer = runtimeScene.getLayer("").getRenderer();
    renderer.addRendererObject(this._sprite, runtimeObject.getZOrder());
    this._convertYPosition = renderer.convertYPosition;

    this.setTexture(textureName, runtimeScene);
};

gdjs.TiledSpriteRuntimeObjectRenderer = gdjs.TiledSpriteRuntimeObjectCocosRenderer; //Register the class to let the engine use it.

gdjs.TiledSpriteRuntimeObjectCocosRenderer.prototype.exposeRendererObject = function(cb) {
    cb(this._sprite);
};

gdjs.TiledSpriteRuntimeObjectCocosRenderer.prototype.updatePosition = function() {
    this._sprite.setPositionX(this._object.x + this._cachedWidth/2);
    this._sprite.setPositionY(this._convertYPosition(this._object.y + this._cachedHeight/2));
};

gdjs.TiledSpriteRuntimeObjectCocosRenderer.prototype._updateTextureRect = function() {
    if (this._isPowerOf2) {
        this._sprite.setTextureRect(cc.rect(this._object._xOffset, this._object._yOffset,
            this._object._xOffset + this._cachedWidth, this._object._yOffset + this._cachedHeight));
    } else {
        //TODO: Tiling is not handled for not power-of-2 texture, texture is
        //just stretched for now to fill the object.
        this._sprite.setScaleX(this._cachedWidth / this._cachedTextureWidth);
        this._sprite.setScaleY(this._cachedHeight / this._cachedTextureHeight);
    }
};

gdjs.TiledSpriteRuntimeObjectCocosRenderer.prototype.setTexture = function(textureName, runtimeScene) {
    var imageManager = runtimeScene.getGame().getImageManager();
    var texture = imageManager.getTexture(textureName);

    this._isPowerOf2 = imageManager.isPowerOf2(texture);
    if (this._isPowerOf2) {
        texture.setTexParameters({minFilter: gl.LINEAR, magFilter: gl.LINEAR, wrapS: gl.REPEAT, wrapT: gl.REPEAT});
    }

    var spriteFrame = cc.SpriteFrame.createWithTexture(texture,
        cc.rect(0, 0, texture.pixelsWidth, texture.pixelsHeight));
    this._cachedTextureWidth = texture.pixelsWidth;
    this._cachedTextureHeight = texture.pixelsHeight;

    this._sprite.setSpriteFrame(spriteFrame);
    this.updatePosition();
    this._updateTextureRect();
};

gdjs.TiledSpriteRuntimeObjectCocosRenderer.prototype.updateAngle = function() {
    this._sprite.setRotation(this._object.angle);
};

gdjs.TiledSpriteRuntimeObjectCocosRenderer.prototype.getWidth = function() {
    return this._cachedWidth;
};

gdjs.TiledSpriteRuntimeObjectCocosRenderer.prototype.getHeight = function() {
    return this._cachedHeight;
};

gdjs.TiledSpriteRuntimeObjectCocosRenderer.prototype.setWidth = function(width) {
    this._cachedWidth = width;
    this._updateTextureRect();
    this.updatePosition();
};

gdjs.TiledSpriteRuntimeObjectCocosRenderer.prototype.setHeight = function(height) {
    this._cachedHeight = height;
    this._updateTextureRect();
    this.updatePosition();
};

gdjs.TiledSpriteRuntimeObjectCocosRenderer.prototype.updateXOffset = function() {
    this._updateTextureRect();
};

gdjs.TiledSpriteRuntimeObjectCocosRenderer.prototype.updateYOffset = function() {
    this._updateTextureRect();
};
