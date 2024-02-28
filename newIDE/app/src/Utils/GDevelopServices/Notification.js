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
  data: { amount: number, reason: 'subscription' },
};

export type Notification = CreditsDropNotification;

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
  { userId, notificationIds }: {| userId: string, notificationIds: string[] |}
): Promise<void> => {
  const authorizationHeader = await getAuthorizationHeader();
  await client.post(
    '/notification/action/mark-as-seen',
    {
      notifications: notificationIds.map(notificationId => ({
        notificationId,
        seen: true,
      })),
    },
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
};
