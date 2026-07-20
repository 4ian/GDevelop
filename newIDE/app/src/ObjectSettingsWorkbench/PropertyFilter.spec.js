// @flow
import { type Schema } from '../PropertiesEditor/PropertiesEditorSchema';
import {
  createSourceFilterIndex,
  filterSourceFilterIndex,
  filterSourceSchema,
} from './PropertyFilter';

const makeStringField = ({
  name,
  label,
  visibility = 'basic',
}: {|
  name: string,
  label: string,
  visibility?: 'basic' | 'advanced',
|}) =>
  ({
    name,
    valueType: 'string',
    visibility,
    getLabel: () => label,
    getDescription: () => `${label} description`,
    getValue: () => '',
    setValue: () => {},
  }: any);

describe('Object Settings property filtering', () => {
  const instances = [{}];
  const schema: Schema = [
    {
      name: 'transform',
      type: 'column',
      title: 'Transform',
      children: [
        makeStringField({ name: 'x', label: 'X position' }),
        makeStringField({
          name: 'angle',
          label: 'Rotation angle',
          visibility: 'advanced',
        }),
      ],
    },
    makeStringField({ name: 'opacity', label: 'Opacity' }),
  ];

  it('preserves layout groups while returning a per-source count', () => {
    const result = filterSourceSchema({
      schema,
      instances,
      query: 'position',
      sourceSearchText: 'Object Sprite',
    });

    expect(result.matchCount).toBe(1);
    expect(result.filteredSchema).toHaveLength(1);
    expect(result.filteredSchema[0].children).toHaveLength(1);
  });

  it('reveals matching advanced fields and marks their labels', () => {
    const result = filterSourceSchema({
      schema,
      instances,
      query: 'rotation',
      sourceSearchText: 'Object Sprite',
    });
    const group: any = result.filteredSchema[0];
    const matchedField = group.children[0];

    expect(result.matchCount).toBe(1);
    expect(matchedField.visibility).toBe('basic');
    expect(matchedField.getLabel({})).not.toBe('Rotation angle');
  });

  it('lets a source-name match reveal the source schema', () => {
    const result = filterSourceSchema({
      schema,
      instances,
      query: 'sprite',
      sourceSearchText: 'Object Sprite',
    });

    expect(result.matchCount).toBe(3);
    expect(result.filteredSchema).toHaveLength(2);
  });

  it('reads descriptor metadata once when filtering repeatedly', () => {
    let labelReadCount = 0;
    const getLabel = () => {
      labelReadCount++;
      return 'Expensive descriptor label';
    };
    const indexedSchema: Schema = [
      ({
        ...makeStringField({ name: 'indexed', label: 'Indexed' }),
        getLabel,
      }: any),
    ];
    const index = createSourceFilterIndex({
      schema: indexedSchema,
      instances,
      sourceSearchText: 'Object Sprite',
    });

    filterSourceFilterIndex({ index, query: 'descriptor' });
    filterSourceFilterIndex({ index, query: 'label' });

    expect(labelReadCount).toBe(1);
  });
});
