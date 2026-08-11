// @flow
import { t } from '@lingui/macro';
import { type StorageProvider, type FileMetadata } from '../index';
import axios from 'axios';
import {
  POSITIONAL_ARGUMENTS_KEY,
  type AppArguments,
} from '../../Utils/Window';
import { parseConstantsFromToml } from '../MultiFileProjectFormat';

const isURL = (filename: string) => {
  return (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('ftp://') ||
    filename.startsWith('blob:') ||
    filename.startsWith('data:')
  );
};

const isDeprecatedExampleSchemeURL = (filename: string) => {
  return filename.startsWith('example://');
};

const canHaveSiblingFiles = (url: string): boolean =>
  url.startsWith('http://') ||
  url.startsWith('https://') ||
  url.startsWith('ftp://');

const getSiblingConstantsUrl = (url: string): string => {
  const projectUrl = new URL(url);
  const constantsUrl = new URL('constants.toml', projectUrl);
  // Private templates use query-string authorization. URL resolution drops the
  // query string, so copy it to the sibling file request.
  constantsUrl.search = projectUrl.search;
  return constantsUrl.toString();
};

const isMissingOptionalConstantsFileError = (error: any): boolean =>
  !!error &&
  !!error.response &&
  (error.response.status === 403 || error.response.status === 404);

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

      // $FlowFixMe[underconstrained-implicit-instantiation]
      const response = await axios.get(url);
      if (!response.data)
        throw new Error("Can't parse data from the URL (is it valid JSON?)");

      let constants;
      if (canHaveSiblingFiles(url)) {
        try {
          const constantsResponse = await axios.get<string>(
            getSiblingConstantsUrl(url)
          );
          constants = parseConstantsFromToml(constantsResponse.data || '');
        } catch (error) {
          // Existing examples and URL projects are single-file projects and do
          // not have constants.toml. Their CDN reports a missing object as 403.
          // Keep these projects loadable while supporting the companion file
          // for newer projects.
          if (!isMissingOptionalConstantsFileError(error)) throw error;
        }
      }

      return {
        content: response.data,
        ...(constants ? { constants } : {}),
      };
    },
  }),
}: StorageProvider);
