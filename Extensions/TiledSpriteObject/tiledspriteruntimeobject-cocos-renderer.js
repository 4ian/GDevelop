gdjs.TiledSpriteRuntimeObjectCocosRenderer = function(runtimeObject, runtimeScene, textureName)
{
    this._object = runtimeObject;
    this._cachedWidth = 32;
    this._cachedHeight = 32;

    this._sprite = new cc.Sprite(runtimeScene.getGame().getImageManager().getInvalidTexture());
    this._shader = gdjs.CocosTools.makeTilingShader();
    if (this._shader) {
        this._shader.retain();
        this._pixelSizeUniform = this._shader.getUniformLocationForName('uPixelSize');
        this._frameUniform = this._shader.getUniformLocationForName('uFrame');
        this._transformUniform = this._shader.getUniformLocationForName('uTransform');
    }

    var renderer = runtimeScene.getLayer("").getRenderer();
    renderer.addRendererObject(this._sprite, runtimeObject.getZOrder());
    this._convertYPosition = renderer.convertYPosition;

    this.setTexture(textureName, runtimeScene);
    this.updateAngle();
};

gdjs.TiledSpriteRuntimeObjectRenderer = gdjs.TiledSpriteRuntimeObjectCocosRenderer; //Register the class to let the engine use it.

gdjs.TiledSpriteRuntimeObjectCocosRenderer.prototype.onDestroy = function() {
    if (this._shader) this._shader.release();
}

gdjs.TiledSpriteRuntimeObjectCocosRenderer.prototype.getRendererObject = function() {
    return this._sprite;
};

gdjs.TiledSpriteRuntimeObjectCocosRenderer.prototype.updatePosition = function() {
    this._sprite.setPositionX(this._object.x + this._cachedWidth/2);
    this._sprite.setPositionY(this._convertYPosition(this._object.y + this._cachedHeight/2));
};

gdjs.TiledSpriteRuntimeObjectCocosRenderer.prototype._updateTextureRect = function() {
    this._sprite.setScaleX(this._cachedWidth / this._cachedTextureWidth);
    this._sprite.setScaleY(this._cachedHeight / this._cachedTextureHeight);

    if (this._shader) {
        this._shader.use();
        gdjs.CocosTools.setUniformLocationWith4f(this._sprite, this._shader, this._transformUniform,
            'uTransform',
            -(this._object._xOffset % (this._cachedTextureWidth)) / this._cachedWidth,
            -(this._object._yOffset % (this._cachedTextureHeight)) / this._cachedHeight,
            this._cachedTextureWidth / this._cachedWidth,
            this._cachedTextureHeight / this._cachedHeight
        );
    }
};

gdjs.TiledSpriteRuntimeObjectCocosRenderer.prototype.setTexture = function(textureName, runtimeScene) {
    var imageManager = runtimeScene.getGame().getImageManager();
    var texture = imageManager.getTexture(textureName);

    var spriteFrame = cc.SpriteFrame.createWithTexture(texture,
        cc.rect(0, 0, texture.pixelsWidth, texture.pixelsHeight));
    this._cachedTextureWidth = texture.pixelsWidth;
    this._cachedTextureHeight = texture.pixelsHeight;

    this._sprite.setSpriteFrame(spriteFrame);

    if (this._shader) {
        this._sprite.setShaderProgram(this._shader);
        this._shader.use();
        gdjs.CocosTools.setUniformLocationWith2f(this._sprite, this._shader, this._pixelSizeUniform,
            'uPixelSize', 1.0 / this._cachedTextureWidth, 1.0 / this._cachedTextureHeight);
        gdjs.CocosTools.setUniformLocationWith4f(this._sprite, this._shader, this._frameUniform,
            'uFrame', 0, 0, 1, 1);
        gdjs.CocosTools.setUniformLocationWith4f(this._sprite, this._shader, this._transformUniform,
            'uTransform', 0, 0, 1, 1);
    }

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
