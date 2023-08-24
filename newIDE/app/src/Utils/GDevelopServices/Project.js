// @flow
import axios from 'axios';
import {
  GDevelopProjectApi,
  GDevelopProjectResourcesStorage,
} from './ApiConfigs';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import PromisePool from '@supercharge/promise-pool';
import { getFileSha512TruncatedTo256 } from '../FileHasher';
import { isNativeMobileApp } from '../Platform';
import { unzipFirstEntryOfBlob } from '../Zip.js/Utils';

export const CLOUD_PROJECT_NAME_MAX_LENGTH = 50;
export const PROJECT_RESOURCE_MAX_SIZE_IN_BYTES = 15 * 1000 * 1000;

export const projectResourcesClient = axios.create({
  baseURL: GDevelopProjectResourcesStorage.baseUrl,
  // On web/desktop, "credentials" are necessary to use the cookie previously
  // returned by the server.
  withCredentials: !isNativeMobileApp(),
});

export const apiClient = axios.create({
  baseURL: GDevelopProjectApi.baseUrl,
});

const projectResourcesCredentialsApiClient = axios.create({
  baseURL: GDevelopProjectApi.baseUrl,
  // On web/desktop, "credentials" are necessary to save cookie returned by the server.
  withCredentials: !isNativeMobileApp(),
});

/**
 * The token returned by the server to access the project resources and files, if not using a cookie.
 */
let gdResourceJwt: string | null = null;

export const storeGDevelopResourceJwtToken = (token: string) => {
  gdResourceJwt = token;
};

export const getGDevelopResourceJwtToken = (): string | null => {
  return gdResourceJwt;
};

export const cleanGDevelopResourceJwtToken = () => {
  gdResourceJwt = null;
};

export const addGDevelopResourceJwtTokenToUrl = (url: string) => {
  if (!gdResourceJwt) return url;

  const separator = url.indexOf('?') === -1 ? '?' : '&';
  return (
    url + separator + 'gd_resource_token=' + encodeURIComponent(gdResourceJwt)
  );
};

type ResourceFileWithUploadPresignedUrl = {|
  resourceFile: File,
  presignedUrl: string,
  index: number,
|};

export type UploadedProjectResourceFiles = Array<{|
  error: ?Error,
  resourceFile: File,
  url: ?string,
|}>;

type CloudProject = {|
  id: string,
  name: string,
  gameId?: string,
  createdAt: string,
  currentVersion?: string,
  deletedAt?: string,
|};

export type CloudProjectVersion = {|
  projectId: string,
  id: string,
  createdAt: string,
  /** previousVersion is null when the entity represents the initial version of a project. */
  previousVersion: null | string,
|};

export type CloudProjectWithUserAccessInfo = {|
  ...CloudProject,
  lastModifiedAt: string,
|};

export const isCloudProjectVersionSane = async (
  authenticatedUser: AuthenticatedUser,
  cloudProjectId: string,
  versionId: string
): Promise<boolean> => {
  const response = await refetchCredentialsForProjectAndRetryIfUnauthorized(
    authenticatedUser,
    cloudProjectId,
    () =>
      projectResourcesClient.get(
        addGDevelopResourceJwtTokenToUrl(
          `/${cloudProjectId}/versions/${versionId}.zip`
        ),
        { responseType: 'blob' }
      )
  );
  try {
    const projectFile = await unzipFirstEntryOfBlob(response.data);
    JSON.parse(projectFile);
    return true;
  } catch (error) {
    return false;
  }
};

const refetchCredentialsForProjectAndRetryIfUnauthorized = async <T>(
  authenticatedUser: AuthenticatedUser,
  cloudProjectId: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  try {
    const response = await apiCall();
    return response;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      await getCredentialsForCloudProject(authenticatedUser, cloudProjectId);
      const response = await apiCall();
      return response;
    }
    throw error;
  }
};

/**
 * Extracts the version id from the presigned url generated by the api.
 * Presigned url looks like `/{projectId}/versions/{versionId}.zip?signature=XXX`
 */
const getVersionIdFromPath = (path: string): string => {
  let cleanedPath = path;
  const searchParamsStartIndex = path.indexOf('?');
  if (searchParamsStartIndex >= 0) {
    cleanedPath = path.substring(0, searchParamsStartIndex);
  }
  const filenameStartIndex = cleanedPath.lastIndexOf('/') + 1;
  const filenameEndIndex = cleanedPath.indexOf('.zip');
  return path.substring(filenameStartIndex, filenameEndIndex);
};

export const getLastVersionsOfProject = async (
  authenticatedUser: AuthenticatedUser,
  cloudProjectId: string
): Promise<?Array<CloudProjectVersion>> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await apiClient.get(`/project/${cloudProjectId}/version`, {
    headers: {
      Authorization: authorizationHeader,
    },
    params: { userId },
  });
  return response.data;
};

export const getCredentialsForCloudProject = async (
  authenticatedUser: AuthenticatedUser,
  cloudProjectId: string
): Promise<boolean> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return false;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await projectResourcesCredentialsApiClient.get(
    `/project/${cloudProjectId}/action/authorize`,
    {
      headers: {
        Authorization: authorizationHeader,
      },
      params: { userId },
      validateStatus: status => true,
    }
  );

  if (isNativeMobileApp()) {
    if (response.data && typeof response.data.gd_resource_jwt === 'string')
      storeGDevelopResourceJwtToken(response.data.gd_resource_jwt);
  }

  return response.status >= 200 && response.status < 400;
};

export const clearCloudProjectCredentials = async (): Promise<void> => {
  if (isNativeMobileApp()) {
    cleanGDevelopResourceJwtToken();
  } else {
    await projectResourcesCredentialsApiClient.get(
      '/action/clear-authorization'
    );
  }
};

export const createCloudProject = async (
  authenticatedUser: AuthenticatedUser,
  cloudProjectCreationPayload: {| name: string, gameId?: string |}
): Promise<?CloudProject> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return null;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await apiClient.post(
    '/project',
    cloudProjectCreationPayload,
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};

/**
 * This method takes the zipped project, uploads it to the cloud project storage
 * and then informs the Project service that the cloud project has a new version.
 * By default, a new version will have the project current version as parent.
 * In some cases (project recovery from an old version), the new version will have
 * a specific version as parent. In that case, specify a value in `previousVersion`.
 */
export const commitVersion = async ({
  authenticatedUser,
  cloudProjectId,
  zippedProject,
  previousVersion,
}: {
  authenticatedUser: AuthenticatedUser,
  cloudProjectId: string,
  zippedProject: Blob,
  previousVersion?: ?string,
}): Promise<?string> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  // Get a presigned url to upload a new version (the URL will contain the new version id).
  const presignedUrl = await getPresignedUrlForVersionUpload(
    authenticatedUser,
    cloudProjectId
  );
  if (!presignedUrl) return;
  const newVersion = getVersionIdFromPath(presignedUrl);
  // Upload zipped project.
  await refetchCredentialsForProjectAndRetryIfUnauthorized(
    authenticatedUser,
    cloudProjectId,
    () =>
      projectResourcesClient.post(
        addGDevelopResourceJwtTokenToUrl(presignedUrl),
        zippedProject,
        {
          headers: { 'content-type': 'application/zip' },
        }
      )
  );
  // Inform backend a new version has been uploaded.
  const response = await apiClient.post(
    `/project/${cloudProjectId}/action/commit`,
    { newVersion, ...(previousVersion ? { previousVersion } : undefined) },
    {
      headers: {
        Authorization: authorizationHeader,
      },
      params: { userId },
    }
  );
  return response.data;
};

export const uploadProjectResourceFiles = async (
  authenticatedUser: AuthenticatedUser,
  cloudProjectId: string,
  resourceFiles: File[],
  onProgress: (number, number) => void
): Promise<UploadedProjectResourceFiles> => {
  // Get the pre-signed urls where to upload the files.
  const resourceFileWithPresignedUrls = await getPresignedUrlForResourcesUpload(
    authenticatedUser,
    cloudProjectId,
    resourceFiles
  );

  // Upload the files.
  const results = Array(resourceFileWithPresignedUrls.length);
  let doneCount = 0;
  await PromisePool.withConcurrency(10)
    .for(resourceFileWithPresignedUrls)
    .process(async ({ resourceFile, presignedUrl, index }) => {
      try {
        await refetchCredentialsForProjectAndRetryIfUnauthorized(
          authenticatedUser,
          cloudProjectId,
          () =>
            projectResourcesClient.post(
              addGDevelopResourceJwtTokenToUrl(presignedUrl),
              resourceFile,
              {
                headers: { 'content-type': resourceFile.type },
              }
            )
        );

        const fullUrl = `${
          GDevelopProjectResourcesStorage.baseUrl
        }${presignedUrl}`;
        const urlWithoutSearchParams = fullUrl.substr(0, fullUrl.indexOf('?'));
        results[index] = {
          error: null,
          resourceFile,
          url: urlWithoutSearchParams,
        };
      } catch (error) {
        results[index] = {
          error,
          resourceFile,
          url: null,
        };
      }
      onProgress(++doneCount, resourceFileWithPresignedUrls.length);
    });

  return results;
};

export const listUserCloudProjects = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string
): Promise<Array<CloudProjectWithUserAccessInfo>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await apiClient.get('project', {
    headers: { Authorization: authorizationHeader },
    params: { userId },
  });
  return response.data;
};

export const listOtherUserCloudProjects = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  otherUserId: string
): Promise<Array<CloudProjectWithUserAccessInfo>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await apiClient.get(`user/${otherUserId}/project`, {
    headers: { Authorization: authorizationHeader },
    params: { userId },
  });
  return response.data;
};

export const getCloudProject = async (
  authenticatedUser: AuthenticatedUser,
  cloudProjectId: string
): Promise<?CloudProject> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await apiClient.get(`/project/${cloudProjectId}`, {
    headers: {
      Authorization: authorizationHeader,
    },
    params: { userId },
  });
  return response.data;
};

export const updateCloudProject = async (
  authenticatedUser: AuthenticatedUser,
  cloudProjectId: string,
  attributes: {| name?: string, gameId?: string |}
): Promise<?CloudProject> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const cleanedAttributes = {
    name: attributes.name
      ? attributes.name.slice(0, CLOUD_PROJECT_NAME_MAX_LENGTH)
      : undefined,
    gameId: attributes.gameId,
  };

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await apiClient.patch(
    `/project/${cloudProjectId}`,
    cleanedAttributes,
    {
      headers: {
        Authorization: authorizationHeader,
      },
      params: { userId },
    }
  );
  return response.data;
};

export const deleteCloudProject = async (
  authenticatedUser: AuthenticatedUser,
  cloudProjectId: string
): Promise<?CloudProject> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await apiClient.delete(`/project/${cloudProjectId}`, {
    headers: {
      Authorization: authorizationHeader,
    },
    params: { userId },
  });
  return response.data;
};

const getPresignedUrlForVersionUpload = async (
  authenticatedUser: AuthenticatedUser,
  cloudProjectId: string
): Promise<?string> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await apiClient.post(
    `/project/${cloudProjectId}/action/create-presigned-urls`,
    { resources: ['newProjectVersion'] },
    {
      headers: {
        Authorization: authorizationHeader,
      },
      params: { userId },
    }
  );
  if (!response.data || !response.data[0]) return;
  return response.data[0];
};

const getPresignedUrlForResourcesUpload = async (
  authenticatedUser: AuthenticatedUser,
  cloudProjectId: string,
  resourceFiles: File[]
): Promise<Array<ResourceFileWithUploadPresignedUrl>> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) throw new Error('User is not authenticated.');

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();

  const requestedResources = await Promise.all(
    resourceFiles.map(async resourceFile => ({
      type: 'project-resource',
      filename: resourceFile.name,
      size: resourceFile.size,
      sha512TruncatedTo256: await getFileSha512TruncatedTo256(resourceFile),
    }))
  );

  const response = await apiClient.post(
    `/project/${cloudProjectId}/action/create-presigned-urls`,
    {
      requestedResources,
    },
    {
      headers: {
        Authorization: authorizationHeader,
      },
      params: { userId },
    }
  );
  if (!response.data || !Array.isArray(response.data))
    throw new Error('Response does not contain pre-signed urls for upload.');

  const resourceFileWithPresignedUrls = response.data.map(
    (presignedUrl, index) => ({
      resourceFile: resourceFiles[index],
      presignedUrl,
      index,
    })
  );
  return resourceFileWithPresignedUrls;
};

export const getProjectFileAsZipBlob = async (
  cloudProject: CloudProject,
  versionId?: ?string
): Promise<Blob> => {
  if (!cloudProject.currentVersion) {
    throw new Error('Opening of project without current version not handled');
  }

  const response = await projectResourcesClient.get(
    addGDevelopResourceJwtTokenToUrl(
      `/${cloudProject.id}/versions/${versionId ||
        cloudProject.currentVersion}.zip`
    ),
    { responseType: 'blob' }
  );
  return response.data;
};

function escapeStringForRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
const resourceFilenameRegex = new RegExp(
  `${escapeStringForRegExp(
    GDevelopProjectResourcesStorage.baseUrl
  )}\\/(.*)\\/resources\\/(.*\\/)*([a-zA-Z0-9]+)-([^\\?\\n\\r]+)`
);

export const extractFilenameFromProjectResourceUrl = (url: string): string => {
  if (url.startsWith(GDevelopProjectResourcesStorage.baseUrl)) {
    const matches = resourceFilenameRegex.exec(url);
    if (matches) {
      return matches[4];
    }
  }

  if (url.lastIndexOf('/') !== -1) {
    return url.substring(url.lastIndexOf('/') + 1);
  }
  return url;
};

export const extractProjectUuidFromProjectResourceUrl = (
  url: string
): string | null => {
  if (url.startsWith(GDevelopProjectResourcesStorage.baseUrl)) {
    const matches = resourceFilenameRegex.exec(url);
    if (matches) {
      return matches[1];
    }
  }

  return null;
};
