// @flow
import axios from 'axios';
import { GDevelopBuildApi } from './ApiConfigs';

export const getUrl = (key: string) =>
  `https://s3-eu-west-1.amazonaws.com/gd-build/${key}`;

export type Build = {
  id: string,
  userId: string,
  bucket?: string,
  logsKey?: string,
  apkKey?: string,
  windowsExeKey?: string,
  windowsZipKey?: string,
  macosZipKey?: string,
  linuxAppImageKey?: string,
  status: 'pending' | 'complete' | 'error',
  type: 'cordova-build',
  createdAt: number,
  updatedAt: number,
};

export const buildElectron = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  key: string
): Promise<Build> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.post(
        `${GDevelopBuildApi.baseUrl}/build?userId=${encodeURIComponent(
          userId
        )}&key=${encodeURIComponent(key)}&type=electron-build`,
        null,
        {
          params: {},
          headers: {
            Authorization: authorizationHeader,
          },
        }
      )
    )
    .then(response => response.data);
};

export const buildCordovaAndroid = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  key: string
): Promise<Build> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.post(
        `${GDevelopBuildApi.baseUrl}/build?userId=${encodeURIComponent(
          userId
        )}&key=${encodeURIComponent(key)}&type=cordova-build`,
        null,
        {
          params: {},
          headers: {
            Authorization: authorizationHeader,
          },
        }
      )
    )
    .then(response => response.data);
};

export const getBuild = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  buildId: string
): Promise<Build> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.get(`${GDevelopBuildApi.baseUrl}/build/${buildId}`, {
        params: {
          userId,
        },
        headers: {
          Authorization: authorizationHeader,
        },
      })
    )
    .then(response => response.data);
};
