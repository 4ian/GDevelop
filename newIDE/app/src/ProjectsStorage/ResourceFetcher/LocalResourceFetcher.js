// @flow
import {
  type ResourceFetcher,
  type FetchAllProjectResourcesResult,
  type FetchAllProjectResourcesFunction,
  type CleanAndFetchAllProjectResourcesOptionsWithoutProgress,
  cleanUpResourceNames,
} from './index';
import LocalFileStorageProvider from '../LocalFileStorageProvider';
import { moveUrlResourcesToLocalFiles } from '../LocalFileStorageProvider/LocalFileResourceMover';
import UrlStorageProvider from '../UrlStorageProvider';
import { fetchRelativeResourcesToFullUrls } from '../UrlStorageProvider/UrlResourceFetcher';

const fetchers: {
  [string]: FetchAllProjectResourcesFunction,
} = {
  // The local file storage provider fetches the resources that are URLs
  // by downloading them locally.
  [LocalFileStorageProvider.internalName]: moveUrlResourcesToLocalFiles,
  // The URL storage consider relative resources to be relative to the project
  // URL. This allows to open local projects uploaded to GitHub for example.
  [UrlStorageProvider.internalName]: fetchRelativeResourcesToFullUrls,
};

const LocalResourceFetcher: ResourceFetcher = {
  fetchAllProjectResources: async (
    options: CleanAndFetchAllProjectResourcesOptionsWithoutProgress
  ): Promise<FetchAllProjectResourcesResult> => {
    cleanUpResourceNames(options);

    if (
      !options.storageProvider ||
      !options.storageProviderOperations ||
      !options.fileMetadata
    ) {
      return {
        erroredResources: [],
      };
    }

    const { storageProvider } = options;
    const fetcher = fetchers[storageProvider.internalName];
    if (!fetcher)
      throw new Error(
        `Can't find a ResourceFetcher for ${
          storageProvider.internalName
        } - have you registered the storage provider here?`
      );

    return fetcher(options);
  },
};

export default LocalResourceFetcher;
