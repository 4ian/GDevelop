// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import { type Notification } from '../../Utils/GDevelopServices/Notification';
import { List, ListItem } from '../List';
import NotificationListItem from './NotificationListItem';
import LeftLoader from '../LeftLoader';
import { Column, Line } from '../Grid';
import Text from '../Text';
import FlatButton from '../FlatButton';

type Props = {|
  notifications: Notification[],
  onMarkAllAsRead: () => Promise<void>,
  canMarkAllAsRead: boolean,
  onMarkNotificationAsSeen: Notification => Promise<void>,
  onCloseNotificationList: () => void,
|};

const NotificationList = ({
  notifications,
  onMarkAllAsRead,
  canMarkAllAsRead,
  onMarkNotificationAsSeen,
  onCloseNotificationList,
}: Props) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const markAllAsRead = React.useCallback(
    async () => {
      setIsLoading(true);
      try {
        await onMarkAllAsRead();
      } catch (error) {
        console.error(
          'An error occurred while marking all notifications as seen:',
          error
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onMarkAllAsRead]
  );

  const markNotificationAsSeen = React.useCallback(
    async (notification: Notification) => {
      try {
        await onMarkNotificationAsSeen(notification);
      } catch (error) {
        console.error(
          'An error occurred while marking notification as seen:',
          error
        );
      }
    },
    [onMarkNotificationAsSeen]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Column noMargin>
          <Line justifyContent="space-between" alignItems="center" noMargin>
            <Text size="block-title">
              <Trans>Notifications</Trans>
            </Text>
            <LeftLoader isLoading={isLoading}>
              <FlatButton
                primary
                label={<Trans>Mark all as read</Trans>}
                disabled={!canMarkAllAsRead}
                onClick={markAllAsRead}
              />
            </LeftLoader>
          </Line>
          <List>
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <NotificationListItem
                  key={notification.id}
                  notification={notification}
                  onCloseNotificationList={onCloseNotificationList}
                  onMarkNotificationAsSeen={() => {
                    markNotificationAsSeen(notification);
                  }}
                />
              ))
            ) : (
              <ListItem
                primaryText={<Trans>You have 0 notifications.</Trans>}
              />
            )}
          </List>
        </Column>
      )}
    </I18n>
  );
};

export default NotificationList;
