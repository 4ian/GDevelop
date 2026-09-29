// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { unserializeFromJSObject } from '../Utils/Serializer';
import { addFolderIn } from './ProjectItemFolderTreeViewItemContent';
import {
  type ProjectItemFoldersKind,
  buildMoveToFolderSubmenu,
  getFolderOrItemTreeViewItemId,
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
import {
  type TreeViewItemContent,
  type TreeItemProps,
  externalLayoutsRootFolderId,
} from '.';
import { type HTMLDataset } from '../Utils/HTMLDataset';

export type ExternalLayoutTreeViewItemCallbacks = {|
  onExternalLayoutAdded: () => void,
  onDeleteExternalLayout: gdExternalLayout => void,
  onRenameExternalLayout: (string, string) => void,
  onOpenExternalLayout: string => void,
|};

export type ExternalLayoutTreeViewItemCommonProps = {|
  ...TreeItemProps,
  ...ExternalLayoutTreeViewItemCallbacks,
|};

export type ExternalLayoutTreeViewItemProps = {|
  ...ExternalLayoutTreeViewItemCommonProps,
  project: gdProject,
  expandFolders: (folderIds: Array<string>) => void,
|};

export const getExternalLayoutTreeViewItemId = (
  externalLayout: gdExternalLayout
): string => {
  // Pointers are used because they stay the same even when the names are
  // changed.
  return `external-layout-${externalLayout.ptr}`;
};

export const externalLayoutFoldersKind: ProjectItemFoldersKind = {
  name: 'external-layout',
  getRootId: () => externalLayoutsRootFolderId,
  getRootFolder: project => project.getExternalLayoutsRootFolder(),
  hasItemNamed: (project, name) => project.hasExternalLayoutNamed(name),
  getItemTreeViewItemId: getExternalLayoutTreeViewItemId,
  insertItemFromSerializedContent: (project, name, serializedItem) => {
    const newExternalLayout = project.insertNewExternalLayout(
      name,
      project.getExternalLayoutsCount()
    );
    unserializeFromJSObject(
      newExternalLayout,
      serializedItem,
      'unserializeFrom',
      project
    );
    // Unserialization has overwritten the name.
    newExternalLayout.setName(name);
    return newExternalLayout;
  },
  legacyClipboard: { kind: 'External layout', itemProperty: 'externalLayout' },
  addItemLabel: t`Add an external layout`,
  removeFolderMessage: t`The external layouts and folders it contains will be moved out of it, not removed. Do you want to continue?`,
};

export class ExternalLayoutTreeViewItemContent implements TreeViewItemContent {
  externalLayout: gdExternalLayout;
  // The node of the folder structure holding this item.
  folderOrItem: gdExternalLayoutFolderOrExternalLayout;
  props: ExternalLayoutTreeViewItemProps;

  constructor(
    externalLayout: gdExternalLayout,
    folderOrItem: gdExternalLayoutFolderOrExternalLayout,
    props: ExternalLayoutTreeViewItemProps
  ) {
    this.externalLayout = externalLayout;
    this.folderOrItem = folderOrItem;
    this.props = props;
  }

  getFolderOrItem(): gdExternalLayoutFolderOrExternalLayout {
    return this.folderOrItem;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return isFolderOrItemDescendantOf(
      externalLayoutFoldersKind,
      this.folderOrItem,
      itemContent
    );
  }

  getRootId(): string {
    return externalLayoutsRootFolderId;
  }

  getName(): string | React.Node {
    return this.externalLayout.getName();
  }

  getId(): string {
    return getExternalLayoutTreeViewItemId(this.externalLayout);
  }

  getHtmlId(index: number): ?string {
    return `external-layout-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      'external-layout': this.externalLayout.getName(),
    };
  }

  getThumbnail(): ?string {
    return 'res/icons_default/external_layout_black.svg';
  }

  onClick(): void {
    this.props.onOpenExternalLayout(this.externalLayout.getName());
  }

  rename(newName: string): void {
    const oldName = this.externalLayout.getName();
    if (oldName === newName) {
      return;
    }
    this.props.onRenameExternalLayout(oldName, newName);
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  buildMenuTemplate(i18n: I18nType, index: number): any {
    return [
      {
        label: i18n._(t`Move to folder`),
        submenu: buildMoveToFolderSubmenu(
          i18n,
          externalLayoutFoldersKind,
          this.props.project,
          this.folderOrItem,
          () => this._onFolderStructureModified(),
          () => this._addFolderInParent()
        ),
      },
      {
        type: 'separator',
      },
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
        label: getPasteMenuLabel(i18n, externalLayoutFoldersKind),
        enabled: hasFolderOrItemsInClipboard(externalLayoutFoldersKind),
        click: () => this.paste(),
        accelerator: 'CmdOrCtrl+V',
      },
      {
        label: i18n._(t`Duplicate`),
        click: () => this._duplicate(),
      },
    ];
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  delete(): void {
    this.props.onDeleteExternalLayout(this.externalLayout);
  }

  getIndex(): number {
    return getFolderOrItemIndex(this.folderOrItem);
  }

  moveAt(
    destinationIndex: number,
    targetFolder?: gdExternalLayoutFolderOrExternalLayout
  ): void {
    moveFolderOrItemAt(this.folderOrItem, destinationIndex, targetFolder);
    this._onFolderStructureModified();
  }

  copy(): void {
    copyFolderOrItemToClipboard(externalLayoutFoldersKind, this.folderOrItem);
  }

  cut(): void {
    this.copy();
    this.delete();
  }

  paste(): void {
    const pastedContent = pasteFolderOrItemsFromClipboard({
      kind: externalLayoutFoldersKind,
      project: this.props.project,
      destinationFolder: this.folderOrItem.getParent(),
      positionInFolder: this.getIndex() + 1,
    });
    if (!pastedContent) return;

    this._onFolderStructureModified();
    const firstPastedItem = pastedContent.topLevelFolderOrItems[0];
    if (firstPastedItem) {
      this.props.editName(
        getFolderOrItemTreeViewItemId(
          externalLayoutFoldersKind,
          firstPastedItem
        )
      );
    }
    if (pastedContent.createdItems.length > 0)
      this.props.onExternalLayoutAdded();
  }

  _duplicate(): void {
    this.copy();
    this.paste();
  }

  _onProjectItemModified() {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.props.forceUpdate();
  }

  _addFolderInParent(): void {
    addFolderIn(
      {
        ...this.props,
        kind: externalLayoutFoldersKind,
        onProjectItemModified: () => this._onProjectItemModified(),
      },
      this.folderOrItem.getParent()
    );
  }

  /**
   * The tree view caches the children of each item, so it must also be told to
   * rebuild them when the folder structure itself changed.
   */
  _onFolderStructureModified() {
    this._onProjectItemModified();
    this.props.forceUpdateList();
  }

  getRightButton(i18n: I18nType): any {
    return null;
  }
}
