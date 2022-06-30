// @flow

import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { type FileMetadata } from '..';
import {
  commitVersion,
  createCloudProject,
  getCredentialsForProject,
  updateCloudProject,
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

export const generateOnChangeProjectProperty = (
  authenticatedUser: AuthenticatedUser
) => async (
  project: gdProject,
  fileMetadata: FileMetadata,
  properties: { name: string }
) => {
  if (!authenticatedUser) return;
  try {
    await updateCloudProject(
      authenticatedUser,
      fileMetadata.fileIdentifier,
      properties
    );
    const newVersion = await zipProjectAndCommitVersion({
      authenticatedUser,
      project,
      cloudProjectId: fileMetadata.fileIdentifier,
    });
    if (!newVersion)
      throw new Error("Couldn't save project following property update.");
  } catch (error) {
    // TODO: Determine if a feedback should be given to user so that they can try again if necessary.
    console.warn(
      'An error occurred while changing cloud project name. Ignoring.',
      error
    );
  }
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
