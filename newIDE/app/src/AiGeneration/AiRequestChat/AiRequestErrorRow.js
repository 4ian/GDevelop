// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Text from '../../UI/Text';
import ErrorFilled from '../../UI/CustomSvgIcons/ErrorFilled';
import Refresh from '../../UI/CustomSvgIcons/Refresh';
import ChatBubbles from '../../UI/CustomSvgIcons/ChatBubbles';
import { ChatActionButton } from './ChatActionButton';
import { type AiRequestError } from '../../Utils/GDevelopServices/Generation';
import classes from './AiRequestErrorRow.module.css';

type Props = {|
  /** The error reported by the API, shown as a discreet technical detail. */
  error?: ?AiRequestError,
  /** Continues the request where it stopped. Absent when it can't be resumed. */
  onRetry?: ?() => void | Promise<void>,
  /**
   * True when the request already failed too many times in a row to be
   * continued again: only a new chat is left.
   */
  hasExhaustedRetries?: boolean,
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
 * What a failed request means for the user. Deliberately not a 1-1 mapping
 * with the error codes sent by the API: a code we don't know about (or an old
 * request stored without any error) is presented as a plain failure, which is
 * worth retrying.
 */
type AiRequestErrorKind =
  // Something went wrong on our side: retrying is likely to work.
  | 'transient'
  // The conversation doesn't fit in the AI model anymore: retrying would fail
  // in the exact same way, only a new chat can help.
  | 'too-large'
  // The AI kept repeating the same action and was stopped: retrying can work,
  // but giving more details is more likely to.
  | 'stuck';

const getAiRequestErrorKind = (error: ?AiRequestError): AiRequestErrorKind => {
  if (!error) return 'transient';
  if (error.code === 'context-too-large') return 'too-large';
  if (error.code === 'repeated-tool-call-loop') return 'stuck';
  return 'transient';
};

const renderTitle = (errorKind: AiRequestErrorKind): React.Node => {
  if (errorKind === 'too-large') return <Trans>This chat is too long</Trans>;
  if (errorKind === 'stuck') return <Trans>The AI got stuck</Trans>;
  return <Trans>The AI ran into an error</Trans>;
};

const renderExplanation = ({
  errorKind,
  canRetry,
  hasExhaustedRetries,
}: {|
  errorKind: AiRequestErrorKind,
  canRetry: boolean,
  hasExhaustedRetries?: boolean,
|}): React.Node => {
  if (hasExhaustedRetries && errorKind !== 'too-large') {
    return (
      <Trans>
        The AI tried again several times without getting any further. None of
        these attempts were counted in your AI usage: start a new chat to keep
        working on your game.
      </Trans>
    );
  }
  if (errorKind === 'too-large') {
    return (
      <Trans>
        The conversation has become too large for the AI to continue. This
        request was not counted in your AI usage: start a new chat to keep
        working on your game.
      </Trans>
    );
  }
  if (errorKind === 'stuck') {
    return canRetry ? (
      <Trans>
        The AI kept trying the same thing over and over, so it was stopped. This
        request was not counted in your AI usage. Try again, or tell the AI more
        precisely what you'd like it to do.
      </Trans>
    ) : (
      <Trans>
        The AI kept trying the same thing over and over, so it was stopped. This
        request was not counted in your AI usage.
      </Trans>
    );
  }
  return canRetry ? (
    <Trans>
      This request was not counted in your AI usage. The work done so far is
      kept: try again to continue where it stopped.
    </Trans>
  ) : (
    <Trans>
      This request was not counted in your AI usage. The work done so far is
      kept.
    </Trans>
  );
};

/**
 * Shown at the end of the chat when the AI request stopped on an error: what
 * happened, what it means for the user, and how to get going again.
 */
export const AiRequestErrorRow = ({
  error,
  onRetry,
  hasExhaustedRetries,
  onStartNewChat,
}: Props): React.Node => {
  const [isRetrying, setIsRetrying] = React.useState(false);
  const errorKind = getAiRequestErrorKind(error);
  // Continuing a conversation that is already too large for the AI can only
  // fail again: don't offer it, whatever the chat allows.
  const canRetry = !!onRetry && errorKind !== 'too-large';

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
            {renderTitle(errorKind)}
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
        {renderExplanation({ errorKind, canRetry, hasExhaustedRetries })}
      </Text>
      <div className={classes.actions}>
        {canRetry && (
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
            emphasis={canRetry ? 'quiet' : 'primary'}
            icon={<ChatBubbles fontSize="inherit" />}
            label={<Trans>Start a new chat</Trans>}
            onClick={onStartNewChat}
          />
        )}
      </div>
    </div>
  );
};
