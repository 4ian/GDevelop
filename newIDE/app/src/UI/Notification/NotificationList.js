// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { type Notification } from '../../Utils/GDevelopServices/Notification';
import { List } from '../List';
import NotificationListItem from './NotificationListItem';
import { Column } from '../Grid';
import Text from '../Text';
import { Trans } from '@lingui/macro';
import { getRelativeOrAbsoluteDisplayDate } from '../../Utils/DateDisplay';

type NotificationsGroupedByDay = { [key: 'new' | string]: Notification[] };

const groupVersionsByNoveltyOrDay = (
  notifications: Array<Notification>
): NotificationsGroupedByDay => {
  if (notifications.length === 0) return {};

  const notificationsGroupedByDay = {};
  notifications.forEach(notification => {
    let dayDateOrNew;
    if (notification.seenAt) {
      const dayDate = new Date(notification.createdAt);
      dayDate.setHours(0, 0, 0, 0);
      dayDateOrNew = dayDate.getTime();
    } else {
      dayDateOrNew = 'new';
    }
    if (!notificationsGroupedByDay[dayDateOrNew]) {
      notificationsGroupedByDay[dayDateOrNew] = [notification];
    } else {
      notificationsGroupedByDay[dayDateOrNew].push(notification);
    }
  });
  return notificationsGroupedByDay;
};

type Props = {|
  notifications: Notification[],
|};

const NotificationList = ({ notifications }: Props) => {
  const notificationsGroupedByDayOrNovelty = groupVersionsByNoveltyOrDay(
    notifications
  );
  const days = Object.keys(notificationsGroupedByDayOrNovelty)
    .filter(key => key !== 'new')
    .sort()
    .reverse();
  if (notificationsGroupedByDayOrNovelty.new) {
    days.unshift('new');
  }

  return (
    <I18n>
      {({ i18n }) => (
        <Column>
          {days.map(day => {
            // $FlowIgnore
            const dayNotifications = notificationsGroupedByDayOrNovelty[day];
            return (
              <React.Fragment key={day}>
                <Text size="sub-title">
                  {day === 'new' ? (
                    <Trans>New</Trans>
                  ) : (
                    getRelativeOrAbsoluteDisplayDate({
                      i18n,
                      dateAsNumber: parseInt(day, 10),
                      sameDayFormat: 'today',
                      dayBeforeFormat: 'yesterday',
                      relativeLimit: 'currentYear',
                      sameWeekFormat: 'thisWeek',
                    })
                  )}
                </Text>
                <List>
                  {dayNotifications.map(notification => (
                    <NotificationListItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </List>
              </React.Fragment>
            );
          })}
        </Column>
      )}
    </I18n>
  );
};

export default NotificationList;
