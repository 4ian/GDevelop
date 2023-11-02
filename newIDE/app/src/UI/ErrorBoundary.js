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
import { Line, Spacer } from './Grid';
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
import BackgroundText from './BackgroundText';
import { generateUUID } from 'three/src/math/MathUtils';

const styles = {
  errorMessage: {
    maxWidth: 600,
    textAlign: 'left',
  },
};

type ErrorBoundaryScope =
  | 'mainframe'
  | 'list-search-result'
  | 'box-search-result'
  | 'variables-list'
  | 'app';

const errorHandler = (
  error: Error,
  uniqueErrorId: string,
  componentStack: string,
  scope: ErrorBoundaryScope
) => {
  console.error(
    `Error ${uniqueErrorId} caught by Boundary:`,
    error,
    componentStack
  );
  sendErrorMessage(
    'Error caught by error boundary',
    // $FlowFixMe - Flow does not infer string type possibilities from interpolation.
    `error-boundary_${scope}`,
    {
      error,
      uniqueErrorId,
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
  uniqueErrorId,
}: {|
  componentStack: string,
  error: Error,
  title: string,
  uniqueErrorId: string,
|}) => (
  <PlaceholderMessage>
    <ColumnStackLayout>
      <Line>
        <BugReport fontSize="large" />
        <Spacer />
        <Text size="block-title">{title}</Text>
      </Line>
      <Divider />
      <ColumnStackLayout>
        <AlertMessage kind="warning">
          <Text>
            <Trans>
              Please <b>backup your game file</b> and save your game to ensure
              that you don't lose anything.
            </Trans>
          </Text>
        </AlertMessage>
        <Text>
          <Trans>
            To help us fix this issue, you can create a{' '}
            <Link
              href="https://github.com"
              onClick={() => Window.openExternalURL('https://github.com')}
            >
              GitHub account
            </Link>{' '}
            then report the issue with the button below. (ID: {uniqueErrorId})
          </Trans>
        </Text>
        {error && error.stack && (
          <BackgroundText style={styles.errorMessage}>
            {error.stack.slice(0, 200)}...
          </BackgroundText>
        )}
        {componentStack && (
          <BackgroundText style={styles.errorMessage}>
            {componentStack.slice(0, 200)}...
          </BackgroundText>
        )}
      </ColumnStackLayout>
      <Line justifyContent="flex-end">
        <RaisedButton
          label={<Trans>Report the issue on GitHub</Trans>}
          primary
          onClick={() => {
            const body = `
=> Please write here a short description of when the error occurred and how to reproduce it.

When you're ready, click on "Submit new issue". Don't change the rest of the message. Thanks!

## Error stack (don't write anything here)
\`\`\`
${error && error.stack ? `${error.stack.slice(0, 600)}...` : 'No error found'}
\`\`\`

## Component stack (don't write anything here)
\`\`\`
${
              componentStack
                ? `${componentStack.slice(0, 600)}...`
                : 'No component stack found'
            }
\`\`\`

## Other details
* IDE version: ${getIDEVersionWithHash()}
* Arch: ${getArch()},
* Platform Name: ${getPlatformName()},
* System Version: ${getSystemVersion()},
* User Agent: ${getUserAgent()},
        `;
            Window.openExternalURL(
              `https://github.com/4ian/GDevelop/issues/new?body=${encodeURIComponent(
                body
              )}&title=Crash%20while%20using%20an%20editor`
            );
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

const ErrorBoundary = (props: Props) => {
  const uniqueErrorIdRef = React.useRef(generateUUID());
  return (
    <ReactErrorBoundary
      FallbackComponent={fallbackComponentProps => (
        <ErrorFallbackComponent
          {...fallbackComponentProps}
          title={props.title}
          uniqueErrorId={uniqueErrorIdRef.current}
        />
      )}
      onError={(error, componentStack) => {
        // Generate a new unique error id which will be displayed by the
        // fallback component.
        uniqueErrorIdRef.current = generateUUID();
        errorHandler(
          error,
          uniqueErrorIdRef.current,
          componentStack,
          props.scope
        );
      }}
    >
      {props.children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
