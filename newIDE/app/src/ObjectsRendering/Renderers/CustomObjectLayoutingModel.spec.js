// @flow
import {
  getLayoutedRenderedInstance,
  LayoutedInstance,
  LayoutedParent,
  ChildRenderedInstance,
} from './CustomObjectLayoutingModel';

const gd: libGDevelop = global.gd;

describe('getLayoutedRenderedInstance', () => {
  it('can fill the parent with a child (with custom size)', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layoutedRenderedInstance = getLayoutedRenderedInstanceFor({
      project,
      innerArea: {
        minX: 0,
        minY: 0,
        maxX: 100,
        maxY: 100,
      },
      parent: { width: 300, height: 200 },
      child: { defaultWidth: 64, defaultHeight: 64 },
      instance: { x: 0, y: 0, customSize: { width: 100, height: 100 } },
      anchor: {
        left: gd.CustomObjectConfiguration.MinEdge,
        top: gd.CustomObjectConfiguration.MinEdge,
        right: gd.CustomObjectConfiguration.MaxEdge,
        bottom: gd.CustomObjectConfiguration.MaxEdge,
      },
    });
    const instance = layoutedRenderedInstance._instance;
    expect(instance.getX()).toBe(0);
    expect(instance.getY()).toBe(0);
    expect(instance.hasCustomSize()).toBe(true);
    expect(instance.getCustomWidth()).toBe(300);
    expect(instance.getCustomHeight()).toBe(200);

    project.delete();
  });

  it('can fill the parent with a child (without custom size)', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layoutedRenderedInstance = getLayoutedRenderedInstanceFor({
      project,
      innerArea: {
        minX: 0,
        minY: 0,
        maxX: 100,
        maxY: 100,
      },
      parent: { width: 300, height: 200 },
      child: { defaultWidth: 100, defaultHeight: 100 },
      instance: { x: 0, y: 0, customSize: null },
      anchor: {
        left: gd.CustomObjectConfiguration.MinEdge,
        top: gd.CustomObjectConfiguration.MinEdge,
        right: gd.CustomObjectConfiguration.MaxEdge,
        bottom: gd.CustomObjectConfiguration.MaxEdge,
      },
    });
    const instance = layoutedRenderedInstance._instance;
    expect(instance.getX()).toBe(0);
    expect(instance.getY()).toBe(0);
    expect(instance.hasCustomSize()).toBe(true);
    expect(instance.getCustomWidth()).toBe(300);
    expect(instance.getCustomHeight()).toBe(200);

    project.delete();
  });

  it('can fill the parent with a child (with parent custom origin)', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layoutedRenderedInstance = getLayoutedRenderedInstanceFor({
      project,
      innerArea: {
        minX: -50,
        minY: -50,
        maxX: 50,
        maxY: 50,
      },
      parent: { width: 300, height: 200 },
      child: { defaultWidth: 64, defaultHeight: 64 },
      instance: { x: -50, y: -50, customSize: { width: 100, height: 100 } },
      anchor: {
        left: gd.CustomObjectConfiguration.MinEdge,
        top: gd.CustomObjectConfiguration.MinEdge,
        right: gd.CustomObjectConfiguration.MaxEdge,
        bottom: gd.CustomObjectConfiguration.MaxEdge,
      },
    });
    const instance = layoutedRenderedInstance._instance;
    expect(instance.getX()).toBe(-150);
    expect(instance.getY()).toBe(-100);
    expect(instance.hasCustomSize()).toBe(true);
    expect(instance.getCustomWidth()).toBe(300);
    expect(instance.getCustomHeight()).toBe(200);

    project.delete();
  });

  it('can fill the parent with a child (with child custom origin)', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layoutedRenderedInstance = getLayoutedRenderedInstanceFor({
      project,
      innerArea: {
        minX: 0,
        minY: 0,
        maxX: 100,
        maxY: 100,
      },
      parent: { width: 300, height: 200 },
      child: { defaultWidth: 64, defaultHeight: 64, originX: 32, originY: 32 },
      instance: { x: 50, y: 50, customSize: { width: 100, height: 100 } },
      anchor: {
        left: gd.CustomObjectConfiguration.MinEdge,
        top: gd.CustomObjectConfiguration.MinEdge,
        right: gd.CustomObjectConfiguration.MaxEdge,
        bottom: gd.CustomObjectConfiguration.MaxEdge,
      },
    });
    const instance = layoutedRenderedInstance._instance;
    expect(instance.getX()).toBe(150);
    expect(instance.getY()).toBe(100);
    expect(instance.hasCustomSize()).toBe(true);
    expect(instance.getCustomWidth()).toBe(300);
    expect(instance.getCustomHeight()).toBe(200);

    project.delete();
  });

  it('can fill the parent with a child (proportionally)', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layoutedRenderedInstance = getLayoutedRenderedInstanceFor({
      project,
      innerArea: {
        minX: 0,
        minY: 0,
        maxX: 100,
        maxY: 100,
      },
      parent: { width: 300, height: 200 },
      child: { defaultWidth: 64, defaultHeight: 64 },
      instance: { x: 0, y: 0, customSize: { width: 100, height: 100 } },
      anchor: {
        left: gd.CustomObjectConfiguration.Proportional,
        top: gd.CustomObjectConfiguration.Proportional,
        right: gd.CustomObjectConfiguration.Proportional,
        bottom: gd.CustomObjectConfiguration.Proportional,
      },
    });
    const instance = layoutedRenderedInstance._instance;
    expect(instance.getX()).toBe(0);
    expect(instance.getY()).toBe(0);
    expect(instance.hasCustomSize()).toBe(true);
    expect(instance.getCustomWidth()).toBe(300);
    expect(instance.getCustomHeight()).toBe(200);

    project.delete();
  });

  describe('(anchor horizontal edge)', () => {
    ['right', 'left'].forEach(objectEdge => {
      it(`anchors the ${objectEdge} edge of object to window left (fixed)`, () => {
        const project = gd.ProjectHelper.createNewGDJSProject();
        const layoutedRenderedInstance = getLayoutedRenderedInstanceFor({
          project,
          innerArea: {
            minX: 0,
            minY: 0,
            maxX: 1000,
            maxY: 1000,
          },
          parent: { width: 2000, height: 2000 },
          child: { defaultWidth: 10, defaultHeight: 10 },
          instance: { x: 500, y: 500, customSize: null },
          // $FlowIgnore
          anchor: { [objectEdge]: gd.CustomObjectConfiguration.MinEdge },
        });
        const instance = layoutedRenderedInstance._instance;
        expect(instance.getX()).toBe(500);
        expect(instance.getY()).toBe(500);
        expect(instance.hasCustomSize()).toBe(true);
        expect(instance.getCustomWidth()).toBe(10);
        expect(instance.getCustomHeight()).toBe(10);

        project.delete();
      });
    });
    ['right', 'left'].forEach(objectEdge => {
      it(`anchors the ${objectEdge} edge of object to window right (fixed)`, () => {
        const project = gd.ProjectHelper.createNewGDJSProject();
        const layoutedRenderedInstance = getLayoutedRenderedInstanceFor({
          project,
          innerArea: {
            minX: 0,
            minY: 0,
            maxX: 1000,
            maxY: 1000,
          },
          parent: { width: 2000, height: 2000 },
          child: { defaultWidth: 10, defaultHeight: 10 },
          instance: { x: 500, y: 500, customSize: null },
          // $FlowIgnore
          anchor: { [objectEdge]: gd.CustomObjectConfiguration.MaxEdge },
        });
        const instance = layoutedRenderedInstance._instance;
        expect(instance.getX()).toBe(1500);
        expect(instance.getY()).toBe(500);
        expect(instance.hasCustomSize()).toBe(true);
        expect(instance.getCustomWidth()).toBe(10);
        expect(instance.getCustomHeight()).toBe(10);

        project.delete();
      });
    });
    ['right', 'left'].forEach(objectEdge => {
      it(`anchors the ${objectEdge} edge of object to window center (fixed)`, () => {
        const project = gd.ProjectHelper.createNewGDJSProject();
        const layoutedRenderedInstance = getLayoutedRenderedInstanceFor({
          project,
          innerArea: {
            minX: 0,
            minY: 0,
            maxX: 1000,
            maxY: 1000,
          },
          parent: { width: 2000, height: 2000 },
          child: { defaultWidth: 10, defaultHeight: 10 },
          instance: { x: 500, y: 500, customSize: null },
          // $FlowIgnore
          anchor: { [objectEdge]: gd.CustomObjectConfiguration.Center },
        });
        const instance = layoutedRenderedInstance._instance;
        expect(instance.getX()).toBe(1000);
        expect(instance.getY()).toBe(500);
        expect(instance.hasCustomSize()).toBe(true);
        expect(instance.getCustomWidth()).toBe(10);
        expect(instance.getCustomHeight()).toBe(10);

        project.delete();
      });
    });

    it('anchors the right and left edge of object (fixed)', () => {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layoutedRenderedInstance = getLayoutedRenderedInstanceFor({
        project,
        innerArea: {
          minX: 0,
          minY: 0,
          maxX: 1000,
          maxY: 1000,
        },
        parent: { width: 2000, height: 2000 },
        child: { defaultWidth: 10, defaultHeight: 10 },
        instance: { x: 500, y: 500, customSize: null },
        anchor: {
          left: gd.CustomObjectConfiguration.MinEdge,
          right: gd.CustomObjectConfiguration.MaxEdge,
        },
      });
      const instance = layoutedRenderedInstance._instance;
      expect(instance.getX()).toBe(500);
      expect(instance.getY()).toBe(500);
      expect(instance.hasCustomSize()).toBe(true);
      expect(instance.getCustomWidth()).toBe(1010);
      expect(instance.getCustomHeight()).toBe(10);

      project.delete();
    });

    it('anchors the left edge of object (proportional)', () => {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layoutedRenderedInstance = getLayoutedRenderedInstanceFor({
        project,
        innerArea: {
          minX: 0,
          minY: 0,
          maxX: 1000,
          maxY: 1000,
        },
        parent: { width: 2000, height: 2000 },
        child: { defaultWidth: 10, defaultHeight: 10 },
        instance: { x: 500, y: 500, customSize: null },
        anchor: { left: gd.CustomObjectConfiguration.Proportional },
      });
      const instance = layoutedRenderedInstance._instance;
      expect(instance.getX()).toBe(1000);
      expect(instance.getY()).toBe(500);
      expect(instance.hasCustomSize()).toBe(true);
      expect(instance.getCustomWidth()).toBe(10);
      expect(instance.getCustomHeight()).toBe(10);

      project.delete();
    });
  });

  describe('(anchor vertical edge)', () => {
    ['top', 'bottom'].forEach(objectEdge => {
      it(`anchors the ${objectEdge} edge of object to window top (fixed)`, () => {
        const project = gd.ProjectHelper.createNewGDJSProject();
        const layoutedRenderedInstance = getLayoutedRenderedInstanceFor({
          project,
          innerArea: {
            minX: 0,
            minY: 0,
            maxX: 1000,
            maxY: 1000,
          },
          parent: { width: 2000, height: 2000 },
          child: { defaultWidth: 10, defaultHeight: 10 },
          instance: { x: 500, y: 500, customSize: null },
          // $FlowIgnore
          anchor: { [objectEdge]: gd.CustomObjectConfiguration.MinEdge },
        });
        const instance = layoutedRenderedInstance._instance;
        expect(instance.getX()).toBe(500);
        expect(instance.getY()).toBe(500);
        expect(instance.hasCustomSize()).toBe(true);
        expect(instance.getCustomWidth()).toBe(10);
        expect(instance.getCustomHeight()).toBe(10);

        project.delete();
      });
    });
    ['top', 'bottom'].forEach(objectEdge => {
      it(`anchors the ${objectEdge} edge of object to window bottom (fixed)`, () => {
        const project = gd.ProjectHelper.createNewGDJSProject();
        const layoutedRenderedInstance = getLayoutedRenderedInstanceFor({
          project,
          innerArea: {
            minX: 0,
            minY: 0,
            maxX: 1000,
            maxY: 1000,
          },
          parent: { width: 2000, height: 2000 },
          child: { defaultWidth: 10, defaultHeight: 10 },
          instance: { x: 500, y: 500, customSize: null },
          // $FlowIgnore
          anchor: { [objectEdge]: gd.CustomObjectConfiguration.MaxEdge },
        });
        const instance = layoutedRenderedInstance._instance;
        expect(instance.getX()).toBe(500);
        expect(instance.getY()).toBe(1500);
        expect(instance.hasCustomSize()).toBe(true);
        expect(instance.getCustomWidth()).toBe(10);
        expect(instance.getCustomHeight()).toBe(10);

        project.delete();
      });
    });
    ['top', 'bottom'].forEach(objectEdge => {
      it(`anchors the ${objectEdge} edge of object to window center (fixed)`, () => {
        const project = gd.ProjectHelper.createNewGDJSProject();
        const layoutedRenderedInstance = getLayoutedRenderedInstanceFor({
          project,
          innerArea: {
            minX: 0,
            minY: 0,
            maxX: 1000,
            maxY: 1000,
          },
          parent: { width: 2000, height: 2000 },
          child: { defaultWidth: 10, defaultHeight: 10 },
          instance: { x: 500, y: 500, customSize: null },
          // $FlowIgnore
          anchor: { [objectEdge]: gd.CustomObjectConfiguration.Center },
        });
        const instance = layoutedRenderedInstance._instance;
        expect(instance.getX()).toBe(500);
        expect(instance.getY()).toBe(1000);
        expect(instance.hasCustomSize()).toBe(true);
        expect(instance.getCustomWidth()).toBe(10);
        expect(instance.getCustomHeight()).toBe(10);

        project.delete();
      });
    });

    it('anchors the top and bottom edge of object (fixed)', () => {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layoutedRenderedInstance = getLayoutedRenderedInstanceFor({
        project,
        innerArea: {
          minX: 0,
          minY: 0,
          maxX: 1000,
          maxY: 1000,
        },
        parent: { width: 2000, height: 2000 },
        child: { defaultWidth: 10, defaultHeight: 10 },
        instance: { x: 500, y: 500, customSize: null },
        anchor: {
          top: gd.CustomObjectConfiguration.MinEdge,
          bottom: gd.CustomObjectConfiguration.MaxEdge,
        },
      });
      const instance = layoutedRenderedInstance._instance;
      expect(instance.getX()).toBe(500);
      expect(instance.getY()).toBe(500);
      expect(instance.hasCustomSize()).toBe(true);
      expect(instance.getCustomWidth()).toBe(10);
      expect(instance.getCustomHeight()).toBe(1010);

      project.delete();
    });

    it('anchors the top edge of object (proportional)', () => {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layoutedRenderedInstance = getLayoutedRenderedInstanceFor({
        project,
        innerArea: {
          minX: 0,
          minY: 0,
          maxX: 1000,
          maxY: 1000,
        },
        parent: { width: 2000, height: 2000 },
        child: { defaultWidth: 10, defaultHeight: 10 },
        instance: { x: 500, y: 500, customSize: null },
        anchor: {
          top: gd.CustomObjectConfiguration.Proportional,
        },
      });
      const instance = layoutedRenderedInstance._instance;
      expect(instance.getX()).toBe(500);
      expect(instance.getY()).toBe(1000);
      expect(instance.hasCustomSize()).toBe(true);
      expect(instance.getCustomWidth()).toBe(10);
      expect(instance.getCustomHeight()).toBe(10);

      project.delete();
    });
  });
});

const getLayoutedRenderedInstanceFor = (props: {
  project: gdProject,
  innerArea: {
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  },
  parent: { width: number, height: number },
  child: MockedRenderedInstanceConfiguration,
  instance: {
    x: number,
    y: number,
    customSize: { width: number, height: number } | null,
  },
  anchor: {
    left?: CustomObjectConfiguration_EdgeAnchor,
    top?: CustomObjectConfiguration_EdgeAnchor,
    right?: CustomObjectConfiguration_EdgeAnchor,
    bottom?: CustomObjectConfiguration_EdgeAnchor,
  } | null,
}) => {
  const project = props.project;
  const extension = project.insertNewEventsFunctionsExtension('MyExtension', 0);
  const eventBasedObject = extension
    .getEventsBasedObjects()
    .insertNew('MyCustomObject', 0);
  eventBasedObject.markAsInnerAreaFollowingParentSize(true);
  eventBasedObject.setAreaMinX(props.innerArea.minX);
  eventBasedObject.setAreaMinY(props.innerArea.minY);
  eventBasedObject.setAreaMaxX(props.innerArea.maxX);
  eventBasedObject.setAreaMaxY(props.innerArea.maxY);
  const childrenObjects = eventBasedObject.getObjects();
  const childObject = childrenObjects.insertNewObject(
    props.project,
    'Sprite',
    'Child',
    0
  );
  const anchorProps = props.anchor;
  if (anchorProps) {
    const anchor = childObject.addNewBehavior(
      project,
      'AnchorBehavior::AnchorBehavior',
      'Anchor'
    );
    anchor.updateProperty(
      'leftEdgeAnchor',
      getHorizontalAnchorFor(anchorProps.left)
    );
    anchor.updateProperty(
      'topEdgeAnchor',
      getVerticalAnchorFor(anchorProps.top)
    );
    anchor.updateProperty(
      'rightEdgeAnchor',
      getHorizontalAnchorFor(anchorProps.right)
    );
    anchor.updateProperty(
      'bottomEdgeAnchor',
      getVerticalAnchorFor(anchorProps.bottom)
    );
  }
  const initialInstances = eventBasedObject.getInitialInstances();
  const initialInstance = initialInstances.insertNewInitialInstance();
  initialInstance.setObjectName('Child');
  initialInstance.setX(props.instance.x);
  initialInstance.setY(props.instance.y);
  const customSize = props.instance.customSize;
  if (customSize) {
    initialInstance.setHasCustomSize(true);
    initialInstance.setCustomWidth(customSize.width);
    initialInstance.setCustomHeight(customSize.height);
  }
  const parent = new MockedParent(
    eventBasedObject,
    props.parent.width,
    props.parent.height
  );
  parent.registerChild('Child', props.child);

  const layoutedRenderedInstance = getLayoutedRenderedInstance(
    parent,
    initialInstance
  );
  if (!layoutedRenderedInstance) {
    throw new Error('No layouted instance returned');
  }
  return layoutedRenderedInstance;
};

const getHorizontalAnchorFor = (
  anchor: ?CustomObjectConfiguration_EdgeAnchor
) =>
  anchor === gd.CustomObjectConfiguration.MinEdge
    ? 'Window left'
    : anchor === gd.CustomObjectConfiguration.MaxEdge
    ? 'Window right'
    : anchor === gd.CustomObjectConfiguration.Center
    ? 'Window center'
    : anchor === gd.CustomObjectConfiguration.Proportional
    ? 'Proportional'
    : 'None';

const getVerticalAnchorFor = (anchor: ?CustomObjectConfiguration_EdgeAnchor) =>
  anchor === gd.CustomObjectConfiguration.MinEdge
    ? 'Window top'
    : anchor === gd.CustomObjectConfiguration.MaxEdge
    ? 'Window bottom'
    : anchor === gd.CustomObjectConfiguration.Center
    ? 'Window center'
    : anchor === gd.CustomObjectConfiguration.Proportional
    ? 'Proportional'
    : 'None';

class MockedChildRenderedInstance implements ChildRenderedInstance {
  _instance: gdInitialInstance;
  _pixiObject: { height: number };
  defaultWidth: number;
  defaultHeight: number;
  originX: number;
  originY: number;
  // TODO use this attribute to simulate TextObject children.
  heightAfterUpdate: ?number;

  constructor(
    childInstance: gdInitialInstance,
    {
      defaultWidth,
      defaultHeight,
      originX,
      originY,
    }: MockedRenderedInstanceConfiguration
  ) {
    this._instance = childInstance;
    this._pixiObject = { height: 0 };
    this.defaultWidth = defaultWidth;
    this.defaultHeight = defaultHeight;
    this.originX = originX || 0;
    this.originY = originY || 0;
    this.heightAfterUpdate = defaultHeight;
  }

  getWidth(): number {
    return this._instance.hasCustomSize()
      ? this._instance.getCustomWidth()
      : this.getDefaultWidth();
  }

  getHeight(): number {
    return this._instance.hasCustomSize()
      ? this._instance.getCustomHeight()
      : this.getDefaultHeight();
  }

  getDefaultWidth(): number {
    return this.defaultWidth;
  }

  getDefaultHeight(): number {
    return this.defaultHeight;
  }

  getOriginX(): number {
    return (this.originX * this.getWidth()) / this.getDefaultWidth();
  }

  getOriginY(): number {
    return (this.originY * this.getHeight()) / this.getDefaultHeight();
  }

  update(): void {
    this._pixiObject.height =
      this.heightAfterUpdate ||
      (this._instance.hasCustomSize()
        ? this._instance.getCustomHeight()
        : this.defaultHeight);
  }
}

type MockedRenderedInstanceConfiguration = {|
  defaultWidth: number,
  defaultHeight: number,
  originX?: number,
  originY?: number,
|};

class MockedParent implements LayoutedParent<MockedChildRenderedInstance> {
  eventBasedObject: gdEventsBasedObject | null;
  width: number;
  height: number;
  renderedInstances = new Map<number, MockedChildRenderedInstance>();
  layoutedInstances = new Map<number, LayoutedInstance>();
  mockedRenderedInstanceConfigurations = new Map<
    string,
    MockedRenderedInstanceConfiguration
  >();

  constructor(
    eventBasedObject: gdEventsBasedObject,
    width: number,
    height: number
  ) {
    this.eventBasedObject = eventBasedObject;
    this.width = width;
    this.height = height;
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

  getLayoutedInstance = (instance: gdInitialInstance): LayoutedInstance => {
    let layoutedInstance = this.layoutedInstances.get(instance.ptr);
    if (!layoutedInstance) {
      layoutedInstance = new LayoutedInstance(instance);
      this.layoutedInstances.set(instance.ptr, layoutedInstance);
    }
    return layoutedInstance;
  };

  getRendererOfInstance = (
    instance: gdInitialInstance
  ): MockedChildRenderedInstance => {
    let renderedInstance = this.renderedInstances.get(instance.ptr);
    if (!renderedInstance) {
      const configuration = this.mockedRenderedInstanceConfigurations.get(
        instance.getObjectName()
      );
      if (!configuration) {
        throw new Error('Unregisted child: ' + instance.getObjectName());
      }
      renderedInstance = new MockedChildRenderedInstance(
        instance,
        configuration
      );
      this.renderedInstances.set(instance.ptr, renderedInstance);
    }
    return renderedInstance;
  };

  registerChild(
    name: string,
    configuration: MockedRenderedInstanceConfiguration
  ) {
    this.mockedRenderedInstanceConfigurations.set(name, configuration);
  }
}
