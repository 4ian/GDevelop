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
  _threeObjectPivot: THREE.Group | null;

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
      const threeObject = new THREE.Group();
      threeObject.rotation.order = 'ZYX';
      this._threeGroup.add(threeObject);

      this._threeObjectPivot = new THREE.Group();
      this._threeObjectPivot.rotation.order = 'ZYX';
      threeObject.add(this._threeObjectPivot);
      this._threeObject = threeObject
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
        this._threeObjectPivot
      );
      if (!childLayout.isShown) {
        this._pixiObject.removeChild(renderer._pixiObject);
        this._threeObjectPivot.remove(renderer._threeObject);
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

    const originX = this.getOriginX();
    const originY = this.getOriginY();
    const originZ = this.getOriginZ();
    const centerX = this.getCenterX();
    const centerY = this.getCenterY();
    const centerZ = this.getCenterZ();

    const firstInstance = this.childrenRenderedInstances[0];
    const is3D = firstInstance && firstInstance instanceof Rendered3DInstance;

    const threeObject = this._threeObject;
    const threeObjectPivot = this._threeObjectPivot;
    if (threeObject && threeObjectPivot && is3D) {
      threeObject.position.set(
        this._instance.getX() + centerX - originX,
        this._instance.getY() + centerY - originY,
        this._instance.getZ() + centerZ - originZ
      );
      threeObjectPivot.position.set(
        -centerX + originX,
        -centerY + originY,
        -centerZ + originZ
      );
      threeObject.rotation.set(
        RenderedInstance.toRad(this._instance.getRotationX()),
        RenderedInstance.toRad(this._instance.getRotationY()),
        RenderedInstance.toRad(this._instance.getAngle())
      );

      this._pixiObject.pivot.x = centerX - originX;
      this._pixiObject.pivot.y = centerY - originY;
    } else {
      this._pixiObject.pivot.x = centerX;
      this._pixiObject.pivot.y = centerY;
    }
    this._pixiObject.position.x = this._instance.getX() + centerX - originX;
    this._pixiObject.position.y = this._instance.getY() + centerY - originY;

    this._pixiObject.rotation = RenderedInstance.toRad(
      this._instance.getAngle()
    );
    this._pixiObject.scale.x = 1;
    this._pixiObject.scale.y = 1;
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
    // When the custom object is rendered with a 3D object,
    // the transformation logic from the displayed child is used.
    const firstInstance = this.childrenRenderedInstances[0];
    return firstInstance && firstInstance instanceof Rendered3DInstance
      ? firstInstance.getOriginX()
      : this._proportionalOriginX * this.getWidth();
  }

  getOriginY(): number {
    const firstInstance = this.childrenRenderedInstances[0];
    return firstInstance && firstInstance instanceof Rendered3DInstance
      ? firstInstance.getOriginY()
      : this._proportionalOriginY * this.getHeight();
  }

  getOriginZ(): number {
    const firstInstance = this.childrenRenderedInstances[0];
    return firstInstance && firstInstance instanceof Rendered3DInstance
      ? firstInstance.getOriginZ()
      : 0;
  }

  getCenterX() {
    const firstInstance = this.childrenRenderedInstances[0];
    return firstInstance && firstInstance instanceof Rendered3DInstance
      ? firstInstance.getCenterX()
      : this.getWidth() / 2;
  }

  getCenterY() {
    const firstInstance = this.childrenRenderedInstances[0];
    return firstInstance && firstInstance instanceof Rendered3DInstance
      ? firstInstance.getCenterY()
      : this.getHeight() / 2;
  }

  getCenterZ() {
    const firstInstance = this.childrenRenderedInstances[0];
    return firstInstance && firstInstance instanceof Rendered3DInstance
      ? firstInstance.getCenterZ()
      : 0;
  }
}
