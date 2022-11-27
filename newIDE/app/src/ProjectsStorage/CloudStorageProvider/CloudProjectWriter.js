// @flow
import * as React from 'react';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { type FileMetadata, type SaveAsLocation } from '..';
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

export const generateOnChooseSaveProjectAsLocation = ({
  authenticatedUser,
  setDialog,
  closeDialog,
}: {|
  authenticatedUser: AuthenticatedUser,
  setDialog: (() => React.Node) => void,
  closeDialog: () => void,
|}) => async ({
  project,
  fileMetadata,
}: {|
  project: gdProject,
  fileMetadata: ?FileMetadata,
|}): Promise<{|
  saveAsLocation: ?SaveAsLocation,
|}> => {
  if (!authenticatedUser.authenticated) {
    return { saveAsLocation: null };
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

  if (!name) return { saveAsLocation: null }; // Save was cancelled.

  return {
    saveAsLocation: {
      name,
    },
  };
};

export const generateOnSaveProjectAs = (
  authenticatedUser: AuthenticatedUser,
  setDialog: (() => React.Node) => void,
  closeDialog: () => void
) => async (
  project: gdProject,
  saveAsLocation: ?SaveAsLocation,
  options: {|
    onStartSaving: () => void,
    onMoveResources: ({|
      newFileMetadata: FileMetadata,
    |}) => Promise<void>,
  |}
) => {
  if (!saveAsLocation)
    throw new Error('A location was not chosen before saving as.');
  const { name } = saveAsLocation;
  if (!name) throw new Error('A name was not chosen before saving as.');
  if (!authenticatedUser.authenticated) {
    return { wasSaved: false, fileMetadata: null };
  }
  options.onStartSaving();

  try {
    // Create a new cloud project.
    const cloudProject = await createCloudProject(authenticatedUser, {
      name,
    });
    if (!cloudProject)
      throw new Error('No cloud project was returned from creation api call.');

    const fileMetadata = {
      fileIdentifier: cloudProject.id,
    };

    // Move the resources to the new project.
    await options.onMoveResources({ newFileMetadata: fileMetadata });

    // Commit the changes to the newly created cloud project.
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
      fileMetadata,
    };
  } catch (error) {
    console.error('An error occurred while creating a cloud project', error);
    throw error;
  }
};

export const onRenderNewProjectSaveAsLocationChooser = ({
  projectName,
  saveAsLocation,
  setSaveAsLocation,
}: {|
  projectName: string,
  saveAsLocation: ?SaveAsLocation,
  setSaveAsLocation: (?SaveAsLocation) => void,
|}) => {
  if (!saveAsLocation || saveAsLocation.name !== projectName) {
    setSaveAsLocation({
      name: projectName,
    });
  }

  return null;
};
