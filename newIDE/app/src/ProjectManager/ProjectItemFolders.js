// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import { type TreeViewItemContent } from '.';
import { mapFor } from '../Utils/MapFor';
import { removeSubFolders } from '../Utils/Folders';

/**
 * A node of the folder structure of a list of project items: the API shared
 * by gdLayoutFolderOrLayout, gdExternalLayoutFolderOrExternalLayout,
 * gdExternalEventsFolderOrExternalEvents and gdTestFolderOrTest (instances of
 * the same C++ template).
 *
 * A node is only ever given nodes of its own folder structure: the nodes taken
 * as parameters are typed `any`, as each class only accepts its own.
 */
export interface ProjectItemFolderOrItem {
  +ptr: number;
  isFolder(): boolean;
  isRootFolder(): boolean;
  getItem(): any;
  getFolderName(): string;
  setFolderName(name: string): void;
  hasItemNamed(name: string): boolean;
  getItemChild(name: string): ProjectItemFolderOrItem;
  getChildrenCount(): number;
  getChildAt(position: number): ProjectItemFolderOrItem;
  getChildPosition(child: any): number;
  getParent(): ProjectItemFolderOrItem;
  insertNewFolder(name: string, newPosition: number): ProjectItemFolderOrItem;
  moveFolderOrItemToAnotherFolder(
    folderOrItem: any,
    newParentFolder: any,
    newPosition: number
  ): void;
  moveChild(oldIndex: number, newIndex: number): void;
  removeFolderChild(childToRemove: any): void;
  isADescendantOf(otherFolderOrItem: any): boolean;
}

/**
 * Describe a kind of project items organized in folders, so that folders,
 * "Move to folder" menus and the clipboard work the same way for all of them.
 */
export type ProjectItemFoldersKind = {|
  // Used to build the ids of the folders and the clipboard kind.
  name: string,
  getRootId: () => string,
  getRootFolder: (project: gdProject) => ProjectItemFolderOrItem,
  hasItemNamed: (project: gdProject, name: string) => boolean,
  getItemTreeViewItemId: (item: any) => string,
  /**
   * Insert a new item, at the end of the root folder, from its serialized
   * content (copied in the clipboard).
   */
  insertItemFromSerializedContent: (
    project: gdProject,
    name: string,
    serializedItem: Object
  ) => any,
  // The clipboard used before folders existed, only read for compatibility.
  legacyClipboard: {| kind: string, itemProperty: string |},
  addItemLabel: MessageDescriptor,
|};

export const getFolderTreeViewItemId = (
  kind: ProjectItemFoldersKind,
  folder: ProjectItemFolderOrItem
): string => {
  return `${kind.name}-folder-${folder.ptr}`;
};

/**
 * Return the id of the tree view item of a node, which is a folder or an item.
 */
export const getFolderOrItemTreeViewItemId = (
  kind: ProjectItemFoldersKind,
  folderOrItem: ProjectItemFolderOrItem
): string =>
  folderOrItem.isFolder()
    ? getFolderTreeViewItemId(kind, folderOrItem)
    : kind.getItemTreeViewItemId(folderOrItem.getItem());

/**
 * Return the id of the tree view item of a folder, the root folder being shown
 * by the root item of the kind.
 */
export const getParentFolderTreeViewItemId = (
  kind: ProjectItemFoldersKind,
  folder: ProjectItemFolderOrItem
): string =>
  folder.isRootFolder()
    ? kind.getRootId()
    : getFolderTreeViewItemId(kind, folder);

/**
 * Whether a node is inside the node shown by a tree view item, the root folder
 * being shown by the root item of the kind.
 */
export const isFolderOrItemDescendantOf = (
  kind: ProjectItemFoldersKind,
  folderOrItem: ProjectItemFolderOrItem,
  itemContent: TreeViewItemContent
): boolean => {
  // The nodes of another kind are in another folder structure.
  if (itemContent.getRootId() !== kind.getRootId()) return false;
  if (itemContent.getId() === kind.getRootId()) return true;
  const otherFolderOrItem = itemContent.getFolderOrItem();
  return !!otherFolderOrItem && folderOrItem.isADescendantOf(otherFolderOrItem);
};

const recursivelyEnumerateItemsInFolder = (
  folder: ProjectItemFolderOrItem,
  result: Array<any>
) => {
  mapFor(0, folder.getChildrenCount(), i => {
    const child = folder.getChildAt(i);
    if (!child.isFolder()) {
      result.push(child.getItem());
    } else {
      recursivelyEnumerateItemsInFolder(child, result);
    }
  });
};

/** The items of a folder and of its folders, in the order they are shown. */
export const enumerateItemsInFolder = (
  folder: ProjectItemFolderOrItem
): Array<any> => {
  if (!folder.isFolder()) return [];
  const result: Array<any> = [];
  recursivelyEnumerateItemsInFolder(folder, result);
  return result;
};

/**
 * Remove a folder holding no item: its empty folders first, as a folder can
 * only be removed once empty.
 */
export const removeFolderWithoutItems = (
  folder: ProjectItemFolderOrItem
): void => {
  if (enumerateItemsInFolder(folder).length > 0) return;
  removeSubFolders(folder);
  folder.getParent().removeFolderChild(folder);
};

export const getFoldersAscendanceWithoutRootFolder = (
  folderOrItem: ProjectItemFolderOrItem
): Array<ProjectItemFolderOrItem> => {
  if (folderOrItem.isRootFolder()) return [];
  const parent = folderOrItem.getParent();
  if (parent.isRootFolder()) return [];
  return [parent, ...getFoldersAscendanceWithoutRootFolder(parent)];
};

/**
 * Return the id of the tree view item showing a node, or of its first
 * collapsed parent when it's hidden, like the other trees do to animate a
 * moved item.
 */
export const getClosestVisibleParentId = (
  kind: ProjectItemFoldersKind,
  areItemsOpenFromId: (itemIds: Array<string>) => Array<boolean>,
  folderOrItem: ProjectItemFolderOrItem
): string => {
  const topToBottomAscendanceId = [
    kind.getRootId(),
    ...getFoldersAscendanceWithoutRootFolder(folderOrItem)
      .reverse()
      .map(parent => getFolderTreeViewItemId(kind, parent)),
  ];
  const topToBottomAscendanceOpenness = areItemsOpenFromId(
    topToBottomAscendanceId
  );
  const firstClosedFolderIndex = topToBottomAscendanceOpenness.indexOf(false);
  if (firstClosedFolderIndex === -1) {
    // If all parents are open, return the node given as input.
    return getFolderOrItemTreeViewItemId(kind, folderOrItem);
  }
  return topToBottomAscendanceId[firstClosedFolderIndex];
};

export const getFolderOrItemIndex = (
  folderOrItem: ProjectItemFolderOrItem
): number => folderOrItem.getParent().getChildPosition(folderOrItem);

/**
 * Move a node at the given position of its folder, or of `targetFolder`.
 */
export const moveFolderOrItemAt = (
  folderOrItem: ProjectItemFolderOrItem,
  destinationIndex: number,
  targetFolder?: ProjectItemFolderOrItem
): void => {
  const currentParentFolder = folderOrItem.getParent();
  const destinationFolder = targetFolder || currentParentFolder;

  if (destinationFolder === currentParentFolder) {
    const originIndex = getFolderOrItemIndex(folderOrItem);
    if (destinationIndex === originIndex) return;
    currentParentFolder.moveChild(
      originIndex,
      // When moving the item down, it must not be counted.
      destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
    );
  } else {
    currentParentFolder.moveFolderOrItemToAnotherFolder(
      folderOrItem,
      destinationFolder,
      destinationIndex
    );
  }
};

/**
 * Keep items whose ancestors are not also selected. A folder in the selection
 * already carries its content, so descendants must not be operated on twice.
 * Uses a Set of selected ptrs and one parent-chain walk per item (O(n · depth)).
 */
export const getSelectionTopLevelItems = <T>(
  items: $ReadOnlyArray<T>,
  getFolderOrItem: (item: T) => ?ProjectItemFolderOrItem
): Array<T> => {
  const selectedPtrs = new Set<number>();
  const resolved: Array<{|
    item: T,
    folderOrItem: ProjectItemFolderOrItem,
  |}> = [];
  items.forEach(item => {
    const folderOrItem = getFolderOrItem(item);
    if (!folderOrItem) return;
    selectedPtrs.add(folderOrItem.ptr);
    resolved.push({ item, folderOrItem });
  });
  return resolved
    .filter(({ folderOrItem }) => {
      let ancestor = folderOrItem.getParent();
      while (!ancestor.isRootFolder()) {
        if (selectedPtrs.has(ancestor.ptr)) return false;
        ancestor = ancestor.getParent();
      }
      return true;
    })
    .map(({ item }) => item);
};

export const getTopLevelFolderOrItems = (
  folderOrItems: Array<ProjectItemFolderOrItem>
): Array<ProjectItemFolderOrItem> =>
  getSelectionTopLevelItems(folderOrItems, folderOrItem => folderOrItem);

/**
 * Move a newly inserted item (that is at the root of the folder structure)
 * into the given folder, and return its node.
 */
export const moveNewItemToFolder = (
  kind: ProjectItemFoldersKind,
  project: gdProject,
  itemName: string,
  folder: ProjectItemFolderOrItem,
  position: number
): ProjectItemFolderOrItem => {
  const rootFolder = kind.getRootFolder(project);
  const itemNode = rootFolder.getItemChild(itemName);
  if (folder !== rootFolder || position !== getFolderOrItemIndex(itemNode)) {
    rootFolder.moveFolderOrItemToAnotherFolder(itemNode, folder, position);
  }
  return itemNode;
};

type EnumeratedFolder = {|
  path: string,
  folder: ProjectItemFolderOrItem,
|};

const recursivelyEnumerateFoldersInFolder = (
  folder: ProjectItemFolderOrItem,
  prefix: string,
  result: Array<EnumeratedFolder>
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

export const enumerateFoldersInFolder = (
  folder: ProjectItemFolderOrItem
): Array<EnumeratedFolder> => {
  if (!folder.isFolder()) return [];
  const result: Array<EnumeratedFolder> = [];
  recursivelyEnumerateFoldersInFolder(folder, '', result);
  return result;
};

/**
 * Build the "Move to folder" submenu of an item or of a folder, in the same
 * way the objects list does it for objects and object folders.
 *
 * `itemToMove` and its own children are filtered out of the destinations, as a
 * folder can't be moved inside itself.
 */
export const buildMoveToFolderSubmenu = (
  i18n: I18nType,
  kind: ProjectItemFoldersKind,
  project: gdProject,
  itemToMove: ProjectItemFolderOrItem,
  onMoved: (destinationFolder: ProjectItemFolderOrItem) => void,
  onAddFolder: () => void
): Array<MenuItemTemplate> => {
  const rootFolder = kind.getRootFolder(project);
  const foldersAndPaths: Array<EnumeratedFolder> = [
    { path: i18n._(t`Root folder`), folder: rootFolder },
    ...enumerateFoldersInFolder(rootFolder),
  ];

  const currentParent = itemToMove.getParent();
  const filteredFoldersAndPaths = foldersAndPaths.filter(
    folderAndPath =>
      !folderAndPath.folder.isADescendantOf(itemToMove) &&
      folderAndPath.folder !== itemToMove
  );

  return [
    ...filteredFoldersAndPaths.map(({ folder, path }) => ({
      label: path,
      enabled: folder !== currentParent,
      click: () => {
        if (folder === currentParent) return;
        currentParent.moveFolderOrItemToAnotherFolder(itemToMove, folder, 0);
        onMoved(folder);
      },
    })),
    { type: 'separator' },
    {
      label: i18n._(t`Create new folder...`),
      click: onAddFolder,
    },
  ];
};

/**
 * Add a new folder like the objects list does: at the top of the selected
 * folder, or right after the selected item.
 */
export const addFolderIn = (
  {
    kind,
    onProjectItemModified,
    expandFolders,
    onNewFolderCreated,
  }: {
    kind: ProjectItemFoldersKind,
    onProjectItemModified: () => void,
    expandFolders: (folderIds: Array<string>) => void,
    onNewFolderCreated: (
      kind: ProjectItemFoldersKind,
      newFolder: ProjectItemFolderOrItem
    ) => void,
    // Given the props of a tree view item, which hold much more.
    ...
  },
  selectedFolderOrItem: ProjectItemFolderOrItem
): void => {
  let newFolder;
  if (selectedFolderOrItem.isFolder()) {
    newFolder = selectedFolderOrItem.insertNewFolder('NewFolder', 0);
    expandFolders([getParentFolderTreeViewItemId(kind, selectedFolderOrItem)]);
  } else {
    const parentFolder = selectedFolderOrItem.getParent();
    newFolder = parentFolder.insertNewFolder(
      'NewFolder',
      parentFolder.getChildPosition(selectedFolderOrItem) + 1
    );
  }
  onProjectItemModified();
  onNewFolderCreated(kind, newFolder);
};
