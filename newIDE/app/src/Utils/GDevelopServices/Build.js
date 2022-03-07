// @flow
import axios from 'axios';
import { makeTimestampedId } from '../../Utils/TimestampedId';
import { GDevelopBuildApi, GDevelopGamesPlatform } from './ApiConfigs';
import { getSignedUrl } from './Usage';
import { basename } from 'path';

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
  gameId?: string, // not defined for old builds.
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
    // New builds have a gameId.
    return build.gameId
      ? GDevelopGamesPlatform.getInstantBuildUrl(build.id)
      : `https://games.gdevelop-app.com/${build[keyName]}/index.html`;
  }

  return `https://builds.gdevelop-app.com/${build[keyName]}`;
};

export const getWebBuildGameFolderUrl = (buildId: string): string => {
  return `https:/games.gdevelop-app.com/game-${buildId}`;
};

export const getWebBuildThumbnailUrl = (
  project: gdProject,
  buildId: string
): string => {
  const path = project.getPlatformSpecificAssets().get('liluo', `thumbnail`);
  if (!path) {
    return '';
  }
  // The exporter put asset files directly in the build folder.
  // It's not factorized with the exporter because it's a temporary solution.
  return `https:/games.gdevelop-app.com/game-${buildId}/${basename(path)}`;
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
  targets: Array<TargetName>,
  gameId: string
): Promise<Build> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.post(`${GDevelopBuildApi.baseUrl}/build`, null, {
        params: {
          userId,
          key,
          type: 'electron-build',
          targets: targets.join(','),
          gameId,
        },
        headers: {
          Authorization: authorizationHeader,
        },
      })
    )
    .then(response => response.data);
};

export const buildWeb = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  key: string,
  gameId: string
): Promise<Build> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.post(`${GDevelopBuildApi.baseUrl}/build`, null, {
        params: {
          userId,
          key,
          type: 'web-build',
          targets: 's3',
          gameId,
        },
        headers: {
          Authorization: authorizationHeader,
        },
      })
    )
    .then(response => response.data);
};

export const buildCordovaAndroid = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  key: string,
  targets: Array<TargetName>,
  keystore: 'old' | 'new',
  gameId: string
): Promise<Build> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.post(
        `${GDevelopBuildApi.baseUrl}/build`,
        JSON.stringify({
          signing: {
            keystore,
          },
        }),
        {
          params: {
            userId,
            key,
            type: 'cordova-build',
            targets: targets.join(','),
            gameId,
          },
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
  userId: string,
  gameId?: string
): Promise<Array<Build>> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.get(`${GDevelopBuildApi.baseUrl}/build`, {
        params: {
          userId,
          gameId,
        },
        headers: {
          Authorization: authorizationHeader,
        },
      })
    )
    .then(response => response.data);
};
