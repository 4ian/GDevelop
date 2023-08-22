// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
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
import { GDevelopUserApi } from './ApiConfigs';

import { type Badge } from './Badge';
import { type Profile } from './Authentication';

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

export type UserPublicProfile = {|
  id: string,
  username: ?string,
  description: ?string,
  donateLink: ?string,
  communityLinks: CommunityLinks,
|};

export type UserPublicProfileByIds = {|
  [key: string]: UserPublicProfile,
|};

export type UsernameAvailability = {|
  username: string,
  isAvailable: boolean,
|};

export type User = Profile;

export type Team = {| id: string, createdAt: number, seats: number |};
export type TeamGroup = {| id: string, name: string |};
export type TeamMembership = {|
  userId: string,
  teamId: string,
  createdAt: number,
  groups: ?Array<string>,
|};

export const searchCreatorPublicProfilesByUsername = (
  searchString: string
): Promise<Array<UserPublicProfile>> => {
  return axios
    .get(`${GDevelopUserApi.baseUrl}/user-public-profile/search`, {
      params: {
        username: searchString,
        type: 'creator',
      },
    })
    .then(response => response.data);
};

export const getUserBadges = (id: string): Promise<Array<Badge>> => {
  return axios
    .get(`${GDevelopUserApi.baseUrl}/user/${id}/badge`)
    .then(response => response.data);
};

export const listUserTeams = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string
): Promise<Array<Team>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.get(`${GDevelopUserApi.baseUrl}/team`, {
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
  const response = await axios.get(`${GDevelopUserApi.baseUrl}/user`, {
    headers: { Authorization: authorizationHeader },
    params: { userId, teamId },
  });
  return response.data;
};

export const listTeamMemberships = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  teamId: string
): Promise<Array<TeamMembership>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.get(
    `${GDevelopUserApi.baseUrl}/team-membership`,
    {
      headers: { Authorization: authorizationHeader },
      params: { userId, teamId },
    }
  );
  return response.data;
};

export const listTeamGroups = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  teamId: string
): Promise<Array<TeamGroup>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.get(
    `${GDevelopUserApi.baseUrl}/team/${teamId}/group`,
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
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

export const getUsernameAvailability = (
  username: string
): Promise<UsernameAvailability> => {
  return axios
    .get(`${GDevelopUserApi.baseUrl}/username-availability/${username}`)
    .then(response => response.data);
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
  twitterUsername: {
    icon: <Twitter />,
    prefix: 'https://twitter.com/',
    maxLength: 15,
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
