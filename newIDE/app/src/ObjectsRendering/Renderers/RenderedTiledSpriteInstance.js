import RenderedInstance from './RenderedInstance';
import * as PIXI from 'pixi.js-legacy';
const gd /* TODO: add flow in this file */ = global.gd;

/**
 * Renderer for gd.TiledSpriteObject
 *
 * @extends RenderedInstance
 * @class RenderedTiledSpriteInstance
 * @constructor
 */
function RenderedTiledSpriteInstance(
  project,
  layout,
  instance,
  associatedObjectConfiguration,
  pixiContainer,
  pixiResourcesLoader
) {
  RenderedInstance.call(
    this,
    project,
    layout,
    instance,
    associatedObjectConfiguration,
    pixiContainer,
    pixiResourcesLoader
  );

  //Setup the PIXI object:
  let tiledSprite = gd.asTiledSpriteConfiguration(
    associatedObjectConfiguration
  );
  this._texture = tiledSprite.getTexture();
  this._pixiObject = new PIXI.TilingSprite(
    this._pixiResourcesLoader.getPIXITexture(project, tiledSprite.getTexture()),
    tiledSprite.getWidth(),
    tiledSprite.getHeight()
  );
  this._pixiObject.anchor.x = 0.5;
  this._pixiObject.anchor.y = 0.5;
  this._pixiContainer.addChild(this._pixiObject);
}
RenderedTiledSpriteInstance.prototype = Object.create(
  RenderedInstance.prototype
);

/**
 * Return a URL for thumbnail of the specified object.
 */
RenderedTiledSpriteInstance.getThumbnail = function(
  project,
  resourcesLoader,
  object
) {
  let tiledSprite = gd.asTiledSpriteConfiguration(object.getConfiguration());

  return resourcesLoader.getResourceFullUrl(
    project,
    tiledSprite.getTexture(),
    {}
  );
};

RenderedTiledSpriteInstance.prototype.update = function() {
  let tiledSprite = gd.asTiledSpriteConfiguration(
    this._associatedObjectConfiguration
  );
  if (this._instance.hasCustomSize()) {
    this._pixiObject.width = this._instance.getCustomWidth();
    this._pixiObject.height = this._instance.getCustomHeight();
  } else {
    this._pixiObject.width = tiledSprite.getWidth();
    this._pixiObject.height = tiledSprite.getHeight();
  }

  if (this._texture !== tiledSprite.getTexture()) {
    this._texture = tiledSprite.getTexture();
    this._pixiObject.texture = this._pixiResourcesLoader.getPIXITexture(
      this._project,
      tiledSprite.getTexture()
    );
  }

  this._pixiObject.x = this._instance.getX() + this._pixiObject.width / 2;
  this._pixiObject.y = this._instance.getY() + this._pixiObject.height / 2;
  this._pixiObject.rotation = RenderedInstance.toRad(this._instance.getAngle());
};

RenderedTiledSpriteInstance.prototype.getDefaultWidth = function() {
  let tiledSprite = gd.asTiledSpriteConfiguration(
    this._associatedObjectConfiguration
  );
  return tiledSprite.getWidth();
};

RenderedTiledSpriteInstance.prototype.getDefaultHeight = function() {
  let tiledSprite = gd.asTiledSpriteConfiguration(
    this._associatedObjectConfiguration
  );
  return tiledSprite.getHeight();
};

export default RenderedTiledSpriteInstance;
