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
  console.log(projectJson);
  const textReader = new zipJs.TextReader(projectJson);

  return new Promise((resolve, reject) => {
    zipJs.createWriter(new zipJs.BlobWriter('application/zip'), zipWriter => {
      zipWriter.add('game.json', textReader, () => {
        zipWriter.close(blob => {
          console.log('blob');
          console.log(blob);
          resolve(blob);
        });
      });
    });
  });
};

export const generateOnSaveProject = (
  authenticatedUser: AuthenticatedUser
) => async (project: gdProject, fileMetadata: FileMetadata) => {
  if (!authenticatedUser) return { wasSaved: false, fileMetadata };
  const archive = await zipProject(project);
  const newVersion = await commitVersion(
    authenticatedUser,
    fileMetadata.fileIdentifier,
    archive
  );
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
  if (!fileMetadata) {
    const cloudProject = await createCloudProject(authenticatedUser, {
      name: project.getName(),
    });
    if (!cloudProject) return { wasSaved: false, fileMetadata };
    await getCredentialsForProject(authenticatedUser, cloudProject.id);
    return {
      wasSaved: true,
      fileMetadata: { fileIdentifier: cloudProject.id },
    };
  }

  return { wasSaved: false, fileMetadata };
};
