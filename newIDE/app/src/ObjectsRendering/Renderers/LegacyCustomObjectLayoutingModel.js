// @flow

// - The term "object" is used in comments about the layout declaration because
//   the layout is done with one instance per object-child and the object name
//   is used to reference these instances.
// - The term "instance" is used for the layout calculus because it's actually
//   instances that are in the scene editor.

type AxisLayout = {
  /**
   * The origin of the anchor on the object to place
   * as a factor of the current object size
   * (0 for left or top, 1 for right or bottom).
   */
  anchorOrigin?: number,
  /**
   * The target of the anchor on the referential object
   * as a factor of the targeted object size
   * (0 for left or top, 1 for right or bottom).
   */
  anchorTarget?: number,
  /**
   * The object name to take as referential.
   */
  anchorTargetObject?: string,
  /**
   * A displacement to add on the anchored object.
   */
  anchorDelta?: number,
  /**
   * Scale proportionally to the target when anchored.
   */
  isScaledProportionally?: boolean,
  /**
   * The left or top margin in pixels.
   */
  minSideAbsoluteMargin?: number,
  /**
   * The right or bottom margin in pixels.
   */
  maxSideAbsoluteMargin?: number,
  /**
   * The left or top margin as a factor of the parent size.
   */
  minSideProportionalMargin?: number,
  /**
   * The right or bottom margin as a factor of the parent size.
   */
  maxSideProportionalMargin?: number,
};

/**
 * Layout description that allows to position the child-objects
 * to follow the size of the parent.
 */
export type ChildLayout = {
  /**
   * Some child-object are optional or only displayed according to the parent state.
   * For example, for buttons there is a background for each state.
   */
  isShown: boolean,
  horizontalLayout: AxisLayout,
  verticalLayout: AxisLayout,
  depthLayout: AxisLayout,
};

/**
 * The keywords to find in the properties to build the ChildLayout.
 */
const layoutFields = [
  'Show',
  'LeftPadding',
  'TopPadding',
  'RightPadding',
  'BottomPadding',
  'HorizontalAnchorOrigin',
  'HorizontalAnchorTarget',
  'VerticalAnchorOrigin',
  'VerticalAnchorTarget',
  'AnchorOrigin',
  'AnchorTarget',
  'AnchorDeltaX',
  'AnchorDeltaY',
  'IsScaledProportionallyOnX',
  'IsScaledProportionallyOnY',
  'IsScaledProportionallyOnZ',
  'IsScaledProportionally',
];

/**
 * @param positionName Accepted values are: 'left', 'center' or 'right', but
 * also values like 'top-left'.
 * @returns a value between 0 and 1.
 */
export const getProportionalPositionX = (
  positionName: string
): number | null => {
  const horizontalPositionName = (positionName.includes('-')
    ? positionName.split('-')[1]
    : positionName
  ).toLowerCase();
  return horizontalPositionName === 'left'
    ? 0
    : horizontalPositionName === 'right'
    ? 1
    : horizontalPositionName === 'center'
    ? 0.5
    : null;
};

/**
 * @param positionName Accepted values are: 'top', 'center' or 'bottom', but
 * also values like 'top-left'.
 * @returns a value between 0 and 1.
 */
export const getProportionalPositionY = (
  positionName: string
): number | null => {
  const verticalPositionName = (positionName.includes('-')
    ? positionName.split('-')[0]
    : positionName
  ).toLowerCase();
  return verticalPositionName === 'top'
    ? 0
    : verticalPositionName === 'bottom'
    ? 1
    : verticalPositionName === 'center'
    ? 0.5
    : null;
};

/**
 * @param positionName Accepted values are: 'Zmin', 'center' or 'Zmax', but
 * also values like 'top-left-Zmin'.
 * @returns a value between 0 and 1.
 */
export const getProportionalPositionZ = (
  positionName: string
): number | null => {
  const verticalPositionName = (positionName.includes('-')
    ? positionName.split('-')[2] || ''
    : positionName
  ).toLowerCase();
  return verticalPositionName === 'Zmin'
    ? 0
    : verticalPositionName === 'Zmax'
    ? 1
    : verticalPositionName === 'center'
    ? 0.5
    : null;
};

const getHorizontalAnchorValue = (
  anchorName: string,
  properties: gdMapStringPropertyDescriptor
): number | null => {
  const proportionalX = getProportionalPositionX(anchorName);
  return proportionalX !== null
    ? proportionalX
    : // Reference to another property to allow to expose a Choice property.
    properties && properties.has(anchorName)
    ? getProportionalPositionX(properties.get(anchorName).getValue())
    : null;
};

const getVerticalAnchorValue = (
  anchorName: string,
  properties: gdMapStringPropertyDescriptor
): number | null => {
  const proportionalY = getProportionalPositionY(anchorName);
  return proportionalY !== null
    ? proportionalY
    : // Reference to another property to allow to expose a Choice property.
    properties && properties.has(anchorName)
    ? getProportionalPositionY(properties.get(anchorName).getValue())
    : null;
};

/**
 * Origin anchors can have smart value to only expose the target anchor property
 * and fill the origin anchor property accordingly.
 */
const getHorizontalOriginAnchorValue = (
  anchorName: string,
  properties: gdMapStringPropertyDescriptor,
  targetAnchorValue: number | null
): number | null => {
  const horizontalAnchorName = (anchorName.includes('-')
    ? anchorName.split('-')[1]
    : anchorName
  ).toLowerCase();
  return horizontalAnchorName === 'same'
    ? targetAnchorValue
    : horizontalAnchorName === 'opposite' && targetAnchorValue !== null
    ? 1 - targetAnchorValue
    : getHorizontalAnchorValue(horizontalAnchorName, properties);
};

/**
 * Origin anchors can have smart value to only expose the target anchor property
 * and fill the origin anchor property accordingly.
 */
const getVerticalOriginAnchorValue = (
  anchorName: string,
  properties: gdMapStringPropertyDescriptor,
  targetAnchorValue: number | null
): number | null => {
  const verticalAnchorName = (anchorName.includes('-')
    ? anchorName.split('-')[0]
    : anchorName
  ).toLowerCase();
  return verticalAnchorName === 'same'
    ? targetAnchorValue
    : verticalAnchorName === 'opposite' && targetAnchorValue !== null
    ? 1 - targetAnchorValue
    : getVerticalAnchorValue(verticalAnchorName, properties);
};

export interface PropertiesContainer {
  getProperties(): gdMapStringPropertyDescriptor;
}

/**
 * Build the layouts description from the custom object properties.
 */
export const getLayouts = (
  eventBasedObject: gdEventsBasedObject,
  customObjectConfiguration: PropertiesContainer
): Map<string, ChildLayout> => {
  const layouts: Map<string, ChildLayout> = new Map<string, ChildLayout>();
  const properties = eventBasedObject.getPropertyDescriptors();
  const instanceProperties = customObjectConfiguration.getProperties();

  for (
    let propertyIndex = 0;
    propertyIndex < properties.getCount();
    propertyIndex++
  ) {
    const property = properties.getAt(propertyIndex);

    /**
     * The list of child-object where the layout is applied
     */
    const childNames = property.getExtraInfo();
    if (!childNames) {
      continue;
    }

    // The property types should never be checked because we may introduce
    // new types to make the layout configuration easier.
    const name = property.getName();
    const propertyValueString = instanceProperties.get(name).getValue();
    const propertyValueBoolean = propertyValueString === 'true';
    const propertyValueNumber = Number.parseFloat(propertyValueString) || 0;
    const layoutField = layoutFields.find(field => name.includes(field));

    // AnchorTarget extraInfo is not the list of child-object where the layout is applied
    // but the child that is the target of the anchor.
    // The extraInfos from the AnchorOrigin is used to get this child-object list
    let targetObjectName = '';
    let horizontalAnchorTarget: number | null = null;
    let verticalAnchorTarget: number | null = null;
    if (
      layoutField === 'HorizontalAnchorOrigin' ||
      layoutField === 'VerticalAnchorOrigin' ||
      layoutField === 'AnchorOrigin'
    ) {
      const targetPropertyName = name.replace('AnchorOrigin', 'AnchorTarget');
      if (properties.has(targetPropertyName)) {
        const targetProperty = properties.get(targetPropertyName);
        targetObjectName =
          targetProperty.getExtraInfo().size() > 0
            ? targetProperty.getExtraInfo().at(0)
            : '';
        const anchorTargetStringValue = instanceProperties
          .get(targetPropertyName)
          .getValue();
        const anchorTargetValueNumber =
          Number.parseFloat(anchorTargetStringValue) || 0;
        if (
          layoutField === 'HorizontalAnchorOrigin' ||
          layoutField === 'AnchorOrigin'
        ) {
          horizontalAnchorTarget =
            getHorizontalAnchorValue(
              anchorTargetStringValue,
              instanceProperties
            ) || anchorTargetValueNumber;
        }
        if (
          layoutField === 'VerticalAnchorOrigin' ||
          layoutField === 'AnchorOrigin'
        ) {
          verticalAnchorTarget =
            getVerticalAnchorValue(
              anchorTargetStringValue,
              instanceProperties
            ) || anchorTargetValueNumber;
        }
      }
    }

    for (let childIndex = 0; childIndex < childNames.size(); childIndex++) {
      const childName = childNames.at(childIndex);
      let layout = layouts.get(childName);
      if (!layout) {
        layout = {
          isShown: true,
          horizontalLayout: {},
          verticalLayout: {},
          depthLayout: {},
        };
        layouts.set(childName, layout);
      }
      if (layoutField === 'Show') {
        if (propertyValueString !== 'true') {
          // $FlowFixMe[incompatible-type]
          layout.isShown = false;
        }
      } else if (layoutField === 'LeftPadding') {
        // $FlowFixMe[prop-missing]
        layout.horizontalLayout.minSideAbsoluteMargin = propertyValueNumber;
      } else if (layoutField === 'RightPadding') {
        // $FlowFixMe[prop-missing]
        layout.horizontalLayout.maxSideAbsoluteMargin = propertyValueNumber;
      } else if (layoutField === 'TopPadding') {
        // $FlowFixMe[prop-missing]
        layout.verticalLayout.minSideAbsoluteMargin = propertyValueNumber;
      } else if (layoutField === 'BottomPadding') {
        // $FlowFixMe[prop-missing]
        layout.verticalLayout.maxSideAbsoluteMargin = propertyValueNumber;
      } else if (layoutField === 'AnchorDeltaX') {
        // $FlowFixMe[prop-missing]
        layout.horizontalLayout.anchorDelta = propertyValueNumber;
      } else if (layoutField === 'AnchorDeltaY') {
        // $FlowFixMe[prop-missing]
        layout.verticalLayout.anchorDelta = propertyValueNumber;
      } else if (layoutField === 'IsScaledProportionallyOnX') {
        // $FlowFixMe[prop-missing]
        layout.horizontalLayout.isScaledProportionally = propertyValueBoolean;
      } else if (layoutField === 'IsScaledProportionallyOnY') {
        // $FlowFixMe[prop-missing]
        layout.verticalLayout.isScaledProportionally = propertyValueBoolean;
      } else if (layoutField === 'IsScaledProportionallyOnZ') {
        // $FlowFixMe[prop-missing]
        layout.depthLayout.isScaledProportionally = propertyValueBoolean;
      } else if (layoutField === 'IsScaledProportionally') {
        // $FlowFixMe[prop-missing]
        layout.horizontalLayout.isScaledProportionally = propertyValueBoolean;
        // $FlowFixMe[prop-missing]
        layout.verticalLayout.isScaledProportionally = propertyValueBoolean;
        // $FlowFixMe[prop-missing]
        layout.depthLayout.isScaledProportionally = propertyValueBoolean;
      } else {
        if (
          layoutField === 'HorizontalAnchorOrigin' ||
          layoutField === 'AnchorOrigin'
        ) {
          const anchorOrigin =
            getHorizontalOriginAnchorValue(
              propertyValueString,
              instanceProperties,
              horizontalAnchorTarget
            ) || propertyValueNumber;
          // $FlowFixMe[invalid-compare]
          if (anchorOrigin !== null) {
            // $FlowFixMe[prop-missing]
            layout.horizontalLayout.anchorOrigin = anchorOrigin;
          }
          if (horizontalAnchorTarget !== null) {
            // $FlowFixMe[prop-missing]
            layout.horizontalLayout.anchorTarget = horizontalAnchorTarget;
          }
          // $FlowFixMe[prop-missing]
          layout.horizontalLayout.anchorTargetObject = targetObjectName;
        }
        if (
          layoutField === 'VerticalAnchorOrigin' ||
          layoutField === 'AnchorOrigin'
        ) {
          const anchorOrigin =
            getVerticalOriginAnchorValue(
              propertyValueString,
              instanceProperties,
              horizontalAnchorTarget
            ) || propertyValueNumber;
          // $FlowFixMe[invalid-compare]
          if (anchorOrigin !== null) {
            // $FlowFixMe[prop-missing]
            layout.verticalLayout.anchorOrigin = anchorOrigin;
          }
          if (verticalAnchorTarget !== null) {
            // $FlowFixMe[prop-missing]
            layout.verticalLayout.anchorTarget = verticalAnchorTarget;
          }
          // $FlowFixMe[prop-missing]
          layout.verticalLayout.anchorTargetObject = targetObjectName;
        }
      }
    }
  }
  return layouts;
};

// TODO EBO Make an event-based object instance editor (like the one for the scene)
// and use real instances instead of this.
/**
 * A minimal implementation of a fake gdInitialInstance to allow to store
 * layouting results without actually modifying events-based objects initial
 * instances.
 * @see gdInitialInstance
 */
export class ChildInstance {
  x: number;
  y: number;
  z: number;
  _hasCustomSize: boolean;
  _hasCustomDepth: boolean;
  _customWidth: number;
  _customHeight: number;
  _customDepth: number;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this._customWidth = 0;
    this._customHeight = 0;
    this._customDepth = 0;
    this._hasCustomSize = false;
    this._hasCustomDepth = false;
  }

  getX(): any {
    return this.x;
  }

  getY(): any {
    return this.y;
  }

  getZ(): any {
    return this.z;
  }

  getAngle(): any {
    return 0;
  }

  getRotationX(): any {
    return 0;
  }

  getRotationY(): any {
    return 0;
  }

  setObjectName(name: string) {}

  getObjectName(): any {
    return '';
  }

  setX(x: number) {}

  setY(y: number) {}

  setZ(z: number) {}

  setAngle(angle: number) {}

  setRotationX(angle: number) {}

  setRotationY(angle: number) {}

  isLocked(): any {
    return false;
  }

  setLocked(lock: boolean) {}

  isSealed(): any {
    return false;
  }

  setSealed(seal: boolean) {}

  getZOrder(): any {
    return 0;
  }

  setZOrder(zOrder: number) {}

  getOpacity(): any {
    return 255;
  }

  setOpacity(opacity: number) {}

  isFlippedX(): any {
    return false;
  }

  setFlippedX(flippedX: boolean) {}

  isFlippedY(): any {
    return false;
  }

  setFlippedY(flippedY: boolean) {}

  isFlippedZ(): any {
    return false;
  }

  setFlippedZ(flippedY: boolean) {}

  getLayer(): any {
    return '';
  }

  setLayer(layer: string) {}

  setHasCustomSize(enable: boolean) {
    this._hasCustomSize = enable;
  }

  hasCustomSize(): any {
    return this._hasCustomSize;
  }

  hasCustomDepth(): any {
    return this._hasCustomDepth;
  }

  setCustomWidth(width: number) {
    this._customWidth = width;
    this._hasCustomSize = true;
  }

  getCustomWidth(): any {
    return this._customWidth;
  }

  setCustomHeight(height: number) {
    this._customHeight = height;
    this._hasCustomSize = true;
  }

  getCustomHeight(): any {
    return this._customHeight;
  }

  setCustomDepth(depth: number) {
    this._customDepth = depth;
    this._hasCustomDepth = true;
  }

  getCustomDepth(): any {
    return this._customDepth;
  }

  resetPersistentUuid(): any {
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
  ): any {
    return null;
  }

  getRawDoubleProperty(name: string): any {
    return 0;
  }

  getRawStringProperty(name: string): any {
    return '';
  }

  setRawDoubleProperty(name: string, value: number) {}

  setRawStringProperty(name: string, value: string) {}

  getVariables(): any {
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
  childrenInstances: ChildInstance[];
  childrenLayouts: ChildLayout[];
  childrenRenderedInstances: Array<CovariantChildRenderedInstance>;
  childrenRenderedInstanceByNames: Map<string, CovariantChildRenderedInstance>;
  getWidth(): number;
  getHeight(): number;
  getDepth(): number;
}

export const applyChildLayouts = <T: ChildRenderedInstance>(
  parent: LayoutedParent<T>
) => {
  const width = parent.getWidth();
  const height = parent.getHeight();

  for (
    let index = 0;
    index < parent.childrenRenderedInstances.length;
    index++
  ) {
    const renderedInstance = parent.childrenRenderedInstances[index];
    const childInstance = parent.childrenInstances[index];
    const childLayout = parent.childrenLayouts[index];

    const childOriginX = renderedInstance.getOriginX();
    const childOriginY = renderedInstance.getOriginY();

    if (childLayout.horizontalLayout.anchorOrigin == null) {
      const childMinX =
        childLayout.horizontalLayout.minSideAbsoluteMargin ||
        (childLayout.horizontalLayout.minSideProportionalMargin || 0) * width;
      const childMaxX =
        width -
        (childLayout.horizontalLayout.maxSideAbsoluteMargin ||
          (childLayout.horizontalLayout.maxSideProportionalMargin || 0) *
            width);

      childInstance.x = childMinX + childOriginX;
      childInstance.setCustomWidth(childMaxX - childMinX);
    } else {
      const anchorOrigin = childLayout.horizontalLayout.anchorOrigin || 0;
      const anchorTarget = childLayout.horizontalLayout.anchorTarget || 0;

      const targetRenderedInstance =
        parent.childrenRenderedInstanceByNames.get(
          childLayout.horizontalLayout.anchorTargetObject || ''
        ) || parent.childrenRenderedInstances[0];
      const targetInstance = targetRenderedInstance._instance;
      const targetInstanceWidth = targetInstance.hasCustomSize()
        ? targetInstance.getCustomWidth()
        : targetRenderedInstance.getDefaultWidth();

      const width = childLayout.horizontalLayout.isScaledProportionally
        ? (targetInstanceWidth * renderedInstance.getDefaultWidth()) /
          targetRenderedInstance.getDefaultWidth()
        : renderedInstance.getDefaultWidth();

      childInstance.x =
        targetInstance.getX() -
        targetRenderedInstance.getOriginX() +
        (childLayout.horizontalLayout.anchorDelta || 0) +
        anchorTarget * targetInstanceWidth -
        anchorOrigin * width +
        childOriginX;
      childInstance.setCustomWidth(width);
    }

    if (childLayout.verticalLayout.anchorOrigin == null) {
      const childMinY =
        childLayout.verticalLayout.minSideAbsoluteMargin ||
        (childLayout.verticalLayout.minSideProportionalMargin || 0) * height;
      const childMaxY =
        height -
        (childLayout.verticalLayout.maxSideAbsoluteMargin ||
          (childLayout.verticalLayout.maxSideProportionalMargin || 0) * height);

      childInstance.y = childMinY + childOriginY;
      const expectedHeight = childMaxY - childMinY;
      childInstance.setCustomHeight(childMaxY - childMinY);

      renderedInstance.update();
      // This ensure objects are centered if their dimensions changed from the
      // custom ones (preferred ones).
      // For instance, text object dimensions change according to how the text is wrapped.
      childInstance.y +=
        (expectedHeight - renderedInstance._pixiObject.height) / 2;
    } else {
      const anchorOrigin = childLayout.verticalLayout.anchorOrigin || 0;
      const anchorTarget = childLayout.verticalLayout.anchorTarget || 0;

      const targetRenderedInstance =
        parent.childrenRenderedInstanceByNames.get(
          childLayout.horizontalLayout.anchorTargetObject || ''
        ) || parent.childrenRenderedInstances[0];
      const targetInstance = targetRenderedInstance._instance;
      const targetInstanceHeight = targetInstance.hasCustomSize()
        ? targetInstance.getCustomHeight()
        : targetRenderedInstance.getDefaultHeight();

      const height = childLayout.horizontalLayout.isScaledProportionally
        ? (targetInstanceHeight * renderedInstance.getDefaultHeight()) /
          targetRenderedInstance.getDefaultHeight()
        : renderedInstance.getDefaultHeight();

      childInstance.y =
        targetInstance.getY() -
        targetRenderedInstance.getOriginY() +
        (childLayout.verticalLayout.anchorDelta || 0) +
        anchorTarget * targetInstanceHeight -
        anchorOrigin * height +
        childOriginY;
      childInstance.setCustomHeight(height);
    }

    childInstance.z = 0;
    childInstance.setCustomDepth(parent.getDepth());

    renderedInstance.update();
  }
};
