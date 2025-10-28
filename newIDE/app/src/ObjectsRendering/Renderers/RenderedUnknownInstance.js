// @flow
import RenderedInstance from './RenderedInstance';
import PixiResourcesLoader from '../../ObjectsRendering/PixiResourcesLoader';
import ResourcesLoader from '../../ResourcesLoader';
import * as PIXI from 'pixi.js-legacy';

/**
 * Objects with an unknown type are rendered with a placeholder rectangle.
 */
export default class RenderedUnknownInstance extends RenderedInstance {
  constructor(
    project: gdProject,
    instance: gdInitialInstance,
    associatedObjectConfiguration: gdObjectConfiguration | null,
    pixiContainer: PIXI.Container,
    pixiResourcesLoader: Class<PixiResourcesLoader>
  ) {
    super(
      project,
      instance,
      //$FlowFixMe It's ok because RenderedUnknownInstance don't use it.
      associatedObjectConfiguration,
      pixiContainer,
      pixiResourcesLoader
    );

    //This renderer show a placeholder for the object:
    this._pixiObject = new PIXI.Sprite(
      this._pixiResourcesLoader.getInvalidPIXITexture()
    );
    this._pixiContainer.addChild(this._pixiObject);
  }

  onRemovedFromScene(): void {
    super.onRemovedFromScene();
    this._pixiObject.destroy();
  }

  static getThumbnail(
    project: gdProject,
    resourcesLoader: Class<ResourcesLoader>,
    objectConfiguration: gdObjectConfiguration
  ) {
    return 'res/unknown32.png';
  }

  update() {
    // Avoid to use _pixiObject after destroy is called.
    // It can happen when onRemovedFromScene and update cross each other.
    if (!this._pixiObject) {
      return;
    }
    const objectTextureFrame = this._pixiObject.texture.frame;
    // In case the texture is not loaded yet, we don't want to crash.
    if (!objectTextureFrame) return;

    this._pixiObject.anchor.x = 0.5;
    this._pixiObject.anchor.y = 0.5;
    this._pixiObject.rotation = RenderedInstance.toRad(
      this._instance.getAngle()
    );
    this._pixiObject.scale.x = this.getWidth() / objectTextureFrame.width;
    this._pixiObject.scale.y = this.getHeight() / objectTextureFrame.height;
    this._pixiObject.position.x = this._instance.getX() + this.getCenterX();
    this._pixiObject.position.y = this._instance.getY() + this.getCenterY();

    // Do not hide completely an object so it can still be manipulated
    const alphaForDisplay = Math.max(this._instance.getOpacity() / 255, 0.5);
    this._pixiObject.alpha = alphaForDisplay;

    this._pixiObject.scale.x =
      Math.abs(this._pixiObject.scale.x) *
      (this._instance.isFlippedX() ? -1 : 1);
    this._pixiObject.scale.y =
      Math.abs(this._pixiObject.scale.y) *
      (this._instance.isFlippedY() ? -1 : 1);
  }
}
