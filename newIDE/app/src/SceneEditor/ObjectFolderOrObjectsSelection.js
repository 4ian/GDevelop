// @flow
import { mapVector } from '../Utils/MapFor';
import { type ObjectFolderOrObjectWithContext } from '../ObjectsList/EnumerateObjectFolderOrObject';
const gd: libGDevelop = global.gd;

export const cleanNonExistingObjectFolderOrObjectWithContexts = (
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  objectFolderOrObjectWithContexts: Array<ObjectFolderOrObjectWithContext>
): Array<ObjectFolderOrObjectWithContext> => {
  const allObjectFolderOrObjectPtrs = new Set<number>();
  mapVector(
    objectsContainer.getAllObjectFolderOrObjects(),
    objectFolderOrObject => {
      allObjectFolderOrObjectPtrs.add(gd.getPointer(objectFolderOrObject));
    }
  );
  mapVector(
    globalObjectsContainer.getAllObjectFolderOrObjects(),
    objectFolderOrObject => {
      allObjectFolderOrObjectPtrs.add(gd.getPointer(objectFolderOrObject));
    }
  );

  return objectFolderOrObjectWithContexts.filter(
    objectFolderOrObjectWithContext =>
      allObjectFolderOrObjectPtrs.has(
        gd.getPointer(objectFolderOrObjectWithContext.objectFolderOrObject)
      )
  );
};
