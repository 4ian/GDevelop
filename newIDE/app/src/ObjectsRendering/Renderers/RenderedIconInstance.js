import RenderedInstance from './RenderedInstance';
import * as PIXI from 'pixi.js-legacy';

/**
 * Create a renderer for an type of object displayed as an icon
 *
 * @extends RenderedInstance
 * @class RenderedIconInstance
 * @constructor
 */
export default function makeRenderer(iconPath) {
  class RenderedIconInstance extends RenderedInstance {
    constructor(
      project,
      layout,
      instance,
      associatedObjectConfiguration,
      pixiContainer,
      pixiResourcesLoader
    ) {
      super(
        project,
        layout,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        pixiResourcesLoader
      );

      this._pixiObject = new PIXI.Sprite(PIXI.Texture.from(iconPath));
      this._pixiContainer.addChild(this._pixiObject);
    }

    update() {
      this._pixiObject.position.x = this._instance.getX();
      this._pixiObject.position.y = this._instance.getY();
      this._pixiObject.rotation = (this._instance.getAngle() * Math.PI) / 180.0;
    }

    static getThumbnail(project, resourcesLoader, object) {
      return iconPath;
    }
  }

  return RenderedIconInstance;
}
