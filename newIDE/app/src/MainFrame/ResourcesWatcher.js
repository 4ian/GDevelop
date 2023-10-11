import * as React from 'react';
import ResourcesLoader from '../ResourcesLoader';

const useResourcesWatcher = (getStorageProvider, fileMetadata, editorTabs) => {
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
      if (fileMetadata && storageProvider.setupResourcesWatcher) {
        const unsubscribe = storageProvider.setupResourcesWatcher(
          fileMetadata,
          informEditorsResourceExternallyChanged
        );
        return unsubscribe;
      }
    },
    [fileMetadata, informEditorsResourceExternallyChanged, getStorageProvider]
  );
};
export default useResourcesWatcher;
