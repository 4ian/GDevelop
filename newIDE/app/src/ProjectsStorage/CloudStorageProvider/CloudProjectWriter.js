// @flow
import * as React from 'react';
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
import CloudSaveAsDialog from './CloudSaveAsDialog';

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
): Promise<boolean> => {
  if (!authenticatedUser.authenticated) return false;
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
    if (!newVersion) {
      throw new Error("Couldn't save project following property update.");
    }

    return true;
  } catch (error) {
    // TODO: Determine if a feedback should be given to user so that they can try again if necessary.
    console.warn(
      'An error occurred while changing cloud project name. Ignoring.',
      error
    );
    return false;
  }
};

const createCloudProjectAndInitCommit = async (
  project: gdProject,
  authenticatedUser: AuthenticatedUser,
  name: string
): Promise<?string> => {
  try {
    const cloudProject = await createCloudProject(authenticatedUser, {
      name,
    });
    if (!cloudProject) return;
    await getCredentialsForProject(authenticatedUser, cloudProject.id);
    const newVersion = await zipProjectAndCommitVersion({
      authenticatedUser,
      project,
      cloudProjectId: cloudProject.id,
    });
    if (!newVersion) return;
    return cloudProject.id;
  } catch (error) {
    console.error('An error occurred while creating a cloud project', error);
    return;
  }
};

export const generateOnSaveProjectAs = (
  authenticatedUser: AuthenticatedUser,
  setDialog: (() => React.Node) => void,
  closeDialog: () => void
) => async (
  project: gdProject,
  fileMetadata: ?FileMetadata,
  options?: { isSameStorageProvider?: boolean }
) => {
  if (!authenticatedUser.authenticated) {
    return { wasSaved: false, fileMetadata };
  }
  let name;

  const isBlankProject = !fileMetadata;
  const shouldDuplicateCurrentCloudProject =
    fileMetadata && options && options.isSameStorageProvider;
  if (!isBlankProject && shouldDuplicateCurrentCloudProject) {
    name = await new Promise(resolve => {
      setDialog(() => (
        <CloudSaveAsDialog
          onCancel={() => {
            closeDialog();
            resolve(null);
          }}
          nameSuggestion={project.getName()}
          onSave={(newName: string) => {
            resolve(newName);
          }}
        />
      ));
    });
    if (!name) return { wasSaved: false, fileMetadata };
  } else {
    name = project.getName();
  }

  const cloudProjectId = await createCloudProjectAndInitCommit(
    project,
    authenticatedUser,
    name
  );

  if (!cloudProjectId) return { wasSaved: false, fileMetadata };

  closeDialog();
  return {
    wasSaved: true,
    fileMetadata: { fileIdentifier: cloudProjectId },
  };
};
