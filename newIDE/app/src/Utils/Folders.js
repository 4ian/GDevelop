// @flow

interface FolderOrItem {
  getChildrenCount(): number;
  getChildAt(index: number): any;
  isFolder(): boolean;
  removeFolderChild(childToRemove: any): void;
}
interface FolderOrItemForGetOrCreate {
  getOrCreateChildFolder(name: string): any;
}

export const getOrCreateChildFolder = <T: FolderOrItemForGetOrCreate>(
  folder: T,
  pathElements: Array<string>
): T => {
  let subFolder = folder;
  for (const pathElement of pathElements) {
    subFolder = subFolder.getOrCreateChildFolder(pathElement);
  }
  return subFolder;
};

export const removeSubFolders = (folder: FolderOrItem): void => {
  // Go backward to avoid the indexes to shift when a child is removed.
  for (let index = folder.getChildrenCount() - 1; index >= 0; index--) {
    const child = folder.getChildAt(index);
    if (child.isFolder()) {
      removeSubFolders(child);
      folder.removeFolderChild(child);
    }
  }
};
