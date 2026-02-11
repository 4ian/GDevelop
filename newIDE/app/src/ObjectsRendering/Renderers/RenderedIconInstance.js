// @flow
import RenderedInstance from './RenderedInstance';
import PixiResourcesLoader from '../../ObjectsRendering/PixiResourcesLoader';
import ResourcesLoader from '../../ResourcesLoader';
import * as PIXI from 'pixi.js-legacy';

/**
 * Create a renderer for an type of object displayed as an icon
 */
export default function makeRenderer(iconPath: string) {
  class RenderedIconInstance extends RenderedInstance {
    constructor(
      project: gdProject,
      instance: gdInitialInstance,
      associatedObjectConfiguration: gdObjectConfiguration,
      pixiContainer: PIXI.Container,
      pixiResourcesLoader: Class<PixiResourcesLoader>
    ) {
      super(
        project,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        pixiResourcesLoader
      );

      this._pixiObject = new PIXI.Sprite(PIXI.Texture.from(iconPath));
      this._pixiContainer.addChild(this._pixiObject);
    }

    onRemovedFromScene(): void {
      super.onRemovedFromScene();
      this._pixiObject.destroy(false);
    }

    update() {
      this._pixiObject.position.x = this._instance.getX();
      this._pixiObject.position.y = this._instance.getY();
      this._pixiObject.angle = this._instance.getAngle();

      // Do not hide completely an object so it can still be manipulated
      const alphaForDisplay = Math.max(this._instance.getOpacity() / 255, 0.5);
      this._pixiObject.alpha = alphaForDisplay;
    }

    static getThumbnail(
      project: gdProject,
      resourcesLoader: Class<ResourcesLoader>,
      objectConfiguration: gdObjectConfiguration
    ) {
      return iconPath;
    }
  }

  return RenderedIconInstance;
}
