// @flow
import {
  getLayouts,
  applyChildLayouts,
  type ChildLayout,
  ChildInstance,
  LayoutedParent,
  ChildRenderedInstance,
  PropertiesContainer,
} from './CustomObjectLayoutingModel';
import { mapFor } from '../../Utils/MapFor';

const gd: libGDevelop = global.gd;

describe('getLayouts', () => {
  it('can fill the parent with a child', () => {
    const eventBasedObject = createEventBasedObject([]);
    const customObjectConfiguration = createCustomObjectConfiguration(
      eventBasedObject,
      []
    );
    const layouts = getLayouts(eventBasedObject, customObjectConfiguration);
    // A default layout will be set by RenderedCustomObjectInstance constructor
    // which is not covered by tests.
    expect(layouts.has('Background')).toBe(false);
  });

  it('can fill the parent with an hidden child', () => {
    const eventBasedObject = createEventBasedObject([
      { name: 'ShowBackground', extraInfos: ['Background'] },
    ]);
    const customObjectConfiguration = createCustomObjectConfiguration(
      eventBasedObject,
      [{ name: 'ShowBackground', value: 'false' }]
    );
    const layouts = getLayouts(eventBasedObject, customObjectConfiguration);

    expect(layouts.get('Background')).toStrictEqual({
      isShown: false,
      horizontalLayout: {},
      verticalLayout: {},
      depthLayout: {},
    });
  });

  it('can fill the parent with a child with margins', () => {
    const eventBasedObject = createEventBasedObject([
      { name: 'BarLeftPadding', extraInfos: ['PanelBar'] },
      { name: 'BarRightPadding', extraInfos: ['PanelBar'] },
      { name: 'BarTopPadding', extraInfos: ['PanelBar'] },
      { name: 'BarBottomPadding', extraInfos: ['PanelBar'] },
    ]);
    const customObjectConfiguration = createCustomObjectConfiguration(
      eventBasedObject,
      [
        { name: 'BarLeftPadding', value: '10' },
        { name: 'BarRightPadding', value: '20' },
        { name: 'BarTopPadding', value: '30' },
        { name: 'BarBottomPadding', value: '40' },
      ]
    );
    const layouts = getLayouts(eventBasedObject, customObjectConfiguration);

    expect(layouts.get('PanelBar')).toStrictEqual({
      isShown: true,
      horizontalLayout: {
        minSideAbsoluteMargin: 10,
        maxSideAbsoluteMargin: 20,
      },
      verticalLayout: { minSideAbsoluteMargin: 30, maxSideAbsoluteMargin: 40 },
      depthLayout: {},
    });
  });

  it('can fill the parent width with margins while keeping default height', () => {
    const eventBasedObject = createEventBasedObject([
      { name: 'BarLeftPadding', extraInfos: ['TiledBar'] },
      { name: 'BarRightPadding', extraInfos: ['TiledBar'] },
      // Private properties
      {
        name: 'BarVerticalAnchorOrigin',
        extraInfos: ['TiledBar'],
        value: 'Center',
      },
      {
        name: 'BarVerticalAnchorTarget',
        extraInfos: [],
        value: 'Center',
      },
    ]);
    const customObjectConfiguration = createCustomObjectConfiguration(
      eventBasedObject,
      [
        { name: 'BarLeftPadding', value: '10' },
        { name: 'BarRightPadding', value: '20' },
      ]
    );
    const layouts = getLayouts(eventBasedObject, customObjectConfiguration);

    expect(layouts.get('TiledBar')).toStrictEqual({
      isShown: true,
      horizontalLayout: {
        minSideAbsoluteMargin: 10,
        maxSideAbsoluteMargin: 20,
      },
      // The anchorTargetObject default on the object in the background.
      verticalLayout: {
        anchorOrigin: 0.5,
        anchorTarget: 0.5,
        anchorTargetObject: '',
      },
      depthLayout: {},
    });
  });

  it('can anchor a child to another child', () => {
    const eventBasedObject = createEventBasedObject([
      // Private properties
      {
        name: 'ThumbAnchorOrigin',
        extraInfos: ['Thumb'],
        value: 'Center-center',
      },
      {
        name: 'ThumbAnchorTarget',
        extraInfos: ['PanelBar'],
        value: 'Center-right',
      },
    ]);
    const customObjectConfiguration = createCustomObjectConfiguration(
      eventBasedObject,
      []
    );
    const layouts = getLayouts(eventBasedObject, customObjectConfiguration);

    expect(layouts.get('Thumb')).toStrictEqual({
      isShown: true,
      horizontalLayout: {
        anchorOrigin: 0.5,
        anchorTarget: 1,
        anchorTargetObject: 'PanelBar',
      },
      verticalLayout: {
        anchorOrigin: 0.5,
        anchorTarget: 0.5,
        anchorTargetObject: 'PanelBar',
      },
      depthLayout: {},
    });
  });

  it('can anchor a child to another child and be scaled proportionally', () => {
    const eventBasedObject = createEventBasedObject([
      // Private properties
      {
        name: 'ThumbAnchorOrigin',
        extraInfos: ['Thumb'],
        value: 'Center-center',
      },
      {
        name: 'ThumbAnchorTarget',
        extraInfos: ['Border'],
        value: 'Center-center',
      },
      {
        name: 'ThumbIsScaledProportionally',
        extraInfos: ['Thumb'],
        value: 'true',
      },
    ]);
    const customObjectConfiguration = createCustomObjectConfiguration(
      eventBasedObject,
      []
    );
    const layouts = getLayouts(eventBasedObject, customObjectConfiguration);

    expect(layouts.get('Thumb')).toStrictEqual({
      isShown: true,
      horizontalLayout: {
        anchorOrigin: 0.5,
        anchorTarget: 0.5,
        anchorTargetObject: 'Border',
        isScaledProportionally: true,
      },
      verticalLayout: {
        anchorOrigin: 0.5,
        anchorTarget: 0.5,
        anchorTargetObject: 'Border',
        isScaledProportionally: true,
      },
      depthLayout: {
        isScaledProportionally: true,
      },
    });
  });
});

describe('applyChildLayouts', () => {
  it('can fill the parent with a child', () => {
    const parent = new MockedParent(200, 100);
    // This is the default layout set by RenderedCustomObjectInstance constructor
    // which is not covered by tests.
    const background = parent.addChild('Background', {
      isShown: true,
      horizontalLayout: {},
      verticalLayout: {},
      depthLayout: {},
    });

    applyChildLayouts(parent);

    expect(background.getX()).toBe(0);
    expect(background.getY()).toBe(0);
    expect(background.hasCustomSize()).toBe(true);
    expect(background.getCustomWidth()).toBe(200);
    expect(background.getCustomHeight()).toBe(100);
  });

  it('can fill the parent with an hidden child', () => {
    const parent = new MockedParent(200, 100);
    // The child is hidden by RenderedCustomObjectInstance constructor
    // which is not covered by tests.
    // The constructor removes the child from its Pixi container.
    // This test actually doesn't cover more than the previous one.
    const background = parent.addChild('Background', {
      isShown: false,
      horizontalLayout: {},
      verticalLayout: {},
      depthLayout: {},
    });

    applyChildLayouts(parent);

    expect(background.getX()).toBe(0);
    expect(background.getY()).toBe(0);
    expect(background.hasCustomSize()).toBe(true);
    expect(background.getCustomWidth()).toBe(200);
    expect(background.getCustomHeight()).toBe(100);
  });

  it('can fill the parent with a child with margins', () => {
    const parent = new MockedParent(200, 100);
    const panelBar = parent.addChild('PanelBar', {
      isShown: true,
      horizontalLayout: {
        minSideAbsoluteMargin: 10,
        maxSideAbsoluteMargin: 20,
      },
      verticalLayout: { minSideAbsoluteMargin: 30, maxSideAbsoluteMargin: 40 },
      depthLayout: {},
    });

    applyChildLayouts(parent);

    expect(panelBar.getX()).toBe(10);
    expect(panelBar.getY()).toBe(30);
    expect(panelBar.hasCustomSize()).toBe(true);
    expect(panelBar.getCustomWidth()).toBe(200 - 10 - 20);
    expect(panelBar.getCustomHeight()).toBe(100 - 30 - 40);
  });

  it('can fill the parent with a text child with margins', () => {
    const parent = new MockedParent(200, 100);
    const label = parent.addChild(
      'Label',
      {
        isShown: true,
        horizontalLayout: {
          minSideAbsoluteMargin: 10,
          maxSideAbsoluteMargin: 20,
        },
        verticalLayout: {
          minSideAbsoluteMargin: 30,
          maxSideAbsoluteMargin: 40,
        },
        depthLayout: {},
      },
      { heightAfterUpdate: 20 }
    );

    applyChildLayouts(parent);

    expect(label.getX()).toBe(10);
    expect(label.getY()).toBe(30 + (100 - 30 - 40 - 20) / 2);
    expect(label.hasCustomSize()).toBe(true);
    expect(label.getCustomWidth()).toBe(200 - 10 - 20);
  });

  it('can fill the parent width with margins while keeping default height', () => {
    const parent = new MockedParent(200, 100);
    parent.addChild('Background', {
      isShown: true,
      horizontalLayout: {},
      verticalLayout: {},
      depthLayout: {},
    });
    const tiledBar = parent.addChild(
      'TiledBar',
      {
        isShown: true,
        horizontalLayout: {
          minSideAbsoluteMargin: 10,
          maxSideAbsoluteMargin: 20,
        },
        verticalLayout: { anchorOrigin: 0.5, anchorTarget: 0.5 },
        depthLayout: {},
      },
      { defaultWidth: 30, defaultHeight: 40 }
    );

    applyChildLayouts(parent);

    expect(tiledBar.getX()).toBe(10);
    expect(tiledBar.getY()).toBe((100 - 40) / 2);
    expect(tiledBar.hasCustomSize()).toBe(true);
    expect(tiledBar.getCustomWidth()).toBe(200 - 10 - 20);
    expect(tiledBar.getCustomHeight()).toBe(40);
  });

  it('can anchor a child to another child', () => {
    const parent = new MockedParent(200, 100);
    parent.addChild('Background', {
      isShown: true,
      horizontalLayout: {},
      verticalLayout: {},
      depthLayout: {},
    });
    parent.addChild('PanelBar', {
      isShown: true,
      horizontalLayout: {
        minSideAbsoluteMargin: 10,
        maxSideAbsoluteMargin: 20,
      },
      verticalLayout: { minSideAbsoluteMargin: 30, maxSideAbsoluteMargin: 40 },
      depthLayout: {},
    });
    const thumb = parent.addChild(
      'Thumb',
      {
        isShown: true,
        horizontalLayout: {
          anchorOrigin: 0.5,
          anchorTarget: 1,
          anchorTargetObject: 'PanelBar',
        },
        verticalLayout: {
          anchorOrigin: 0.5,
          anchorTarget: 0.5,
          anchorTargetObject: 'PanelBar',
        },
        depthLayout: {},
      },
      { defaultWidth: 50, defaultHeight: 60 }
    );

    applyChildLayouts(parent);

    expect(thumb.getX()).toBe(200 - 20 - 50 / 2);
    expect(thumb.getY()).toBe(30 + (100 - 30 - 40) / 2 - 60 / 2);
    expect(thumb.hasCustomSize()).toBe(true);
    expect(thumb.getCustomWidth()).toBe(50);
    expect(thumb.getCustomHeight()).toBe(60);
  });

  it('can anchor a child to another child and be scaled proportionally', () => {
    const parent = new MockedParent(200, 100);
    parent.addChild(
      'Border',
      {
        isShown: true,
        horizontalLayout: {},
        verticalLayout: {},
        depthLayout: {},
      },
      { defaultWidth: 25, defaultHeight: 50 }
    );
    const thumb = parent.addChild(
      'Thumb',
      {
        isShown: true,
        horizontalLayout: {
          anchorOrigin: 0.5,
          anchorTarget: 0.5,
          anchorTargetObject: 'Border',
          isScaledProportionally: true,
        },
        verticalLayout: {
          anchorOrigin: 0.5,
          anchorTarget: 0.5,
          anchorTargetObject: 'Border',
          isScaledProportionally: true,
        },
        depthLayout: {},
      },
      { defaultWidth: 10, defaultHeight: 15 }
    );

    applyChildLayouts(parent);

    expect(thumb.hasCustomSize()).toBe(true);
    expect(thumb.getCustomWidth()).toBe((200 / 25) * 10);
    expect(thumb.getCustomHeight()).toBe((100 / 50) * 15);
    expect(thumb.getX()).toBe(((200 / 25) * (25 - 10)) / 2);
    expect(thumb.getY()).toBe(((100 / 50) * (50 - 15)) / 2);
  });
});

type EventBasedObjectProperty = {
  name: string,
  value?: string,
  extraInfos: string[],
};

const createEventBasedObject = (
  propertiesData: EventBasedObjectProperty[]
): gdEventsBasedObject => {
  const eventBasedObject = new gd.EventsBasedObject();
  const properties = eventBasedObject.getPropertyDescriptors();
  propertiesData.forEach((propertyData, index) => {
    const property = properties.insertNew(propertyData.name, index);
    if (propertyData.value) {
      property.setValue(propertyData.value);
    }
    propertyData.extraInfos.forEach(extraInfo =>
      property.addExtraInfo(extraInfo)
    );
  });
  return eventBasedObject;
};

class MockedCustomObjectConfiguration implements PropertiesContainer {
  mapStringPropertyDescriptor: gdMapStringPropertyDescriptor;

  constructor() {
    this.mapStringPropertyDescriptor = new gd.MapStringPropertyDescriptor();
  }

  getProperties(): gdMapStringPropertyDescriptor {
    return this.mapStringPropertyDescriptor;
  }
}

type CustomObjectPropertyValue = {
  name: string,
  value: string,
};

const createCustomObjectConfiguration = (
  eventBasedObject: gdEventsBasedObject,
  propertiesData: CustomObjectPropertyValue[]
): MockedCustomObjectConfiguration => {
  const customObjectConfiguration = new MockedCustomObjectConfiguration();

  // Add default values from the event-based object.
  const instanceProperties = customObjectConfiguration.getProperties();
  const properties = eventBasedObject.getPropertyDescriptors();
  mapFor(0, properties.size(), index => {
    const property = properties.getAt(index);
    instanceProperties
      .getOrCreate(property.getName())
      .setValue(property.getValue());
  });

  // Add values set by extension users.
  propertiesData.forEach((propertyData, index) =>
    instanceProperties
      .getOrCreate(propertyData.name)
      .setValue(propertyData.value)
  );
  return customObjectConfiguration;
};

class MockedChildRenderedInstance implements ChildRenderedInstance {
  _instance: ChildInstance;
  _pixiObject: { height: number };
  defaultWidth: number;
  defaultHeight: number;
  heightAfterUpdate: ?number;

  constructor(
    childInstance: ChildInstance,
    defaultWidth: number,
    defaultHeight: number,
    heightAfterUpdate: ?number
  ) {
    this._instance = childInstance;
    this._pixiObject = { height: 0 };
    this.defaultWidth = defaultWidth;
    this.defaultHeight = defaultHeight;
    this.heightAfterUpdate = heightAfterUpdate;
  }

  getDefaultWidth(): number {
    return this.defaultWidth;
  }

  getDefaultHeight(): number {
    return this.defaultHeight;
  }

  update(): void {
    this._pixiObject.height =
      this.heightAfterUpdate ||
      (this._instance.hasCustomSize()
        ? this._instance.getCustomHeight()
        : this.defaultHeight);
  }
}

class MockedParent implements LayoutedParent<MockedChildRenderedInstance> {
  width: number;
  height: number;
  childrenInstances: ChildInstance[];
  childrenLayouts: ChildLayout[];
  childrenRenderedInstances: Array<MockedChildRenderedInstance>;
  childrenRenderedInstanceByNames: Map<string, MockedChildRenderedInstance>;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.childrenInstances = [];
    this.childrenLayouts = [];
    this.childrenRenderedInstances = [];
    this.childrenRenderedInstanceByNames = new Map<
      string,
      MockedChildRenderedInstance
    >();
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getDepth() {
    return 0;
  }

  addChild(
    name: string,
    layout: ChildLayout,
    size?: {|
      defaultWidth?: number,
      defaultHeight?: number,
      heightAfterUpdate?: number,
    |}
  ) {
    const childInstance = new ChildInstance();
    const childRenderedInstance = new MockedChildRenderedInstance(
      childInstance,
      size ? size.defaultWidth || 0 : 0,
      size ? size.defaultHeight || 0 : 0,
      size && size.heightAfterUpdate
    );

    this.childrenLayouts.push(layout);
    this.childrenInstances.push(childInstance);
    this.childrenRenderedInstances.push(childRenderedInstance);
    this.childrenRenderedInstanceByNames.set(name, childRenderedInstance);

    return childInstance;
  }
}
