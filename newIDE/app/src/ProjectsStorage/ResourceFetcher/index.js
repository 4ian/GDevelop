// @flow
import * as React from 'react';
import path from 'path';
import { useGenericRetryableProcessWithProgress } from '../../Utils/UseGenericRetryableProcessWithProgress';
import { type StorageProviderOperations, type StorageProvider } from '../index';
import { type FileMetadata } from '..';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { isFetchableUrl } from '../../ResourcesList/ResourceUtils';
import {
  extractFilenameWithExtensionFromProductAuthorizedUrl,
  isProductAuthorizedResourceUrl,
} from '../../Utils/GDevelopServices/Shop';
import {
  extractFilenameWithExtensionFromPublicAssetResourceUrl,
  isPublicAssetResourceUrl,
} from '../../Utils/GDevelopServices/Asset';

export type CleanAndFetchAllProjectResourcesOptionsWithoutProgress = {
  project: gdProject,
  fileMetadata: ?FileMetadata,
  storageProvider: ?StorageProvider,
  storageProviderOperations: ?StorageProviderOperations,
  authenticatedUser?: AuthenticatedUser,
};

export type FetchAllProjectResourcesOptionsWithoutProgress = {|
  project: gdProject,
  fileMetadata: FileMetadata,
  storageProvider: StorageProvider,
  storageProviderOperations: StorageProviderOperations,
  authenticatedUser?: AuthenticatedUser,
|};

export type FetchAllProjectResourcesOptions = {|
  ...FetchAllProjectResourcesOptionsWithoutProgress,
  onProgress: (number, number) => void,
|};

export type FetchAllProjectResourcesResult = {|
  erroredResources: Array<{|
    resourceName: string,
    error: Error,
  |}>,
|};

export type FetchAllProjectResourcesFunction = (
  options: CleanAndFetchAllProjectResourcesOptionsWithoutProgress
) => Promise<FetchAllProjectResourcesResult>;

export type ResourceFetcher = {|
  fetchAllProjectResources: FetchAllProjectResourcesFunction,
|};

type UseResourceFetcherOutput = {|
  /**
   * Launch the fetching of the resources, when new resources were added from a source
   * and must optionally be fetched by the storage provider (e.g: a URL to be downloaded).
   */
  ensureResourcesAreFetched: (
    options: CleanAndFetchAllProjectResourcesOptionsWithoutProgress
  ) => Promise<void>,
  /**
   * Render, if needed, the dialog that will show the progress of resources fetching.
   */
  renderResourceFetcherDialog: () => React.Node,
|};

export const cleanUpResourceNames = ({
  project,
}: CleanAndFetchAllProjectResourcesOptionsWithoutProgress) => {
  const resourcesManager = project.getResourcesManager();
  const allResourceNames = resourcesManager.getAllResourceNames().toJSArray();
  const resourceToFetchNames = allResourceNames.filter(resourceName => {
    const resource = resourcesManager.getResource(resourceName);

    return isFetchableUrl(resource.getFile());
  });

  resourceToFetchNames.forEach(resourceName => {
    const resource = resourcesManager.getResource(resourceName);
    const resourceFile = resource.getFile();
    let cleanedUpFilename;
    if (isProductAuthorizedResourceUrl(resourceFile)) {
      // Resource is a private asset.
      cleanedUpFilename = extractFilenameWithExtensionFromProductAuthorizedUrl(
        resourceFile
      );
    } else if (isPublicAssetResourceUrl(resourceFile)) {
      // Resource is a public asset.
      cleanedUpFilename = extractFilenameWithExtensionFromPublicAssetResourceUrl(
        resourceFile
      );
    } else {
      // Resource is a generic url.
      cleanedUpFilename = path.basename(resourceFile);
    }
    resource.setName(cleanedUpFilename);
  });
};

/**
 * Hook allowing to launch the fetching of resources, useful after opening a project
 * or adding assets from the asset store (e.g: to download resources locally).
 */
export const useResourceFetcher = ({
  resourceFetcher,
}: {|
  resourceFetcher: ResourceFetcher,
|}): UseResourceFetcherOutput => {
  const {
    ensureProcessIsDone,
    renderProcessDialog,
  } = useGenericRetryableProcessWithProgress<CleanAndFetchAllProjectResourcesOptionsWithoutProgress>(
    {
      onDoProcess: React.useCallback(
        (options, onProgress) =>
          resourceFetcher.fetchAllProjectResources({
            ...options,
            onProgress,
          }),
        [resourceFetcher]
      ),
    }
  );

  return React.useMemo(
    () => ({
      ensureResourcesAreFetched: ensureProcessIsDone,
      renderResourceFetcherDialog: renderProcessDialog,
    }),
    [ensureProcessIsDone, renderProcessDialog]
  );
};

/**
 * A function passed down to components by MainFrame to allow them to ask the resources to be fetched,
 * after new resources were added.
 */
export type OnFetchNewlyAddedResourcesFunction = () => Promise<void>;
