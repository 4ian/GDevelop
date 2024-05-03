// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { type StorageProvider, type FileMetadata } from '../index';
import {
  onOpenWithPicker,
  onOpen,
  getAutoSaveCreationDate,
  onGetAutoSave,
} from './LocalProjectOpener';
import {
  onSaveProject,
  onChooseSaveProjectAsLocation,
  onSaveProjectAs,
  onAutoSaveProject,
  getWriteErrorMessage,
  renderNewProjectSaveAsLocationChooser,
  getProjectLocation,
  isTryingToSaveInForbiddenPath,
} from './LocalProjectWriter';
import {
  type AppArguments,
  POSITIONAL_ARGUMENTS_KEY,
} from '../../Utils/Window';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import Computer from '../../UI/CustomSvgIcons/Computer';
import {
  copyResourceFilePath,
  locateResourceFile,
  openResourceFile,
  removeAllResourcesWithInvalidPath,
  scanForNewResources,
} from './LocalProjectResourcesHandler';
import { allResourceKindsAndMetadata } from '../../ResourcesList/ResourceSource';
import {
  type ShowAlertFunction,
  type ShowConfirmFunction,
} from '../../UI/Alert/AlertContext';
import { setupResourcesWatcher } from './LocalFileResourcesWatcher';

/**
 * Use the Electron APIs to provide access to the native
 * file system (with native save/open dialogs).
 */
export default ({
  internalName: 'LocalFile',
  name: t`Your computer`,
  renderIcon: props => <Computer fontSize={props.size} />,
  getFileMetadataFromAppArguments: (appArguments: AppArguments) => {
    if (!appArguments[POSITIONAL_ARGUMENTS_KEY]) return null;
    if (!appArguments[POSITIONAL_ARGUMENTS_KEY].length) return null;

    return {
      fileIdentifier: appArguments[POSITIONAL_ARGUMENTS_KEY][0],
    };
  },
  getProjectLocation: getProjectLocation,
  renderNewProjectSaveAsLocationChooser: renderNewProjectSaveAsLocationChooser,
  setupResourcesWatcher,
  createOperations: () => ({
    onOpenWithPicker,
    onOpen,
    getAutoSaveCreationDate,
    onSaveProject,
    onChooseSaveProjectAsLocation,
    onSaveProjectAs,
    onAutoSaveProject,
    onGetAutoSave,
    getOpenErrorMessage: (error: Error): MessageDescriptor => {
      return t`Check that the file exists, that this file is a proper game created with GDevelop and that you have the authorization to open it.`;
    },
    getWriteErrorMessage,
    canFileMetadataBeSafelySaved: async (
      fileMetadata: FileMetadata,
      actions: {|
        showAlert: ShowAlertFunction,
        showConfirmation: ShowConfirmFunction,
      |}
    ) => {
      const path = fileMetadata.fileIdentifier;
      if (isTryingToSaveInForbiddenPath(path)) {
        await actions.showAlert({
          title: t`Choose another location`,
          message: t`Your project is saved in the same folder as the application. This folder will be deleted when the application is updated. Please choose another location if you don't want to lose your project.`,
        });
      }

      // We don't block the save, in case the user wants to save anyway.
      return true;
    },
    canFileMetadataBeSafelySavedAs: async (
      fileMetadata: FileMetadata,
      actions: {|
        showAlert: ShowAlertFunction,
        showConfirmation: ShowConfirmFunction,
      |}
    ) => {
      const path = fileMetadata.fileIdentifier;
      if (isTryingToSaveInForbiddenPath(path)) {
        await actions.showAlert({
          title: t`Choose another location`,
          message: t`Your project is saved in the same folder as the application. This folder will be deleted when the application is updated. Please choose another location if you don't want to lose your project.`,
        });

        // We block the save as we don't want new projects to be saved there.
        return false;
      }

      return true;
    },
  }),
  createResourceOperations: () => ({
    project,
    resource,
    i18n,
    updateInterface,
    cleanUserSelectionOfResources,
    informUser,
  }) => [
    {
      label: i18n._(t`Locate file`),
      click: () => locateResourceFile({ project, resource }),
    },
    {
      label: i18n._(t`Open file`),
      click: () => openResourceFile({ project, resource }),
    },
    {
      label: i18n._(t`Copy file path`),
      click: () => {
        copyResourceFilePath({ project, resource });
        informUser({
          message: <Trans>Resource file path copied to clipboard</Trans>,
        });
      },
    },
    { type: 'separator' },
    {
      label: i18n._(t`Scan in the project folder for...`),
      submenu: allResourceKindsAndMetadata.map(
        ({ displayName, fileExtensions, createNewResource }) => ({
          label: i18n._(displayName),
          click: async () => {
            await scanForNewResources({
              project,
              extensions: fileExtensions,
              createResource: createNewResource,
            });
            updateInterface();
          },
        })
      ),
    },
    {
      label: i18n._(t`Remove resources with invalid path`),
      click: () => {
        removeAllResourcesWithInvalidPath({ project });
        // Remove user selection in case the user selected a resource
        // that was just removed.
        cleanUserSelectionOfResources();
        // Force update of the resources list as otherwise it could render
        // resources that were just deleted.
        updateInterface();
      },
    },
  ],
}: StorageProvider);
