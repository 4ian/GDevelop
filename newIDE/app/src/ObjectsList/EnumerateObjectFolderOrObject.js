// @flow

import { mapFor } from '../Utils/MapFor';

export type ObjectFolderOrObjectWithContext = {|
  objectFolderOrObject: gdObjectFolderOrObject,
  global: boolean,
|};

export const getObjectFolderOrObjectUnifiedName = (
  objectFolderOrObject: gdObjectFolderOrObject
) =>
  objectFolderOrObject.isFolder()
    ? objectFolderOrObject.getFolderName()
    : objectFolderOrObject.getObject().getName();

export const enumerateObjectFolderOrObjects = (
  project: gdObjectsContainer,
  objectsContainer: gdObjectsContainer
): {|
  containerObjectFolderOrObjectsList: ObjectFolderOrObjectWithContext[],
  projectObjectFolderOrObjectsList: ObjectFolderOrObjectWithContext[],
|} => {
  const projectRootFolder = project.getRootFolder();
  const containerRootFolder = objectsContainer.getRootFolder();
  const containerObjectFolderOrObjectsList: ObjectFolderOrObjectWithContext[] = mapFor(
    0,
    containerRootFolder.getChildrenCount(),
    i => {
      const objectFolderOrObject = containerRootFolder.getChildAt(i);
      return objectFolderOrObject;
    }
  ).map(
    (
      objectFolderOrObject: gdObjectFolderOrObject
    ): ObjectFolderOrObjectWithContext => {
      const item = {
        objectFolderOrObject,
        global: false,
      };
      return item;
    }
  );

  const projectObjectFolderOrObjectsList: ObjectFolderOrObjectWithContext[] = mapFor(
    0,
    projectRootFolder.getChildrenCount(),
    i => {
      const objectFolderOrObject = projectRootFolder.getChildAt(i);
      return objectFolderOrObject;
    }
  ).map(
    (
      objectFolderOrObject: gdObjectFolderOrObject
    ): ObjectFolderOrObjectWithContext => {
      const item = {
        objectFolderOrObject,
        global: true,
      };
      return item;
    }
  );

  return {
    containerObjectFolderOrObjectsList,
    projectObjectFolderOrObjectsList,
  };
};

const recursivelyEnumerateFoldersInFolder = (
  folder: gdObjectFolderOrObject,
  prefix: string,
  result: {| path: string, folder: gdObjectFolderOrObject |}[]
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

export const enumerateFoldersInFolder = (folder: gdObjectFolderOrObject) => {
  if (!folder.isFolder()) return [];
  const result = [];
  recursivelyEnumerateFoldersInFolder(folder, '', result);
  return result;
};

export const enumerateFoldersInContainer = (
  container: gdObjectsContainer
): {| path: string, folder: gdObjectFolderOrObject |}[] => {
  const rootFolder = container.getRootFolder();
  const result = [];
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
