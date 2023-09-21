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
  objectsContainer: gdObjectsContainer,
  options?: { selectByNames?: string[] }
): {|
  containerObjectFolderOrObjectsList: ObjectFolderOrObjectWithContext[],
  projectObjectFolderOrObjectsList: ObjectFolderOrObjectWithContext[],
  selectedByNamesObjectFolderOrObjectsList: ObjectFolderOrObjectWithContext[],
|} => {
  const projectRootFolder = project.getRootFolder();
  const containerRootFolder = objectsContainer.getRootFolder();
  const selectedByNamesObjectFolderOrObjectsList = [];
  const selectByNames = options ? options.selectByNames : undefined;
  const filterObjectFolderOrObjectByName = selectByNames
    ? (objectFolderOrObject: gdObjectFolderOrObject): boolean => {
        return selectByNames.includes(
          objectFolderOrObject.getObject().getName()
        );
      }
    : null;

  const containerObjectFolderOrObjectsList: ObjectFolderOrObjectWithContext[] = mapFor(
    0,
    containerRootFolder.getChildrenCount(),
    i => {
      const objectFolderOrObject = containerRootFolder.getChild(i);
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
      if (
        filterObjectFolderOrObjectByName &&
        filterObjectFolderOrObjectByName(objectFolderOrObject)
      ) {
        selectedByNamesObjectFolderOrObjectsList.push(item);
      }
      return item;
    }
  );

  const projectObjectFolderOrObjectsList: ObjectFolderOrObjectWithContext[] = mapFor(
    0,
    projectRootFolder.getChildrenCount(),
    i => {
      const objectFolderOrObject = projectRootFolder.getChild(i);
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
      if (
        filterObjectFolderOrObjectByName &&
        filterObjectFolderOrObjectByName(objectFolderOrObject)
      ) {
        selectedByNamesObjectFolderOrObjectsList.push(item);
      }
      return item;
    }
  );

  return {
    containerObjectFolderOrObjectsList,
    projectObjectFolderOrObjectsList,
    selectedByNamesObjectFolderOrObjectsList,
  };
};
