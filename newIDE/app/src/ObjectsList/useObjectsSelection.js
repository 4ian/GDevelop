// @flow
import * as React from 'react';
import { enumerateAllChildrenInFolder } from './EnumerateObjectFolderOrObject';
import { type ObjectFolderOrObjectWithContext } from './EnumerateObjectFolderOrObject';

/**
 * Manages which objects/folders are selected in the Objects panel.
 *
 * Wraps the external `onObjectFolderOrObjectWithContextSelected` callback with
 * section-tracking so that "Select All" and "Paste with no selection" know
 * whether to operate on the scene or global objects section even when the
 * selection is currently empty.
 */
function useObjectsSelection({
  selectedObjectFolderOrObjectsWithContext,
  globalObjectsRootFolder,
  objectsRootFolder,
  onObjectFolderOrObjectWithContextSelected,
}: {|
  selectedObjectFolderOrObjectsWithContext: Array<ObjectFolderOrObjectWithContext>,
  globalObjectsRootFolder: gdObjectFolderOrObject | null,
  objectsRootFolder: gdObjectFolderOrObject,
  onObjectFolderOrObjectWithContextSelected: (
    items: Array<ObjectFolderOrObjectWithContext>
  ) => void,
|}): {|
  lastSectionRef: {| current: boolean |},
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
  const lastSectionRef = React.useRef<boolean>(false);

  const selectObjectFolderOrObjectsWithContext = React.useCallback(
    (objectFolderOrObjectsWithContext: Array<ObjectFolderOrObjectWithContext>) => {
      if (objectFolderOrObjectsWithContext.length > 0) {
        lastSectionRef.current = objectFolderOrObjectsWithContext[0].global;
      }
      onObjectFolderOrObjectWithContextSelected(objectFolderOrObjectsWithContext);
    },
    [onObjectFolderOrObjectWithContextSelected]
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
      const global =
        selectedObjectFolderOrObjectsWithContext.length > 0
          ? selectedObjectFolderOrObjectsWithContext[0].global
          : lastSectionRef.current;
      const rootFolder =
        global && globalObjectsRootFolder
          ? globalObjectsRootFolder
          : objectsRootFolder;
      selectObjectFolderOrObjectsWithContext(
        enumerateAllChildrenInFolder(rootFolder).map(objectFolderOrObject => ({
          objectFolderOrObject,
          global,
        }))
      );
    },
    [
      selectedObjectFolderOrObjectsWithContext,
      globalObjectsRootFolder,
      objectsRootFolder,
      selectObjectFolderOrObjectsWithContext,
    ]
  );

  const deselectAll = React.useCallback(
    () => selectObjectFolderOrObjectsWithContext([]),
    [selectObjectFolderOrObjectsWithContext]
  );

  return {
    lastSectionRef,
    selectObjectFolderOrObjectsWithContext,
    selectObjectFolderOrObjectWithContext,
    selectAllInSection,
    deselectAll,
  };
}

export { useObjectsSelection };
