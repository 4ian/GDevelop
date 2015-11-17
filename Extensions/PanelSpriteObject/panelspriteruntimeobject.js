/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * The PanelSpriteRuntimeObject displays a tiled texture.
 *
 * @class PanelSpriteRuntimeObject
 * @extends RuntimeObject
 * @namespace gdjs
 */
gdjs.PanelSpriteRuntimeObject = function(runtimeScene, objectData)
{
    gdjs.RuntimeObject.call(this, runtimeScene, objectData);

    if ( this._spritesContainer === undefined ) {
        var texture = runtimeScene.getGame().getImageManager().getPIXITexture(objectData.texture);

        var StretchedSprite = !objectData.tiled ?
            PIXI.Sprite : PIXI.extras.TilingSprite;

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

    this._rBorder = objectData.rightMargin;
    this._lBorder = objectData.leftMargin;
    this._tBorder = objectData.topMargin;
    this._bBorder = objectData.bottomMargin;
    this._tiled = objectData.tiled;
    this.setTexture(objectData.texture, runtimeScene);
    this.setWidth(objectData.width);
    this.setHeight(objectData.height);

    this._spritesContainer.removeChildren();
    this._spritesContainer.addChild(this._centerSprite);
    for (var i = 0;i < this._borderSprites.length;++i) {
        this._spritesContainer.addChild(this._borderSprites[i]);
    }
    runtimeScene.getLayer("").addChildToPIXIContainer(this._spritesContainer, this.zOrder);
};

gdjs.PanelSpriteRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.PanelSpriteRuntimeObject.thisIsARuntimeObjectConstructor = "PanelSpriteObject::PanelSprite";

gdjs.PanelSpriteRuntimeObject.prototype.exposePIXIDisplayObject = function(cb) {
    cb(this._spritesContainer);
};

gdjs.PanelSpriteRuntimeObject.prototype.updateTime = function() {
    if (this._spritesContainer.visible && this._wasRendered) {
        this._spritesContainer.cacheAsBitmap = true;
    }

    this._wasRendered = true;
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

gdjs.PanelSpriteRuntimeObject.prototype._updateSpritePositions = function() {
    this._spritesContainer.position.x = this.x + this._width / 2;
    this._spritesContainer.position.y = this.y + this._height / 2;

    var extraPixels = this._tiled ? 1 : 0;

    this._centerSprite.position.x = this._lBorder;
    this._centerSprite.position.y = this._tBorder;
    this._borderSprites[0].position.x = this._width - this._rBorder  - extraPixels * 2;
    this._borderSprites[0].position.y = this._tBorder;

    this._borderSprites[1].position.x = this._width - this._borderSprites[1].width  - extraPixels * 2;
    this._borderSprites[1].position.y = 0;

    this._borderSprites[2].position.x = this._lBorder;
    this._borderSprites[2].position.y = 0;

    this._borderSprites[3].position.x = 0;
    this._borderSprites[3].position.y = 0;

    this._borderSprites[4].position.x = 0;
    this._borderSprites[4].position.y = this._tBorder;

    this._borderSprites[5].position.x = 0;
    this._borderSprites[5].position.y = this._height - this._borderSprites[5].height  - extraPixels * 2;

    this._borderSprites[6].position.x = this._lBorder;
    this._borderSprites[6].position.y = this._height - this._bBorder  - extraPixels * 2;

    this._borderSprites[7].position.x = this._width - this._borderSprites[7].width  - extraPixels * 2;
    this._borderSprites[7].position.y = this._height - this._borderSprites[7].height - extraPixels * 2;
};

gdjs.PanelSpriteRuntimeObject.prototype._updateSpritesAndTexturesSize = function() {

    this._centerSprite.width = Math.max(this._width - this._rBorder - this._lBorder, 0);
    this._centerSprite.height = Math.max(this._height - this._tBorder - this._bBorder, 0);

    //Top, Bottom, Right, Left borders:
    this._borderSprites[0].width = this._rBorder;
    this._borderSprites[0].height = Math.max(this._height - this._tBorder - this._bBorder, 0);

    this._borderSprites[2].height = this._tBorder;
    this._borderSprites[2].width = Math.max(this._width - this._rBorder - this._lBorder, 0);

    this._borderSprites[4].width = this._lBorder;
    this._borderSprites[4].height = Math.max(this._height - this._tBorder - this._bBorder, 0);

    this._borderSprites[6].height = this._bBorder;
    this._borderSprites[6].width = Math.max(this._width - this._rBorder - this._lBorder, 0);

    this._wasRendered = true;
    this._spritesContainer.cacheAsBitmap = false;
};

gdjs.PanelSpriteRuntimeObject.prototype.setX = function(x) {
    gdjs.RuntimeObject.prototype.setX.call(this, x);
    this._updateSpritePositions();
};

gdjs.PanelSpriteRuntimeObject.prototype.setY = function(y) {
    gdjs.RuntimeObject.prototype.setY.call(this, y);
    this._updateSpritePositions();
};

gdjs.PanelSpriteRuntimeObject.prototype.setTexture = function(textureName, runtimeScene) {
    var texture = runtimeScene.getGame().getImageManager().getPIXITexture(textureName);

    function makeInsideTexture(rect) {
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
        makeInsideTexture(new PIXI.Rectangle(this._lBorder, this._tBorder,
        texture.width - this._lBorder - this._rBorder,
        texture.height - this._tBorder - this._bBorder)));

    //Top, Bottom, Right, Left borders:
    this._borderSprites[0].texture = new PIXI.Texture(texture,
        makeInsideTexture(new PIXI.Rectangle(texture.width - this._rBorder - 1, this._tBorder, this._rBorder + 1,
        texture.height - this._tBorder - this._bBorder)));
    this._borderSprites[2].texture = new PIXI.Texture(texture,
        makeInsideTexture(new PIXI.Rectangle(this._lBorder, 0, texture.width - this._lBorder - this._rBorder, this._tBorder + 1)));
    this._borderSprites[4].texture = new PIXI.Texture(texture,
        makeInsideTexture(new PIXI.Rectangle(0, this._tBorder, this._lBorder + 1, texture.height - this._tBorder - this._bBorder)));
    this._borderSprites[6].texture = new PIXI.Texture(texture,
        makeInsideTexture(new PIXI.Rectangle(this._lBorder, texture.height - this._bBorder - 1,
        texture.width - this._lBorder - this._rBorder, this._bBorder + 1)));


    this._borderSprites[1].texture = new PIXI.Texture(texture,
        makeInsideTexture(new PIXI.Rectangle(this._borderSprites[1].width - this._rBorder, 0, this._rBorder, this._tBorder)));
    this._borderSprites[3].texture = new PIXI.Texture(texture,
        makeInsideTexture(new PIXI.Rectangle(0, 0, this._lBorder, this._tBorder)));
    this._borderSprites[5].texture = new PIXI.Texture(texture,
        makeInsideTexture(new PIXI.Rectangle(0, this._borderSprites[5].height - this._bBorder, this._lBorder, this._bBorder)));
    this._borderSprites[7].texture = new PIXI.Texture(texture,
        makeInsideTexture(new PIXI.Rectangle(this._borderSprites[7].width - this._rBorder, this._borderSprites[7].height - this._bBorder, this._rBorder, this._bBorder)));

    this._updateSpritesAndTexturesSize();
    this._updateSpritePositions();
};

gdjs.PanelSpriteRuntimeObject.prototype.setAngle = function(angle) {
    gdjs.RuntimeObject.prototype.setAngle.call(this, angle);
    this._spritesContainer.rotation = gdjs.toRad(angle);
};

gdjs.PanelSpriteRuntimeObject.prototype.getWidth = function() {
    return this._width;
};

gdjs.PanelSpriteRuntimeObject.prototype.getHeight = function() {
    return this._height;
};

gdjs.PanelSpriteRuntimeObject.prototype.setWidth = function(width) {
    this._width = width;
    this._spritesContainer.pivot.x = width / 2;
    this._updateSpritesAndTexturesSize();
    this._updateSpritePositions();
};

gdjs.PanelSpriteRuntimeObject.prototype.setHeight = function(height) {
    this._height = height;
    this._spritesContainer.pivot.y = height / 2;
    this._updateSpritesAndTexturesSize();
    this._updateSpritePositions();
};
