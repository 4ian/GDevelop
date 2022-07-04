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

const reAuthenticateAndRetryIfFailed = async <T>(
  authenticatedUser: AuthenticatedUser,
  cloudProjectId: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  try {
    const response = await apiCall();
    return response;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      await getCredentialsForProject(authenticatedUser, cloudProjectId);
      const response = await apiCall();
      return response;
    }
    throw error;
  }
};

const generateUUID = (a): string => {
  return a
    ? // eslint-disable-next-line
      (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
    : // $FlowFixMe
      ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, generateUUID);
};

export const getCredentialsForProject = async (
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
  // generate uuid
  const uuid = generateUUID();
  // fetch pre signed url TODO
  // upload zipped project
  await reAuthenticateAndRetryIfFailed(authenticatedUser, cloudProjectId, () =>
    projectResourcesClient.post(
      `${
        GDevelopProjectResourcesStorage.baseUrl
      }/${cloudProjectId}/versions/${uuid}.zip`,
      zippedProject,
      {
        headers: { 'content-type': 'application/zip' },
        withCredentials: true,
      }
    )
  );
  // inform backend new version uploaded
  const response = await axios.post(
    `${GDevelopProjectApi.baseUrl}/project/${cloudProjectId}/action/commit`,
    { newVersion: uuid },
    {
      headers: {
        Authorization: authorizationHeader,
      },
      params: { userId },
    }
  );
  return response.data;
};

export const listUserCloudProject = async (
  authenticatedUser: AuthenticatedUser
): Promise<?Array<CloudProject>> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const { uid: userId } = firebaseUser;
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
