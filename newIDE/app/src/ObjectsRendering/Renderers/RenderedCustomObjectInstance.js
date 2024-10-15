// @flow
import RenderedInstance from './RenderedInstance';
import Rendered3DInstance from './Rendered3DInstance';
import PixiResourcesLoader from '../PixiResourcesLoader';
import ResourcesLoader from '../../ResourcesLoader';
import ObjectsRenderingService from '../ObjectsRenderingService';
import {
  getLayoutedRenderedInstance,
  LayoutedInstance,
  LayoutedParent,
} from './CustomObjectLayoutingModel';
import * as PIXI from 'pixi.js-legacy';
import * as THREE from 'three';

const gd: libGDevelop = global.gd;

/**
 * Renderer for gd.CustomObject (the class is not exposed to newIDE)
 */
export default class RenderedCustomObjectInstance extends Rendered3DInstance
  implements LayoutedParent<RenderedInstance | Rendered3DInstance> {
  eventBasedObject: gdEventsBasedObject | null;
  _isRenderedIn3D = false;

  /** Functor used to render an instance */
  instancesRenderer: gdInitialInstanceJSFunctor;

  layoutedInstances = new Map<number, LayoutedInstance>();
  renderedInstances = new Map<number, RenderedInstance | Rendered3DInstance>();

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
      this._threeObject = threeObject;
    }

    const customObjectConfiguration = gd.asCustomObjectConfiguration(
      associatedObjectConfiguration
    );

    this.eventBasedObject = project.hasEventsBasedObject(
      customObjectConfiguration.getType()
    )
      ? project.getEventsBasedObject(customObjectConfiguration.getType())
      : null;

    const { eventBasedObject } = this;
    if (!eventBasedObject) {
      return;
    }
    this._isRenderedIn3D = eventBasedObject.isRenderedIn3D();

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
        | null = eventBasedObject.isInnerAreaFollowingParentSize()
        ? getLayoutedRenderedInstance(this, instance)
        : this.getRendererOfInstance(instance);

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
  }

  getRendererOfInstance = (
    instance: gdInitialInstance
  ): RenderedInstance | Rendered3DInstance => {
    let renderedInstance = this.renderedInstances.get(instance.ptr);
    if (!renderedInstance) {
      const customObjectConfiguration = gd.asCustomObjectConfiguration(
        this._associatedObjectConfiguration
      );
      //No renderer associated yet, the instance must have been just created!...
      const childObjectConfiguration = customObjectConfiguration.getChildObjectConfiguration(
        instance.getObjectName()
      );
      //...so let's create a renderer.
      renderedInstance = ObjectsRenderingService.createNewInstanceRenderer(
        this._project,
        instance,
        childObjectConfiguration,
        this._pixiObject,
        this._threeObject
      );
      this.renderedInstances.set(instance.ptr, renderedInstance);
    }
    return renderedInstance;
  };

  getLayoutedInstance = (instance: gdInitialInstance): LayoutedInstance => {
    let layoutedInstance = this.layoutedInstances.get(instance.ptr);
    if (!layoutedInstance) {
      layoutedInstance = new LayoutedInstance(instance);
      this.layoutedInstances.set(instance.ptr, layoutedInstance);
    }
    return layoutedInstance;
  };

  /**
   * Remove rendered instances that are not associated to any instance anymore
   * (this can happen after an instance has been deleted).
   */
  _destroyUnusedInstanceRenderers() {
    for (const [i, renderedInstance] of this.renderedInstances) {
      if (!renderedInstance.wasUsed) {
        renderedInstance.onRemovedFromScene();
        if (!renderedInstance._wasDestroyed)
          console.error(
            'Rendered instance was not marked as destroyed by onRemovedFromScene - verify the implementation.',
            renderedInstance
          );

        this.renderedInstances.delete(i);
        this.layoutedInstances.delete(i);
      }
      renderedInstance.wasUsed = false;
    }
  }

  isRenderedIn3D(): boolean {
    return this._isRenderedIn3D;
  }

  onRemovedFromScene(): void {
    super.onRemovedFromScene();

    // Destroy all instances
    for (const renderedInstance of this.renderedInstances.values()) {
      renderedInstance.onRemovedFromScene();
      if (!renderedInstance._wasDestroyed)
        console.error(
          'Rendered instance (of a custom object) was not marked as destroyed by onRemovedFromScene - verify the implementation.',
          renderedInstance
        );
    }
    this.renderedInstances.clear();
    this.layoutedInstances.clear();

    // Destroy the object iterating on instances
    if (this.instancesRenderer) {
      this.instancesRenderer.delete();
    }

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
    const { eventBasedObject } = this;
    if (!eventBasedObject) {
      return;
    }
    const layers = eventBasedObject.getLayers();
    for (
      let layerIndex = 0;
      layerIndex < layers.getLayersCount();
      layerIndex++
    ) {
      const layer = layers.getLayerAt(layerIndex);
      if (layer.getVisibility()) {
        eventBasedObject
          .getInitialInstances()
          .iterateOverInstancesWithZOrdering(
            // $FlowFixMe - gd.castObject is not supporting typings.
            this.instancesRenderer,
            layer.getName()
          );
      }
    }
    this._updatePixiObjectsZOrder();
    this._destroyUnusedInstanceRenderers();

    const is3D = this.isRenderedIn3D();

    if (!eventBasedObject.isInnerAreaFollowingParentSize()) {
      // The children are rendered for the default size and the render image is
      // stretched.
      const scaleX = this.getWidth() / this.getDefaultWidth();
      const scaleY = this.getHeight() / this.getDefaultHeight();
      const scaleZ = this.getDepth() / this.getDefaultDepth();

      const threeObject = this._threeObject;
      if (threeObject && is3D) {
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

      const { eventBasedObject } = this;
      const unscaledCenterX =
        this.getDefaultWidth() / 2 +
        (eventBasedObject ? eventBasedObject.getAreaMinX() : 0);
      const unscaledCenterY =
        this.getDefaultHeight() / 2 +
        (eventBasedObject ? eventBasedObject.getAreaMinY() : 0);

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
      if (threeObject && is3D) {
        threeObject.rotation.set(
          RenderedInstance.toRad(this._instance.getRotationX()),
          RenderedInstance.toRad(this._instance.getRotationY()),
          RenderedInstance.toRad(this._instance.getAngle())
        );
        threeObject.position.set(-centerX, -centerY, -centerZ);
        threeObject.position.applyEuler(threeObject.rotation);
        threeObject.position.x += this._instance.getX() + centerX - originX;
        threeObject.position.y += this._instance.getY() + centerY - originY;
        threeObject.position.z += this._instance.getZ() + centerZ - originZ;
      }
      this._pixiObject.pivot.x = centerX;
      this._pixiObject.pivot.y = centerY;
      this._pixiObject.position.x = this._instance.getX() + centerX - originX;
      this._pixiObject.position.y = this._instance.getY() + centerY - originY;

      this._pixiObject.rotation = RenderedInstance.toRad(
        this._instance.getAngle()
      );
      this._pixiObject.scale.x = 1;
      this._pixiObject.scale.y = 1;
    }

    // Opacity is not handled by 3D objects.
    // TODO Transform 3D objects according to their flipping.
    if (!is3D) {
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

  getDefaultWidth() {
    const { eventBasedObject } = this;
    return eventBasedObject
      ? eventBasedObject.getAreaMaxX() - eventBasedObject.getAreaMinX()
      : 48;
  }

  getDefaultHeight() {
    const { eventBasedObject } = this;
    return eventBasedObject
      ? eventBasedObject.getAreaMaxY() - eventBasedObject.getAreaMinY()
      : 48;
  }

  getDefaultDepth() {
    const { eventBasedObject } = this;
    return eventBasedObject
      ? eventBasedObject.getAreaMaxZ() - eventBasedObject.getAreaMinZ()
      : 48;
  }

  getOriginX(): number {
    const { eventBasedObject } = this;
    if (!eventBasedObject) {
      return 0;
    }
    return (
      (-eventBasedObject.getAreaMinX() / this.getDefaultWidth()) *
      this.getWidth()
    );
  }

  getOriginY(): number {
    const { eventBasedObject } = this;
    if (!eventBasedObject) {
      return 0;
    }
    return (
      (-eventBasedObject.getAreaMinY() / this.getDefaultHeight()) *
      this.getHeight()
    );
  }

  getOriginZ(): number {
    const { eventBasedObject } = this;
    if (!eventBasedObject) {
      return 0;
    }
    return (
      (-eventBasedObject.getAreaMinZ() / this.getDefaultDepth()) *
      this.getDepth()
    );
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
