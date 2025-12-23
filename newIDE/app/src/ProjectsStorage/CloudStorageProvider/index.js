// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { type StorageProvider } from '../index';
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
import { cloudStorageProviderInternalName } from './CloudStoageProviderInternalName';

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
  internalName: cloudStorageProviderInternalName,
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
  }),
  createResourceOperations: generateGetResourceActions,
}: StorageProvider);
