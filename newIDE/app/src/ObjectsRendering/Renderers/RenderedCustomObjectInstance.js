// @flow
import RenderedInstance from './RenderedInstance';
import PixiResourcesLoader from '../../ObjectsRendering/PixiResourcesLoader';
import ResourcesLoader from '../../ResourcesLoader';
import ObjectsRenderingService from '../ObjectsRenderingService';
import RenderedTextInstance from './RenderedTextInstance';
import { mapReverseFor } from '../../Utils/MapFor';
import * as PIXI from 'pixi.js-legacy';

const gd: libGDevelop = global.gd;

// TODO EBO Make an event-based object instance editor (like the one for the scene)
// and use real instances instead of this.
class ChildInstance {
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

type AxeLayout = {
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
type ChildLayout = {
  /**
   * Some child-object are optional or only displayed according to the parent state.
   * For example, for buttons there is a background for each state.
   */
  isShown: boolean,
  horizontalLayout: AxeLayout,
  verticalLayout: AxeLayout,
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
  properties: ?gdNamedPropertyDescriptorsList
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
  properties: ?gdNamedPropertyDescriptorsList
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
  properties: gdNamedPropertyDescriptorsList,
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
  properties: gdNamedPropertyDescriptorsList,
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
const getLayouts = (
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
            getHorizontalAnchorValue(anchorTargetStringValue, instanceProperties) ||
            anchorTargetValueNumber;
        }
        if (
          layoutField === 'VerticalAnchorOrigin' ||
          layoutField === 'AnchorOrigin'
        ) {
          verticalAnchorTarget =
            getVerticalAnchorValue(anchorTargetStringValue, instanceProperties) ||
            anchorTargetValueNumber;
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
              properties,
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
              properties,
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

/**
 * Renderer for gd.CustomObject (the class is not exposed to newIDE)
 */
export default class RenderedCustomObjectInstance extends RenderedInstance {
  childrenInstances: ChildInstance[];
  childrenLayouts: ChildLayout[];
  childrenRenderedInstances: RenderedInstance[];
  childrenRenderedInstanceByNames: Map<string, RenderedInstance>;

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
    this.childrenLayouts = [];
    this.childrenRenderedInstances = [];
    this.childrenRenderedInstanceByNames = new Map<string, RenderedInstance>();

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
      if (!childLayout.isShown) {
        return;
      }

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
        this._pixiObject
      );
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
        return ObjectsRenderingService.getThumbnail(
          project,
          childObjectConfiguration
        );
      }
    }
    return 'res/unknown32.png';
  }

  update() {
    const defaultWidth = this.getDefaultWidth();
    const defaultHeight = this.getDefaultHeight();
    const originX = 0;
    const originY = 0;
    const centerX = defaultWidth / 2;
    const centerY = defaultHeight / 2;

    const width = this._instance.hasCustomSize()
      ? this._instance.getCustomWidth()
      : this.getDefaultWidth();
    const height = this._instance.hasCustomSize()
      ? this._instance.getCustomHeight()
      : this.getDefaultHeight();

    for (
      let index = 0;
      index < this.childrenRenderedInstances.length;
      index++
    ) {
      const renderedInstance = this.childrenRenderedInstances[index];
      const childInstance = this.childrenInstances[index];
      const childLayout = this.childrenLayouts[index];

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
          this.childrenRenderedInstanceByNames.get(
            childLayout.horizontalLayout.anchorTargetObject || ''
          ) || this.childrenRenderedInstances[0];
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
            (childLayout.verticalLayout.maxSideProportionalMargin || 0) *
              height);

        childInstance.y = childMinY;
        childInstance.setCustomHeight(childMaxY - childMinY);
      } else {
        const anchorOrigin = childLayout.verticalLayout.anchorOrigin || 0;
        const anchorTarget = childLayout.verticalLayout.anchorTarget || 0;

        const targetRenderedInstance =
          this.childrenRenderedInstanceByNames.get(
            childLayout.horizontalLayout.anchorTargetObject || ''
          ) || this.childrenRenderedInstances[0];
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
    }

    this._pixiObject.pivot.x = centerX;
    this._pixiObject.pivot.y = centerY;
    this._pixiObject.rotation = RenderedInstance.toRad(
      this._instance.getAngle()
    );
    this._pixiObject.scale.x = 1;
    this._pixiObject.scale.y = 1;
    this._pixiObject.position.x =
      this._instance.getX() +
      (centerX - originX) * Math.abs(this._pixiObject.scale.x);
    this._pixiObject.position.y =
      this._instance.getY() +
      (centerY - originY) * Math.abs(this._pixiObject.scale.y);
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
}
