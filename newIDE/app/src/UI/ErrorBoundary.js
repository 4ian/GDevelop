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
import { getIDEVersionWithHash } from '../Version';
import {
  getArch,
  getPlatformName,
  getSystemVersion,
  getUserAgent,
} from '../Utils/Platform';

type ErrorBoundaryScope =
  | 'mainframe'
  | 'list-search-result'
  | 'box-search-result'
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
    <Line>
      <BugReport fontSize="large" />
      <Spacer />
      <Text size="block-title">{title}</Text>
    </Line>
    <Divider />
    <Text>
      Something wrong happened :(
      <br />
      Please <b>backup your game file</b> and save your game to ensure that you
      don't lose anything.
    </Text>
    <Text>
      The error was automatically reported.
      <br />
      To make sure it's fixed, you may report it on GitHub, the platform where
      GDevelop is developed:
    </Text>
    <RaisedButton
      label={<Trans>Report the issue on GitHub</Trans>}
      onClick={() => {
        const body = `
=> Please write here a short description of when the error occurred and how to reproduce it.
You also may have to create an account on GitHub before posting.

When you're ready, click on "Submit new issue". Don't change the rest of the message. Thanks!

## Error stack (don't write anything here)
\`\`\`
${error ? error.stack : 'No error found'}
\`\`\`

## Component stack (don't write anything here)
\`\`\`
${componentStack || 'No component stack found'}
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
