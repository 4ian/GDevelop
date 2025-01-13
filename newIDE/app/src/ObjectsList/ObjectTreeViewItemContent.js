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
import { TreeViewItemContent } from '.';
import { canSwapAssetOfObject } from '../AssetStore/AssetSwapper';
import { getInstanceCountInLayoutForObject } from '../Utils/Layout';
import {
  enumerateFoldersInContainer,
  type ObjectFolderOrObjectWithContext,
} from './EnumerateObjectFolderOrObject';
import { type ObjectEditorTab } from '../ObjectEditor/ObjectEditorDialog';
import type { ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import { type HTMLDataset } from '../Utils/HTMLDataset';

const gd: libGDevelop = global.gd;

export const OBJECT_CLIPBOARD_KIND = 'Object';

export const getObjectTreeViewItemId = (object: gdObject): string => {
  // Use the ptr to avoid display bugs in the rare case a user set an object
  // as global although another layout has an object with the same name,
  // and ignored the warning.
  return `${object.getName()}-${object.ptr}`;
};

export type ObjectTreeViewItemCallbacks = {|
  onObjectPasted?: gdObject => void,
  onSelectAllInstancesOfObjectInLayout?: string => void,
  onEditObject: (object: gdObject, initialTab: ?ObjectEditorTab) => void,
  onDeleteObjects: (
    objectWithContext: ObjectWithContext[],
    cb: (boolean) => void
  ) => void,
  onAddObjectInstance: (objectName: string) => void,
  onOpenEventBasedObjectEditor: (
    extensionName: string,
    eventsBasedObjectName: string
  ) => void,
  onRenameObjectFolderOrObjectWithContextFinish: (
    objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext,
    newName: string,
    cb: (boolean) => void
  ) => void,
  getValidatedObjectOrGroupName: (newName: string, global: boolean) => string,
  getThumbnail: (
    project: gdProject,
    objectConfiguration: gdObjectConfiguration
  ) => string,
|};

export type ObjectTreeViewItemProps = {|
  ...ObjectTreeViewItemCallbacks,
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  swapObjectAsset: (objectWithContext: ObjectWithContext) => void,
  initialInstances?: gdInitialInstancesContainer,
  editName: (itemId: string) => void,
  onObjectModified: (shouldForceUpdateList: boolean) => void,
  onMovedObjectFolderOrObjectToAnotherFolderInSameContainer: (
    objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext
  ) => void,
  canSetAsGlobalObject?: boolean,
  setAsGlobalObject: ({|
    i18n: I18nType,
    objectFolderOrObject: gdObjectFolderOrObject,
    index?: number,
    folder?: gdObjectFolderOrObject,
  |}) => void,
  showDeleteConfirmation: (options: any) => Promise<boolean>,
  selectObjectFolderOrObjectWithContext: (
    objectFolderOrObjectWithContext: ?ObjectFolderOrObjectWithContext
  ) => void,
  addFolder: (items: Array<ObjectFolderOrObjectWithContext>) => void,
  forceUpdateList: () => void,
  forceUpdate: () => void,
|};

export const addSerializedObjectToObjectsContainer = ({
  project,
  globalObjectsContainer,
  objectsContainer,
  objectName,
  positionObjectFolderOrObjectWithContext,
  objectType,
  serializedObject,
  addInsideFolder,
}: {|
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  objectName: string,
  positionObjectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext,
  objectType: string,
  serializedObject: Object,
  addInsideFolder?: boolean,
|}): ObjectWithContext => {
  const newName = newNameGenerator(
    objectName,
    name =>
      objectsContainer.hasObjectNamed(name) ||
      (!!globalObjectsContainer && globalObjectsContainer.hasObjectNamed(name)),
    ''
  );

  const {
    objectFolderOrObject,
    global,
  } = positionObjectFolderOrObjectWithContext;
  let positionFolder, positionInFolder;
  if (addInsideFolder && objectFolderOrObject.isFolder()) {
    positionFolder = objectFolderOrObject;
    positionInFolder = objectFolderOrObject.getChildrenCount();
  } else {
    positionFolder = objectFolderOrObject.getParent();
    positionInFolder = positionFolder.getChildPosition(objectFolderOrObject);
  }

  const newObject =
    global && globalObjectsContainer
      ? globalObjectsContainer.insertNewObjectInFolder(
          project,
          objectType,
          newName,
          positionFolder,
          positionInFolder + 1
        )
      : objectsContainer.insertNewObjectInFolder(
          project,
          objectType,
          newName,
          positionFolder,
          positionInFolder + 1
        );

  unserializeFromJSObject(
    newObject,
    serializedObject,
    'unserializeFrom',
    project
  );
  newObject.setName(newName); // Unserialization has overwritten the name.

  return { object: newObject, global };
};

export class ObjectTreeViewItemContent implements TreeViewItemContent {
  object: gdObjectFolderOrObject;
  _isGlobal: boolean;
  props: ObjectTreeViewItemProps;

  constructor(
    object: gdObjectFolderOrObject,
    isGlobal: boolean,
    props: ObjectTreeViewItemProps
  ) {
    this.object = object;
    this._isGlobal = isGlobal;
    this.props = props;
  }

  getObjectFolderOrObject(): gdObjectFolderOrObject | null {
    return this.object;
  }

  isDescendantOf(treeViewItemContent: TreeViewItemContent): boolean {
    const objectFolderOrObject = treeViewItemContent.getObjectFolderOrObject();
    return (
      !!objectFolderOrObject &&
      this.object.isADescendantOf(objectFolderOrObject)
    );
  }

  isSibling(treeViewItemContent: TreeViewItemContent): boolean {
    const objectFolderOrObject = treeViewItemContent.getObjectFolderOrObject();
    return (
      !!objectFolderOrObject &&
      this.object.getParent() === objectFolderOrObject.getParent()
    );
  }

  getIndex(): number {
    return this.object.getParent().getChildPosition(this.object);
  }

  isGlobal(): boolean {
    return this._isGlobal;
  }

  getName(): string | React.Node {
    return this.object.getObject().getName();
  }

  getId(): string {
    return getObjectTreeViewItemId(this.object.getObject());
  }

  getHtmlId(index: number): ?string {
    return null;
  }

  getDataSet(): ?HTMLDataset {
    return {
      objectName: this.object.getObject().getName(),
      global: this._isGlobal.toString(),
    };
  }

  getThumbnail(): ?string {
    return this.props.getThumbnail(
      this.props.project,
      this.object.getObject().getConfiguration()
    );
  }

  onClick(): void {}

  rename(newName: string): void {
    if (this.getName() === newName) {
      return;
    }

    const validatedNewName = this.props.getValidatedObjectOrGroupName(
      newName,
      this._isGlobal
    );
    this.props.onRenameObjectFolderOrObjectWithContextFinish(
      { objectFolderOrObject: this.object, global: this._isGlobal },
      validatedNewName,
      doRename => {
        if (!doRename) return;

        this.props.onObjectModified(false);
      }
    );
  }

  edit(): void {
    this.props.onEditObject(this.object.getObject());
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
        ? t`Paste ${clipboardObjectName} as a Global Object`
        : t`Paste ${clipboardObjectName}`;
    }
    return i18n._(translation);
  }

  buildMenuTemplate(i18n: I18nType, index: number) {
    const {
      project,
      globalObjectsContainer,
      objectsContainer,
      initialInstances,
      onSelectAllInstancesOfObjectInLayout,
      onEditObject,
      onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
      onAddObjectInstance,
      swapObjectAsset,
      canSetAsGlobalObject,
      setAsGlobalObject,
      onOpenEventBasedObjectEditor,
      selectObjectFolderOrObjectWithContext,
      addFolder,
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

    const object = this.object.getObject();
    const instanceCountOnScene = initialInstances
      ? getInstanceCountInLayoutForObject(initialInstances, object.getName())
      : undefined;
    const objectMetadata = gd.MetadataProvider.getObjectMetadata(
      project.getCurrentPlatform(),
      object.getType()
    );
    return [
      {
        label: i18n._(t`Copy`),
        click: () => this.copy(),
      },
      {
        label: i18n._(t`Cut`),
        click: () => this.cut(),
      },
      {
        label: this._getPasteLabel(i18n, {
          isGlobalObject: this._isGlobal,
          isFolder: false,
        }),
        enabled: Clipboard.has(OBJECT_CLIPBOARD_KIND),
        click: () => this.paste(),
      },
      {
        label: i18n._(t`Duplicate`),
        click: () => this.duplicate(),
        accelerator: 'CmdOrCtrl+D',
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
      { type: 'separator' },
      {
        label: i18n._(t`Edit object`),
        click: () => onEditObject(object),
      },
      {
        label: i18n._(t`Edit object variables`),
        click: () => onEditObject(object, 'variables'),
      },
      {
        label: i18n._(t`Edit behaviors`),
        click: () => onEditObject(object, 'behaviors'),
      },
      {
        label: i18n._(t`Edit effects`),
        click: () => onEditObject(object, 'effects'),
        enabled: objectMetadata.hasDefaultBehavior(
          'EffectCapability::EffectBehavior'
        ),
      },
      project.hasEventsBasedObject(object.getType())
        ? {
            label: i18n._(t`Edit children`),
            click: () =>
              onOpenEventBasedObjectEditor(
                gd.PlatformExtension.getExtensionFromFullObjectType(
                  object.getType()
                ),
                gd.PlatformExtension.getObjectNameFromFullObjectType(
                  object.getType()
                )
              ),
          }
        : null,
      { type: 'separator' },
      {
        label: i18n._(t`Swap assets`),
        click: () =>
          swapObjectAsset({
            object: this.object.getObject(),
            global: this._isGlobal,
          }),
        enabled: canSwapAssetOfObject(object),
      },
      { type: 'separator' },
      globalObjectsContainer && {
        label: i18n._(t`Set as global object`),
        enabled: !this._isGlobal,
        click: () => {
          selectObjectFolderOrObjectWithContext(null);
          setAsGlobalObject({ i18n, objectFolderOrObject: this.object });
        },
        visible: canSetAsGlobalObject !== false,
      },
      {
        label: i18n._('Move to folder'),
        submenu: [
          ...folderAndPathsInContainer.map(({ folder, path }) => ({
            label: path,
            enabled: folder !== this.object.getParent(),
            click: () => {
              this.object
                .getParent()
                .moveObjectFolderOrObjectToAnotherFolder(
                  this.object,
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
                  objectFolderOrObject: this.object.getParent(),
                  global: this._isGlobal,
                },
              ]),
          },
        ],
      },
      { type: 'separator' },
      {
        label: i18n._(t`Add instance to the scene`),
        click: () => onAddObjectInstance(object.getName()),
      },
      instanceCountOnScene !== undefined && onSelectAllInstancesOfObjectInLayout
        ? {
            label: i18n._(
              t`Select instances on scene (${instanceCountOnScene})`
            ),
            click: () => onSelectAllInstancesOfObjectInLayout(object.getName()),
            enabled: instanceCountOnScene > 0,
          }
        : undefined,
    ].filter(Boolean);
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
      showDeleteConfirmation,
      onDeleteObjects,
      selectObjectFolderOrObjectWithContext,
    } = this.props;

    const answer = await showDeleteConfirmation({
      title: t`Remove object`,
      message: t`Are you sure you want to remove this object? This can't be undone.`,
    });
    if (!answer) return;

    const objectsToDelete = [this.object.getObject()];
    const objectsWithContext = objectsToDelete.map(object => ({
      object,
      global: this._isGlobal,
    }));

    // TODO: Change selectedObjectFolderOrObjectWithContext so that it's easy
    // to remove an item using keyboard only and to navigate with the arrow
    // keys right after deleting it.
    selectObjectFolderOrObjectWithContext(null);

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
      onObjectModified(false);
    });
  }

  copy(): void {
    Clipboard.set(OBJECT_CLIPBOARD_KIND, {
      type: this.object.getObject().getType(),
      name: this.object.getObject().getName(),
      object: serializeToJSObject(this.object.getObject()),
    });
  }

  cut(): void {
    this.copy();
    // TODO It should probably not show an alert
    this.delete();
  }

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
      onObjectModified,
    } = this.props;

    const newObjectWithContext = addSerializedObjectToObjectsContainer({
      project,
      globalObjectsContainer,
      objectsContainer,
      objectName,
      positionObjectFolderOrObjectWithContext: {
        objectFolderOrObject: this.object,
        global: this._isGlobal,
      },
      objectType,
      serializedObject,
      addInsideFolder: false,
    });

    onObjectModified(false);
    if (onObjectPasted) onObjectPasted(newObjectWithContext.object);
  }

  duplicate(): void {
    const {
      project,
      globalObjectsContainer,
      objectsContainer,
      forceUpdateList,
      editName,
      selectObjectFolderOrObjectWithContext,
    } = this.props;

    const object = this.object.getObject();
    const serializedObject = serializeToJSObject(object);

    const newObjectWithContext = addSerializedObjectToObjectsContainer({
      project,
      globalObjectsContainer,
      objectsContainer,
      objectName: object.getName(),
      positionObjectFolderOrObjectWithContext: {
        objectFolderOrObject: this.object,
        global: this._isGlobal,
      },
      objectType: object.getType(),
      serializedObject,
    });

    const newObjectFolderOrObjectWithContext = {
      objectFolderOrObject: this.object
        .getParent()
        .getObjectChild(newObjectWithContext.object.getName()),
      global: this._isGlobal,
    };

    forceUpdateList();
    editName(getObjectTreeViewItemId(newObjectWithContext.object));
    selectObjectFolderOrObjectWithContext(newObjectFolderOrObjectWithContext);
  }

  getRightButton(i18n: I18nType) {
    return null;
  }
}
