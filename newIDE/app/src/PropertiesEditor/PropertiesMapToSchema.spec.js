// @flow
import propertiesMapToSchema from './PropertiesMapToSchema';

const gd: libGDevelop = global.gd;

describe('propertiesMapToSchema (bitmask properties)', () => {
  const makeSchema = (
    setUpProperties: (properties: gdMapStringPropertyDescriptor) => void
  ) => {
    const properties = new gd.MapStringPropertyDescriptor();
    setUpProperties(properties);

    const values = new Map<string, string>();
    const schema = propertiesMapToSchema({
      properties,
      defaultValueProperties: properties,
      getPropertyValue: (instance, name) => values.get(name) || '0',
      onUpdateProperty: (instance, name, value) => {
        values.set(name, value);
      },
      object: null,
      layersContainer: null,
      shouldDisabledFieldsWithMixedValues: false,
    });
    properties.delete();
    return schema;
  };

  it('reads the edited bits from the extra information', () => {
    const schema = makeSchema(properties => {
      properties
        .getOrCreate('layers')
        .setValue('16')
        .setType('Bitmask')
        .addExtraInfo('bitCount=4')
        .addExtraInfo('firstBit=4')
        .setLabel('Layers');
    });

    expect(schema).toHaveLength(1);
    const field = schema[0];
    expect(field.valueType).toBe('bitmask');
    expect(field.firstBit).toBe(4);
    expect(field.bitCount).toBe(4);
  });

  it('falls back to the whole first byte without extra information', () => {
    const schema = makeSchema(properties => {
      properties
        .getOrCreate('masks')
        .setValue('255')
        .setType('Bitmask')
        .setLabel('Masks');
    });

    const field = schema[0];
    expect(field.firstBit).toBe(0);
    expect(field.bitCount).toBe(8);
  });

  it('leaves out a hidden bitmask, like any other hidden property', () => {
    const schema = makeSchema(properties => {
      properties
        .getOrCreate('masks')
        .setValue('255')
        .setType('Bitmask')
        .setLabel('Masks')
        .setHidden(true);
    });

    expect(schema).toHaveLength(0);
  });
});

describe('propertiesMapToSchema (rows)', () => {
  const makeSchema = (
    setUpProperties: (properties: gdMapStringPropertyDescriptor) => void
  ) => {
    const properties = new gd.MapStringPropertyDescriptor();
    setUpProperties(properties);

    const values = new Map<string, string>();
    const schema = propertiesMapToSchema({
      properties,
      defaultValueProperties: properties,
      getPropertyValue: (instance, name) => values.get(name) || '',
      onUpdateProperty: (instance, name, value) => {
        values.set(name, value);
      },
      object: null,
      layersContainer: null,
      shouldDisabledFieldsWithMixedValues: false,
    });
    properties.delete();
    return schema;
  };

  it('puts paired number properties in a row', () => {
    const schema = makeSchema(properties => {
      properties
        .getOrCreate('leftMargin')
        .setValue('0')
        .setType('number')
        .setLabel('Left margin');
      properties
        .getOrCreate('rightMargin')
        .setValue('0')
        .setType('number')
        .setLabel('Right margin');
    });

    expect(schema).toHaveLength(1);
    expect(schema[0].type).toBe('row');
    expect(schema[0].children).toHaveLength(2);
  });

  it('never puts resource properties in a row', () => {
    const schema = makeSchema(properties => {
      properties
        .getOrCreate('leftFaceResourceName')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel('Left face');
      properties
        .getOrCreate('rightFaceResourceName')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel('Right face');
    });

    expect(schema).toHaveLength(2);
    expect(schema[0].valueType).toBe('resource');
    expect(schema[1].valueType).toBe('resource');
  });
});
