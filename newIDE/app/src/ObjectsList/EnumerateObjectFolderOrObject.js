// @flow

import { mapFor } from '../Utils/MapFor';

type EnumearatedObjectFolderOrObject = {|
  path: string,
  folder: gdObjectFolderOrObject,
|};

export type ObjectFolderOrObjectWithContext = {|
  objectFolderOrObject: gdObjectFolderOrObject,
  global: boolean,
|};

export const getObjectFolderOrObjectUnifiedName = (
  objectFolderOrObject: gdObjectFolderOrObject
): string =>
  objectFolderOrObject.isFolder()
    ? objectFolderOrObject.getFolderName()
    : objectFolderOrObject.getObject().getName();

const recursivelyEnumerateFoldersInFolder = (
  folder: gdObjectFolderOrObject,
  prefix: string,
  result: Array<EnumearatedObjectFolderOrObject>
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

const recursivelyEnumerateObjectsInFolder = (
  folder: gdObjectFolderOrObject,
  result: gdObject[]
) => {
  mapFor(0, folder.getChildrenCount(), i => {
    const child = folder.getChildAt(i);
    if (!child.isFolder()) {
      result.push(child.getObject());
    } else {
      recursivelyEnumerateObjectsInFolder(child, result);
    }
  });
};

export const enumerateObjectsInFolder = (
  folder: gdObjectFolderOrObject
): Array<gdObject> => {
  if (!folder.isFolder()) return [];
  const result: Array<gdObject> = [];
  recursivelyEnumerateObjectsInFolder(folder, result);
  return result;
};

export const enumerateFoldersInFolder = (
  folder: gdObjectFolderOrObject
): Array<EnumearatedObjectFolderOrObject> => {
  if (!folder.isFolder()) return [];
  const result: Array<EnumearatedObjectFolderOrObject> = [];
  recursivelyEnumerateFoldersInFolder(folder, '', result);
  return result;
};

export const enumerateFoldersInContainer = (
  container: gdObjectsContainer
): Array<EnumearatedObjectFolderOrObject> => {
  const rootFolder = container.getRootFolder();
  const result: Array<EnumearatedObjectFolderOrObject> = [];
  recursivelyEnumerateFoldersInFolder(rootFolder, '', result);
  return result;
};

export const getObjectsInFolder = (
  objectFolderOrObject: gdObjectFolderOrObject
): gdObject[] => {
  if (!objectFolderOrObject.isFolder()) return [];
  return mapFor(0, objectFolderOrObject.getChildrenCount(), i => {
    const child = objectFolderOrObject.getChildAt(i);
    if (child.isFolder()) {
      return null;
    }
    return child.getObject();
  }).filter(Boolean);
};

export const getFoldersAscendanceWithoutRootFolder = (
  objectFolderOrObject: gdObjectFolderOrObject
): gdObjectFolderOrObject[] => {
  if (objectFolderOrObject.isRootFolder()) return [];
  const parent = objectFolderOrObject.getParent();
  if (parent.isRootFolder()) return [];
  return [parent, ...getFoldersAscendanceWithoutRootFolder(parent)];
};
