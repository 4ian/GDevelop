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
  externalsRootFolderId,
  externalLayoutsRootFolderId,
  getSceneExternalsTreeViewItemId,
  scenesRootFolderId,
} from '.';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import { type ProjectItemUsageTarget } from './ProjectItemUsageFinder';
import { getSceneTreeViewItemId } from './SceneTreeViewItemContent';

const EXTERNAL_LAYOUT_CLIPBOARD_KIND = 'External layout';

const styles = {
  kindBadge: {
    border: '1px solid',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 600,
    lineHeight: '16px',
    padding: '0 6px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
};

export type ExternalLayoutTreeViewItemCallbacks = {|
  onExternalLayoutAdded: () => void,
  onDeleteExternalLayout: gdExternalLayout => void,
  onRenameExternalLayout: (string, string) => void,
  onOpenExternalLayout: string => void,
|};

type ProjectItemUsageCallbacks = {|
  onFindUsage: ProjectItemUsageTarget => void,
|};

export type ExternalLayoutTreeViewItemCommonProps = {|
  ...TreeItemProps,
  ...ExternalLayoutTreeViewItemCallbacks,
  ...ProjectItemUsageCallbacks,
|};

export type ExternalLayoutTreeViewItemProps = {|
  ...ExternalLayoutTreeViewItemCommonProps,
  project: gdProject,
|};

export const getExternalLayoutTreeViewItemId = (
  externalLayout: gdExternalLayout
): string => {
  // Pointers are used because they stay the same even when the names are
  // changed.
  return `external-layout-${externalLayout.ptr}`;
};

export class ExternalLayoutTreeViewItemContent implements TreeViewItemContent {
  externalLayout: gdExternalLayout;
  props: ExternalLayoutTreeViewItemProps;

  constructor(
    externalLayout: gdExternalLayout,
    props: ExternalLayoutTreeViewItemProps
  ) {
    this.externalLayout = externalLayout;
    this.props = props;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    const itemId = itemContent.getId();
    const associatedScene = this._getAssociatedScene();
    return associatedScene
      ? itemId === scenesRootFolderId ||
          itemId === getSceneTreeViewItemId(associatedScene) ||
          itemId === getSceneExternalsTreeViewItemId(associatedScene)
      : itemId === externalsRootFolderId;
  }

  getRootId(): string {
    const associatedScene = this._getAssociatedScene();
    return associatedScene
      ? `${externalLayoutsRootFolderId}-${associatedScene.ptr}`
      : externalLayoutsRootFolderId;
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
        label: i18n._(t`Find usage`),
        click: () =>
          this.props.onFindUsage({
            kind: 'external-layout',
            externalLayout: this.externalLayout,
          }),
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
        enabled: Clipboard.has(EXTERNAL_LAYOUT_CLIPBOARD_KIND),
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
      <span
        style={{
          ...styles.kindBadge,
          backgroundColor: this.props.gdevelopTheme.listItem.backgroundColor,
          borderColor: this.props.gdevelopTheme.listItem.separatorColor,
          color: this.props.gdevelopTheme.text.color.secondary,
        }}
      >
        {i18n._(t`Layout`)}
      </span>
    );
  }

  delete(): void {
    this.props.onDeleteExternalLayout(this.externalLayout);
  }

  getIndex(): number {
    return this.props.project.getExternalLayoutPosition(
      this.externalLayout.getName()
    );
  }

  moveAt(destinationIndex: number): void {
    const originIndex = this.getIndex();
    if (destinationIndex !== originIndex) {
      this.props.project.moveExternalLayout(
        originIndex,
        // When moving the item down, it must not be counted.
        destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
      );
      this._onProjectItemModified();
    }
  }

  copy(): void {
    Clipboard.set(EXTERNAL_LAYOUT_CLIPBOARD_KIND, {
      externalLayout: serializeToJSObject(this.externalLayout),
      name: this.externalLayout.getName(),
    });
  }

  cut(): void {
    this.copy();
    this.delete();
  }

  paste(): void {
    if (!Clipboard.has(EXTERNAL_LAYOUT_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(EXTERNAL_LAYOUT_CLIPBOARD_KIND);
    const copiedExternalLayout = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'externalLayout'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    if (!name || !copiedExternalLayout) return;

    const project = this.props.project;
    const newName = newNameGenerator(name, name =>
      project.hasExternalLayoutNamed(name)
    );

    const newExternalLayout = project.insertNewExternalLayout(
      newName,
      this.getIndex() + 1
    );

    unserializeFromJSObject(
      newExternalLayout,
      copiedExternalLayout,
      'unserializeFrom',
      project
    );
    // Unserialization has overwritten the name.
    newExternalLayout.setName(newName);

    this._onProjectItemModified();
    this.props.editName(getExternalLayoutTreeViewItemId(newExternalLayout));
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

  _getAssociatedScene(): ?gdLayout {
    const associatedLayoutName = this.externalLayout.getAssociatedLayout();
    return this.props.project.hasLayoutNamed(associatedLayoutName)
      ? this.props.project.getLayout(associatedLayoutName)
      : null;
  }

  getRightButton(i18n: I18nType): any {
    return null;
  }
}
