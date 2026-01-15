// @flow

/**
 * 
 * 
 * @template TFolderOrItem - Der C++ FolderOrItem Typ (z.B. gdObjectFolderOrObject)
 * @param selectedFolderOrItem - Das aktuell ausgewählte Folder oder Item
 * @returns {{ folder: TFolderOrItem, position: number }} - Parent und Position zum Einfügen
 * 
 * @example
 * // for objects:
 * const { folder, position } = getInsertionParentAndPosition(selectedObjectFolderOrObject);
 * const newObject = folder.insertObject(newName, position);
 * 
 * @example
 * // for scenes:
 * const { folder, position } = getInsertionParentAndPosition(selectedLayoutFolderOrLayout);
 * const newScene = folder.insertLayout(newScene, position);
 */
export function getInsertionParentAndPosition<TFolderOrItem>(
  selectedFolderOrItem: TFolderOrItem
): {| folder: TFolderOrItem, position: number |} {
  const isFolder = typeof selectedFolderOrItem.isFolder === 'function'
    ? selectedFolderOrItem.isFolder()
    : false;

  if (isFolder) {
    const parentFolder = selectedFolderOrItem;
    const childrenCount = typeof parentFolder.getChildrenCount === 'function'
      ? parentFolder.getChildrenCount()
      : 0;
    
    return {
      folder: parentFolder,
      position: childrenCount,
    };
  } else {
    const parentFolder = selectedFolderOrItem.getParent();
    const position = parentFolder.getChildPosition(selectedFolderOrItem) + 1;
    
    return {
      folder: parentFolder,
      position: position,
    };
  }
}

export function isFolder<TFolderOrItem>(
  folderOrItem: TFolderOrItem
): boolean {
  return typeof folderOrItem.isFolder === 'function'
    ? folderOrItem.isFolder()
    : false;
}

export function getItem<TFolderOrItem, TItem>(
  folderOrItem: TFolderOrItem
): TItem | null {
  if (isFolder(folderOrItem)) {
    return null;
  }
  
  return typeof folderOrItem.getItem === 'function'
    ? folderOrItem.getItem()
    : null;
}

export function getName<TFolderOrItem, TItem>(
  folderOrItem: TFolderOrItem,
  getItemName: (item: TItem) => string
): string {
  if (isFolder(folderOrItem)) {
    return typeof folderOrItem.getFolderName === 'function'
      ? folderOrItem.getFolderName()
      : '';
  }
  
  const item = getItem(folderOrItem);
  return item ? getItemName(item) : '';
}

export function isDescendantOf<TFolderOrItem>(
  folderOrItem: TFolderOrItem,
  potentialAncestor: TFolderOrItem
): boolean {
  return typeof folderOrItem.isADescendantOf === 'function'
    ? folderOrItem.isADescendantOf(potentialAncestor)
    : false;
}

export function getChildrenCount<TFolder>(folder: TFolder): number {
  return typeof folder.getChildrenCount === 'function'
    ? folder.getChildrenCount()
    : 0;
}

export function getChildAt<TFolder, TFolderOrItem>(
  folder: TFolder,
  index: number
): TFolderOrItem | null {
  return typeof folder.getChildAt === 'function'
    ? folder.getChildAt(index)
    : null;
}


export function getParent<TFolderOrItem>(
  folderOrItem: TFolderOrItem
): TFolderOrItem | null {
  return typeof folderOrItem.getParent === 'function'
    ? folderOrItem.getParent()
    : null;
}

export function moveFolderOrItem<TFolderOrItem>(
  sourceFolder: TFolderOrItem,
  folderOrItem: TFolderOrItem,
  targetFolder: TFolderOrItem,
  targetPosition: number
): void {
  if (typeof targetFolder.moveObjectFolderOrObjectToAnotherFolder === 'function') {
    targetFolder.moveObjectFolderOrObjectToAnotherFolder(
      folderOrItem,
      targetPosition
    );
  }
}

export function insertNewFolder<TFolder>(
  parentFolder: TFolder,
  folderName: string,
  position: number
): TFolder | null {
  return typeof parentFolder.insertNewFolder === 'function'
    ? parentFolder.insertNewFolder(folderName, position)
    : null;
}

export function hasFolderNamed<TFolder>(
  parentFolder: TFolder,
  folderName: string
): boolean {
  const childrenCount = getChildrenCount(parentFolder);
  
  for (let i = 0; i < childrenCount; i++) {
    const child = getChildAt(parentFolder, i);
    if (!child) continue;
    
    if (isFolder(child)) {
      const childName = typeof child.getFolderName === 'function'
        ? child.getFolderName()
        : '';
      
      if (childName === folderName) {
        return true;
      }
    }
  }
  
  return false;
}

export function forEachChild<TFolder, TFolderOrItem>(
  folder: TFolder,
  callback: (child: TFolderOrItem, index: number) => void
): void {
  const childrenCount = getChildrenCount(folder);
  
  for (let i = 0; i < childrenCount; i++) {
    const child = getChildAt(folder, i);
    if (child) {
      callback(child, i);
    }
  }
}


export function collectAllItems<TFolder, TFolderOrItem, TItem>(
  folder: TFolder
): Array<TItem> {
  const items: Array<TItem> = [];
  
  forEachChild(folder, (child) => {
    if (isFolder(child)) {
      items.push(...collectAllItems(child));
    } else {
      const item = getItem(child);
      if (item) {
        items.push(item);
      }
    }
  });
  
  return items;
}