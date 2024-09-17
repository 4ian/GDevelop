// @flow
const gd: libGDevelop = global.gd;

// - The term "object" is used in comments about the layout declaration because
//   the layout is done with one instance per object-child and the object name
//   is used to reference these instances.
// - The term "instance" is used for the layout calculus because it's actually
//   instances that are in the scene editor.

type Anchor = {
  /**
   * The target of the anchor on the referential object
   * as a factor of the targeted object size
   * (0 for left or top, 1 for right or bottom).
   */
  target: number,
  /**
   * A displacement to add on the anchored object.
   */
  delta: number,
};

/**
 * Layout description that allows to position the child-objects
 * to follow the size of the parent.
 */
export type InstanceAnchor = {
  leftAnchor: Anchor,
  topAnchor: Anchor,
  rightAnchor: Anchor,
  bottomAnchor: Anchor,
};

export type ObjectAnchor = {
  leftEdgeAnchor: CustomObjectConfiguration_EdgeAnchor,
  topEdgeAnchor: CustomObjectConfiguration_EdgeAnchor,
  rightEdgeAnchor: CustomObjectConfiguration_EdgeAnchor,
  bottomEdgeAnchor: CustomObjectConfiguration_EdgeAnchor,
};

const getPropertyValue = (
  properties: gdMapStringPropertyDescriptor,
  name: string
): CustomObjectConfiguration_EdgeAnchor =>
  properties.has(name)
    ? gd.CustomObjectConfiguration.getEdgeAnchorFromString(
        properties.get(name).getValue()
      )
    : gd.CustomObjectConfiguration.NoAnchor;

export interface PropertiesContainer {
  getProperties(): gdMapStringPropertyDescriptor;
}

/**
 * Build the layouts description from the custom object properties.
 */
export const getObjectAnchor = (
  eventBasedObject: gdEventsBasedObject,
  objectName: string
): ObjectAnchor => {
  const childObject = eventBasedObject.getObjects().getObject(objectName);
  if (!childObject.hasBehaviorNamed('Anchor')) {
    return {
      leftEdgeAnchor: gd.CustomObjectConfiguration.NoAnchor,
      topEdgeAnchor: gd.CustomObjectConfiguration.NoAnchor,
      rightEdgeAnchor: gd.CustomObjectConfiguration.NoAnchor,
      bottomEdgeAnchor: gd.CustomObjectConfiguration.NoAnchor,
    };
  }
  const properties = childObject.getBehavior('Anchor').getProperties();
  const leftEdgeAnchor = getPropertyValue(properties, 'leftEdgeAnchor');
  const topEdgeAnchor = getPropertyValue(properties, 'topEdgeAnchor');
  const rightEdgeAnchor = getPropertyValue(properties, 'rightEdgeAnchor');
  const bottomEdgeAnchor = getPropertyValue(properties, 'bottomEdgeAnchor');
  return { leftEdgeAnchor, topEdgeAnchor, rightEdgeAnchor, bottomEdgeAnchor };
};

/**
 * A minimal implementation of a fake gdInitialInstance to allow to store
 * layouting results without actually modifying events-based objects initial
 * instances.
 * @see gdInitialInstance
 */
export class LayoutedInstance {
  instance: gdInitialInstance;
  ptr: number;
  x = 0;
  y = 0;
  z = 0;
  _hasCustomSize = false;
  _hasCustomDepth = false;
  _customWidth = 0;
  _customHeight = 0;
  _customDepth = 0;

  constructor(instance: gdInitialInstance) {
    this.instance = instance;
    this.ptr = instance.ptr;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getZ() {
    return this.z;
  }

  getAngle() {
    return 0;
  }

  getRotationX() {
    return 0;
  }

  getRotationY() {
    return 0;
  }

  getObjectName() {
    return this.instance.getObjectName();
  }

  setX(x: number) {}

  setY(y: number) {}

  setZ(z: number) {}

  setAngle(angle: number) {}

  setRotationX(angle: number) {}

  setRotationY(angle: number) {}

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

  getOpacity() {
    return this.instance.getOpacity();
  }

  setOpacity(opacity: number) {}

  isFlippedX() {
    return this.instance.isFlippedX();
  }

  setFlippedX(flippedX: boolean) {}

  isFlippedY() {
    return this.instance.isFlippedY();
  }

  setFlippedY(flippedY: boolean) {}

  isFlippedZ() {
    return this.instance.isFlippedZ();
  }

  setFlippedZ(flippedY: boolean) {}

  getLayer() {
    return '';
  }

  setLayer(layer: string) {}

  setHasCustomSize(enable: boolean) {
    this._hasCustomSize = enable;
  }

  hasCustomSize() {
    return this._hasCustomSize;
  }

  hasCustomDepth() {
    return this._hasCustomDepth;
  }

  setCustomWidth(width: number) {
    this._customWidth = width;
    this._hasCustomSize = true;
  }

  getCustomWidth() {
    return this._customWidth;
  }

  setCustomHeight(height: number) {
    this._customHeight = height;
    this._hasCustomSize = true;
  }

  getCustomHeight() {
    return this._customHeight;
  }

  setCustomDepth(depth: number) {
    this._customDepth = depth;
    this._hasCustomDepth = true;
  }

  getCustomDepth() {
    return this._customDepth;
  }

  resetPersistentUuid() {
    return this;
  }

  updateCustomProperty(
    name: string,
    value: string,
    globalObjectsContainer: gdObjectsContainer,
    objectsContainer: gdObjectsContainer
  ) {}

  getCustomProperties(
    globalObjectsContainer: gdObjectsContainer,
    objectsContainer: gdObjectsContainer
  ) {
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
 * The part of `gdInitialInstance` interface used by the layouting.
 * @see gdInitialInstance
 */
export type InitialInstanceDimension = {
  hasCustomSize(): boolean,
  getCustomWidth(): number,
  getCustomHeight(): number,
  getX(): number,
  getY(): number,
};

/**
 * @see RenderedInstance
 */
export interface ChildRenderedInstance {
  +_instance: InitialInstanceDimension;
  _pixiObject: { height: number };
  getDefaultWidth(): number;
  getDefaultHeight(): number;
  getOriginX(): number;
  getOriginY(): number;
  update(): void;
}

/**
 * @see RenderedCustomObjectInstance
 */
export interface LayoutedParent<
  CovariantChildRenderedInstance: ChildRenderedInstance
> {
  eventBasedObject: gdEventsBasedObject | null;
  getWidth(): number;
  getHeight(): number;
  getRendererOfInstance: (
    instance: gdInitialInstance
  ) => CovariantChildRenderedInstance;
  getLayoutedInstance: (instance: gdInitialInstance) => LayoutedInstance;
}

export const getLayoutedRenderedInstance = <T: ChildRenderedInstance>(
  parent: LayoutedParent<T>,
  initialInstance: gdInitialInstance
): T | null => {
  const eventBasedObject = parent.eventBasedObject;
  if (!eventBasedObject) {
    return null;
  }

  const layoutedInstance = parent.getLayoutedInstance(initialInstance);
  const renderedInstance = parent.getRendererOfInstance(
    ((layoutedInstance: any): gdInitialInstance)
  );

  const objectAnchor = getObjectAnchor(
    eventBasedObject,
    layoutedInstance.getObjectName()
  );
  const leftEdgeAnchor = objectAnchor
    ? objectAnchor.leftEdgeAnchor
    : gd.CustomObjectConfiguration.NoAnchor;
  const topEdgeAnchor = objectAnchor
    ? objectAnchor.topEdgeAnchor
    : gd.CustomObjectConfiguration.NoAnchor;
  const rightEdgeAnchor = objectAnchor
    ? objectAnchor.rightEdgeAnchor
    : gd.CustomObjectConfiguration.NoAnchor;
  const bottomEdgeAnchor = objectAnchor
    ? objectAnchor.bottomEdgeAnchor
    : gd.CustomObjectConfiguration.NoAnchor;

  const parentInitialMinX = eventBasedObject.getAreaMinX();
  const parentInitialMinY = eventBasedObject.getAreaMinY();
  const parentInitialMaxX = eventBasedObject.getAreaMaxX();
  const parentInitialMaxY = eventBasedObject.getAreaMaxY();
  const parentInitialWidth = parentInitialMaxX - parentInitialMinX;
  const parentInitialHeight = parentInitialMaxY - parentInitialMinY;

  const parentWidth = parent.getWidth();
  const parentHeight = parent.getHeight();
  const parentScaleX = parentWidth / parentInitialWidth;
  const parentScaleY = parentHeight / parentInitialHeight;

  const initialInstanceX = initialInstance.getX();
  const initialInstanceWidth = initialInstance.hasCustomSize()
    ? initialInstance.getCustomWidth()
    : renderedInstance.getDefaultWidth();

  if (parentScaleX === 1 || (!leftEdgeAnchor && !rightEdgeAnchor)) {
    layoutedInstance.x = initialInstanceX;
    layoutedInstance.setCustomWidth(initialInstanceWidth);
  } else {
    const parentInitialCenterX = (parentInitialMaxX + parentInitialMinX) / 2;

    const parentMinX = parentInitialMinX * parentScaleX;
    const parentMaxX = parentInitialMaxX * parentScaleX;
    const parentCenterX = (parentMaxX + parentMinX) / 2;

    const initialInstanceOriginX =
      (renderedInstance.getOriginX() * initialInstanceWidth) /
      renderedInstance.getDefaultWidth();
    const initialInstanceMinX = initialInstanceX - initialInstanceOriginX;
    const initialInstanceMaxX = initialInstanceMinX + initialInstanceWidth;

    let left = initialInstanceMinX;
    if (leftEdgeAnchor === gd.CustomObjectConfiguration.MinEdge) {
      left = parentMinX + initialInstanceMinX - parentInitialMinX;
    } else if (leftEdgeAnchor === gd.CustomObjectConfiguration.MaxEdge) {
      left = parentMaxX + initialInstanceMinX - parentInitialMaxX;
    } else if (leftEdgeAnchor === gd.CustomObjectConfiguration.Proportional) {
      left =
        parentMinX +
        ((initialInstanceMinX - parentInitialMinX) / parentInitialWidth) *
          parentWidth;
    } else if (leftEdgeAnchor === gd.CustomObjectConfiguration.Center) {
      left = parentCenterX + initialInstanceMinX - parentInitialCenterX;
    }

    let right = initialInstanceMaxX;
    if (rightEdgeAnchor === gd.CustomObjectConfiguration.MinEdge) {
      right = parentMinX + initialInstanceMaxX - parentInitialMinX;
    } else if (rightEdgeAnchor === gd.CustomObjectConfiguration.MaxEdge) {
      right = parentMaxX + initialInstanceMaxX - parentInitialMaxX;
    } else if (rightEdgeAnchor === gd.CustomObjectConfiguration.Proportional) {
      right =
        parentMinX +
        ((initialInstanceMaxX - parentInitialMinX) / parentInitialWidth) *
          parentWidth;
    } else if (rightEdgeAnchor === gd.CustomObjectConfiguration.Center) {
      right = parentCenterX + initialInstanceMaxX - parentInitialCenterX;
    }

    let x, width;
    if (rightEdgeAnchor === gd.CustomObjectConfiguration.NoAnchor) {
      width = initialInstanceWidth;
      const originX =
        (renderedInstance.getOriginX() * width) /
        renderedInstance.getDefaultWidth();
      x = left + originX;
    } else if (leftEdgeAnchor === gd.CustomObjectConfiguration.NoAnchor) {
      width = initialInstanceWidth;
      const originX =
        (renderedInstance.getOriginX() * width) /
        renderedInstance.getDefaultWidth();
      x = right - width + originX;
    } else {
      width = right - left;
      const originX =
        (renderedInstance.getOriginX() * width) /
        renderedInstance.getDefaultWidth();
      x = left + originX;
    }
    layoutedInstance.x = x;
    layoutedInstance.setCustomWidth(width);
  }

  const initialInstanceY = initialInstance.getY();
  const initialInstanceHeight = initialInstance.hasCustomSize()
    ? initialInstance.getCustomHeight()
    : renderedInstance.getDefaultHeight();

  if (parentScaleY === 1 || (!topEdgeAnchor && !bottomEdgeAnchor)) {
    layoutedInstance.y = initialInstanceY;
    layoutedInstance.setCustomHeight(initialInstanceHeight);
  } else {
    const parentInitialCenterY = (parentInitialMaxY + parentInitialMinY) / 2;

    const parentMinY = parentInitialMinY * parentScaleY;
    const parentMaxY = parentInitialMaxY * parentScaleY;
    const parentCenterY = (parentMaxY + parentMinY) / 2;

    const initialInstanceOriginY =
      (renderedInstance.getOriginY() * initialInstanceHeight) /
      renderedInstance.getDefaultHeight();
    const initialInstanceMinY = initialInstanceY - initialInstanceOriginY;
    const initialInstanceMaxY = initialInstanceMinY + initialInstanceHeight;

    let bottom = initialInstanceMaxY;
    if (bottomEdgeAnchor === gd.CustomObjectConfiguration.MinEdge) {
      bottom = parentMinY + initialInstanceMaxY - parentInitialMinY;
    } else if (bottomEdgeAnchor === gd.CustomObjectConfiguration.MaxEdge) {
      bottom = parentMaxY + initialInstanceMaxY - parentInitialMaxY;
    } else if (bottomEdgeAnchor === gd.CustomObjectConfiguration.Proportional) {
      bottom =
        parentMinY +
        ((initialInstanceMaxY - parentInitialMinY) / parentInitialHeight) *
          parentHeight;
    } else if (bottomEdgeAnchor === gd.CustomObjectConfiguration.Center) {
      bottom = parentCenterY + initialInstanceMaxY - parentInitialCenterY;
    }

    let top = initialInstanceMinY;
    if (topEdgeAnchor === gd.CustomObjectConfiguration.MinEdge) {
      top = parentMinY + initialInstanceMinY - parentInitialMinY;
    } else if (topEdgeAnchor === gd.CustomObjectConfiguration.MaxEdge) {
      top = parentMaxY + initialInstanceMinY - parentInitialMaxY;
    } else if (topEdgeAnchor === gd.CustomObjectConfiguration.Proportional) {
      top =
        parentMinY +
        ((initialInstanceMinY - parentInitialMinY) / parentInitialHeight) *
          parentHeight;
    } else if (topEdgeAnchor === gd.CustomObjectConfiguration.Center) {
      top = parentCenterY + initialInstanceMinY - parentInitialCenterY;
    }

    let y, height;
    if (bottomEdgeAnchor === gd.CustomObjectConfiguration.NoAnchor) {
      height = initialInstanceHeight;
      const originY =
        (renderedInstance.getOriginY() * height) /
        renderedInstance.getDefaultHeight();
      y = top + originY;
    } else if (topEdgeAnchor === gd.CustomObjectConfiguration.NoAnchor) {
      height = initialInstanceHeight;
      const originY =
        (renderedInstance.getOriginY() * height) /
        renderedInstance.getDefaultHeight();
      y = bottom - height + originY;
    } else {
      height = bottom - top;
      const originY =
        (renderedInstance.getOriginY() * height) /
        renderedInstance.getDefaultHeight();
      y = top + originY;
    }
    layoutedInstance.y = y;
    layoutedInstance.setCustomHeight(height);
  }
  return renderedInstance;
};
