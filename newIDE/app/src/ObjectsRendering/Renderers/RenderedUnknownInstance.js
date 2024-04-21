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
    layout: gdLayout,
    instance: gdInitialInstance,
    associatedObjectConfiguration: gdObjectConfiguration,
    pixiContainer: PIXI.Container,
    pixiResourcesLoader: Class<PixiResourcesLoader>
  ) {
    super(
      project,
      layout,
      instance,
      associatedObjectConfiguration,
      pixiContainer,
      pixiResourcesLoader
    );

    //This renderer show a placeholder for the object:
    this._pixiObject = new PIXI.Graphics();
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
    const width = this.getWidth();
    const height = this.getHeight();

    this._pixiObject.clear();
    this._pixiObject.beginFill(0x0033ff);
    this._pixiObject.lineStyle(1, 0xffd900, 1);
    this._pixiObject.moveTo(-width / 2, -height / 2);
    this._pixiObject.lineTo(width / 2, -height / 2);
    this._pixiObject.lineTo(width / 2, height / 2);
    this._pixiObject.lineTo(-width / 2, height / 2);
    this._pixiObject.endFill();

    this._pixiObject.position.x = this._instance.getX() + width / 2;
    this._pixiObject.position.y = this._instance.getY() + height / 2;
    this._pixiObject.angle = this._instance.getAngle();
  }
}
