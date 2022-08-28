// @flow
import axios from 'axios';
import {
  GDevelopProjectApi,
  GDevelopProjectResourcesStorage,
} from './ApiConfigs';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import PromisePool from '@supercharge/promise-pool';
import { getFileSha512TruncatedTo256 } from '../FileHasher';

export const CLOUD_PROJECT_NAME_MAX_LENGTH = 50;
export const PROJECT_RESOURCE_MAX_SIZE_IN_BYTES = 15 * 1024 * 1024;

const projectResourcesClient = axios.create({
  baseURL: GDevelopProjectResourcesStorage.baseUrl,
  withCredentials: true,
});

const apiClient = axios.create({
  baseURL: GDevelopProjectApi.baseUrl,
});

const projectResourcesCredentialsApiClient = axios.create({
  baseURL: GDevelopProjectApi.baseUrl,
  withCredentials: true, // Necessary to save cookie returned by the server.
});

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
  createdAt: string,
  currentVersion?: string,
  deletedAt?: string,
|};

export type CloudProjectWithUserAccessInfo = {|
  ...CloudProject,
  lastModifiedAt: string,
|};

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
      headers: { Authorization: authorizationHeader },
      params: { userId },
      validateStatus: status => true,
    }
  );
  return response.status >= 200 && response.status < 400;
};

export const clearCloudProjectCredentials = async (): Promise<void> => {
  await projectResourcesCredentialsApiClient.get('/action/clear-authorization');
};

export const createCloudProject = async (
  authenticatedUser: AuthenticatedUser,
  cloudProjectCreationPayload: { name: string }
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

export const commitVersion = async (
  authenticatedUser: AuthenticatedUser,
  cloudProjectId: string,
  zippedProject: any
): Promise<?string> => {
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
      projectResourcesClient.post(presignedUrl, zippedProject, {
        headers: { 'content-type': 'application/zip' },
      })
  );
  // Inform backend a new version has been uploaded.
  const response = await apiClient.post(
    `/project/${cloudProjectId}/action/commit`,
    { newVersion },
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
            projectResourcesClient.post(presignedUrl, resourceFile, {
              headers: { 'content-type': resourceFile.type },
            })
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
  attributes: { name: string }
): Promise<?CloudProject> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const cleanedAttributes = {
    name: attributes.name.slice(0, CLOUD_PROJECT_NAME_MAX_LENGTH),
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
  cloudProject: CloudProject
): Promise<Blob> => {
  if (!cloudProject.currentVersion) {
    throw new Error('Opening of project without current version not handled');
  }
  const response = await projectResourcesClient.get(
    `/${cloudProject.id}/versions/${cloudProject.currentVersion}.zip`,
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

export const extractProjectUuidFromProjetResourceUrl = (
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
