// @flow
import {
  type ResourceFetcher,
  type FetchAllProjectResourcesOptions,
  type FetchAllProjectResourcesResult,
  type FetchAllProjectResourcesFunction,
} from './index';
import LocalFileStorageProvider from '../LocalFileStorageProvider';
import { moveUrlResourcesToLocalFiles } from '../LocalFileStorageProvider/LocalFileResourceMover';
import UrlStorageProvider from '../UrlStorageProvider';
import CloudStorageProvider from '../CloudStorageProvider';
import { fetchRelativeResourcesToFullUrls } from '../UrlStorageProvider/UrlResourceFetcher';

const fetchNothing: FetchAllProjectResourcesFunction = async () => {
  return {
    erroredResources: [],
  };
};

const fetchers: {
  [string]: FetchAllProjectResourcesFunction,
} = {
  // The cloud storage has nothing to fetch, all resources are supposed
  // to be public URLs or URLs on GDevelop Cloud, accessed with a cookie.
  [CloudStorageProvider.internalName]: fetchNothing,
  // The local file storage provider fetches the resources that are URLs
  // by downloading them locally.
  [LocalFileStorageProvider.internalName]: moveUrlResourcesToLocalFiles,
  // The URL storage consider relative resources to be relative to the project
  // URL. This allows to open local projects uploaded to GitHub for example.
  [UrlStorageProvider.internalName]: fetchRelativeResourcesToFullUrls,
};

const LocalResourceFetcher: ResourceFetcher = {
  fetchAllProjectResources: async (
    options: FetchAllProjectResourcesOptions
  ): Promise<FetchAllProjectResourcesResult> => {
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
