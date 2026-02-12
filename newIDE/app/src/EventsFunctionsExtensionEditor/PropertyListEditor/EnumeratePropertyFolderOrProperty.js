// @flow

import { mapFor } from '../../Utils/MapFor';

export const getPropertyFolderOrPropertyUnifiedName = (
  propertyFolderOrProperty: gdPropertyFolderOrProperty
) =>
  propertyFolderOrProperty.isFolder()
    ? propertyFolderOrProperty.getFolderName()
    : propertyFolderOrProperty.getProperty().getName();

const recursivelyEnumerateFoldersInFolder = (
  folder: gdPropertyFolderOrProperty,
  prefix: string,
  result: {| path: string, folder: gdPropertyFolderOrProperty |}[]
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
): gdNamedPropertyDescriptor[] => {
  if (!folder.isFolder()) return [];
  const result = [];
  recursivelyEnumeratePropertiesInFolder(folder, result);
  return result;
};

export const enumerateFoldersInFolder = (
  folder: gdPropertyFolderOrProperty
): {| path: string, folder: gdPropertyFolderOrProperty |}[] => {
  if (!folder.isFolder()) return [];
  const result = [];
  recursivelyEnumerateFoldersInFolder(folder, '', result);
  return result;
};

export const enumerateFoldersInContainer = (
  container: gdPropertiesContainer
): {| path: string, folder: gdPropertyFolderOrProperty |}[] => {
  const rootFolder = container.getRootFolder();
  const result = [];
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
