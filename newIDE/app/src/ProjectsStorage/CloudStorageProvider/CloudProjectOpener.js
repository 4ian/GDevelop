// @flow

import {
  getCredentialsForProject,
  getProjectFileAsJson,
} from '../../Utils/GDevelopServices/Project';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

import { type FileMetadata } from '../index';

const onOpenWithPicker = () => {};

export const onOpen = async (
  fileMetadata: FileMetadata,
  options: { authenticatedUser: AuthenticatedUser }
): Promise<{|
  content: Object,
|}> => {
  const cloudProject = JSON.parse(fileMetadata.fileIdentifier);

  await getCredentialsForProject(options.authenticatedUser, cloudProject.id);
  const projectFileContent = getProjectFileAsJson(cloudProject);
  return {
    content: projectFileContent,
  };
};

const hasAutoSave = () => {};
const onGetAutoSave = () => {};
