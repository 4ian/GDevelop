// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import * as React from 'react';
import Clipboard from '../Utils/Clipboard';
import { SafeExtractor } from '../Utils/SafeExtractor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { TreeViewItemContent, externalLayoutsRootFolderId } from '.';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import newNameGenerator from '../Utils/NewNameGenerator';
import { getExternalLayoutTreeViewItemId } from './ExternalLayoutTreeViewItemContent';

const EXTERNAL_LAYOUT_FOLDER_CLIPBOARD_KIND = 'ExternalLayoutFolder';

export type ExternalLayoutFolderTreeViewItemProps = {|
  project: gdProject,
  forceUpdate: () => void,
  forceUpdateList: () => void,
  editName: (itemId: string) => void,
  scrollToItem: (itemId: string) => void,
  onProjectItemModified: () => void,
  showDeleteConfirmation: (options: any) => Promise<boolean>,
  expandFolders: (folderIds: string[]) => void,
|};

export const getExternalLayoutFolderTreeViewItemId = (
  folder: gdExternalLayoutFolderOrLayout
): string => {
  return `external-layout-folder-${folder.ptr}`;
};

export class ExternalLayoutFolderTreeViewItemContent
  implements TreeViewItemContent {
  folder: gdExternalLayoutFolderOrLayout;
  props: ExternalLayoutFolderTreeViewItemProps;

  constructor(
    folder: gdExternalLayoutFolderOrLayout,
    props: ExternalLayoutFolderTreeViewItemProps
  ) {
    this.folder = folder;
    this.props = props;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    if (itemContent.getId() === externalLayoutsRootFolderId) return true;

    let currentParent = this.folder.getParent();
    while (currentParent && !currentParent.isRootFolder()) {
      if (
        getExternalLayoutFolderTreeViewItemId(currentParent) ===
        itemContent.getId()
      ) {
        return true;
      }
      currentParent = currentParent.getParent();
    }
    return false;
  }

  getRootId(): string {
    return externalLayoutsRootFolderId;
  }

  getName(): string | React.Node {
    return this.folder.getFolderName();
  }

  getId(): string {
    return getExternalLayoutFolderTreeViewItemId(this.folder);
  }

  getHtmlId(index: number): ?string {
    return `external-layout-folder-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      'external-layout-folder': this.folder.getFolderName(),
    };
  }

  getThumbnail(): ?string {
    return 'res/icons_default/folder_black.svg';
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

  buildMenuTemplate(i18n: I18nType, index: number) {
    return [
      {
        label: i18n._(t`Add external layout`),
        click: () => this._addExternalLayout(i18n),
      },
      {
        label: i18n._(t`Add folder`),
        click: () => this._addFolder(),
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
        enabled: Clipboard.has(EXTERNAL_LAYOUT_FOLDER_CLIPBOARD_KIND),
        click: () => this.paste(),
        accelerator: 'CmdOrCtrl+V',
      },
    ];
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  getRightButton(i18n: I18nType) {
    return null;
  }

  delete(): void {
    const { showDeleteConfirmation, onProjectItemModified } = this.props;

    showDeleteConfirmation({
      title: t`Remove folder`,
      message: t`Are you sure you want to remove this folder? External layouts inside will be moved to the parent folder.`,
    }).then(answer => {
      if (!answer) return;

      const parent = this.folder.getParent();
      if (!parent) return;

      parent.removeFolderChild(this.folder);
      onProjectItemModified();
    });
  }

  getIndex(): number {
    const parent = this.folder.getParent();
    if (!parent) return 0;
    return parent.getChildPosition(this.folder);
  }

  moveAt(destinationIndex: number): void {
    const originIndex = this.getIndex();
    if (destinationIndex !== originIndex) {
      const parent = this.folder.getParent();
      if (parent) {
        parent.moveChild(
          originIndex,
          // When moving the item down, it must not be counted.
          destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
        );
        this.props.onProjectItemModified();
      }
    }
  }

  copy(): void {
    Clipboard.set(EXTERNAL_LAYOUT_FOLDER_CLIPBOARD_KIND, {
      folder: serializeToJSObject(this.folder),
      name: this.folder.getFolderName(),
    });
  }

  cut(): void {
    this.copy();
    this.delete();
  }

  paste(): void {
    if (!Clipboard.has(EXTERNAL_LAYOUT_FOLDER_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(
      EXTERNAL_LAYOUT_FOLDER_CLIPBOARD_KIND
    );
    const copiedFolder = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'folder'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    if (!name || !copiedFolder) return;

    const newName = newNameGenerator(name, name => this._hasFolderNamed(name));

    const newFolder = this.folder.insertNewFolder(newName, 0);
    unserializeFromJSObject(newFolder, copiedFolder);
    // Unserialization has overwritten the name.
    newFolder.setFolderName(newName);

    this.props.onProjectItemModified();
    this.props.editName(getExternalLayoutFolderTreeViewItemId(newFolder));
  }

  _addExternalLayout(i18n: I18nType): void {
    const {
      project,
      onProjectItemModified,
      editName,
      scrollToItem,
    } = this.props;

    const newName = newNameGenerator(
      i18n._(t`Untitled external layout`),
      name => project.hasExternalLayoutNamed(name)
    );

    const newExternalLayout = project.insertNewExternalLayout(
      newName,
      project.getExternalLayoutsCount()
    );
    newExternalLayout.setName(newName);

    this.folder.insertItem(newExternalLayout, 0);

    onProjectItemModified();

    this.props.expandFolders([this.getId()]);

    setTimeout(() => {
      scrollToItem(getExternalLayoutTreeViewItemId(newExternalLayout));
    }, 100);
  }

  _addFolder(): void {
    const { onProjectItemModified, editName, expandFolders } = this.props;

    const newFolderName = newNameGenerator('NewFolder', name =>
      this._hasFolderNamed(name)
    );

    const newFolder = this.folder.insertNewFolder(newFolderName, 0);

    onProjectItemModified();
    expandFolders([this.getId()]);
    editName(getExternalLayoutFolderTreeViewItemId(newFolder));
  }

  _hasFolderNamed(name: string): boolean {
    const childrenCount = this.folder.getChildrenCount
      ? this.folder.getChildrenCount()
      : 0;

    for (let i = 0; i < childrenCount; i++) {
      const child = this.folder.getChildAt(i);
      if (child && child.isFolder && child.isFolder()) {
        if (child.getFolderName && child.getFolderName() === name) {
          return true;
        }
      }
    }

    return false;
  }
}
