// @flow
import Axios from 'axios';
import { GDevelopUserApi } from './ApiConfigs';

export const client = Axios.create({
  baseURL: GDevelopUserApi.baseUrl,
});

type NotificationBaseAttributes = {
  id: string,
  userId: string,
  createdAt: number,
  seenAt?: number,
};

type CreditsDropNotification = {
  ...NotificationBaseAttributes,
  type: 'credits-drop',
  data: {
    amount: number,
    reason: 'subscription-monthly-drop' | 'subscription-creation',
  },
};

type OneGameFeedbackReceivedNotification = {
  ...NotificationBaseAttributes,
  type: 'one-game-feedback-received',
  data: {
    gameId: string,
    gameName: string,
    playerName?: string,
    comment: string,
  },
};
type MultipleGameFeedbackReceivedNotification = {
  ...NotificationBaseAttributes,
  type: 'multiple-game-feedback-received',
  data: {
    gameId: string,
    gameName: string,
    count: number,
  },
};

export type Notification =
  | CreditsDropNotification
  | OneGameFeedbackReceivedNotification
  | MultipleGameFeedbackReceivedNotification;

export const listNotifications = async (
  getAuthorizationHeader: () => Promise<string>,
  { userId }: {| userId: string |}
): Promise<Array<Notification>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get('/notification', {
    headers: { Authorization: authorizationHeader },
    params: { userId },
  });
  return response.data;
};

export const markNotificationsAsSeen = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    notificationIds,
    allStartingFromNotificationId,
  }: {|
    userId: string,
    notificationIds?: string[],
    allStartingFromNotificationId?: string,
  |}
): Promise<void> => {
  const authorizationHeader = await getAuthorizationHeader();
  let payload;
  if (notificationIds) {
    payload = {
      notifications: notificationIds.map(notificationId => ({
        notificationId,
        seen: true,
      })),
    };
  } else if (allStartingFromNotificationId) {
    payload = {
      afterNotification: { notificationId: allStartingFromNotificationId },
    };
  } else {
    throw new Error(
      'Either parameter notificationIds or allStartingFromNotificationId must be defined.'
    );
  }
  await client.post('/notification/action/mark-as-seen', payload, {
    headers: { Authorization: authorizationHeader },
    params: { userId },
  });
};
