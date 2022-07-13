// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from '../../UI/Table';
import { ColumnStackLayout } from '../../UI/Layout';
import LinearProgress from '../../UI/LinearProgress';

export type FetchedResources = {|
  erroredResources: Array<{|
    resourceName: string,
    error: Error,
  |}>,
  fetchedResources: Array<{|
    resourceName: string,
  |}>,
|};

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
  fetchResources: FetchResourcesArgs => Promise<FetchedResources>,
|};

export const ResourceFetcherContext = React.createContext<?ResourceFetcher>(
  null
);

type ResourceFetcherDialogProps = {|
  progress: number,
  fetchedResources: ?FetchedResources,
  onAbandon: ?() => void,
  onRetry: ?() => void,
|};

export const ResourceFetcherDialog = ({
  progress,
  fetchedResources,
  onAbandon,
  onRetry,
}: ResourceFetcherDialogProps) => {
  const hasErrors =
    fetchedResources && fetchedResources.erroredResources.length > 0;

  return (
    <Dialog
      actions={[
        onRetry ? (
          <DialogPrimaryButton
            label={<Trans>Retry</Trans>}
            primary
            onClick={onRetry}
            key="retry"
          />
        ) : null,
        <FlatButton
          label={
            onAbandon ? <Trans>Abandon</Trans> : <Trans>Please wait...</Trans>
          }
          disabled={!onAbandon}
          onClick={onAbandon}
          key="close"
        />,
      ]}
      cannotBeDismissed={!hasErrors}
      noMargin
      open
      maxWidth="sm"
    >
      <Line>
        <ColumnStackLayout expand>
          <Text>
            {hasErrors ? (
              <Trans>
                There were errors when fetching resources for the project. You
                can retry (recommended) or continue despite the errors. In this
                case, the project will be missing some resources.
              </Trans>
            ) : (
              <Trans>Resources needed for the project are fetched...</Trans>
            )}
          </Text>
          <Line noMargin expand>
            <LinearProgress variant="determinate" value={progress} />
          </Line>
          {hasErrors && fetchedResources ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderColumn>Resource name</TableHeaderColumn>
                  <TableHeaderColumn>Error</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fetchedResources.erroredResources.map(
                  ({ resourceName, error }) => (
                    <TableRow key={resourceName}>
                      <TableRowColumn>{resourceName}</TableRowColumn>
                      <TableRowColumn>{error.toString()}</TableRowColumn>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          ) : null}
        </ColumnStackLayout>
      </Line>
    </Dialog>
  );
};

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

/**
 * Hook allowing to launch the fetching of resources, useful after opening a project
 * or adding assets from the asset store (as they must be downloaded on the desktop app).
 */
export const useResourceFetcher = (): UseResourceFetcherOutput => {
  const resourceFetcher = React.useContext(ResourceFetcherContext);
  const [progress, setProgress] = React.useState(0);
  const [isFetching, setIsFetching] = React.useState(false);
  const [
    fetchedResources,
    setFetchedResources,
  ] = React.useState<?FetchedResources>(null);
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
      setFetchedResources(null);
      setIsFetching(true);

      // TODO: handle error?
      const fetchedResources = await resourceFetcher.fetchResources({
        project,
        resourceNames,
        onProgress: (count, total) => {
          setProgress((count / total) * 100);
        },
      });

      setProgress(100);
      if (fetchedResources.erroredResources.length === 0) {
        // No error happened: finish normally, closing the dialog.
        setIsFetching(false);
        setFetchedResources(null);
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
            setFetchedResources(null);
            resolve({ someResourcesWereFetched: true });
          }
        );

        // Display the errors to the user:
        setFetchedResources(fetchedResources);
        setIsFetching(false);
      });
    },
    [resourceFetcher]
  );

  const renderResourceFetcherDialog = () => {
    const hasErrors =
      fetchedResources && fetchedResources.erroredResources.length >= 0;
    if (!isFetching && !hasErrors) return null;

    return (
      <ResourceFetcherDialog
        progress={progress}
        fetchedResources={fetchedResources}
        onAbandon={onAbandon}
        onRetry={onRetry}
      />
    );
  };

  return {
    ensureResourcesAreFetched,
    renderResourceFetcherDialog,
  };
};
