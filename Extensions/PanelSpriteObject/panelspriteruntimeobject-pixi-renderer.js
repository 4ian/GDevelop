gdjs.PanelSpriteRuntimeObjectPixiRenderer = function(runtimeObject, runtimeScene, textureName, tiled)
{
    this._object = runtimeObject;

    if ( this._spritesContainer === undefined ) {
        var texture = runtimeScene.getGame().getImageManager().getPIXITexture(textureName);

        var StretchedSprite = !tiled ? PIXI.Sprite : PIXI.extras.TilingSprite;

        this._spritesContainer = new PIXI.Container();
        this._centerSprite = new StretchedSprite(new PIXI.Texture(texture));
        this._borderSprites = [
            new StretchedSprite(new PIXI.Texture(texture)), //Right
            new PIXI.Sprite(texture), //Top-Right
            new StretchedSprite(new PIXI.Texture(texture)), //Top
            new PIXI.Sprite(texture), //Top-Left
            new StretchedSprite(new PIXI.Texture(texture)), //Left
            new PIXI.Sprite(texture), //Bottom-Left
            new StretchedSprite(new PIXI.Texture(texture)), //Bottom
            new PIXI.Sprite(texture)  //Bottom-Right
        ];
    }

    this.setTexture(textureName, runtimeScene);

    this._spritesContainer.removeChildren();
    this._spritesContainer.addChild(this._centerSprite);
    for (var i = 0;i < this._borderSprites.length;++i) {
        this._spritesContainer.addChild(this._borderSprites[i]);
    }

    runtimeScene.getLayer("").getRenderer().addRendererObject(this._spritesContainer, runtimeObject.getZOrder());
};

gdjs.PanelSpriteRuntimeObjectRenderer = gdjs.PanelSpriteRuntimeObjectPixiRenderer; //Register the class to let the engine use it.

gdjs.PanelSpriteRuntimeObjectPixiRenderer.prototype.getRendererObject = function() {
    return this._spritesContainer;
};

gdjs.PanelSpriteRuntimeObjectPixiRenderer.prototype.ensureUpToDate = function() {
    if (this._spritesContainer.visible && this._wasRendered) {
        this._spritesContainer.cacheAsBitmap = true;
    }

    this._wasRendered = true;
};

gdjs.PanelSpriteRuntimeObjectPixiRenderer.prototype.updateAngle = function() {
    this._spritesContainer.rotation = gdjs.toRad(this._object.angle);
};

gdjs.PanelSpriteRuntimeObjectPixiRenderer.prototype.updatePosition = function() {
    this._spritesContainer.position.x = this._object.x + this._object._width / 2;
    this._spritesContainer.position.y = this._object.y + this._object._height / 2;
}

gdjs.PanelSpriteRuntimeObjectPixiRenderer.prototype._updateLocalPositions = function() {
    var obj = this._object;
    var extraPixels = obj._tiled ? 1 : 0;

    this._centerSprite.position.x = obj._lBorder;
    this._centerSprite.position.y = obj._tBorder;
    this._borderSprites[0].position.x = obj._width - obj._rBorder  - extraPixels * 2;
    this._borderSprites[0].position.y = obj._tBorder;

    this._borderSprites[1].position.x = obj._width - this._borderSprites[1].width  - extraPixels * 2;
    this._borderSprites[1].position.y = 0;

    this._borderSprites[2].position.x = obj._lBorder;
    this._borderSprites[2].position.y = 0;

    this._borderSprites[3].position.x = 0;
    this._borderSprites[3].position.y = 0;

    this._borderSprites[4].position.x = 0;
    this._borderSprites[4].position.y = obj._tBorder;

    this._borderSprites[5].position.x = 0;
    this._borderSprites[5].position.y = obj._height - this._borderSprites[5].height  - extraPixels * 2;

    this._borderSprites[6].position.x = obj._lBorder;
    this._borderSprites[6].position.y = obj._height - obj._bBorder  - extraPixels * 3; //FIXME: 1 more extra pixel is somewhat needed for pixel perfect alignment

    this._borderSprites[7].position.x = obj._width - this._borderSprites[7].width  - extraPixels * 2;
    this._borderSprites[7].position.y = obj._height - this._borderSprites[7].height - extraPixels * 2;
};

gdjs.PanelSpriteRuntimeObjectPixiRenderer.prototype._updateSpritesAndTexturesSize = function() {
    var obj = this._object;

    this._centerSprite.width = Math.max(obj._width - obj._rBorder - obj._lBorder, 0);
    this._centerSprite.height = Math.max(obj._height - obj._tBorder - obj._bBorder, 0);

    //Top, Bottom, Right, Left borders:
    this._borderSprites[0].width = obj._rBorder;
    this._borderSprites[0].height = Math.max(obj._height - obj._tBorder - obj._bBorder, 0);

    this._borderSprites[2].height = obj._tBorder;
    this._borderSprites[2].width = Math.max(obj._width - obj._rBorder - obj._lBorder, 0);

    this._borderSprites[4].width = obj._lBorder;
    this._borderSprites[4].height = Math.max(obj._height - obj._tBorder - obj._bBorder, 0);

    this._borderSprites[6].height = obj._bBorder;
    this._borderSprites[6].width = Math.max(obj._width - obj._rBorder - obj._lBorder, 0);

    this._wasRendered = true;
    this._spritesContainer.cacheAsBitmap = false;
};

gdjs.PanelSpriteRuntimeObjectPixiRenderer.prototype.setTexture = function(textureName, runtimeScene) {
    var obj = this._object;
    var texture = runtimeScene.getGame().getImageManager().getPIXITexture(textureName);

    function makeInsideTexture(rect) { //TODO
        if (rect.width < 0) rect.width = 0;
        if (rect.height < 0) rect.height = 0;
        if (rect.x < 0) rect.x = 0;
        if (rect.y < 0) rect.y = 0;
        if (rect.x > texture.width) rect.x = texture.width;
        if (rect.y > texture.height) rect.y = texture.height;
        if (rect.x + rect.width > texture.width) rect.width = texture.width - rect.x;
        if (rect.y + rect.height > texture.height) rect.height = texture.height - rect.y;

        return rect;
    }

    this._centerSprite.texture = new PIXI.Texture(texture,
        makeInsideTexture(new PIXI.Rectangle(obj._lBorder, obj._tBorder,
        texture.width - obj._lBorder - obj._rBorder,
        texture.height - obj._tBorder - obj._bBorder)));

    //Top, Bottom, Right, Left borders:
    this._borderSprites[0].texture = new PIXI.Texture(texture,
        makeInsideTexture(new PIXI.Rectangle(texture.width - obj._rBorder - 1, obj._tBorder, obj._rBorder + 1,
        texture.height - obj._tBorder - obj._bBorder)));
    this._borderSprites[2].texture = new PIXI.Texture(texture,
        makeInsideTexture(new PIXI.Rectangle(obj._lBorder, 0, texture.width - obj._lBorder - obj._rBorder, obj._tBorder + 1)));
    this._borderSprites[4].texture = new PIXI.Texture(texture,
        makeInsideTexture(new PIXI.Rectangle(0, obj._tBorder, obj._lBorder + 1, texture.height - obj._tBorder - obj._bBorder)));
    this._borderSprites[6].texture = new PIXI.Texture(texture,
        makeInsideTexture(new PIXI.Rectangle(obj._lBorder, texture.height - obj._bBorder - 1,
        texture.width - obj._lBorder - obj._rBorder, obj._bBorder + 1)));


    this._borderSprites[1].texture = new PIXI.Texture(texture,
        makeInsideTexture(new PIXI.Rectangle(this._borderSprites[1].width - obj._rBorder, 0, obj._rBorder, obj._tBorder)));
    this._borderSprites[3].texture = new PIXI.Texture(texture,
        makeInsideTexture(new PIXI.Rectangle(0, 0, obj._lBorder, obj._tBorder)));
    this._borderSprites[5].texture = new PIXI.Texture(texture,
        makeInsideTexture(new PIXI.Rectangle(0, this._borderSprites[5].height - obj._bBorder, obj._lBorder, obj._bBorder)));
    this._borderSprites[7].texture = new PIXI.Texture(texture,
        makeInsideTexture(new PIXI.Rectangle(this._borderSprites[7].width - obj._rBorder, this._borderSprites[7].height - obj._bBorder, obj._rBorder, obj._bBorder)));

    this._updateSpritesAndTexturesSize();
    this._updateLocalPositions();
    this.updatePosition();
    this._spritesContainer.pivot.x = this._object._width / 2;
    this._spritesContainer.pivot.y = this._object._height / 2;
};

gdjs.PanelSpriteRuntimeObjectPixiRenderer.prototype.updateWidth = function() {
    this._spritesContainer.pivot.x = this._object._width / 2;
    this._updateSpritesAndTexturesSize();
    this._updateLocalPositions();
    this.updatePosition();
};

gdjs.PanelSpriteRuntimeObjectPixiRenderer.prototype.updateHeight = function() {
    this._spritesContainer.pivot.y = this._object._height / 2;
    this._updateSpritesAndTexturesSize();
    this._updateLocalPositions();
    this.updatePosition();
};
