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

type ExtensionModulesLoaded = Array<{|
  extensionModulePath: string,
  result: ExtensionLoadingResult,
|}>;

type ExtensionModulesLoadedErrorDialogProps = {|
  erroredExtensionModulesLoaded: ExtensionModulesLoaded,
  genericError: ?Error,
  onClose: () => void,
|};

export const ExtensionModulesLoadedErrorDialog = ({
  erroredExtensionModulesLoaded,
  genericError,
  onClose,
}: ExtensionModulesLoadedErrorDialogProps) => {
  return (
    <Dialog
      title={
        <Trans>GDevelop installation is corrupted and can't be used</Trans>
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
            There were errors when loading extension modules. You cannot
            continue using GDevelop.
          </Trans>
        </Text>
        <Text>
          <Trans>
            Please re-install it by downloading the latest version from{' '}
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
            {erroredExtensionModulesLoaded.map(
              ({ extensionModulePath, result: { message, rawError } }) => (
                <TableRow key={extensionModulePath}>
                  <TableRowColumn>{extensionModulePath}</TableRowColumn>
                  <TableRowColumn>{message}</TableRowColumn>
                  <TableRowColumn>
                    {rawError && (
                      <Text>
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

type UseExtensionModulesLoadedErrorDialogOutput = {|
  setExtensionModulesLoadedParams: ({|
    results: ExtensionModulesLoaded,
    expectedNumberOfJSExtensionModulesLoaded: number,
  |}) => void,
  hasExtensionModulesLoadedErrors: boolean,
  renderExtensionModulesLoadedErrorDialog: () => React.Node,
|};

export const useExtensionModulesLoadedErrorDialog = (): UseExtensionModulesLoadedErrorDialogOutput => {
  const [
    erroredExtensionModulesLoaded,
    setErroredExtensionModulesLoaded,
  ] = React.useState<?ExtensionModulesLoaded>(null);
  const [genericError, setGenericError] = React.useState<?Error>(null);
  const [isForcedHidden, setIsForcedHidden] = React.useState(false);

  const setExtensionModulesLoadedParams = React.useCallback(
    (extensionModulesLoadedParams: {|
      results: ExtensionModulesLoaded,
      expectedNumberOfJSExtensionModulesLoaded: number,
    |}) => {
      const erroredExtensionModulesLoaded = extensionModulesLoadedParams.results.filter(
        ({ result }) => result.error
      );
      setErroredExtensionModulesLoaded(erroredExtensionModulesLoaded);
      const hasMissingExtensionModules =
        extensionModulesLoadedParams.expectedNumberOfJSExtensionModulesLoaded !==
        extensionModulesLoadedParams.results.length;
      if (hasMissingExtensionModules) {
        setGenericError(
          new Error(
            'Some extension modules could not be loaded. Please check the console for more details.'
          )
        );
      } else {
        setGenericError(null);
      }
      setIsForcedHidden(false);
    },
    []
  );

  const hasExtensionModulesLoadedErrors = React.useMemo(
    () =>
      !isForcedHidden &&
      ((!!erroredExtensionModulesLoaded &&
        erroredExtensionModulesLoaded.length > 0) ||
        !!genericError),
    [isForcedHidden, erroredExtensionModulesLoaded, genericError]
  );

  React.useEffect(
    () => {
      if (hasExtensionModulesLoadedErrors) {
        let message = 'Extension modules loaded with errors: \n';
        if (genericError) message += genericError.toString();
        if (erroredExtensionModulesLoaded)
          message += erroredExtensionModulesLoaded
            .map(({ extensionModulePath, result }) => {
              return `${extensionModulePath}: ${result.message}`;
            })
            .join('\n');

        sendErrorMessage(
          message,
          'error-boundary_extension-loader',
          null,
          'extension-modules-loaded-with-errors'
        );
      }
    },
    [
      hasExtensionModulesLoadedErrors,
      genericError,
      erroredExtensionModulesLoaded,
    ]
  );

  const renderErrorDialog = React.useCallback(
    () => {
      if (
        isForcedHidden ||
        !erroredExtensionModulesLoaded ||
        (!erroredExtensionModulesLoaded.length && !genericError)
      )
        return null;

      return (
        <ExtensionModulesLoadedErrorDialog
          erroredExtensionModulesLoaded={erroredExtensionModulesLoaded}
          onClose={() => {
            setIsForcedHidden(true);
          }}
          genericError={genericError}
        />
      );
    },
    [isForcedHidden, erroredExtensionModulesLoaded, genericError]
  );

  return React.useMemo(
    () => ({
      setExtensionModulesLoadedParams,
      hasExtensionModulesLoadedErrors:
        !isForcedHidden &&
        ((!!erroredExtensionModulesLoaded &&
          erroredExtensionModulesLoaded.length > 0) ||
          !!genericError),
      renderExtensionModulesLoadedErrorDialog: renderErrorDialog,
    }),
    [
      erroredExtensionModulesLoaded,
      renderErrorDialog,
      setExtensionModulesLoadedParams,
      genericError,
      isForcedHidden,
    ]
  );
};
