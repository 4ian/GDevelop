// @flow

import { type AuthenticatedUser } from '../Profile/AuthenticatedUserContext';

export const arePendingNotifications = (
  authenticatedUser: AuthenticatedUser
): boolean => {
  console.log(authenticatedUser.authenticated)
  if (!authenticatedUser.authenticated) return false;

  const { badges } = authenticatedUser;
  if (badges && badges.length > 0) {
    return badges.some(badge => !badge.seen);
  }

  return false;
};
