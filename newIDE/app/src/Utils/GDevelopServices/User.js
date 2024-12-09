// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import axios from 'axios';
import Discord from '../../UI/CustomSvgIcons/Discord';
import Facebook from '../../UI/CustomSvgIcons/Facebook';
import Instagram from '../../UI/CustomSvgIcons/Instagram';
import Planet from '../../UI/CustomSvgIcons/Planet';
import Reddit from '../../UI/CustomSvgIcons/Reddit';
import Snapchat from '../../UI/CustomSvgIcons/Snapchat';
import TikTok from '../../UI/CustomSvgIcons/TikTok';
import Twitter from '../../UI/CustomSvgIcons/Twitter';
import YouTube from '../../UI/CustomSvgIcons/YouTube';
import GitHub from '../../UI/CustomSvgIcons/GitHub';
import { GDevelopUserApi } from './ApiConfigs';
import { type MessageByLocale } from '../i18n/MessageByLocale';

import { type Badge } from './Badge';
import { type Profile } from './Authentication';
import { type UserCourseProgress } from './Asset';
import { extractGDevelopApiErrorStatusAndCode } from './Errors';

export type BatchCreationResultUser = {|
  email: string,
  password: string,
  uid: string,
|};

export type CommunityLinkType =
  | 'personalWebsiteLink'
  | 'personalWebsite2Link'
  | 'twitterUsername'
  | 'facebookUsername'
  | 'youtubeUsername'
  | 'tiktokUsername'
  | 'instagramUsername'
  | 'redditUsername'
  | 'snapchatUsername'
  | 'discordServerLink';

export type CommunityLinks = {|
  personalWebsiteLink?: string,
  personalWebsite2Link?: string,
  twitterUsername?: string,
  facebookUsername?: string,
  youtubeUsername?: string,
  tiktokUsername?: string,
  instagramUsername?: string,
  redditUsername?: string,
  snapchatUsername?: string,
  discordServerLink?: string,
|};

export type UserSurvey = {|
  creationGoal?: Array<'learningOrTeaching' | 'building'>,
  creationGoalInput?: string,
  learningOrTeaching?: Array<'learning' | 'teaching'>,
  learningHow?: Array<'alone' | 'withTeacher'>,
  projectDescription?: string,
  kindOfProjects?: Array<
    | 'gameToPublish'
    | 'interactiveService'
    | 'other'
    | 'videoGame'
    | 'interactiveContent'
    | 'appOrTool'
    | 'seriousGame'
  >,
  workingTeam?: Array<'alone' | 'onePlus' | 'team'>,
  painPoints?: Array<
    | 'lackGraphics'
    | 'lackSound'
    | 'lackMarketing'
    | 'inAppMonetization'
    | 'externalIntegration'
  >,
  painPointsInput?: string,
  targetDate?: Array<
    | '1MonthOrLess'
    | '1To2Months'
    | '3To5Months'
    | '6MonthsPlus'
    | '1Year'
    | 'noDeadline'
  >,
  gameDevelopmentExperience?: Array<'none' | 'someNoCode' | 'someCode'>,
  targetPlatform?: Array<
    | 'steamEpic'
    | 'itchNewgrounds'
    | 'pokiCrazyGames'
    | 'androidApp'
    | 'iosApp'
    | 'client'
    | 'personal'
    | 'console'
    | 'other'
  >,
|};

/**
 * Official tutorial registered in the tutorial database.
 * Can be a youtube video, wiki page or blog article.
 */
export type GDevelopTutorialRecommendation = {
  type: 'gdevelop-tutorial',
  /**
   * Id of the tutorial in the database.
   */
  id: string,
};
export type PlanRecommendation = {
  type: 'plan',
  id: 'silver' | 'gold' | 'startup' | 'business' | 'education',
};
export type GuidedLessonsRecommendation = {
  type: 'guided-lessons',
  lessonsIds: string[],
};
export type QuickCustomizationRecommendation = {
  type: 'quick-customization',
  list: Array<{
    type: 'example',
    exampleSlug: string,
    thumbnailTitleByLocale: MessageByLocale,
  }>,
};
export type Recommendation =
  | GDevelopTutorialRecommendation
  | GuidedLessonsRecommendation
  | PlanRecommendation
  | QuickCustomizationRecommendation;

export type UserPublicProfile = {|
  id: string,
  createdAt: number,
  username: ?string,
  description: ?string,
  donateLink: ?string,
  discordUsername: ?string,
  githubUsername?: ?string,
  communityLinks: CommunityLinks,
  iconUrl: string,
|};

export type UserPublicProfileByIds = {|
  [key: string]: UserPublicProfile,
|};

export type UsernameAvailability = {|
  username: string,
  isAvailable: boolean,
|};

export type User = {|
  ...Profile,
  /**
   * Present only if requested when admin user is listing members of teams.
   */
  +password?: ?string,
|};

export type Team = {| id: string, createdAt: number, seats: number |};
export type TeamGroup = {| id: string, name: string |};
export type TeamMembership = {|
  userId: string,
  teamId: string,
  createdAt: number,
  groups?: ?Array<string>,
|};

export type UserLeaderboardEntry = {
  count: number | null,
  userPublicProfile: UserPublicProfile | null,
};

export type UserLeaderboard = {
  name: string,
  displayNameByLocale: MessageByLocale,
  topUserCommentQualityRatings: UserLeaderboardEntry[],
};

export const client = axios.create({
  baseURL: GDevelopUserApi.baseUrl,
});

export const searchCreatorPublicProfilesByUsername = (
  searchString: string
): Promise<Array<UserPublicProfile>> => {
  return client
    .get(`/user-public-profile/search`, {
      params: {
        username: searchString,
        type: 'creator',
      },
    })
    .then(response => response.data);
};

export const getUserBadges = async (id: string): Promise<Array<Badge>> => {
  const response = await client.get(`/user/${id}/badge`);
  const badges = response.data;

  if (!Array.isArray(badges)) {
    throw new Error('Invalid response from the badges API');
  }

  return badges;
};

export const listUserTeams = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string
): Promise<Array<Team>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get(`/team`, {
    headers: { Authorization: authorizationHeader },
    params: { userId, role: 'admin' },
  });
  return response.data;
};

export const listTeamMembers = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  teamId: string
): Promise<Array<User>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get(`/user`, {
    headers: { Authorization: authorizationHeader },
    params: {
      userId,
      teamId,
      memberType: 'basic',
      include: 'decryptedPassword',
    },
  });
  return response.data;
};

export const listTeamAdmins = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  teamId: string
): Promise<Array<User>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get(`/user`, {
    headers: { Authorization: authorizationHeader },
    params: { userId, teamId, memberType: 'admin' },
  });
  return response.data;
};

export const listTeamMemberships = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  teamId: string
): Promise<Array<TeamMembership>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get(`/team-membership`, {
    headers: { Authorization: authorizationHeader },
    params: { userId, teamId },
  });
  return response.data;
};

export const listTeamGroups = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  teamId: string
): Promise<Array<TeamGroup>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get(`/team/${teamId}/group`, {
    headers: { Authorization: authorizationHeader },
    params: { userId },
  });
  return response.data;
};

export const updateGroup = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  teamId: string,
  groupId: string,
  attributes: {| name: string |}
): Promise<TeamGroup> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.patch(
    `/team/${teamId}/group/${groupId}`,
    attributes,
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};

export const createGroup = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  teamId: string,
  attributes: {| name: string |}
): Promise<TeamGroup> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.post(`/team/${teamId}/group`, attributes, {
    headers: { Authorization: authorizationHeader },
    params: { userId },
  });
  return response.data;
};

export const deleteGroup = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  teamId: string,
  groupId: string
): Promise<Array<TeamGroup>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.delete(`/team/${teamId}/group/${groupId}`, {
    headers: { Authorization: authorizationHeader },
    params: { userId },
  });
  return response.data;
};

export const listRecommendations = async (
  getAuthorizationHeader: () => Promise<string>,
  { userId }: {| userId: string |}
): Promise<Array<Recommendation>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get(`/recommendation`, {
    headers: { Authorization: authorizationHeader },
    params: { userId },
  });
  return response.data;
};

export const listDefaultRecommendations = async (): Promise<
  Array<Recommendation>
> => {
  const response = await client.get(`/recommendation`);
  return response.data;
};

export const updateUserGroup = async (
  getAuthorizationHeader: () => Promise<string>,
  adminUserId: string,
  teamId: string,
  groupId: string,
  userId: string
): Promise<Array<TeamGroup>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.post(
    `/team/${teamId}/action/update-members`,
    [{ groupId, userId }],
    {
      headers: { Authorization: authorizationHeader },
      params: { userId: adminUserId },
    }
  );
  return response.data;
};

export const getUserPublicProfilesByIds = async (
  ids: Array<string>
): Promise<UserPublicProfileByIds> => {
  // Ensure we don't send an empty list of ids, as the request would fail.
  if (ids.length === 0) return {};
  const response = await client.get(`/user-public-profile`, {
    params: {
      id: ids.join(','),
    },
  });
  return response.data;
};

export const getUserPublicProfile = async (
  id: string
): Promise<UserPublicProfile> => {
  const response = await client.get(`/user-public-profile/${id}`);

  return response.data;
};

export const changeTeamMemberPassword = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    adminUserId,
    newPassword,
  }: {|
    userId: string,
    adminUserId: string,
    newPassword: string,
  |}
) => {
  const authorizationHeader = await getAuthorizationHeader();
  await client.post(
    `/user/action/change-password`,
    {
      userId,
      newPassword,
    },
    {
      headers: { Authorization: authorizationHeader },
      params: { userId: adminUserId },
    }
  );
};

export const activateTeamMembers = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userIds,
    teamId,
    adminUserId,
    activate,
  }: {|
    userIds: string[],
    teamId: string,
    adminUserId: string,
    activate: boolean,
  |}
) => {
  const authorizationHeader = await getAuthorizationHeader();
  await client.post(
    `/user/action/activate-users`,
    {
      userIds,
      teamId,
      activate,
    },
    {
      params: { userId: adminUserId },
      headers: { Authorization: authorizationHeader },
    }
  );
};

export const createTeamMembers = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    quantity,
    teamId,
    adminUserId,
  }: {|
    quantity: number,
    teamId: string,
    adminUserId: string,
  |}
): Promise<BatchCreationResultUser[]> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.post(
    `/team/${teamId}/action/batch-create-users`,
    {
      quantity,
    },
    {
      params: { userId: adminUserId },
      headers: { Authorization: authorizationHeader },
    }
  );
  return response.data;
};

export const setUserAsAdmin = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    email,
    activate,
    teamId,
    adminUserId,
  }: {|
    email: string,
    activate: boolean,
    teamId: string,
    adminUserId: string,
  |}
) => {
  const authorizationHeader = await getAuthorizationHeader();
  await client.post(
    `/team/${teamId}/action/set-admin`,
    {
      email,
      activate,
    },
    {
      params: { userId: adminUserId },
      headers: { Authorization: authorizationHeader },
    }
  );
};

export const getUsernameAvailability = async (
  username: string
): Promise<UsernameAvailability> => {
  const response = await client.get(`/username-availability/${username}`);
  return response.data;
};

export const syncDiscordUsername = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string
): Promise<void> => {
  const authorizationHeader = await getAuthorizationHeader();
  await client.post(
    `/user/${userId}/action/update-discord-role`,
    {},
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
};

export const getUserCommentQualityRatingsLeaderboards = async (): Promise<
  Array<UserLeaderboard>
> => {
  const response = await client.get(
    '/user-comment-quality-ratings-leaderboard?leaderboardRegionName=global'
  );

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid response from the user leaderboard API');
  }

  return response.data;
};

export const registerUserInterest = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  data: {|
    firstName: string,
    lastName: string,
    email: string,
    interestKind: 'education',
  |}
): Promise<void> => {
  const authorizationHeader = await getAuthorizationHeader();
  await client.post(`/action/register-user-interest`, data, {
    headers: { Authorization: authorizationHeader },
    params: { userId },
  });
};

const simpleUrlRegex = /^https:\/\/[^ ]+$/;
const profileLinkFormattingErrorMessage = (
  <Trans>Please enter a valid URL, starting with https://</Trans>
);
const simpleDiscordUrlRegex = /^https:\/\/discord[^ ]+$/;
const discordServerLinkFormattingErrorMessage = (
  <Trans>Please enter a valid URL, starting with https://discord</Trans>
);
const tiktokUsernameEmptyOrNoAtRegex = /^$|^(?!@)/;
const tiktokUsernameFormattingErrorMessage = (
  <Trans>You don't need to add the @ in your username</Trans>
);

export const donateLinkConfig = {
  getFormattingError: (value: string) =>
    value && !simpleUrlRegex.test(value)
      ? profileLinkFormattingErrorMessage
      : undefined,
  maxLength: 150,
};

export const discordUsernameConfig = {
  maxLength: 32,
};

export const communityLinksConfig = {
  personalWebsiteLink: {
    icon: <Planet />,
    getFormattingError: (value: string) =>
      value && !simpleUrlRegex.test(value)
        ? profileLinkFormattingErrorMessage
        : undefined,
    maxLength: 150,
  },
  personalWebsite2Link: {
    icon: <Planet />,
    getFormattingError: (value: string) =>
      value && !simpleUrlRegex.test(value)
        ? profileLinkFormattingErrorMessage
        : undefined,
    maxLength: 150,
  },
  githubUsername: {
    icon: <GitHub style={{ width: 24, height: 24 }} />,
    prefix: 'https://github.com/',
    maxLength: 39,
    getMessageFromUpdate: (responseCode: string) => {
      if (
        responseCode === 'github-star/badge-given' ||
        responseCode === 'github-star/badge-already-given'
      ) {
        return {
          title: t`You're awesome!`,
          message: t`Thanks for starring GDevelop repository. We added credits to your account as a thank you gift.`,
        };
      } else if (responseCode === 'github-star/repository-not-starred') {
        return {
          title: t`We could not find your GitHub star`,
          message: t`Make sure you star the repository called 4ian/GDevelop with your GitHub user and try again.`,
        };
      } else if (responseCode === 'github-star/user-not-found') {
        return {
          title: t`We could not find your GitHub user and star`,
          message: t`Make sure you create your GitHub account, star the repository called 4ian/GDevelop, enter your username here and try again.`,
        };
      }
      return null;
    },
    getRewardMessage: (hasBadge: boolean, rewardValueInCredits: string) =>
      !hasBadge
        ? t`[Star the GDevelop repository](https://github.com/4ian/GDevelop) and add your GitHub username here to get ${rewardValueInCredits} free credits as a thank you!`
        : t`Thank you for supporting the GDevelop open-source community. Credits were added to your account as a thank you.`,
  },
  twitterUsername: {
    icon: <Twitter />,
    prefix: 'https://twitter.com/',
    maxLength: 15,
    getMessageFromUpdate: (responseCode: string) => {
      if (
        responseCode === 'twitter-follow/badge-given' ||
        responseCode === 'twitter-follow/badge-already-given'
      ) {
        return {
          title: t`You're awesome!`,
          message: t`Thanks for following GDevelop. We added credits to your account as a thank you gift.`,
        };
      } else if (responseCode === 'twitter-follow/account-not-followed') {
        return {
          title: t`We could not check your follow`,
          message: t`Make sure you follow the GDevelop account and try again.`,
        };
      } else if (responseCode === 'twitter-follow/user-not-found') {
        return {
          title: t`We could not find your user`,
          message: t`Make sure your username is correct, follow the GDevelop account and try again.`,
        };
      }

      return null;
    },
    getRewardMessage: (hasBadge: boolean, rewardValueInCredits: string) =>
      !hasBadge
        ? t`[Follow GDevelop](https://twitter.com/GDevelopApp) and enter your Twitter username here to get ${rewardValueInCredits} free credits as a thank you!`
        : t`Thank you for supporting GDevelop. Credits were added to your account as a thank you.`,
  },
  facebookUsername: {
    icon: <Facebook />,
    prefix: 'https://facebook.com/',
    maxLength: 50,
  },
  youtubeUsername: {
    icon: <YouTube />,
    prefix: 'https://youtube.com/',
    maxLength: 100,
  },
  tiktokUsername: {
    icon: <TikTok />,
    prefix: 'https://tiktok.com/@',
    getFormattingError: (value: string) =>
      !tiktokUsernameEmptyOrNoAtRegex.test(value)
        ? tiktokUsernameFormattingErrorMessage
        : undefined,
    maxLength: 30,
    getMessageFromUpdate: (responseCode: string) => {
      if (
        responseCode === 'tiktok-follow/badge-given' ||
        responseCode === 'tiktok-follow/badge-already-given'
      ) {
        return {
          title: t`You're awesome!`,
          message: t`Thanks for following GDevelop. We added credits to your account as a thank you gift.`,
        };
      } else if (responseCode === 'tiktok-follow/account-not-followed') {
        return {
          title: t`We could not check your follow`,
          message: t`Make sure you follow the GDevelop account and try again.`,
        };
      } else if (responseCode === 'tiktok-follow/user-not-found') {
        return {
          title: t`We could not find your user`,
          message: t`Make sure your username is correct, follow the GDevelop account and try again.`,
        };
      }

      return null;
    },
    getRewardMessage: (hasBadge: boolean, rewardValueInCredits: string) =>
      !hasBadge
        ? t`[Follow GDevelop](https://tiktok.com/@gdevelop) and enter your TikTok username here to get ${rewardValueInCredits} free credits as a thank you!`
        : t`Thank you for supporting GDevelop. Credits were added to your account as a thank you.`,
  },
  instagramUsername: {
    icon: <Instagram />,
    prefix: 'https://instagram.com/',
    maxLength: 30,
  },
  redditUsername: {
    icon: <Reddit />,
    prefix: 'https://reddit.com/user/',
    maxLength: 20,
  },
  snapchatUsername: {
    icon: <Snapchat />,
    prefix: 'https://snapchat.com/add/',
    maxLength: 15,
  },
  discordServerLink: {
    icon: <Discord />,
    getFormattingError: (value: string) =>
      value && !simpleDiscordUrlRegex.test(value)
        ? discordServerLinkFormattingErrorMessage
        : undefined,
    maxLength: 150,
  },
};

export const fetchUserCourseProgress = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  courseId: string
): Promise<UserCourseProgress | null> => {
  const authorizationHeader = await getAuthorizationHeader();
  try {
    const response = await client.get(`/course/${courseId}/progress`, {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    });

    return response.data;
  } catch (error) {
    const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(error);
    if (extractedStatusAndCode && extractedStatusAndCode.status === 404) {
      return null;
    }
    throw error;
  }
};

export const updateUserCourseProgress = async (
  getAuthorizationHeader: () => Promise<string>,
  userCourseProgress: UserCourseProgress
): Promise<void> => {
  const authorizationHeader = await getAuthorizationHeader();
  await client.put(
    `/course/${userCourseProgress.courseId}/progress`,
    { progress: userCourseProgress.progress },
    {
      headers: { Authorization: authorizationHeader },
      params: { userId: userCourseProgress.userId },
    }
  );
};
