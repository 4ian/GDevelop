gdjs.PanelSpriteRuntimeObjectCocosRenderer = function(runtimeObject, runtimeScene, textureName, tiled)
{
    this._object = runtimeObject;

    //TODO: Support for objectData.tiled

    var texture = runtimeScene.getGame().getImageManager().getTexture(textureName);

    this._spritesContainer = new cc.Node();
    this._centerSprite = new cc.Sprite(texture);
    this._borderSprites = [
        new cc.Sprite(texture), //Right
        new cc.Sprite(texture), //Top-Right
        new cc.Sprite(texture), //Top
        new cc.Sprite(texture), //Top-Left
        new cc.Sprite(texture), //Left
        new cc.Sprite(texture), //Bottom-Left
        new cc.Sprite(texture), //Bottom
        new cc.Sprite(texture)  //Bottom-Right
    ];

    var renderer = runtimeScene.getLayer("").getRenderer();
    renderer.addRendererObject(this._spritesContainer, runtimeObject.getZOrder());
    this._convertYPosition = renderer.convertYPosition;

    this.setTexture(textureName, runtimeScene);

    this._spritesContainer.addChild(this._centerSprite, 1);
    this._spritesContainer.setAnchorPoint(0.5,0.5);
    this._centerSprite.setAnchorPoint(0,0);
    for (var i = 0;i < this._borderSprites.length;++i) {
        this._spritesContainer.addChild(this._borderSprites[i], (i % 2 == 0) ? 0 : 1);
        this._borderSprites[i].setAnchorPoint(0,0);
    }
};

gdjs.PanelSpriteRuntimeObjectRenderer = gdjs.PanelSpriteRuntimeObjectCocosRenderer; //Register the class to let the engine use it.

gdjs.PanelSpriteRuntimeObjectCocosRenderer.prototype.exposeRendererObject = function(cb) {
    cb(this._spritesContainer);
};

gdjs.PanelSpriteRuntimeObjectCocosRenderer.prototype.ensureUpToDate = function() {
};

gdjs.PanelSpriteRuntimeObjectCocosRenderer.prototype.updateAngle = function() {
    this._spritesContainer.setRotation(this._object.angle);
};

gdjs.PanelSpriteRuntimeObjectCocosRenderer.prototype.updatePosition = function() {
    this._spritesContainer.setContentSize(this._object._width, this._object._height);
    this._spritesContainer.setPositionX(this._object.x + this._object._width/2);
    this._spritesContainer.setPositionY(this._convertYPosition(this._object.y + this._object._height/2));
};

gdjs.PanelSpriteRuntimeObjectCocosRenderer.prototype._updateLocalPositions = function() {
    var obj = this._object;

    this._centerSprite.setPositionX(obj._lBorder);
    this._centerSprite.setPositionY(obj._tBorder);
    this._borderSprites[0].setPositionX(obj._width - obj._rBorder);
    this._borderSprites[0].setPositionY(obj._tBorder);

    this._borderSprites[1].setPositionX(obj._width - obj._rBorder);
    this._borderSprites[1].setPositionY(0);

    this._borderSprites[2].setPositionX(obj._lBorder);
    this._borderSprites[2].setPositionY(0);

    this._borderSprites[3].setPositionX(0);
    this._borderSprites[3].setPositionY(0);

    this._borderSprites[4].setPositionX(0);
    this._borderSprites[4].setPositionY(obj._tBorder);

    this._borderSprites[5].setPositionX(0);
    this._borderSprites[5].setPositionY(obj._height - obj._bBorder);

    this._borderSprites[6].setPositionX(obj._lBorder);
    this._borderSprites[6].setPositionY(obj._height - obj._bBorder);

    this._borderSprites[7].setPositionX(obj._width - obj._rBorder);
    this._borderSprites[7].setPositionY(obj._height - obj._bBorder);
};

gdjs.PanelSpriteRuntimeObjectCocosRenderer.prototype._updateSpritesAndTexturesSize = function() {
    var obj = this._object;

    this._centerSprite.setScaleX(Math.max(obj._width - obj._rBorder - obj._lBorder, 0)
        / this._centerSprite.getContentSize().width);
    this._centerSprite.setScaleY(Math.max(obj._height - obj._tBorder - obj._bBorder, 0)
        / this._centerSprite.getContentSize().height);

    //Top, Bottom, Right, Left borders:
    this._borderSprites[0].setScaleY(Math.max(obj._height - obj._tBorder - obj._bBorder, 0)
        / this._borderSprites[0].getContentSize().height);

    this._borderSprites[2].setScaleX(Math.max(obj._width - obj._rBorder - obj._lBorder, 0)
        / this._borderSprites[2].getContentSize().width);

    this._borderSprites[4].setScaleY(Math.max(obj._height - obj._tBorder - obj._bBorder, 0)
        / this._borderSprites[4].getContentSize().height);

    this._borderSprites[6].setScaleX(Math.max(obj._width - obj._rBorder - obj._lBorder, 0)
        / this._borderSprites[6].getContentSize().width);
};

gdjs.PanelSpriteRuntimeObjectCocosRenderer.prototype.setTexture = function(textureName, runtimeScene) {
    var obj = this._object;
    var texture = runtimeScene.getGame().getImageManager().getTexture(textureName);

    function makeInsideTexture(rect) {
        if (rect.width < 0) rect.width = 0;
        if (rect.height < 0) rect.height = 0;
        if (rect.x < 0) rect.x = 0;
        if (rect.y < 0) rect.y = 0;
        if (rect.x > texture.pixelsWidth) rect.x = texture.pixelsWidth;
        if (rect.y > texture.pixelsHeight) rect.y = texture.pixelsHeight;
        if (rect.x + rect.width > texture.pixelsWidth) rect.width = texture.pixelsWidth - rect.x;
        if (rect.y + rect.height > texture.pixelsHeight) rect.height = texture.pixelsHeight - rect.y;

        return rect;
    }

    this._centerSprite.setTexture(texture);
    this._centerSprite.setTextureRect(makeInsideTexture(cc.rect(obj._lBorder, obj._tBorder,
        texture.pixelsWidth - obj._lBorder - obj._rBorder,
        texture.pixelsHeight - obj._tBorder - obj._bBorder)));

    //Top, Bottom, Right, Left borders:
    this._borderSprites[0].setTexture(texture);
    this._borderSprites[0].setTextureRect(makeInsideTexture(cc.rect(texture.pixelsWidth - obj._rBorder - 1, obj._tBorder, obj._rBorder + 1,
        texture.pixelsHeight - obj._tBorder - obj._bBorder)));
    this._borderSprites[6].setTexture(texture);
    this._borderSprites[6].setTextureRect(makeInsideTexture(cc.rect(obj._lBorder, 0, texture.pixelsWidth - obj._lBorder - obj._rBorder, obj._bBorder + 1)));
    this._borderSprites[4].setTexture(texture);
    this._borderSprites[4].setTextureRect(makeInsideTexture(cc.rect(0, obj._tBorder, obj._lBorder + 1, texture.pixelsHeight - obj._tBorder - obj._bBorder)));
    this._borderSprites[2].setTexture(texture);
    this._borderSprites[2].setTextureRect(makeInsideTexture(cc.rect(obj._lBorder, texture.pixelsHeight - obj._tBorder - 1,
        texture.pixelsWidth - obj._lBorder - obj._rBorder, obj._tBorder + 1)));

    //Corners:
    this._borderSprites[1].setTexture(texture);
    this._borderSprites[1].setTextureRect(makeInsideTexture(cc.rect(texture.pixelsWidth - obj._rBorder, texture.pixelsHeight - obj._tBorder, obj._rBorder, obj._tBorder)));
    this._borderSprites[3].setTexture(texture);
    this._borderSprites[3].setTextureRect(makeInsideTexture(cc.rect(0, texture.pixelsHeight - obj._tBorder, obj._lBorder, obj._tBorder)));
    this._borderSprites[5].setTexture(texture);
    this._borderSprites[5].setTextureRect(makeInsideTexture(cc.rect(0, 0, obj._lBorder, obj._bBorder)));
    this._borderSprites[7].setTexture(texture);
    this._borderSprites[7].setTextureRect(makeInsideTexture(cc.rect(texture.pixelsWidth - obj._rBorder, 0, obj._rBorder, obj._bBorder)));

    this._updateSpritesAndTexturesSize();
    this._updateLocalPositions();
    this.updatePosition();
};

gdjs.PanelSpriteRuntimeObjectCocosRenderer.prototype.updateWidth = function() {
    this._updateSpritesAndTexturesSize();
    this._updateLocalPositions();
    this.updatePosition();
};

gdjs.PanelSpriteRuntimeObjectCocosRenderer.prototype.updateHeight = function() {
    this._updateSpritesAndTexturesSize();
    this._updateLocalPositions();
    this.updatePosition();
};
