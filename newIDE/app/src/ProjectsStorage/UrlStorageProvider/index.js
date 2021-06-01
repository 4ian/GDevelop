// @flow
import { t } from '@lingui/macro';
import { type StorageProvider, type FileMetadata } from '../index';
import axios from 'axios';
import {
  POSITIONAL_ARGUMENTS_KEY,
  type AppArguments,
} from '../../Utils/Window';

const isURL = (filename: string) => {
  return (
    filename.substr(0, 7) === 'http://' ||
    filename.substr(0, 8) === 'https://' ||
    filename.substr(0, 6) === 'ftp://'
  );
};

const isDeprecatedExampleSchemeURL = (filename: string) => {
  return filename.startsWith('example://');
};

/**
 * Storage allowing to download examples from an URL.
 * This is used for examples for the "Example Store".
 */
export default ({
  internalName: 'UrlStorageProvider',
  name: t`URL`,
  hiddenInOpenDialog: true,
  hiddenInSaveDialog: true,
  getFileMetadataFromAppArguments: (appArguments: AppArguments) => {
    if (!appArguments[POSITIONAL_ARGUMENTS_KEY]) return null;
    if (!appArguments[POSITIONAL_ARGUMENTS_KEY].length) return null;

    const argument = appArguments[POSITIONAL_ARGUMENTS_KEY][0];
    if (!isURL(argument) && !isDeprecatedExampleSchemeURL(argument))
      return null;

    return {
      fileIdentifier: argument,
    };
  },
  createOperations: ({ setDialog, closeDialog }) => ({
    onOpen: async (fileMetadata: FileMetadata) => {
      let url = fileMetadata.fileIdentifier;

      // Backward compatibility with URL arguments that were like "example://particle-effects-demo".
      if (isDeprecatedExampleSchemeURL(url)) {
        const exampleName = url.replace('example://', '');
        url = `https://resources.gdevelop-app.com/examples/${exampleName}/${exampleName}.json`;
      }

      const response = await axios.get(url);
      if (!response.data)
        throw new Error("Can't parse data from the URL (is it valid JSON?)");

      return {
        content: response.data,
      };
    },
  }),
}: StorageProvider);
