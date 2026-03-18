// @flow

import { mapFor } from '../../Utils/MapFor';

type EnumeratedPropertyFolderOrProperty = {|
  path: string,
  folder: gdPropertyFolderOrProperty,
|};

export const getPropertyFolderOrPropertyUnifiedName = (
  propertyFolderOrProperty: gdPropertyFolderOrProperty
): string =>
  propertyFolderOrProperty.isFolder()
    ? propertyFolderOrProperty.getFolderName()
    : propertyFolderOrProperty.getProperty().getName();

const recursivelyEnumerateFoldersInFolder = (
  folder: gdPropertyFolderOrProperty,
  prefix: string,
  result: Array<EnumeratedPropertyFolderOrProperty>
) => {
  mapFor(0, folder.getChildrenCount(), i => {
    const child = folder.getChildAt(i);
    if (child.isFolder()) {
      const newPrefix = prefix
        ? prefix + ' > ' + child.getFolderName()
        : child.getFolderName();
      result.push({
        path: newPrefix,
        folder: child,
      });
      recursivelyEnumerateFoldersInFolder(child, newPrefix, result);
    }
  });
};

const recursivelyEnumeratePropertiesInFolder = (
  folder: gdPropertyFolderOrProperty,
  result: gdNamedPropertyDescriptor[]
) => {
  mapFor(0, folder.getChildrenCount(), i => {
    const child = folder.getChildAt(i);
    if (!child.isFolder()) {
      result.push(child.getProperty());
    } else {
      recursivelyEnumeratePropertiesInFolder(child, result);
    }
  });
};

export const enumeratePropertiesInFolder = (
  folder: gdPropertyFolderOrProperty
): Array<gdNamedPropertyDescriptor> => {
  if (!folder.isFolder()) return [];
  const result: Array<gdNamedPropertyDescriptor> = [];
  recursivelyEnumeratePropertiesInFolder(folder, result);
  return result;
};

export const enumerateFoldersInFolder = (
  folder: gdPropertyFolderOrProperty
): Array<EnumeratedPropertyFolderOrProperty> => {
  if (!folder.isFolder()) return [];
  const result: Array<EnumeratedPropertyFolderOrProperty> = [];
  recursivelyEnumerateFoldersInFolder(folder, '', result);
  return result;
};

export const enumerateFoldersInContainer = (
  container: gdPropertiesContainer
): Array<EnumeratedPropertyFolderOrProperty> => {
  const rootFolder = container.getRootFolder();
  const result: Array<EnumeratedPropertyFolderOrProperty> = [];
  recursivelyEnumerateFoldersInFolder(rootFolder, '', result);
  return result;
};

export const getPropertiesInFolder = (
  propertyFolderOrProperty: gdPropertyFolderOrProperty
): gdNamedPropertyDescriptor[] => {
  if (!propertyFolderOrProperty.isFolder()) return [];
  return mapFor(0, propertyFolderOrProperty.getChildrenCount(), i => {
    const child = propertyFolderOrProperty.getChildAt(i);
    if (child.isFolder()) {
      return null;
    }
    return child.getProperty();
  }).filter(Boolean);
};

export const getFoldersAscendanceWithoutRootFolder = (
  propertyFolderOrProperty: gdPropertyFolderOrProperty
): gdPropertyFolderOrProperty[] => {
  if (propertyFolderOrProperty.isRootFolder()) return [];
  const parent = propertyFolderOrProperty.getParent();
  if (parent.isRootFolder()) return [];
  return [parent, ...getFoldersAscendanceWithoutRootFolder(parent)];
};
