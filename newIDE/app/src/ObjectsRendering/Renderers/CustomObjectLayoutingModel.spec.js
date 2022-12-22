// @flow
import {
  applyChildLayouts,
  type ChildLayout,
  ChildInstance,
  LayoutedParent,
  ChildRenderedInstance,
} from './CustomObjectLayoutingModel';

describe('applyChildLayouts', () => {
  it('can fill the parent with a child', () => {
    const parent = new MockedParent(200, 100);
    const background = parent.addChid('Background', {
      isShown: true,
      horizontalLayout: {},
      verticalLayout: {},
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
    const background = parent.addChid('Background', {
      isShown: true,
      horizontalLayout: {
        minSideAbsoluteMargin: 10,
        maxSideAbsoluteMargin: 20,
      },
      verticalLayout: { minSideAbsoluteMargin: 30, maxSideAbsoluteMargin: 40 },
    });

    applyChildLayouts(parent);

    expect(background.getX()).toBe(10);
    expect(background.getY()).toBe(30);
    expect(background.hasCustomSize()).toBe(true);
    expect(background.getCustomWidth()).toBe(200 - 10 - 20);
    expect(background.getCustomHeight()).toBe(100 - 30 - 40);
  });

  it('can fill the parent with a text child with margins', () => {
    const parent = new MockedParent(200, 100);
    const background = parent.addChid(
      'Background',
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
      },
      { heightAfterUpdate: 20 }
    );

    applyChildLayouts(parent);

    expect(background.getX()).toBe(10);
    expect(background.getY()).toBe(30 + (100 - 30 - 40 - 20) / 2);
    expect(background.hasCustomSize()).toBe(true);
    expect(background.getCustomWidth()).toBe(200 - 10 - 20);
  });
});

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

  addChid(
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
