// @flow
import { t } from '@lingui/macro';
import { type StorageProvider, type FileMetadata } from '../index';
import internalExampleFiles from './InternalExampleFiles';
import {
  POSITIONAL_ARGUMENTS_KEY,
  type AppArguments,
} from '../../Utils/Window';

/**
 * "Internal" storage giving access to embedded examples.
 * Used for the web-app.
 */
export default ({
  internalName: 'InternalFile',
  name: t`Internal files`,
  hiddenInOpenDialog: true,
  hiddenInSaveDialog: true,
  getFileMetadataFromAppArguments: (appArguments: AppArguments) => {
    if (!appArguments[POSITIONAL_ARGUMENTS_KEY]) return null;
    if (!appArguments[POSITIONAL_ARGUMENTS_KEY].length) return null;

    return {
      fileIdentifier: appArguments[POSITIONAL_ARGUMENTS_KEY][0],
    };
  },
  createOperations: ({ setDialog, closeDialog }) => ({
    onOpen: (fileMetadata: FileMetadata) => {
      const url = fileMetadata.fileIdentifier;
      if (internalExampleFiles[url])
        return Promise.resolve({
          content: internalExampleFiles[url],
        });

      return Promise.reject(new Error(`Unknown built-in game with URL ${url}`));
    },
  }),
}: StorageProvider);
