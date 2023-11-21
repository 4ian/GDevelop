// @flow
import * as React from 'react';
import ResourcesLoader from '../ResourcesLoader';
import PreferencesContext from './Preferences/PreferencesContext';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';
import { type EditorTabsState } from './EditorTabs/EditorTabsHandler';

const useResourcesWatcher = ({
  getStorageProvider,
  fileMetadata,
  editorTabs,
  isProjectSplitInMultipleFiles,
}: {|
  getStorageProvider: () => StorageProvider,
  fileMetadata: ?FileMetadata,
  editorTabs: EditorTabsState,
  isProjectSplitInMultipleFiles: boolean,
|}) => {
  const {
    values: { watchProjectFolderFilesForLocalProjects },
  } = React.useContext(PreferencesContext);
  // Whole fileMetadata object is not used because lastModifiedDate changes on save
  // thus triggering the effect.
  const fileIdentifier = fileMetadata ? fileMetadata.fileIdentifier : null;

  // Callbacks are extracted from editorTabs to avoid redefining informEditorsResourceExternallyChanged
  // thus triggering the effect on each active tab change (stored in editorTabs).
  const callbacks = React.useMemo(
    () =>
      editorTabs.editors
        .map(
          editorTab =>
            editorTab.editorRef &&
            editorTab.editorRef.editor &&
            // Each editor container has an accessible editor property.
            // $FlowFixMe[prop-missing]
            editorTab.editorRef.editor.onResourceExternallyChanged
        )
        .filter(Boolean),
    [editorTabs.editors]
  );

  const informEditorsResourceExternallyChanged = React.useCallback(
    (resourceInfo: {| identifier: string |}) => {
      ResourcesLoader.burstAllUrlsCache();
      callbacks.forEach(callback => callback(resourceInfo));
    },
    [callbacks]
  );

  React.useEffect(
    () => {
      const storageProvider = getStorageProvider();
      if (
        storageProvider.internalName === 'LocalFile' &&
        !watchProjectFolderFilesForLocalProjects
      ) {
        return;
      }
      if (fileIdentifier && storageProvider.setupResourcesWatcher) {
        const unsubscribe = storageProvider.setupResourcesWatcher({
          fileIdentifier,
          callback: informEditorsResourceExternallyChanged,
          options: {
            isProjectSplitInMultipleFiles,
          },
        });
        return unsubscribe;
      }
    },
    [
      fileIdentifier,
      informEditorsResourceExternallyChanged,
      getStorageProvider,
      watchProjectFolderFilesForLocalProjects,
      isProjectSplitInMultipleFiles,
    ]
  );
};
export default useResourcesWatcher;
