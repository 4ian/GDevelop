// @flow
import * as React from 'react';
import Avatar from '@material-ui/core/Avatar';
import classes from './ChatBubble.module.css';
import Paper from '../../UI/Paper';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { getGravatarUrl } from '../../UI/GravatarUrl';
import { Line } from '../../UI/Grid';
import { I18n } from '@lingui/react';
import ArrowTopThenLeft from '../../UI/CustomSvgIcons/ArrowTopThenLeft';
import IconButton from '../../UI/IconButton';
import { t } from '@lingui/macro';

const styles = {
  chatBubble: {
    paddingTop: 5,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 5,
  },
  assistantChatBubbleLight: {
    background: 'linear-gradient(90deg, #F5F5F7 77%, #EAE3FF 100%)',
  },
  assistantChatBubbleDark: {
    background: 'linear-gradient(90deg, #25252E 0%, #312442 100%)',
  },
  avatar: {
    width: 20,
    height: 20,
  },
  arrow: {
    width: 12,
    height: 12,
  },
};

type ChatBubbleProps = {|
  children: React.Node,
  feedbackButtons?: React.Node,
  role: 'assistant' | 'user',
  restoreProps?: {|
    onRestore: () => void,
    disabled?: boolean,
  |},
|};

export const ChatBubble = ({
  children,
  feedbackButtons,
  role,
  restoreProps,
}: ChatBubbleProps) => {
  const theme = React.useContext(GDevelopThemeContext);
  const isLightTheme = theme.palette.type === 'light';

  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const userAvatarUrl = React.useMemo(
    () => {
      const email =
        (authenticatedUser.profile && authenticatedUser.profile.email) || '';
      const userAvatarUrl = getGravatarUrl(email, {
        size: 40,
      });
      return userAvatarUrl;
    },
    [authenticatedUser]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <div className={classes.chatBubbleContainer}>
          <div className={classes.chatBubbleRestoreArrow}>
            {restoreProps && (
              <IconButton
                size="small"
                onClick={restoreProps.onRestore}
                disabled={restoreProps.disabled}
                tooltip={t`Restore project before this message`}
              >
                <ArrowTopThenLeft style={styles.arrow} />
              </IconButton>
            )}
          </div>
          <Paper
            background={role === 'user' ? 'light' : 'medium'}
            style={{
              ...styles.chatBubble,
              ...(role === 'assistant'
                ? isLightTheme
                  ? styles.assistantChatBubbleLight
                  : styles.assistantChatBubbleDark
                : {}),
            }}
          >
            <div className={classes.chatBubbleContent}>{children}</div>
            {feedbackButtons}
          </Paper>
          {role === 'user' && (
            <Line noMargin justifyContent="flex-end" alignItems="center">
              <Avatar src={userAvatarUrl} style={styles.avatar} />
            </Line>
          )}
        </div>
      )}
    </I18n>
  );
};
