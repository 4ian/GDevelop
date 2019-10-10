// @flow
import { type StorageProvider, type FileMetadata } from '../index';
import internalExampleFiles from './InternalExampleFiles';

/**
 * "Internal" storage giving access to embedded examples.
 * Used for the web-app.
 */
export default ({
  name: 'Internal files',
  hiddenInOpenDialog: true,
  hiddenInSaveDialog: true,
  createOperations: ({ setDialog, closeDialog }) => ({
    onOpen: (fileMetadata: FileMetadata) => {
      const url = fileMetadata.fileIdentifier;
      if (internalExampleFiles[url])
        return Promise.resolve({
          content: internalExampleFiles[url],
          fileMetadata,
        });

      return Promise.reject(new Error(`Unknown built-in game with URL ${url}`));
    },
  }),
}: StorageProvider);
