// @flow

import { type AuthenticatedUser } from '../Profile/AuthenticatedUserContext';

export const hasPendingNotifications = (
  authenticatedUser: AuthenticatedUser
): boolean => {
  if (!authenticatedUser.authenticated) return false;

  const { badges } = authenticatedUser;
  if (badges && badges.length > 0) {
    return badges.some(badge => !badge.seen);
  }

  return false;
};
