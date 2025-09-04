// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from '../UI/Table';
import { ColumnStackLayout } from '../UI/Layout';
import Window from './Window';
import { type ExtensionLoadingResult } from '../JsExtensionsLoader';
import Link from '../UI/Link';
import { sendErrorMessage } from './Analytics/EventSender';

const downloadUrl = 'https://gdevelop.io/download';

type ExtensionLoadingResultWithPath = {|
  extensionModulePath: string,
  result: ExtensionLoadingResult,
|};

type ExtensionLoadErrorDialogProps = {|
  erroredExtensionLoadingResults: Array<ExtensionLoadingResultWithPath>,
  genericError: ?Error,
  onClose: () => void,
|};

export const ExtensionLoadErrorDialog = ({
  erroredExtensionLoadingResults,
  genericError,
  onClose,
}: ExtensionLoadErrorDialogProps) => {
  return (
    <Dialog
      title={
        <Trans>GDevelop's installation is corrupted and can't be used</Trans>
      }
      actions={[
        Window.isDev() ? (
          <FlatButton
            label={<Trans>Continue anyway</Trans>}
            primary
            onClick={onClose}
            key="retry"
          />
        ) : null,
      ]}
      // Ensure we cannot close the dialog to prevent the
      // user from trying to use GDevelop with broken extensions.
      cannotBeDismissed
      open
    >
      <ColumnStackLayout noMargin expand>
        <Text>
          <Trans>
            There were errors when loading extensions. You cannot continue using
            GDevelop.
          </Trans>
        </Text>
        <Text>
          <Trans>
            If you are in a browser, ensure you close all GDevelop tabs or
            restart the browser.
          </Trans>
        </Text>
        <Text>
          <Trans>
            If you are on desktop, please re-install it by downloading the
            latest version from{' '}
            <Link
              href={downloadUrl}
              onClick={() => Window.openExternalURL(downloadUrl)}
            >
              the website
            </Link>
          </Trans>
        </Text>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderColumn>
                <Trans>Extension name</Trans>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <Trans>Message</Trans>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <Trans>Raw error</Trans>
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            {erroredExtensionLoadingResults.map(
              ({ extensionModulePath, result: { message, rawError } }) => (
                <TableRow key={extensionModulePath}>
                  <TableRowColumn>{extensionModulePath}</TableRowColumn>
                  <TableRowColumn>{message}</TableRowColumn>
                  <TableRowColumn>
                    {rawError && (
                      <Text style={{ whiteSpace: 'pre-wrap' }}>
                        {rawError.toString()}
                        <br />
                        {rawError.stack}
                      </Text>
                    )}
                  </TableRowColumn>
                </TableRow>
              )
            )}
            {genericError ? (
              <TableRow>
                <TableRowColumn>-</TableRowColumn>
                <TableRowColumn>{genericError.toString()}</TableRowColumn>
                <TableRowColumn>-</TableRowColumn>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </ColumnStackLayout>
    </Dialog>
  );
};

type UseExtensionLoadErrorDialogOutput = {|
  setExtensionLoadingResults: ({|
    results: Array<ExtensionLoadingResultWithPath>,
    expectedNumberOfJSExtensionModulesLoaded: number,
  |}) => void,
  hasExtensionLoadErrors: boolean,
  renderExtensionLoadErrorDialog: () => React.Node,
|};

export const useExtensionLoadErrorDialog = (): UseExtensionLoadErrorDialogOutput => {
  const [
    erroredExtensionLoadingResults,
    setErroredExtensionLoadingResults,
  ] = React.useState<?Array<ExtensionLoadingResultWithPath>>(null);
  const [genericError, setGenericError] = React.useState<?Error>(null);
  const [isForcedHidden, setIsForcedHidden] = React.useState(false);

  const setExtensionLoadingResults = React.useCallback(
    (extensionLoadingResults: {|
      results: Array<ExtensionLoadingResultWithPath>,
      expectedNumberOfJSExtensionModulesLoaded: number,
    |}) => {
      const erroredExtensionLoadingResults = extensionLoadingResults.results.filter(
        ({ result }) => result.error
      );
      setErroredExtensionLoadingResults(erroredExtensionLoadingResults);
      const hasMissingExtensionModules =
        extensionLoadingResults.expectedNumberOfJSExtensionModulesLoaded !==
        extensionLoadingResults.results.length;
      if (hasMissingExtensionModules) {
        setGenericError(
          new Error(
            'Some extensions could not be loaded. Please check the console for more details.'
          )
        );
      } else {
        setGenericError(null);
      }
      setIsForcedHidden(false);
    },
    []
  );

  const hasExtensionLoadErrors = React.useMemo(
    () =>
      !isForcedHidden &&
      ((!!erroredExtensionLoadingResults &&
        erroredExtensionLoadingResults.length > 0) ||
        !!genericError),
    [isForcedHidden, erroredExtensionLoadingResults, genericError]
  );

  React.useEffect(
    () => {
      if (hasExtensionLoadErrors) {
        let message = 'Extensions loaded with errors: \n';
        if (genericError) message += genericError.toString();
        if (erroredExtensionLoadingResults)
          message += erroredExtensionLoadingResults
            .map(({ extensionModulePath, result }) => {
              return `${extensionModulePath}: ${result.message}`;
            })
            .join('\n');

        sendErrorMessage(
          message,
          'error-boundary_extension-loader',
          null,
          'extension-loaded-with-errors'
        );
      }
    },
    [hasExtensionLoadErrors, genericError, erroredExtensionLoadingResults]
  );

  const renderErrorDialog = React.useCallback(
    () => {
      if (
        isForcedHidden ||
        !erroredExtensionLoadingResults ||
        (!erroredExtensionLoadingResults.length && !genericError)
      )
        return null;

      return (
        <ExtensionLoadErrorDialog
          erroredExtensionLoadingResults={erroredExtensionLoadingResults}
          onClose={() => {
            setIsForcedHidden(true);
          }}
          genericError={genericError}
        />
      );
    },
    [isForcedHidden, erroredExtensionLoadingResults, genericError]
  );

  return React.useMemo(
    () => ({
      setExtensionLoadingResults,
      hasExtensionLoadErrors:
        !isForcedHidden &&
        ((!!erroredExtensionLoadingResults &&
          erroredExtensionLoadingResults.length > 0) ||
          !!genericError),
      renderExtensionLoadErrorDialog: renderErrorDialog,
    }),
    [
      erroredExtensionLoadingResults,
      renderErrorDialog,
      setExtensionLoadingResults,
      genericError,
      isForcedHidden,
    ]
  );
};
