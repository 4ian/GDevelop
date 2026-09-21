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
  pasteObjectFolderOrObjectsAndNotify,
  getPasteMenuLabel,
  getUniqueFolderName,
} from './ObjectFolderOrObjectsClipboard';
import { duplicateObjectFolderOrObjectsInPlace } from './ObjectFolderOrObjectsDuplicate';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import { type ShowConfirmDeleteDialogOptions } from '../UI/Alert/AlertContext';

const gd: libGDevelop = global.gd;

type ObjectWithContext = {| object: gdObject, global: boolean |};

type Props = {|
  isListLocked: boolean,
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  selectedObjectFolderOrObjectsWithContext: Array<ObjectFolderOrObjectWithContext>,
  canSetAsGlobalObject: ?boolean,

  selectObjectFolderOrObjectsWithContext: (
    items: Array<ObjectFolderOrObjectWithContext>
  ) => void,
  onObjectModified: (shouldForceUpdateList: boolean) => void,
  onObjectCreated: (
    objects: Array<gdObject>,
    isTheFirstOfItsTypeInProject: boolean
  ) => void,
  onObjectPasted: ?(gdObject) => void,
  onDeleteObjects: (
    objectsWithContext: Array<ObjectWithContext>,
    cb: (doRemove: boolean) => void
  ) => void,
  onMovedObjectFolderOrObjectToAnotherFolderInSameContainer: (
    item: ObjectFolderOrObjectWithContext
  ) => void,
  onSetAsGlobalObject: (object: gdObject) => void,
  beforeSetAsGlobalObject: ?(objectName: string) => boolean,
  showDeleteConfirmation: ShowConfirmDeleteDialogOptions => Promise<boolean>,
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
  bulkDuplicate: () => void,
  bulkSetAsGlobalObject: (
    i18n: I18nType,
    options?: {| folder?: gdObjectFolderOrObject, index?: number |}
  ) => void,
  buildBulkMenuTemplate: (i18n: I18nType) => Array<MenuItemTemplate>,
|} {
  // Pre-compute the de-nested selection once per selection change so that
  // bulkDelete, bulkMoveToFolder, bulkMoveToNewFolder, and buildBulkMenuTemplate
  // don't each call getSelectionTopLevelNodes independently.
  const topLevelSelectedItems = React.useMemo(
    () => getSelectionTopLevelNodes(selectedObjectFolderOrObjectsWithContext),
    [selectedObjectFolderOrObjectsWithContext]
  );
  const selectionIsGlobal = React.useMemo(
    () => topLevelSelectedItems.length > 0 && topLevelSelectedItems[0].global,
    [topLevelSelectedItems]
  );

  const bulkCopy = React.useCallback(
    () => {
      copyObjectFolderOrObjectsToClipboard(
        selectedObjectFolderOrObjectsWithContext
      );
    },
    [selectedObjectFolderOrObjectsWithContext]
  );

  const bulkDuplicate = React.useCallback(
    () => {
      if (isListLocked) return;

      const result = duplicateObjectFolderOrObjectsInPlace({
        project,
        globalObjectsContainer,
        objectsContainer,
        items: topLevelSelectedItems,
      });
      if (!result) return;

      // Duplicating existing objects can never introduce a new type to the
      // project — the originals are already present.
      onObjectCreated(result.createdObjects, false);
      onObjectModified(true);
      selectObjectFolderOrObjectsWithContext(result.duplicatedItems);
    },
    [
      isListLocked,
      topLevelSelectedItems,
      project,
      globalObjectsContainer,
      objectsContainer,
      onObjectCreated,
      onObjectModified,
      selectObjectFolderOrObjectsWithContext,
    ]
  );

  const bulkDelete = React.useCallback(
    async (): Promise<boolean> => {
      if (isListLocked) return false;
      if (topLevelSelectedItems.length === 0) return false;
      const container =
        selectionIsGlobal && globalObjectsContainer
          ? globalObjectsContainer
          : objectsContainer;
      const topLevelObjectFolderOrObjects = topLevelSelectedItems.map(
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
        global: selectionIsGlobal,
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
      topLevelSelectedItems,
      selectionIsGlobal,
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
      if (topLevelSelectedItems.length === 0) return;
      // Serialize while C++ objects are still alive, before any deletion.
      const clipboardPayload = serializeObjectFolderOrObjectsForClipboard(
        topLevelSelectedItems
      );
      if (!clipboardPayload) return;
      // Write to the OS clipboard only if the user confirms deletion, so
      // a cancelled cut does not pollute the clipboard.
      const deleted = await bulkDelete();
      if (!deleted) return;
      writeObjectFolderOrObjectsToClipboard(clipboardPayload);
    },
    [isListLocked, topLevelSelectedItems, bulkDelete]
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

      pasteObjectFolderOrObjectsAndNotify({
        project,
        globalObjectsContainer,
        objectsContainer,
        global,
        destinationFolder,
        positionInFolder,
        onObjectModified,
        onObjectPasted,
        onObjectCreated,
        selectObjectFolderOrObjectsWithContext,
      });
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
      selectObjectFolderOrObjectsWithContext,
    ]
  );

  const bulkSetAsGlobalObject = React.useCallback(
    (
      i18n: I18nType,
      options?: {| folder?: gdObjectFolderOrObject, index?: number |}
    ) => {
      if (!globalObjectsContainer) return;
      // Only scene objects (not folders, not already-global) can be promoted.
      const candidates = selectedObjectFolderOrObjectsWithContext.filter(
        item => !item.global && !item.objectFolderOrObject.isFolder()
      );
      if (candidates.length === 0) return;

      // Filter out items that cannot be promoted, then show a single warning
      // listing all the name conflicts rather than one blocking dialog each.
      const conflictingObjectNames = [];
      const objectItems = candidates.filter(item => {
        const objectName = item.objectFolderOrObject.getObject().getName();
        if (!objectsContainer.hasObjectNamed(objectName)) return false;
        if (globalObjectsContainer.hasObjectNamed(objectName)) {
          conflictingObjectNames.push(objectName);
          return false;
        }
        if (beforeSetAsGlobalObject && !beforeSetAsGlobalObject(objectName)) {
          return false;
        }
        return true;
      });
      if (conflictingObjectNames.length > 0) {
        showWarningBox(
          i18n._(
            t`Global objects with these names already exist: ${conflictingObjectNames.join(
              ', '
            )}. Please rename the objects before setting them as global objects.`
          ),
          { delayToNextTick: true }
        );
      }
      if (objectItems.length === 0) return;

      const answer = Window.showConfirmDialog(
        i18n._(
          t`Global elements help manage objects across multiple scenes and are recommended for frequently used objects. This action cannot be undone.

          Do you want to set these ${
            objectItems.length
          } objects as global objects?`
        )
      );
      if (!answer) return;

      const optionsFolder = options && options.folder;
      const destinationFolder: gdObjectFolderOrObject =
        optionsFolder && optionsFolder.isFolder()
          ? optionsFolder
          : globalObjectsContainer.getRootFolder();
      // Use getChildrenCount() of the target folder — not getObjectsCount() of
      // the container — so the index stays in-range when the folder contains
      // sub-folders (object count ≠ folder child count).
      const baseIndex =
        options && typeof options.index === 'number'
          ? options.index
          : destinationFolder.getChildrenCount();

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
      if (topLevelSelectedItems.length === 0) return;
      // Start after existing children so items arrive in their original
      // selection order, not reversed.
      let insertPosition = destinationFolder.getChildrenCount();
      topLevelSelectedItems.forEach(item => {
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
        global: selectionIsGlobal,
      });
    },
    [
      isListLocked,
      topLevelSelectedItems,
      selectionIsGlobal,
      onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
    ]
  );

  const bulkMoveToNewFolder = React.useCallback(
    () => {
      if (isListLocked) return;
      if (topLevelSelectedItems.length === 0) return;
      const container =
        selectionIsGlobal && globalObjectsContainer
          ? globalObjectsContainer
          : objectsContainer;
      const rootFolder = container.getRootFolder();
      const uniqueName = getUniqueFolderName(rootFolder, 'NewFolder');
      const newFolder = rootFolder.insertNewFolder(uniqueName, 0);
      topLevelSelectedItems.forEach(item => {
        const currentParent = item.objectFolderOrObject.getParent();
        currentParent.moveObjectFolderOrObjectToAnotherFolder(
          item.objectFolderOrObject,
          newFolder,
          newFolder.getChildrenCount()
        );
      });
      onMovedObjectFolderOrObjectToAnotherFolderInSameContainer({
        objectFolderOrObject: newFolder,
        global: selectionIsGlobal,
      });
      selectObjectFolderOrObjectsWithContext([
        { objectFolderOrObject: newFolder, global: selectionIsGlobal },
      ]);
      onNewFolderCreated(newFolder, selectionIsGlobal);
    },
    [
      isListLocked,
      topLevelSelectedItems,
      selectionIsGlobal,
      globalObjectsContainer,
      objectsContainer,
      onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
      selectObjectFolderOrObjectsWithContext,
      onNewFolderCreated,
    ]
  );

  const buildBulkMenuTemplate = React.useCallback(
    (i18n: I18nType): Array<MenuItemTemplate> => {
      if (topLevelSelectedItems.length === 0) return [];
      const container =
        selectionIsGlobal && globalObjectsContainer
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
            topLevelSelectedItems.some(
              item =>
                folder === item.objectFolderOrObject ||
                folder.isADescendantOf(item.objectFolderOrObject)
            )
          )
            return false;
          // Hide a folder when every selected item is already a direct
          // child of it — moving there would be a no-op.
          if (
            topLevelSelectedItems.every(
              item => item.objectFolderOrObject.getParent() === folder
            )
          )
            return false;
          return true;
        }
      );

      const canSetAllAsGlobal =
        !selectionIsGlobal &&
        !!globalObjectsContainer &&
        canSetAsGlobalObject !== false &&
        topLevelSelectedItems.every(
          item => !item.objectFolderOrObject.isFolder()
        );

      const menuItems: Array<MenuItemTemplate | null> = [
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
          label: i18n._(t`Duplicate`),
          click: () => bulkDuplicate(),
          enabled: !isListLocked,
          accelerator: 'CmdOrCtrl+D',
        },
        {
          label: i18n._(t`Delete`),
          click: () => {
            bulkDelete();
          },
          accelerator: 'Backspace',
          enabled: !isListLocked,
        },
        { type: 'separator' },
        isListLocked
          ? { label: i18n._(t`Move to folder`), enabled: false }
          : {
              label: i18n._(t`Move to folder`),
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
      ];
      return menuItems.filter(Boolean);
    },
    [
      topLevelSelectedItems,
      selectionIsGlobal,
      globalObjectsContainer,
      objectsContainer,
      canSetAsGlobalObject,
      isListLocked,
      bulkCopy,
      bulkCut,
      bulkPaste,
      bulkDuplicate,
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
    bulkDuplicate,
    bulkSetAsGlobalObject,
    buildBulkMenuTemplate,
  };
}

export { useBulkObjectOperations };
