// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import { type Notification } from '../../Utils/GDevelopServices/Notification';
import { ListItem } from '../List';
import { getRelativeOrAbsoluteDisplayDate } from '../../Utils/DateDisplay';
import CoinOutline from '../CustomSvgIcons/CoinOutline';
import Annotation from '../CustomSvgIcons/Annotation';
import Gaming from '../CustomSvgIcons/Gaming';
import Cart from '../CustomSvgIcons/Cart';
import { shortenString } from '../../Utils/StringHelpers';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';
import RouterContext, {
  type RouteArguments,
} from '../../MainFrame/RouterContext';

const notificationTypeToIcon = {
  'credits-drop': <CoinOutline />,
  'one-game-feedback-received': <Annotation />,
  'multiple-game-feedback-received': <Annotation />,
  'claimable-asset-pack': <Cart />,
  'game-sessions-achievement': <Gaming />,
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
        You received {notification.data.creditsAmount} credits thanks to your
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
  if (notification.type === 'claimable-asset-pack') {
    return (
      <Trans>
        The asset pack {notification.data.privateAssetPackName} is now
        available, go claim it in the shop!
      </Trans>
    );
  }
  if (notification.type === 'game-sessions-achievement') {
    if (notification.data.gameCount === 1) {
      if (notification.data.gameId && notification.data.gameName) {
        return (
          <Trans>
            Your game {notification.data.gameName} was played more than
            {notification.data.sessionsCount} times!
          </Trans>
        );
      } else return null; // should not happen.
    }
    if (notification.data.allGames) {
      return (
        <Trans>
          All your games were played more than {notification.data.sessionsCount}
          times in total!
        </Trans>
      );
    }
    const { gameCount } = notification.data;
    if (Number.isInteger(gameCount)) {
      return (
        <Trans>
          {gameCount} of your games were played more than
          {notification.data.sessionsCount} times in total!
        </Trans>
      );
    }
  }
  return null;
};

const getNotificationClickCallback = ({
  notification,
  addRouteArguments,
  onCloseNotificationList,
  onMarkNotificationAsSeen,
}: {
  notification: Notification,
  addRouteArguments: RouteArguments => void,
  onCloseNotificationList: () => void,
  onMarkNotificationAsSeen: () => void,
}): (() => void) | null => {
  if (notification.type === 'credits-drop') return null;
  if (
    notification.type === 'one-game-feedback-received' ||
    notification.type === 'multiple-game-feedback-received'
  ) {
    return () => {
      addRouteArguments({
        'initial-dialog': 'games-dashboard',
        'game-id': notification.data.gameId,
        'games-dashboard-tab': 'feedback',
      });
      onMarkNotificationAsSeen();
      onCloseNotificationList();
    };
  }
  if (notification.type === 'claimable-asset-pack') {
    return () => {
      addRouteArguments({
        'initial-dialog': 'store',
        'asset-pack': notification.data.privateAssetPackId,
      });
      onMarkNotificationAsSeen();
      onCloseNotificationList();
    };
  }
  if (notification.type === 'game-sessions-achievement') {
    if (notification.data.gameCount === 1) {
      // $FlowIgnore - if missing, gameId and gameName will be undefined.
      const { gameId, gameName } = notification.data;
      if (gameId && gameName) {
        return () => {
          addRouteArguments({
            'initial-dialog': 'games-dashboard',
            'game-id': gameId,
            'games-dashboard-tab': 'analytics',
          });
          onMarkNotificationAsSeen();
          onCloseNotificationList();
        };
      } else return null; // should not happen.
    }
    if (
      notification.data.gameCount === 'all' ||
      Number.isInteger(notification.data.gameCount)
    ) {
      return () => {
        addRouteArguments({
          'initial-dialog': 'games-dashboard',
          'games-dashboard-tab': 'analytics',
        });
        onMarkNotificationAsSeen();
        onCloseNotificationList();
      };
    }
  }
  return null;
};

type Props = {|
  notification: Notification,
  onCloseNotificationList: () => void,
  onMarkNotificationAsSeen: () => void,
|};

const NotificationListItem = ({
  notification,
  onCloseNotificationList,
  onMarkNotificationAsSeen,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { addRouteArguments } = React.useContext(RouterContext);
  const onClickNotification = getNotificationClickCallback({
    notification,
    addRouteArguments,
    onMarkNotificationAsSeen,
    onCloseNotificationList,
  });
  const primaryText = getNotificationPrimaryTextByType(notification);
  if (!primaryText) return null;

  return (
    <I18n>
      {({ i18n }) => (
        <ListItem
          primaryText={primaryText}
          secondaryText={getRelativeOrAbsoluteDisplayDate({
            i18n,
            dateAsNumber: notification.createdAt,
            sameDayFormat: 'timeAgo',
            sameWeekFormat: 'timeAgo',
            dayBeforeFormat: 'yesterday',
            relativeLimit: 'currentWeek',
          })}
          onClick={onClickNotification}
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
