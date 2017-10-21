import RenderedInstance from './RenderedInstance';
import PIXI from 'pixi.js';
const gd = global.gd;

/**
 * Renderer for gd.PanelSpriteObject
 *
 * Heavily inspired from the GDJS PIXI renderer for PanelSprite objects.
 * TODO: Find a way to factor GDJS objects and IDE instances renderers.
 *
 * @extends RenderedInstance
 * @class RenderedPanelSpriteInstance
 * @constructor
 */
function RenderedPanelSpriteInstance(
  project,
  layout,
  instance,
  associatedObject,
  pixiContainer,
  pixiResourcesLoader
) {
  RenderedInstance.call(
    this,
    project,
    layout,
    instance,
    associatedObject,
    pixiContainer,
    pixiResourcesLoader
  );

  this.makeObjects();
  this.updateTexture();
}
RenderedPanelSpriteInstance.prototype = Object.create(
  RenderedInstance.prototype
);

RenderedPanelSpriteInstance.prototype.update = function() {
  //TODO
  // if (this._pixiObject.visible && this._wasRendered) {
  //   this._pixiObject.cacheAsBitmap = true;
  // }
  // this._wasRendered = true;

  const panelSprite = gd.asPanelSpriteObject(this._associatedObject);
  if (panelSprite.isTiled() !== this._tiled) {
    this.makeObjects();
  }
  if (panelSprite.getTexture() !== this._textureName) {
    this.updateTexture();
  }

  this.updateAngle();
  this.updatePosition();

  const oldWidth = this._width;
  const oldHeight = this._height;
  if (this._instance.hasCustomSize()) {
    this._width = this._instance.getCustomWidth();
    this._height = this._instance.getCustomHeight();
  } else {
    var tiledSprite = gd.asPanelSpriteObject(this._associatedObject);
    this._width = tiledSprite.getWidth();
    this._height = tiledSprite.getHeight();
  }

  if (this._width !== oldWidth || this._height !== oldHeight) {
    this.updateWidthHeight();
  }
};

RenderedPanelSpriteInstance.prototype.makeObjects = function() {
  const panelSprite = gd.asPanelSpriteObject(this._associatedObject);
  this._textureName = panelSprite.getTexture();
  const texture = this._pixiResourcesLoader.getPIXITexture(
    this._project,
    this._textureName
  );

  this._tiled = panelSprite.isTiled();
  var StretchedSprite = !this._tiled ? PIXI.Sprite : PIXI.extras.TilingSprite;

  if (!this._pixiObject) {
    this._pixiObject = new PIXI.Container();
    this._pixiContainer.addChild(this._pixiObject);
  }
  this._centerSprite = new StretchedSprite(new PIXI.Texture(texture));
  this._borderSprites = [
    new StretchedSprite(new PIXI.Texture(texture)), //Right
    new PIXI.Sprite(texture), //Top-Right
    new StretchedSprite(new PIXI.Texture(texture)), //Top
    new PIXI.Sprite(texture), //Top-Left
    new StretchedSprite(new PIXI.Texture(texture)), //Left
    new PIXI.Sprite(texture), //Bottom-Left
    new StretchedSprite(new PIXI.Texture(texture)), //Bottom
    new PIXI.Sprite(texture), //Bottom-Right
  ];

  this._pixiObject.removeChildren();
  this._pixiObject.addChild(this._centerSprite);
  for (var i = 0; i < this._borderSprites.length; ++i) {
    this._pixiObject.addChild(this._borderSprites[i]);
  }
};

RenderedPanelSpriteInstance.prototype.updateAngle = function() {
  this._pixiObject.rotation = RenderedInstance.toRad(this._instance.getAngle());
};

RenderedPanelSpriteInstance.prototype.updatePosition = function() {
  this._pixiObject.x = this._instance.getX() + this._width / 2;
  this._pixiObject.y = this._instance.getY() + this._height / 2;
};

RenderedPanelSpriteInstance.prototype._updateLocalPositions = function() {
  const panelSprite = gd.asPanelSpriteObject(this._associatedObject);
  var extraPixels = panelSprite.isTiled() ? 1 : 0;

  this._centerSprite.position.x = panelSprite.getLeftMargin();
  this._centerSprite.position.y = panelSprite.getTopMargin();
  this._borderSprites[0].position.x =
    this._width - panelSprite.getRightMargin() - extraPixels * 2;
  this._borderSprites[0].position.y = panelSprite.getTopMargin();

  this._borderSprites[1].position.x =
    this._width - this._borderSprites[1].width - extraPixels * 2;
  this._borderSprites[1].position.y = 0;

  this._borderSprites[2].position.x = panelSprite.getLeftMargin();
  this._borderSprites[2].position.y = 0;

  this._borderSprites[3].position.x = 0;
  this._borderSprites[3].position.y = 0;

  this._borderSprites[4].position.x = 0;
  this._borderSprites[4].position.y = panelSprite.getTopMargin();

  this._borderSprites[5].position.x = 0;
  this._borderSprites[5].position.y =
    this._height - this._borderSprites[5].height - extraPixels * 2;

  this._borderSprites[6].position.x = panelSprite.getLeftMargin();
  this._borderSprites[6].position.y =
    this._height - panelSprite.getBottomMargin() - extraPixels * 3; //FIXME: 1 more extra pixel is somewhat needed for pixel perfect alignment

  this._borderSprites[7].position.x =
    this._width - this._borderSprites[7].width - extraPixels * 2;
  this._borderSprites[7].position.y =
    this._height - this._borderSprites[7].height - extraPixels * 2;
};

RenderedPanelSpriteInstance.prototype._updateSpritesAndTexturesSize = function() {
  const panelSprite = gd.asPanelSpriteObject(this._associatedObject);
  this._centerSprite.width = Math.max(
    this._width - panelSprite.getRightMargin() - panelSprite.getLeftMargin(),
    0
  );
  this._centerSprite.height = Math.max(
    this._height - panelSprite.getTopMargin() - panelSprite.getBottomMargin(),
    0
  );

  //Top, Bottom, Right, Left borders:
  this._borderSprites[0].width = panelSprite.getRightMargin();
  this._borderSprites[0].height = Math.max(
    this._height - panelSprite.getTopMargin() - panelSprite.getBottomMargin(),
    0
  );

  this._borderSprites[2].height = panelSprite.getTopMargin();
  this._borderSprites[2].width = Math.max(
    this._width - panelSprite.getRightMargin() - panelSprite.getLeftMargin(),
    0
  );

  this._borderSprites[4].width = panelSprite.getLeftMargin();
  this._borderSprites[4].height = Math.max(
    this._height - panelSprite.getTopMargin() - panelSprite.getBottomMargin(),
    0
  );

  this._borderSprites[6].height = panelSprite.getBottomMargin();
  this._borderSprites[6].width = Math.max(
    this._width - panelSprite.getRightMargin() - panelSprite.getLeftMargin(),
    0
  );

  this._wasRendered = true;
  this._pixiObject.cacheAsBitmap = false;
};

RenderedPanelSpriteInstance.prototype.updateTexture = function() {
  const panelSprite = gd.asPanelSpriteObject(this._associatedObject);
  this._textureName = panelSprite.getTexture();
  const texture = this._pixiResourcesLoader.getPIXITexture(
    this._project,
    this._textureName
  );

  if (texture.noFrame) {
    //Post pone texture update if texture is not loaded
    const renderer = this;
    texture.on('update', function() {
      renderer.updateTexture();
      texture.off('update', this);
    });

    return;
  }

  console.log('Updating PanelSprite instance texture');
  function makeInsideTexture(rect) {
    if (rect.width < 0) rect.width = 0;
    if (rect.height < 0) rect.height = 0;
    if (rect.x < 0) rect.x = 0;
    if (rect.y < 0) rect.y = 0;
    if (rect.x > texture.width) rect.x = texture.width;
    if (rect.y > texture.height) rect.y = texture.height;
    if (rect.x + rect.width > texture.width)
      rect.width = texture.width - rect.x;
    if (rect.y + rect.height > texture.height)
      rect.height = texture.height - rect.y;

    return rect;
  }

  this._centerSprite.texture = new PIXI.Texture(
    texture,
    makeInsideTexture(
      new PIXI.Rectangle(
        panelSprite.getLeftMargin(),
        panelSprite.getTopMargin(),
        texture.width -
          panelSprite.getLeftMargin() -
          panelSprite.getRightMargin(),
        texture.height -
          panelSprite.getTopMargin() -
          panelSprite.getBottomMargin()
      )
    )
  );

  //Top, Bottom, Right, Left borders:
  this._borderSprites[0].texture = new PIXI.Texture(
    texture,
    makeInsideTexture(
      new PIXI.Rectangle(
        texture.width - panelSprite.getRightMargin() - 1,
        panelSprite.getTopMargin(),
        panelSprite.getRightMargin() + 1,
        texture.height -
          panelSprite.getTopMargin() -
          panelSprite.getBottomMargin()
      )
    )
  );
  this._borderSprites[2].texture = new PIXI.Texture(
    texture,
    makeInsideTexture(
      new PIXI.Rectangle(
        panelSprite.getLeftMargin(),
        0,
        texture.width -
          panelSprite.getLeftMargin() -
          panelSprite.getRightMargin(),
        panelSprite.getTopMargin() + 1
      )
    )
  );
  this._borderSprites[4].texture = new PIXI.Texture(
    texture,
    makeInsideTexture(
      new PIXI.Rectangle(
        0,
        panelSprite.getTopMargin(),
        panelSprite.getLeftMargin() + 1,
        texture.height -
          panelSprite.getTopMargin() -
          panelSprite.getBottomMargin()
      )
    )
  );
  this._borderSprites[6].texture = new PIXI.Texture(
    texture,
    makeInsideTexture(
      new PIXI.Rectangle(
        panelSprite.getLeftMargin(),
        texture.height - panelSprite.getBottomMargin() - 1,
        texture.width -
          panelSprite.getLeftMargin() -
          panelSprite.getRightMargin(),
        panelSprite.getBottomMargin() + 1
      )
    )
  );

  this._borderSprites[1].texture = new PIXI.Texture(
    texture,
    makeInsideTexture(
      new PIXI.Rectangle(
        this._borderSprites[1].width - panelSprite.getRightMargin(),
        0,
        panelSprite.getRightMargin(),
        panelSprite.getTopMargin()
      )
    )
  );
  this._borderSprites[3].texture = new PIXI.Texture(
    texture,
    makeInsideTexture(
      new PIXI.Rectangle(
        0,
        0,
        panelSprite.getLeftMargin(),
        panelSprite.getTopMargin()
      )
    )
  );
  this._borderSprites[5].texture = new PIXI.Texture(
    texture,
    makeInsideTexture(
      new PIXI.Rectangle(
        0,
        this._borderSprites[5].height - panelSprite.getBottomMargin(),
        panelSprite.getLeftMargin(),
        panelSprite.getBottomMargin()
      )
    )
  );
  this._borderSprites[7].texture = new PIXI.Texture(
    texture,
    makeInsideTexture(
      new PIXI.Rectangle(
        this._borderSprites[7].width - panelSprite.getRightMargin(),
        this._borderSprites[7].height - panelSprite.getBottomMargin(),
        panelSprite.getRightMargin(),
        panelSprite.getBottomMargin()
      )
    )
  );

  this._updateSpritesAndTexturesSize();
  this._updateLocalPositions();
  this.updatePosition();
};

RenderedPanelSpriteInstance.prototype.updateWidthHeight = function() {
  this._pixiObject.pivot.x = this._width / 2;
  this._pixiObject.pivot.y = this._height / 2;
  this._updateSpritesAndTexturesSize();
  this._updateLocalPositions();
  this.updatePosition();
};

RenderedPanelSpriteInstance.prototype.getDefaultWidth = function() {
  const panelSprite = gd.asPanelSpriteObject(this._associatedObject);
  return panelSprite.getWidth();
};

RenderedPanelSpriteInstance.prototype.getDefaultHeight = function() {
  const panelSprite = gd.asPanelSpriteObject(this._associatedObject);
  return panelSprite.getHeight();
};

/**
 * Return a URL for thumbnail of the specified object.
 * @method getThumbnail
 * @static
 */
RenderedPanelSpriteInstance.getThumbnail = function(
  project,
  resourcesLoader,
  object
) {
  const panelSprite = gd.asPanelSpriteObject(object);

  return resourcesLoader.getResourceFullFilename(
    project,
    panelSprite.getTexture()
  );
};

export default RenderedPanelSpriteInstance;
