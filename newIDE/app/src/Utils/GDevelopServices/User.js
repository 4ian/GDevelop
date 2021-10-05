// @flow
import axios from 'axios';
import { GDevelopUserApi } from './ApiConfigs';

export type UserPublicProfile = {|
  id: string,
  email: string,
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
