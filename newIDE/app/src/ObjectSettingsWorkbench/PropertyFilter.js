// @flow
import * as React from 'react';

import {
  type Field,
  type Instances,
  type Schema,
} from '../PropertiesEditor/PropertiesEditorSchema';

export type SourceFilterResult = {|
  matchCount: number,
  filteredSchema: Schema,
|};

const normalize = (value: any): string =>
  value === null || value === undefined
    ? ''
    : String(value).toLocaleLowerCase();

const safelyRead = (reader: ?(any) => any, instance: any): string => {
  if (!reader) return '';
  try {
    return normalize(reader(instance));
  } catch (error) {
    return '';
  }
};

const getFieldSearchText = (field: Field, instances: Instances): string => {
  const instance = instances[0];
  const parts = [field.name || '', field.title || '', field.label || ''];

  if (field.getLabel) parts.push(safelyRead(field.getLabel, instance));
  if (field.getDescription)
    parts.push(safelyRead(field.getDescription, instance));
  if (field.getExtraDescription)
    parts.push(safelyRead(field.getExtraDescription, instance));
  if (field.getChoices) {
    try {
      field.getChoices().forEach(choice => {
        parts.push(choice.label, choice.value);
      });
    } catch (error) {
      // A dynamic choice provider can fail when an extension is being refreshed.
    }
  }

  return parts.map(normalize).join(' ');
};

const isValueProperty = (field: Field): boolean =>
  !!field.getValue && !!field.setValue;

export const countSchemaProperties = (
  schema: Schema,
  instances: Instances
): number => {
  let count = 0;
  schema.forEach(field => {
    if (field.children) {
      if (!field.isHidden || !field.isHidden(instances)) {
        count += countSchemaProperties(field.children, instances);
      }
    } else if (isValueProperty(field)) {
      count++;
    }
  });
  return count;
};

const renderHighlightedLabel = (
  label: string,
  query: string,
  isAdvanced: boolean
): React.Node => {
  const normalizedLabel = label.toLocaleLowerCase();
  const normalizedQuery = query.toLocaleLowerCase();
  const index = normalizedLabel.indexOf(normalizedQuery);
  const labelNode =
    index === -1 ? (
      label
    ) : (
      <React.Fragment>
        {label.slice(0, index)}
        <mark
          style={{
            color: 'inherit',
            backgroundColor: 'rgba(123, 97, 255, 0.28)',
            borderRadius: 3,
            padding: '1px 3px',
          }}
        >
          {label.slice(index, index + query.length)}
        </mark>
        {label.slice(index + query.length)}
      </React.Fragment>
    );

  return (
    <span>
      {labelNode}
      {isAdvanced && (
        <span
          style={{
            marginLeft: 6,
            padding: '1px 5px',
            borderRadius: 4,
            fontSize: 10,
            color: 'var(--theme-text-secondary-color)',
            backgroundColor: 'var(--theme-list-item-hover-background-color)',
          }}
        >
          Advanced
        </span>
      )}
    </span>
  );
};

const filterFields = ({
  schema,
  instances,
  query,
  ancestorMatches,
}: {|
  schema: Schema,
  instances: Instances,
  query: string,
  ancestorMatches: boolean,
|}): {| schema: Schema, count: number |} => {
  const filteredSchema: Schema = [];
  let count = 0;

  schema.forEach(field => {
    const ownText = getFieldSearchText(field, instances);
    const ownMatches = ownText.includes(query);

    if (field.children) {
      if (field.isHidden && field.isHidden(instances)) return;
      const childResult = filterFields({
        schema: field.children,
        instances,
        query,
        ancestorMatches: ancestorMatches || ownMatches,
      });
      if (childResult.schema.length) {
        filteredSchema.push({ ...field, children: childResult.schema });
        count += childResult.count;
      }
      return;
    }

    const matches = ancestorMatches || ownMatches;
    if (!matches) return;

    const isAdvanced = field.visibility === 'advanced';
    let nextField = field;
    if (isValueProperty(field)) {
      count++;
      const originalGetLabel = field.getLabel;
      // Filtered advanced fields are promoted so they are revealed immediately;
      // the label retains an explicit Advanced indicator.
      nextField = {
        ...field,
        visibility: isAdvanced ? 'basic' : field.visibility,
        isHighlighted: () => true,
        // $FlowFixMe[incompatible-call] Labels accept React nodes in the compact editor.
        getLabel: instance => {
          const label = originalGetLabel
            ? originalGetLabel(instance)
            : field.name;
          return renderHighlightedLabel(String(label || field.name), query, isAdvanced);
        },
      };
    }
    filteredSchema.push(nextField);
  });

  return { schema: filteredSchema, count };
};

export const filterSourceSchema = ({
  schema,
  instances,
  query,
  sourceSearchText,
}: {|
  schema: Schema,
  instances: Instances,
  query: string,
  sourceSearchText: string,
|}): SourceFilterResult => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) {
    return {
      matchCount: 0,
      filteredSchema: schema,
    };
  }

  const sourceMatches = normalize(sourceSearchText).includes(normalizedQuery);
  const result = filterFields({
    schema,
    instances,
    query: normalizedQuery,
    ancestorMatches: sourceMatches,
  });

  return {
    matchCount:
      result.count || (sourceMatches ? 1 : 0),
    filteredSchema: result.schema,
  };
};
