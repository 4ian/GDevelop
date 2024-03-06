// @flow

import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import NotificationList from '../../../UI/Notification/NotificationList';
import { type Notification } from '../../../Utils/GDevelopServices/Notification';

export default {
  title: 'Notification/NotificationList',
  component: NotificationList,
  decorators: [paperDecorator, muiDecorator],
};

const userId = 'user-id';

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const now = Date.now();

const notifications: Notification[] = [
  {
    id: 'notification-id-0',
    userId,
    createdAt: now - ONE_MINUTE / 2,
    type: 'credits-drop',
    data: { amount: 150, reason: 'subscription-monthly-drop' },
  },
  {
    id: 'notification-id-1',
    userId,
    createdAt: now - ONE_HOUR - 5 * ONE_MINUTE,
    type: 'credits-drop',
    data: { amount: 300, reason: 'subscription-monthly-drop' },
  },
  {
    id: 'notification-id-2',
    userId,
    createdAt: now - 4 * ONE_HOUR,
    type: 'credits-drop',
    data: { amount: 200, reason: 'subscription-monthly-drop' },
  },
  {
    id: 'notification-id-3',
    userId,
    createdAt: now - 8 * ONE_HOUR,
    seenAt: now - 7 * ONE_HOUR,
    type: 'credits-drop',
    data: { amount: 500, reason: 'subscription-monthly-drop' },
  },
  {
    id: 'notification-id-4',
    userId,
    createdAt: now - 32 * ONE_HOUR,
    seenAt: now - 30 * ONE_HOUR,
    type: 'credits-drop',
    data: { amount: 1000, reason: 'subscription-monthly-drop' },
  },
  {
    id: 'notification-id-41',
    userId,
    createdAt: now - 27 * ONE_HOUR,
    seenAt: now - 25 * ONE_HOUR,
    type: 'credits-drop',
    data: { amount: 50, reason: 'subscription-monthly-drop' },
  },
  {
    id: 'notification-id-31',
    userId,
    createdAt: now - 2 * ONE_DAY,
    seenAt: now - 28 * ONE_HOUR,
    type: 'one-game-feedback-received',
    data: {
      gameId: 'game-id',
      gameName: 'Best game',
      comment: 'hello',
      playerName: 'Sonic',
    },
  },
  {
    id: 'notification-id-5',
    userId,
    createdAt: now - 3 * ONE_DAY,
    seenAt: now - 2 * ONE_DAY,
    type: 'credits-drop',
    data: { amount: 800, reason: 'subscription-monthly-drop' },
  },
  {
    id: 'notification-id-6',
    userId,
    createdAt: now - 45 * ONE_DAY,
    seenAt: now - 40 * ONE_DAY,
    type: 'credits-drop',
    data: { amount: 750, reason: 'subscription-monthly-drop' },
  },
  {
    id: 'notification-id-7',
    userId,
    createdAt: now - 400 * ONE_DAY,
    seenAt: now - 399 * ONE_DAY,
    type: 'credits-drop',
    data: { amount: 850, reason: 'subscription-monthly-drop' },
  },
];

export const Default = () => {
  return (
    <div style={{ maxWidth: 300 }}>
      <NotificationList notifications={notifications} />
    </div>
  );
};
