// @flow
import axios from 'axios';
import { GDevelopUserApi } from './ApiConfigs';

import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

export const ACHIEVEMENT_FEATURE_FLAG = false;

export const TRIVIAL_FIRST_EVENT = 'trivial_first-event';
export const TRIVIAL_FIRST_BEHAVIOR = 'trivial_first-behavior';
export const TRIVIAL_FIRST_PREVIEW = 'trivial_first-preview';
export const TRIVIAL_FIRST_WEB_EXPORT = 'trivial_first-web-export';
export const TRIVIAL_FIRST_EXTENSION = 'trivial_first-extension';
export const TRIVIAL_FIRST_EFFECT = 'trivial_first-effect';
export const TRIVIAL_FIRST_DEBUG = 'trivial_first-debug';

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
  description: string,
|};

export type AchievementWithUnlockedDate = {|
  ...Achievement,
  unlockedAt: ?Date,
|};

const isAchievementAlreadyClaimed = (
  badges: Badge[],
  achievementId: string
): boolean => {
  return badges.map(badge => badge.achievementId).includes(achievementId);
};

const createOrEnsureBadgeForUser = async (
  authenticatedUser: AuthenticatedUser,
  achievementId: string
): Promise<?Badge> => {
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
  try {
    const authorizationHeader = await getAuthorizationHeader();
    const response = await axios.post(
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
    );
    onBadgesChanged();
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 409) {
      console.warn('Badge already exists');
    } else {
      throw err;
    }
  }
};

/**
 * Check if user has already claimed the achievement, to avoid executing
 * any extra code if that's the case.
 */
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

export const getAchievements = (): Promise<Array<Achievement>> => {
  return axios
    .get(`${GDevelopUserApi.baseUrl}/achievement`)
    .then(response => response.data);
};

export const compareAchievements = (a: AchievementWithUnlockedDate, b: AchievementWithUnlockedDate) => {
  if (b.unlockedAt && a.unlockedAt) {
    return b.unlockedAt - a.unlockedAt;
  } else if (a.unlockedAt && !b.unlockedAt) {
    return -1;
  } else if (!a.unlockedAt && b.unlockedAt) {
    return 1;
  } else {
    return 0;
  }
}