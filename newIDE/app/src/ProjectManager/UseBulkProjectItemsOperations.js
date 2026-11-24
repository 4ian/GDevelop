// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { type TreeViewItem } from '.';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import {
  type ProjectItemFoldersKind,
  type ProjectItemFolderOrItem,
  getItemsToDeleteFromSelection,
  removeEmptyFoldersFromSelection,
  enumerateFoldersInFolder,
  getSelectionTopLevelItems,
} from './ProjectItemFolders';
import {
  copyFolderOrItemsToClipboard,
  getUniqueFolderName,
} from './ProjectItemFoldersClipboard';
import { sceneFoldersKind } from './SceneTreeViewItemContent';
import { externalLayoutFoldersKind } from './ExternalLayoutTreeViewItemContent';
import { externalEventsFoldersKind } from './ExternalEventsTreeViewItemContent';
import { type SelectedFolderOrItems } from './UseProjectItemsSelection';

type DeleteItems = (items: Array<any>) => Promise<boolean>;

/**
 * Operations acting on the whole selection of the project manager: moving in
 * a folder, deleting and copying, and the menu shown for a multi-selection.
 */
function useBulkProjectItemsOperations({
  project,
  selectedItems,
  setSelectedItems,
  getSelectedFolderOrItems,
  onDeleteLayouts,
  onDeleteExternalLayouts,
  onDeleteExternalEventsList,
  onDeleteGameplayTests,
  onProjectItemModified,
  forceUpdateList,
  animateClosestVisibleParent,
  onNewFolderCreated,
}: {|
  project: ?gdProject,
  selectedItems: Array<TreeViewItem>,
  setSelectedItems: (Array<TreeViewItem>) => void,
  getSelectedFolderOrItems: () => ?SelectedFolderOrItems,
  onDeleteLayouts: DeleteItems,
  onDeleteExternalLayouts: DeleteItems,
  onDeleteExternalEventsList: DeleteItems,
  onDeleteGameplayTests: DeleteItems,
  onProjectItemModified: () => void,
  forceUpdateList: () => void,
  animateClosestVisibleParent: (
    kind: ProjectItemFoldersKind,
    folderOrItem: ProjectItemFolderOrItem
  ) => void,
  onNewFolderCreated: (
    kind: ProjectItemFoldersKind,
    newFolder: ProjectItemFolderOrItem
  ) => void,
|}): {|
  bulkMoveToNewFolder: () => void,
  deleteSelection: () => void,
  copySelection: () => void,
  buildBulkMenuTemplate: (i18n: I18nType) => Array<MenuItemTemplate>,
|} {
  const bulkMoveToFolder = React.useCallback(
    (destinationFolder: ProjectItemFolderOrItem) => {
      const selection = getSelectedFolderOrItems();
      if (!selection) return;
      const { kind, folderOrItems: topLevelFolderOrItems } = selection;

      // Start after existing children so items arrive in their original
      // selection order, not reversed.
      let insertPosition = destinationFolder.getChildrenCount();
      topLevelFolderOrItems.forEach(folderOrItem => {
        const currentParent = folderOrItem.getParent();
        if (destinationFolder === currentParent) return;
        currentParent.moveFolderOrItemToAnotherFolder(
          folderOrItem,
          destinationFolder,
          insertPosition
        );
        insertPosition += 1;
      });
      animateClosestVisibleParent(kind, destinationFolder);
      onProjectItemModified();
      forceUpdateList();
    },
    [
      getSelectedFolderOrItems,
      animateClosestVisibleParent,
      onProjectItemModified,
      forceUpdateList,
    ]
  );

  /**
   * Move the selected items (of the same section) in a new folder, created at
   * the top of the root folder.
   */
  const bulkMoveToNewFolder = React.useCallback(
    () => {
      if (!project) return;
      const selection = getSelectedFolderOrItems();
      if (!selection) return;
      const { kind, folderOrItems: topLevelFolderOrItems } = selection;

      const rootFolder = kind.getRootFolder(project);
      const uniqueName = getUniqueFolderName(rootFolder, 'NewFolder');
      const newFolder = rootFolder.insertNewFolder(uniqueName, 0);
      topLevelFolderOrItems.forEach(folderOrItem => {
        const currentParent = folderOrItem.getParent();
        currentParent.moveFolderOrItemToAnotherFolder(
          folderOrItem,
          newFolder,
          newFolder.getChildrenCount()
        );
      });
      animateClosestVisibleParent(kind, newFolder);
      onProjectItemModified();
      onNewFolderCreated(kind, newFolder);
    },
    [
      project,
      getSelectedFolderOrItems,
      onProjectItemModified,
      animateClosestVisibleParent,
      onNewFolderCreated,
    ]
  );

  /** Remove items of a kind from the project, once the user confirmed. */
  const deleteItemsOfKind = React.useCallback(
    (kind: ProjectItemFoldersKind, items: Array<any>): Promise<boolean> => {
      if (kind === sceneFoldersKind) return onDeleteLayouts(items);
      if (kind === externalLayoutFoldersKind)
        return onDeleteExternalLayouts(items);
      if (kind === externalEventsFoldersKind)
        return onDeleteExternalEventsList(items);
      return onDeleteGameplayTests(items);
    },
    [
      onDeleteLayouts,
      onDeleteExternalLayouts,
      onDeleteExternalEventsList,
      onDeleteGameplayTests,
    ]
  );

  /**
   * Remove the selected items, and the selected folders with the items they
   * hold, with a single confirmation listing all these items.
   */
  const deleteSelection = React.useCallback(
    () => {
      const selection = getSelectedFolderOrItems();
      if (!selection || selection.folderOrItems.length === 1) {
        // A single item or folder says it with its own words. A row inside a
        // selected folder is not the one to delete: its folder is.
        const [itemToDelete] = selection
          ? getSelectionTopLevelItems(selectedItems, item =>
              item.content.getFolderOrItem()
            )
          : selectedItems;
        if (itemToDelete) itemToDelete.content.delete();
        return;
      }
      const { kind, folderOrItems } = selection;
      const items = getItemsToDeleteFromSelection(folderOrItems);

      const removeSelectedFolders = () => {
        // Their items are removed: only empty folders remain in them.
        removeEmptyFoldersFromSelection(folderOrItems);
        setSelectedItems([]);
        onProjectItemModified();
        forceUpdateList();
      };
      if (items.length === 0) {
        removeSelectedFolders();
        return;
      }
      deleteItemsOfKind(kind, items).then(isRemoved => {
        if (isRemoved) removeSelectedFolders();
        else setSelectedItems([]);
      });
    },
    [
      getSelectedFolderOrItems,
      selectedItems,
      setSelectedItems,
      deleteItemsOfKind,
      onProjectItemModified,
      forceUpdateList,
    ]
  );

  const copySelection = React.useCallback(
    () => {
      const selection = getSelectedFolderOrItems();
      if (selection) {
        copyFolderOrItemsToClipboard(selection.kind, selection.folderOrItems);
      } else if (selectedItems.length > 0) {
        selectedItems[0].content.copy();
      }
    },
    [getSelectedFolderOrItems, selectedItems]
  );

  const buildBulkMenuTemplate = React.useCallback(
    (i18n: I18nType): Array<MenuItemTemplate> => {
      const selection = getSelectedFolderOrItems();
      if (!project || !selection) return [];
      const { kind, folderOrItems: topLevelFolderOrItems } = selection;

      const rootFolder = kind.getRootFolder(project);
      const movableFolderAndPaths = [
        { path: i18n._(t`Root folder`), folder: rootFolder },
        ...enumerateFoldersInFolder(rootFolder),
      ].filter(({ folder }) => {
        // Hide folders that are selected or are descendants of a selected
        // folder (can't move a folder into itself or its own subtree).
        if (
          topLevelFolderOrItems.some(
            folderOrItem =>
              folder === folderOrItem || folder.isADescendantOf(folderOrItem)
          )
        )
          return false;
        // Hide a folder when every selected item is already a direct
        // child of it — moving there would be a no-op.
        return !topLevelFolderOrItems.every(
          folderOrItem => folderOrItem.getParent() === folder
        );
      });

      return [
        {
          label: i18n._(t`Copy`),
          click: () => copySelection(),
        },
        {
          label: i18n._(t`Cut`),
          click: () => {
            copySelection();
            deleteSelection();
          },
        },
        {
          label: i18n._(t`Delete`),
          click: () => deleteSelection(),
          accelerator: 'Backspace',
        },
        { type: 'separator' },
        {
          label: i18n._(t`Move to folder`),
          submenu: [
            ...movableFolderAndPaths.map(({ folder, path }) => ({
              label: path,
              click: () => bulkMoveToFolder(folder),
            })),
            { type: 'separator' },
            {
              label: i18n._(t`Create new folder...`),
              click: () => bulkMoveToNewFolder(),
              accelerator: 'CmdOrCtrl+G',
            },
          ],
        },
      ];
    },
    [
      project,
      getSelectedFolderOrItems,
      copySelection,
      deleteSelection,
      bulkMoveToFolder,
      bulkMoveToNewFolder,
    ]
  );

  return {
    bulkMoveToNewFolder,
    deleteSelection,
    copySelection,
    buildBulkMenuTemplate,
  };
}

export { useBulkProjectItemsOperations };
