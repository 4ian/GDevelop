// @flow

import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { type FileMetadata } from '..';
import {
  commitVersion,
  createCloudProject,
  getCredentialsForProject,
} from '../../Utils/GDevelopServices/Project';
import { serializeToJSON } from '../../Utils/Serializer';
import { initializeZipJs } from '../../Utils/Zip.js';

const zipProject = async (project: gdProject) => {
  const zipJs: ZipJs = await initializeZipJs();
  const projectJson = serializeToJSON(project);
  const textReader = new zipJs.TextReader(projectJson);

  return new Promise((resolve, reject) => {
    zipJs.createWriter(new zipJs.BlobWriter('application/zip'), zipWriter => {
      zipWriter.add('game.json', textReader, () => {
        zipWriter.close(blob => {
          resolve(blob);
        });
      });
    });
  });
};

const zipProjectAndCommitVersion = async ({
  authenticatedUser,
  project,
  cloudProjectId,
}: {
  authenticatedUser: AuthenticatedUser,
  project: gdProject,
  cloudProjectId: string,
}): Promise<?string> => {
  const archive = await zipProject(project);
  const newVersion = await commitVersion(
    authenticatedUser,
    cloudProjectId,
    archive
  );
  return newVersion;
};

export const generateOnSaveProject = (
  authenticatedUser: AuthenticatedUser
) => async (project: gdProject, fileMetadata: FileMetadata) => {
  if (!authenticatedUser) return { wasSaved: false, fileMetadata };
  const newVersion = await zipProjectAndCommitVersion({
    authenticatedUser,
    project,
    cloudProjectId: fileMetadata.fileIdentifier,
  });
  if (!newVersion) return { wasSaved: false, fileMetadata };
  return {
    wasSaved: true,
    fileMetadata,
  };
};

export const generateOnSaveProjectAs = (
  authenticatedUser: AuthenticatedUser
) => async (project: gdProject, fileMetadata: ?FileMetadata) => {
  if (!authenticatedUser) return { wasSaved: false, fileMetadata };
  const cloudProject = await createCloudProject(authenticatedUser, {
    name: project.getName(),
  });
  if (!cloudProject) return { wasSaved: false, fileMetadata };
  await getCredentialsForProject(authenticatedUser, cloudProject.id);
  const newVersion = await zipProjectAndCommitVersion({
    authenticatedUser,
    project,
    cloudProjectId: cloudProject.id,
  });
  if (!newVersion) return { wasSaved: false, fileMetadata };

  return {
    wasSaved: true,
    fileMetadata: { fileIdentifier: cloudProject.id },
  };
};
