// @flow
import * as React from 'react';
import {
  createNewEmptyProject,
  createNewProjectFromAIGeneratedProject,
  createNewProjectFromExampleShortHeader,
  createNewProjectFromTutorialTemplate,
  createNewProjectWithDefaultLogin,
  type NewProjectSetup,
  type NewProjectSource,
} from '../ProjectCreation/CreateProjectDialog';
import { type State } from '../MainFrame';
import {
  type StorageProvider,
  type StorageProviderOperations,
  type FileMetadata,
} from '../ProjectsStorage';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { type I18n as I18nType } from '@lingui/core';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { registerGame } from './GDevelopServices/Game';
import {
  useResourceMover,
  type ResourceMover,
} from '../ProjectsStorage/ResourceMover';
import UnsavedChangesContext from '../MainFrame/UnsavedChangesContext';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { t } from '@lingui/macro';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { type EditorTabsState } from '../Mainframe/EditorTabs/EditorTabsHandler';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';

type Props = {|
  beforeCreatingProject: () => void,
  afterCreatingProject: ({|
    project: gdProject,
    editorTabs: EditorTabsState,
    oldProjectId: string,
  |}) => Promise<void>,
  onError: () => void,
  onSuccessOrError: () => void,
  getStorageProviderOperations: (
    storageProvider?: ?StorageProvider
  ) => StorageProviderOperations,
  loadFromProject: (
    project: gdProject,
    fileMetadata: ?FileMetadata
  ) => Promise<State>,
  openFromFileMetadata: (fileMetadata: FileMetadata) => Promise<?State>,
  resourceMover: ResourceMover,
  onProjectSaved: (fileMetadata: ?FileMetadata) => void,
|};

/**
 * Helper for Mainframe to open a dialog when the component is mounted.
 * This corresponds to when a user opens the app on web, with a parameter in the URL.
 */
const useCreateProject = ({
  beforeCreatingProject,
  afterCreatingProject,
  onSuccessOrError,
  onError,
  getStorageProviderOperations,
  loadFromProject,
  openFromFileMetadata,
  resourceMover,
  onProjectSaved,
}: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const unsavedChanges = React.useContext(UnsavedChangesContext);
  const preferences = React.useContext(PreferencesContext);
  const { ensureResourcesAreMoved } = useResourceMover({ resourceMover });
  const { showAlert } = useAlertDialog();
  const { getInAppTutorialShortHeader } = React.useContext(
    InAppTutorialContext
  );

  const initialiseProjectProperties = (
    project: gdProject,
    newProjectSetup: NewProjectSetup
  ) => {
    project.resetProjectUuid();
    project.setVersion('1.0.0');
    project.getAuthorIds().clear();
    project.setAuthor('');
    if (newProjectSetup.templateSlug) {
      project.setTemplateSlug(newProjectSetup.templateSlug);
    }
    if (newProjectSetup.width && newProjectSetup.height) {
      project.setGameResolutionSize(
        newProjectSetup.width,
        newProjectSetup.height
      );
    }
    if (newProjectSetup.orientation)
      project.setOrientation(newProjectSetup.orientation);
    if (newProjectSetup.optimizeForPixelArt) {
      project.setPixelsRounding(true);
      project.setScaleMode('nearest');
    }
    if (newProjectSetup.projectName) {
      project.setName(newProjectSetup.projectName || 'New game');
    }
  };

  const createProject = React.useCallback(
    async (
      newProjectSource: ?NewProjectSource,
      newProjectSetup: NewProjectSetup
    ) => {
      if (!newProjectSource) return; // New project creation aborted.

      try {
        let state: ?State;
        const sourceStorageProvider = newProjectSource.storageProvider;
        const sourceStorageProviderOperations = sourceStorageProvider
          ? getStorageProviderOperations(newProjectSource.storageProvider)
          : null;
        if (newProjectSource.project) {
          state = await loadFromProject(newProjectSource.project, null);
        } else if (newProjectSource.fileMetadata && sourceStorageProvider) {
          state = await openFromFileMetadata(newProjectSource.fileMetadata);
        }

        if (!state) {
          throw new Error(
            'Neither a project nor a file metadata to load was provided for the new project'
          );
        }

        const { currentProject, editorTabs } = state;
        if (!currentProject) {
          throw new Error('The new project could not be opened.');
        }

        const oldProjectId = currentProject.getProjectUuid();
        initialiseProjectProperties(currentProject, newProjectSetup);

        if (authenticatedUser.profile) {
          // if the user is connected, try to register the game to avoid
          // any gdevelop services to ask the user to register the game.
          // (for instance, leaderboards, player authentication, ...)
          try {
            await registerGame(
              authenticatedUser.getAuthorizationHeader,
              authenticatedUser.profile.id,
              {
                gameId: currentProject.getProjectUuid(),
                authorName:
                  currentProject.getAuthor() || 'Unspecified publisher',
                gameName: currentProject.getName() || 'Untitled game',
                templateSlug: currentProject.getTemplateSlug(),
              }
            );
          } catch (error) {
            // Do not prevent the user from opening the game if the registration failed.
            console.error(
              'Unable to register the game to the user profile, the game will not be listed in the user profile.',
              error
            );
          }
        }

        const destinationStorageProviderOperations = getStorageProviderOperations(
          newProjectSetup.storageProvider
        );

        const { onSaveProjectAs } = destinationStorageProviderOperations;

        if (onSaveProjectAs) {
          const { wasSaved, fileMetadata } = await onSaveProjectAs(
            currentProject,
            newProjectSetup.saveAsLocation,
            {
              onStartSaving: () => {
                console.log('Start saving as the new project...');
              },
              onMoveResources: async ({ newFileMetadata }) => {
                if (
                  !sourceStorageProvider ||
                  !sourceStorageProviderOperations ||
                  !newProjectSource.fileMetadata
                ) {
                  console.log(
                    'No storage provider set or no previous FileMetadata (probably creating a blank project) - skipping resources copy.'
                  );
                  return;
                }

                await ensureResourcesAreMoved({
                  project: currentProject,
                  newFileMetadata,
                  newStorageProvider: newProjectSetup.storageProvider,
                  newStorageProviderOperations: destinationStorageProviderOperations,
                  oldFileMetadata: newProjectSource.fileMetadata,
                  oldStorageProvider: sourceStorageProvider,
                  oldStorageProviderOperations: sourceStorageProviderOperations,
                  authenticatedUser,
                });
              },
            }
          );

          if (wasSaved) {
            // setState(state => ({
            //   ...state,
            //   currentFileMetadata: fileMetadata,
            // }));
            onProjectSaved(fileMetadata);
            unsavedChanges.sealUnsavedChanges();
            if (newProjectSetup.storageProvider.internalName === 'LocalFile') {
              preferences.setHasProjectOpened(true);
            }
          }
        }

        // We were able to load and then save the project. We can now close the dialog,
        // open the project editors and check if leaderboards must be replaced.
        await afterCreatingProject({
          project: currentProject,
          editorTabs,
          oldProjectId,
        });
      } catch (rawError) {
        const { getWriteErrorMessage } = getStorageProviderOperations();
        const errorMessage = getWriteErrorMessage
          ? getWriteErrorMessage(rawError)
          : t`An error occurred when opening or saving the project. Try again later or choose another location to save the project to.`;
        showAlert({
          title: t`Unable to create the project`,
          message: errorMessage,
        });

        onError();
      } finally {
        onSuccessOrError();
      }
    },
    [
      authenticatedUser,
      getStorageProviderOperations,
      loadFromProject,
      onError,
      onProjectSaved,
      openFromFileMetadata,
      preferences,
      showAlert,
      afterCreatingProject,
      ensureResourcesAreMoved,
      onSuccessOrError,
      unsavedChanges,
    ]
  );

  const createEmptyProject = React.useCallback(
    async (newProjectSetup: NewProjectSetup) => {
      beforeCreatingProject();
      const newProjectSource = createNewEmptyProject();
      await createProject(newProjectSource, newProjectSetup);
    },
    [beforeCreatingProject, createProject]
  );

  const createProjectFromExample = React.useCallback(
    async (
      exampleShortHeader: ExampleShortHeader,
      newProjectSetup: NewProjectSetup,
      i18n: I18nType
    ) => {
      beforeCreatingProject();
      const newProjectSource = await createNewProjectFromExampleShortHeader({
        i18n,
        exampleShortHeader,
      });
      await createProject(newProjectSource, {
        ...newProjectSetup,
        templateSlug: exampleShortHeader.slug,
      });
    },
    [beforeCreatingProject, createProject]
  );

  const createProjectFromInAppTutorial = React.useCallback(
    async (tutorialId: string, newProjectSetup: NewProjectSetup) => {
      beforeCreatingProject();
      const selectedInAppTutorialShortHeader = getInAppTutorialShortHeader(
        tutorialId
      );
      const templateUrl =
        selectedInAppTutorialShortHeader &&
        selectedInAppTutorialShortHeader.initialTemplateUrl;
      if (!templateUrl) {
        throw new Error(
          `No initial template URL for the in-app tutorial "${tutorialId}"`
        );
      }
      const newProjectSource = await createNewProjectFromTutorialTemplate(
        templateUrl
      );
      await createProject(newProjectSource, newProjectSetup);
    },
    [beforeCreatingProject, createProject, getInAppTutorialShortHeader]
  );

  const createProjectWithLogin = React.useCallback(
    async (newProjectSetup: NewProjectSetup) => {
      beforeCreatingProject();
      const newProjectSource = createNewProjectWithDefaultLogin();
      await createProject(newProjectSource, newProjectSetup);
    },
    [beforeCreatingProject, createProject]
  );

  const createProjectFromAIGeneration = React.useCallback(
    async (projectFileUrl: string, newProjectSetup: NewProjectSetup) => {
      beforeCreatingProject();
      const newProjectSource = createNewProjectFromAIGeneratedProject(
        projectFileUrl
      );
      await createProject(newProjectSource, newProjectSetup);
    },
    [beforeCreatingProject, createProject]
  );

  return {
    createEmptyProject,
    createProjectFromExample,
    createProjectFromInAppTutorial,
    createProjectWithLogin,
    createProjectFromAIGeneration,
  };
};

export default useCreateProject;
