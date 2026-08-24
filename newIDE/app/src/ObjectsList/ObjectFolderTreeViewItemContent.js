// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { type TreeViewItemContent } from '.';
import {
  enumerateFoldersInContainer,
  enumerateFoldersInFolder,
  enumerateObjectsInFolder,
  type ObjectFolderOrObjectWithContext,
} from './EnumerateObjectFolderOrObject';
import {
  copyObjectFolderOrObjectsToClipboard,
  serializeObjectFolderOrObjectsForClipboard,
  writeObjectFolderOrObjectsToClipboard,
  hasObjectFolderOrObjectsInClipboard,
  getObjectFolderOrObjectsClipboardSummaryName,
  pasteObjectFolderOrObjectsAndNotify,
} from './ObjectFolderOrObjectsClipboard';
import { duplicateObjectFolderOrObjects } from './ObjectFolderOrObjectsDuplicate';
import { renderQuickCustomizationMenuItems } from '../QuickCustomization/QuickCustomizationMenuItems';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import type { ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import { exceptionallyGuardAgainstDeadObject } from '../Utils/IsNullPtr';

const gd: libGDevelop = global.gd;

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
  selectObjectFolderOrObjectsWithContext: (
    items: Array<ObjectFolderOrObjectWithContext>
  ) => void,
  forceUpdateList: () => void,
  forceUpdate: () => void,
  isListLocked: boolean,
|};

export const getObjectFolderTreeViewItemId = (
  objectFolder: gdObjectFolderOrObject
): string => {
  // Use the ptr as id since two folders can have the same name.
  // If using folder name, this would need for methods when renaming
  // the folder to keep it open.
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

  getName(): string | React.Node {
    if (!exceptionallyGuardAgainstDeadObject(this.objectFolder)) return '';
    return this.objectFolder.getFolderName();
  }

  getId(): string {
    // getObjectFolderTreeViewItemId only uses .ptr, so it's safe even if dead.
    return getObjectFolderTreeViewItemId(this.objectFolder);
  }

  getHtmlId(index: number): ?string {
    return null;
  }

  getDataSet(): ?HTMLDataset {
    if (!exceptionallyGuardAgainstDeadObject(this.objectFolder)) return null;
    return {
      folderName: this.objectFolder.getFolderName(),
      global: this._isGlobal.toString(),
    };
  }

  getThumbnail(): ?string {
    return 'FOLDER';
  }

  onClick(): void {}

  rename(newName: string): void {
    const safeNewName = newName.replaceAll('/', '-');
    if (this.getName() === safeNewName) {
      return;
    }

    this.props.onRenameObjectFolderOrObjectWithContextFinish(
      { objectFolderOrObject: this.objectFolder, global: this._isGlobal },
      safeNewName,
      doRename => {
        if (!doRename) return;

        this.props.onObjectModified(false);
      }
    );
  }

  edit(): void {}

  _getPasteLabel(
    i18n: I18nType,
    { isGlobalObject }: {| isGlobalObject: boolean |}
  ): any {
    let translation = t`Paste`;
    if (hasObjectFolderOrObjectsInClipboard()) {
      const clipboardSummaryName = getObjectFolderOrObjectsClipboardSummaryName(
        i18n
      );
      translation = isGlobalObject
        ? t`Paste ${clipboardSummaryName} as a Global Object inside folder`
        : t`Paste ${clipboardSummaryName} inside folder`;
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
        label: i18n._(t`Copy`),
        click: () => this.copy(),
      },
      {
        label: i18n._(t`Cut`),
        click: () => this.cut(),
        enabled: !isListLocked,
      },
      {
        label: this._getPasteLabel(i18n, {
          isGlobalObject: this._isGlobal,
        }),
        enabled: hasObjectFolderOrObjectsInClipboard() && !isListLocked,
        click: () => this.paste(),
      },
      {
        label: i18n._(t`Duplicate`),
        click: () => this.duplicate(),
        accelerator: 'CmdOrCtrl+D',
        enabled: !isListLocked,
      },
      {
        label: i18n._(t`Rename`),
        click: () => this.props.editName(this.getId()),
        accelerator: 'F2',
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

  async _delete(): Promise<boolean> {
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
      // Folder is empty or contains only empty folders.
      selectObjectFolderOrObjectWithContext(null);
      this.objectFolder.getParent().removeFolderChild(this.objectFolder);
      onObjectModified(true);
      return true;
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
    if (!answer) return false;

    const objectsWithContext = objectsToDelete.map(object => ({
      object,
      global: this._isGlobal,
    }));

    // TODO: Change selectedObjectFolderOrObjectWithContext so that it's easy
    // to remove an item using keyboard only and to navigate with the arrow
    // keys right after deleting it.
    selectObjectFolderOrObjectWithContext(null);

    const folderToDelete = this.objectFolder;
    // It's important to call onDeleteObjects, because the parent might
    // have to do some refactoring/clean up work before the object is deleted
    // (typically, the SceneEditor will remove instances referring to the object,
    // leading to the removal of their renderer - which can keep a reference to
    // the object).
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

      folderToDelete.getParent().removeFolderChild(folderToDelete);
      forceUpdateList();

      onObjectModified(false);
    });
    return true;
  }

  copy(): void {
    copyObjectFolderOrObjectsToClipboard([
      { objectFolderOrObject: this.objectFolder, global: this._isGlobal },
    ]);
  }

  cut(): void {
    this._cut();
  }

  async _cut(): Promise<void> {
    const clipboardPayload = serializeObjectFolderOrObjectsForClipboard([
      { objectFolderOrObject: this.objectFolder, global: this._isGlobal },
    ]);
    if (!clipboardPayload) return;
    const deleted = await this._delete();
    if (!deleted) return;
    writeObjectFolderOrObjectsToClipboard(clipboardPayload);
  }

  paste(): void {
    const {
      project,
      globalObjectsContainer,
      objectsContainer,
      onObjectPasted,
      expandFolders,
      onObjectModified,
      onObjectCreated,
      selectObjectFolderOrObjectsWithContext,
    } = this.props;

    const pasted = pasteObjectFolderOrObjectsAndNotify({
      project,
      globalObjectsContainer,
      objectsContainer,
      global: this._isGlobal,
      destinationFolder: this.objectFolder,
      positionInFolder: this.objectFolder.getChildrenCount(),
      onObjectModified,
      onObjectPasted,
      onObjectCreated,
      selectObjectFolderOrObjectsWithContext,
    });
    if (!pasted) return;
    expandFolders([
      { objectFolderOrObject: this.objectFolder, global: this._isGlobal },
    ]);
  }

  duplicate(): void {
    const {
      project,
      globalObjectsContainer,
      objectsContainer,
      onObjectCreated,
      onObjectModified,
      forceUpdateList,
      selectObjectFolderOrObjectWithContext,
    } = this.props;

    const parent = exceptionallyGuardAgainstDeadObject(
      this.objectFolder.getParent()
    );
    if (!parent) return;

    const isTheFirstOfItsTypeInProject = enumerateObjectsInFolder(
      this.objectFolder
    ).some(
      object => !gd.UsedObjectTypeFinder.scanProject(project, object.getType())
    );

    const duplicatedContent = duplicateObjectFolderOrObjects({
      project,
      globalObjectsContainer,
      objectsContainer,
      items: [
        { objectFolderOrObject: this.objectFolder, global: this._isGlobal },
      ],
      destinationFolder: parent,
      positionInFolder: parent.getChildPosition(this.objectFolder) + 1,
    });
    if (!duplicatedContent) return;
    const { createdObjects, topLevelObjectFolderOrObjects } = duplicatedContent;

    onObjectCreated(createdObjects, isTheFirstOfItsTypeInProject);
    onObjectModified(true);
    forceUpdateList();
    selectObjectFolderOrObjectWithContext({
      objectFolderOrObject: topLevelObjectFolderOrObjects[0],
      global: this._isGlobal,
    });
  }

  getRightButton(i18n: I18nType): any {
    return null;
  }
}
