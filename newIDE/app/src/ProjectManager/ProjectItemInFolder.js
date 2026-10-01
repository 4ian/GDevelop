// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { type TreeViewItemContent, type TreeItemProps } from '.';
import {
  type ProjectItemFoldersKind,
  type ProjectItemFolderOrItem,
  addFolderIn,
  buildMoveToFolderSubmenu,
  getFolderOrItemTreeViewItemId,
  getParentFolderTreeViewItemId,
  isFolderOrItemDescendantOf,
  getFolderOrItemIndex,
  moveFolderOrItemAt,
} from './ProjectItemFolders';
import {
  copyFolderOrItemToClipboard,
  pasteFolderOrItemsFromClipboard,
  hasFolderOrItemsInClipboard,
  getPasteMenuLabel,
} from './ProjectItemFoldersClipboard';

/** What an item needs from the project manager to live in a folder. */
type ProjectItemInFolderProps = {
  ...TreeItemProps,
  expandFolders: (folderIds: Array<string>) => void,
  onMovedFolderOrItemToAnotherFolder: (
    kind: ProjectItemFoldersKind,
    destinationFolder: ProjectItemFolderOrItem
  ) => void,
  onNewFolderCreated: (
    kind: ProjectItemFoldersKind,
    newFolder: ProjectItemFolderOrItem
  ) => void,
  // Given the props of the item, which hold its own callbacks too.
  ...
};

/**
 * What every item of the project manager organized in folders (a scene, an
 * external layout, external events, a gameplay test) does the same way: its
 * position in its folder, moving it, copying and pasting it, and the "Move to
 * folder" menu. Each item tree view content holds one and delegates to it.
 */
export class ProjectItemInFolder {
  kind: ProjectItemFoldersKind;
  // The node of the folder structure holding the item.
  folderOrItem: ProjectItemFolderOrItem;
  props: ProjectItemInFolderProps;
  // Called when pasting created at least one item.
  onItemsAdded: ?() => void;

  constructor(
    kind: ProjectItemFoldersKind,
    folderOrItem: ProjectItemFolderOrItem,
    props: ProjectItemInFolderProps,
    onItemsAdded?: ?() => void
  ) {
    this.kind = kind;
    this.folderOrItem = folderOrItem;
    this.props = props;
    this.onItemsAdded = onItemsAdded;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return isFolderOrItemDescendantOf(
      this.kind,
      this.folderOrItem,
      itemContent
    );
  }

  getIndex(): number {
    return getFolderOrItemIndex(this.folderOrItem);
  }

  moveAt(destinationIndex: number, targetFolder?: ProjectItemFolderOrItem) {
    moveFolderOrItemAt(this.folderOrItem, destinationIndex, targetFolder);
    this.onFolderStructureModified();
  }

  copy(): void {
    copyFolderOrItemToClipboard(this.kind, this.folderOrItem);
  }

  /**
   * Paste what was copied right after the node, in its folder, or at the
   * given position of another folder.
   */
  paste(destination?: {|
    folder: ProjectItemFolderOrItem,
    positionInFolder: number,
  |}): void {
    const destinationFolder = destination
      ? destination.folder
      : this.folderOrItem.getParent();
    const pastedContent = pasteFolderOrItemsFromClipboard({
      kind: this.kind,
      project: this.props.project,
      destinationFolder,
      positionInFolder: destination
        ? destination.positionInFolder
        : this.getIndex() + 1,
    });
    if (!pastedContent) return;

    this.onFolderStructureModified();
    this.props.expandFolders([
      getParentFolderTreeViewItemId(this.kind, destinationFolder),
    ]);
    const firstPastedItem = pastedContent.topLevelFolderOrItems[0];
    if (firstPastedItem) {
      this.props.editName(
        getFolderOrItemTreeViewItemId(this.kind, firstPastedItem)
      );
    }
    if (pastedContent.createdItems.length > 0 && this.onItemsAdded)
      this.onItemsAdded();
  }

  onProjectItemModified(): void {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.props.forceUpdate();
  }

  /**
   * The tree view caches the children of each item, so it must also be told to
   * rebuild them when the folder structure itself changed.
   */
  onFolderStructureModified(): void {
    this.onProjectItemModified();
    this.props.forceUpdateList();
  }

  /**
   * Add a new folder in the given folder, or right after the given item, and
   * start editing its name.
   */
  addFolderIn(selectedFolderOrItem: ProjectItemFolderOrItem): void {
    addFolderIn(
      {
        ...this.props,
        kind: this.kind,
        onProjectItemModified: () => this.onProjectItemModified(),
      },
      selectedFolderOrItem
    );
  }

  buildMoveToFolderMenuItem(i18n: I18nType): any {
    return {
      label: i18n._(t`Move to folder`),
      submenu: buildMoveToFolderSubmenu(
        i18n,
        this.kind,
        this.props.project,
        this.folderOrItem,
        destinationFolder => {
          this.props.onMovedFolderOrItemToAnotherFolder(
            this.kind,
            destinationFolder
          );
          this.onFolderStructureModified();
        },
        () => this.addFolderIn(this.folderOrItem.getParent())
      ),
    };
  }

  buildPasteMenuItem(i18n: I18nType, onPaste: () => void): any {
    return {
      label: getPasteMenuLabel(i18n, this.kind),
      enabled: hasFolderOrItemsInClipboard(this.kind),
      click: onPaste,
      accelerator: 'CmdOrCtrl+V',
    };
  }
}
