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

export type BuildType = 'cordova-build' | 'electron-build' | 'web-build';

export type Build = {
  id: string,
  gameId?: string, // not defined for old builds.
  userId: string,
  name?: string,
  description?: string,
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
  type: BuildType,
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

export const getBuildExtensionlessFilename = ({
  gameName,
  gameVersion,
}: {|
  gameName: string,
  gameVersion: string,
|}): string => {
  try {
    const specialCharactersRemovalRegex = /[./\\[\]<>&$@=;:+,?^{}%#~|'"*]/g;
    return `${gameName
      .slice(0, 50)
      .replace(specialCharactersRemovalRegex, '_')}-${gameVersion
      .slice(0, 15)
      .replace(specialCharactersRemovalRegex, '_')}`;
  } catch (error) {
    // If an error occurs, we don't want to prevent the build.
    console.warn(
      'An error happened when computing game extensionless filename:',
      error
    );
    return 'game';
  }
};

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

export const getWebBuildThumbnailUrl = (
  project: gdProject,
  buildId: string
): string => {
  const resourceManager = project.getResourcesManager();
  const resourceName = project
    .getPlatformSpecificAssets()
    .get('liluo', `thumbnail`);
  if (!resourceManager.hasResource(resourceName)) {
    return '';
  }
  const path = resourceManager.getResource(resourceName).getFile();
  const fileName = basename(path);
  if (!fileName) {
    return '';
  }
  // The exporter put asset files directly in the build folder.
  // It's not factorized with the exporter because it's a temporary solution.
  // TODO: Upload the thumbnail separately, so that this URL is not defined by the frontend.
  const uri = `https://games.gdevelop-app.com/game-${buildId}/${fileName}`;
  // The backend services encode the file URLs when uploaded, so we need to do the same before saving the value.
  const encodedUri = encodeURI(uri);
  return encodedUri;
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
  gameId: string,
  options: {|
    gameName: string,
    gameVersion: string,
  |}
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
          filename: getBuildExtensionlessFilename(options),
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
  gameId: string,
  options: {|
    gameName: string,
    gameVersion: string,
  |}
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
  gameId: string,
  options: {|
    gameName: string,
    gameVersion: string,
  |}
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
            filename: getBuildExtensionlessFilename(options),
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

export const updateBuild = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  buildId: string,
  { name, description }: { name?: string, description?: string }
): Promise<Build> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.patch(
        `${GDevelopBuildApi.baseUrl}/build/${buildId}`,
        { name, description },
        {
          params: {
            userId,
          },
          headers: {
            Authorization: authorizationHeader,
          },
        }
      )
    )
    .then(response => response.data);
};

export const deleteBuild = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  buildId: string
): Promise<Build> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.delete(`${GDevelopBuildApi.baseUrl}/build/${buildId}`, {
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
