// @flow
import axios from 'axios';
import { makeTimestampedId } from '../../Utils/TimestampedId';
import { GDevelopBuildApi } from './ApiConfigs';
import { getSignedUrl } from './Usage';

export type TargetName =
  | 'winExe'
  | 'winZip'
  | 'macZip'
  | 'linuxAppImage'
  | 'androidApk'
  | 'androidAppBundle'
  | 's3';

export type Build = {
  id: string,
  userId: string,
  bucket?: string,
  logsKey?: string,
  apkKey?: string,
  aabKey?: string,
  windowsExeKey?: string,
  windowsZipKey?: string,
  macosZipKey?: string,
  linuxAppImageKey?: string,
  s3Key?: string,
  status: 'pending' | 'complete' | 'error',
  type: 'cordova-build' | 'electron-build' | 'web-build',
  targets?: Array<TargetName>,
  createdAt: number,
  updatedAt: number,
};

export type BuildArtifactKeyName =
  | 'apkKey'
  | 'aabKey'
  | 'windowsExeKey'
  | 'windowsZipKey'
  | 'macosZipKey'
  | 'linuxAppImageKey'
  | 's3Key'
  | 'logsKey';

export const getBuildArtifactUrl = (
  build: ?Build,
  keyName: BuildArtifactKeyName
): ?string => {
  if (!build || !build[keyName]) {
    return null;
  }

  if (keyName === 's3Key') {
    return `https://games.gdevelop-app.com/${build[keyName]}/index.html`;
  }

  return `https://builds.gdevelop-app.com/${build[keyName]}`;
};

type UploadOptions = {|
  signedUrl: string,
  contentType: string,
  key: string,
|};

export const getBuildFileUploadOptions = (): Promise<UploadOptions> => {
  const prefix = 'game-archive-' + makeTimestampedId();
  const filename = 'game-archive.zip';
  const contentType = 'application/zip';
  const key = prefix + '/' + filename;

  return getSignedUrl({ uploadType: 'build', key, contentType }).then(
    ({ signedUrl }) => {
      return {
        signedUrl,
        contentType,
        key,
      };
    }
  );
};

export const buildElectron = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  key: string,
  targets: Array<TargetName>
): Promise<Build> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.post(
        `${GDevelopBuildApi.baseUrl}/build?userId=${encodeURIComponent(
          userId
        )}&key=${encodeURIComponent(
          key
        )}&type=electron-build&targets=${encodeURIComponent(
          targets.join(',')
        )}`,
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

export const buildWeb = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  key: string
): Promise<Build> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.post(
        `${GDevelopBuildApi.baseUrl}/build?userId=${encodeURIComponent(
          userId
        )}&key=${encodeURIComponent(key)}&type=web-build&targets=s3`,
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
  key: string,
  targets: Array<TargetName>,
  keystore: 'old' | 'new'
): Promise<Build> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.post(
        `${GDevelopBuildApi.baseUrl}/build?userId=${encodeURIComponent(
          userId
        )}&key=${encodeURIComponent(
          key
        )}&type=cordova-build&targets=${encodeURIComponent(targets.join(','))}`,
        JSON.stringify({
          signing: {
            keystore,
          },
        }),
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

export const getBuilds = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string
): Promise<Array<Build>> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.get(`${GDevelopBuildApi.baseUrl}/build`, {
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
