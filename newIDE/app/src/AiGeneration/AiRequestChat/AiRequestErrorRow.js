// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Text from '../../UI/Text';
import RaisedButton from '../../UI/RaisedButton';
import FlatButton from '../../UI/FlatButton';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../UI/Layout';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import ErrorIcon from '../../UI/CustomSvgIcons/Error';
import RefreshIcon from '../../UI/CustomSvgIcons/Refresh';
import AddIcon from '../../UI/CustomSvgIcons/Add';
import { type AiRequestError } from '../../Utils/GDevelopServices/Generation';

const styles = {
  icon: {
    fontSize: 14,
    flexShrink: 0,
    marginTop: 1,
  },
};

/**
 * How to present a failed AI request to the user. Deliberately not a 1-1
 * mapping with the error codes sent by the API: a code we don't know about
 * (or an old request stored without any error) is presented as a plain
 * failure that is worth retrying.
 */
type AiRequestErrorKind =
  // Something went wrong on our side: retrying is likely to work.
  | 'transient'
  // The conversation and the project don't fit in the AI model anymore:
  // retrying would fail in the exact same way.
  | 'too-large'
  // The AI kept repeating the same action and was stopped: retrying can work,
  // but giving more details is more likely to.
  | 'stuck';

const getAiRequestErrorKind = (
  error: AiRequestError | null
): AiRequestErrorKind => {
  if (!error) return 'transient';
  if (error.code === 'context-too-large') return 'too-large';
  if (error.code === 'repeated-tool-call-loop') return 'stuck';
  return 'transient';
};

const renderErrorText = (errorKind: AiRequestErrorKind): React.Node => {
  if (errorKind === 'too-large') {
    return (
      <Trans>
        This conversation has become too large for the AI to continue. Start a
        new chat to keep working on your game - this request was not counted in
        your AI usage.
      </Trans>
    );
  }
  if (errorKind === 'stuck') {
    return (
      <Trans>
        The AI kept trying the same thing over and over, so it was stopped. This
        request was not counted in your AI usage. Try again, or tell the AI more
        precisely what you'd like it to do.
      </Trans>
    );
  }
  return (
    <Trans>
      The AI ran into an error while working on your request - this request was
      not counted in your AI usage. Its work so far is kept: try again to
      continue from where it stopped.
    </Trans>
  );
};

type Props = {|
  error: AiRequestError | null,
  onRetry: () => void,
  onStartNewChat: () => void,
  /** True while the retry is being sent. */
  isRetrying?: boolean,
  /**
   * Prevents retrying (for instance because the project of the request is not
   * opened). Starting a new chat always stays possible.
   */
  disabled?: boolean,
|};

/**
 * Shown in the chat when an AI request failed: explains what happened (as
 * precisely as the error reported by the API allows) and offers the way
 * forward, which is most of the time to simply retry - the AI then continues
 * from the work it had already done.
 */
export const AiRequestErrorRow = ({
  error,
  onRetry,
  onStartNewChat,
  isRetrying,
  disabled,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const errorKind = getAiRequestErrorKind(error);

  return (
    <ColumnStackLayout noMargin expand noOverflowParent>
      <LineStackLayout noMargin alignItems="flex-start">
        <ErrorIcon
          style={styles.icon}
          htmlColor={gdevelopTheme.message.error}
        />
        <Text noMargin size="body-small" color="secondary">
          {renderErrorText(errorKind)}
        </Text>
      </LineStackLayout>
      {/* Note: the buttons are direct children of the layout (no fragment
      around them), so that they are properly spaced out - and stacked on
      mobile. */}
      <ResponsiveLineStackLayout noMargin alignItems="center">
        {errorKind !== 'too-large' && (
          <RaisedButton
            primary
            icon={<RefreshIcon fontSize="small" />}
            label={
              isRetrying ? <Trans>Retrying...</Trans> : <Trans>Retry</Trans>
            }
            onClick={onRetry}
            disabled={disabled || isRetrying}
          />
        )}
        {errorKind === 'too-large' ? (
          <RaisedButton
            primary
            icon={<AddIcon fontSize="small" />}
            label={<Trans>Start a new chat</Trans>}
            onClick={onStartNewChat}
          />
        ) : (
          <FlatButton
            label={<Trans>Start a new chat</Trans>}
            onClick={onStartNewChat}
          />
        )}
      </ResponsiveLineStackLayout>
    </ColumnStackLayout>
  );
};
