// @flow
import * as React from 'react';
import {
  ResourceMoverDialog,
  type MoveAllProjectResourcesResult,
} from '../ResourceMover';

export type FetchResourcesArgs = {|
  project: gdProject,
  resourceNames: Array<string>,
  onProgress: (count: number, total: number) => void,
|};

/**
 * Describe a way to fetch resources so that they can be used in the editor
 * and in previews. For the local editor, this means downloading the resources
 * that have URLs.
 */
export type ResourceFetcher = {|
  getResourcesToFetch: (project: gdProject) => Array<string>,
  fetchResources: FetchResourcesArgs => Promise<MoveAllProjectResourcesResult>,
|};

export const ResourceFetcherContext = React.createContext<?ResourceFetcher>(
  null
);

type RetryOrAbandonCallback = () => void;

type UseResourceFetcherOutput = {
  /**
   * Launch the fetching of the resources, if needed. For example, for the desktop
   * app, this means downloading the resources that have URLs.
   */
  ensureResourcesAreFetched: (
    project: gdProject
  ) => Promise<{|
    someResourcesWereFetched: boolean,
  |}>,
  /**
   * Render, if needed, the dialog that will show the progress of resources fetching.
   */
  renderResourceFetcherDialog: () => React.Node,
};

// TODO: replace by ResourceMover?
/**
 * Hook allowing to launch the fetching of resources, useful after opening a project
 * or adding assets from the asset store (as they must be downloaded on the desktop app).
 */
export const useResourceFetcher = (): UseResourceFetcherOutput => {
  const resourceFetcher = React.useContext(ResourceFetcherContext);
  const [progress, setProgress] = React.useState(0);
  const [isFetching, setIsFetching] = React.useState(false);
  const [result, setResult] = React.useState<?MoveAllProjectResourcesResult>(
    null
  );
  const [onRetry, setOnRetry] = React.useState<?RetryOrAbandonCallback>(null);
  const [onAbandon, setOnAbandon] = React.useState<?RetryOrAbandonCallback>(
    null
  );

  const ensureResourcesAreFetched = React.useCallback(
    async (project: gdProject) => {
      if (!resourceFetcher) throw new Error('No resourceFetcher was defined');

      const resourceNames = resourceFetcher.getResourcesToFetch(project);
      if (resourceNames.length === 0)
        return { someResourcesWereFetched: false };

      setProgress(0);
      setOnRetry(null);
      setOnAbandon(null);
      setResult(null);
      setIsFetching(true);

      // TODO: handle error?
      const result = await resourceFetcher.fetchResources({
        project,
        resourceNames,
        onProgress: (count, total) => {
          setProgress((count / total) * 100);
        },
      });

      setProgress(100);
      if (result.erroredResources.length === 0) {
        // No error happened: finish normally, closing the dialog.
        setIsFetching(false);
        setResult(null);
        return { someResourcesWereFetched: true };
      }

      // An error happened. Store the errors and offer a way to
      // retry.
      return new Promise(resolve => {
        setOnRetry(
          (): RetryOrAbandonCallback => () => {
            // Launch the fetch again, and solve the promise once
            // this new fetch resolve itself.
            resolve(ensureResourcesAreFetched(project));
          }
        );
        setOnAbandon(
          (): RetryOrAbandonCallback => () => {
            // Abandon: resolve immediately, closing the dialog
            setIsFetching(false);
            setResult(null);
            resolve({ someResourcesWereFetched: true });
          }
        );

        // Display the errors to the user:
        setResult(result);
        setIsFetching(false);
      });
    },
    [resourceFetcher]
  );

  const renderResourceFetcherDialog = () => {
    const hasErrors = result && result.erroredResources.length >= 0;
    if (!isFetching && !hasErrors) return null;

    return (
      <ResourceMoverDialog
        progress={progress}
        result={result}
        onAbandon={onAbandon}
        onRetry={onRetry}
        genericError={null}
      />
    );
  };

  return {
    ensureResourcesAreFetched,
    renderResourceFetcherDialog,
  };
};
