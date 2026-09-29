// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import { type TreeViewItemContent } from '.';
import { mapFor } from '../Utils/MapFor';

/**
 * A node of the folder structure of a list of project items (scenes, external
 * layouts, external events or gameplay tests): all these classes share the
 * same API.
 */
export type ProjectItemFolderOrItem =
  | gdLayoutFolderOrLayout
  | gdExternalLayoutFolderOrExternalLayout
  | gdExternalEventsFolderOrExternalEvents
  | gdTestFolderOrTest;

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
  removeFolderMessage: MessageDescriptor,
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

export const isFolderOrItemDescendantOf = (
  kind: ProjectItemFoldersKind,
  folderOrItem: ProjectItemFolderOrItem,
  itemContent: TreeViewItemContent
): boolean => {
  if (itemContent.getId() === kind.getRootId()) return true;

  let currentParent = folderOrItem.getParent();
  while (!currentParent.isRootFolder()) {
    if (getFolderTreeViewItemId(kind, currentParent) === itemContent.getId()) {
      return true;
    }
    currentParent = currentParent.getParent();
  }
  return false;
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

const enumerateFoldersInFolder = (
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
      enumerateFoldersInFolder(child, newPrefix, result);
    }
  });
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
  onMoved: () => void,
  onAddFolder: () => void
): Array<MenuItemTemplate> => {
  const rootFolder = kind.getRootFolder(project);
  const foldersAndPaths: Array<EnumeratedFolder> = [
    { path: i18n._(t`Root folder`), folder: rootFolder },
  ];
  enumerateFoldersInFolder(rootFolder, '', foldersAndPaths);

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
        onMoved();
      },
    })),
    { type: 'separator' },
    {
      label: i18n._(t`Create new folder...`),
      click: onAddFolder,
    },
  ];
};
