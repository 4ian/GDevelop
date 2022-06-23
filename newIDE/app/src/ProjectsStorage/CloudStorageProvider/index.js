// @flow
import { t } from '@lingui/macro';
import { type StorageProvider } from '../index';
import { generateOnSaveProject, generateOnSaveProjectAs } from './CloudProjectWriter';
import {
  type AppArguments,
  POSITIONAL_ARGUMENTS_KEY,
} from '../../Utils/Window';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

export default ({
  internalName: 'Cloud',
  name: t`GDevelop cloud storage`,
  getFileMetadataFromAppArguments: (appArguments: AppArguments) => {
    if (!appArguments[POSITIONAL_ARGUMENTS_KEY]) return null;
    if (!appArguments[POSITIONAL_ARGUMENTS_KEY].length) return null;

    return {
      fileIdentifier: appArguments[POSITIONAL_ARGUMENTS_KEY][0],
    };
  },
  createOperations: ({ setDialog, closeDialog, authenticatedUser }) => ({
    // onOpenWithPicker,
    // onOpen,
    // hasAutoSave,
    onSaveProject: generateOnSaveProject(authenticatedUser),
    onSaveProjectAs: generateOnSaveProjectAs(authenticatedUser),
    // onAutoSaveProject,
    // onGetAutoSave,
    getOpenErrorMessage: (error: Error): MessageDescriptor => {
      return t`Check that the file exists, that this file is a proper game created with GDevelop and that you have the authorizations to open it.`;
    },
  }),
}: StorageProvider);
