// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  TreeViewItemContent,
} from '.';
import {
  enumerateFoldersInContainer,
  enumerateFoldersInFolder,
  enumerateObjectsInFolder,
  getFoldersAscendanceWithoutRootFolder,
  getObjectFolderOrObjectUnifiedName,
  type ObjectFolderOrObjectWithContext,
} from './EnumerateObjectFolderOrObject';
import {
  addSerializedObjectToObjectsContainer,
  OBJECT_CLIPBOARD_KIND,
} from './ObjectTreeViewItemContent';
import { renderQuickCustomizationMenuItems } from '../QuickCustomization/QuickCustomizationMenuItems';

const gd: libGDevelop = global.gd;

export type ObjectFolderTreeViewItemCallbacks = {|
  onObjectPasted?: gdObject => void,
  onRenameObjectFolderOrObjectWithContextFinish: (
    objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext,
    newName: string,
    cb: (boolean) => void
  ) => void,
|};

export type ObjectFolderTreeViewItemProps = {|
  ...ObjectFolderTreeViewItemCallbacks,
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  onObjectModified: (shouldForceUpdateList: boolean) => void,
  deleteObjectFolderOrObjectWithContext:
    (
      objectFolderOrObjectWithContext: ?ObjectFolderOrObjectWithContext
    ) => Promise<void>,
  expandFolders: (
    objectFolderOrObjectWithContexts: Array<ObjectFolderOrObjectWithContext>
  ) => void,
  addFolder: (items: Array<ObjectFolderOrObjectWithContext>) => void,
  onAddNewObject: (item: ObjectFolderOrObjectWithContext | null) => void,
  onMovedObjectFolderOrObjectToAnotherFolderInSameContainer: (
    objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext
  ) => void,
  forceUpdate: () => void,
|};

export class ObjectFolderTreeViewItemContent implements TreeViewItemContent {
  objectFolder: gdObjectFolderOrObject;
  isGlobal: boolean;
  props: ObjectFolderTreeViewItemProps;

  constructor(
    objectFolder: gdObjectFolderOrObject,
    isGlobal: boolean,
    props: ObjectFolderTreeViewItemProps
  ) {
    this.objectFolder = objectFolder;
    this.isGlobal = isGlobal;
    this.props = props;
  }

  getName(): string | React.Node {
    return this.objectFolder.getFolderName();
  }

  getId(): string {
    // Use the ptr as id since two folders can have the same name.
    // If using folder name, this would need for methods when renaming
    // the folder to keep it open.
    return `object-folder-${this.objectFolder.ptr}`;
  }

  getHtmlId(index: number): ?string {
    return `object-item-${index}`;
  }

  getDataSet(): { [string]: string } {
    return undefined;
  }

  getThumbnail(): ?string {
    return 'FOLDER';
  }

  onClick(): void {
    this.props.onEditEventsFunctionObjectOrSeeDetails(
      this.eventsFunctionsObject
    );
  }

  rename(newName: string): void {
    if (this.getName() === newName) {
      return;
    }

    this.props.onRenameObjectFolderOrObjectWithContextFinish(
      { objectFolderOrObject: this.objectFolder, global: this.isGlobal },
      newName,
      doRename => {
        if (!doRename) return;

        this.props.onObjectModified(false);
      }
    );
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  _getPasteLabel(
    i18n: I18nType,
    {
      isGlobalObject,
      isFolder,
    }: {| isGlobalObject: boolean, isFolder: boolean |}
  ) {
    let translation = t`Paste`;
    if (Clipboard.has(OBJECT_CLIPBOARD_KIND)) {
      const clipboardContent = Clipboard.get(OBJECT_CLIPBOARD_KIND);
      const clipboardObjectName =
        SafeExtractor.extractStringProperty(clipboardContent, 'name') || '';
      translation = isGlobalObject
        ? t`Paste ${clipboardObjectName} as a Global Object inside folder`
        : t`Paste ${clipboardObjectName} inside folder`;
    }
    return i18n._(translation);
  }

  buildMenuTemplate(i18n: I18nType, index: number) {
    const {
      globalObjectsContainer,
      objectsContainer,
      expandFolders,
      addFolder,
      onAddNewObject,
      onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
      forceUpdate,
    } = this.props;

    const container = this.isGlobal ? globalObjectsContainer : objectsContainer;
    if (!container) {
      return [];
    }
    const folderAndPathsInContainer = enumerateFoldersInContainer(container);
    folderAndPathsInContainer.unshift({
      path: i18n._(t`Root folder`),
      folder: container.getRootFolder(),
    });

    const filteredFolderAndPathsInContainer = folderAndPathsInContainer.filter(
      folderAndPath =>
        !folderAndPath.folder.isADescendantOf(this.objectFolder) &&
        folderAndPath.folder !== this.objectFolder
    );
    return [
      {
        label: this._getPasteLabel(i18n, {
          isGlobalObject: this.isGlobal,
          isFolder: true,
        }),
        enabled: Clipboard.has(OBJECT_CLIPBOARD_KIND),
        click: () => this.paste(),
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
        label: i18n._('Move to folder'),
        submenu: filteredFolderAndPathsInContainer.map(({ folder, path }) => ({
          label: path,
          enabled: folder !== this.objectFolder.getParent(),
          click: () => {
            if (folder === this.objectFolder.getParent()) return;
            this.objectFolder
              .getParent()
              .moveObjectFolderOrObjectToAnotherFolder(this.objectFolder, folder, 0);
            onMovedObjectFolderOrObjectToAnotherFolderInSameContainer({
              objectFolderOrObject: folder,
              global: this.isGlobal,
            });
          },
        })),
      },
      ...renderQuickCustomizationMenuItems({
        i18n,
        visibility: this.objectFolder.getQuickCustomizationVisibility(),
        onChangeVisibility: visibility => {
          this.objectFolder.setQuickCustomizationVisibility(visibility);
          forceUpdate();
        },
      }),
      { type: 'separator' },
      {
        label: i18n._(t`Add a new object`),
        click: () =>
          onAddNewObject({
            objectFolderOrObject: this.objectFolder,
            global: this.isGlobal,
          }),
      },
      {
        label: i18n._(t`Add a new folder`),
        click: () =>
          addFolder([
            { objectFolderOrObject: this.objectFolder, global: this.isGlobal },
          ]),
      },
      { type: 'separator' },
      {
        label: i18n._(t`Expand all sub folders`),
        click: () => {
          const subFolders = enumerateFoldersInFolder(this.objectFolder).map(
            folderAndPath => folderAndPath.folder
          );
          expandFolders(
            subFolders.map(folder => ({
              objectFolderOrObject: folder,
              global: this.isGlobal,
            }))
          );
        },
      },
    ];
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  delete(): void {
    this.props.deleteObjectFolderOrObjectWithContext({objectFolderOrObject: this.objectFolder, global: this.isGlobal});
  }

  moveAt(destinationIndex: number): void {
    // TODO
  }

  copy(): void {}

  cut(): void {}

  paste(): void {
    if (!Clipboard.has(OBJECT_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(OBJECT_CLIPBOARD_KIND);
    const serializedObject = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'object'
    );
    const objectName = SafeExtractor.extractStringProperty(
      clipboardContent,
      'name'
    );
    const objectType = SafeExtractor.extractStringProperty(
      clipboardContent,
      'type'
    );
    if (!objectName || !objectType || !serializedObject) return;

    const {
      project,
      globalObjectsContainer,
      objectsContainer,
      onObjectPasted,
      expandFolders,
      onObjectModified
    } = this.props;

    const newObjectWithContext = addSerializedObjectToObjectsContainer({
      project,
      globalObjectsContainer,
      objectsContainer,
      objectName,
      positionObjectFolderOrObjectWithContext: {
        objectFolderOrObject: this.objectFolder,
        global: this.isGlobal,
      },
      objectType,
      serializedObject,
      addInsideFolder: true,
    });

    onObjectModified(false);
    if (onObjectPasted) onObjectPasted(newObjectWithContext.object);
    expandFolders([
      { objectFolderOrObject: this.objectFolder, global: this.isGlobal },
    ]);
  }

  duplicate(): void {}

  getRightButton(i18n: I18nType) {
    return null;
  }
}
