// @flow
import * as React from 'react';
import {
  enumerateAllChildrenInFolderMatchingSearch,
  type ObjectFolderOrObjectWithContext,
} from './EnumerateObjectFolderOrObject';

/**
 * Manages which objects/folders are selected in the Objects panel.
 *
 * Wraps the external `onObjectFolderOrObjectsWithContextSelected` callback with
 * section-tracking so that "Select All" and "Paste with no selection" know
 * whether to operate on the scene or global objects section even when the
 * selection is currently empty.
 */
function useObjectsSelection({
  selectedObjectFolderOrObjectsWithContext,
  globalObjectsRootFolder,
  objectsRootFolder,
  searchText,
  onObjectFolderOrObjectsWithContextSelected,
}: {|
  selectedObjectFolderOrObjectsWithContext: Array<ObjectFolderOrObjectWithContext>,
  globalObjectsRootFolder: gdObjectFolderOrObject | null,
  objectsRootFolder: gdObjectFolderOrObject,
  searchText: string,
  onObjectFolderOrObjectsWithContextSelected: (
    items: Array<ObjectFolderOrObjectWithContext>
  ) => void,
|}): {|
  lastSectionWasGlobalRef: {| current: boolean |},
  selectObjectFolderOrObjectsWithContext: (
    items: Array<ObjectFolderOrObjectWithContext>
  ) => void,
  selectObjectFolderOrObjectWithContext: (
    item: ?ObjectFolderOrObjectWithContext
  ) => void,
  selectAllInSection: () => void,
  deselectAll: () => void,
|} {
  // Tracks the last section (false = scene, true = global) the user
  // interacted with, so that Ctrl+A / paste with no selection work correctly
  // even when nothing is currently selected.
  const lastSectionWasGlobalRef = React.useRef<boolean>(false);

  const selectObjectFolderOrObjectsWithContext = React.useCallback(
    (
      objectFolderOrObjectsWithContext: Array<ObjectFolderOrObjectWithContext>
    ) => {
      if (objectFolderOrObjectsWithContext.length > 0) {
        lastSectionWasGlobalRef.current =
          objectFolderOrObjectsWithContext[0].global;
      }
      onObjectFolderOrObjectsWithContextSelected(
        objectFolderOrObjectsWithContext
      );
    },
    [onObjectFolderOrObjectsWithContextSelected]
  );

  const selectObjectFolderOrObjectWithContext = React.useCallback(
    (objectFolderOrObjectWithContext: ?ObjectFolderOrObjectWithContext) => {
      selectObjectFolderOrObjectsWithContext(
        objectFolderOrObjectWithContext ? [objectFolderOrObjectWithContext] : []
      );
    },
    [selectObjectFolderOrObjectsWithContext]
  );

  const selectAllInSection = React.useCallback(
    () => {
      const preferGlobal =
        selectedObjectFolderOrObjectsWithContext.length > 0
          ? selectedObjectFolderOrObjectsWithContext[0].global
          : lastSectionWasGlobalRef.current;
      const rootFolder =
        preferGlobal && globalObjectsRootFolder
          ? globalObjectsRootFolder
          : objectsRootFolder;
      // Derive the flag from the chosen root so that if globalObjectsRootFolder
      // becomes null while preferGlobal is still true, items are not tagged as
      // global when they actually live in the scene container.
      const global = rootFolder !== objectsRootFolder;
      selectObjectFolderOrObjectsWithContext(
        enumerateAllChildrenInFolderMatchingSearch(rootFolder, searchText).map(
          objectFolderOrObject => ({
            objectFolderOrObject,
            global,
          })
        )
      );
    },
    [
      selectedObjectFolderOrObjectsWithContext,
      globalObjectsRootFolder,
      objectsRootFolder,
      searchText,
      selectObjectFolderOrObjectsWithContext,
    ]
  );

  const deselectAll = React.useCallback(
    () => selectObjectFolderOrObjectsWithContext([]),
    [selectObjectFolderOrObjectsWithContext]
  );

  return {
    lastSectionWasGlobalRef,
    selectObjectFolderOrObjectsWithContext,
    selectObjectFolderOrObjectWithContext,
    selectAllInSection,
    deselectAll,
  };
}

export { useObjectsSelection };
