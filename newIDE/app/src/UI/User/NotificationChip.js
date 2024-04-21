// @flow

import * as React from 'react';
import Popover from '@material-ui/core/Popover';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import IconButton from '../IconButton';
import NotificationList from '../Notification/NotificationList';
import Paper from '../Paper';
import Badge from '../Badge';
import Bell from '../CustomSvgIcons/Bell';
import {
  markNotificationsAsSeen,
  type Notification,
} from '../../Utils/GDevelopServices/Notification';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';

const styles = {
  notificationListContainer: {
    padding: 16,
    display: 'flex',
    maxWidth: 400,
    minWidth: 300,
  },
  popoverPaper: { overflowY: 'hidden', maxHeight: '80%', display: 'flex' },
};

type Props = {||};

const NotificationChip = (props: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const {
    notifications,
    profile,
    getAuthorizationHeader,
    onRefreshNotifications,
  } = React.useContext(AuthenticatedUserContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isThereASingleUnseenNotification = React.useMemo<boolean>(
    () =>
      !!notifications &&
      notifications.some(notification => !notification.seenAt),
    [notifications]
  );

  const onMarkAllAsRead = React.useCallback(
    async () => {
      if (!notifications || !profile) return;

      const mostRecentNotification = notifications[0];
      if (!mostRecentNotification) return;

      await markNotificationsAsSeen(getAuthorizationHeader, {
        allStartingFromNotificationId: mostRecentNotification.id,
        userId: profile.id,
      });
      await onRefreshNotifications();
    },
    [notifications, profile, getAuthorizationHeader, onRefreshNotifications]
  );

  const onMarkNotificationAsSeen = React.useCallback(
    async (notification: Notification) => {
      if (!profile || notification.seenAt) return;

      await markNotificationsAsSeen(getAuthorizationHeader, {
        notificationIds: [notification.id],
        userId: profile.id,
      });
      await onRefreshNotifications();
    },
    [profile, getAuthorizationHeader, onRefreshNotifications]
  );

  const onCloseNotificationList = React.useCallback(() => {
    setAnchorEl(null);
  }, []);

  if (!profile || !notifications) return null;

  return (
    <>
      <IconButton
        size="small"
        onClick={e => {
          setAnchorEl(e.currentTarget);
        }}
      >
        <Badge
          variant="dot"
          overlap="circle"
          invisible={!isThereASingleUnseenNotification}
          forcedColor={gdevelopTheme.notification.badgeColor}
        >
          <Bell color="secondary" />
        </Badge>
      </IconButton>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        PaperProps={{ style: styles.popoverPaper }}
        onClose={onCloseNotificationList}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Paper style={styles.notificationListContainer} background="light">
          <NotificationList
            notifications={notifications}
            onMarkAllAsRead={onMarkAllAsRead}
            onMarkNotificationAsSeen={onMarkNotificationAsSeen}
            canMarkAllAsRead={isThereASingleUnseenNotification}
            onCloseNotificationList={onCloseNotificationList}
          />
        </Paper>
      </Popover>
    </>
  );
};

export default NotificationChip;
