// @flow
import axios from 'axios';
import { GDevelopUserApi } from './ApiConfigs';
import { type Profile } from './Authentication';

import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { extractGDevelopApiErrorStatusAndCode } from './Errors';

export const TRIVIAL_FIRST_EVENT = 'trivial_first-event';
export const TRIVIAL_FIRST_BEHAVIOR = 'trivial_first-behavior';
export const TRIVIAL_FIRST_PREVIEW = 'trivial_first-preview';
export const TRIVIAL_FIRST_WEB_EXPORT = 'trivial_first-web-export';
export const TRIVIAL_FIRST_EXTENSION = 'trivial_first-extension';
export const TRIVIAL_FIRST_EFFECT = 'trivial_first-effect';
export const TRIVIAL_FIRST_DEBUG = 'trivial_first-debug';
export const getTutorialCompletedAchievementId = (tutorialId: string) =>
  'trivial_in-app-tutorial-completed_' + tutorialId;

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

export type AchievementWithBadgeData = {|
  ...Achievement,
  seen?: boolean,
  unlockedAt: ?Date,
|};

const isAchievementAlreadyClaimed = (
  badges: Badge[],
  achievementId: string
): boolean => {
  return badges.map(badge => badge.achievementId).includes(achievementId);
};

export const createOrEnsureBadgeForUser = async (
  {
    badges,
    profile,
    getAuthorizationHeader,
    onBadgesChanged,
  }: {
    badges: ?Array<Badge>,
    profile: ?Profile,
    getAuthorizationHeader: () => Promise<string>,
    onBadgesChanged: () => Promise<void>,
  },
  achievementId: string
): Promise<?Badge> => {
  if (!badges || !profile) return null;
  if (isAchievementAlreadyClaimed(badges, achievementId)) {
    return null;
  }

  const userId = profile.id;
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
  } catch (error) {
    const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(error);
    if (extractedStatusAndCode && extractedStatusAndCode.status === 409) {
      console.warn('Badge already exists');
    } else {
      throw error;
    }
  }
};

/**
 * Check if user has already claimed the achievement, to avoid executing
 * any extra code if that's the case.
 */
export const addCreateBadgePreHookIfNotClaimed = <
  T: (...args: Array<any>) => any
>(
  authenticatedUser: AuthenticatedUser,
  achievementId: string,
  callback: T
): T => {
  const { badges } = authenticatedUser;
  if (!badges) return callback;
  if (isAchievementAlreadyClaimed(badges, achievementId)) {
    return callback;
  }

  // $FlowFixMe - hard to (or can't?) express the exact function being passed.
  return (...args) => {
    try {
      createOrEnsureBadgeForUser(authenticatedUser, achievementId);
    } catch (err) {
      console.error(`Couldn't create badge ${achievementId}; ${err}`);
    }
    return callback.apply(null, args);
  };
};

export const getAchievements = async (): Promise<Array<Achievement>> => {
  const response = await axios.get(`${GDevelopUserApi.baseUrl}/achievement`);

  const achievements = response.data;
  if (!Array.isArray(achievements)) {
    throw new Error('Invalid response from the achievements API');
  }

  return achievements;
};

export const markBadgesAsSeen = async (
  authenticatedUser: AuthenticatedUser
): Promise<?void> => {
  const {
    badges,
    firebaseUser,
    getAuthorizationHeader,
    onBadgesChanged,
  } = authenticatedUser;
  if (!badges || !firebaseUser) return null;

  const unseenBadges = badges.filter(badge => !badge.seen);
  if (unseenBadges.length === 0) return;

  const userId = firebaseUser.uid;
  try {
    const authorizationHeader = await getAuthorizationHeader();
    const response = await axios.patch(
      `${GDevelopUserApi.baseUrl}/user/${userId}/badge`,
      unseenBadges.map(badge => ({
        achievementId: badge.achievementId,
        seen: true,
      })),
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
    console.error(`Couldn't mark badges as seen: ${err}`);
  }
};

export const compareAchievements = (
  a: AchievementWithBadgeData,
  b: AchievementWithBadgeData
) => {
  if (b.unlockedAt && a.unlockedAt) {
    return b.unlockedAt - a.unlockedAt;
  } else if (a.unlockedAt && !b.unlockedAt) {
    return -1;
  } else if (!a.unlockedAt && b.unlockedAt) {
    return 1;
  } else {
    return 0;
  }
};
