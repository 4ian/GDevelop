// @flow

import { mapFor } from '../Utils/MapFor';
import { exceptionallyGuardAgainstDeadObject } from '../Utils/IsNullPtr';

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

/**
 * Filter out items whose ancestor is also part of the given selection, so
 * that a bulk operation (copy, cut, delete, move) is not applied twice to
 * the same object or folder (once directly, once through its ancestor).
 */
export const getSelectionTopLevelNodes = (
  items: Array<ObjectFolderOrObjectWithContext>
): Array<ObjectFolderOrObjectWithContext> =>
  items.filter(
    item =>
      !items.some(
        otherItem =>
          otherItem !== item &&
          item.objectFolderOrObject.isADescendantOf(
            otherItem.objectFolderOrObject
          )
      )
  );

/**
 * Enumerate every direct and indirect child of the given folder (both objects
 * and sub-folders), in depth-first order. Used by "Select all" in a section.
 */
export const enumerateAllChildrenInFolder = (
  folder: gdObjectFolderOrObject
): Array<gdObjectFolderOrObject> => {
  const result = [];
  mapFor(0, folder.getChildrenCount(), i => {
    const child = folder.getChildAt(i);
    result.push(child);
    if (child.isFolder()) result.push(...enumerateAllChildrenInFolder(child));
  });
  return result;
};

/**
 * Same case-insensitive substring match as TreeView's search filter.
 * Ancestor folders shown only as context for a match are not included.
 * Matching folders that still contain a non-matching descendant are skipped
 * so bulk ops cannot act on hidden children.
 */
export const enumerateAllChildrenInFolderMatchingSearch = (
  folder: gdObjectFolderOrObject,
  searchText: string
): Array<gdObjectFolderOrObject> => {
  const children = enumerateAllChildrenInFolder(folder);
  if (!searchText) return children;
  const lowercaseSearchText = searchText.toLowerCase();
  const matchesSearch = (item: gdObjectFolderOrObject) =>
    getObjectFolderOrObjectUnifiedName(item)
      .toLowerCase()
      .includes(lowercaseSearchText);
  return children.filter(child => {
    if (!matchesSearch(child)) return false;
    if (!child.isFolder()) return true;
    return enumerateAllChildrenInFolder(child).every(matchesSearch);
  });
};

const collectObjectsToDelete = (
  objectFolderOrObject: gdObjectFolderOrObject
): Array<gdObject> => {
  if (!objectFolderOrObject.isFolder()) {
    return [objectFolderOrObject.getObject()];
  }
  const objects: Array<gdObject> = [];
  mapFor(0, objectFolderOrObject.getChildrenCount(), i => {
    objects.push(...collectObjectsToDelete(objectFolderOrObject.getChildAt(i)));
  });
  return objects;
};

const collectFoldersBottomUp = (
  objectFolderOrObject: gdObjectFolderOrObject,
  result: Array<gdObjectFolderOrObject>
) => {
  // Plain (non-folder) objects passed here have already been removed from
  // the container by the caller (see `removeEmptyFoldersFromSelection`), so
  // their wrapper is dead: guard against it instead of calling isFolder() on
  // a destroyed C++ object.
  const aliveNode = exceptionallyGuardAgainstDeadObject(objectFolderOrObject);
  if (!aliveNode || !aliveNode.isFolder()) return;
  mapFor(0, aliveNode.getChildrenCount(), i =>
    collectFoldersBottomUp(aliveNode.getChildAt(i), result)
  );
  result.push(aliveNode);
};

/**
 * List all the objects that would be deleted (recursively, for folders) if
 * the given top-level selection was removed, without any duplicate.
 * Call `getSelectionTopLevelNodes` first to ensure the input has no duplicates.
 */
export const getObjectsToDeleteFromSelection = (
  topLevelObjectFolderOrObjects: Array<gdObjectFolderOrObject>
): Array<gdObject> => {
  const objects: Array<gdObject> = [];
  topLevelObjectFolderOrObjects.forEach(objectFolderOrObject => {
    objects.push(...collectObjectsToDelete(objectFolderOrObject));
  });
  return objects;
};

/**
 * Remove the (now-empty, after their objects have been removed) folders of
 * the given top-level selection bottom-up, because a folder containing another
 * empty sub-folder can only be removed once the sub-folder is gone first.
 */
export const removeEmptyFoldersFromSelection = (
  topLevelObjectFolderOrObjects: Array<gdObjectFolderOrObject>
): void => {
  const foldersToRemove: Array<gdObjectFolderOrObject> = [];
  topLevelObjectFolderOrObjects.forEach(objectFolderOrObject =>
    collectFoldersBottomUp(objectFolderOrObject, foldersToRemove)
  );
  foldersToRemove.forEach(folder => {
    const parent = folder.getParent();
    parent.removeFolderChild(folder);
  });
};
