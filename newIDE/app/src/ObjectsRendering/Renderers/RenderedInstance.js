// @flow
import * as PIXI from 'pixi.js-legacy';
import PixiResourcesLoader from '../../ObjectsRendering/PixiResourcesLoader';

/**
 * RenderedInstance is the base class used for creating renderers of instances,
 * which display on the scene editor, using Pixi.js, the instance of an object (see InstancesEditor).
 */
export default class RenderedInstance {
  _project: gdProject;
  _layout: gdLayout;
  _instance: gdInitialInstance;
  _associatedObjectConfiguration: gdObjectConfiguration;
  _pixiContainer: PIXI.Container;
  _pixiResourcesLoader: Class<PixiResourcesLoader>;
  _pixiObject: any;
  wasUsed: boolean;

  constructor(
    project: gdProject,
    layout: gdLayout,
    instance: gdInitialInstance,
    associatedObjectConfiguration: gdObjectConfiguration,
    pixiContainer: PIXI.Container,
    pixiResourcesLoader: Class<PixiResourcesLoader>
  ) {
    this._pixiObject = null;
    this._instance = instance;
    this._associatedObjectConfiguration = associatedObjectConfiguration;
    this._pixiContainer = pixiContainer;
    this._project = project;
    this._layout = layout;
    this._pixiResourcesLoader = pixiResourcesLoader;
    this.wasUsed = true; //Used by InstancesRenderer to track rendered instance that are not used anymore.
  }

  /**
   * Convert an angle from degrees to radians.
   */
  static toRad(angleInDegrees: number) {
    return (angleInDegrees / 180) * 3.14159;
  }

  /**
   * Called when the scene editor is rendered.
   */
  update() {
    //Nothing to do.
  }

  getPixiObject() {
    return this._pixiObject;
  }

  getInstance() {
    return this._instance;
  }

  /**
   * Called to notify the instance renderer that its associated instance was removed from
   * the scene. The PIXI object should probably be removed from the container: This is what
   * the default implementation of the method does.
   */
  onRemovedFromScene() {
    if (this._pixiObject !== null)
      this._pixiContainer.removeChild(this._pixiObject);
  }

  getOriginX() {
    return 0;
  }

  getOriginY() {
    return 0;
  }

  /**
   * Return the width of the instance when the instance doesn't have a custom size.
   */
  getDefaultWidth() {
    return 32;
  }

  /**
   * Return the height of the instance when the instance doesn't have a custom size.
   */
  getDefaultHeight() {
    return 32;
  }
}
