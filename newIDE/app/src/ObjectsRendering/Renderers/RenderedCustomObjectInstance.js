// @flow
import RenderedInstance from './RenderedInstance';
import Rendered3DInstance from './Rendered3DInstance';
import RenderedUnknownInstance from './RenderedUnknownInstance';
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

const getVariant = (
  eventBasedObject: gdEventsBasedObject,
  customObjectConfiguration: gdCustomObjectConfiguration
): gdEventsBasedObjectVariant => {
  const variants = eventBasedObject.getVariants();
  const variantName = customObjectConfiguration.getVariantName();
  return variants.hasVariantNamed(variantName)
    ? variants.getVariant(variantName)
    : eventBasedObject.getDefaultVariant();
};

type PropertyMappingRule = {
  targetChild: string,
  targetProperty: string,
  sourceProperty: string,
};

const getPropertyMappingRules = (
  eventBasedObject: gdEventsBasedObject
): Array<PropertyMappingRule> => {
  const properties = eventBasedObject.getPropertyDescriptors();
  if (!properties.has('_PropertyMapping')) {
    return [];
  }
  const extraInfos = properties
    .get('_PropertyMapping')
    .getExtraInfo()
    .toJSArray();
  return extraInfos
    .map(extraInfo => {
      const mapping = extraInfo.split('=');
      if (mapping.length < 2) {
        return null;
      }
      const targetPath = mapping[0].split('.');
      if (mapping.length < 2) {
        return null;
      }
      return {
        targetChild: targetPath[0],
        targetProperty: targetPath[1],
        sourceProperty: mapping[1],
      };
    })
    .filter(Boolean);
};

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
  _propertyMappingRules: Array<PropertyMappingRule>;

  constructor(
    project: gdProject,
    instance: gdInitialInstance,
    associatedObjectConfiguration: gdObjectConfiguration,
    pixiContainer: PIXI.Container,
    threeGroup: THREE.Group,
    pixiResourcesLoader: Class<PixiResourcesLoader>,
    propertyOverridings: Map<string, string>
  ) {
    super(
      project,
      instance,
      associatedObjectConfiguration,
      pixiContainer,
      threeGroup,
      pixiResourcesLoader,
      propertyOverridings
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
    this._propertyMappingRules = getPropertyMappingRules(eventBasedObject);
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
      // No renderer associated yet, the instance must have been just created!...

      const customObjectConfiguration = gd.asCustomObjectConfiguration(
        this._associatedObjectConfiguration
      );

      let childObjectConfiguration = null;
      const variant = this.getVariant();
      if (variant) {
        const childObjects = variant.getObjects();
        if (childObjects.hasObjectNamed(instance.getObjectName())) {
          const childObject = childObjects.getObject(instance.getObjectName());
          childObjectConfiguration =
            this.eventBasedObject &&
            customObjectConfiguration.isMarkedAsOverridingEventsBasedObjectChildrenConfiguration() &&
            variant === this.eventBasedObject.getDefaultVariant()
              ? customObjectConfiguration.getChildObjectConfiguration(
                  instance.getObjectName()
                )
              : childObject.getConfiguration();
        }
      }
      // Apply property mapping rules on the child instance.
      const childPropertyOverridings = new Map<string, string>();
      const customObjectProperties = customObjectConfiguration.getProperties();
      for (const propertyMappingRule of this._propertyMappingRules) {
        if (propertyMappingRule.targetChild !== instance.getObjectName()) {
          continue;
        }
        const sourceValue = this._propertyOverridings.has(
          propertyMappingRule.sourceProperty
        )
          ? this._propertyOverridings.get(propertyMappingRule.sourceProperty)
          : customObjectProperties
              .get(propertyMappingRule.sourceProperty)
              .getValue();
        if (sourceValue !== undefined) {
          childPropertyOverridings.set(
            propertyMappingRule.targetProperty,
            sourceValue
          );
        }
      }
      //...so let's create a renderer.
      renderedInstance = childObjectConfiguration
        ? ObjectsRenderingService.createNewInstanceRenderer(
            this._project,
            instance,
            childObjectConfiguration,
            this._pixiObject,
            this._threeObject,
            childPropertyOverridings
          )
        : new RenderedUnknownInstance(
            this._project,
            instance,
            // $FlowFixMe It's not actually used.
            null,
            this._pixiObject,
            PixiResourcesLoader
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
    const variant = getVariant(eventBasedObject, customObjectConfiguration);
    const childObjects = variant.getObjects();
    for (let i = 0; i < childObjects.getObjectsCount(); i++) {
      const childObject = childObjects.getObjectAt(i);
      const childObjectConfiguration = customObjectConfiguration.isForcedToOverrideEventsBasedObjectChildrenConfiguration()
        ? customObjectConfiguration.getChildObjectConfiguration(
            childObject.getName()
          )
        : variant !== eventBasedObject.getDefaultVariant()
        ? variant
            .getObjects()
            .getObject(childObject.getName())
            .getConfiguration()
        : customObjectConfiguration.isMarkedAsOverridingEventsBasedObjectChildrenConfiguration()
        ? customObjectConfiguration.getChildObjectConfiguration(
            childObject.getName()
          )
        : variant
            .getObjects()
            .getObject(childObject.getName())
            .getConfiguration();
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

  getVariant(): gdEventsBasedObjectVariant | null {
    const { eventBasedObject } = this;
    if (!eventBasedObject) {
      return null;
    }
    const customObjectConfiguration = gd.asCustomObjectConfiguration(
      this._associatedObjectConfiguration
    );
    return getVariant(eventBasedObject, customObjectConfiguration);
  }

  update() {
    const { eventBasedObject } = this;
    const variant = this.getVariant();
    if (!eventBasedObject || !variant) {
      return;
    }

    const layers = variant.getLayers();
    for (
      let layerIndex = 0;
      layerIndex < layers.getLayersCount();
      layerIndex++
    ) {
      const layer = layers.getLayerAt(layerIndex);
      if (layer.getVisibility()) {
        variant.getInitialInstances().iterateOverInstancesWithZOrdering(
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

      const unscaledCenterX =
        this.getDefaultWidth() / 2 + variant.getAreaMinX();
      const unscaledCenterY =
        this.getDefaultHeight() / 2 + variant.getAreaMinY();

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
    const variant = this.getVariant();
    return variant ? variant.getAreaMaxX() - variant.getAreaMinX() : 48;
  }

  getDefaultHeight() {
    const variant = this.getVariant();
    return variant ? variant.getAreaMaxY() - variant.getAreaMinY() : 48;
  }

  getDefaultDepth() {
    const variant = this.getVariant();
    return variant ? variant.getAreaMaxZ() - variant.getAreaMinZ() : 48;
  }

  getOriginX(): number {
    const variant = this.getVariant();
    if (!variant) {
      return 0;
    }
    return (-variant.getAreaMinX() / this.getDefaultWidth()) * this.getWidth();
  }

  getOriginY(): number {
    const variant = this.getVariant();
    if (!variant) {
      return 0;
    }
    return (
      (-variant.getAreaMinY() / this.getDefaultHeight()) * this.getHeight()
    );
  }

  getOriginZ(): number {
    const variant = this.getVariant();
    if (!variant) {
      return 0;
    }
    return (-variant.getAreaMinZ() / this.getDefaultDepth()) * this.getDepth();
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
