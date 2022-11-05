// @flow
import * as React from 'react';
import { useGenericRetryableProcessWithProgress } from '../../Utils/UseGenericRetryableProcessWithProgress';
import { type StorageProviderOperations, type StorageProvider } from '../index';
import { type FileMetadata } from '..';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

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
  options: FetchAllProjectResourcesOptions
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
    options: FetchAllProjectResourcesOptionsWithoutProgress
  ) => Promise<void>,
  /**
   * Render, if needed, the dialog that will show the progress of resources fetching.
   */
  renderResourceFetcherDialog: () => React.Node,
|};

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
  } = useGenericRetryableProcessWithProgress<FetchAllProjectResourcesOptionsWithoutProgress>(
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
