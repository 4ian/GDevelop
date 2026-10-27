// @flow
import { makeSchema } from './CompactInstancePropertiesSchema';
const gd: libGDevelop = global.gd;

// Avoid importing the whole properties panel (and its renderers).
jest.mock('./index', () => ({ styles: { icon: {} } }));

const fakeI18n: any = { _: () => '' };

const findField = (schema: any, name: string): any => {
  for (const field of schema) {
    if (!field) continue;
    if (field.name === name) return field;
    const children = field.children || (field.child ? [field.child] : null);
    if (children) {
      const found = findField(children, name);
      if (found) return found;
    }
  }
  return null;
};

const makeSizeFields = ({
  is3DInstance,
  defaultSize,
}: {|
  is3DInstance: boolean,
  defaultSize: [number, number, number],
|}) => {
  const layout = new gd.Layout();
  const schema = makeSchema({
    is3DInstance,
    hasOpacity: true,
    canBeFlippedXY: true,
    canBeFlippedZ: true,
    i18n: fakeI18n,
    forceUpdate: () => {},
    onEditObject: () => {},
    onGetInstanceSize: (instance: gdInitialInstance) => [
      instance.hasCustomSize() ? instance.getCustomWidth() : defaultSize[0],
      instance.hasCustomSize() ? instance.getCustomHeight() : defaultSize[1],
      instance.hasCustomDepth() ? instance.getCustomDepth() : defaultSize[2],
    ],
    layersContainer: layout.getLayers(),
  });
  return {
    widthField: findField(schema, 'Width'),
    heightField: findField(schema, 'Height'),
    depthField: findField(schema, 'Depth'),
    layout,
  };
};

const getSize = (instance: gdInitialInstance) => [
  instance.getCustomWidth(),
  instance.getCustomHeight(),
  instance.getCustomDepth(),
];

describe('CompactInstancePropertiesSchema size fields', () => {
  it('keeps the ratio when a 3D instance is resized to 0 and back', () => {
    const { widthField, layout } = makeSizeFields({
      is3DInstance: true,
      defaultSize: [40, 20, 10],
    });
    const instance = new gd.InitialInstance();
    instance.setShouldKeepRatio(true);

    widthField.setValue(instance, 80);
    expect(getSize(instance)).toEqual([80, 40, 20]);

    widthField.setValue(instance, 0);
    expect(getSize(instance)).toEqual([0, 0, 0]);

    widthField.setValue(instance, 8);
    expect(getSize(instance)).toEqual([8, 4, 2]);

    instance.delete();
    layout.delete();
  });

  it('keeps the ratio when a 2D instance is resized to 0 and back with another field', () => {
    const { widthField, heightField, layout } = makeSizeFields({
      is3DInstance: false,
      defaultSize: [40, 20, 0],
    });
    const instance = new gd.InitialInstance();
    instance.setShouldKeepRatio(true);

    heightField.setValue(instance, 0);
    expect(getSize(instance)).toEqual([0, 0, 0]);

    widthField.setValue(instance, 10);
    expect(getSize(instance)).toEqual([10, 5, 0]);

    instance.delete();
    layout.delete();
  });

  it('uses the object default size ratio when the collapsed size was not remembered', () => {
    const { depthField, layout } = makeSizeFields({
      is3DInstance: true,
      defaultSize: [40, 20, 10],
    });
    const instance = new gd.InitialInstance();
    instance.setShouldKeepRatio(true);
    // As if the project was saved with a size of 0.
    instance.setHasCustomSize(true);
    instance.setHasCustomDepth(true);
    instance.setCustomWidth(0);
    instance.setCustomHeight(0);
    instance.setCustomDepth(0);

    depthField.setValue(instance, 5);
    expect(getSize(instance)).toEqual([20, 10, 5]);

    instance.delete();
    layout.delete();
  });

  it('keeps integer sizes exact when scaling a square step by step', () => {
    const { widthField, layout } = makeSizeFields({
      is3DInstance: false,
      defaultSize: [64, 64, 0],
    });
    const instance = new gd.InitialInstance();
    instance.setShouldKeepRatio(true);

    for (let width = 65; width <= 200; width++) {
      widthField.setValue(instance, width);
      expect(getSize(instance)).toEqual([width, width, 0]);
    }

    instance.delete();
    layout.delete();
  });

  it('does not accumulate rounding errors when scaling a decimal cube step by step', () => {
    const { widthField, layout } = makeSizeFields({
      is3DInstance: true,
      defaultSize: [64.02, 64.02, 32.01],
    });
    const instance = new gd.InitialInstance();
    instance.setShouldKeepRatio(true);

    let width = 64.02;
    for (let i = 0; i < 200; i++) {
      width = Math.round((width + 1) * 100) / 100;
      widthField.setValue(instance, width);
      expect(getSize(instance)).toEqual([
        width,
        width,
        Math.round(width * 50) / 100,
      ]);
    }

    instance.delete();
    layout.delete();
  });

  it('only changes the edited dimension when the ratio is not kept', () => {
    const { widthField, heightField, layout } = makeSizeFields({
      is3DInstance: true,
      defaultSize: [40, 20, 10],
    });
    const instance = new gd.InitialInstance();
    instance.setShouldKeepRatio(false);

    widthField.setValue(instance, 0);
    expect(getSize(instance)).toEqual([0, 20, 10]);

    heightField.setValue(instance, 0);
    widthField.setValue(instance, 15);
    expect(getSize(instance)).toEqual([15, 0, 10]);

    instance.delete();
    layout.delete();
  });

  it('only changes the edited dimension when the others are not 0', () => {
    const { widthField, layout } = makeSizeFields({
      is3DInstance: true,
      defaultSize: [40, 20, 10],
    });
    const instance = new gd.InitialInstance();
    instance.setHasCustomSize(true);
    instance.setHasCustomDepth(true);
    instance.setCustomWidth(0);
    instance.setCustomHeight(30);
    instance.setCustomDepth(10);
    instance.setShouldKeepRatio(true);

    widthField.setValue(instance, 5);
    expect(getSize(instance)).toEqual([5, 30, 10]);

    instance.delete();
    layout.delete();
  });
});
