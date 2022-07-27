// @flow
import axios from 'axios';
import {
  GDevelopProjectApi,
  GDevelopProjectResourcesStorage,
} from './ApiConfigs';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

export const CLOUD_PROJECT_NAME_MAX_LENGTH = 50;

const projectResourcesClient = axios.create({
  withCredentials: true,
});

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

const refetchCredentialsForProjectAndRetryIfFailed = async <T>(
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
  const response = await axios.get(
    `${GDevelopProjectApi.baseUrl}/project/${cloudProjectId}/action/authorize`,
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
      validateStatus: status => true,
      withCredentials: true, // Necessary to save cookie returned by the server.
    }
  );
  return response.status >= 200 && response.status < 400;
};

export const clearCloudProjectCredentials = async (): Promise<void> => {
  await axios.get(`${GDevelopProjectApi.baseUrl}/action/clear-authorization`, {
    withCredentials: true, // Necessary to save cookie returned by the server.
  });
};

export const createCloudProject = async (
  authenticatedUser: AuthenticatedUser,
  cloudProjectCreationPayload: { name: string }
): Promise<?CloudProject> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return null;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${GDevelopProjectApi.baseUrl}/project`,
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
  const newVersion = getVersionIdFromPath(presignedUrl);
  // Upload zipped project.
  await refetchCredentialsForProjectAndRetryIfFailed(
    authenticatedUser,
    cloudProjectId,
    () =>
      projectResourcesClient.post(
        `${GDevelopProjectResourcesStorage.baseUrl}${presignedUrl}`,
        zippedProject,
        {
          headers: { 'content-type': 'application/zip' },
          withCredentials: true,
        }
      )
  );
  // Inform backend a new version has been uploaded.
  const response = await axios.post(
    `${GDevelopProjectApi.baseUrl}/project/${cloudProjectId}/action/commit`,
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

export const listUserCloudProjects = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string
): Promise<Array<CloudProjectWithUserAccessInfo>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.get(`${GDevelopProjectApi.baseUrl}/project`, {
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
  const response = await axios.get(
    `${GDevelopProjectApi.baseUrl}/project/${cloudProjectId}`,
    {
      headers: {
        Authorization: authorizationHeader,
      },
      params: { userId },
    }
  );
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
  const response = await axios.patch(
    `${GDevelopProjectApi.baseUrl}/project/${cloudProjectId}`,
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
  const response = await axios.delete(
    `${GDevelopProjectApi.baseUrl}/project/${cloudProjectId}`,
    {
      headers: {
        Authorization: authorizationHeader,
      },
      params: { userId },
    }
  );
  return response.data;
};

export const getPresignedUrlForVersionUpload = async (
  authenticatedUser: AuthenticatedUser,
  cloudProjectId: string
): Promise<string> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser)
    throw new Error(
      'Presigned url is could not be created, user not authenticated.'
    );

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${
      GDevelopProjectApi.baseUrl
    }/project/${cloudProjectId}/action/create-presigned-urls`,
    { resources: ['newProjectVersion'] },
    {
      headers: {
        Authorization: authorizationHeader,
      },
      params: { userId },
    }
  );
  if (!response.data || !response.data[0])
    throw new Error('Presigned url is empty');
  return response.data[0];
};

export const getProjectFileAsZipBlob = async (
  cloudProject: CloudProject
): Promise<Blob> => {
  if (!cloudProject.currentVersion) {
    throw new Error('Opening of project without current version not handled');
  }
  const response = await projectResourcesClient.get(
    `${GDevelopProjectResourcesStorage.baseUrl}/${cloudProject.id}/versions/${
      cloudProject.currentVersion
    }.zip`,
    { responseType: 'blob' }
  );
  return response.data;
};
