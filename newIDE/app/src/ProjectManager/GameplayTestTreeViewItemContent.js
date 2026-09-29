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
  gameplayTestsRootFolderId,
} from '.';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import IconButton from '../UI/IconButton';
import PlayIcon from '../UI/CustomSvgIcons/Preview';

export type GameplayTestTreeViewItemCallbacks = {|
  onDeleteGameplayTest: gdTest => void,
  onRenameGameplayTest: (string, string) => void,
  onOpenGameplayTest: string => void,
  onRunGameplayTest: string => void | Promise<void>,
|};

export type GameplayTestTreeViewItemCommonProps = {|
  ...TreeItemProps,
  ...GameplayTestTreeViewItemCallbacks,
|};

export type GameplayTestTreeViewItemProps = {|
  ...GameplayTestTreeViewItemCommonProps,
  project: gdProject,
  expandFolders: (folderIds: Array<string>) => void,
|};

export const getGameplayTestTreeViewItemId = (test: gdTest): string => {
  // Pointers are used because they stay the same even when the names are
  // changed.
  return `gameplay-test-${test.ptr}`;
};

export const gameplayTestFoldersKind: ProjectItemFoldersKind = {
  name: 'gameplay-test',
  getRootId: () => gameplayTestsRootFolderId,
  getRootFolder: project => project.getTests().getRootFolder(),
  hasItemNamed: (project, name) => project.getTests().hasTestNamed(name),
  getItemTreeViewItemId: getGameplayTestTreeViewItemId,
  insertItemFromSerializedContent: (project, name, serializedItem) => {
    const newTest = project
      .getTests()
      .insertNewTest(name, project.getTests().getTestsCount());
    unserializeFromJSObject(newTest, serializedItem, 'unserializeFrom');
    // Unserialization has overwritten the name.
    newTest.setName(name);
    return newTest;
  },
  legacyClipboard: { kind: 'Gameplay test', itemProperty: 'test' },
  addItemLabel: t`Add a gameplay test`,
  removeFolderMessage: t`The gameplay tests and folders it contains will be moved out of it, not removed. Do you want to continue?`,
};

export class GameplayTestTreeViewItemContent implements TreeViewItemContent {
  test: gdTest;
  // The node of the folder structure holding this item.
  folderOrItem: gdTestFolderOrTest;
  props: GameplayTestTreeViewItemProps;

  constructor(
    test: gdTest,
    folderOrItem: gdTestFolderOrTest,
    props: GameplayTestTreeViewItemProps
  ) {
    this.test = test;
    this.folderOrItem = folderOrItem;
    this.props = props;
  }

  getFolderOrItem(): gdTestFolderOrTest {
    return this.folderOrItem;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return isFolderOrItemDescendantOf(
      gameplayTestFoldersKind,
      this.folderOrItem,
      itemContent
    );
  }

  getRootId(): string {
    return gameplayTestsRootFolderId;
  }

  getName(): string | React.Node {
    return this.test.getName();
  }

  getId(): string {
    return getGameplayTestTreeViewItemId(this.test);
  }

  getHtmlId(index: number): ?string {
    return `gameplay-test-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      'gameplay-test': this.test.getName(),
    };
  }

  getThumbnail(): ?string {
    return null;
  }

  onClick(): void {
    this.props.onOpenGameplayTest(this.test.getName());
  }

  rename(newName: string): void {
    const oldName = this.test.getName();
    if (oldName === newName) {
      return;
    }
    this.props.onRenameGameplayTest(oldName, newName);
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  buildMenuTemplate(i18n: I18nType, index: number): any {
    return [
      {
        label: i18n._(t`Run`),
        click: () => this.props.onRunGameplayTest(this.test.getName()),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Move to folder`),
        submenu: buildMoveToFolderSubmenu(
          i18n,
          gameplayTestFoldersKind,
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
        label: getPasteMenuLabel(i18n, gameplayTestFoldersKind),
        enabled: hasFolderOrItemsInClipboard(gameplayTestFoldersKind),
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
    return (
      <IconButton
        size="small"
        onClick={(e: any) => {
          e.stopPropagation();
          this.props.onRunGameplayTest(this.test.getName());
        }}
        tooltip={t`Run the test`}
      >
        <PlayIcon fontSize="small" />
      </IconButton>
    );
  }

  delete(): void {
    this.props.onDeleteGameplayTest(this.test);
  }

  getIndex(): number {
    return getFolderOrItemIndex(this.folderOrItem);
  }

  moveAt(destinationIndex: number, targetFolder?: gdTestFolderOrTest): void {
    moveFolderOrItemAt(this.folderOrItem, destinationIndex, targetFolder);
    this._onFolderStructureModified();
  }

  copy(): void {
    copyFolderOrItemToClipboard(gameplayTestFoldersKind, this.folderOrItem);
  }

  cut(): void {
    this.copy();
    this.delete();
  }

  paste(): void {
    const pastedContent = pasteFolderOrItemsFromClipboard({
      kind: gameplayTestFoldersKind,
      project: this.props.project,
      destinationFolder: this.folderOrItem.getParent(),
      positionInFolder: this.getIndex() + 1,
    });
    if (!pastedContent) return;

    this._onFolderStructureModified();
    const firstPastedItem = pastedContent.topLevelFolderOrItems[0];
    if (firstPastedItem) {
      this.props.editName(
        getFolderOrItemTreeViewItemId(gameplayTestFoldersKind, firstPastedItem)
      );
    }
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
        kind: gameplayTestFoldersKind,
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
