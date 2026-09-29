// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import * as React from 'react';
import { type TreeViewItemContent, type TreeItemProps } from '.';
import { type MenuButton } from '../UI/TreeView';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import { mapFor } from '../Utils/MapFor';
import {
  type ProjectItemFoldersKind,
  type ProjectItemFolderOrItem,
  buildMoveToFolderSubmenu,
  getFolderTreeViewItemId,
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

export type ProjectItemFolderTreeViewItemProps = {|
  ...TreeItemProps,
  kind: ProjectItemFoldersKind,
  onProjectItemModified: () => void,
  expandFolders: (folderIds: Array<string>) => void,
  addItemInFolder: (folder: ProjectItemFolderOrItem, i18n: I18nType) => void,
  // Called when items were created by a paste.
  onItemsAdded: () => void,
|};

/**
 * A folder used to organize the scenes, the external layouts, the external
 * events or the gameplay tests.
 */
export class ProjectItemFolderTreeViewItemContent
  implements TreeViewItemContent {
  folder: ProjectItemFolderOrItem;
  props: ProjectItemFolderTreeViewItemProps;

  constructor(
    folder: ProjectItemFolderOrItem,
    props: ProjectItemFolderTreeViewItemProps
  ) {
    this.folder = folder;
    this.props = props;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return isFolderOrItemDescendantOf(
      this.props.kind,
      this.folder,
      itemContent
    );
  }

  getRootId(): string {
    return this.props.kind.getRootId();
  }

  getName(): string | React.Node {
    return this.folder.getFolderName();
  }

  getId(): string {
    return getFolderTreeViewItemId(this.props.kind, this.folder);
  }

  getHtmlId(index: number): ?string {
    return `${this.props.kind.name}-folder-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      [`${this.props.kind.name}-folder`]: this.folder.getFolderName(),
    };
  }

  getFolder(): ProjectItemFolderOrItem {
    return this.folder;
  }

  getFolderOrItem(): ProjectItemFolderOrItem {
    return this.folder;
  }

  getThumbnail(): ?string {
    return 'FOLDER';
  }

  onClick(): void {}

  rename(newName: string): void {
    if (this.folder.getFolderName() === newName) return;
    this.folder.setFolderName(newName);
    this.props.onProjectItemModified();
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  buildMenuTemplate(i18n: I18nType, index: number): any {
    const { project, kind } = this.props;
    const currentParent = this.folder.getParent();

    return [
      {
        label: i18n._(t`Rename`),
        click: () => this.edit(),
        accelerator: 'F2',
      },
      {
        label: i18n._(t`Delete`),
        click: () => this.delete(),
        accelerator: 'Backspace',
      },
      {
        label: i18n._(t`Move to folder`),
        submenu: buildMoveToFolderSubmenu(
          i18n,
          kind,
          project,
          this.folder,
          () => this._onFolderStructureModified(),
          () => this._addFolderIn(currentParent)
        ),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Copy`),
        click: () => this.copy(),
        accelerator: 'CmdOrCtrl+C',
      },
      {
        label: i18n._(t`Cut`),
        click: () => this.cut(),
        accelerator: 'CmdOrCtrl+X',
      },
      {
        label: getPasteMenuLabel(i18n, kind),
        enabled: hasFolderOrItemsInClipboard(kind),
        click: () => this.paste(),
        accelerator: 'CmdOrCtrl+V',
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(kind.addItemLabel),
        click: () => this.props.addItemInFolder(this.folder, i18n),
      },
      {
        label: i18n._(t`Add a folder`),
        click: () => this._addFolderIn(this.folder),
      },
    ];
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  getRightButton(i18n: I18nType): ?MenuButton {
    return null;
  }

  delete(): void {
    const { showDeleteConfirmation, kind } = this.props;
    const parent = this.folder.getParent();
    const childrenCount = this.folder.getChildrenCount();

    // Removing a folder never removes the items it contains: they are moved
    // back to the parent folder, so that an item can only ever be deleted
    // explicitly, one by one.
    if (childrenCount === 0) {
      parent.removeFolderChild(this.folder);
      this._onFolderStructureModified();
      return;
    }

    showDeleteConfirmation({
      title: t`Remove folder`,
      message: kind.removeFolderMessage,
      confirmButtonLabel: t`Remove folder`,
    }).then(answer => {
      if (!answer) return;

      const positionInParent = this.getIndex();
      // The children are collected first, as moving them out changes the
      // indices while iterating.
      const childrenToMove = mapFor(0, this.folder.getChildrenCount(), i =>
        this.folder.getChildAt(i)
      );
      childrenToMove.forEach((child, i) => {
        this.folder.moveFolderOrItemToAnotherFolder(
          child,
          parent,
          positionInParent + i
        );
      });

      parent.removeFolderChild(this.folder);

      this._onFolderStructureModified();
    });
  }

  getIndex(): number {
    return getFolderOrItemIndex(this.folder);
  }

  moveAt(
    destinationIndex: number,
    targetFolder?: ProjectItemFolderOrItem
  ): void {
    moveFolderOrItemAt(this.folder, destinationIndex, targetFolder);
    this._onFolderStructureModified();
  }

  copy(): void {
    copyFolderOrItemToClipboard(this.props.kind, this.folder);
  }

  cut(): void {
    this.copy();
    this.delete();
  }

  paste(): void {
    const { kind, project } = this.props;
    const pastedContent = pasteFolderOrItemsFromClipboard({
      kind,
      project,
      destinationFolder: this.folder,
      positionInFolder: this.folder.getChildrenCount(),
    });
    if (!pastedContent) return;

    this._onFolderStructureModified();
    this.props.expandFolders([this.getId()]);
    const firstPastedItem = pastedContent.topLevelFolderOrItems[0];
    if (firstPastedItem) {
      this.props.editName(getFolderOrItemTreeViewItemId(kind, firstPastedItem));
    }
    if (pastedContent.createdItems.length > 0) this.props.onItemsAdded();
  }

  _addFolderIn(parentFolder: ProjectItemFolderOrItem): void {
    addFolderIn(this.props, parentFolder);
  }

  _onFolderStructureModified(): void {
    this.props.onProjectItemModified();
    this.props.forceUpdateList();
  }
}

/**
 * Add a new folder at the top of the given folder and start editing its name,
 * like the objects list does.
 */
export const addFolderIn = (
  {
    kind,
    onProjectItemModified,
    forceUpdateList,
    expandFolders,
    editName,
  }: {
    kind: ProjectItemFoldersKind,
    onProjectItemModified: () => void,
    // The tree view caches the children of each item, so it must be told to
    // rebuild them when the folder structure itself changed.
    forceUpdateList: () => void,
    expandFolders: (folderIds: Array<string>) => void,
    editName: (itemId: string) => void,
  },
  parentFolder: ProjectItemFolderOrItem
): void => {
  const newFolder = parentFolder.insertNewFolder('NewFolder', 0);

  onProjectItemModified();
  forceUpdateList();
  expandFolders([getParentFolderTreeViewItemId(kind, parentFolder)]);
  // We focus it so the user can edit the name directly.
  editName(getFolderTreeViewItemId(kind, newFolder));
};
