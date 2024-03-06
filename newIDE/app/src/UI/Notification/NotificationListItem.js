// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import { type Notification } from '../../Utils/GDevelopServices/Notification';
import { ListItem } from '../List';
import { getRelativeOrAbsoluteDisplayDate } from '../../Utils/DateDisplay';
import CoinOutline from '../CustomSvgIcons/CoinOutline';
import Annotation from '../CustomSvgIcons/Annotation';
import { shortenString } from '../../Utils/StringHelpers';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';

type Props = {|
  notification: Notification,
|};

const notificationTypeToIcon = {
  'credits-drop': <CoinOutline />,
  'one-game-feedback-received': <Annotation />,
  'multiple-game-feedback-received': <Annotation />,
};

const getNotificationPrimaryTextByType = (
  notification: Notification
): React.Node => {
  if (
    notification.type === 'credits-drop' &&
    notification.data.reason.startsWith('subscription')
  ) {
    return (
      <Trans>
        You received {notification.data.amount} credits thanks to your
        subscription
      </Trans>
    );
  }
  if (notification.type === 'one-game-feedback-received') {
    if (notification.data.playerName) {
      // Prevent prettier formatting that puts the first double quote at the end of the
      // previous line, adding a white space between the double quote and the comment.
      // prettier-ignore
      return (
        <Trans>
          Player {notification.data.playerName} left a feedback message on
          {notification.data.gameName}:
          "{shortenString(notification.data.comment, 25)}..."
        </Trans>
      );
    } else {
      // Prevent prettier formatting that puts the first double quote at the end of the
      // previous line, adding a white space between the double quote and the comment.
      // prettier-ignore
      return (
        <Trans>
          Your game {notification.data.gameName} received a feedback message:
          "{shortenString(notification.data.comment, 25)}..."
        </Trans>
      );
    }
  }
  if (notification.type === 'multiple-game-feedback-received') {
    return (
      <Trans>
        Your game {notification.data.gameName} received
        {notification.data.count} feedback messages
      </Trans>
    );
  }
  return null;
};

const NotificationListItem = ({ notification }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <I18n>
      {({ i18n }) => (
        <ListItem
          primaryText={getNotificationPrimaryTextByType(notification)}
          secondaryText={getRelativeOrAbsoluteDisplayDate({
            i18n,
            dateAsNumber: notification.createdAt,
            sameDayFormat: 'timeAgo',
            sameWeekFormat: 'timeAgo',
            dayBeforeFormat: 'yesterday',
            relativeLimit: 'currentWeek',
          })}
          leftIcon={notificationTypeToIcon[notification.type]}
          displayDot={!notification.seenAt}
          dotColor={gdevelopTheme.notification.badgeColor}
          isGreyed={!!notification.seenAt}
          secondaryTextSize="body-small"
        />
      )}
    </I18n>
  );
};

export default NotificationListItem;
