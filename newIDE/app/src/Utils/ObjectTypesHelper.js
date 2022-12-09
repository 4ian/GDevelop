// @flow

// Helpers to manipulate objectTypes. See also EditObjectTypesDialog.js

export type ObjectTypes = Array<string>;
export type SelectedObjectTypes = ObjectTypes;

export const removeObjectType = (objectTypes: ObjectTypes, objectType: string): ObjectTypes => {
  return objectTypes.filter(selectedObjectType => selectedObjectType !== objectType);
};

export const addObjectTypes = (objectTypes: ObjectTypes, newObjectTypes: ObjectTypes): ObjectTypes => {
  return Array.from(new Set([...objectTypes, ...newObjectTypes]));
};

export type BuildObjectTypesMenuTemplateOptions = {|
  noObjectTypeLabel: string,
  getAllObjectTypes: () => Array<string>,
  selectedObjectTypes: SelectedObjectTypes,
  onChange: SelectedObjectTypes => void,
  onEditObjectTypes?: () => void,
  editObjectTypesLabel?: string,
|};

export const buildObjectTypesMenuTemplate = ({
  noObjectTypeLabel,
  getAllObjectTypes,
  selectedObjectTypes,
  onChange,
  onEditObjectTypes,
  editObjectTypesLabel,
}: BuildObjectTypesMenuTemplateOptions): Array<any> => {
  const allObjectTypes = getAllObjectTypes();
  const footerMenuItems =
    onEditObjectTypes && editObjectTypesLabel
      ? [
          {
            type: 'separator',
          },
          {
            label: editObjectTypesLabel,
            click: onEditObjectTypes,
          },
        ]
      : [];

  if (!allObjectTypes.length) {
    return [
      {
        label: noObjectTypeLabel,
        enabled: false,
      },
      ...footerMenuItems,
    ];
  }

  return allObjectTypes
    .map(objectType => ({
      type: 'checkbox',
      label: objectType,
      checked: selectedObjectTypes.includes(objectType),
      click: () => {
        if (selectedObjectTypes.includes(objectType)) {
          onChange(removeObjectType(selectedObjectTypes, objectType));
        } else {
          onChange(addObjectTypes(selectedObjectTypes, [objectType]));
        }
      },
    }))
    .concat(footerMenuItems);
};

export const getObjectTypesFromString = (objectTypesString: string): ObjectTypes => {
  if (objectTypesString.trim() === '') return [];

  return objectTypesString.split(',').map(objectType => objectType.trim());
};

export const getStringFromObjectTypes = (objectTypes: ObjectTypes): string => {
  return objectTypes.join(', ');
};

export const hasStringAllObjectTypes = (objectTypeStr: string, objectTypes: ObjectTypes) => {
  return objectTypes.includes(objectTypeStr);
};
