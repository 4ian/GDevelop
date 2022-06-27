// @flow

import {
  getCloudProject,
  getCredentialsForProject,
  getProjectFileAsJson,
} from '../../Utils/GDevelopServices/Project';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

import { type FileMetadata } from '../index';

export const onOpenWithPicker = () => {};

export const generateOnOpen = (authenticatedUser: AuthenticatedUser) => async (
  fileMetadata: FileMetadata
): Promise<{|
  content: Object,
|}> => {
  const cloudProjectId = fileMetadata.fileIdentifier;

  const cloudProject = await getCloudProject(authenticatedUser, cloudProjectId);
  if (!cloudProject) throw new Error("Cloud project couldn't be fetched.");

  await getCredentialsForProject(authenticatedUser, cloudProjectId);
  const projectFileContent = getProjectFileAsJson(cloudProject);
  return {
    content: projectFileContent,
  };
};

export const hasAutoSave = () => {};
export const onGetAutoSave = () => {};
