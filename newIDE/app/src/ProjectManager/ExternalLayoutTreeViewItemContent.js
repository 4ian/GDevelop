// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { unserializeFromJSObject } from '../Utils/Serializer';
import { ProjectItemInFolder } from './ProjectItemInFolder';
import {
  type ProjectItemFoldersKind,
  type ProjectItemFolderOrItem,
} from './ProjectItemFolders';
import {
  type TreeViewItemContent,
  type TreeItemProps,
  externalLayoutsRootFolderId,
} from '.';
import { type HTMLDataset } from '../Utils/HTMLDataset';

export type ExternalLayoutTreeViewItemCallbacks = {|
  onExternalLayoutAdded: () => void,
  // Resolves to true once removed (after the user confirmed).
  onDeleteExternalLayouts: (Array<gdExternalLayout>) => Promise<boolean>,
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
  folderOrItem: ProjectItemFolderOrItem;
  inFolder: ProjectItemInFolder;
  props: ExternalLayoutTreeViewItemProps;

  constructor(
    externalLayout: gdExternalLayout,
    folderOrItem: ProjectItemFolderOrItem,
    props: ExternalLayoutTreeViewItemProps
  ) {
    this.externalLayout = externalLayout;
    this.folderOrItem = folderOrItem;
    this.inFolder = new ProjectItemInFolder(
      externalLayoutFoldersKind,
      folderOrItem,
      props,
      () => props.onExternalLayoutAdded()
    );
    this.props = props;
  }

  getFolderOrItem(): ProjectItemFolderOrItem {
    return this.folderOrItem;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return this.inFolder.isDescendantOf(itemContent);
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
      this.inFolder.buildMoveToFolderMenuItem(i18n),
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
      this.inFolder.buildPasteMenuItem(i18n, () => this.paste()),
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
    this.props.onDeleteExternalLayouts([this.externalLayout]);
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

  cut(): void {
    this.copy();
    this.delete();
  }

  paste(): void {
    this.inFolder.paste();
  }

  _duplicate(): void {
    this.copy();
    this.paste();
  }

  getRightButton(i18n: I18nType): any {
    return null;
  }
}
