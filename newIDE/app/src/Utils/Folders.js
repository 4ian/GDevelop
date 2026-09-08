// @flow

interface FolderOrItem {
  getOrCreateChildFolder(name: string): any;
}

export function getOrCreateChildFolder<T: FolderOrItem>(
  folder: T,
  pathElements: Array<string>
): T {
  let subFolder = folder;
  for (const pathElement of pathElements) {
    subFolder = folder.getOrCreateChildFolder(pathElement);
  }
  return subFolder;
}
