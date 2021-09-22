// @flow
import axios from 'axios';
import { GDevelopUserApi } from './ApiConfigs';

export type UserPublicProfile = {|
  id: string,
  username?: string,
|};

export type UserPublicProfileByIds = {|
  [key: string]: UserPublicProfile,
|};

export const searchUserPublicProfilesByUsername = (
  searchString: string
): Promise<Array<UserPublicProfile>> => {
  return axios
    .get(`${GDevelopUserApi.baseUrl}/user-public-profile/search`, {
      params: {
        username: searchString,
      },
    })
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
