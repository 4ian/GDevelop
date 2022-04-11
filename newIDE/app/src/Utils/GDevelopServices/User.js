// @flow
import axios from 'axios';
import { GDevelopUserApi } from './ApiConfigs';

import { type Badge } from './Badge';
const isDev = process.env.NODE_ENV === 'development';

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

export const getUserPublicProfileUrl = (userId: string, username: ?string) =>
  username
    ? `https://liluo.io/${username}${isDev ? '?dev=true' : ''}`
    : `https://liluo.io/user/${userId}${isDev ? '?dev=true' : ''}`;
