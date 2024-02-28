// @flow

import * as React from 'react';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import Bell from '../CustomSvgIcons/Bell';
import IconButton from '../IconButton';
import NotificationList from '../Notification/NotificationList';
import Popover from '@material-ui/core/Popover';
import Text from '../Text';
import { Trans } from '@lingui/macro';
import Paper from '../Paper';
import Badge from '../Badge';

type Props = {||};

const NotificationChip = (props: Props) => {
  const { notifications, profile } = React.useContext(AuthenticatedUserContext);
  const [anchorEl, setAnchorEl] = React.useState(null);

  if (!profile) return null;
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
          badgeContent={''}
          invisible={
            !(
              notifications &&
              notifications.some(notification => !notification.seenAt)
            )
          }
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
        <Paper style={{ padding: '10px 20px' }} background="medium">
          {notifications && notifications.length > 0 ? (
            <NotificationList notifications={notifications} />
          ) : (
            <Text>
              <Trans>You have 0 notification.</Trans>
            </Text>
          )}
        </Paper>
      </Popover>
    </>
  );
};

export default NotificationChip;
