// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Text from '../../UI/Text';
import ErrorFilled from '../../UI/CustomSvgIcons/ErrorFilled';
import Refresh from '../../UI/CustomSvgIcons/Refresh';
import ChatBubbles from '../../UI/CustomSvgIcons/ChatBubbles';
import { ChatActionButton } from './ChatActionButton';
import classes from './AiRequestErrorRow.module.css';

type Props = {|
  /** The error reported by the API, shown as a discreet technical detail. */
  error?: ?{ code: string, message: string },
  /** Continues the request where it stopped. Absent when it can't be resumed. */
  onRetry?: ?() => void | Promise<void>,
  onStartNewChat?: ?() => void,
|};

const styles = {
  title: {
    fontWeight: 'bold',
  },
  errorCode: {
    fontFamily: '"Lucida Console", Monaco, monospace',
    opacity: 0.75,
  },
};

/**
 * Shown at the end of the chat when the AI request stopped on an error: what
 * happened, what it means for the user, and how to get going again.
 */
export const AiRequestErrorRow = ({
  error,
  onRetry,
  onStartNewChat,
}: Props): React.Node => {
  const [isRetrying, setIsRetrying] = React.useState(false);

  const retry = React.useCallback(
    async () => {
      if (!onRetry) return;
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    },
    [onRetry]
  );

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <span className={classes.icon}>
          <ErrorFilled fontSize="inherit" />
        </span>
        <span className={classes.title}>
          <Text
            noMargin
            size="body-small"
            // $FlowFixMe[incompatible-type]
            style={styles.title}
          >
            <Trans>The AI ran into an error</Trans>
          </Text>
        </span>
        {error && (
          <span className={classes.errorCode}>
            <Text
              noMargin
              size="body-small"
              color="secondary"
              tooltip={error.message}
              // $FlowFixMe[incompatible-type]
              style={styles.errorCode}
            >
              {error.code}
            </Text>
          </span>
        )}
      </div>
      <Text noMargin size="body-small" color="secondary">
        {onRetry ? (
          <Trans>
            This request was not counted in your AI usage. The work done so far
            is kept: try again to continue where it stopped.
          </Trans>
        ) : (
          <Trans>
            This request was not counted in your AI usage. The work done so far
            is kept.
          </Trans>
        )}
      </Text>
      <div className={classes.actions}>
        {onRetry && (
          <ChatActionButton
            emphasis="primary"
            icon={<Refresh fontSize="inherit" />}
            label={
              isRetrying ? <Trans>Retrying...</Trans> : <Trans>Retry</Trans>
            }
            disabled={isRetrying}
            onClick={retry}
          />
        )}
        {onStartNewChat && (
          <ChatActionButton
            emphasis="quiet"
            icon={<ChatBubbles fontSize="inherit" />}
            label={<Trans>Start a new chat</Trans>}
            onClick={onStartNewChat}
          />
        )}
      </div>
    </div>
  );
};
