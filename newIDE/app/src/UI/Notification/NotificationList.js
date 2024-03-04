// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import { type Notification } from '../../Utils/GDevelopServices/Notification';
import { List, ListItem } from '../List';
import NotificationListItem from './NotificationListItem';
import { Column, Line } from '../Grid';
import Text from '../Text';
import FlatButton from '../FlatButton';

type Props = {|
  notifications: Notification[],
|};

const NotificationList = ({ notifications }: Props) => {
  return (
    <I18n>
      {({ i18n }) => (
        <Column noMargin>
          <Line justifyContent="space-between" alignItems="center" noMargin>
            <Text size="block-title">
              <Trans>Notifications</Trans>
            </Text>
            <FlatButton
              primary
              label={<Trans>Mark all as read</Trans>}
              disabled={notifications.every(
                notification => !!notification.seenAt
              )}
              onClick={() => console.log('salut')}
            />
          </Line>
          <List>
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <NotificationListItem
                  key={notification.id}
                  notification={notification}
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
