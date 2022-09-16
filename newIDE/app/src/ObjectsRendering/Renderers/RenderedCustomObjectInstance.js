// @flow
import RenderedInstance from './RenderedInstance';
import PixiResourcesLoader from '../../ObjectsRendering/PixiResourcesLoader';
import ResourcesLoader from '../../ResourcesLoader';
import ObjectsRenderingService from '../ObjectsRenderingService';
import { mapReverseFor } from '../../Utils/MapFor';
import * as PIXI from 'pixi.js-legacy';

const gd: libGDevelop = global.gd;

// TODO EBO Make an event-based object instance editor (like the one for the scene)
// and use real instances instead of this.
class ChildInstance {
  x: number;
  y: number;

  constructor() {
    this.x = 0;
    this.y = 0;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getAngle() {
    return 0;
  }

  setObjectName(name: string) {}

  getObjectName() {
    return '';
  }

  setX(x: number) {}

  setY(y: number) {}

  setAngle(angle: number) {}

  isLocked() {
    return false;
  }

  setLocked(lock: boolean) {}

  isSealed() {
    return false;
  }

  setSealed(seal: boolean) {}

  getZOrder() {
    return 0;
  }

  setZOrder(zOrder: number) {}

  getLayer() {
    return '';
  }

  setLayer(layer: string) {}

  setHasCustomSize(enable: boolean) {}

  hasCustomSize() {
    return false;
  }

  setCustomWidth(width: number) {}

  getCustomWidth() {
    return 0;
  }

  setCustomHeight(height: number) {}

  getCustomHeight() {
    return 0;
  }

  resetPersistentUuid() {
    return this;
  }

  updateCustomProperty(
    name: string,
    value: string,
    project: gdProject,
    layout: gdLayout
  ) {}

  getCustomProperties(project: gdProject, layout: gdLayout) {
    return null;
  }

  getRawDoubleProperty(name: string) {
    return 0;
  }

  getRawStringProperty(name: string) {
    return '';
  }

  setRawDoubleProperty(name: string, value: number) {}

  setRawStringProperty(name: string, value: string) {}

  getVariables() {
    return [];
  }

  serializeTo(element: gdSerializerElement) {}

  unserializeFrom(element: gdSerializerElement) {}
}

/**
 * Renderer for gd.CustomObject (the class is not exposed to newIDE)
 */
export default class RenderedCustomObjectInstance extends RenderedInstance {
  childrenInstances: ChildInstance[];
  childrenRenderedInstances: RenderedInstance[];

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

    //Setup the PIXI object:
    this._pixiObject = new PIXI.Container();
    this._pixiContainer.addChild(this._pixiObject);

    const customObjectConfiguration = gd.asCustomObjectConfiguration(
      associatedObjectConfiguration
    );

    const eventBasedObject = project.hasEventsBasedObject(
      customObjectConfiguration.getType()
    )
      ? project.getEventsBasedObject(customObjectConfiguration.getType())
      : null;

    this.childrenInstances = [];
    this.childrenRenderedInstances = eventBasedObject
      ? mapReverseFor(0, eventBasedObject.getObjectsCount(), i => {
          const childObject = eventBasedObject.getObjectAt(i);
          const childObjectConfiguration = customObjectConfiguration.getChildObjectConfiguration(
            childObject.getName()
          );
          const childInstance = new ChildInstance();
          this.childrenInstances.push(childInstance);
          return ObjectsRenderingService.createNewInstanceRenderer(
            project,
            layout,
            // $FlowFixMe Use real object instances.
            childInstance,
            childObjectConfiguration,
            this._pixiObject
          );
        })
      : [];
  }

  /**
   * Return a URL for thumbnail of the specified object.
   */
  static getThumbnail(
    project: gdProject,
    resourcesLoader: Class<ResourcesLoader>,
    object: gdObject
  ) {
    return 'res/unknown32.png';
  }

  update() {
    const defaultWidth = this.getDefaultWidth();
    const defaultHeight = this.getDefaultHeight();
    const originX = 0;
    const originY = 0;
    const centerX = defaultWidth / 2;
    const centerY = defaultHeight / 2;

    for (
      let index = 0;
      index < this.childrenRenderedInstances.length;
      index++
    ) {
      const renderedInstance = this.childrenRenderedInstances[index];
      const childInstance = this.childrenInstances[index];
      childInstance.x = (defaultWidth - renderedInstance.getDefaultWidth()) / 2;
      childInstance.y =
        (defaultHeight - renderedInstance.getDefaultHeight()) / 2;
      renderedInstance.update();
    }

    this._pixiObject.pivot.x = centerX;
    this._pixiObject.pivot.y = centerY;
    this._pixiObject.rotation = RenderedInstance.toRad(
      this._instance.getAngle()
    );
    if (this._instance.hasCustomSize()) {
      this._pixiObject.scale.x = this._instance.getCustomWidth() / defaultWidth;
      this._pixiObject.scale.y =
        this._instance.getCustomHeight() / defaultHeight;
    } else {
      this._pixiObject.scale.x = 1;
      this._pixiObject.scale.y = 1;
    }
    this._pixiObject.position.x =
      this._instance.getX() +
      (centerX - originX) * Math.abs(this._pixiObject.scale.x);
    this._pixiObject.position.y =
      this._instance.getY() +
      (centerY - originY) * Math.abs(this._pixiObject.scale.y);
  }

  getDefaultWidth() {
    let widthMax = 0;
    for (const instance of this.childrenRenderedInstances) {
      widthMax = Math.max(widthMax, instance.getDefaultWidth());
    }
    return widthMax;
  }

  getDefaultHeight() {
    let heightMax = 0;
    for (const instance of this.childrenRenderedInstances) {
      heightMax = Math.max(heightMax, instance.getDefaultHeight());
    }
    return heightMax;
  }
}
