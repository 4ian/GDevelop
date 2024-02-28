// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { type Notification } from '../../Utils/GDevelopServices/Notification';
import { ListItem } from '../List';
import Coin from '../../Credits/Icons/Coin';
import { Trans } from '@lingui/macro';
import { getRelativeOrAbsoluteDisplayDate } from '../../Utils/DateDisplay';

type Props = {|
  notification: Notification,
|};

const notificationTypeToIcon = {
  'credits-drop': <Coin />,
};
const getNotificationPrimaryTextByType = (
  notification: Notification
): React.Node => {
  if (
    notification.type === 'credits-drop' &&
    notification.data.reason === 'subscription'
  ) {
    return (
      <Trans>
        You received {notification.data.amount} credits thanks to your
        subscription!
      </Trans>
    );
  }
  return null;
};

const NotificationListItem = ({ notification }: Props) => {
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
        />
      )}
    </I18n>
  );
};

export default NotificationListItem;
