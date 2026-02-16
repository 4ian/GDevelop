// @flow

export const getInsertionParentAndPositionFromSelection = (
  selectedObjectFolderOrObject: gdObjectFolderOrObject
): { folder: gdObjectFolderOrObject, position: number } => {
  const parentFolder = selectedObjectFolderOrObject.isFolder()
    ? selectedObjectFolderOrObject
    : selectedObjectFolderOrObject.getParent();
  const position = selectedObjectFolderOrObject.isFolder()
    ? parentFolder.getChildrenCount()
    : parentFolder.getChildPosition(selectedObjectFolderOrObject) + 1;
  return { folder: parentFolder, position };
};
