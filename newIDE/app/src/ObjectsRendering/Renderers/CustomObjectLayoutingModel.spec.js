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

    expect(background.hasCustomSize()).toBe(true);
    expect(background.getCustomWidth()).toBe(200);
    expect(background.getCustomHeight()).toBe(100);
  });
});

class MockedChildRenderedInstance implements ChildRenderedInstance {
  _instance: ChildInstance;
  _pixiObject: { height: number };
  defaultWidth: number;
  defaultHeight: number;

  constructor(
    childInstance: ChildInstance,
    defaultWidth: number,
    defaultHeight: number
  ) {
    this._instance = childInstance;
    this._pixiObject = { height: 0 };
    this.defaultWidth = defaultWidth;
    this.defaultHeight = defaultHeight;
  }

  getDefaultWidth(): number {
    return this.defaultWidth;
  }

  getDefaultHeight(): number {
    return this.defaultHeight;
  }

  update(): void {}
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
    defaultWidth: number = 0,
    defaultHeight: number = 0
  ) {
    const childInstance = new ChildInstance();
    const childRenderedInstance = new MockedChildRenderedInstance(
      childInstance,
      defaultWidth,
      defaultHeight
    );

    this.childrenLayouts.push(layout);
    this.childrenInstances.push(childInstance);
    this.childrenRenderedInstances.push(childRenderedInstance);
    this.childrenRenderedInstanceByNames.set(name, childRenderedInstance);

    return childInstance;
  }
}
