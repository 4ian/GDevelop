// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { type StorageProvider, type FileMetadata } from '../index';
import {
  generateOnChangeProjectProperty,
  generateOnSaveProject,
  generateOnChooseSaveProjectAsLocation,
  generateOnSaveProjectAs,
  getWriteErrorMessage,
  renderNewProjectSaveAsLocationChooser,
  getProjectLocation,
  generateOnAutoSaveProject,
} from './CloudProjectWriter';
import {
  type AppArguments,
  POSITIONAL_ARGUMENTS_KEY,
} from '../../Utils/Window';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import {
  generateOnOpen,
  generateOnEnsureCanAccessResources,
  generateGetAutoSaveCreationDate,
  generateOnGetAutoSave,
} from './CloudProjectOpener';
import Cloud from '../../UI/CustomSvgIcons/Cloud';
import { generateGetResourceActions } from './CloudProjectResourcesHandler';
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

const isURL = (filename: string) => {
  return (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('ftp://') ||
    filename.startsWith('blob:') ||
    filename.startsWith('data:')
  );
};

export default ({
  internalName: 'Cloud',
  name: t`GDevelop Cloud`,
  renderIcon: props => <Cloud fontSize={props.size} />,
  hiddenInOpenDialog: true,
  needUserAuthentication: true,
  getFileMetadataFromAppArguments: (appArguments: AppArguments) => {
    if (!appArguments[POSITIONAL_ARGUMENTS_KEY]) return null;
    if (!appArguments[POSITIONAL_ARGUMENTS_KEY].length) return null;

    const fileIdentifier = appArguments[POSITIONAL_ARGUMENTS_KEY][0];
    if (isURL(fileIdentifier)) return null;

    return {
      fileIdentifier,
    };
  },
  getProjectLocation: getProjectLocation,
  renderNewProjectSaveAsLocationChooser: renderNewProjectSaveAsLocationChooser,
  createOperations: ({ setDialog, closeDialog, authenticatedUser }) => ({
    onOpen: generateOnOpen(authenticatedUser),
    onEnsureCanAccessResources: generateOnEnsureCanAccessResources(
      authenticatedUser
    ),
    onSaveProject: generateOnSaveProject(authenticatedUser),
    onChooseSaveProjectAsLocation: generateOnChooseSaveProjectAsLocation({
      authenticatedUser,
      setDialog,
      closeDialog,
    }),
    onSaveProjectAs: generateOnSaveProjectAs(
      authenticatedUser,
      setDialog,
      closeDialog
    ),
    onAutoSaveProject: generateOnAutoSaveProject(authenticatedUser),
    getAutoSaveCreationDate: generateGetAutoSaveCreationDate(authenticatedUser),
    onGetAutoSave: generateOnGetAutoSave(authenticatedUser),
    onChangeProjectProperty: generateOnChangeProjectProperty(authenticatedUser),
    getOpenErrorMessage: (error: Error): MessageDescriptor => {
      return t`An error occurred when opening the project. Check that your internet connection is working and that your browser allows the use of cookies.`;
    },
    getWriteErrorMessage,
    canFileMetadataBeSafelySaved: async (
      fileMetadata: FileMetadata,
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
      const { currentVersion, committedAt } = cloudProject;
      if (
        openedProjectVersion &&
        currentVersion && // should always be defined.
        committedAt && // should always be defined.
        currentVersion !== openedProjectVersion
      ) {
        let lastUsernameWhoModifiedProject = null;
        const committedAtDate = new Date(committedAt);
        const formattedDate = format(committedAtDate, 'dd-MM-yyyy');
        const formattedTime = format(committedAtDate, 'HH:mm:ss');
        const lastCommittedBy = cloudProject.lastCommittedBy;
        if (lastCommittedBy) {
          const lastUser = await getUserPublicProfile(lastCommittedBy);
          if (lastUser) {
            lastUsernameWhoModifiedProject = lastUser.username;
          }
        }
        const answer = await actions.showConfirmation({
          title: t`Project was modified`,
          message: lastUsernameWhoModifiedProject
            ? t`This project was modified by ${lastUsernameWhoModifiedProject} on the ${formattedDate} at ${formattedTime}. Do you want to overwrite their changes?`
            : t`This project was modified by someone else on the ${formattedDate} at ${formattedTime}. Do you want to overwrite their changes?`,
          level: 'warning',
          confirmButtonLabel: t`Overwrite`,
          makeDismissButtonPrimary: true,
        });

        return answer;
      }

      return true;
    },
  }),
  createResourceOperations: generateGetResourceActions,
}: StorageProvider);
