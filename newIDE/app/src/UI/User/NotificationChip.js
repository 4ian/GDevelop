// @flow

import * as React from 'react';
import Popover from '@material-ui/core/Popover';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import IconButton from '../IconButton';
import NotificationList from '../Notification/NotificationList';
import Paper from '../Paper';
import Badge from '../Badge';
import Bell from '../CustomSvgIcons/Bell';

const styles = {
  notificationListContainer: { padding: 16 },
};

type Props = {||};

const NotificationChip = (props: Props) => {
  const { notifications, profile } = React.useContext(AuthenticatedUserContext);
  const [anchorEl, setAnchorEl] = React.useState(null);

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
          invisible={notifications.every(notification => notification.seenAt)}
          color="primary"
        >
          <Bell color="secondary" />
        </Badge>
      </IconButton>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Paper
          style={{
            ...styles.notificationListContainer,
            maxWidth: 400,
            minWidth: 300,
          }}
          background="light"
        >
          <NotificationList notifications={notifications} />
        </Paper>
      </Popover>
    </>
  );
};

export default NotificationChip;
