// @flow
import axios from 'axios';
import { makeTimestampedId } from '../../Utils/TimestampedId';
import { GDevelopBuildApi, GDevelopBuildUpload } from './ApiConfigs';

export const getBuildUrl = (key: string) =>
  `https://s3-eu-west-1.amazonaws.com/gd-build/${key}`;

export type TargetName = 'winExe' | 'winZip' | 'macZip' | 'linuxAppImage';

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
  type: 'cordova-build' | 'electron-build',
  targets?: Array<TargetName>,
  createdAt: number,
  updatedAt: number,
};

export const uploadBuildFile = (
  blob: Blob,
  onProgress: (progress: number, total: number) => void
): Promise<string> => {
  const prefix = 'game-archive-' + makeTimestampedId();
  const filename = 'game-archive.zip';

  return new Promise((resolve, reject) => {
    GDevelopBuildUpload.awsS3Client
      .putObject(
        {
          Body: blob,
          Bucket: GDevelopBuildUpload.options.destinationBucket,
          Key: prefix + '/' + filename,
        },
        (err: ?Error) => {
          if (err) return reject(err);

          resolve(prefix + '/' + filename);
        }
      )
      .on('httpUploadProgress', progress => {
        if (!progress || !progress.total) {
          onProgress(0, 0);
          return;
        }
        onProgress(progress.loaded, progress.total);
      });
  });
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
