// @flow
import * as React from 'react';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import {
  type FileMetadata,
  type SaveAsLocation,
  type SaveAsOptions,
  type SaveProjectOptions,
} from '..';
import {
  CLOUD_PROJECT_NAME_MAX_LENGTH,
  commitVersion,
  createCloudProject,
  getCredentialsForCloudProject,
  getPresignedUrlForVersionUpload,
  updateCloudProject,
} from '../../Utils/GDevelopServices/Project';
import type { $AxiosError } from 'axios';
import type { MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { serializeToJSON } from '../../Utils/Serializer';
import { serializeToJSONInBackground } from '../../Utils/BackgroundSerializer';
import { t } from '@lingui/macro';
import {
  createZipWithSingleTextFile,
  unzipFirstEntryOfBlob,
} from '../../Utils/Zip.js/Utils';
import ProjectCache from '../../Utils/ProjectCache';
import { getProjectCache } from './CloudProjectOpener';
import { retryIfFailed } from '../../Utils/RetryIfFailed';
import { extractGDevelopApiErrorStatusAndCode } from '../../Utils/GDevelopServices/Errors';
import SaveAsOptionsDialog from '../SaveAsOptionsDialog';
import {
  type ShowAlertFunction,
  type ShowConfirmFunction,
} from '../../UI/Alert/AlertContext';
import {
  getCloudProject,
  type CloudProjectWithUserAccessInfo,
} from '../../Utils/GDevelopServices/Project';
import { format } from 'date-fns';
import { getUserPublicProfile } from '../../Utils/GDevelopServices/User';

const zipProject = async ({
  project,
  useBackgroundSerializer,
}: {
  project: gdProject,
  useBackgroundSerializer: boolean,
}): Promise<{ zippedProject: Blob, projectJson: string }> => {
  const startTime = Date.now();

  let projectJson: string;
  if (useBackgroundSerializer) {
    projectJson = await serializeToJSONInBackground(project);
  } else {
    projectJson = serializeToJSON(project);
  }

  const serializeToJSONEndTime = Date.now();

  const zippedProject = await createZipWithSingleTextFile(
    projectJson,
    'game.json'
  );

  console.log(
    `[CloudProjectWriter] Zipping done in ${Date.now() -
      startTime}ms (including ${serializeToJSONEndTime - startTime}ms for ${
      useBackgroundSerializer ? 'background' : 'main'
    } thread serialization).`
  );
  return { zippedProject, projectJson };
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

const zipAndPrepareProjectVersionForCommit = async ({
  authenticatedUser,
  project,
  cloudProjectId,
  options,
}: {|
  authenticatedUser: AuthenticatedUser,
  project: gdProject,
  cloudProjectId: string,
  options?: SaveProjectOptions,
|}): Promise<{|
  presignedUrl: string,
  zippedProject: Blob,
|}> => {
  const [presignedUrl, { zippedProject, projectJson }] = await Promise.all([
    getPresignedUrlForVersionUpload(authenticatedUser, cloudProjectId),
    zipProject({
      project,
      useBackgroundSerializer: !!options && !!options.useBackgroundSerializer,
    }),
  ]);

  const archiveIsSane = await checkZipContent(zippedProject, projectJson);
  if (!archiveIsSane) {
    throw new Error('Project compression failed before saving the project.');
  }
  if (!presignedUrl) {
    throw new Error(
      'No presigned url was returned from getting presigned url for version upload api call.'
    );
  }

  return { presignedUrl, zippedProject };
};

const commitProjectVersion = async ({
  authenticatedUser,
  presignedUrl,
  zippedProject,
  cloudProjectId,
  options,
}: {|
  authenticatedUser: AuthenticatedUser,
  presignedUrl: string,
  zippedProject: Blob,
  cloudProjectId: string,
  options?: SaveProjectOptions,
|}): Promise<?string> => {
  const newVersion = await retryIfFailed({ times: 2 }, () =>
    commitVersion({
      authenticatedUser,
      cloudProjectId,
      zippedProject,
      presignedUrl,
      previousVersion: options ? options.previousVersion : null,
      restoredFromVersionId: options ? options.restoredFromVersionId : null,
    })
  );
  return newVersion;
};

export const generateOnSaveProject = (
  authenticatedUser: AuthenticatedUser
) => async (
  project: gdProject,
  fileMetadata: FileMetadata,
  options?: SaveProjectOptions,
  actions: {|
    showAlert: ShowAlertFunction,
    showConfirmation: ShowConfirmFunction,
  |}
) => {
  const cloudProjectId = fileMetadata.fileIdentifier;
  const gameId = project.getProjectUuid();
  const now = Date.now();

  if (!fileMetadata.gameId) {
    // This is a rare case so we don't do it in parallel with the rest.
    console.info('Game id was never set, updating the cloud project.');
    try {
      await updateCloudProject(authenticatedUser, cloudProjectId, {
        gameId,
      });
    } catch (error) {
      console.error('Could not update cloud project with gameId', error);
      // Do not throw, as this is not a blocking error.
    }
  }

  // Do as much as possible in parallel:
  const [canBeSafelySaved, { presignedUrl, zippedProject }] = await Promise.all(
    [
      // Check (with a network call) if the project can be safely saved (not modified by someone else).
      canFileMetadataBeSafelySaved(
        authenticatedUser,
        fileMetadata,
        options,
        actions
      ),
      // At the same time, serialize & zip the project and also get (with a network call) a presigned url to upload the project version.
      zipAndPrepareProjectVersionForCommit({
        authenticatedUser,
        project,
        cloudProjectId,
        options,
      }),
    ]
  );
  if (!canBeSafelySaved) {
    // Abort saving (nothing was "committed" or persisted, the signed urls were not used).
    return { wasSaved: false, fileMetadata: fileMetadata };
  }

  const newVersion = await commitProjectVersion({
    authenticatedUser,
    presignedUrl,
    zippedProject,
    cloudProjectId,
    options,
  });

  const newFileMetadata: FileMetadata = {
    ...fileMetadata,
    gameId,
    // lastModifiedDate is set here even though it will be set by backend services.
    // Regarding the list of cloud projects in the build section, it should not have
    // an impact since the 2 dates are not used for the same purpose.
    // But it's better to have an up-to-date current file metadata (used by the version
    // history to know when to refresh the most recent version).
    lastModifiedDate: now,
  };
  if (!newVersion) return { wasSaved: false, fileMetadata: newFileMetadata };

  // Save the version being modified in the file metadata, so that it can be
  // used when saving to compare with the last version of the project, and
  // raise a conflict warning if different.
  newFileMetadata.version = newVersion;
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
): Promise<null | {| version: string, lastModifiedDate: number |}> => {
  if (!authenticatedUser.authenticated) return null;
  try {
    const [, { presignedUrl, zippedProject }] = await Promise.all([
      updateCloudProject(
        authenticatedUser,
        fileMetadata.fileIdentifier,
        properties
      ),
      zipAndPrepareProjectVersionForCommit({
        authenticatedUser,
        project,
        cloudProjectId: fileMetadata.fileIdentifier,
      }),
    ]);
    const newVersion = await commitProjectVersion({
      authenticatedUser,
      presignedUrl,
      zippedProject,
      cloudProjectId: fileMetadata.fileIdentifier,
    });
    if (!newVersion) {
      throw new Error("Couldn't save project following property update.");
    }

    return { version: newVersion, lastModifiedDate: Date.now() };
  } catch (error) {
    // TODO: Determine if a feedback should be given to user so that they can try again if necessary.
    console.warn(
      'An error occurred while changing cloud project name. Ignoring.',
      error
    );
    return null;
  }
};

export const getWriteErrorMessage = (
  error: Error | $AxiosError<any>
): MessageDescriptor => {
  const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(error);
  if (
    extractedStatusAndCode &&
    extractedStatusAndCode.code === 'project-creation/too-many-projects'
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
  displayOptionToGenerateNewProjectUuid,
}: {|
  project: gdProject,
  fileMetadata: ?FileMetadata,
  displayOptionToGenerateNewProjectUuid: boolean,
|}): Promise<{|
  saveAsLocation: ?SaveAsLocation,
  saveAsOptions: ?SaveAsOptions,
|}> => {
  if (!authenticatedUser.authenticated) {
    return { saveAsLocation: null, saveAsOptions: null };
  }

  const options = await new Promise(resolve => {
    setDialog(() => (
      <SaveAsOptionsDialog
        onCancel={() => {
          closeDialog();
          resolve(null);
        }}
        nameMaxLength={CLOUD_PROJECT_NAME_MAX_LENGTH}
        nameSuggestion={
          fileMetadata ? `${project.getName()} - Copy` : project.getName()
        }
        displayOptionToGenerateNewProjectUuid={
          displayOptionToGenerateNewProjectUuid
        }
        onSave={options => {
          closeDialog();
          resolve(options);
        }}
      />
    ));
  });

  if (!options) return { saveAsLocation: null, saveAsOptions: null }; // Save was cancelled.

  return {
    saveAsLocation: {
      name: options.name,
    },
    saveAsOptions: {
      generateNewProjectUuid: options.generateNewProjectUuid,
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

  const gameId = project.getProjectUuid();

  try {
    // Create a new cloud project.
    const cloudProject = await createCloudProject(authenticatedUser, {
      name,
      gameId,
    });
    if (!cloudProject)
      throw new Error('No cloud project was returned from creation api call.');
    const cloudProjectId = cloudProject.id;

    const fileMetadata: FileMetadata = {
      fileIdentifier: cloudProjectId,
      gameId,
    };

    // Move the resources to the new project.
    await options.onMoveResources({ newFileMetadata: fileMetadata });

    // Commit the changes to the newly created cloud project.
    await getCredentialsForCloudProject(authenticatedUser, cloudProjectId);
    const {
      presignedUrl,
      zippedProject,
    } = await zipAndPrepareProjectVersionForCommit({
      authenticatedUser,
      project,
      cloudProjectId,
    });
    const newVersion = await commitProjectVersion({
      authenticatedUser,
      presignedUrl,
      zippedProject,
      cloudProjectId,
    });
    if (!newVersion)
      throw new Error('No version id was returned from committing api call.');

    // Save the version being modified in the file metadata, so that it can be
    // used when saving to compare with the last version of the project, and
    // raise a conflict warning if different.
    fileMetadata.version = newVersion;

    return {
      wasSaved: true,
      fileMetadata,
    };
  } catch (error) {
    console.error('An error occurred while creating a cloud project', error);
    throw error;
  }
};

export const getProjectLocation = ({
  projectName,
  saveAsLocation,
  newProjectsDefaultFolder,
}: {|
  projectName: string,
  saveAsLocation: ?SaveAsLocation,
  newProjectsDefaultFolder?: string,
|}): SaveAsLocation => {
  return {
    name: projectName,
  };
};

export const renderNewProjectSaveAsLocationChooser = ({
  projectName,
  saveAsLocation,
  setSaveAsLocation,
  newProjectsDefaultFolder,
}: {|
  projectName: string,
  saveAsLocation: ?SaveAsLocation,
  setSaveAsLocation: (?SaveAsLocation) => void,
  newProjectsDefaultFolder?: string,
|}) => {
  if (!saveAsLocation || saveAsLocation.name !== projectName) {
    setSaveAsLocation(
      getProjectLocation({
        projectName,
        saveAsLocation,
        newProjectsDefaultFolder,
      })
    );
  }
  return null;
};

export const generateOnAutoSaveProject = (
  authenticatedUser: AuthenticatedUser
) =>
  ProjectCache.isAvailable()
    ? async (project: gdProject, fileMetadata: FileMetadata): Promise<void> => {
        const { profile } = authenticatedUser;
        if (!profile) return;
        const cloudProjectId = fileMetadata.fileIdentifier;
        const projectCache = getProjectCache();
        projectCache.put(
          {
            userId: profile.id,
            cloudProjectId,
          },
          project
        );
      }
    : undefined;

const canFileMetadataBeSafelySaved = async (
  authenticatedUser: AuthenticatedUser,
  fileMetadata: FileMetadata,
  options: ?SaveProjectOptions,
  actions: {|
    showAlert: ShowAlertFunction,
    showConfirmation: ShowConfirmFunction,
  |}
) => {
  // If the project is saved on the cloud, first fetch it.
  // If the version of the project opened is different than the last version of the cloud project,
  // it means that the project was modified by someone else. In this case, we should warn
  // the user and ask them if they want to overwrite the changes.
  const cloudProjectId = fileMetadata.fileIdentifier;
  const openedProjectVersion = fileMetadata.version;
  const cloudProject: ?CloudProjectWithUserAccessInfo = await getCloudProject(
    authenticatedUser,
    cloudProjectId
  );
  if (!cloudProject) {
    await actions.showAlert({
      title: t`Unable to save the project`,
      message: t`The project could not be saved. Please try again later.`,
    });
    return false;
  }

  const shouldSkipNewVersionWarning = options && options.skipNewVersionWarning;
  const { currentVersion, committedAt } = cloudProject;
  if (
    openedProjectVersion &&
    currentVersion && // should always be defined.
    committedAt && // should always be defined.
    currentVersion !== openedProjectVersion &&
    !shouldSkipNewVersionWarning
  ) {
    let currentUserWasLastToModifyProject = false;
    let lastUsernameWhoModifiedProject = null;
    const committedAtDate = new Date(committedAt);
    const formattedDate = format(committedAtDate, 'dd-MM-yyyy');
    const formattedTime = format(committedAtDate, 'HH:mm:ss');
    const lastCommittedBy = cloudProject.lastCommittedBy;
    if (lastCommittedBy) {
      if (
        authenticatedUser.profile &&
        lastCommittedBy === authenticatedUser.profile.id
      ) {
        currentUserWasLastToModifyProject = true;
      } else {
        const lastUser = await getUserPublicProfile(lastCommittedBy);
        if (lastUser) {
          lastUsernameWhoModifiedProject = lastUser.username;
        }
      }
    }
    const answer = await actions.showConfirmation({
      title: t`Project was modified`,
      message: currentUserWasLastToModifyProject
        ? t`You modified this project on the ${formattedDate} at ${formattedTime}. Do you want to overwrite your changes?`
        : lastUsernameWhoModifiedProject
        ? t`This project was modified by ${lastUsernameWhoModifiedProject} on the ${formattedDate} at ${formattedTime}. Do you want to overwrite their changes?`
        : t`This project was modified by someone else on the ${formattedDate} at ${formattedTime}. Do you want to overwrite their changes?`,
      level: 'warning',
      confirmButtonLabel: t`Overwrite`,
      makeDismissButtonPrimary: true,
    });

    return answer;
  }

  return true;
};
