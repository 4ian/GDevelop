// @flow

import * as React from 'react';
import { type Notification } from '../../Utils/GDevelopServices/Notification';
import { List } from '../List';
import NotificationListItem from './NotificationListItem';

type Props = {|
  notifications: Notification[],
|};

const NotificationList = ({ notifications }: Props) => {
  return (
    <List>
      {notifications.map(notification => (
        <NotificationListItem notification={notification} />
      ))}
    </List>
  );
};

export default NotificationList;
