// @flow
import axios from 'axios';
import type Authentification from './Authentification';
import { GDevelopBuildApi } from './ApiConfigs';

export const getUrl = (key: string) =>
  `https://s3-eu-west-1.amazonaws.com/gd-build/${key}`;

export type Build = {
  id: string,
  userId: string,
  bucket?: string,
  logsKey?: string,
  apkKey?: string,
  status: 'pending' | 'complete',
  type: 'cordova-build',
  createdAt: number,
  updatedAt: number,
};

export const buildCordovaAndroid = (
  authentification: Authentification,
  userId: string,
  key: string
): Promise<Build> => {
  return axios
    .post(
      `${GDevelopBuildApi.baseUrl}/build?userId=${encodeURIComponent(
        userId
      )}&key=${encodeURIComponent(key)}&type=cordova-build`,
      null,
      {
        params: {},
        headers: {
          Authorization: authentification.getAuthorizationHeader(),
        },
      }
    )
    .then(response => response.data);
};
