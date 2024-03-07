// @flow
import Rendered3DInstance from './Rendered3DInstance';
import PixiResourcesLoader from '../PixiResourcesLoader';
import ResourcesLoader from '../../ResourcesLoader';
import * as PIXI from 'pixi.js-legacy';
import * as THREE from 'three';

const gd: libGDevelop = global.gd;

/**
 * Renderer for gd.SpriteObject
 */
export default class RenderedSprite3DInstance extends Rendered3DInstance {
  _renderedAnimation: number;
  _renderedDirection: number;
  _centerX: number;
  _centerY: number;
  _originX: number;
  _originY: number;
  _sprite: ?gdSprite = null;
  _shouldNotRotate: boolean = false;
  _textureWidth = 32;
  _textureHeight = 32;

  constructor(
    project: gdProject,
    layout: gdLayout,
    instance: gdInitialInstance,
    associatedObjectConfiguration: gdObjectConfiguration,
    pixiContainer: PIXI.Container,
    threeGroup: THREE.Group,
    pixiResourcesLoader: Class<PixiResourcesLoader>
  ) {
    super(
      project,
      layout,
      instance,
      associatedObjectConfiguration,
      pixiContainer,
      threeGroup,
      pixiResourcesLoader
    );

    this._renderedAnimation = 0;
    this._renderedDirection = 0;
    this._centerX = 0;
    this._centerY = 0;
    this._originX = 0;
    this._originY = 0;

    this._pixiObject = new PIXI.Graphics();
    this._pixiContainer.addChild(this._pixiObject);

    this.updateSprite();
    const material = this._pixiResourcesLoader.getThreeMaterial(
      project,
      this._sprite ? this._sprite.getImageName() : '',
      {
        useTransparentTexture: true,
      }
    );
    const geometry = new THREE.PlaneGeometry(1, -1);
    const threeObject = new THREE.Mesh(geometry, material);
    threeObject.rotation.order = 'ZYX';
    this._threeGroup.add(threeObject);
    this._threeObject = threeObject;

    this.updateTextureAndSprite();
  }

  onRemovedFromScene(): void {
    super.onRemovedFromScene();
    // Keep textures because they are shared by all sprites.
    this._pixiObject.destroy(false);
  }

  /**
   * Return a URL for thumbnail of the specified object.
   */
  static getThumbnail(
    project: gdProject,
    resourcesLoader: Class<ResourcesLoader>,
    objectConfiguration: gdObjectConfiguration
  ): string {
    const customObjectConfiguration = gd.asCustomObjectConfiguration(
      objectConfiguration
    );
    const animations = customObjectConfiguration.getAnimations();

    if (
      animations.getAnimationsCount() > 0 &&
      animations.getAnimation(0).getDirectionsCount() > 0 &&
      animations
        .getAnimation(0)
        .getDirection(0)
        .getSpritesCount() > 0
    ) {
      const imageName = animations
        .getAnimation(0)
        .getDirection(0)
        .getSprite(0)
        .getImageName();
      return resourcesLoader.getResourceFullUrl(project, imageName, {});
    }

    return 'res/unknown32.png';
  }

  updateThreeObject(): void {
    const threeObject = this._threeObject;
    if (!threeObject) {
      return;
    }

    const width = this.getWidth();
    const height = this.getHeight();
    const pivotX = this._centerX - this._textureWidth / 2;
    const pivotY = this._centerY - this._textureHeight / 2;
    const originX = this._originX - this._textureWidth / 2;
    const originY = this._originY - this._textureHeight / 2;

    threeObject.rotation.set(
      Rendered3DInstance.toRad(this._instance.getRotationX()),
      Rendered3DInstance.toRad(this._instance.getRotationY()),
      Rendered3DInstance.toRad(this._instance.getAngle())
    );

    threeObject.position.set(-pivotX, -pivotY, 0);
    threeObject.position.applyEuler(threeObject.rotation);
    threeObject.position.x += pivotX - originX;
    threeObject.position.y += pivotY - originY;
    threeObject.position.x *= width / this._textureWidth;
    threeObject.position.y *= height / this._textureHeight;
    threeObject.position.x += this._instance.getX();
    threeObject.position.y += this._instance.getY();
    threeObject.position.z += this._instance.getZ();

    threeObject.scale.set(width, height, 1);
  }

  updateSprite(): boolean {
    this._sprite = null;
    this._shouldNotRotate = false;

    const customObjectConfiguration = gd.asCustomObjectConfiguration(
      this._associatedObjectConfiguration
    );
    const animations = customObjectConfiguration.getAnimations();
    if (animations.hasNoAnimations()) return false;

    this._renderedAnimation = this._instance.getRawDoubleProperty('animation');
    if (this._renderedAnimation >= animations.getAnimationsCount())
      this._renderedAnimation = 0;

    const animation = animations.getAnimation(this._renderedAnimation);
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
  }

  updateTextureAndSprite(): void {
    this.updateSprite();
    const sprite = this._sprite;
    if (!sprite) return;

    const texture = this._pixiResourcesLoader.getPIXITexture(
      this._project,
      sprite.getImageName()
    );
    this._pixiObject.texture = texture;

    if (!texture.baseTexture.valid) {
      // Post pone texture update if texture is not loaded.
      texture.once('update', () => this.updateTextureAndSprite());
      return;
    }
    this._textureWidth = texture.width;
    this._textureHeight = texture.height;

    const material = this._pixiResourcesLoader.getThreeMaterial(
      this._project,
      sprite.getImageName(),
      {
        useTransparentTexture: true,
      }
    );
    if (this._threeObject) {
      this._threeObject.material = material;
    }

    const origin = sprite.getOrigin();
    this._originX = origin.getX();
    this._originY = origin.getY();

    if (sprite.isDefaultCenterPoint()) {
      this._centerX = this._textureWidth / 2;
      this._centerY = this._textureHeight / 2;
    } else {
      const center = sprite.getCenter();
      this._centerX = center.getX();
      this._centerY = center.getY();
    }

    this.updateThreeObject();
  }

  update(): void {
    const animation = this._instance.getRawDoubleProperty('animation');
    if (this._renderedAnimation !== animation) {
      this.updateTextureAndSprite();
    } else {
      this.updateThreeObject();
    }
    this.updatePixiObject();
  }

  updatePixiObject() {
    const width = this.getDefaultWidth();
    const height = this.getDefaultHeight();

    const minX = -this._originX;
    const minY = -this._originY;
    const maxX = minX + width;
    const maxY = minY + height;

    this._pixiObject.clear();
    this._pixiObject.beginFill(0x999999, 0.2);
    this._pixiObject.lineStyle(1, 0xffd900, 0);
    this._pixiObject.moveTo(minX, minY);
    this._pixiObject.lineTo(maxX, minY);
    this._pixiObject.lineTo(maxX, maxY);
    this._pixiObject.lineTo(minX, maxY);
    this._pixiObject.endFill();

    this._pixiObject.pivot.x = this._centerX - this._originX;
    this._pixiObject.pivot.y = this._centerY - this._originY;
    this._pixiObject.rotation = this._shouldNotRotate
      ? 0
      : Rendered3DInstance.toRad(this._instance.getAngle());
    if (this._instance.hasCustomSize()) {
      this._pixiObject.scale.x = this.getCustomWidth() / width;
      this._pixiObject.scale.y = this.getCustomHeight() / height;
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
  }

  getOriginX(): number {
    if (!this._sprite || !this._pixiObject) return 0;

    return this._sprite.getOrigin().getX() * this._pixiObject.scale.x;
  }

  getOriginY(): number {
    if (!this._sprite || !this._pixiObject) return 0;

    return this._sprite.getOrigin().getY() * this._pixiObject.scale.y;
  }

  getDefaultWidth(): number {
    return this._textureWidth;
  }

  getDefaultHeight(): number {
    return this._textureHeight;
  }

  getDefaultDepth(): number {
    return 0;
  }

  getCenterX(): number {
    if (!this._sprite || !this._pixiObject) return 0;
    return this._centerX * this._pixiObject.scale.x;
  }

  getCenterY(): number {
    if (!this._sprite || !this._pixiObject) return 0;
    return this._centerY * this._pixiObject.scale.y;
  }
}
