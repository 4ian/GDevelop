// @flow
import RenderedInstance from './RenderedInstance';
import Rendered3DInstance from './Rendered3DInstance';
import PixiResourcesLoader from '../PixiResourcesLoader';
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
} from './LegacyCustomObjectLayoutingModel';
import * as PIXI from 'pixi.js-legacy';
import * as THREE from 'three';

const gd: libGDevelop = global.gd;

/**
 * Renderer for gd.CustomObject (the class is not exposed to newIDE)
 */
export default class LegacyRenderedCustomObjectInstance
  extends Rendered3DInstance
  implements LayoutedParent<RenderedInstance | Rendered3DInstance> {
  childrenInstances: ChildInstance[];
  childrenLayouts: ChildLayout[];
  childrenRenderedInstances: Array<RenderedInstance | Rendered3DInstance>;
  childrenRenderedInstanceByNames: Map<
    string,
    RenderedInstance | Rendered3DInstance
  >;
  _proportionalOriginX: number | null;
  _proportionalOriginY: number | null;
  _proportionalOriginZ: number | null;
  _isRenderedIn3D = false;

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
      null;
    this._proportionalOriginY =
      (parentOriginPositionName &&
        getProportionalPositionY(parentOriginPositionName)) ||
      (parentOriginYPositionName &&
        getProportionalPositionY(parentOriginYPositionName)) ||
      null;
    this._proportionalOriginZ =
      (parentOriginPositionName &&
        getProportionalPositionZ(parentOriginPositionName)) ||
      (parentOriginZPositionName &&
        getProportionalPositionZ(parentOriginZPositionName)) ||
      null;

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
    this._isRenderedIn3D = eventBasedObject.isRenderedIn3D();

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
        this._threeObject
      );
      if (!childLayout.isShown) {
        this._pixiObject.removeChild(renderer._pixiObject);
        if (this._threeObject && renderer instanceof Rendered3DInstance) {
          this._threeObject.remove(renderer._threeObject);
        }
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

  isRenderedIn3D(): boolean {
    return this._isRenderedIn3D;
  }

  onRemovedFromScene(): void {
    super.onRemovedFromScene();

    // Destroy all instances
    for (const childrenInstance of this.childrenRenderedInstances) {
      childrenInstance.onRemovedFromScene();
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
    applyChildLayouts(this);

    // This allows a 3D custom object to use a 2D rendering in the editor.
    const firstInstance = this.childrenRenderedInstances[0];
    let is3D = !!firstInstance && firstInstance instanceof Rendered3DInstance;

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
    return this.childrenRenderedInstances.length > 0
      ? this.childrenRenderedInstances[0].getDefaultWidth()
      : 48;
  }

  getDefaultHeight() {
    return this.childrenRenderedInstances.length > 0
      ? this.childrenRenderedInstances[0].getDefaultHeight()
      : 48;
  }

  getDefaultDepth() {
    const firstInstance = this.childrenRenderedInstances[0];
    return firstInstance && firstInstance instanceof Rendered3DInstance
      ? firstInstance.getDefaultDepth()
      : 48;
  }

  getOriginX(): number {
    if (this._proportionalOriginX === null) {
      if (this.childrenRenderedInstances.length === 0) {
        return 0;
      }
      return (
        (this.childrenRenderedInstances[0].getOriginX() /
          this.childrenRenderedInstances[0].getWidth()) *
        this.getWidth()
      );
    }
    return this._proportionalOriginX * this.getWidth();
  }

  getOriginY(): number {
    if (this._proportionalOriginY === null) {
      if (this.childrenRenderedInstances.length === 0) {
        return 0;
      }
      return (
        (this.childrenRenderedInstances[0].getOriginY() /
          this.childrenRenderedInstances[0].getHeight()) *
        this.getHeight()
      );
    }
    return this._proportionalOriginY * this.getHeight();
  }

  getOriginZ(): number {
    if (this._proportionalOriginZ === null) {
      if (this.childrenRenderedInstances.length === 0) {
        return 0;
      }
      return (
        (this.childrenRenderedInstances[0].getOriginZ() /
          this.childrenRenderedInstances[0].getDepth()) *
        this.getDepth()
      );
    }
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
