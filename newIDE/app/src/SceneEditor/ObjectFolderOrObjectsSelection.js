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
      objectsContainer.getAllObjectFolderOrObjects(),
      objectFolderOrObject => {
        // $FlowFixMe[incompatible-type]
        // $FlowFixMe[incompatible-exact]
        allObjectFolderOrObjectPtrs.add(gd.getPointer(objectFolderOrObject));
      }
    );
  if (globalObjectsContainer)
    mapVector(
      globalObjectsContainer.getAllObjectFolderOrObjects(),
      objectFolderOrObject => {
        // $FlowFixMe[incompatible-type]
        // $FlowFixMe[incompatible-exact]
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
  let foundObjectFolderObjectWithContext: ObjectFolderOrObjectWithContext | null = null;
  if (globalObjectsContainer)
    mapVector(
      globalObjectsContainer.getAllObjectFolderOrObjects(),
      objectFolderOrObject => {
        if (
          !objectFolderOrObject.isFolder() &&
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
      objectsContainer.getAllObjectFolderOrObjects(),
      objectFolderOrObject => {
        if (
          !objectFolderOrObject.isFolder() &&
          objectFolderOrObject.getObject().getName() === objectName
        ) {
          foundObjectFolderObjectWithContext = {
            objectFolderOrObject,
            global: false,
          };
        }
      }
    );

  return foundObjectFolderObjectWithContext;
};
