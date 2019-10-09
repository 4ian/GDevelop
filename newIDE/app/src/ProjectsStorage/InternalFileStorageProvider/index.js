// @flow
import * as React from 'react';
import { type StorageProvider } from '../index';
import internalExampleFiles from './InternalExampleFiles';
import DownloadSaveDialog from './DownloadSaveDialog';

/**
 * "Internal" storage giving access to embedded examples.
 * Used for the web-app.
 */
export default (({ setDialog, closeDialog }) => ({
  onOpen: (url: string) => {
    if (internalExampleFiles[url])
      return Promise.resolve(internalExampleFiles[url]);

    return Promise.reject(new Error(`Unknown built-in game with URL ${url}`));
  },
  onSaveProject: (project: gdProject) => {
    return new Promise(resolve => {
      setDialog(() => (
        <DownloadSaveDialog
          onDone={() => {
            closeDialog();
            resolve(false);
          }}
          project={project}
        />
      ));
    });
  },
}): StorageProvider);
