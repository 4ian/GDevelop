// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { unserializeFromJSObject } from '../Utils/Serializer';
import { ProjectItemInFolder } from './ProjectItemInFolder';
import { type ProjectItemFoldersKind } from './ProjectItemFolders';
import {
  type TreeViewItemContent,
  type TreeItemProps,
  externalEventsRootFolderId,
} from '.';
import { type HTMLDataset } from '../Utils/HTMLDataset';

export type ExternalEventsTreeViewItemCallbacks = {|
  onDeleteExternalEvents: gdExternalEvents => void,
  onRenameExternalEvents: (string, string) => void,
  onOpenExternalEvents: string => void,
|};

export type ExternalEventsTreeViewItemCommonProps = {|
  ...TreeItemProps,
  ...ExternalEventsTreeViewItemCallbacks,
|};

export type ExternalEventsTreeViewItemProps = {|
  ...ExternalEventsTreeViewItemCommonProps,
  project: gdProject,
  expandFolders: (folderIds: Array<string>) => void,
|};

export const getExternalEventsTreeViewItemId = (
  externalEvents: gdExternalEvents
): string => {
  // Pointers are used because they stay the same even when the names are
  // changed.
  return `external-events-${externalEvents.ptr}`;
};

export const externalEventsFoldersKind: ProjectItemFoldersKind = {
  name: 'external-events',
  getRootId: () => externalEventsRootFolderId,
  getRootFolder: project => project.getExternalEventsRootFolder(),
  hasItemNamed: (project, name) => project.hasExternalEventsNamed(name),
  getItemTreeViewItemId: getExternalEventsTreeViewItemId,
  insertItemFromSerializedContent: (project, name, serializedItem) => {
    const newExternalEvents = project.insertNewExternalEvents(
      name,
      project.getExternalEventsCount()
    );
    unserializeFromJSObject(
      newExternalEvents,
      serializedItem,
      'unserializeFrom',
      project
    );
    // Unserialization has overwritten the name.
    newExternalEvents.setName(name);
    return newExternalEvents;
  },
  legacyClipboard: { kind: 'External events', itemProperty: 'externalEvents' },
  addItemLabel: t`Add external events`,
  removeFolderMessage: t`The external events and folders it contains will be moved out of it, not removed. Do you want to continue?`,
};

export class ExternalEventsTreeViewItemContent implements TreeViewItemContent {
  externalEvents: gdExternalEvents;
  // The node of the folder structure holding this item.
  folderOrItem: gdExternalEventsFolderOrExternalEvents;
  inFolder: ProjectItemInFolder;
  props: ExternalEventsTreeViewItemProps;

  constructor(
    externalEvents: gdExternalEvents,
    folderOrItem: gdExternalEventsFolderOrExternalEvents,
    props: ExternalEventsTreeViewItemProps
  ) {
    this.externalEvents = externalEvents;
    this.folderOrItem = folderOrItem;
    this.inFolder = new ProjectItemInFolder(
      externalEventsFoldersKind,
      folderOrItem,
      props
    );
    this.props = props;
  }

  getFolderOrItem(): gdExternalEventsFolderOrExternalEvents {
    return this.folderOrItem;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return this.inFolder.isDescendantOf(itemContent);
  }

  getRootId(): string {
    return externalEventsRootFolderId;
  }

  getName(): string | React.Node {
    return this.externalEvents.getName();
  }

  getId(): string {
    return getExternalEventsTreeViewItemId(this.externalEvents);
  }

  getHtmlId(index: number): ?string {
    return `external-events-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      'external-events': this.externalEvents.getName(),
    };
  }

  getThumbnail(): ?string {
    return 'res/icons_default/external_events_black.svg';
  }

  onClick(): void {
    this.props.onOpenExternalEvents(this.externalEvents.getName());
  }

  rename(newName: string): void {
    const oldName = this.externalEvents.getName();
    if (oldName === newName) {
      return;
    }
    this.props.onRenameExternalEvents(oldName, newName);
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
    this.props.onDeleteExternalEvents(this.externalEvents);
  }

  getIndex(): number {
    return this.inFolder.getIndex();
  }

  moveAt(
    destinationIndex: number,
    targetFolder?: gdExternalEventsFolderOrExternalEvents
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
