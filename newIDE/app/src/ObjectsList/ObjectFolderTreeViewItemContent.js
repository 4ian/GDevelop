// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import * as React from 'react';
import Clipboard from '../Utils/Clipboard';
import { SafeExtractor } from '../Utils/SafeExtractor';
import { type TreeViewItemContent } from '.';
import {
  enumerateFoldersInContainer,
  enumerateFoldersInFolder,
  enumerateObjectsInFolder,
  type ObjectFolderOrObjectWithContext,
} from './EnumerateObjectFolderOrObject';
import {
  addSerializedObjectToObjectsContainer,
  OBJECT_CLIPBOARD_KIND,
} from './ObjectTreeViewItemContent';
import { renderQuickCustomizationMenuItems } from '../QuickCustomization/QuickCustomizationMenuItems';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import type { ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import { exceptionallyGuardAgainstDeadObject } from '../Utils/IsNullPtr';

const gd: libGDevelop = global.gd;

// Builds a stable path key like "Root/Enemies/Boss" by walking up the folder tree.
// This key survives page reloads, unlike objectFolder.ptr which is a memory address.
const getFolderStableKey = (
  objectFolder: gdObjectFolderOrObject,
  isGlobal: boolean
): string => {
  const parts: Array<string> = [];
  let current = objectFolder;
  try {
    while (current && !current.isRootFolder()) {
      parts.unshift(current.getFolderName());
      current = current.getParent();
    }
  } catch (e) {
    // fallback: if walking fails, use the folder name only
    parts.unshift(objectFolder.getFolderName());
  }
  const scope = isGlobal ? 'global' : 'scene';
  return scope + '/' + parts.join('/');
};

export const folderColors = {
  get(objectFolder: gdObjectFolderOrObject, isGlobal: boolean): string | null {
    try {
      const key = getFolderStableKey(objectFolder, isGlobal);
      const saved = localStorage.getItem('gdevelop_custom_folder_colors');
      const colors: { [string]: string } = saved ? JSON.parse(saved) : {};
      return colors[key] || null;
    } catch (e) {
      return null;
    }
  },
  set(objectFolder: gdObjectFolderOrObject, isGlobal: boolean, color: string) {
    try {
      const key = getFolderStableKey(objectFolder, isGlobal);
      const saved = localStorage.getItem('gdevelop_custom_folder_colors');
      const colors: { [string]: string } = saved ? JSON.parse(saved) : {};
      colors[key] = color;
      localStorage.setItem(
        'gdevelop_custom_folder_colors',
        JSON.stringify(colors)
      );
    } catch (e) {
      console.error('Error saving folder color:', e);
    }
  },
  remove(objectFolder: gdObjectFolderOrObject, isGlobal: boolean) {
    try {
      const key = getFolderStableKey(objectFolder, isGlobal);
      const saved = localStorage.getItem('gdevelop_custom_folder_colors');
      if (saved) {
        const colors: { [string]: string } = JSON.parse(saved);
        delete colors[key];
        localStorage.setItem(
          'gdevelop_custom_folder_colors',
          JSON.stringify(colors)
        );
      }
    } catch (e) {
      console.error('Error removing folder color:', e);
    }
  },
};

export const expandAllSubfolders = (
  objectFolder: gdObjectFolderOrObject,
  isGlobal: boolean,
  expandFolders: (
    objectFolderOrObjectWithContexts: Array<ObjectFolderOrObjectWithContext>
  ) => void
) => {
  const subFolders = enumerateFoldersInFolder(objectFolder).map(
    folderAndPath => folderAndPath.folder
  );
  expandFolders(
    [objectFolder, ...subFolders].map(folder => ({
      objectFolderOrObject: folder,
      global: isGlobal,
    }))
  );
};

export type ObjectFolderTreeViewItemCallbacks = {|
  onObjectPasted?: gdObject => void,
  onRenameObjectFolderOrObjectWithContextFinish: (
    objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext,
    newName: string,
    cb: (boolean) => void
  ) => void,
  onDeleteObjects: (
    objectWithContext: ObjectWithContext[],
    cb: (boolean) => void
  ) => void,
|};

export type ObjectFolderTreeViewItemProps = {|
  ...ObjectFolderTreeViewItemCallbacks,
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  editName: (itemId: string) => void,
  onObjectModified: (shouldForceUpdateList: boolean) => void,
  onObjectCreated: (
    objects: Array<gdObject>,
    isTheFirstOfItsTypeInProject: boolean
  ) => void,
  expandFolders: (
    objectFolderOrObjectWithContexts: Array<ObjectFolderOrObjectWithContext>
  ) => void,
  addFolder: (items: Array<ObjectFolderOrObjectWithContext>) => void,
  onAddNewObject: (item: ObjectFolderOrObjectWithContext | null) => void,
  onMovedObjectFolderOrObjectToAnotherFolderInSameContainer: (
    objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext
  ) => void,
  showDeleteConfirmation: (options: any) => Promise<boolean>,
  selectObjectFolderOrObjectWithContext: (
    objectFolderOrObjectWithContext: ?ObjectFolderOrObjectWithContext
  ) => void,
  forceUpdateList: () => void,
  forceUpdate: () => void,
  isListLocked: boolean,
  openColorPicker: (
    objectFolder: gdObjectFolderOrObject,
    isGlobal: boolean
  ) => void,
|};

export const getObjectFolderTreeViewItemId = (
  objectFolder: gdObjectFolderOrObject
): string => {
  return `object-folder-${objectFolder.ptr}`;
};

export class ObjectFolderTreeViewItemContent implements TreeViewItemContent {
  objectFolder: gdObjectFolderOrObject;
  _isGlobal: boolean;
  props: ObjectFolderTreeViewItemProps;

  constructor(
    objectFolder: gdObjectFolderOrObject,
    isGlobal: boolean,
    props: ObjectFolderTreeViewItemProps
  ) {
    this.objectFolder = objectFolder;
    this._isGlobal = isGlobal;
    this.props = props;
  }

  getObjectFolderOrObject(): gdObjectFolderOrObject | null {
    return this.objectFolder;
  }

  isDescendantOf(treeViewItemContent: TreeViewItemContent): boolean {
    const objectFolderOrObject = treeViewItemContent.getObjectFolderOrObject();
    return (
      !!objectFolderOrObject &&
      this.objectFolder.isADescendantOf(objectFolderOrObject)
    );
  }

  isSibling(treeViewItemContent: TreeViewItemContent): boolean {
    const objectFolderOrObject = treeViewItemContent.getObjectFolderOrObject();
    return (
      !!objectFolderOrObject &&
      this.objectFolder.getParent() === objectFolderOrObject.getParent()
    );
  }

  getIndex(): number {
    return this.objectFolder.getParent().getChildPosition(this.objectFolder);
  }

  isGlobal(): boolean {
    return this._isGlobal;
  }

  is3D(): boolean {
    return false;
  }

  _getFolderName(): string {
    if (!exceptionallyGuardAgainstDeadObject(this.objectFolder)) return '';
    return this.objectFolder.getFolderName();
  }

  getName(): string {
    if (!exceptionallyGuardAgainstDeadObject(this.objectFolder)) return '';
    return this.objectFolder.getFolderName();
  }

  getId(): string {
    return getObjectFolderTreeViewItemId(this.objectFolder) || '';
  }

  getHtmlId(index: number): ?string {
    return null;
  }

  getDataSet(): ?HTMLDataset {
    if (!exceptionallyGuardAgainstDeadObject(this.objectFolder)) return null;
    const color = folderColors.get(this.objectFolder, this._isGlobal);
    return {
      folderName: this.objectFolder.getFolderName(),
      global: this._isGlobal.toString(),
      ...(color ? { folderColor: color } : {}),
    };
  }
  getThumbnail(): ?string {
    const color = folderColors.get(this.objectFolder, this._isGlobal);
    if (color) {
      return 'NO_ICON';
    }
    return 'FOLDER';
  }

  onClick(): void {}

  rename(newName: string): void {
    const safeNewName = newName.replaceAll('/', '-');
    if (this._getFolderName() === safeNewName) {
      return;
    }
    // Save the current color before renaming (the key will change with the new name)
    const currentColor = folderColors.get(this.objectFolder, this._isGlobal);
    this.props.onRenameObjectFolderOrObjectWithContextFinish(
      { objectFolderOrObject: this.objectFolder, global: this._isGlobal },
      safeNewName,
      doRename => {
        if (!doRename) return;
        // After rename, the folder path key has changed: remove old key and save with new key
        if (currentColor) {
          folderColors.remove(this.objectFolder, this._isGlobal);
          folderColors.set(this.objectFolder, this._isGlobal, currentColor);
        }
        this.props.onObjectModified(false);
      }
    );
  }

  edit(): void {}

  _openColorPicker(): void {
    this.props.openColorPicker(this.objectFolder, this._isGlobal);
  }

  getPasteLabel(
    i18n: I18nType,
    {
      isGlobalObject,
      isFolder,
    }: {| isGlobalObject: boolean, isFolder: boolean |}
  ): any {
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

  buildMenuTemplate(i18n: I18nType, index: number): any {
    const {
      globalObjectsContainer,
      objectsContainer,
      expandFolders,
      addFolder,
      onAddNewObject,
      onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
      forceUpdate,
      isListLocked,
    } = this.props;

    const container = this._isGlobal
      ? globalObjectsContainer
      : objectsContainer;

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
        label: this.getPasteLabel(i18n, {
          isGlobalObject: this._isGlobal,
          isFolder: true,
        }),
        enabled: Clipboard.has(OBJECT_CLIPBOARD_KIND) && !isListLocked,
        click: () => this.paste(),
      },
      {
        label: i18n._(t`Rename`),
        click: () => this.props.editName(this.getId()),
        accelerator: 'F2',
        enabled: !isListLocked,
      },
      {
        label: i18n._(t`Change folder color`),
        click: () => this._openColorPicker(),
        enabled: !isListLocked,
      },
      {
        label: i18n._(t`Delete`),
        click: () => this.delete(),
        accelerator: 'Backspace',
        enabled: !isListLocked,
      },
      isListLocked
        ? {
            label: i18n._('Move to folder'),
            enabled: false,
          }
        : {
            label: i18n._('Move to folder'),
            submenu: [
              ...filteredFolderAndPathsInContainer.map(({ folder, path }) => ({
                label: path,
                enabled: folder !== this.objectFolder.getParent(),
                click: () => {
                  if (folder === this.objectFolder.getParent()) return;
                  this.objectFolder
                    .getParent()
                    .moveObjectFolderOrObjectToAnotherFolder(
                      this.objectFolder,
                      folder,
                      0
                    );
                  onMovedObjectFolderOrObjectToAnotherFolderInSameContainer({
                    objectFolderOrObject: folder,
                    global: this._isGlobal,
                  });
                },
              })),
              { type: 'separator' },
              {
                label: i18n._(t`Create new folder...`),
                click: () =>
                  addFolder([
                    {
                      objectFolderOrObject: this.objectFolder.getParent(),
                      global: this._isGlobal,
                    },
                  ]),
              },
            ],
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
            global: this._isGlobal,
          }),
        enabled: !isListLocked,
      },
      {
        label: i18n._(t`Add a new folder`),
        click: () =>
          addFolder([
            { objectFolderOrObject: this.objectFolder, global: this._isGlobal },
          ]),
        enabled: !isListLocked,
      },
      { type: 'separator' },
      {
        label: i18n._(t`Expand all sub folders`),
        click: () =>
          expandAllSubfolders(this.objectFolder, this._isGlobal, expandFolders),
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
      globalObjectsContainer,
      objectsContainer,
      onObjectModified,
      forceUpdateList,
      showDeleteConfirmation,
      onDeleteObjects,
      selectObjectFolderOrObjectWithContext,
    } = this.props;

    const objectsToDelete = enumerateObjectsInFolder(this.objectFolder);

    if (objectsToDelete.length === 0) {
      selectObjectFolderOrObjectWithContext(null);
      folderColors.remove(this.objectFolder, this._isGlobal);
      this.objectFolder.getParent().removeFolderChild(this.objectFolder);
      forceUpdateList();
      return;
    }

    let message: MessageDescriptor;
    let title: MessageDescriptor;

    if (objectsToDelete.length === 1) {
      message = t`Are you sure you want to remove this folder and with it the object ${objectsToDelete[0].getName()}? This can't be undone.`;
      title = t`Remove folder and object`;
    } else {
      message = t`Are you sure you want to remove this folder and all its content (objects ${objectsToDelete
        .map(object => object.getName())
        .join(', ')})? This can't be undone.`;
      title = t`Remove folder and objects`;
    }

    const answer = await showDeleteConfirmation({ message, title });
    if (!answer) return;

    const objectsWithContext = objectsToDelete.map(object => ({
      object,
      global: this._isGlobal,
    }));

    selectObjectFolderOrObjectWithContext(null);

    const folderToDelete = this.objectFolder;
    onDeleteObjects(objectsWithContext, doRemove => {
      if (!doRemove) return;
      const container = this._isGlobal
        ? globalObjectsContainer
        : objectsContainer;
      if (container) {
        objectsToDelete.forEach(object => {
          container.removeObject(object.getName());
        });
      }

      folderColors.remove(folderToDelete, this._isGlobal);
      folderToDelete.getParent().removeFolderChild(folderToDelete);
      forceUpdateList();

      onObjectModified(false);
    });
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
      onObjectModified,
      onObjectCreated,
    } = this.props;

    const isTheFirstOfItsTypeInProject = !gd.UsedObjectTypeFinder.scanProject(
      project,
      objectType
    );

    const newObjectWithContext = addSerializedObjectToObjectsContainer({
      project,
      globalObjectsContainer,
      objectsContainer,
      objectName,
      positionObjectFolderOrObjectWithContext: {
        objectFolderOrObject: this.objectFolder,
        global: this._isGlobal,
      },
      objectType,
      serializedObject,
      addInsideFolder: true,
    });

    onObjectCreated(
      [newObjectWithContext.object],
      isTheFirstOfItsTypeInProject
    );

    onObjectModified(false);
    if (onObjectPasted) onObjectPasted(newObjectWithContext.object);

    expandFolders([
      { objectFolderOrObject: this.objectFolder, global: this._isGlobal },
    ]);
  }

  duplicate(): void {}

  getRightButton(i18n: I18nType): any {
    return null;
  }
}
