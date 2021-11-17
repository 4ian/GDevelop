// @flow
import axios from 'axios';
import { GDevelopUserApi } from './ApiConfigs';

import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

export type UserPublicProfile = {|
  id: string,
  username: ?string,
  description: ?string,
|};

export type UserPublicProfileSearch = {|
  id: string,
  username: ?string,
|};

export type UserPublicProfileByIds = {|
  [key: string]: UserPublicProfile,
|};

export type Badge = {|
  seen: boolean,
  unlockedAt: string,
  userId: string,
  achievementId: string,
|};

export type Achievement = {|
  id: string,
  category: string,
  name: string,
|};

export const searchUserPublicProfilesByUsername = (
  searchString: string
): Promise<Array<UserPublicProfileSearch>> => {
  return axios
    .get(`${GDevelopUserApi.baseUrl}/user-public-profile/search`, {
      params: {
        username: searchString,
      },
    })
    .then(response => response.data);
};

export const getAchievements = (): Promise<Array<Achievement>> => {
  return axios
    .get(`${GDevelopUserApi.baseUrl}/achievement`)
    .then(response => response.data);
};

export const getUserBadges = (id: string): Promise<Array<Badge>> => {
  return axios
    .get(`${GDevelopUserApi.baseUrl}/user/${id}/badge`)
    .then(response => response.data);
};

export const getUserPublicProfilesByIds = (
  ids: Array<string>
): Promise<UserPublicProfileByIds> => {
  return axios
    .get(`${GDevelopUserApi.baseUrl}/user-public-profile`, {
      params: {
        id: ids.join(','),
      },
    })
    .then(response => response.data);
};

export const getUserPublicProfile = (
  id: string
): Promise<UserPublicProfile> => {
  return axios
    .get(`${GDevelopUserApi.baseUrl}/user-public-profile/${id}`)
    .then(response => response.data);
};

const isAchievementAlreadyClaimed = (
  badges: Badge[],
  achievementId: string
): boolean => {
  return badges.map(badge => badge.achievementId).includes(achievementId);
};

const createOrEnsureBadgeForUser = (
  authenticatedUser: AuthenticatedUser,
  achievementId: string
): ?Promise<?Badge> => {
  const {
    badges,
    firebaseUser,
    getAuthorizationHeader,
    onBadgesChanged,
  } = authenticatedUser;
  if (!badges || !firebaseUser) return null;
  if (isAchievementAlreadyClaimed(badges, achievementId)) {
    return null;
  }
  console.log(`posting achievement ${achievementId}`);

  const userId = firebaseUser.uid;
  return getAuthorizationHeader().then(authorizationHeader =>
    axios
      .post(
        `${GDevelopUserApi.baseUrl}/user/${userId}/badge`,
        {
          achievementId,
        },
        {
          params: {
            userId,
          },
          headers: {
            Authorization: authorizationHeader,
          },
        }
      )
      .then(response => {
        onBadgesChanged();
        return response.data;
      })
      .catch(err => {
        if (err.response.status === 409) {
          console.warn('Badge already exists');
        } else {
          throw err;
        }
      })
  );
};

export const addCreateBadgePreHookIfNotClaimed = (
  authenticatedUser: AuthenticatedUser,
  achievementId: string,
  callback: Function
): Function => {
  const { badges } = authenticatedUser;
  if (!badges) return callback;
  if (isAchievementAlreadyClaimed(badges, achievementId)) {
    return callback;
  }

  return (...args) => {
    callback.apply(null, args);
    createOrEnsureBadgeForUser(authenticatedUser, achievementId);
  };
};
