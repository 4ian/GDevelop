// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard from '../Utils/Clipboard';
import { SafeExtractor } from '../Utils/SafeExtractor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  type TreeViewItemContent,
  type TreeItemProps,
  gameplayTestsRootFolderId,
} from '.';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import IconButton from '../UI/IconButton';
import PlayIcon from '../UI/CustomSvgIcons/Preview';

const GAMEPLAY_TEST_CLIPBOARD_KIND = 'Gameplay test';

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
|};

export const getGameplayTestTreeViewItemId = (test: gdTest): string => {
  // Pointers are used because they stay the same even when the names are
  // changed.
  return `gameplay-test-${test.ptr}`;
};

export class GameplayTestTreeViewItemContent implements TreeViewItemContent {
  test: gdTest;
  props: GameplayTestTreeViewItemProps;

  constructor(test: gdTest, props: GameplayTestTreeViewItemProps) {
    this.test = test;
    this.props = props;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return itemContent.getId() === gameplayTestsRootFolderId;
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
        label: i18n._(t`Paste`),
        enabled: Clipboard.has(GAMEPLAY_TEST_CLIPBOARD_KIND),
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
    return this.props.project.getTests().getTestPosition(this.test);
  }

  moveAt(destinationIndex: number): void {
    const originIndex = this.getIndex();
    if (destinationIndex !== originIndex) {
      this.props.project.getTests().moveTest(
        originIndex,
        // When moving the item down, it must not be counted.
        destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
      );
      this._onProjectItemModified();
    }
  }

  copy(): void {
    Clipboard.set(GAMEPLAY_TEST_CLIPBOARD_KIND, {
      test: serializeToJSObject(this.test),
      name: this.test.getName(),
    });
  }

  cut(): void {
    this.copy();
    this.delete();
  }

  paste(): void {
    if (!Clipboard.has(GAMEPLAY_TEST_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(GAMEPLAY_TEST_CLIPBOARD_KIND);
    const copiedTest = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'test'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    if (!name || !copiedTest) return;

    const project = this.props.project;
    const newName = newNameGenerator(name, name =>
      project.getTests().hasTestNamed(name)
    );

    const newTest = project
      .getTests()
      .insertNewTest(newName, this.getIndex() + 1);

    unserializeFromJSObject(newTest, copiedTest, 'unserializeFrom');
    // Unserialization has overwritten the name.
    newTest.setName(newName);

    this._onProjectItemModified();
    this.props.editName(getGameplayTestTreeViewItemId(newTest));
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

  getRightButton(i18n: I18nType): any {
    return null;
  }
}
