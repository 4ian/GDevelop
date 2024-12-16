// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import {
  createNewEmptyProject,
  createNewProjectFromAIGeneratedProject,
  createNewProjectFromExampleShortHeader,
  createNewProjectFromPrivateGameTemplate,
  createNewProjectFromTutorialTemplate,
  createNewProjectFromCourseChapterTemplate,
  type NewProjectSource,
} from '../ProjectCreation/CreateProject';
import { type NewProjectSetup } from '../ProjectCreation/NewProjectSetupDialog';
import { type State } from '../MainFrame';
import {
  type StorageProvider,
  type StorageProviderOperations,
  type FileMetadata,
} from '../ProjectsStorage';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { registerGame } from './GDevelopServices/Game';
import { type MoveAllProjectResourcesOptionsWithoutProgress } from '../ProjectsStorage/ResourceMover';
import UnsavedChangesContext from '../MainFrame/UnsavedChangesContext';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { type EditorTabsState } from '../MainFrame/EditorTabs/EditorTabsHandler';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import {
  getAuthorizationTokenForPrivateGameTemplates,
  type PrivateGameTemplateListingData,
} from './GDevelopServices/Shop';
import {
  createPrivateGameTemplateUrl,
  type CourseChapter,
} from './GDevelopServices/Asset';
import { getDefaultRegisterGameProperties } from './UseGameAndBuildsManager';
import { TutorialContext } from '../Tutorial/TutorialContext';

type Props = {|
  beforeCreatingProject: () => void,
  afterCreatingProject: ({|
    project: gdProject,
    editorTabs: EditorTabsState,
    oldProjectId: string,
    options: { openAllScenes: boolean, openQuickCustomizationDialog: boolean },
  |}) => Promise<void>,
  onError: () => void,
  onSuccessOrError: () => void,
  getStorageProviderOperations: (
    storageProvider?: ?StorageProvider
  ) => StorageProviderOperations,
  getStorageProvider: () => StorageProvider,
  loadFromProject: (
    project: gdProject,
    fileMetadata: ?FileMetadata
  ) => Promise<State>,
  openFromFileMetadata: (fileMetadata: FileMetadata) => Promise<?State>,
  onProjectSaved: (fileMetadata: ?FileMetadata) => void,
  ensureResourcesAreMoved: (
    options: MoveAllProjectResourcesOptionsWithoutProgress
  ) => Promise<void>,
  onGameRegistered: () => Promise<void>,
|};

/**
 * Helper for Mainframe to create a new project.
 */
const useCreateProject = ({
  beforeCreatingProject,
  afterCreatingProject,
  onSuccessOrError,
  onError,
  getStorageProviderOperations,
  getStorageProvider,
  loadFromProject,
  openFromFileMetadata,
  onProjectSaved,
  ensureResourcesAreMoved,
  onGameRegistered,
}: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const profile = authenticatedUser.profile;
  const unsavedChanges = React.useContext(UnsavedChangesContext);
  const preferences = React.useContext(PreferencesContext);
  const { showAlert } = useAlertDialog();
  const { getInAppTutorialShortHeader } = React.useContext(
    InAppTutorialContext
  );
  const { tutorials } = React.useContext(TutorialContext);

  const initialiseProjectProperties = (
    project: gdProject,
    newProjectSetup: NewProjectSetup
  ) => {
    project.resetProjectUuid();
    project.setVersion('1.0.0');
    project.getAuthorIds().clear();
    project.setAuthor('');
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
      newProjectSetup: NewProjectSetup,
      options?: { openAllScenes: boolean }
    ) => {
      try {
        if (!newProjectSource) return; // New project creation aborted.

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
        if (newProjectSource.templateSlug) {
          currentProject.setTemplateSlug(newProjectSource.templateSlug);
        }

        if (
          authenticatedUser.profile &&
          !newProjectSetup.openQuickCustomizationDialog
        ) {
          // If the user is connected, try to register the game to avoid
          // any gdevelop services to ask the user to register the game.
          // (for instance, leaderboards, player authentication, ...)
          //
          // Skip this if quick customization is requested, as this will be done later
          // at publishing time.
          try {
            await registerGame(
              authenticatedUser.getAuthorizationHeader,
              authenticatedUser.profile.id,
              getDefaultRegisterGameProperties({
                projectId: currentProject.getProjectUuid(),
                projectName: currentProject.getName(),
                projectAuthor: currentProject.getAuthor(),
                // Project is saved if choosing cloud or local storage provider.
                savedStatus:
                  newProjectSetup.storageProvider.internalName ===
                    'LocalFile' ||
                  newProjectSetup.storageProvider.internalName === 'Cloud'
                    ? 'saved'
                    : 'draft',
              })
            );
            await onGameRegistered();
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
        const newStorageProvider = getStorageProvider();
        const storageProviderInternalName = newStorageProvider.internalName;

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
                console.log('Start moving resources to the new project...');
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

          if (!wasSaved) {
            return; // Saving was cancelled.
          }

          if (!fileMetadata) {
            return;
          }

          onProjectSaved(fileMetadata);
          unsavedChanges.sealUnsavedChanges({ setCheckpointTime: true });
          if (newProjectSetup.storageProvider.internalName === 'LocalFile') {
            preferences.setHasProjectOpened(true);
          }

          // Save was done on a new file/location, so save it in the
          // recent projects and in the state.
          const fileMetadataAndStorageProviderName = {
            fileMetadata,
            storageProviderName: storageProviderInternalName,
          };
          preferences.insertRecentProjectFile(
            fileMetadataAndStorageProviderName
          );
        }

        // We were able to load and then save the project. We can now close the dialog,
        // open the project editors and check if leaderboards must be replaced.
        await afterCreatingProject({
          project: currentProject,
          editorTabs,
          oldProjectId,
          options: {
            openAllScenes: !!options && options.openAllScenes,
            openQuickCustomizationDialog: !!newProjectSetup.openQuickCustomizationDialog,
          },
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
      getStorageProvider,
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
      onGameRegistered,
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
      await createProject(newProjectSource, newProjectSetup);
    },
    [beforeCreatingProject, createProject]
  );

  const createProjectFromPrivateGameTemplate = React.useCallback(
    async (
      privateGameTemplateListingData: PrivateGameTemplateListingData,
      newProjectSetup: NewProjectSetup
    ) => {
      beforeCreatingProject();
      if (!profile) {
        throw new Error(
          'Unable to create the project with the game template because no profile was found.'
        );
      }

      const token = await getAuthorizationTokenForPrivateGameTemplates(
        authenticatedUser.getAuthorizationHeader,
        {
          userId: profile.id,
        }
      );

      const privateGameTemplateUrl = await createPrivateGameTemplateUrl(
        privateGameTemplateListingData,
        token
      );

      const newProjectSource = await createNewProjectFromPrivateGameTemplate(
        privateGameTemplateUrl,
        privateGameTemplateListingData.id
      );
      await createProject(newProjectSource, newProjectSetup);
    },
    [beforeCreatingProject, createProject, profile, authenticatedUser]
  );

  const createProjectFromInAppTutorial = React.useCallback(
    async (tutorialId: string, newProjectSetup: NewProjectSetup) => {
      beforeCreatingProject();
      const selectedInAppTutorialShortHeader = getInAppTutorialShortHeader(
        tutorialId
      );
      if (!selectedInAppTutorialShortHeader) {
        throw new Error(`No in app tutorial found for id "${tutorialId}"`);
      }
      const templateUrl = selectedInAppTutorialShortHeader.initialTemplateUrl;
      if (!templateUrl) {
        throw new Error(
          `No initial template URL for the in-app tutorial "${tutorialId}"`
        );
      }
      const newProjectSource = await createNewProjectFromTutorialTemplate(
        templateUrl,
        selectedInAppTutorialShortHeader.id
      );
      await createProject(newProjectSource, newProjectSetup, {
        openAllScenes: true,
      });
    },
    [beforeCreatingProject, createProject, getInAppTutorialShortHeader]
  );

  const createProjectFromTutorial = React.useCallback(
    async (tutorialId: string, newProjectSetup: NewProjectSetup) => {
      beforeCreatingProject();
      if (!tutorials) {
        throw new Error(`Tutorials could not be loaded`);
      }
      const selectedTutorial = tutorials.find(
        tutorial => tutorial.id === tutorialId
      );
      if (!selectedTutorial) {
        throw new Error(`No tutorial found for id "${tutorialId}"`);
      }
      const { templateUrl } = selectedTutorial;
      if (!templateUrl) {
        throw new Error(`No template URL for the tutorial "${tutorialId}"`);
      }
      const newProjectSource = await createNewProjectFromTutorialTemplate(
        templateUrl,
        tutorialId
      );
      await createProject(newProjectSource, newProjectSetup, {
        openAllScenes: true,
      });
    },
    [beforeCreatingProject, createProject, tutorials]
  );

  const createProjectFromCourseChapter = React.useCallback(
    async (courseChapter: CourseChapter, newProjectSetup: NewProjectSetup) => {
      if (courseChapter.isLocked) return;
      beforeCreatingProject();
      const { templateUrl } = courseChapter;
      if (!templateUrl) {
        throw new Error(
          `No template URL for the course chapter "${courseChapter.id}"`
        );
      }
      const newProjectSource = await createNewProjectFromCourseChapterTemplate(
        templateUrl,
        courseChapter.id
      );
      await createProject(newProjectSource, newProjectSetup, {
        openAllScenes: true,
      });
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
    createProjectFromPrivateGameTemplate,
    createProjectFromInAppTutorial,
    createProjectFromTutorial,
    createProjectFromCourseChapter,
    createProjectFromAIGeneration,
  };
};

export default useCreateProject;
