// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { AutoSizer } from 'react-virtualized';
import TreeView, { type TreeViewInterface } from '../TreeView';
import { type MenuItemTemplate } from '../Menu/Menu.flow';
import KeyboardShortcuts from '../KeyboardShortcuts';
import {
  type FolderTreeViewItem,
  type FolderTreeViewItemContent,
  createTreeViewItemFromFolderOrItem,
} from './FolderTreeViewItem';

const styles = {
  listContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  autoSizerContainer: { flex: 1 },
  autoSizer: { width: '100%' },
};

export type FolderTreeViewCallbacks<TItem, TFolder> = {|
  onItemClick?: (item: TItem) => void,
  onItemEdit?: (item: TItem) => void,
  onItemDelete?: (item: TItem | TFolder) => void,
  onItemDuplicate?: (item: TItem) => void,
  onItemCopy?: (item: TItem | TFolder) => void,
  onItemCut?: (item: TItem | TFolder) => void,
  onItemPaste?: (folder: TFolder) => void,
  onFolderClick?: (folder: TFolder) => void,
  onFolderExpand?: (folder: TFolder) => void,
  onItemRename?: (item: TItem | TFolder, newName: string) => void,
  onSelectionChange?: (items: Array<TItem | TFolder>) => void,
|};

export type FolderTreeViewProps<TItem, TFolder> = {|
  // Core data
  rootFolder: TFolder,
  i18n: I18nType,
  
  // React DnD type for drag and drop
  reactDndType: string,
  
  // Rendering callbacks
  getItemName: (item: TItem) => string,
  getFolderName: (folder: TFolder) => string,
  getItemThumbnail?: (item: TItem) => ?string,
  getItemId: (item: TItem) => string,
  getFolderId: (folder: TFolder) => string,
  
  // Folder structure methods (from C++ backend)
  isFolder: (folderOrItem: any) => boolean,
  getItem: (folderOrItem: any) => TItem,
  getChildrenCount: (folder: TFolder) => number,
  getChildAt: (folder: TFolder, index: number) => any, // Returns TFolder or TItem wrapper
  
  // Menu building
  buildItemMenu?: (item: TItem, i18n: I18nType, index: number) => Array<MenuItemTemplate>,
  buildFolderMenu?: (folder: TFolder, i18n: I18nType, index: number) => Array<MenuItemTemplate>,
  
  // Right button and component rendering
  getItemRightButton?: (item: TItem, i18n: I18nType) => ?MenuButton,
  getFolderRightButton?: (folder: TFolder, i18n: I18nType) => ?MenuButton,
  renderItemRightComponent?: (item: TItem, i18n: I18nType) => ?React.Node,
  renderFolderRightComponent?: (folder: TFolder, i18n: I18nType) => ?React.Node,
  
  // Callbacks
  callbacks?: FolderTreeViewCallbacks<TItem, TFolder>,
  
  // UI options
  searchText?: string,
  selectedItems?: Array<TItem | TFolder>,
  forceAllOpened?: boolean,
  initiallyOpenedFolderIds?: Array<string>,
  
  // Root folder rendering
  rootFolderId: string,
  rootFolderLabel: string | React.Node,
  rootFolderRightButton?: MenuButton,
  
  // Drag & Drop
  canMoveSelectionTo?: (destinationItem: any, where: 'before' | 'inside' | 'after') => boolean,
  moveSelectionTo?: (destinationItem: any, where: 'before' | 'inside' | 'after') => void,
  
  // Locking
  isLocked?: boolean,
  
  // Global items support
  isGlobal?: boolean,
|};


/**
 * Generische FolderTreeView Komponente.
 * Kann für Objects, Scenes, ExternalLayouts, etc. verwendet werden.
 * 
 * Nimmt einen Root-Folder und baut daraus einen Tree mit Drag & Drop Support.
 */
export function FolderTreeView<TItem, TFolder>(
  props: FolderTreeViewProps<TItem, TFolder>
) {
  const {
    rootFolder,
    i18n,
    reactDndType,
    getItemName,
    getFolderName,
    getItemThumbnail,
    getItemId,
    getFolderId,
    isFolder,
    getItem,
    getChildrenCount,
    getChildAt,
    buildItemMenu,
    buildFolderMenu,
    getItemRightButton,
    getFolderRightButton,
    renderItemRightComponent,
    renderFolderRightComponent,
    callbacks,
    searchText,
    selectedItems,
    forceAllOpened,
    initiallyOpenedFolderIds,
    rootFolderId,
    rootFolderLabel,
    rootFolderRightButton,
    canMoveSelectionTo,
    moveSelectionTo,
    isLocked,
    isGlobal = false,
  } = props;

  const treeViewRef = React.useRef<?TreeViewInterface<FolderTreeViewItem>>(null);
  const keyboardShortcutsRef = React.useRef<KeyboardShortcuts>(
    new KeyboardShortcuts({ shortcutCallbacks: {} })
  );

  // Build tree structure recursively
  const buildTreeFromFolder = React.useCallback(
    (folder: TFolder, global: boolean): FolderTreeViewItem => {
      return createTreeViewItemFromFolderOrItem({
        folderOrItem: folder,
        isGlobal: global,
        reactDndType,
        isFolderFunc: isFolder,
        getItemFunc: getItem,
        getChildrenCountFunc: getChildrenCount,
        getChildAtFunc: getChildAt,
        getItemNameFunc: getItemName,
        getFolderNameFunc: getFolderName,
        getItemThumbnailFunc: getItemThumbnail,
        getItemIdFunc: getItemId,
        getFolderIdFunc: getFolderId,
        buildItemMenuFunc: buildItemMenu,
        buildFolderMenuFunc: buildFolderMenu,
        getItemRightButtonFunc: getItemRightButton,
        getFolderRightButtonFunc: getFolderRightButton,
        renderItemRightComponentFunc: renderItemRightComponent,
        renderFolderRightComponentFunc: renderFolderRightComponent,
        callbacks,
        i18n,
      });
    },
    [
      reactDndType,
      isFolder,
      getItem,
      getChildrenCount,
      getChildAt,
      getItemName,
      getFolderName,
      getItemThumbnail,
      getItemId,
      getFolderId,
      buildItemMenu,
      buildFolderMenu,
      getItemRightButton,
      getFolderRightButton,
      renderItemRightComponent,
      renderFolderRightComponent,
      callbacks,
      i18n,
    ]
  );

  const treeViewData = React.useMemo(
    () => {
      // Root folder wrapper
      const rootItem = buildTreeFromFolder(rootFolder, false);
      return [rootItem];
    },
    [rootFolder, buildTreeFromFolder]
  );

  // TreeView adapter functions
  const getTreeViewItemName = React.useCallback(
    (item: FolderTreeViewItem) => item.content.getName(),
    []
  );

  const getTreeViewItemId = React.useCallback(
    (item: FolderTreeViewItem) => item.content.getId(),
    []
  );

  const getTreeViewItemChildren = React.useCallback(
    (item: FolderTreeViewItem) => item.getChildren(i18n),
    [i18n]
  );

  const getTreeViewItemThumbnail = React.useCallback(
    (item: FolderTreeViewItem) => item.content.getThumbnail(),
    []
  );

  const getTreeViewItemRightButton = React.useCallback(
    (item: FolderTreeViewItem) => item.content.getRightButton(i18n),
    [i18n]
  );

  const renderTreeViewItemRightComponent = React.useCallback(
    (item: FolderTreeViewItem) => item.content.renderRightComponent(i18n),
    [i18n]
  );

  const buildMenuTemplate = React.useCallback(
    (item: FolderTreeViewItem, index: number) => 
      item.content.buildMenuTemplate(i18n, index),
    [i18n]
  );

  const onClickItem = React.useCallback(
    (item: FolderTreeViewItem) => {
      item.content.onClick();
    },
    []
  );

  const onRenameItem = React.useCallback(
    (item: FolderTreeViewItem, newName: string) => {
      item.content.rename(newName);
    },
    []
  );

  const onEditItem = React.useCallback(
    (item: FolderTreeViewItem) => {
      item.content.edit();
    },
    []
  );

  // Keyboard shortcuts
  React.useEffect(
    () => {
      if (keyboardShortcutsRef.current && selectedItems && selectedItems.length > 0) {
        keyboardShortcutsRef.current.setShortcutCallback('onDelete', () => {
          if (!isLocked && callbacks?.onItemDelete) {
            callbacks.onItemDelete(selectedItems[0]);
          }
        });
        
        keyboardShortcutsRef.current.setShortcutCallback('onDuplicate', () => {
          if (!isLocked && callbacks?.onItemDuplicate) {
            // Only works for items, not folders
            callbacks.onItemDuplicate(selectedItems[0]);
          }
        });
        
        keyboardShortcutsRef.current.setShortcutCallback('onRename', () => {
          if (!isLocked && treeViewRef.current && selectedItems.length > 0) {
            const itemId = typeof selectedItems[0] === 'object' && selectedItems[0].getId
              ? selectedItems[0].getId()
              : getItemId(selectedItems[0]);
            treeViewRef.current.renameItemFromId(itemId);
          }
        });
      }
    },
    [selectedItems, isLocked, callbacks, getItemId]
  );

  return (
    <div
      style={styles.listContainer}
      onKeyDown={keyboardShortcutsRef.current.onKeyDown}
      onKeyUp={keyboardShortcutsRef.current.onKeyUp}
    >
      <div style={styles.autoSizerContainer}>
        <AutoSizer style={styles.autoSizer} disableWidth>
          {({ height }) => (
            <TreeView
              ref={treeViewRef}
              items={treeViewData}
              height={height}
              forceAllOpened={forceAllOpened}
              searchText={searchText}
              getItemName={getTreeViewItemName}
              getItemThumbnail={getTreeViewItemThumbnail}
              getItemChildren={getTreeViewItemChildren}
              multiSelect={false}
              getItemId={getTreeViewItemId}
              onEditItem={onEditItem}
              onClickItem={onClickItem}
              onRenameItem={onRenameItem}
              buildMenuTemplate={buildMenuTemplate}
              getItemRightButton={getTreeViewItemRightButton}
              renderRightComponent={renderTreeViewItemRightComponent}
              onMoveSelectionToItem={
                moveSelectionTo
                  ? (destinationItem, where) =>
                      moveSelectionTo(destinationItem, where)
                  : undefined
              }
              canMoveSelectionToItem={canMoveSelectionTo}
              reactDndType={reactDndType}
              initiallyOpenedNodeIds={initiallyOpenedFolderIds || [rootFolderId]}
              selectedItems={
                selectedItems
                  ? selectedItems.map(item =>
                      buildTreeFromFolder(item, isGlobal)
                    )
                  : []
              }
              onSelectItems={items => {
                if (callbacks?.onSelectionChange) {
                  callbacks.onSelectionChange(
                    items.map(item => item.content.getOriginalItem())
                  );
                }
              }}
            />
          )}
        </AutoSizer>
      </div>
    </div>
  );
}

export default FolderTreeView;