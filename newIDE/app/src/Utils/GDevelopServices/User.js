// @flow
import axios from 'axios';
import { GDevelopUserApi } from './ApiConfigs';

import { type Badge } from './Badge';

export type UserPublicProfile = {|
  id: string,
  username: ?string,
  description: ?string,
|};

export type UserPublicProfileByIds = {|
  [key: string]: UserPublicProfile,
|};

export type UsernameAvailability = {|
  username: string,
  isAvailable: boolean,
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
