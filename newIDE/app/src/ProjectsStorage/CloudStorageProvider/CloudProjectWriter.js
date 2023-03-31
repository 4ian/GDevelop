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
import CloudSaveAsDialog from './CloudSaveAsDialog';
import { t } from '@lingui/macro';
import {
  createZipWithSingleTextFile,
  unzipFirstEntryOfBlob,
} from '../../Utils/Zip.js/Utils';

const zipProject = async (project: gdProject): Promise<[Blob, string]> => {
  const projectJson = serializeToJSON(project);
  const zippedProject = await createZipWithSingleTextFile(
    projectJson,
    'game.json'
  );
  return [zippedProject, projectJson];
};

const checkZipContent = async (
  zip: Blob,
  projectJson: string
): Promise<boolean> => {
  try {
    const unzippedProjectJson = await unzipFirstEntryOfBlob(zip);
    return (
      unzippedProjectJson === projectJson && !!JSON.parse(unzippedProjectJson)
    );
  } catch (error) {
    console.error('An error occurred when checking zipped project.', error);
    return false;
  }
};

const zipProjectAndCommitVersion = async ({
  authenticatedUser,
  project,
  cloudProjectId,
  options,
}: {|
  authenticatedUser: AuthenticatedUser,
  project: gdProject,
  cloudProjectId: string,
  options?: {| previousVersion: string |},
|}): Promise<?string> => {
  const [zippedProject, projectJson] = await zipProject(project);
  const archiveIsSane = await checkZipContent(zippedProject, projectJson);
  if (!archiveIsSane) {
    throw new Error('Project compression failed before saving the project.');
  }
  const newVersion = await commitVersion({
    authenticatedUser,
    cloudProjectId,
    zippedProject,
    previousVersion: options ? options.previousVersion : null,
  });
  return newVersion;
};

export const generateOnSaveProject = (
  authenticatedUser: AuthenticatedUser
) => async (
  project: gdProject,
  fileMetadata: FileMetadata,
  options?: {| previousVersion: string |}
) => {
  if (!fileMetadata.gameId) {
    console.info('Game id was never set, updating the cloud project.');
    try {
      await updateCloudProject(authenticatedUser, fileMetadata.fileIdentifier, {
        gameId: project.getProjectUuid(),
      });
    } catch (error) {
      console.error('Could not update cloud project with gameId', error);
      // Do not throw, as this is not a blocking error.
    }
  }
  const newFileMetadata = {
    ...fileMetadata,
    gameId: project.getProjectUuid(),
  };
  const newVersion = await zipProjectAndCommitVersion({
    authenticatedUser,
    project,
    cloudProjectId: newFileMetadata.fileIdentifier,
    options,
  });
  if (!newVersion) return { wasSaved: false, fileMetadata: newFileMetadata };
  return {
    wasSaved: true,
    fileMetadata: newFileMetadata,
  };
};

export const generateOnChangeProjectProperty = (
  authenticatedUser: AuthenticatedUser
) => async (
  project: gdProject,
  fileMetadata: FileMetadata,
  properties: {| name?: string, gameId?: string |}
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
  const { name, gameId } = saveAsLocation;
  if (!name) throw new Error('A name was not chosen before saving as.');
  if (!authenticatedUser.authenticated) {
    return { wasSaved: false, fileMetadata: null };
  }
  options.onStartSaving();

  try {
    // Create a new cloud project.
    const cloudProject = await createCloudProject(authenticatedUser, {
      name,
      gameId,
    });
    if (!cloudProject)
      throw new Error('No cloud project was returned from creation api call.');

    const fileMetadata = {
      fileIdentifier: cloudProject.id,
      gameId,
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
  newProjectsDefaultFolder?: string,
|}) => {
  if (!saveAsLocation || saveAsLocation.name !== projectName) {
    setSaveAsLocation({
      name: projectName,
    });
  }

  return null;
};
