// @flow
import * as React from 'react';
import { type TreeViewItem } from '.';
import {
  type ProjectItemFoldersKind,
  type ProjectItemFolderOrItem,
  getItemsToDeleteFromSelection,
  removeEmptyFoldersFromSelection,
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
 * Operations acting on the whole selection of the project manager: grouping
 * in a folder, deleting, copying and moving (drag and drop).
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
  onTreeModified,
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
  onTreeModified: (shouldForceUpdateList: boolean) => void,
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
  groupSelectionInFolder: () => void,
  deleteSelection: () => void,
  copySelection: () => void,
|} {
  /**
   * Move the selected items (of the same section) in a new folder, created
   * where the first of them was.
   */
  const groupSelectionInFolder = React.useCallback(
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
        // A single item or folder says it with its own words.
        if (selectedItems.length > 0) selectedItems[0].content.delete();
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

  return {
    groupSelectionInFolder,
    deleteSelection,
    copySelection,
  };
}

export { useBulkProjectItemsOperations };
