// @flow
import propertiesMapToSchema from './PropertiesMapToSchema';
import { type Schema } from './PropertiesEditorSchema';

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

describe('propertiesMapToSchema (groups)', () => {
  const makeSchema = (
    setUpProperties: (properties: gdMapStringPropertyDescriptor) => void
  ) => {
    const properties = new gd.MapStringPropertyDescriptor();
    setUpProperties(properties);

    const schema = propertiesMapToSchema({
      properties,
      defaultValueProperties: properties,
      getPropertyValue: (instance, name) => '',
      onUpdateProperty: (instance, name, value) => {},
      object: null,
      layersContainer: null,
      shouldDisabledFieldsWithMixedValues: false,
    });
    properties.delete();
    return schema;
  };

  const getNamesAndTitles = (schema: Schema): Array<mixed> =>
    schema.map(field =>
      field.children
        ? {
            title: field.title,
            isSubgroup: !!field.isSubgroup,
            children: getNamesAndTitles(field.children),
          }
        : field.name
    );

  it('shows the sub-groups as sections of their group, in the order of their first property', () => {
    const schema = makeSchema(properties => {
      properties
        .getOrCreate('friction')
        .setValue('0')
        .setType('number')
        .setGroup('Movement');
      properties
        .getOrCreate('layers')
        .setValue('0')
        .setType('number')
        .setGroup('Collision filtering > If static');
      properties
        .getOrCreate('layersIfDynamicOrKinematic')
        .setValue('0')
        .setType('number')
        .setGroup('Collision filtering > If dynamic or kinematic');
      properties
        .getOrCreate('masks')
        .setValue('0')
        .setType('number')
        .setGroup('Collision filtering > If dynamic or kinematic');
    });

    expect(getNamesAndTitles(schema)).toEqual([
      {
        title: 'Collision filtering',
        isSubgroup: false,
        children: [
          {
            title: 'If static',
            isSubgroup: true,
            children: ['layers'],
          },
          {
            title: 'If dynamic or kinematic',
            isSubgroup: true,
            children: ['layersIfDynamicOrKinematic', 'masks'],
          },
        ],
      },
      {
        title: 'Movement',
        isSubgroup: false,
        children: ['friction'],
      },
    ]);
  });

  it('keeps the fields of a group next to its sub-groups', () => {
    const schema = makeSchema(properties => {
      properties
        .getOrCreate('a')
        .setValue('0')
        .setType('number')
        .setGroup('Group');
      properties
        .getOrCreate('b')
        .setValue('0')
        .setType('number')
        .setGroup('Group > Sub-group');
    });

    expect(getNamesAndTitles(schema)).toEqual([
      {
        title: 'Group',
        isSubgroup: false,
        children: [
          'a',
          { title: 'Sub-group', isSubgroup: true, children: ['b'] },
        ],
      },
    ]);
  });
});
