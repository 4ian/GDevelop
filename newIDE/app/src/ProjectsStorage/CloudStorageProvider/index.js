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
} from './CloudProjectWriter';
import {
  type AppArguments,
  POSITIONAL_ARGUMENTS_KEY,
} from '../../Utils/Window';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import {
  generateOnOpen,
  generateOnEnsureCanAccessResources,
} from './CloudProjectOpener';
import Cloud from '../../UI/CustomSvgIcons/Cloud';

export default ({
  internalName: 'Cloud',
  name: t`GDevelop Cloud`,
  renderIcon: props => <Cloud fontSize={props.size} />,
  hiddenInOpenDialog: true,
  needUserAuthentication: true,
  getFileMetadataFromAppArguments: (appArguments: AppArguments) => {
    if (!appArguments[POSITIONAL_ARGUMENTS_KEY]) return null;
    if (!appArguments[POSITIONAL_ARGUMENTS_KEY].length) return null;

    return {
      fileIdentifier: appArguments[POSITIONAL_ARGUMENTS_KEY][0],
    };
  },
  createOperations: ({ setDialog, closeDialog, authenticatedUser }) => ({
    onOpen: generateOnOpen(authenticatedUser),
    onEnsureCanAccessResources: generateOnEnsureCanAccessResources(
      authenticatedUser
    ),
    onSaveProject: generateOnSaveProject(authenticatedUser),
    onChooseSaveProjectAsLocation: generateOnChooseSaveProjectAsLocation(
      authenticatedUser,
      setDialog,
      closeDialog
    ),
    onSaveProjectAs: generateOnSaveProjectAs(
      authenticatedUser,
      setDialog,
      closeDialog
    ),
    onChangeProjectProperty: generateOnChangeProjectProperty(authenticatedUser),
    getOpenErrorMessage: (error: Error): MessageDescriptor => {
      return t`An error occurred when opening the project. Check that your internet connection is working and that your browser allows the use of cookies.`;
    },
    getWriteErrorMessage,
  }),
}: StorageProvider);
