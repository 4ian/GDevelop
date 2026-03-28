// @flow
import * as React from 'react';
import ResourcesLoader from '../ResourcesLoader';
import PreferencesContext from './Preferences/PreferencesContext';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';

const callbacks: { [key: string]: Function } = {};

let callbackId = 1;
const getNewId = () => {
  return callbackId++;
};

export const registerOnResourceExternallyChangedCallback = (
  callback: Function
): string => {
  const id = getNewId().toString();
  callbacks[id] = callback;
  return id;
};

export const unregisterOnResourceExternallyChangedCallback = (
  callbackId: ?string
) => {
  if (!callbackId || !callbacks[callbackId]) return;
  delete callbacks[callbackId];
};

/**
 * Notify all registered editors that a resource file has changed.
 * This should be called whenever a resource's file is updated via a UI action
 * (e.g., replacing a resource file in the Resource Editor, or an external editor
 * updating a resource), so that PIXI textures, instance renderers, and the
 * in-game editor are all refreshed.
 */
export const notifyResourceFileChanged = (resourceInfo: {|
  identifier: string,
|}) => {
  ResourcesLoader.burstAllUrlsCache();
  Object.keys(callbacks).forEach(callbackId =>
    callbacks[callbackId](resourceInfo)
  );
};

const useResourcesWatcher = ({
  getStorageProvider,
  fileMetadata,
  isProjectSplitInMultipleFiles,
}: {|
  getStorageProvider: () => StorageProvider,
  fileMetadata: ?FileMetadata,
  isProjectSplitInMultipleFiles: boolean,
|}) => {
  const {
    values: { watchProjectFolderFilesForLocalProjects },
  } = React.useContext(PreferencesContext);
  // Whole fileMetadata object is not used because lastModifiedDate changes on save
  // thus triggering the effect.
  const fileIdentifier = fileMetadata ? fileMetadata.fileIdentifier : null;

  const informEditorsResourceExternallyChanged = React.useCallback(
    (resourceInfo: {| identifier: string |}) => {
      notifyResourceFileChanged(resourceInfo);
    },
    []
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
