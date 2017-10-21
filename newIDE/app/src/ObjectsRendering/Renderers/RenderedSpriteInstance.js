import RenderedInstance from './RenderedInstance';
import PIXI from 'pixi.js';
const gd = global.gd;

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
  this.updatePIXITexture();
  this.updatePIXISprite();
}
RenderedSpriteInstance.prototype = Object.create(RenderedInstance.prototype);

/**
 * Return a URL for thumbnail of the specified object.
 * @method getThumbnail
 * @static
 */
RenderedSpriteInstance.getThumbnail = function(
  project,
  resourcesLoader,
  object
) {
  const spriteObject = gd.asSpriteObject(object);

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
    return resourcesLoader.getResourceFullFilename(project, imageName);
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

  const spriteObject = gd.asSpriteObject(this._associatedObject);
  if (spriteObject.hasNoAnimations()) return false;

  this._renderedAnimation = this._instance.getRawFloatProperty('animation');
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

RenderedSpriteInstance.prototype.updatePIXITexture = function() {
  this.updateSprite();
  if (!this._sprite) return;

  this._pixiObject.texture = this._pixiResourcesLoader.getPIXITexture(
    this._project,
    this._sprite.getImageName()
  );

  const origin = this._sprite.getOrigin();
  this._originX = origin.getX();
  this._originY = origin.getY();

  if (this._sprite.isDefaultCenterPoint()) {
    if (this._pixiObject.texture.noFrame) {
      var that = this;
      // We might have to wait for the texture to load
      this._pixiObject.texture.on('update', function() {
        that._centerX = that._pixiObject.texture.width / 2;
        that._centerY = that._pixiObject.texture.height / 2;
        that._pixiObject.texture.off('update', this);
      });
    } else {
      this._centerX = this._pixiObject.texture.width / 2;
      this._centerY = this._pixiObject.texture.height / 2;
    }
  } else {
    const center = this._sprite.getCenter();
    this._centerX = center.getX();
    this._centerY = center.getY();
  }
};

RenderedSpriteInstance.prototype.update = function() {
  const animation = this._instance.getRawFloatProperty('animation');
  if (this._renderedAnimation !== animation) this.updatePIXITexture();

  this.updatePIXISprite();
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
