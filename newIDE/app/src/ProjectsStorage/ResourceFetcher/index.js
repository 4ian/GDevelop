// @flow
import * as React from 'react';
import { useGenericRetryableProcessWithProgress } from '../../Utils/UseGenericRetryableProcessWithProgress';
import { type StorageProviderOperations, type StorageProvider } from '../index';
import { type FileMetadata } from '..';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

export type EnsureResourcesAreFetchedOptions = {|
  project: ?gdProject,
  fileMetadata: ?FileMetadata,
  storageProvider: StorageProvider,
  storageProviderOperations: StorageProviderOperations,
  authenticatedUser?: AuthenticatedUser,
|};

export type FetchAllProjectResourcesOptions = {|
  project: gdProject,
  fileMetadata: FileMetadata,
  storageProvider: StorageProvider,
  storageProviderOperations: StorageProviderOperations,
  authenticatedUser?: AuthenticatedUser,
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
    getOptions: () => EnsureResourcesAreFetchedOptions
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
  } = useGenericRetryableProcessWithProgress<
    () => EnsureResourcesAreFetchedOptions
  >({
    onDoProcess: React.useCallback(
      (getOptions, onProgress) => {
        // Get the latest options. Calling `getOptions` ensure we always
        // get the latest up-to-date `project` and `fileMetadata`.
        const {
          project,
          fileMetadata,
          storageProvider,
          storageProviderOperations,
          authenticatedUser,
        } = getOptions();

        if (!project || !fileMetadata) {
          // The project or fileMetadata are not valid anymore (the project
          // was closed for example), abort the process.
          return Promise.resolve({
            erroredResources: [],
          });
        }

        return resourceFetcher.fetchAllProjectResources({
          project,
          fileMetadata,
          storageProvider,
          storageProviderOperations,
          authenticatedUser,
          onProgress,
        });
      },
      [resourceFetcher]
    ),
  });

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
