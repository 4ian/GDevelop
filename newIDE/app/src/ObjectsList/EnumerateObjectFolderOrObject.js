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
 * Keep items whose ancestors are not also selected. A folder in the selection
 * already carries its content, so descendants must not be operated on twice.
 * Uses a Set of selected ptrs and one parent-chain walk per item (O(n · depth)).
 */
export const getSelectionTopLevelItems = <T>(
  items: $ReadOnlyArray<T>,
  getObjectFolderOrObject: (item: T) => gdObjectFolderOrObject | null
): Array<T> => {
  const selectedPtrs = new Set<number>();
  const resolved: Array<{|
    item: T,
    objectFolderOrObject: gdObjectFolderOrObject,
  |}> = [];
  items.forEach(item => {
    const objectFolderOrObject = getObjectFolderOrObject(item);
    if (!objectFolderOrObject) return;
    selectedPtrs.add(objectFolderOrObject.ptr);
    resolved.push({ item, objectFolderOrObject });
  });
  return resolved
    .filter(({ objectFolderOrObject }) => {
      let ancestor = objectFolderOrObject.getParent();
      while (!ancestor.isRootFolder()) {
        if (selectedPtrs.has(ancestor.ptr)) return false;
        ancestor = ancestor.getParent();
      }
      return true;
    })
    .map(({ item }) => item);
};

export const getSelectionTopLevelNodes = (
  items: Array<ObjectFolderOrObjectWithContext>
): Array<ObjectFolderOrObjectWithContext> =>
  getSelectionTopLevelItems(items, item => item.objectFolderOrObject);

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

const itemMatchesSearchText = (
  item: gdObjectFolderOrObject,
  lowercaseSearchText: string
): boolean =>
  getObjectFolderOrObjectUnifiedName(item)
    .toLowerCase()
    .includes(lowercaseSearchText);

/**
 * Same case-insensitive substring match as TreeView's search filter.
 * Used by "Select all" while searching: folders that only appear as ancestors
 * of a match, or that still contain a non-matching descendant, are skipped so
 * that this implicit selection cannot act on hidden children. Explicitly
 * clicked rows are never filtered: a visible row is always selectable.
 */
export const isSelectableWhileSearching = (
  objectFolderOrObject: gdObjectFolderOrObject,
  searchText: string
): boolean => {
  if (!searchText) return true;
  const lowercaseSearchText = searchText.toLowerCase();
  if (!itemMatchesSearchText(objectFolderOrObject, lowercaseSearchText)) {
    return false;
  }
  if (!objectFolderOrObject.isFolder()) return true;
  return enumerateAllChildrenInFolder(objectFolderOrObject).every(child =>
    itemMatchesSearchText(child, lowercaseSearchText)
  );
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
  return children.filter(child =>
    isSelectableWhileSearching(child, searchText)
  );
};

/**
 * After a Ctrl+click that explicitly deselects a folder, also drop its
 * descendants that Select All (or a previous range) had added. Otherwise
 * nested objects stay selected inside a collapsed folder.
 *
 * `removedObjectFolderOrObjects` must be the items explicitly toggled off by
 * the gesture (as reported by TreeView), NOT the difference between the
 * previous and next selections: a plain click on the child of a selected
 * folder also "removes" the folder from the selection, but the clicked child
 * must obviously stay selected.
 */
export const dropDescendantsOfRemovedFolders = (
  removedObjectFolderOrObjects: Array<gdObjectFolderOrObject>,
  next: Array<ObjectFolderOrObjectWithContext>
): Array<ObjectFolderOrObjectWithContext> => {
  const removedFolders = removedObjectFolderOrObjects.filter(
    objectFolderOrObject => objectFolderOrObject.isFolder()
  );
  if (removedFolders.length === 0) return next;
  return next.filter(
    item =>
      !removedFolders.some(folder =>
        item.objectFolderOrObject.isADescendantOf(folder)
      )
  );
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
