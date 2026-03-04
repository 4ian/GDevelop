// @flow
import { mapVector } from '../Utils/MapFor';
import { type ObjectFolderOrObjectWithContext } from '../ObjectsList/EnumerateObjectFolderOrObject';
const gd: libGDevelop = global.gd;

export const cleanNonExistingObjectFolderOrObjectWithContexts = (
  globalObjectsContainer: ?gdObjectsContainer,
  objectsContainer: ?gdObjectsContainer,
  objectFolderOrObjectWithContexts: Array<ObjectFolderOrObjectWithContext>
): Array<ObjectFolderOrObjectWithContext> => {
  const allObjectFolderOrObjectPtrs = new Set<number>();
  if (objectsContainer)
    mapVector(
      // $FlowFixMe[incompatible-exact]
      objectsContainer.getAllObjectFolderOrObjects(),
      objectFolderOrObject => {
        // $FlowFixMe[incompatible-type]
        allObjectFolderOrObjectPtrs.add(gd.getPointer(objectFolderOrObject));
      }
    );
  if (globalObjectsContainer)
    mapVector(
      // $FlowFixMe[incompatible-exact]
      globalObjectsContainer.getAllObjectFolderOrObjects(),
      objectFolderOrObject => {
        // $FlowFixMe[incompatible-type]
        allObjectFolderOrObjectPtrs.add(gd.getPointer(objectFolderOrObject));
      }
    );

  return objectFolderOrObjectWithContexts.filter(
    objectFolderOrObjectWithContext =>
      allObjectFolderOrObjectPtrs.has(
        // $FlowFixMe[incompatible-exact]
        gd.getPointer(objectFolderOrObjectWithContext.objectFolderOrObject)
      )
  );
};

export const getObjectFolderOrObjectWithContextFromObjectName = (
  globalObjectsContainer: ?gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  objectName: string
): ObjectFolderOrObjectWithContext | null => {
  let foundObjectFolderObjectWithContext = null;
  if (globalObjectsContainer)
    mapVector(
      // $FlowFixMe[incompatible-exact]
      globalObjectsContainer.getAllObjectFolderOrObjects(),
      objectFolderOrObject => {
        if (
          // $FlowFixMe[incompatible-use]
          !objectFolderOrObject.isFolder() &&
          // $FlowFixMe[incompatible-use]
          objectFolderOrObject.getObject().getName() === objectName
        ) {
          foundObjectFolderObjectWithContext = {
            objectFolderOrObject,
            global: true,
          };
        }
      }
    );
  if (objectsContainer)
    mapVector(
      // $FlowFixMe[incompatible-exact]
      objectsContainer.getAllObjectFolderOrObjects(),
      objectFolderOrObject => {
        if (
          // $FlowFixMe[incompatible-use]
          !objectFolderOrObject.isFolder() &&
          // $FlowFixMe[incompatible-use]
          objectFolderOrObject.getObject().getName() === objectName
        ) {
          foundObjectFolderObjectWithContext = {
            objectFolderOrObject,
            global: false,
          };
        }
      }
    );

  // $FlowFixMe[incompatible-type]
  return foundObjectFolderObjectWithContext;
};
