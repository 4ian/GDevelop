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
  getProportionalPositionZ,
} from './CustomObjectLayoutingModel';
import * as PIXI from 'pixi.js-legacy';
import * as THREE from 'three';
import getObjectByName from '../../Utils/GetObjectByName';

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
  _proportionalOriginZ: number;
  _threeObjectPivot: THREE.Group | null;
  _isRenderedIn3D = false;

  /** Functor used to render an instance */
  instancesRenderer: gdInitialInstanceJSFunctor;
  _defaultWidth = 48;
  _defaultHeight = 48;
  _defaultDepth = 48;

  /** Functor used to evaluate parent dimensions */
  _instancesMeasurer: gdInitialInstanceJSFunctor;
  /** Used to evaluate parent dimensions */
  _temporaryAABB = {
    minX: Number.MAX_VALUE,
    minY: Number.MAX_VALUE,
    minZ: Number.MAX_VALUE,
    maxX: -Number.MAX_VALUE,
    maxY: -Number.MAX_VALUE,
    maxZ: -Number.MAX_VALUE,
  };

  renderedInstances: { [number]: RenderedInstance | Rendered3DInstance } = {};

  eventBasedObject: gdEventsBasedObject | null;

  constructor(
    project: gdProject,
    instance: gdInitialInstance,
    associatedObjectConfiguration: gdObjectConfiguration,
    pixiContainer: PIXI.Container,
    threeGroup: THREE.Group,
    pixiResourcesLoader: Class<PixiResourcesLoader>
  ) {
    super(
      project,
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
      this._threeObject = threeObject;
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
    const parentOriginZPositionName =
      properties.has('ParentOriginZ') &&
      properties.get('ParentOriginZ').getValue();
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
    this._proportionalOriginZ =
      (parentOriginPositionName &&
        getProportionalPositionZ(parentOriginPositionName)) ||
      (parentOriginZPositionName &&
        getProportionalPositionZ(parentOriginZPositionName)) ||
      0;

    this.eventBasedObject = project.hasEventsBasedObject(
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

    const { eventBasedObject } = this;
    if (!eventBasedObject) {
      return;
    }
    this._isRenderedIn3D = eventBasedObject.isRenderedIn3D();

    // TODO: do the proper rendering according to instances
    if (eventBasedObject.getInitialInstances().getInstancesCount() > 0) {
      // Functor used to render an instance
      this.instancesRenderer = new gd.InitialInstanceJSFunctor();
      // $FlowFixMe - invoke is not writable
      this.instancesRenderer.invoke = instancePtr => {
        // $FlowFixMe - wrapPointer is not exposed
        const instance: gdInitialInstance = gd.wrapPointer(
          instancePtr,
          gd.InitialInstance
        );

        //Get the "RenderedInstance" object associated to the instance and tell it to update.
        const renderedInstance:
          | RenderedInstance
          | Rendered3DInstance
          | null = this.getRendererOfInstance(instance);
        if (!renderedInstance) return;

        const pixiObject: PIXI.DisplayObject | null = renderedInstance.getPixiObject();
        if (pixiObject) {
          if (renderedInstance instanceof Rendered3DInstance) {
            pixiObject.zOrder = instance.getZ() + renderedInstance.getDepth();
          } else {
            pixiObject.zOrder = instance.getZOrder();
          }
        }

        try {
          // TODO: should we do culling here?
          // "Culling" improves rendering performance of large levels
          const isVisible = true; // this._isInstanceVisible(instance);
          if (pixiObject) {
            pixiObject.visible = isVisible;
            pixiObject.eventMode = 'auto';
          }
          if (isVisible) renderedInstance.update();

          if (renderedInstance instanceof Rendered3DInstance) {
            const threeObject = renderedInstance.getThreeObject();
            if (threeObject) {
              threeObject.visible = isVisible;
            }
          }
        } catch (error) {
          if (error instanceof TypeError) {
            // When reloading a texture when a resource changed externally, rendering
            // an instance could crash when trying to access a non-existent PIXI base texture.
            // The error is not propagated in order to avoid a crash at the SceneEditor level.
            // See https://github.com/4ian/GDevelop/issues/5802.
            console.error(
              `An error occurred when rendering instance for object ${instance.getObjectName()}:`,
              error
            );
            return;
          }
          throw error;
        } finally {
          renderedInstance.wasUsed = true;
        }
      };
      // Functor used to evaluate parent dimensions
      this._instancesMeasurer = new gd.InitialInstanceJSFunctor();
      // $FlowFixMe - invoke is not writable
      this._instancesMeasurer.invoke = instancePtr => {
        // $FlowFixMe - wrapPointer is not exposed
        const instance: gdInitialInstance = gd.wrapPointer(
          instancePtr,
          gd.InitialInstance
        );

        //Get the "RenderedInstance" object associated to the instance and tell it to update.
        const renderedInstance:
          | RenderedInstance
          | Rendered3DInstance
          | null = this.getRendererOfInstance(instance);
        if (!renderedInstance) return;

        const x = renderedInstance._instance.getX();
        const y = renderedInstance._instance.getY();
        const z = renderedInstance._instance.getZ();
        const width = renderedInstance.getWidth();
        const height = renderedInstance.getHeight();
        const depth = renderedInstance.getDepth();
        const originX = renderedInstance.getOriginX();
        const originY = renderedInstance.getOriginY();
        const originZ = renderedInstance.getOriginZ();

        this._temporaryAABB.minX = Math.min(
          this._temporaryAABB.minX,
          x - originX
        );
        this._temporaryAABB.minY = Math.min(
          this._temporaryAABB.minY,
          y - originY
        );
        this._temporaryAABB.minZ = Math.min(
          this._temporaryAABB.minZ,
          z - originZ
        );
        this._temporaryAABB.maxX = Math.max(
          this._temporaryAABB.maxX,
          x - originX + width
        );
        this._temporaryAABB.maxY = Math.max(
          this._temporaryAABB.maxY,
          y - originY + height
        );
        this._temporaryAABB.maxZ = Math.max(
          this._temporaryAABB.maxZ,
          z - originZ + depth
        );
      };
      this._updateDimensions();
    } else {
      const childLayouts = getLayouts(
        eventBasedObject,
        customObjectConfiguration
      );

      const childObjects = eventBasedObject.getObjects();
      mapReverseFor(0, childObjects.getObjectsCount(), i => {
        const childObject = childObjects.getObjectAt(i);

        const childLayout = childLayouts.get(childObject.getName()) || {
          isShown: true,
          horizontalLayout: {},
          verticalLayout: {},
          depthLayout: {},
        };

        const childObjectConfiguration = customObjectConfiguration.getChildObjectConfiguration(
          childObject.getName()
        );
        const childInstance = new ChildInstance();
        const renderer = ObjectsRenderingService.createNewInstanceRenderer(
          project,
          // $FlowFixMe Use real object instances.
          childInstance,
          childObjectConfiguration,
          this._pixiObject,
          this._threeObjectPivot
        );
        if (!childLayout.isShown) {
          this._pixiObject.removeChild(renderer._pixiObject);
          if (
            this._threeObjectPivot &&
            renderer instanceof Rendered3DInstance
          ) {
            this._threeObjectPivot.remove(renderer._threeObject);
          }
        }

        if (renderer instanceof RenderedTextInstance) {
          // TODO EBO Remove this line when an alignment property is added to the text object.
          renderer._pixiObject.style.align = 'center';
        }
        this.childrenInstances.push(childInstance);
        this.childrenLayouts.push(childLayout);
        this.childrenRenderedInstances.push(renderer);
        this.childrenRenderedInstanceByNames.set(
          childObject.getName(),
          renderer
        );
      });

      if (this.childrenRenderedInstances.length === 0) {
        // Show a placeholder.
        this._pixiObject = new PIXI.Sprite(
          PixiResourcesLoader.getInvalidPIXITexture()
        );
        this._pixiContainer.addChild(this._pixiObject);
      }
    }
  }

  getRendererOfInstance = (instance: gdInitialInstance) => {
    var renderedInstance = this.renderedInstances[instance.ptr];
    if (renderedInstance === undefined) {
      //No renderer associated yet, the instance must have been just created!...
      const associatedObjectName = instance.getObjectName();
      const { eventBasedObject } = this;
      if (!eventBasedObject) {
        return null;
      }
      const associatedObject = getObjectByName(
        eventBasedObject.getObjects(),
        null,
        associatedObjectName
      );
      if (!associatedObject) return null;

      //...so let's create a renderer.
      renderedInstance = this.renderedInstances[
        instance.ptr
      ] = ObjectsRenderingService.createNewInstanceRenderer(
        this._project,
        instance,
        associatedObject.getConfiguration(),
        this._pixiObject,
        this._threeObjectPivot
      );
    }

    return renderedInstance;
  };

  _isRenderedFromInitialInstances(): boolean {
    return !!this.instancesRenderer;
  }

  _updateDimensions() {
    if (!this._isRenderedFromInitialInstances()) {
      return;
    }
    const { eventBasedObject } = this;
    if (!eventBasedObject) {
      return;
    }

    this._temporaryAABB.minX = Number.MAX_VALUE;
    this._temporaryAABB.minY = Number.MAX_VALUE;
    this._temporaryAABB.minZ = Number.MAX_VALUE;
    this._temporaryAABB.maxX = -Number.MAX_VALUE;
    this._temporaryAABB.maxY = -Number.MAX_VALUE;
    this._temporaryAABB.maxZ = -Number.MAX_VALUE;

    eventBasedObject.getInitialInstances().iterateOverInstances(
      // $FlowFixMe - gd.castObject is not supporting typings.
      this._instancesMeasurer
    );

    const { minX, minY, minZ, maxX, maxY, maxZ } = this._temporaryAABB;

    this._defaultWidth = maxX - minX;
    this._defaultHeight = maxY - minY;
    this._defaultDepth = maxZ - minZ;
    this._proportionalOriginX = -minX / this._defaultWidth;
    this._proportionalOriginY = -minY / this._defaultHeight;
    this._proportionalOriginZ = -minZ / this._defaultDepth;
  }

  /**
   * Remove rendered instances that are not associated to any instance anymore
   * (this can happen after an instance has been deleted).
   */
  _destroyUnusedInstanceRenderers() {
    for (const i in this.renderedInstances) {
      // $FlowFixMe - useless to cast to number
      const renderedInstance = this.renderedInstances[i];
      if (!renderedInstance.wasUsed) {
        renderedInstance.onRemovedFromScene();
        // $FlowFixMe - useless to cast to number
        delete this.renderedInstances[i];
      } else renderedInstance.wasUsed = false;
    }
  }

  isRenderedIn3D(): boolean {
    return this._isRenderedIn3D;
  }

  onRemovedFromScene(): void {
    super.onRemovedFromScene();

    // Destroy all instances
    for (const i in this.renderedInstances) {
      // $FlowFixMe - useless to cast to number
      this.renderedInstances[i].onRemovedFromScene();
      // $FlowFixMe - useless to cast to number
      delete this.renderedInstances[i];
    }
    for (const childrenInstance of this.childrenRenderedInstances) {
      childrenInstance.onRemovedFromScene();
    }

    // Destroy the object iterating on instances
    this.instancesRenderer.delete();
    this._instancesMeasurer.delete();

    // Destroy the container.
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
    if (eventBasedObject.isAnimatable()) {
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
    const childObjects = eventBasedObject.getObjects();
    for (let i = 0; i < childObjects.getObjectsCount(); i++) {
      const childObject = childObjects.getObjectAt(i);
      const childObjectConfiguration = customObjectConfiguration.getChildObjectConfiguration(
        childObject.getName()
      );
      const childType = childObjectConfiguration.getType();
      if (
        childType === 'Sprite' ||
        childType === 'TiledSpriteObject::TiledSprite' ||
        childType === 'PanelSpriteObject::PanelSprite' ||
        childType === 'Scene3D::Cube3DObject'
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

  _updatePixiObjectsZOrder() {
    this._pixiContainer.children.sort((a, b) => {
      a.zOrder = a.zOrder || 0;
      b.zOrder = b.zOrder || 0;
      return a.zOrder - b.zOrder;
    });
  }

  update() {
    // TODO For animatable custom objects, change the texture used by the child
    // according to the current animation.

    if (this._isRenderedFromInitialInstances()) {
      const { eventBasedObject } = this;
      if (eventBasedObject) {
        this._updateDimensions();
        eventBasedObject
          .getInitialInstances()
          .iterateOverInstancesWithZOrdering(
            // $FlowFixMe - gd.castObject is not supporting typings.
            this.instancesRenderer,
            '' // TODO: handle all layer
          );
        this._updatePixiObjectsZOrder();
        this._destroyUnusedInstanceRenderers();
      }
    } else {
      applyChildLayouts(this);
    }

    const firstInstance = this.childrenRenderedInstances[0];
    let is3D = !!firstInstance && firstInstance instanceof Rendered3DInstance;

    for (const i in this.renderedInstances) {
      // $FlowFixMe - useless to cast to number
      const renderedInstance = this.renderedInstances[i];
      if (renderedInstance instanceof Rendered3DInstance) {
        is3D = true;
        break;
      }
    }

    if (this._isRenderedFromInitialInstances()) {
      // The children are rendered for the default size and the render image is
      // stretched.
      const scaleX = this.getWidth() / this.getDefaultWidth();
      const scaleY = this.getHeight() / this.getDefaultHeight();
      const scaleZ = this.getDepth() / this.getDefaultDepth();

      const threeObject = this._threeObject;
      const threeObjectPivot = this._threeObjectPivot;
      if (threeObject && threeObjectPivot && is3D) {
        const pivotX = this.getCenterX() - this.getOriginX();
        const pivotY = this.getCenterY() - this.getOriginY();
        const pivotZ = this.getCenterZ() - this.getOriginZ();

        threeObject.rotation.set(
          RenderedInstance.toRad(this._instance.getRotationX()),
          RenderedInstance.toRad(this._instance.getRotationY()),
          RenderedInstance.toRad(this._instance.getAngle())
        );

        threeObject.position.set(-pivotX, -pivotY, -pivotZ);
        threeObject.position.applyEuler(threeObject.rotation);
        threeObject.position.x += this._instance.getX() + pivotX;
        threeObject.position.y += this._instance.getY() + pivotY;
        threeObject.position.z += this._instance.getZ() + pivotZ;

        threeObject.scale.set(scaleX, scaleY, scaleZ);
      }

      const unscaledCenterX =
        this.getDefaultWidth() * (0.5 - this._proportionalOriginX);
      const unscaledCenterY =
        this.getDefaultHeight() * (0.5 - this._proportionalOriginY);

      this._pixiObject.pivot.x = unscaledCenterX;
      this._pixiObject.pivot.y = unscaledCenterY;
      this._pixiObject.position.x =
        this._instance.getX() + unscaledCenterX * Math.abs(scaleX);
      this._pixiObject.position.y =
        this._instance.getY() + unscaledCenterY * Math.abs(scaleY);

      this._pixiObject.rotation = RenderedInstance.toRad(
        this._instance.getAngle()
      );
      this._pixiObject.scale.x = scaleX;
      this._pixiObject.scale.y = scaleY;
    } else {
      // The children dimension and position are evaluated according to the
      // layout. The object pixels are not stretched. The object is rendered in
      // its current dimension. This is why the scale is always set to 1.
      const originX = this.getOriginX();
      const originY = this.getOriginY();
      const originZ = this.getOriginZ();
      const centerX = this.getCenterX();
      const centerY = this.getCenterY();
      const centerZ = this.getCenterZ();

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
      }
      this._pixiObject.pivot.x = centerX - originX;
      this._pixiObject.pivot.y = centerY - originY;
      this._pixiObject.position.x = this._instance.getX() + centerX - originX;
      this._pixiObject.position.y = this._instance.getY() + centerY - originY;

      this._pixiObject.rotation = RenderedInstance.toRad(
        this._instance.getAngle()
      );

      this._pixiObject.scale.x = 1;
      this._pixiObject.scale.y = 1;
    }
  }

  getDefaultWidth() {
    return this._isRenderedFromInitialInstances()
      ? this._defaultWidth
      : this.childrenRenderedInstances.length > 0
      ? this.childrenRenderedInstances[0].getDefaultWidth()
      : 48;
  }

  getDefaultHeight() {
    return this._isRenderedFromInitialInstances()
      ? this._defaultHeight
      : this.childrenRenderedInstances.length > 0
      ? this.childrenRenderedInstances[0].getDefaultHeight()
      : 48;
  }

  getDefaultDepth() {
    if (this._isRenderedFromInitialInstances()) {
      return this._defaultDepth;
    }
    const firstInstance = this.childrenRenderedInstances[0];
    return firstInstance && firstInstance instanceof Rendered3DInstance
      ? firstInstance.getDefaultDepth()
      : 48;
  }

  getOriginX(): number {
    return this._proportionalOriginX * this.getWidth();
  }

  getOriginY(): number {
    return this._proportionalOriginY * this.getHeight();
  }

  getOriginZ(): number {
    return this._proportionalOriginZ * this.getDepth();
  }

  getCenterX() {
    return this.getWidth() / 2;
  }

  getCenterY() {
    return this.getHeight() / 2;
  }

  getCenterZ() {
    return this.getDepth() / 2;
  }
}
