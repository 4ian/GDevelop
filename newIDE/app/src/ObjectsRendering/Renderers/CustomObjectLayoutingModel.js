// @flow

// TODO EBO Make an event-based object instance editor (like the one for the scene)
// and use real instances instead of this.
export class ChildInstance {
  x: number;
  y: number;
  _hasCustomSize: boolean;
  _customWidth: number;
  _customHeight: number;

  constructor() {
    this.x = 0;
    this.y = 0;
    this._customWidth = 0;
    this._customHeight = 0;
    this._hasCustomSize = false;
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

  setHasCustomSize(enable: boolean) {
    this._hasCustomSize = enable;
  }

  hasCustomSize() {
    return this._hasCustomSize;
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
];

const getHorizontalAnchorValue = (
  anchorName: string,
  properties: ?gdMapStringPropertyDescriptor
): ?number => {
  const horizontalAnchorName = (anchorName.includes('-')
    ? anchorName.split('-')[1]
    : anchorName
  ).toLowerCase();
  return horizontalAnchorName === 'left'
    ? 0
    : horizontalAnchorName === 'right'
    ? 1
    : horizontalAnchorName === 'center'
    ? 0.5
    : // Reference to another property to allow to expose a Choice property.
    properties && properties.has(anchorName)
    ? getHorizontalAnchorValue(properties.get(anchorName).getValue(), null)
    : null;
};

const getVerticalAnchorValue = (
  anchorName: string,
  properties: ?gdMapStringPropertyDescriptor
): ?number => {
  const verticalAnchorName = (anchorName.includes('-')
    ? anchorName.split('-')[0]
    : anchorName
  ).toLowerCase();
  return verticalAnchorName === 'top'
    ? 0
    : verticalAnchorName === 'bottom'
    ? 1
    : verticalAnchorName === 'center'
    ? 0.5
    : // Reference to another property to allow to expose a Choice property.
    properties && properties.has(anchorName)
    ? getVerticalAnchorValue(properties.get(anchorName).getValue(), null)
    : null;
};

/**
 * Origin anchors can have smart value to only expose the target anchor property
 * and fill the origin anchor property accordingly.
 */
const getHorizontalOriginAnchorValue = (
  anchorName: string,
  properties: gdMapStringPropertyDescriptor,
  targetAnchorValue: ?number
): ?number => {
  const horizontalAnchorName = (anchorName.includes('-')
    ? anchorName.split('-')[1]
    : anchorName
  ).toLowerCase();
  return horizontalAnchorName === 'same'
    ? targetAnchorValue
    : horizontalAnchorName === 'opposite' && targetAnchorValue != null
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
  targetAnchorValue: ?number
): ?number => {
  const verticalAnchorName = (anchorName.includes('-')
    ? anchorName.split('-')[0]
    : anchorName
  ).toLowerCase();
  return verticalAnchorName === 'same'
    ? targetAnchorValue
    : verticalAnchorName === 'opposite' && targetAnchorValue != null
    ? 1 - targetAnchorValue
    : getVerticalAnchorValue(verticalAnchorName, properties);
};

/**
 * Build the layouts description from the custom object properties.
 */
export const getLayouts = (
  eventBasedObject: gdEventsBasedObject,
  customObjectConfiguration: gdCustomObjectConfiguration
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
    const propertyValueNumber = Number.parseFloat(propertyValueString) || 0;
    const layoutField = layoutFields.find(field => name.includes(field));

    // AnchorTarget extraInfo is not the list of child-object where the layout is applied
    // but the child that is the target of the anchor.
    // The extraInfos from the AnchorOrigin is used to get this child-object list
    let targetObjectName = '';
    let horizontalAnchorTarget: ?number = null;
    let verticalAnchorTarget: ?number = null;
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
        };
        layouts.set(childName, layout);
      }
      if (layoutField === 'Show') {
        if (propertyValueString !== 'true') {
          layout.isShown = false;
        }
      } else if (layoutField === 'LeftPadding') {
        layout.horizontalLayout.minSideAbsoluteMargin = propertyValueNumber;
      } else if (layoutField === 'RightPadding') {
        layout.horizontalLayout.maxSideAbsoluteMargin = propertyValueNumber;
      } else if (layoutField === 'TopPadding') {
        layout.verticalLayout.minSideAbsoluteMargin = propertyValueNumber;
      } else if (layoutField === 'BottomPadding') {
        layout.verticalLayout.maxSideAbsoluteMargin = propertyValueNumber;
      } else if (layoutField === 'AnchorDeltaX') {
        layout.horizontalLayout.anchorDelta = propertyValueNumber;
      } else if (layoutField === 'AnchorDeltaY') {
        layout.verticalLayout.anchorDelta = propertyValueNumber;
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
          if (anchorOrigin !== null) {
            layout.horizontalLayout.anchorOrigin = anchorOrigin;
          }
          if (horizontalAnchorTarget !== null) {
            layout.horizontalLayout.anchorTarget = horizontalAnchorTarget;
          }
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
          if (anchorOrigin !== null) {
            layout.verticalLayout.anchorOrigin = anchorOrigin;
          }
          if (verticalAnchorTarget !== null) {
            layout.verticalLayout.anchorTarget = verticalAnchorTarget;
          }
          layout.verticalLayout.anchorTargetObject = targetObjectName;
        }
      }
    }
  }
  return layouts;
};

export type InitialInstanceDimension = {
  hasCustomSize(): boolean,
  getCustomWidth(): number,
  getCustomHeight(): number,
  getX(): number,
  getY(): number,
};

export interface ChildRenderedInstance {
  +_instance: InitialInstanceDimension;
  _pixiObject: { height: number };
  getDefaultWidth(): number;
  getDefaultHeight(): number;
  update(): void;
}

export interface LayoutedParent<
  CovariantChildRenderedInstance: ChildRenderedInstance
> {
  childrenInstances: ChildInstance[];
  childrenLayouts: ChildLayout[];
  childrenRenderedInstances: Array<CovariantChildRenderedInstance>;
  childrenRenderedInstanceByNames: Map<string, CovariantChildRenderedInstance>;
  getWidth(): number;
  getHeight(): number;
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

    if (childLayout.horizontalLayout.anchorOrigin == null) {
      const childMinX =
        childLayout.horizontalLayout.minSideAbsoluteMargin ||
        (childLayout.horizontalLayout.minSideProportionalMargin || 0) * width;
      const childMaxX =
        width -
        (childLayout.horizontalLayout.maxSideAbsoluteMargin ||
          (childLayout.horizontalLayout.maxSideProportionalMargin || 0) *
            width);

      childInstance.x = childMinX;
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

      childInstance.x =
        targetInstance.getX() +
        (childLayout.horizontalLayout.anchorDelta || 0) +
        anchorTarget * targetInstanceWidth -
        anchorOrigin * renderedInstance.getDefaultWidth();
      childInstance.setCustomWidth(renderedInstance.getDefaultWidth());
    }

    if (childLayout.verticalLayout.anchorOrigin == null) {
      const childMinY =
        childLayout.verticalLayout.minSideAbsoluteMargin ||
        (childLayout.verticalLayout.minSideProportionalMargin || 0) * height;
      const childMaxY =
        height -
        (childLayout.verticalLayout.maxSideAbsoluteMargin ||
          (childLayout.verticalLayout.maxSideProportionalMargin || 0) * height);

      childInstance.y = childMinY;
      childInstance.setCustomHeight(childMaxY - childMinY);
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

      childInstance.y =
        targetInstance.getY() +
        (childLayout.verticalLayout.anchorDelta || 0) +
        anchorTarget * targetInstanceHeight -
        anchorOrigin * renderedInstance.getDefaultHeight();
      childInstance.setCustomHeight(renderedInstance.getDefaultHeight());
    }
    renderedInstance.update();

    if (childLayout.verticalLayout.anchorOrigin == null) {
      // This ensure objects are centered if their dimensions changed from the
      // custom ones (preferred ones).
      // For instance, text object dimensions change according to how the text is wrapped.
      childInstance.y = (height - renderedInstance._pixiObject.height) / 2;
      renderedInstance.update();
    }
  }
};
