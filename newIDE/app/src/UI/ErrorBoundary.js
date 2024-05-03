// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import ReactErrorBoundary from 'react-error-boundary';
import BugReport from '@material-ui/icons/BugReport';
import PlaceholderMessage from './PlaceholderMessage';
import Divider from '@material-ui/core/Divider';
import { sendErrorMessage } from '../Utils/Analytics/EventSender';
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
import BackgroundText from './BackgroundText';
import { generateUUID } from 'three/src/math/MathUtils';
import IconButton from './IconButton';
import Cross from './CustomSvgIcons/Cross';

const styles = {
  errorMessage: {
    maxWidth: 600,
    textAlign: 'left',
  },
};

type ErrorBoundaryScope =
  | 'app'
  | 'editor'
  | 'start-page'
  | 'start-page-get-started'
  | 'start-page-build'
  | 'start-page-shop'
  | 'start-page-learn'
  | 'start-page-play'
  | 'start-page-community'
  | 'start-page-team'
  | 'start-page-manage'
  | 'about'
  | 'preferences'
  | 'profile'
  | 'scene-editor'
  | 'scene-editor-instance-properties'
  | 'scene-editor-objects-list'
  | 'scene-editor-object-groups-list'
  | 'scene-editor-canvas'
  | 'scene-editor-layers-list'
  | 'scene-editor-instances-list'
  | 'scene-events'
  | 'scene-events-search'
  | 'scene-events-instruction-editor'
  | 'debugger'
  | 'resources'
  | 'extension-editor'
  | 'extensions-search-dialog'
  | 'external-events-editor'
  | 'external-layout-editor'
  | 'variables-list'
  | 'new-object-dialog'
  | 'object-details'
  | 'export-and-share'
  | 'project-manager'
  | 'project-properties'
  | 'project-icons'
  | 'box-search-result'
  | 'list-search-result';

export const getEditorErrorBoundaryProps = (
  editorKey: string
): {| componentTitle: React.Node, scope: ErrorBoundaryScope |} => {
  if (editorKey.startsWith('debugger')) {
    return {
      componentTitle: <Trans>Debugger</Trans>,
      scope: 'debugger',
    };
  }
  if (editorKey.startsWith('start page')) {
    return {
      componentTitle: <Trans>Home page</Trans>,
      scope: 'start-page',
    };
  }
  if (editorKey.startsWith('resources')) {
    return {
      componentTitle: <Trans>Resources</Trans>,
      scope: 'resources',
    };
  }
  if (editorKey.startsWith('events functions extension')) {
    return {
      componentTitle: <Trans>Events functions extension</Trans>,
      scope: 'extension-editor',
    };
  }
  if (editorKey.startsWith('layout events')) {
    return {
      componentTitle: <Trans>Events</Trans>,
      scope: 'scene-events',
    };
  }
  if (editorKey.startsWith('layout')) {
    return {
      componentTitle: <Trans>Scene</Trans>,
      scope: 'scene-editor',
    };
  }
  if (editorKey.startsWith('external layout')) {
    return {
      componentTitle: <Trans>External layout</Trans>,
      scope: 'external-layout-editor',
    };
  }
  if (editorKey.startsWith('external events')) {
    return {
      componentTitle: <Trans>External events</Trans>,
      scope: 'external-events-editor',
    };
  }

  return {
    componentTitle: <Trans>Editor</Trans>,
    scope: 'editor',
  };
};

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
  componentTitle,
  uniqueErrorId,
  onClose,
  showOnTop,
}: {|
  componentStack: string,
  error: Error,
  componentTitle: React.Node,
  uniqueErrorId: string,
  onClose?: () => void,
  showOnTop?: boolean,
|}) => {
  const isCriticalError = error.stack && error.stack.includes('.wasm');
  return (
    <PlaceholderMessage showOnTop={showOnTop}>
      <ColumnStackLayout>
        <Line justifyContent="space-between" alignItems="center" noMargin>
          <Line>
            <BugReport fontSize="large" />
            <Spacer />
            <Text size="block-title">
              {isCriticalError ? (
                <Trans>
                  A critical error occurred in the {componentTitle}.
                </Trans>
              ) : (
                <Trans>An error occurred in the {componentTitle}.</Trans>
              )}
            </Text>
          </Line>
          {onClose && (
            <IconButton onClick={onClose} size="small">
              <Cross />
            </IconButton>
          )}
        </Line>
        <Divider />
        <Line>
          <ColumnStackLayout>
            <AlertMessage kind={isCriticalError ? 'error' : 'warning'}>
              <Trans>
                Please <b>backup your game file</b> and save your game to ensure
                that you don't lose anything. You can try to reload this panel
                or restart GDevelop.
              </Trans>
            </AlertMessage>
            <BackgroundText>Error ID: {uniqueErrorId}</BackgroundText>
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
        </Line>
      </ColumnStackLayout>
    </PlaceholderMessage>
  );
};

type Props = {|
  children: React.Node,
  componentTitle: React.Node,
  scope: ErrorBoundaryScope,
  onClose?: () => void,
  showOnTop?: boolean,
|};

const ErrorBoundary = (props: Props) => {
  const uniqueErrorIdRef = React.useRef(generateUUID());
  return (
    <ReactErrorBoundary
      FallbackComponent={fallbackComponentProps => (
        <ErrorFallbackComponent
          {...fallbackComponentProps}
          componentTitle={props.componentTitle}
          uniqueErrorId={uniqueErrorIdRef.current}
          onClose={props.onClose}
          showOnTop={props.showOnTop}
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
