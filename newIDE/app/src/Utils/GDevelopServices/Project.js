// @flow
import axios from 'axios';
import {
  GDevelopProjectApi,
  GDevelopProjectResourcesStorage,
} from './ApiConfigs';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

type CloudProject = {|
  id: string,
  name: string,
  createdAt: string,
  currentVersion?: string,
  deletedAt?: string,
|};

const projectResourcesClient = axios.create({
  withCredentials: true,
});

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
    }
  );
  return response.status >= 200 && response.status < 400;
};

export const createCloudProject = async (
  authenticatedUser: AuthenticatedUser,
  cloudProjectCreationPayload: { name: string }
) => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return false;

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

const commitVersion = async (
  authenticatedUser: AuthenticatedUser,
  cloudProject: CloudProject,
  zippedProject: any
) => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return false;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${GDevelopProjectApi.baseUrl}/project`,
    zippedProject,
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
      validateStatus: status => true,
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

export const getProjectFileAsJson = async (
  cloudProject: CloudProject
): Promise<?Array<CloudProject>> => {
  if (!cloudProject.currentVersion) {
    throw new Error('Opening of project without current version not handled');
  }
  const response = await projectResourcesClient.get(
    `${GDevelopProjectResourcesStorage.baseUrl}/${cloudProject.id}/versions/${
      cloudProject.currentVersion
    }`
  );
  return response.data;
};
