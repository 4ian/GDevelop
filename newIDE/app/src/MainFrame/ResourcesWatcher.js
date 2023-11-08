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

  const informEditorsResourceExternallyChanged = React.useCallback(
    (resourceInfo: {| identifier: string |}) => {
      ResourcesLoader.burstAllUrlsCache();
      editorTabs.editors.forEach(editorTab => {
        if (
          editorTab.editorRef &&
          editorTab.editorRef.editor &&
          editorTab.editorRef.editor.onResourceExternallyChanged
        ) {
          // Each editor container has an accessible editor property.
          // $FlowFixMe[not-a-function]
          editorTab.editorRef.editor.onResourceExternallyChanged(resourceInfo);
        }
      });
    },
    [editorTabs]
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
      if (fileMetadata && storageProvider.setupResourcesWatcher) {
        const unsubscribe = storageProvider.setupResourcesWatcher({
          fileMetadata,
          callback: informEditorsResourceExternallyChanged,
          options: {
            isProjectSplitInMultipleFiles,
          },
        });
        return unsubscribe;
      }
    },
    [
      fileMetadata,
      informEditorsResourceExternallyChanged,
      getStorageProvider,
      watchProjectFolderFilesForLocalProjects,
      isProjectSplitInMultipleFiles,
    ]
  );
};
export default useResourcesWatcher;
