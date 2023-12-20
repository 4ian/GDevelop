// @flow
import RenderedInstance from './RenderedInstance';
import Rendered3DInstance from './Rendered3DInstance';
import PixiResourcesLoader from '../../ObjectsRendering/PixiResourcesLoader';
import ResourcesLoader from '../../ResourcesLoader';
import ObjectsRenderingService from '../ObjectsRenderingService';
import RenderedTextInstance from './RenderedTextInstance';
import { mapReverseFor } from '../../Utils/MapFor';
import {
  getLayouts,
  applyChildLayouts,
  ChildInstance,
  type ChildLayout,
  LayoutedParent,
  getProportionalPositionX,
  getProportionalPositionY,
} from './CustomObjectLayoutingModel';
import * as PIXI from 'pixi.js-legacy';
import * as THREE from 'three';

const gd: libGDevelop = global.gd;

/**
 * Renderer for gd.CustomObject (the class is not exposed to newIDE)
 */
export default class RenderedCustomObjectInstance extends Rendered3DInstance
  implements LayoutedParent<RenderedInstance | Rendered3DInstance> {
  childrenInstances: ChildInstance[];
  childrenLayouts: ChildLayout[];
  childrenRenderedInstances: Array<RenderedInstance | Rendered3DInstance>;
  childrenRenderedInstanceByNames: Map<
    string,
    RenderedInstance | Rendered3DInstance
  >;
  _proportionalOriginX: number;
  _proportionalOriginY: number;

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

    // Setup the PIXI object:
    this._pixiObject = new PIXI.Container();
    this._pixiContainer.addChild(this._pixiObject);

    if (this._threeGroup) {
      // No Three group means the instance should only be rendered in 2D.
      this._threeObject = new THREE.Group();
      this._threeGroup.add(this._threeObject);
    }

    const customObjectConfiguration = gd.asCustomObjectConfiguration(
      associatedObjectConfiguration
    );

    const properties = customObjectConfiguration.getProperties();
    const parentOriginPositionName =
      properties.has('ParentOrigin') &&
      properties.get('ParentOrigin').getValue();
    const parentOriginXPositionName =
      properties.has('ParentOriginX') &&
      properties.get('ParentOriginX').getValue();
    const parentOriginYPositionName =
      properties.has('ParentOriginY') &&
      properties.get('ParentOriginY').getValue();
    this._proportionalOriginX =
      (parentOriginPositionName &&
        getProportionalPositionX(parentOriginPositionName)) ||
      (parentOriginXPositionName &&
        getProportionalPositionX(parentOriginXPositionName)) ||
      0;
    this._proportionalOriginY =
      (parentOriginPositionName &&
        getProportionalPositionY(parentOriginPositionName)) ||
      (parentOriginYPositionName &&
        getProportionalPositionY(parentOriginYPositionName)) ||
      0;

    const eventBasedObject = project.hasEventsBasedObject(
      customObjectConfiguration.getType()
    )
      ? project.getEventsBasedObject(customObjectConfiguration.getType())
      : null;

    this.childrenInstances = [];
    this.childrenLayouts = [];
    this.childrenRenderedInstances = [];
    this.childrenRenderedInstanceByNames = new Map<
      string,
      RenderedInstance | Rendered3DInstance
    >();

    if (!eventBasedObject) {
      return;
    }

    const childLayouts = getLayouts(
      eventBasedObject,
      customObjectConfiguration
    );

    mapReverseFor(0, eventBasedObject.getObjectsCount(), i => {
      const childObject = eventBasedObject.getObjectAt(i);

      const childLayout = childLayouts.get(childObject.getName()) || {
        isShown: true,
        horizontalLayout: {},
        verticalLayout: {},
      };

      const childObjectConfiguration = customObjectConfiguration.getChildObjectConfiguration(
        childObject.getName()
      );
      const childInstance = new ChildInstance();
      const renderer = ObjectsRenderingService.createNewInstanceRenderer(
        project,
        layout,
        // $FlowFixMe Use real object instances.
        childInstance,
        childObjectConfiguration,
        this._pixiObject,
        this._threeObject
      );
      if (!childLayout.isShown) {
        this._pixiObject.removeChild(renderer._pixiObject);
      }

      if (renderer instanceof RenderedTextInstance) {
        // TODO EBO Remove this line when an alignment property is added to the text object.
        renderer._pixiObject.style.align = 'center';
      }
      this.childrenInstances.push(childInstance);
      this.childrenLayouts.push(childLayout);
      this.childrenRenderedInstances.push(renderer);
      this.childrenRenderedInstanceByNames.set(childObject.getName(), renderer);
    });

    if (this.childrenRenderedInstances.length === 0) {
      // Show a placeholder.
      this._pixiObject = new PIXI.Sprite(
        PixiResourcesLoader.getInvalidPIXITexture()
      );
      this._pixiContainer.addChild(this._pixiObject);
    }
  }

  onRemovedFromScene(): void {
    super.onRemovedFromScene();
    for (const childrenInstance of this.childrenRenderedInstances) {
      childrenInstance.onRemovedFromScene();
    }
    this._pixiObject.destroy(false);
  }

  /**
   * Return a URL for thumbnail of the specified object.
   */
  static getThumbnail(
    project: gdProject,
    resourcesLoader: Class<ResourcesLoader>,
    objectConfiguration: gdObjectConfiguration
  ) {
    const customObjectConfiguration = gd.asCustomObjectConfiguration(
      objectConfiguration
    );

    const eventBasedObject = project.hasEventsBasedObject(
      customObjectConfiguration.getType()
    )
      ? project.getEventsBasedObject(customObjectConfiguration.getType())
      : null;
    if (!eventBasedObject) {
      return 'res/unknown32.png';
    }

    for (let i = 0; i < eventBasedObject.getObjectsCount(); i++) {
      const childObject = eventBasedObject.getObjectAt(i);
      const childObjectConfiguration = customObjectConfiguration.getChildObjectConfiguration(
        childObject.getName()
      );
      const childType = childObjectConfiguration.getType();
      if (
        childType === 'Sprite' ||
        childType === 'TiledSpriteObject::TiledSprite' ||
        childType === 'PanelSpriteObject::PanelSprite'
      ) {
        const thumbnail = ObjectsRenderingService.getThumbnail(
          project,
          childObjectConfiguration
        );
        if (thumbnail) return thumbnail;
      }
    }
    return 'res/unknown32.png';
  }

  update() {
    applyChildLayouts(this);

    const width = this.getWidth();
    const height = this.getHeight();
    const originX = this._proportionalOriginX * width;
    const originY = this._proportionalOriginY * height;
    const centerX = width / 2;
    const centerY = height / 2;

    this._pixiObject.pivot.x = centerX;
    this._pixiObject.pivot.y = centerY;
    this._pixiObject.rotation = RenderedInstance.toRad(
      this._instance.getAngle()
    );
    this._pixiObject.scale.x = 1;
    this._pixiObject.scale.y = 1;
    this._pixiObject.position.x = this._instance.getX() + centerX - originX;
    this._pixiObject.position.y = this._instance.getY() + centerY - originY;

    if (this._threeObject) {
      this._threeObject.position.set(
        this._instance.getX(),
        this._instance.getY(),
        0
      );
      // TODO (3D) Handle rotation center for the three group.
      // this._threeObject.rotation.set(
      //   0,
      //   0,
      //   RenderedInstance.toRad(this._instance.getAngle())
      // );
    }
  }

  getDefaultWidth() {
    return this.childrenRenderedInstances.length > 0
      ? this.childrenRenderedInstances[0].getDefaultWidth()
      : 48;
  }

  getDefaultHeight() {
    return this.childrenRenderedInstances.length > 0
      ? this.childrenRenderedInstances[0].getDefaultHeight()
      : 48;
  }

  getOriginX(): number {
    return this._proportionalOriginX * this.getWidth();
  }

  getOriginY(): number {
    return this._proportionalOriginY * this.getHeight();
  }
}
