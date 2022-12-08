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
  anchorOrigin?: number,
  anchorTarget?: number,
  anchorTargetObject?: string,
  minSideAbsoluteMargin?: number,
  maxSideAbsoluteMargin?: number,
  minSideProportionalMargin?: number,
  maxSideProportionalMargin?: number,
};

type ChildLayout = {
  horizontalLayout: AxeLayout,
  verticalLayout: AxeLayout,
};

const layoutFields = [
  'LeftPadding',
  'TopPadding',
  'RightPadding',
  'BottomPadding',
  'HorizontalAnchorOrigin',
  'HorizontalAnchorTarget',
  'VerticalAnchorOrigin',
  'BarVerticalAnchorTarget',
];

const getHorizontalAnchorValue = (anchorName: string) => {
  return anchorName === 'Left'
    ? 0
    : anchorName === 'Right'
    ? 1
    : anchorName === 'Center'
    ? 0.5
    : null;
};
const getVerticalAnchorValue = (anchorName: string) => {
  return anchorName === 'Top'
    ? 0
    : anchorName === 'Bottom'
    ? 1
    : anchorName === 'Center'
    ? 0.5
    : null;
};

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

    const childNames = property.getExtraInfo();
    if (!childNames) {
      continue;
    }

    const name = property.getName();
    const isNumber = property.getType() === 'Number';
    const propertyValueString = instanceProperties.get(name).getValue();
    const propertyValueNumber = isNumber
      ? Number.parseFloat(propertyValueString) || 0
      : 0;
    const layoutField = layoutFields.find(field => name.includes(field));

    let targetObjectName = '';
    let anchorTarget: ?number = null;
    if (
      layoutField === 'HorizontalAnchorOrigin' ||
      layoutField === 'VerticalAnchorOrigin'
    ) {
      const targetPropertyName = name.replace('AnchorOrigin', 'AnchorTarget');
      const targetProperty = properties.get(targetPropertyName);
      targetObjectName =
        targetProperty.getExtraInfo().size() > 0
          ? targetProperty.getExtraInfo().at(0)
          : '';
      const anchorTargetStringValue = instanceProperties
        .get(targetPropertyName)
        .getValue();
      const targetIsNumber = targetProperty.getType() === 'Number';
      const anchorTargetValueNumber = isNumber
        ? Number.parseFloat(anchorTargetStringValue) || 0
        : 0;
      if (layoutField === 'HorizontalAnchorOrigin') {
        anchorTarget = targetIsNumber
          ? anchorTargetValueNumber
          : getHorizontalAnchorValue(anchorTargetStringValue);
      } else {
        anchorTarget = targetIsNumber
          ? anchorTargetValueNumber
          : getVerticalAnchorValue(anchorTargetStringValue);
      }
    }

    for (let childIndex = 0; childIndex < childNames.size(); childIndex++) {
      const childName = childNames.at(childIndex);
      let layout = layouts.get(childName);
      if (!layout) {
        layout = {
          horizontalLayout: {},
          verticalLayout: {},
        };
        layouts.set(childName, layout);
      }
      if (layoutField === 'LeftPadding') {
        layout.horizontalLayout.minSideAbsoluteMargin = propertyValueNumber;
      } else if (layoutField === 'RightPadding') {
        layout.horizontalLayout.maxSideAbsoluteMargin = propertyValueNumber;
      } else if (layoutField === 'TopPadding') {
        layout.verticalLayout.minSideAbsoluteMargin = propertyValueNumber;
      } else if (layoutField === 'BottomPadding') {
        layout.verticalLayout.maxSideAbsoluteMargin = propertyValueNumber;
      } else if (layoutField === 'HorizontalAnchorOrigin') {
        const anchorOrigin = isNumber
          ? propertyValueNumber
          : getHorizontalAnchorValue(propertyValueString);
        if (anchorOrigin !== null) {
          layout.horizontalLayout.anchorOrigin = anchorOrigin;
        }
        if (anchorTarget !== null) {
          layout.horizontalLayout.anchorTarget = anchorTarget;
        }
        layout.horizontalLayout.anchorTargetObject = targetObjectName;
      } else if (layoutField === 'VerticalAnchorOrigin') {
        const anchorOrigin = isNumber
          ? propertyValueNumber
          : getVerticalAnchorValue(propertyValueString);
        if (anchorOrigin !== null) {
          layout.verticalLayout.anchorOrigin = anchorOrigin;
        }
        if (anchorTarget !== null) {
          layout.verticalLayout.anchorTarget = anchorTarget;
        }
        layout.verticalLayout.anchorTargetObject = targetObjectName;
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
  childrenRenderedInstances: RenderedInstance[];
  childrenLayouts: ChildLayout[];

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

    if (!eventBasedObject) {
      return;
    }

    const layouts = getLayouts(eventBasedObject, customObjectConfiguration);

    this.childrenRenderedInstances = mapReverseFor(
      0,
      eventBasedObject.getObjectsCount(),
      i => {
        const childObject = eventBasedObject.getObjectAt(i);
        const childObjectConfiguration = customObjectConfiguration.getChildObjectConfiguration(
          childObject.getName()
        );
        const childInstance = new ChildInstance();
        this.childrenInstances.push(childInstance);
        this.childrenLayouts.push(
          layouts.get(childObject.getName()) || {
            horizontalLayout: {},
            verticalLayout: {},
          }
        );
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
        return renderer;
      }
    );
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

      childInstance.setCustomWidth(renderedInstance.getDefaultWidth());
      childInstance.setCustomHeight(renderedInstance.getDefaultHeight());

      const childMinX =
        childLayout.horizontalLayout.minSideAbsoluteMargin ||
        (childLayout.horizontalLayout.minSideProportionalMargin || 0) * width;
      const childMaxX =
        width -
        (childLayout.horizontalLayout.maxSideAbsoluteMargin ||
          (childLayout.horizontalLayout.maxSideProportionalMargin || 0) *
            width);
      const childMinY =
        childLayout.verticalLayout.minSideAbsoluteMargin ||
        (childLayout.verticalLayout.minSideProportionalMargin || 0) * height;
      const childMaxY =
        height -
        (childLayout.verticalLayout.maxSideAbsoluteMargin ||
          (childLayout.verticalLayout.maxSideProportionalMargin || 0) * height);
      if (childLayout.horizontalLayout.anchorOrigin == null) {
        childInstance.x = childMinX;
        childInstance.setCustomWidth(childMaxX - childMinX);
      } else {
        const anchorOrigin = childLayout.horizontalLayout.anchorOrigin || 0;
        const anchorTarget = childLayout.horizontalLayout.anchorTarget || 0;
        // TODO Use anchorTargetObject instead of defaulting on the background
        childInstance.x =
          anchorTarget * width -
          anchorOrigin * renderedInstance.getDefaultWidth();
      }
      if (childLayout.verticalLayout.anchorOrigin == null) {
        childInstance.y = childMinY;
        childInstance.setCustomHeight(childMaxY - childMinY);
      } else {
        const anchorOrigin = childLayout.verticalLayout.anchorOrigin || 0;
        const anchorTarget = childLayout.verticalLayout.anchorTarget || 0;
        // TODO Use anchorTargetObject instead of defaulting on the background
        childInstance.y =
          anchorTarget * height -
          anchorOrigin * renderedInstance.getDefaultHeight();
      }
      renderedInstance.update();

      if (renderedInstance instanceof RenderedTextInstance) {
        // TODO EBO Remove this line when an alignment property is added to the text object.
        renderedInstance._pixiObject.style.align = 'center';
      }
      // This ensure objects are centered if their dimensions changed from the
      // custom ones (preferred ones).
      // For instance, text object dimensions change according to how the text is wrapped.
      if (childLayout.horizontalLayout.anchorOrigin == null) {
        childInstance.x =
          (width - renderedInstance._pixiObject.width) / 2 +
          (childMinX + childMaxX - width) / 2;
      }
      if (childLayout.verticalLayout.anchorOrigin == null) {
        childInstance.y =
          (height - renderedInstance._pixiObject.height) / 2 +
          (childMinY + childMaxY - height) / 2;
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
    return this.childrenRenderedInstances[0].getDefaultWidth();
  }

  getDefaultHeight() {
    return this.childrenRenderedInstances[0].getDefaultHeight();
  }
}
