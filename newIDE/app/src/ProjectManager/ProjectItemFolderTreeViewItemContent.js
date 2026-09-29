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
  getFolderTreeViewItemId,
  getItemsInFolder,
  hasAnyItemInFolder,
  removeFolderWithoutItems,
} from './ProjectItemFolders';
import { ProjectItemInFolder } from './ProjectItemInFolder';

export type ProjectItemFolderTreeViewItemProps = {|
  ...TreeItemProps,
  kind: ProjectItemFoldersKind,
  onProjectItemModified: () => void,
  // Called once the folder is removed (it is then destroyed).
  onFolderRemoved: () => void,
  expandFolders: (folderIds: Array<string>) => void,
  addItemInFolder: (folder: ProjectItemFolderOrItem, i18n: I18nType) => void,
  // Called when items were created by a paste.
  onItemsAdded: () => void,
  // Remove items of this kind from the project, once the user confirmed.
  // Resolves to true if they were removed.
  deleteItems: (items: Array<any>) => Promise<boolean>,
|};

/**
 * A folder used to organize the scenes, the external layouts, the external
 * events or the gameplay tests.
 */
export class ProjectItemFolderTreeViewItemContent
  implements TreeViewItemContent {
  folder: ProjectItemFolderOrItem;
  props: ProjectItemFolderTreeViewItemProps;
  inFolder: ProjectItemInFolder;

  constructor(
    folder: ProjectItemFolderOrItem,
    props: ProjectItemFolderTreeViewItemProps
  ) {
    this.folder = folder;
    this.props = props;
    this.inFolder = new ProjectItemInFolder(
      props.kind,
      folder,
      props,
      props.onItemsAdded
    );
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return this.inFolder.isDescendantOf(itemContent);
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
    const { kind } = this.props;

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
      this.inFolder.buildMoveToFolderMenuItem(i18n),
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
      this.inFolder.buildPasteMenuItem(i18n, () => this.paste()),
      {
        type: 'separator',
      },
      {
        label: i18n._(kind.addItemLabel),
        click: () => this.props.addItemInFolder(this.folder, i18n),
      },
      {
        label: i18n._(t`Add a folder`),
        click: () => this.inFolder.addFolderIn(this.folder),
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
    // Removing a folder never removes the items it contains: they are moved
    // back to the parent folder, so that an item can only ever be deleted
    // explicitly, one by one. A folder holding no item (only empty folders,
    // or nothing) is removed at once, without asking.
    if (!hasAnyItemInFolder(this.folder)) {
      removeFolderWithoutItems(this.folder);
      this.props.onFolderRemoved();
      this.inFolder.onFolderStructureModified();
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
      this.props.onFolderRemoved();
      this.inFolder.onFolderStructureModified();
    });
  }

  getIndex(): number {
    return this.inFolder.getIndex();
  }

  moveAt(
    destinationIndex: number,
    targetFolder?: ProjectItemFolderOrItem
  ): void {
    this.inFolder.moveAt(destinationIndex, targetFolder);
  }

  copy(): void {
    this.inFolder.copy();
  }

  /**
   * Cutting a folder removes it with everything it holds, the items included
   * (they are in the clipboard, to be pasted elsewhere), once the user
   * confirmed the removal of these items.
   */
  cut(): void {
    this.copy();
    const items = getItemsInFolder(this.folder);
    if (items.length === 0) {
      this.delete();
      return;
    }
    this.props.deleteItems(items).then(isRemoved => {
      if (!isRemoved) return;
      // The removed items left their folders: only empty folders remain.
      removeFolderWithoutItems(this.folder);
      this.props.onFolderRemoved();
      this.inFolder.onFolderStructureModified();
    });
  }

  /** Pasting on a folder puts what was copied at its end. */
  paste(): void {
    this.inFolder.paste({
      folder: this.folder,
      positionInFolder: this.folder.getChildrenCount(),
    });
  }
}
