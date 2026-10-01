// @flow
import * as React from 'react';
import { type TreeViewItem } from '.';
import {
  type ProjectItemFoldersKind,
  type ProjectItemFolderOrItem,
  getTopLevelFolderOrItems,
} from './ProjectItemFolders';
import { getProjectItemFoldersKind } from './ProjectItemFoldersKinds';

export type SelectedFolderOrItems = {|
  kind: ProjectItemFoldersKind,
  folderOrItems: Array<ProjectItemFolderOrItem>,
|};

/**
 * Manages which items are selected in the project manager, and how this
 * selection maps to the folder structures of the project items.
 */
function useProjectItemsSelection(): {|
  selectedItems: Array<TreeViewItem>,
  setSelectedItems: (Array<TreeViewItem>) => void,
  getSelectedFolderOrItems: () => ?SelectedFolderOrItems,
  onCollapseItem: (item: TreeViewItem) => void,
|} {
  const [selectedItems, setSelectedItems] = React.useState<Array<TreeViewItem>>(
    []
  );

  /**
   * The selected nodes organized in folders, of the section of the first
   * selected item (a selection spanning several sections acts on this one),
   * without the nodes inside another selected folder. Null when the first
   * selected item is not organized in folders (an extension...).
   */
  const getSelectedFolderOrItems = React.useCallback(
    (): ?SelectedFolderOrItems => {
      if (selectedItems.length === 0) return null;
      const rootId = selectedItems[0].content.getRootId();
      const kind = getProjectItemFoldersKind(rootId);
      if (!kind) return null;

      const folderOrItems = getTopLevelFolderOrItems(
        selectedItems
          .filter(item => item.content.getRootId() === rootId)
          .map(item => item.content.getFolderOrItem())
          .filter(Boolean)
      );
      return folderOrItems.length > 0 ? { kind, folderOrItems } : null;
    },
    [selectedItems]
  );

  /**
   * Unselect item if one of the parent is collapsed (folded) so that the item
   * does not stay selected and not visible to the user.
   */
  const onCollapseItem = React.useCallback(
    (item: TreeViewItem) => {
      if (selectedItems.length !== 1 || item.isPlaceholder) {
        return;
      }
      if (selectedItems[0].content.isDescendantOf(item.content)) {
        setSelectedItems([]);
      }
    },
    [selectedItems]
  );

  return {
    selectedItems,
    setSelectedItems,
    getSelectedFolderOrItems,
    onCollapseItem,
  };
}

export { useProjectItemsSelection };
