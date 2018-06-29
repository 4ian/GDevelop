// @flow
import * as React from 'react';
import ReactErrorBoundary from 'react-error-boundary';
import BugReport from 'material-ui/svg-icons/action/bug-report';
import PlaceholderMessage from './PlaceholderMessage';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import { sendErrorMessage } from '../Utils/Analytics/EventSender';
import Window from '../Utils/Window';

const errorHandler = (error: Error, componentStack: string) => {
  console.error('Error catched by Boundary:', error, componentStack);
  sendErrorMessage('Error catched by error boundary', 'error-boundary', {
    error,
    componentStack,
  });
};

const styles = {
  title: {
    fontSize: 24,
  },
};

export const ErrorFallbackComponent = ({
  componentStack,
  error,
}: {
  componentStack: string,
  error: Error,
}) => (
  <PlaceholderMessage>
    <p style={styles.title}>
      <BugReport /> This editor encountered a problem.
    </p>
    <Divider />
    <p>
        Something wrong happened :(<br />
        Please <b>backup your game file</b> and save your game to ensure that you don't lose anything.
    </p>
    <p>
      The error was automatically reported.<br />
      To make sure it's fixed, you may report it on GitHub, the platform
      where GDevelop is developed:
    </p>
    <RaisedButton
      label="Report the issue on GitHub"
      onClick={() => {
        const body = `
=> Please write here a short description of when the error occured and how to reproduce it.
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
        `;
        Window.openExternalURL(
          `https://github.com/4ian/GD/issues/new?body=${encodeURIComponent(
            body
          )}&title=Crash%20while%20using%20an%20editor`
        );
      }}
    />
  </PlaceholderMessage>
);

type Props = {|
  children: React.Node,
|};

const ErrorBoundary = (props: Props) => (
  <ReactErrorBoundary
    FallbackComponent={ErrorFallbackComponent}
    onError={errorHandler}
  >
    {props.children}
  </ReactErrorBoundary>
);

export default ErrorBoundary;
