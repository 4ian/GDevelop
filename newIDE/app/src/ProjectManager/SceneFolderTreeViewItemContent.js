// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
// $FlowFixMe[import-type-as-value]
import { TreeViewItemContent, type TreeItemProps, scenesRootFolderId } from '.';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import {
  getSceneFolderTreeViewItemId,
  getSceneFolderIdFromTreeViewItemId,
} from './SceneFolderUtils';

export type SceneFolderTreeViewItemCallbacks = {|
  onRenameSceneFolder: (folderId: string, newName: string) => void,
  onDeleteSceneFolder: (folderId: string) => void,
  onAddSceneFolder: (parentFolderId: ?string, defaultName: string) => void,
  isFolderDescendantOf: (folderId: string, ancestorFolderId: string) => boolean,
  getFolderIndex: (folderId: string) => number,
|};

export type SceneFolderTreeViewItemProps = {|
  ...TreeItemProps,
  ...SceneFolderTreeViewItemCallbacks,
|};

export type SceneFolder = {|
  id: string,
  name: string,
  childFolderIds: Array<string>,
  sceneNames: Array<string>,
|};

export class SceneFolderTreeViewItemContent implements TreeViewItemContent {
  folder: SceneFolder;
  props: SceneFolderTreeViewItemProps;

  constructor(folder: SceneFolder, props: SceneFolderTreeViewItemProps) {
    this.folder = folder;
    this.props = props;
  }

  getName(): string | React.Node {
    return this.folder.name;
  }

  getId(): string {
    return getSceneFolderTreeViewItemId(this.folder.id);
  }

  getHtmlId(index: number): ?string {
    return null;
  }

  getDataSet(): ?HTMLDataset {
    return {
      sceneFolderId: this.folder.id,
    };
  }

  getThumbnail(): ?string {
    return 'FOLDER';
  }

  onClick(): void {}

  rename(newName: string): void {
    if (this.folder.name === newName) return;
    this.props.onRenameSceneFolder(this.folder.id, newName);
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  delete(): void {
    this.props.onDeleteSceneFolder(this.folder.id);
  }

  copy(): void {}

  paste(): void {}

  cut(): void {}

  getIndex(): number {
    return this.props.getFolderIndex(this.folder.id);
  }

  moveAt(destinationIndex: number): void {}

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    const ancestorId = getSceneFolderIdFromTreeViewItemId(itemContent.getId());
    if (!ancestorId) return itemContent.getId() === scenesRootFolderId;
    return this.props.isFolderDescendantOf(this.folder.id, ancestorId);
  }

  getRootId(): string {
    return scenesRootFolderId;
  }

  buildMenuTemplate(i18n: I18nType, index: number): any {
    return [
      {
        label: i18n._(t`Add subfolder`),
        click: () =>
          this.props.onAddSceneFolder(this.folder.id, i18n._(t`New folder`)),
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
    ];
  }

  getRightButton(i18n: I18nType): any {
    return null;
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return null;
  }
}
