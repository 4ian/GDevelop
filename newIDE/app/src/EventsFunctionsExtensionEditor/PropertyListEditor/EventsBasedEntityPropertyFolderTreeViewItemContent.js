// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import Clipboard from '../../Utils/Clipboard';
import { SafeExtractor } from '../../Utils/SafeExtractor';
import {
  TreeViewItemContent,
  type TreeItemProps,
  propertiesRootFolderId,
  sharedPropertiesRootFolderId,
} from '.';
import {
  enumerateFoldersInContainer,
  enumerateFoldersInFolder,
  enumeratePropertiesInFolder,
} from './EnumeratePropertyFolderOrProperty';
import {
  pasteProperties,
  PROPERTIES_CLIPBOARD_KIND,
} from './EventsBasedEntityPropertyTreeViewItemContent';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { type HTMLDataset } from '../../Utils/HTMLDataset';

const gd: libGDevelop = global.gd;

export const expandAllSubfolders = (
  propertyFolder: gdPropertyFolderOrProperty,
  expandFolders: (
    propertyFolderOrPropertyList: Array<gdPropertyFolderOrProperty>
  ) => void
) => {
  const subFolders = enumerateFoldersInFolder(propertyFolder).map(
    folderAndPath => folderAndPath.folder
  );
  expandFolders([propertyFolder, ...subFolders].map(folder => folder));
};

export type EventsBasedEntityPropertyFolderTreeViewItemProps = {|
  ...TreeItemProps,
  project: gdProject,
  properties: gdPropertiesContainer,
  isSharedProperties: boolean,
  editName: (itemId: string) => void,
  onPropertiesUpdated: () => void,
  showPropertyOverridingConfirmation: (
    existingPropertyNames: string[]
  ) => Promise<boolean>,
  expandFolders: (
    propertyFolderOrPropertyList: Array<gdPropertyFolderOrProperty>
  ) => void,
  addFolder: (
    items: Array<gdPropertyFolderOrProperty>,
    isSharedProperties: boolean
  ) => void,
  addProperty: (
    properties: gdPropertiesContainer,
    isSharedProperties: boolean,
    parentFolder: gdPropertyFolderOrProperty,
    index: number
  ) => void,
  onMovedPropertyFolderOrPropertyToAnotherFolderInSameContainer: (
    propertyFolderOrProperty: gdPropertyFolderOrProperty,
    isSharedProperties: boolean
  ) => void,
  showDeleteConfirmation: (options: any) => Promise<boolean>,
  setSelectedPropertyFolderOrProperty: (
    propertyFolderOrProperty: gdPropertyFolderOrProperty | null,
    isSharedProperties: boolean
  ) => void,
|};

export const getEventsBasedEntityPropertyFolderTreeViewItemId = (
  propertyFolder: gdPropertyFolderOrProperty
): string => {
  // Use the ptr as id since two folders can have the same name.
  // If using folder name, this would need for methods when renaming
  // the folder to keep it open.
  return `property-folder-${propertyFolder.ptr}`;
};

export class EventsBasedEntityPropertyFolderTreeViewItemContent
  implements TreeViewItemContent {
  propertyFolder: gdPropertyFolderOrProperty;
  props: EventsBasedEntityPropertyFolderTreeViewItemProps;

  constructor(
    propertyFolder: gdPropertyFolderOrProperty,
    props: EventsBasedEntityPropertyFolderTreeViewItemProps
  ) {
    this.propertyFolder = propertyFolder;
    this.props = props;
  }

  getPropertyFolderOrProperty(): gdPropertyFolderOrProperty | null {
    return this.propertyFolder;
  }

  isDescendantOf(treeViewItemContent: TreeViewItemContent): boolean {
    const propertyFolderOrProperty = treeViewItemContent.getPropertyFolderOrProperty();
    return (
      !!propertyFolderOrProperty &&
      this.propertyFolder.isADescendantOf(propertyFolderOrProperty)
    );
  }

  isSibling(treeViewItemContent: TreeViewItemContent): boolean {
    const propertyFolderOrProperty = treeViewItemContent.getPropertyFolderOrProperty();
    return (
      !!propertyFolderOrProperty &&
      this.propertyFolder.getParent() === propertyFolderOrProperty.getParent()
    );
  }

  getRootId(): string {
    return this.props.isSharedProperties
      ? sharedPropertiesRootFolderId
      : propertiesRootFolderId;
  }

  getIndex(): number {
    return this.propertyFolder
      .getParent()
      .getChildPosition(this.propertyFolder);
  }

  getName(): string | React.Node {
    return this.propertyFolder.getFolderName();
  }

  getId(): string {
    return getEventsBasedEntityPropertyFolderTreeViewItemId(
      this.propertyFolder
    );
  }

  getHtmlId(index: number): ?string {
    return null;
  }

  getDataSet(): ?HTMLDataset {
    return {
      folderName: this.propertyFolder.getFolderName(),
      isSharedProperties: this.props.isSharedProperties ? 'true' : 'false',
    };
  }

  getThumbnail(): ?string {
    return 'FOLDER';
  }

  onClick(): void {}

  rename(newName: string): void {
    if (this.getName() === newName) {
      return;
    }
    this.propertyFolder.setFolderName(newName);
    this.props.onPropertiesUpdated();
  }

  edit(): void {}

  _getPasteLabel(i18n: I18nType) {
    let translation = t`Paste`;
    if (Clipboard.has(PROPERTIES_CLIPBOARD_KIND)) {
      const clipboardContent = Clipboard.get(PROPERTIES_CLIPBOARD_KIND);
      const clipboardObjectName =
        SafeExtractor.extractStringProperty(clipboardContent, 'name') || '';
      translation = t`Paste ${clipboardObjectName} inside folder`;
    }
    return i18n._(translation);
  }

  buildMenuTemplate(i18n: I18nType, index: number) {
    const {
      properties,
      isSharedProperties,
      expandFolders,
      addFolder,
      addProperty,
      onMovedPropertyFolderOrPropertyToAnotherFolderInSameContainer,
    } = this.props;

    const folderAndPathsInContainer = enumerateFoldersInContainer(properties);
    folderAndPathsInContainer.unshift({
      path: i18n._(t`Root folder`),
      folder: properties.getRootFolder(),
    });

    const filteredFolderAndPathsInContainer = folderAndPathsInContainer.filter(
      folderAndPath =>
        !folderAndPath.folder.isADescendantOf(this.propertyFolder) &&
        folderAndPath.folder !== this.propertyFolder
    );
    return [
      {
        label: this._getPasteLabel(i18n),
        enabled: Clipboard.has(PROPERTIES_CLIPBOARD_KIND),
        click: () => this.paste(),
      },
      {
        label: i18n._(t`Rename`),
        click: () => this.props.editName(this.getId()),
        accelerator: 'F2',
      },
      {
        label: i18n._(t`Delete`),
        click: () => this.delete(),
        accelerator: 'Backspace',
      },
      {
        label: i18n._('Move to folder'),
        submenu: [
          ...filteredFolderAndPathsInContainer.map(({ folder, path }) => ({
            label: path,
            enabled: folder !== this.propertyFolder.getParent(),
            click: () => {
              if (folder === this.propertyFolder.getParent()) return;
              this.propertyFolder
                .getParent()
                .movePropertyFolderOrPropertyToAnotherFolder(
                  this.propertyFolder,
                  folder,
                  0
                );
              onMovedPropertyFolderOrPropertyToAnotherFolderInSameContainer(
                folder,
                this.props.isSharedProperties
              );
            },
          })),

          { type: 'separator' },
          {
            label: i18n._(t`Create new folder...`),
            click: () =>
              addFolder([this.propertyFolder.getParent()], isSharedProperties),
          },
        ],
      },
      { type: 'separator' },
      {
        label: i18n._(t`Add a new property`),
        click: () =>
          addProperty(
            this.props.properties,
            this.props.isSharedProperties,
            this.propertyFolder,
            0
          ),
      },
      {
        label: i18n._(t`Add a new folder`),
        click: () => addFolder([this.propertyFolder], isSharedProperties),
      },
      { type: 'separator' },
      {
        label: i18n._(t`Expand all sub folders`),
        click: () => expandAllSubfolders(this.propertyFolder, expandFolders),
      },
    ];
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  delete(): void {
    this._delete();
  }

  async _delete(): Promise<void> {
    const {
      properties,
      forceUpdateList,
      showDeleteConfirmation,
      setSelectedPropertyFolderOrProperty,
    } = this.props;

    const propertiesToDelete = enumeratePropertiesInFolder(this.propertyFolder);
    if (propertiesToDelete.length === 0) {
      // Folder is empty or contains only empty folders.
      setSelectedPropertyFolderOrProperty(null, false);
      this.propertyFolder.getParent().removeFolderChild(this.propertyFolder);
      forceUpdateList();
      return;
    }

    let message: MessageDescriptor;
    let title: MessageDescriptor;
    if (propertiesToDelete.length === 1) {
      message = t`Are you sure you want to remove this folder and with it the property ${propertiesToDelete[0].getName()}? This can't be undone.`;
      title = t`Remove folder and property`;
    } else {
      message = t`Are you sure you want to remove this folder and all its properties (${propertiesToDelete
        .map(property => property.getName())
        .join(', ')})? This can't be undone.`;
      title = t`Remove folder and properties`;
    }

    const answer = await showDeleteConfirmation({ message, title });
    if (!answer) return;

    // TODO: Change selectedPropertyFolderOrPropertyWithContext so that it's easy
    // to remove an item using keyboard only and to navigate with the arrow
    // keys right after deleting it.
    setSelectedPropertyFolderOrProperty(null, false);

    for (const propertyToDelete of propertiesToDelete) {
      properties.remove(propertyToDelete.getName());
    }
    this.propertyFolder.getParent().removeFolderChild(this.propertyFolder);
    this._onProjectItemModified();
  }

  copy(): void {}

  cut(): void {}

  paste(): void {
    this.pasteAsync();
  }

  async pasteAsync(): Promise<void> {
    const hasPasteAnyProperty = await pasteProperties(
      this.props.properties,
      this.propertyFolder,
      this.getIndex() + 1,
      this.props.showPropertyOverridingConfirmation
    );
    if (hasPasteAnyProperty) {
      this._onProjectItemModified();
      this.props.expandFolders([this.propertyFolder]);
    }
  }

  duplicate(): void {}

  _onProjectItemModified() {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.props.forceUpdate();
    this.props.onPropertiesUpdated();
  }

  getRightButton(i18n: I18nType) {
    return null;
  }
}
