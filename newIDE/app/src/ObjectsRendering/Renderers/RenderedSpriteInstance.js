import RenderedInstance from './RenderedInstance';
import * as PIXI from 'pixi.js-legacy';
const gd /* TODO: add flow in this file */ = global.gd;

/**
 * Renderer for gd.SpriteObject
 *
 * @extends RenderedInstance
 * @class RenderedSpriteInstance
 * @constructor
 */
function RenderedSpriteInstance(
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

  this._renderedAnimation = 0;
  this._renderedDirection = 0;
  this._centerX = 0;
  this._centerY = 0;
  this._originX = 0;
  this._originY = 0;

  //Setup the PIXI object:
  this._pixiObject = new PIXI.Sprite(
    this._pixiResourcesLoader.getInvalidPIXITexture()
  );
  this._pixiContainer.addChild(this._pixiObject);
  this.updatePIXITextureAndSprite();
}
RenderedSpriteInstance.prototype = Object.create(RenderedInstance.prototype);

/**
 * Return a URL for thumbnail of the specified object.
 */
RenderedSpriteInstance.getThumbnail = function(
  project,
  resourcesLoader,
  object
) {
  const spriteObject = gd.asSpriteObject(object.getConfiguration());

  if (
    spriteObject.getAnimationsCount() > 0 &&
    spriteObject.getAnimation(0).getDirectionsCount() > 0 &&
    spriteObject
      .getAnimation(0)
      .getDirection(0)
      .getSpritesCount() > 0
  ) {
    const imageName = spriteObject
      .getAnimation(0)
      .getDirection(0)
      .getSprite(0)
      .getImageName();
    return resourcesLoader.getResourceFullUrl(project, imageName, {});
  }

  return 'res/unknown32.png';
};

RenderedSpriteInstance.prototype.updatePIXISprite = function() {
  this._pixiObject.anchor.x =
    this._centerX / this._pixiObject.texture.frame.width;
  this._pixiObject.anchor.y =
    this._centerY / this._pixiObject.texture.frame.height;
  this._pixiObject.rotation = this._shouldNotRotate
    ? 0
    : RenderedInstance.toRad(this._instance.getAngle());
  if (this._instance.hasCustomSize()) {
    this._pixiObject.scale.x =
      this._instance.getCustomWidth() / this._pixiObject.texture.frame.width;
    this._pixiObject.scale.y =
      this._instance.getCustomHeight() / this._pixiObject.texture.frame.height;
  } else {
    this._pixiObject.scale.x = 1;
    this._pixiObject.scale.y = 1;
  }
  this._pixiObject.position.x =
    this._instance.getX() +
    (this._centerX - this._originX) * Math.abs(this._pixiObject.scale.x);
  this._pixiObject.position.y =
    this._instance.getY() +
    (this._centerY - this._originY) * Math.abs(this._pixiObject.scale.y);
};

RenderedSpriteInstance.prototype.updateSprite = function() {
  this._sprite = null;
  this._shouldNotRotate = false;

  const spriteObject = gd.asSpriteObject(
    this._associatedObject.getConfiguration()
  );
  if (spriteObject.hasNoAnimations()) return false;

  this._renderedAnimation = this._instance.getRawDoubleProperty('animation');
  if (this._renderedAnimation >= spriteObject.getAnimationsCount())
    this._renderedAnimation = 0;

  const animation = spriteObject.getAnimation(this._renderedAnimation);
  if (animation.hasNoDirections()) return false;

  this._renderedDirection = 0;
  if (animation.useMultipleDirections()) {
    let normalizedAngle = Math.floor(this._instance.getAngle()) % 360;
    if (normalizedAngle < 0) normalizedAngle += 360;

    this._renderedDirection = Math.round(normalizedAngle / 45) % 8;
  }

  if (this._renderedDirection >= animation.getDirectionsCount())
    this._renderedDirection = 0;

  const direction = animation.getDirection(this._renderedDirection);

  if (direction.getSpritesCount() === 0) return false;

  this._shouldNotRotate = animation.useMultipleDirections();
  this._sprite = direction.getSprite(0);
  return true;
};

RenderedSpriteInstance.prototype.updatePIXITextureAndSprite = function() {
  this.updateSprite();
  if (!this._sprite) return;

  const texture = this._pixiResourcesLoader.getPIXITexture(
    this._project,
    this._sprite.getImageName()
  );
  this._pixiObject.texture = texture;

  if (!texture.baseTexture.valid) {
    // Post pone texture update if texture is not loaded.
    texture.once('update', () => this.updatePIXITextureAndSprite());
    return;
  }

  const origin = this._sprite.getOrigin();
  this._originX = origin.getX();
  this._originY = origin.getY();

  if (this._sprite.isDefaultCenterPoint()) {
    this._centerX = texture.width / 2;
    this._centerY = texture.height / 2;
  } else {
    const center = this._sprite.getCenter();
    this._centerX = center.getX();
    this._centerY = center.getY();
  }

  this.updatePIXISprite();
};

RenderedSpriteInstance.prototype.update = function() {
  const animation = this._instance.getRawDoubleProperty('animation');
  if (this._renderedAnimation !== animation) {
    this.updatePIXITextureAndSprite();
  } else {
    this.updatePIXISprite();
  }
};

RenderedSpriteInstance.prototype.getOriginX = function() {
  if (!this._sprite || !this._pixiObject) return 0;

  return this._sprite.getOrigin().getX() * this._pixiObject.scale.x;
};

RenderedSpriteInstance.prototype.getOriginY = function() {
  if (!this._sprite || !this._pixiObject) return 0;

  return this._sprite.getOrigin().getY() * this._pixiObject.scale.y;
};

RenderedSpriteInstance.prototype.getDefaultWidth = function() {
  return Math.abs(this._pixiObject.width);
};

RenderedSpriteInstance.prototype.getDefaultHeight = function() {
  return Math.abs(this._pixiObject.height);
};

export default RenderedSpriteInstance;
