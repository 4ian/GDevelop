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
import { type TreeViewItemContent } from '.';
import { canSwapAssetOfObject } from '../AssetStore/AssetSwapper';
import { getInstanceCountInLayoutForObject } from '../Utils/Layout';
import {
  enumerateFoldersInContainer,
  type ObjectFolderOrObjectWithContext,
} from './EnumerateObjectFolderOrObject';
import { type ObjectEditorTab } from '../ObjectEditor/ObjectEditorDialog';
import type { ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import { isVariantEditable } from '../ObjectEditor/Editors/CustomObjectPropertiesEditor';
import { exceptionallyGuardAgainstDeadObject } from '../Utils/IsNullPtr';

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
  onOpenEventBasedObjectVariantEditor: (
    extensionName: string,
    eventsBasedObjectName: string,
    variantName: string
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
  onObjectCreated: (
    objects: Array<gdObject>,
    isTheFirstOfItsTypeInProject: boolean
  ) => void,
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
  isListLocked: boolean,
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
  newObject.resetPersistentUuid();

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

  _getAliveObjectFolderOrObject(): ?gdObjectFolderOrObject {
    if (!exceptionallyGuardAgainstDeadObject(this.object)) return null;
    return this.object;
  }

  _getAliveObject(): ?gdObject {
    const objectFolderOrObject = this._getAliveObjectFolderOrObject();
    if (!objectFolderOrObject) return null;
    const object = objectFolderOrObject.getObject();
    if (!exceptionallyGuardAgainstDeadObject(object)) return null;
    return object;
  }

  isDescendantOf(treeViewItemContent: TreeViewItemContent): boolean {
    const objectFolderOrObject = exceptionallyGuardAgainstDeadObject(
      treeViewItemContent.getObjectFolderOrObject()
    );
    const ownObjectFolderOrObject = this._getAliveObjectFolderOrObject();
    return (
      !!ownObjectFolderOrObject &&
      !!objectFolderOrObject &&
      ownObjectFolderOrObject.isADescendantOf(objectFolderOrObject)
    );
  }

  isSibling(treeViewItemContent: TreeViewItemContent): boolean {
    const objectFolderOrObject = exceptionallyGuardAgainstDeadObject(
      treeViewItemContent.getObjectFolderOrObject()
    );
    const ownObjectFolderOrObject = this._getAliveObjectFolderOrObject();
    if (!ownObjectFolderOrObject || !objectFolderOrObject) return false;
    const ownParent = exceptionallyGuardAgainstDeadObject(
      ownObjectFolderOrObject.getParent()
    );
    const otherParent = exceptionallyGuardAgainstDeadObject(
      objectFolderOrObject.getParent()
    );
    return !!ownParent && !!otherParent && ownParent === otherParent;
  }

  getIndex(): number {
    const ownObjectFolderOrObject = this._getAliveObjectFolderOrObject();
    if (!ownObjectFolderOrObject) return 0;
    const parent = exceptionallyGuardAgainstDeadObject(
      ownObjectFolderOrObject.getParent()
    );
    if (!parent) return 0;
    return parent.getChildPosition(ownObjectFolderOrObject);
  }

  isGlobal(): boolean {
    return this._isGlobal;
  }

  is3D(): boolean {
    const object = this._getAliveObject();
    if (!object) return false;
    const objectMetadata = gd.MetadataProvider.getObjectMetadata(
      this.props.project.getCurrentPlatform(),
      object.getType()
    );
    return objectMetadata.isRenderedIn3D();
  }

  getName(): string | React.Node {
    const object = this._getAliveObject();
    if (!object) return '';
    return object.getName();
  }

  getId(): string {
    const object = this._getAliveObject();
    if (!object) return `deleted-${this.object.ptr}`;
    return getObjectTreeViewItemId(object);
  }

  getHtmlId(index: number): ?string {
    return null;
  }

  getDataSet(): ?HTMLDataset {
    const object = this._getAliveObject();
    if (!object) return null;
    return {
      objectName: object.getName(),
      global: this._isGlobal.toString(),
    };
  }

  getThumbnail(): ?string {
    const object = this._getAliveObject();
    if (!object) return null;
    return this.props.getThumbnail(
      this.props.project,
      object.getConfiguration()
    );
  }

  onClick(): void {
    const objectFolderOrObject = this._getAliveObjectFolderOrObject();
    if (!objectFolderOrObject) return;
    if (!objectFolderOrObject.isFolder() && !this._getAliveObject()) return;

    this.props.selectObjectFolderOrObjectWithContext({
      objectFolderOrObject,
      global: this._isGlobal,
    });
  }

  rename(newName: string): void {
    const objectFolderOrObject = this._getAliveObjectFolderOrObject();
    const object = this._getAliveObject();
    if (!objectFolderOrObject || !object) return;
    if (object.getName() === newName) {
      return;
    }

    const validatedNewName = this.props.getValidatedObjectOrGroupName(
      newName,
      this._isGlobal
    );
    this.props.onRenameObjectFolderOrObjectWithContextFinish(
      { objectFolderOrObject, global: this._isGlobal },
      validatedNewName,
      doRename => {
        if (!doRename) return;

        this.props.onObjectModified(false);
      }
    );
  }

  edit(): void {
    const object = this._getAliveObject();
    if (!object) return;
    this.props.onEditObject(object);
  }

  _getPasteLabel(
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
        ? t`Paste ${clipboardObjectName} as a Global Object`
        : t`Paste ${clipboardObjectName}`;
    }
    return i18n._(translation);
  }

  buildMenuTemplate(i18n: I18nType, index: number): any {
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
      onOpenEventBasedObjectVariantEditor,
      selectObjectFolderOrObjectWithContext,
      addFolder,
      isListLocked,
    } = this.props;

    const container = this._isGlobal
      ? globalObjectsContainer
      : objectsContainer;
    if (!container) {
      return [];
    }
    const objectFolderOrObject = this._getAliveObjectFolderOrObject();
    const object = this._getAliveObject();
    if (!objectFolderOrObject || !object) return [];
    const folderAndPathsInContainer = enumerateFoldersInContainer(container);
    folderAndPathsInContainer.unshift({
      path: i18n._(t`Root folder`),
      folder: container.getRootFolder(),
    });

    const instanceCountOnScene = initialInstances
      ? getInstanceCountInLayoutForObject(initialInstances, object.getName())
      : undefined;
    const objectMetadata = gd.MetadataProvider.getObjectMetadata(
      project.getCurrentPlatform(),
      object.getType()
    );
    const objectExtensionName = gd.PlatformExtension.getExtensionFromFullObjectType(
      object.getType()
    );
    const customObjectExtension = project.hasEventsFunctionsExtensionNamed(
      objectExtensionName
    )
      ? project.getEventsFunctionsExtension(objectExtensionName)
      : null;
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
          isFolder: false,
        }),
        enabled: Clipboard.has(OBJECT_CLIPBOARD_KIND) && !isListLocked,
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
            enabled: isVariantEditable(
              gd.asCustomObjectConfiguration(object.getConfiguration()),
              project.getEventsBasedObject(object.getType()),
              customObjectExtension
            ),
            click: () => {
              const customObjectConfiguration = gd.asCustomObjectConfiguration(
                object.getConfiguration()
              );
              onOpenEventBasedObjectVariantEditor(
                gd.PlatformExtension.getExtensionFromFullObjectType(
                  object.getType()
                ),
                gd.PlatformExtension.getObjectNameFromFullObjectType(
                  object.getType()
                ),
                customObjectConfiguration.getVariantName()
              );
            },
          }
        : null,
      { type: 'separator' },
      {
        label: i18n._(t`Swap assets`),
        click: () =>
          swapObjectAsset({
            object,
            global: this._isGlobal,
          }),
        enabled: canSwapAssetOfObject(object),
      },
      { type: 'separator' },
      globalObjectsContainer && {
        label: i18n._(t`Set as global object`),
        enabled: !this._isGlobal && !isListLocked,
        click: () => {
          selectObjectFolderOrObjectWithContext(null);
          const ownObjectFolderOrObject = this._getAliveObjectFolderOrObject();
          if (!ownObjectFolderOrObject) return;
          setAsGlobalObject({
            i18n,
            objectFolderOrObject: ownObjectFolderOrObject,
          });
        },
        visible: canSetAsGlobalObject !== false,
      },
      isListLocked
        ? {
            label: i18n._('Move to folder'),
            enabled: false,
          }
        : {
            label: i18n._('Move to folder'),
            submenu: [
              ...folderAndPathsInContainer.map(({ folder, path }) => ({
                label: path,
                enabled: folder !== objectFolderOrObject.getParent(),
                click: () => {
                  const ownObjectFolderOrObject = this._getAliveObjectFolderOrObject();
                  if (!ownObjectFolderOrObject) return;
                  const ownParent = exceptionallyGuardAgainstDeadObject(
                    ownObjectFolderOrObject.getParent()
                  );
                  if (!ownParent) return;
                  ownParent.moveObjectFolderOrObjectToAnotherFolder(
                    ownObjectFolderOrObject,
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
                click: () => {
                  const ownObjectFolderOrObject = this._getAliveObjectFolderOrObject();
                  if (!ownObjectFolderOrObject) return;
                  const ownParent = exceptionallyGuardAgainstDeadObject(
                    ownObjectFolderOrObject.getParent()
                  );
                  if (!ownParent) return;
                  addFolder([
                    {
                      objectFolderOrObject: ownParent,
                      global: this._isGlobal,
                    },
                  ]);
                },
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
    const object = this._getAliveObject();
    if (!object) return;
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

    const objectsToDelete = [object];
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
    const object = this._getAliveObject();
    if (!object) return;
    Clipboard.set(OBJECT_CLIPBOARD_KIND, {
      type: object.getType(),
      name: object.getName(),
      object: serializeToJSObject(object),
    });
  }

  cut(): void {
    this.copy();
    // TODO It should probably not show an alert
    this.delete();
  }

  paste(): void {
    const objectFolderOrObject = this._getAliveObjectFolderOrObject();
    if (!objectFolderOrObject) return;
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
        objectFolderOrObject,
        global: this._isGlobal,
      },
      objectType,
      serializedObject,
      addInsideFolder: false,
    });

    onObjectModified(false);
    if (onObjectPasted) onObjectPasted(newObjectWithContext.object);
    onObjectCreated(
      [newObjectWithContext.object],
      isTheFirstOfItsTypeInProject
    );
  }

  duplicate(): void {
    const objectFolderOrObject = this._getAliveObjectFolderOrObject();
    const object = this._getAliveObject();
    if (!objectFolderOrObject || !object) return;
    const {
      project,
      globalObjectsContainer,
      objectsContainer,
      forceUpdateList,
      editName,
      selectObjectFolderOrObjectWithContext,
      onObjectCreated,
    } = this.props;

    const serializedObject = serializeToJSObject(object);

    const isTheFirstOfItsTypeInProject = !gd.UsedObjectTypeFinder.scanProject(
      project,
      object.getType()
    );

    const newObjectWithContext = addSerializedObjectToObjectsContainer({
      project,
      globalObjectsContainer,
      objectsContainer,
      objectName: object.getName(),
      positionObjectFolderOrObjectWithContext: {
        objectFolderOrObject,
        global: this._isGlobal,
      },
      objectType: object.getType(),
      serializedObject,
    });

    const parent = exceptionallyGuardAgainstDeadObject(
      objectFolderOrObject.getParent()
    );
    if (!parent) return;
    const newObjectFolderOrObjectWithContext = {
      objectFolderOrObject: parent.getObjectChild(
        newObjectWithContext.object.getName()
      ),
      global: this._isGlobal,
    };

    onObjectCreated(
      [newObjectWithContext.object],
      isTheFirstOfItsTypeInProject
    );

    forceUpdateList();
    editName(getObjectTreeViewItemId(newObjectWithContext.object));
    selectObjectFolderOrObjectWithContext(newObjectFolderOrObjectWithContext);
  }

  getRightButton(i18n: I18nType): any {
    return null;
  }
}
