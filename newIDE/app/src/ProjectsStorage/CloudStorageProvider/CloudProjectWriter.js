// @flow
import * as React from 'react';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { type FileMetadata } from '..';
import {
  commitVersion,
  createCloudProject,
  getCredentialsForCloudProject,
  updateCloudProject,
} from '../../Utils/GDevelopServices/Project';
import type { $AxiosError } from 'axios';
import type { MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { serializeToJSON } from '../../Utils/Serializer';
import { initializeZipJs } from '../../Utils/Zip.js';
import CloudSaveAsDialog from './CloudSaveAsDialog';
import { t } from '@lingui/macro';

const zipProject = async (project: gdProject) => {
  const zipJs: ZipJs = await initializeZipJs();
  const projectJson = serializeToJSON(project);
  const textReader = new zipJs.TextReader(projectJson);

  return new Promise((resolve, reject) => {
    zipJs.createWriter(
      new zipJs.BlobWriter('application/zip'),
      zipWriter => {
        zipWriter.add('game.json', textReader, () => {
          zipWriter.close(blob => {
            resolve(blob);
          });
        });
      },
      error => {
        console.error('An error occurred when zipping project', error);
        reject(error);
      }
    );
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

export const getWriteErrorMessage = (
  error: Error | $AxiosError<any>
): MessageDescriptor => {
  if (
    error.response &&
    error.response.data &&
    error.response.data.code === 'project-creation/too-many-projects'
  ) {
    return t`You've reached the limit of cloud projects you can have. Delete some existing cloud projects of yours before trying again.`;
  }
  return t`An error occurred when saving the project, please verify your internet connection or try again later.`;
};

export const generateOnChooseSaveProjectAsLocation = (
  authenticatedUser: AuthenticatedUser,
  setDialog: (() => React.Node) => void,
  closeDialog: () => void
) => async (
  project: gdProject,
  fileMetadata: ?FileMetadata
): Promise<{|
  fileMetadata: ?FileMetadata,
|}> => {
  if (!authenticatedUser.authenticated) {
    return { fileMetadata: null };
  }

  const name = await new Promise(resolve => {
    setDialog(() => (
      <CloudSaveAsDialog
        onCancel={() => {
          closeDialog();
          resolve(null);
        }}
        nameSuggestion={project.getName()}
        onSave={(newName: string) => {
          closeDialog();
          resolve(newName);
        }}
      />
    ));
  });

  if (!name) return { fileMetadata: null }; // Save was cancelled.

  const cloudProject = await createCloudProject(authenticatedUser, {
    name,
  });
  if (!cloudProject)
    throw new Error('No cloud project was returned from creation api call.');

  return {
    fileMetadata: {
      fileIdentifier: cloudProject.id,
    },
  };
};

export const generateOnSaveProjectAs = (
  authenticatedUser: AuthenticatedUser,
  setDialog: (() => React.Node) => void,
  closeDialog: () => void
) => async (
  project: gdProject,
  fileMetadata: ?FileMetadata,
  options: {|
    onStartSaving: () => void,
    onMoveResources: () => Promise<void>,
  |}
) => {
  if (!fileMetadata)
    throw new Error('A location was not chosen before saving as.');
  if (!authenticatedUser.authenticated) {
    return { wasSaved: false };
  }
  if (options && options.onStartSaving) options.onStartSaving();

  // From now, save was confirmed so we create a new project. Any failure should
  // be reported as an error.
  try {
    await options.onMoveResources();

    const cloudProjectId = fileMetadata.fileIdentifier;
    await getCredentialsForCloudProject(authenticatedUser, cloudProjectId);
    const newVersion = await zipProjectAndCommitVersion({
      authenticatedUser,
      project,
      cloudProjectId,
    });
    if (!newVersion)
      throw new Error('No version id was returned from committing api call.');

    return {
      wasSaved: true,
    };
  } catch (error) {
    console.error('An error occurred while creating a cloud project', error);
    throw error;
  }
};
