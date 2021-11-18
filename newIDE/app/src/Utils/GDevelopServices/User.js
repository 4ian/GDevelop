// @flow
import axios from 'axios';
import { GDevelopUserApi } from './ApiConfigs';

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

export const acceptGameStatsEmail = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string
) => {
  return getAuthorizationHeader()
    .then(authorizationHeader => {
      return axios.patch(
        `${GDevelopUserApi.baseUrl}/user/${userId}`,
        { getGameStatsEmail: true },
        {
          params: { userId: userId },
          headers: { Authorization: authorizationHeader },
        }
      );
    })
    .then(response => response.data)
    .catch(error => {
      console.error('Error while editing user:', error);
      throw error.response.data;
    });
};
