// @flow
import * as React from 'react';
import { type Schema, type ActionButton } from '../../CompactPropertiesEditor';
import ShareExternal from '../../UI/CustomSvgIcons/ShareExternal';

export const getSchemaWithOpenFullEditorButton = ({
  schema,
  fullEditorLabel,
  object,
  onEditObject,
}: {|
  schema: Schema,
  fullEditorLabel: ?string,
  object: gdObject,
  onEditObject: (object: gdObject) => void,
|}): Schema => {
  if (!fullEditorLabel) return schema;

  const actionButton: ActionButton = {
    label: fullEditorLabel,
    disabled: 'onValuesDifferent',
    nonFieldType: 'button',
    showRightIcon: true,
    getIcon: style => <ShareExternal style={style} />,
    getValue: ({ object }) => object.getName(),
    onClick: ({ object }) => onEditObject(object),
  };

  let added = false;
  schema.forEach(field => {
    if (field.children && field.name === '') {
      field.children.push(actionButton);
      added = true;
    }
  });

  if (!added) schema.push(actionButton);

  return schema;
};
