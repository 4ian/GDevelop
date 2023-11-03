// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import ReactErrorBoundary from 'react-error-boundary';
import BugReport from '@material-ui/icons/BugReport';
import PlaceholderMessage from './PlaceholderMessage';
import Divider from '@material-ui/core/Divider';
import RaisedButton from './RaisedButton';
import { sendErrorMessage } from '../Utils/Analytics/EventSender';
import Window from '../Utils/Window';
import Text from './Text';
import { Column, Line, Spacer } from './Grid';
import { getIDEVersion, getIDEVersionWithHash } from '../Version';
import {
  getArch,
  getPlatformName,
  getSystemVersion,
  getUserAgent,
} from '../Utils/Platform';
import { ColumnStackLayout } from './Layout';
import AlertMessage from './AlertMessage';
import Link from './Link';

type ErrorBoundaryScope =
  | 'mainframe'
  | 'list-search-result'
  | 'box-search-result'
  | 'variables-list'
  | 'app';

const errorHandler = (
  error: Error,
  componentStack: string,
  scope: ErrorBoundaryScope
) => {
  console.error('Error caught by Boundary:', error, componentStack);
  sendErrorMessage(
    'Error caught by error boundary',
    // $FlowFixMe - Flow does not infer string type possibilities from interpolation.
    `error-boundary_${scope}`,
    {
      error,
      errorMessage: error.message || '',
      errorStack: error.stack || '',
      errorName: error.name || '',
      IDEVersion: getIDEVersion(),
      IDEVersionWithHash: getIDEVersionWithHash(),
      arch: getArch(),
      platformName: getPlatformName(),
      systemVersion: getSystemVersion(),
      userAgent: getUserAgent(),
      componentStack,
    },
    'error-boundary-error'
  );
};

export const ErrorFallbackComponent = ({
  componentStack,
  error,
  title,
}: {
  componentStack: string,
  error: Error,
  title: string,
}) => (
  <PlaceholderMessage>
    <ColumnStackLayout>
      <Line>
        <BugReport fontSize="large" />
        <Spacer />
        <Text size="block-title">{title}</Text>
      </Line>
      <Divider />
      <Column>
        <AlertMessage kind="warning">
          <Text>
            <Trans>
              Please <b>backup your game file</b> and save your game to ensure
              that you don't lose anything.
            </Trans>
          </Text>
        </AlertMessage>
      </Column>
      <Column>
        <Text>
          <Trans>
            To help us fix this issue, you can create a{' '}
            <Link
              href="https://github.com"
              onClick={() => Window.openExternalURL('https://github.com')}
            >
              GitHub account
            </Link>{' '}
            then report the issue with the button below.
          </Trans>
        </Text>
      </Column>
      <Line justifyContent="flex-end">
        <RaisedButton
          label={<Trans>Report the issue on GitHub</Trans>}
          primary
          onClick={() => {
            const templateFile = '--automatic-crash.yml';
            const title = 'Crash while using an editor';
            const errorStack =
              error && error.stack
                ? `${error.stack.slice(0, 600)}...`
                : 'No error found';
            const gdevelopVersion = getIDEVersionWithHash();
            const platformInfo = `System Version: ${getSystemVersion()}, Arch: ${getArch()}, User Agent: ${getUserAgent()}, Platform: ${getPlatformName()}`;
            const additionalContext = componentStack
              ? `${componentStack.slice(0, 600)}...`
              : 'No component stack found';

            const baseUrl = new URL(
              'https://github.com/4ian/GDevelop/issues/new'
            );
            baseUrl.searchParams.set('template', templateFile);
            baseUrl.searchParams.set('title', title);
            baseUrl.searchParams.set('labels', '💥crash');
            baseUrl.searchParams.set('gdevelop_version', gdevelopVersion);
            baseUrl.searchParams.set('platform_info', platformInfo);
            baseUrl.searchParams.set('error_stack', errorStack);
            baseUrl.searchParams.set('component_stack', additionalContext);

            Window.openExternalURL(baseUrl.href);
          }}
        />
      </Line>
    </ColumnStackLayout>
  </PlaceholderMessage>
);

type Props = {|
  children: React.Node,
  title: string,
  scope: ErrorBoundaryScope,
|};

const ErrorBoundary = (props: Props) => (
  <ReactErrorBoundary
    FallbackComponent={fallbackComponentProps => (
      <ErrorFallbackComponent {...fallbackComponentProps} title={props.title} />
    )}
    onError={(error, componentStack) =>
      errorHandler(error, componentStack, props.scope)
    }
  >
    {props.children}
  </ReactErrorBoundary>
);

export default ErrorBoundary;
