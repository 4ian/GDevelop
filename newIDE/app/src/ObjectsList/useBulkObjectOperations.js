// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import Window from '../Utils/Window';
import { showWarningBox } from '../UI/Messages/MessageBox';
import {
  getSelectionTopLevelNodes,
  getObjectsToDeleteFromSelection,
  removeEmptyFoldersFromSelection,
  enumerateFoldersInContainer,
  type ObjectFolderOrObjectWithContext,
} from './EnumerateObjectFolderOrObject';
import {
  copyObjectFolderOrObjectsToClipboard,
  serializeObjectFolderOrObjectsForClipboard,
  writeObjectFolderOrObjectsToClipboard,
  hasObjectFolderOrObjectsInClipboard,
  getObjectFolderOrObjectsClipboardObjectTypes,
  pasteObjectFolderOrObjectsFromClipboard,
} from './ObjectFolderOrObjectsClipboard';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';

const gd: libGDevelop = global.gd;

const getPasteMenuLabel = (i18n: I18nType): string =>
  hasObjectFolderOrObjectsInClipboard()
    ? i18n._(t`Paste`)
    : i18n._(t`Paste (empty clipboard)`);

type ObjectWithContext = {| object: gdObject, global: boolean |};

type Props = {|
  isListLocked: boolean,
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  selectedObjectFolderOrObjectsWithContext: Array<ObjectFolderOrObjectWithContext>,
  canSetAsGlobalObject: boolean | null,

  selectObjectFolderOrObjectsWithContext: (
    items: Array<ObjectFolderOrObjectWithContext>
  ) => void,
  onObjectModified: (shouldForceUpdateList: boolean) => void,
  onObjectCreated: (
    objects: Array<gdObject>,
    isTheFirstOfItsTypeInProject: boolean
  ) => void,
  onObjectPasted: ((objects: gdObject) => void) | null,
  onDeleteObjects: (
    objectsWithContext: Array<ObjectWithContext>,
    cb: (doRemove: boolean) => void
  ) => void,
  onMovedObjectFolderOrObjectToAnotherFolderInSameContainer: (
    item: ObjectFolderOrObjectWithContext
  ) => void,
  onSetAsGlobalObject: (object: gdObject) => void,
  beforeSetAsGlobalObject: ((objectName: string) => boolean) | null,
  showDeleteConfirmation: ({|
    title: string,
    message: string,
  |}) => Promise<boolean>,
  forceUpdateList: () => void,
  // Called after a new folder is created so the caller can expand the tree
  // and start renaming without the hook knowing about treeViewRef or folder IDs.
  onNewFolderCreated: (
    newFolder: gdObjectFolderOrObject,
    global: boolean
  ) => void,
|};

/**
 * Bulk operations (copy / cut / paste / delete / set-as-global / move-to-folder)
 * for a multi-selection of objects and folders in the Objects panel.
 */
function useBulkObjectOperations({
  isListLocked,
  project,
  globalObjectsContainer,
  objectsContainer,
  selectedObjectFolderOrObjectsWithContext,
  canSetAsGlobalObject,
  selectObjectFolderOrObjectsWithContext,
  onObjectModified,
  onObjectCreated,
  onObjectPasted,
  onDeleteObjects,
  onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
  onSetAsGlobalObject,
  beforeSetAsGlobalObject,
  showDeleteConfirmation,
  forceUpdateList,
  onNewFolderCreated,
}: Props): {|
  bulkCopy: () => void,
  bulkDelete: () => Promise<boolean>,
  bulkCut: () => Promise<void>,
  bulkPaste: () => void,
  bulkSetAsGlobalObject: (
    i18n: I18nType,
    options?: {| folder?: gdObjectFolderOrObject, index?: number |}
  ) => void,
  bulkMoveToFolder: (destinationFolder: gdObjectFolderOrObject) => void,
  bulkMoveToNewFolder: () => void,
  buildBulkMenuTemplate: (i18n: I18nType) => Array<MenuItemTemplate>,
|} {
  const bulkCopy = React.useCallback(
    () => {
      copyObjectFolderOrObjectsToClipboard(
        selectedObjectFolderOrObjectsWithContext
      );
    },
    [selectedObjectFolderOrObjectsWithContext]
  );

  const bulkDelete = React.useCallback(
    async (): Promise<boolean> => {
      if (isListLocked) return false;
      const topLevelItems = getSelectionTopLevelNodes(
        selectedObjectFolderOrObjectsWithContext
      );
      if (topLevelItems.length === 0) return false;
      const global = topLevelItems[0].global;
      const container =
        global && globalObjectsContainer
          ? globalObjectsContainer
          : objectsContainer;
      const topLevelObjectFolderOrObjects = topLevelItems.map(
        item => item.objectFolderOrObject
      );
      const objectsToDelete = getObjectsToDeleteFromSelection(
        topLevelObjectFolderOrObjects
      );

      if (objectsToDelete.length === 0) {
        // Only (nested) empty folders selected: nothing to confirm.
        selectObjectFolderOrObjectsWithContext([]);
        removeEmptyFoldersFromSelection(topLevelObjectFolderOrObjects);
        onObjectModified(true);
        forceUpdateList();
        return true;
      }

      const answer = await showDeleteConfirmation({
        title: t`Remove objects`,
        message: t`Are you sure you want to remove these ${
          objectsToDelete.length
        } objects? This can't be undone.`,
      });
      if (!answer) return false;

      const objectsWithContext = objectsToDelete.map(object => ({
        object,
        global,
      }));

      selectObjectFolderOrObjectsWithContext([]);

      // It's important to call onDeleteObjects, because the parent might
      // have to do some refactoring/clean up work before the objects are deleted.
      onDeleteObjects(objectsWithContext, doRemove => {
        if (!doRemove) return;
        objectsToDelete.forEach(object => {
          container.removeObject(object.getName());
        });
        removeEmptyFoldersFromSelection(topLevelObjectFolderOrObjects);
        forceUpdateList();
        onObjectModified(false);
      });
      return true;
    },
    [
      isListLocked,
      selectedObjectFolderOrObjectsWithContext,
      globalObjectsContainer,
      objectsContainer,
      showDeleteConfirmation,
      selectObjectFolderOrObjectsWithContext,
      onDeleteObjects,
      forceUpdateList,
      onObjectModified,
    ]
  );

  const bulkCut = React.useCallback(
    async () => {
      if (isListLocked) return;
      const topLevelItems = getSelectionTopLevelNodes(
        selectedObjectFolderOrObjectsWithContext
      );
      if (topLevelItems.length === 0) return;
      // Serialize while C++ objects are still alive, before any deletion.
      const clipboardPayload = serializeObjectFolderOrObjectsForClipboard(
        topLevelItems
      );
      if (!clipboardPayload) return;
      // Write to the OS clipboard only if the user confirms deletion, so
      // a cancelled cut does not pollute the clipboard.
      const deleted = await bulkDelete();
      if (!deleted) return;
      writeObjectFolderOrObjectsToClipboard(clipboardPayload);
    },
    [isListLocked, selectedObjectFolderOrObjectsWithContext, bulkDelete]
  );

  const bulkPaste = React.useCallback(
    () => {
      if (isListLocked) return;
      if (selectedObjectFolderOrObjectsWithContext.length === 0) return;
      const referenceItem =
        selectedObjectFolderOrObjectsWithContext[
          selectedObjectFolderOrObjectsWithContext.length - 1
        ];
      const { objectFolderOrObject, global } = referenceItem;
      const destinationFolder = objectFolderOrObject.isFolder()
        ? objectFolderOrObject
        : objectFolderOrObject.getParent();
      const positionInFolder = objectFolderOrObject.isFolder()
        ? objectFolderOrObject.getChildrenCount()
        : destinationFolder.getChildPosition(objectFolderOrObject) + 1;

      const isTheFirstOfItsTypeInProject = getObjectFolderOrObjectsClipboardObjectTypes().some(
        objectType =>
          !gd.UsedObjectTypeFinder.scanProject(project, objectType)
      );

      const pastedContent = pasteObjectFolderOrObjectsFromClipboard({
        project,
        globalObjectsContainer,
        objectsContainer,
        global,
        destinationFolder,
        positionInFolder,
      });
      if (!pastedContent) return;
      const { createdObjects, topLevelObjectFolderOrObjects } = pastedContent;
      if (topLevelObjectFolderOrObjects.length === 0) return;

      onObjectModified(true);
      // Only fire object hooks when actual objects were created; pasting
      // empty folders produces topLevelObjectFolderOrObjects but no objects.
      if (createdObjects.length > 0) {
        if (onObjectPasted) onObjectPasted(createdObjects[0]);
        onObjectCreated(createdObjects, isTheFirstOfItsTypeInProject);
      }
      forceUpdateList();
      selectObjectFolderOrObjectsWithContext(
        topLevelObjectFolderOrObjects.map(pastedObjectFolderOrObject => ({
          objectFolderOrObject: pastedObjectFolderOrObject,
          global,
        }))
      );
    },
    [
      isListLocked,
      selectedObjectFolderOrObjectsWithContext,
      project,
      globalObjectsContainer,
      objectsContainer,
      onObjectPasted,
      onObjectModified,
      onObjectCreated,
      forceUpdateList,
      selectObjectFolderOrObjectsWithContext,
    ]
  );

  const bulkSetAsGlobalObject = React.useCallback(
    (
      i18n: I18nType,
      options?: {| folder?: gdObjectFolderOrObject, index?: number |}
    ) => {
      if (!globalObjectsContainer) return;
      const objectItems = selectedObjectFolderOrObjectsWithContext.filter(
        item => !item.global && !item.objectFolderOrObject.isFolder()
      );
      if (objectItems.length === 0) return;

      for (const item of objectItems) {
        const objectName = item.objectFolderOrObject.getObject().getName();
        if (!objectsContainer.hasObjectNamed(objectName)) return;
        if (globalObjectsContainer.hasObjectNamed(objectName)) {
          showWarningBox(
            i18n._(
              t`A global object with this name already exists. Please change the object name before setting it as a global object`
            ),
            { delayToNextTick: true }
          );
          return;
        }
        if (beforeSetAsGlobalObject && !beforeSetAsGlobalObject(objectName)) {
          return;
        }
      }

      const answer = Window.showConfirmDialog(
        i18n._(
          t`Global elements help manage objects across multiple scenes and are recommended for frequently used objects. This action cannot be undone.

          Do you want to set these ${
            objectItems.length
          } objects as global objects?`
        )
      );
      if (!answer) return;

      const destinationFolder =
        options && options.folder && options.folder.isFolder()
          ? options.folder
          : globalObjectsContainer.getRootFolder();
      const baseIndex =
        options && typeof options.index === 'number'
          ? options.index
          : globalObjectsContainer.getObjectsCount();

      objectItems.forEach((item, i) => {
        objectsContainer.moveObjectFolderOrObjectToAnotherContainerInFolder(
          item.objectFolderOrObject,
          globalObjectsContainer,
          destinationFolder,
          baseIndex + i
        );
        onSetAsGlobalObject(item.objectFolderOrObject.getObject());
      });
      gd.WholeProjectRefactorer.updateBehaviorsSharedData(project);
      onObjectModified(true);
      selectObjectFolderOrObjectsWithContext(
        objectItems.map(item => ({
          objectFolderOrObject: item.objectFolderOrObject,
          global: true,
        }))
      );
    },
    [
      project,
      globalObjectsContainer,
      objectsContainer,
      beforeSetAsGlobalObject,
      onSetAsGlobalObject,
      onObjectModified,
      selectedObjectFolderOrObjectsWithContext,
      selectObjectFolderOrObjectsWithContext,
    ]
  );

  const bulkMoveToFolder = React.useCallback(
    (destinationFolder: gdObjectFolderOrObject) => {
      if (isListLocked) return;
      const topLevelItems = getSelectionTopLevelNodes(
        selectedObjectFolderOrObjectsWithContext
      );
      if (topLevelItems.length === 0) return;
      const global = topLevelItems[0].global;
      // Start after existing children so items arrive in their original
      // selection order, not reversed.
      let insertPosition = destinationFolder.getChildrenCount();
      topLevelItems.forEach(item => {
        const currentParent = item.objectFolderOrObject.getParent();
        if (destinationFolder === currentParent) return;
        currentParent.moveObjectFolderOrObjectToAnotherFolder(
          item.objectFolderOrObject,
          destinationFolder,
          insertPosition
        );
        insertPosition += 1;
      });
      onMovedObjectFolderOrObjectToAnotherFolderInSameContainer({
        objectFolderOrObject: destinationFolder,
        global,
      });
    },
    [
      isListLocked,
      selectedObjectFolderOrObjectsWithContext,
      onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
    ]
  );

  const bulkMoveToNewFolder = React.useCallback(
    () => {
      if (isListLocked) return;
      const topLevelItems = getSelectionTopLevelNodes(
        selectedObjectFolderOrObjectsWithContext
      );
      if (topLevelItems.length === 0) return;
      const global = topLevelItems[0].global;
      const container =
        global && globalObjectsContainer
          ? globalObjectsContainer
          : objectsContainer;
      const newFolder = container
        .getRootFolder()
        .insertNewFolder('NewFolder', 0);
      topLevelItems.forEach(item => {
        const currentParent = item.objectFolderOrObject.getParent();
        currentParent.moveObjectFolderOrObjectToAnotherFolder(
          item.objectFolderOrObject,
          newFolder,
          newFolder.getChildrenCount()
        );
      });
      onMovedObjectFolderOrObjectToAnotherFolderInSameContainer({
        objectFolderOrObject: newFolder,
        global,
      });
      selectObjectFolderOrObjectsWithContext([
        { objectFolderOrObject: newFolder, global },
      ]);
      onNewFolderCreated(newFolder, global);
    },
    [
      isListLocked,
      selectedObjectFolderOrObjectsWithContext,
      globalObjectsContainer,
      objectsContainer,
      onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
      selectObjectFolderOrObjectsWithContext,
      onNewFolderCreated,
    ]
  );

  const buildBulkMenuTemplate = React.useCallback(
    (i18n: I18nType): Array<MenuItemTemplate> => {
      const topLevelItems = getSelectionTopLevelNodes(
        selectedObjectFolderOrObjectsWithContext
      );
      if (topLevelItems.length === 0) return [];
      const global = topLevelItems[0].global;
      const container =
        global && globalObjectsContainer
          ? globalObjectsContainer
          : objectsContainer;
      const folderAndPathsInContainer = enumerateFoldersInContainer(container);
      folderAndPathsInContainer.unshift({
        path: i18n._(t`Root folder`),
        folder: container.getRootFolder(),
      });
      const movableFolderAndPaths = folderAndPathsInContainer.filter(
        ({ folder }) => {
          // Hide folders that are selected or are descendants of a selected
          // folder (can't move a folder into itself or its own subtree).
          if (
            topLevelItems.some(
              item =>
                folder === item.objectFolderOrObject ||
                folder.isADescendantOf(item.objectFolderOrObject)
            )
          )
            return false;
          // Hide a folder when every selected item is already a direct
          // child of it — moving there would be a no-op.
          if (
            topLevelItems.every(
              item => item.objectFolderOrObject.getParent() === folder
            )
          )
            return false;
          return true;
        }
      );

      const canSetAllAsGlobal =
        !global &&
        !!globalObjectsContainer &&
        canSetAsGlobalObject !== false &&
        topLevelItems.every(item => !item.objectFolderOrObject.isFolder());

      return [
        {
          label: i18n._(t`Copy`),
          click: () => bulkCopy(),
        },
        {
          label: i18n._(t`Cut`),
          click: () => bulkCut(),
          enabled: !isListLocked,
        },
        {
          label: getPasteMenuLabel(i18n),
          enabled: hasObjectFolderOrObjectsInClipboard() && !isListLocked,
          click: () => bulkPaste(),
        },
        {
          label: i18n._(t`Delete`),
          click: () => bulkDelete(),
          accelerator: 'Backspace',
          enabled: !isListLocked,
        },
        { type: 'separator' },
        isListLocked
          ? { label: i18n._('Move to folder'), enabled: false }
          : {
              label: i18n._('Move to folder'),
              submenu: [
                ...movableFolderAndPaths.map(({ folder, path }) => ({
                  label: path,
                  click: () => bulkMoveToFolder(folder),
                })),
                { type: 'separator' },
                {
                  label: i18n._(t`Create new folder...`),
                  click: () => bulkMoveToNewFolder(),
                },
              ],
            },
        canSetAllAsGlobal
          ? {
              label: i18n._(t`Set as global object`),
              enabled: !isListLocked,
              click: () => bulkSetAsGlobalObject(i18n),
            }
          : null,
      ].filter(Boolean);
    },
    [
      selectedObjectFolderOrObjectsWithContext,
      globalObjectsContainer,
      objectsContainer,
      canSetAsGlobalObject,
      isListLocked,
      bulkCopy,
      bulkCut,
      bulkPaste,
      bulkDelete,
      bulkMoveToFolder,
      bulkMoveToNewFolder,
      bulkSetAsGlobalObject,
    ]
  );

  return {
    bulkCopy,
    bulkDelete,
    bulkCut,
    bulkPaste,
    bulkSetAsGlobalObject,
    bulkMoveToFolder,
    bulkMoveToNewFolder,
    buildBulkMenuTemplate,
  };
}

export { useBulkObjectOperations };
