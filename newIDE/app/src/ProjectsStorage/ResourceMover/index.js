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
import { type StorageProviderOperations, type StorageProvider } from '../index';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { type FileMetadata } from '..';

export type MoveAllProjectResourcesOptionsWithoutProgress = {|
  project: gdProject,
  oldFileMetadata: FileMetadata,
  oldStorageProvider: StorageProvider,
  oldStorageProviderOperations: StorageProviderOperations,
  newFileMetadata: FileMetadata,
  newStorageProvider: StorageProvider,
  newStorageProviderOperations: StorageProviderOperations,
  authenticatedUser: AuthenticatedUser,
|};

export type MoveAllProjectResourcesOptions = {|
  ...MoveAllProjectResourcesOptionsWithoutProgress,
  onProgress: (number, number) => void,
|};

export type MoveAllProjectResourcesResult = {|
  erroredResources: Array<{|
    resourceName: string,
    error: Error,
  |}>,
|};

export type MoveAllProjectResourcesFunction = (
  options: MoveAllProjectResourcesOptions
) => Promise<MoveAllProjectResourcesResult>;

export type ResourceMover = {|
  moveAllProjectResources: MoveAllProjectResourcesFunction,
|};

type ResourceMoverDialogProps = {|
  progress: number,
  result: ?MoveAllProjectResourcesResult,
  onAbandon: ?() => void,
  onRetry: ?() => void,
  genericError: ?Error,
|};

const styles = {
  tableCell: {
    // Avoid long filenames breaking the design.
    wordBreak: 'break-word',
  },
};

export const ResourceMoverDialog = ({
  progress,
  result,
  onAbandon,
  onRetry,
  genericError,
}: ResourceMoverDialogProps) => {
  const hasErrors =
    (result && result.erroredResources.length > 0) || !!genericError;

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
            onAbandon ? <Trans>Ignore</Trans> : <Trans>Please wait...</Trans>
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
                There were errors when importing resources for the project. You
                can retry (recommended) or continue despite the errors. In this
                case, the project will be missing some resources.
              </Trans>
            ) : (
              <Trans>Resources needed for the project are imported...</Trans>
            )}
          </Text>
          <Line noMargin expand>
            <LinearProgress variant="determinate" value={progress} />
          </Line>
          {hasErrors ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderColumn>Resource name</TableHeaderColumn>
                  <TableHeaderColumn>Error</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result
                  ? result.erroredResources.map(({ resourceName, error }) => (
                      <TableRow key={resourceName}>
                        <TableRowColumn style={styles.tableCell}>
                          {resourceName}
                        </TableRowColumn>
                        <TableRowColumn style={styles.tableCell}>
                          {error.toString()}
                        </TableRowColumn>
                      </TableRow>
                    ))
                  : null}
                {genericError ? (
                  <TableRow>
                    <TableRowColumn style={styles.tableCell}>-</TableRowColumn>
                    <TableRowColumn style={styles.tableCell}>
                      {genericError.toString()}
                    </TableRowColumn>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          ) : null}
        </ColumnStackLayout>
      </Line>
    </Dialog>
  );
};

type RetryOrAbandonCallback = () => void;

type UseResourceMoverOutput = {
  /**
   * Launch the moving of the resources, when saving a project in a new location.
   */
  ensureResourcesAreMoved: (
    options: MoveAllProjectResourcesOptionsWithoutProgress
  ) => Promise<void>,
  /**
   * Render, if needed, the dialog that will show the progress of resources moving.
   */
  renderResourceMoverDialog: () => React.Node,
};

/**
 * Hook allowing to launch the fetching of resources, useful after opening a project
 * or adding assets from the asset store (as they must be downloaded on the desktop app).
 */
export const useResourceMover = ({
  resourceMover,
}: {|
  resourceMover: ResourceMover,
|}): UseResourceMoverOutput => {
  const [progress, setProgress] = React.useState(0);
  const [genericError, setGenericError] = React.useState(null);
  const [isFetching, setIsFetching] = React.useState(false);
  const [result, setResult] = React.useState<?MoveAllProjectResourcesResult>(
    null
  );
  const [onRetry, setOnRetry] = React.useState<?RetryOrAbandonCallback>(null);
  const [onAbandon, setOnAbandon] = React.useState<?RetryOrAbandonCallback>(
    null
  );

  const ensureResourcesAreMoved = React.useCallback(
    async (options: MoveAllProjectResourcesOptionsWithoutProgress) => {
      setProgress(0);
      setOnRetry(null);
      setOnAbandon(null);
      setResult(null);
      setGenericError(null);

      let newResult = null;
      try {
        newResult = await resourceMover.moveAllProjectResources({
          ...options,
          onProgress: (count, total) => {
            setIsFetching(true); // Only display the dialog if some progress happened.
            setProgress((count / total) * 100);
          },
        });

        setProgress(100);
        if (newResult.erroredResources.length === 0) {
          // No error happened: finish normally, closing the dialog.
          setIsFetching(false);
          setGenericError(null);
          setResult(null);
          return;
        }
      } catch (genericError) {
        setGenericError(genericError);
      }

      // An error happened. Store the errors and offer a way to
      // retry.
      return new Promise(resolve => {
        setOnRetry(
          (): RetryOrAbandonCallback => () => {
            // Launch the fetch again, and solve the promise once
            // this new fetch resolve itself.
            resolve(ensureResourcesAreMoved(options));
          }
        );
        setOnAbandon(
          (): RetryOrAbandonCallback => () => {
            // Abandon: resolve immediately, closing the dialog
            setIsFetching(false);
            setGenericError(null);
            setResult(null);
            resolve();
          }
        );

        // Display the errors to the user:
        setResult(newResult);
        setIsFetching(false);
      });
    },
    [resourceMover]
  );

  const renderResourceMoverDialog = React.useCallback(
    () => {
      const hasErrors =
        (result && result.erroredResources.length >= 0) || !!genericError;
      if (!isFetching && !hasErrors) return null;

      return (
        <ResourceMoverDialog
          progress={progress}
          result={result}
          genericError={genericError}
          onAbandon={onAbandon}
          onRetry={onRetry}
        />
      );
    },
    [isFetching, progress, result, onAbandon, onRetry, genericError]
  );

  return React.useMemo(
    () => ({
      ensureResourcesAreMoved,
      renderResourceMoverDialog,
    }),
    [ensureResourcesAreMoved, renderResourceMoverDialog]
  );
};
