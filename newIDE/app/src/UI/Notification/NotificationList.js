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
import TextButton from '../TextButton';
import ScrollView from '../ScrollView';

type Props = {|
  notifications: Notification[],
  onMarkAllAsRead: () => Promise<void>,
  canMarkAllAsRead: boolean,
  onMarkNotificationAsSeen: Notification => Promise<void>,
  onCloseNotificationList: () => void,
|};

const notificationsPreviewCount = 5;

const NotificationList = ({
  notifications,
  onMarkAllAsRead,
  canMarkAllAsRead,
  onMarkNotificationAsSeen,
  onCloseNotificationList,
}: Props) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showAll, setShowAll] = React.useState<boolean>(false);

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

  const notificationsToDisplay = showAll
    ? notifications
    : notifications.slice(0, notificationsPreviewCount);
  const shouldShowLoadMoreButton =
    notifications.length > notificationsPreviewCount && !showAll;

  return (
    <I18n>
      {({ i18n }) => (
        <Column noMargin expand>
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
          <ScrollView autoHideScrollbar>
            <Column>
              <List>
                {notificationsToDisplay.length > 0 ? (
                  notificationsToDisplay.map(notification => (
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
              {shouldShowLoadMoreButton && (
                <TextButton
                  secondary
                  label={<Trans>Load more...</Trans>}
                  onClick={() => setShowAll(true)}
                />
              )}
            </Column>
          </ScrollView>
        </Column>
      )}
    </I18n>
  );
};

export default NotificationList;
