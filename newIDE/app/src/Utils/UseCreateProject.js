// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import {
  copyProjectTemplateFilesToLocalProjectFolder,
  createNewEmptyProject,
  createNewProjectFromExampleShortHeader,
  createNewProjectFromPrivateGameTemplate,
  createNewProjectFromTutorialTemplate,
  createNewProjectFromCourseChapterTemplate,
  ensureProjectHasDefaultScene,
  initializeLocalProjectGitRepository,
  type ProjectTemplateFilesSource,
  type NewProjectSource,
} from '../ProjectCreation/CreateProject';
import {
  type NewProjectSetup,
  type ExampleProjectSetup,
} from '../ProjectCreation/NewProjectSetupDialog';
import { sendNewGameCreated } from './Analytics/EventSender';
import { type MessageDescriptor } from './i18n/MessageDescriptor.flow';
import { type State } from '../MainFrame/MainFrameState';
import {
  type StorageProvider,
  type StorageProviderOperations,
  type FileMetadata,
} from '../ProjectsStorage';
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

export type CreateProjectResult = {|
  createdProject: gdProject | null,
|};

const optionalLocalProjectSetupStepTimeoutMs = 10000;

export const getProjectCreationErrorDetails = (rawError: any): string => {
  const details: Array<string> = [];
  const seen = new Set();
  let error = rawError;
  while (error !== undefined && error !== null && !seen.has(error)) {
    if (typeof error === 'object') seen.add(error);
    if (typeof error === 'string') {
      details.push(error);
      break;
    }
    const name =
      typeof error.name === 'string' && error.name ? error.name : 'Error';
    const code =
      typeof error.code === 'string' && error.code ? ` [${error.code}]` : '';
    let message =
      typeof error.message === 'string' && error.message ? error.message : '';
    if (!message) {
      try {
        message = JSON.stringify(error);
      } catch (serializationError) {
        message = String(error);
      }
    }
    details.push(`${name}${code}${message ? `: ${message}` : ''}`);
    if (!error || typeof error !== 'object' || !error.cause) break;
    error = error.cause;
  }
  return details.length
    ? details.join('\nCaused by: ')
    : 'Unknown project creation error.';
};

const runOptionalLocalProjectSetupStep = async (
  description: string,
  setupStep: () => Promise<void>
): Promise<void> => {
  let timeoutId: ?TimeoutID = null;
  try {
    await Promise.race([
      setupStep(),
      new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`${description} timed out.`));
        }, optionalLocalProjectSetupStepTimeoutMs);
      }),
    ]);
  } catch (error) {
    console.warn(`Unable to ${description}:`, error);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const startOptionalLocalProjectSetup = ({
  projectFilePath,
  templateFilesSource,
}: {|
  projectFilePath: string,
  templateFilesSource?: ?ProjectTemplateFilesSource,
|}): void => {
  (async () => {
    await runOptionalLocalProjectSetupStep(
      'copy project template files to the new local project',
      () =>
        copyProjectTemplateFilesToLocalProjectFolder({
          projectFilePath,
          templateFilesSource,
        })
    );
    await runOptionalLocalProjectSetupStep(
      'initialize Git for the new local project',
      () =>
        initializeLocalProjectGitRepository({
          projectFilePath,
        })
    );
  })();
};

type Props = {|
  beforeCreatingProject: () => void,
  afterCreatingProject: ({|
    project: gdProject,
    editorTabs: EditorTabsState,
    oldProjectId: string,
    fileMetadata: ?FileMetadata,
    options: {
      openAllScenes: boolean,
      openQuickCustomizationDialog: boolean,
      forceOpenAskAiEditor: boolean,
    },
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
  openFromFileMetadata: (
    fileMetadata: FileMetadata,
    options?: {|
      openingMessage?: ?MessageDescriptor,
      ignoreAutoSave?: boolean,
      suppressOpenErrorAlert?: boolean,
      doNotTrackAsProjectOpened?: boolean,
    |}
  ) => Promise<?State>,
  onProjectSaved: (fileMetadata: ?FileMetadata) => void,
  ensureProjectExtensionsLoaded: () => Promise<void>,
  ensureResourcesAreMoved: (
    options: MoveAllProjectResourcesOptionsWithoutProgress
  ) => Promise<void>,
  onGameRegistered: () => Promise<void>,
|};

/**
 * Helper for Mainframe to create a new project.
 */
export type UseCreateProjectReturnType = {
  createEmptyProject: (
    newProjectSetup: NewProjectSetup
  ) => Promise<CreateProjectResult>,
  createProjectFromCourseChapter: ({
    courseChapter: CourseChapter,
    newProjectSetup: NewProjectSetup,
    templateId?: string,
  }) => Promise<CreateProjectResult>,
  createProjectFromExample: (
    exampleProjectSetup: ExampleProjectSetup
  ) => Promise<CreateProjectResult>,
  createProjectFromInAppTutorial: (
    tutorialId: string,
    newProjectSetup: NewProjectSetup
  ) => Promise<CreateProjectResult>,
  createProjectFromPrivateGameTemplate: (
    privateGameTemplateListingData: PrivateGameTemplateListingData,
    newProjectSetup: NewProjectSetup
  ) => Promise<CreateProjectResult>,
  createProjectFromTutorial: (
    tutorialId: string,
    newProjectSetup: NewProjectSetup
  ) => Promise<CreateProjectResult>,
};
const useCreateProject = ({
  beforeCreatingProject,
  afterCreatingProject,
  onSuccessOrError,
  onError,
  getStorageProviderOperations,
  loadFromProject,
  openFromFileMetadata,
  onProjectSaved,
  ensureProjectExtensionsLoaded,
  ensureResourcesAreMoved,
  onGameRegistered,
}: Props): UseCreateProjectReturnType => {
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
    // Assume all projects created from examples/templates are new projects
    // and should use current defaults, regardless of the example's gdVersion.
    project.setUseDeprecatedZeroAsDefaultStringVariable(false);
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
    ): Promise<CreateProjectResult> => {
      try {
        if (!newProjectSource) return { createdProject: null }; // New project creation aborted.

        let state: ?State;
        const sourceStorageProvider = newProjectSource.storageProvider;
        const sourceStorageProviderOperations = sourceStorageProvider
          ? getStorageProviderOperations(newProjectSource.storageProvider)
          : null;
        if (newProjectSource.project) {
          state = await loadFromProject(newProjectSource.project, null);
        } else if (newProjectSource.fileMetadata && sourceStorageProvider) {
          state = await openFromFileMetadata(newProjectSource.fileMetadata, {
            // This "open" is only loading the template/example that this new
            // project is based on - it must not be reported as the user
            // re-opening an existing project.
            doNotTrackAsProjectOpened: true,
          });
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
        // The initial save must already contain the default scene. Creating it
        // later while opening the editor leaves the multi-file project without
        // scene.settings, layout and events files until a manual save.
        ensureProjectHasDefaultScene(currentProject);

        // Now that the project has its final UUID (assigned by
        // initialiseProjectProperties), report its creation along with that UUID,
        // so the new game can be tied to its later "project-opened" events.
        sendNewGameCreated({
          ...newProjectSource.analyticsMetadata,
          projectUuid: currentProject.getProjectUuid(),
        });

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
              // $FlowFixMe[incompatible-type]
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

        // Loading a project starts the two-pass generation of its local
        // extensions. The initial save also generates source catalogs from
        // registered behavior metadata, so it must not run while that metadata
        // is still being replaced between the two passes.
        await ensureProjectExtensionsLoaded();

        const destinationStorageProviderOperations = getStorageProviderOperations(
          newProjectSetup.storageProvider
        );
        const storageProviderInternalName =
          newProjectSetup.storageProvider.internalName;

        const { onSaveProjectAs } = destinationStorageProviderOperations;

        let updatedFileMetadata: ?FileMetadata = state.currentFileMetadata;
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
                } else {
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
                }

                if (
                  newProjectSetup.storageProvider.internalName === 'LocalFile'
                ) {
                  console.log('Project template files will be copied later.');
                }

                // Resource importing can take long enough for a newer local
                // extension generation pass to be queued. This callback is the
                // final asynchronous step before the storage provider serializes
                // the project, so wait again at the actual serialization
                // boundary.
                await ensureProjectExtensionsLoaded();
              },
            }
          );

          if (!wasSaved) {
            return { createdProject: null }; // Saving was cancelled.
          }

          if (!fileMetadata) {
            return { createdProject: null };
          }

          if (newProjectSetup.storageProvider.internalName === 'LocalFile') {
            startOptionalLocalProjectSetup({
              projectFilePath: fileMetadata.fileIdentifier,
              templateFilesSource: newProjectSource.templateFilesSource,
            });
          }

          updatedFileMetadata = fileMetadata;
          onProjectSaved(fileMetadata);
          unsavedChanges.sealUnsavedChanges();
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
          fileMetadata: updatedFileMetadata,
          options: {
            openAllScenes: !!options && options.openAllScenes,
            openQuickCustomizationDialog: !!newProjectSetup.openQuickCustomizationDialog,
            forceOpenAskAiEditor: !!newProjectSetup.forceOpenAskAiEditor,
          },
        });

        return { createdProject: currentProject };
      } catch (rawError) {
        console.error('Unable to create the project:', rawError);
        const { getWriteErrorMessage } = getStorageProviderOperations();
        const errorMessage = getWriteErrorMessage
          ? getWriteErrorMessage(rawError)
          : t`An error occurred when opening or saving the project. Try again later or choose another location to save the project to.`;
        showAlert({
          title: t`Unable to create the project`,
          message: errorMessage,
          details: getProjectCreationErrorDetails(rawError),
        });

        onError();
        return { createdProject: null };
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
      ensureProjectExtensionsLoaded,
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

  const createProjectAfterPreparation = React.useCallback(
    async ({
      prepareNewProjectSource,
      newProjectSetup,
      options,
    }: {|
      prepareNewProjectSource: () => Promise<?NewProjectSource>,
      newProjectSetup: NewProjectSetup,
      options?: { openAllScenes: boolean },
    |}): Promise<CreateProjectResult> => {
      beforeCreatingProject();
      let didStartProjectCreation = false;
      try {
        const newProjectSource = await prepareNewProjectSource();
        didStartProjectCreation = true;
        return await createProject(newProjectSource, newProjectSetup, options);
      } catch (error) {
        if (didStartProjectCreation) throw error;

        console.error('Unable to prepare the new project:', error);
        showAlert({
          title: t`Unable to create the project`,
          message: t`An error occurred when creating the project. Try again later.`,
          details: getProjectCreationErrorDetails(error),
        });
        onError();
        return { createdProject: null };
      } finally {
        if (!didStartProjectCreation) onSuccessOrError();
      }
    },
    [beforeCreatingProject, createProject, onError, onSuccessOrError, showAlert]
  );

  const createEmptyProject = React.useCallback(
    async (newProjectSetup: NewProjectSetup): Promise<CreateProjectResult> => {
      return await createProjectAfterPreparation({
        prepareNewProjectSource: async () =>
          createNewEmptyProject({
            creationSource: newProjectSetup.creationSource,
          }),
        newProjectSetup,
      });
    },
    [createProjectAfterPreparation]
  );

  const createProjectFromExample = React.useCallback(
    async (
      exampleProjectSetup: ExampleProjectSetup
    ): Promise<CreateProjectResult> => {
      return await createProjectAfterPreparation({
        prepareNewProjectSource: () =>
          createNewProjectFromExampleShortHeader(exampleProjectSetup),
        newProjectSetup: exampleProjectSetup.newProjectSetup,
      });
    },
    [createProjectAfterPreparation]
  );

  const createProjectFromPrivateGameTemplate = React.useCallback(
    async (
      privateGameTemplateListingData: PrivateGameTemplateListingData,
      newProjectSetup: NewProjectSetup
    ): Promise<CreateProjectResult> => {
      return await createProjectAfterPreparation({
        prepareNewProjectSource: async () => {
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

          return await createNewProjectFromPrivateGameTemplate(
            privateGameTemplateUrl,
            privateGameTemplateListingData.id
          );
        },
        newProjectSetup,
      });
    },
    [authenticatedUser, createProjectAfterPreparation, profile]
  );

  const createProjectFromInAppTutorial = React.useCallback(
    async (
      tutorialId: string,
      newProjectSetup: NewProjectSetup
    ): Promise<CreateProjectResult> => {
      return await createProjectAfterPreparation({
        prepareNewProjectSource: async () => {
          const selectedInAppTutorialShortHeader = getInAppTutorialShortHeader(
            tutorialId
          );
          if (!selectedInAppTutorialShortHeader) {
            throw new Error(`No in app tutorial found for id "${tutorialId}"`);
          }
          const templateUrl =
            selectedInAppTutorialShortHeader.initialTemplateUrl;
          if (!templateUrl) {
            throw new Error(
              `No initial template URL for the in-app tutorial "${tutorialId}"`
            );
          }
          return await createNewProjectFromTutorialTemplate(
            templateUrl,
            selectedInAppTutorialShortHeader.id
          );
        },
        newProjectSetup,
        options: {
          openAllScenes: true,
        },
      });
    },
    [createProjectAfterPreparation, getInAppTutorialShortHeader]
  );

  const createProjectFromTutorial = React.useCallback(
    async (
      tutorialId: string,
      newProjectSetup: NewProjectSetup
    ): Promise<CreateProjectResult> => {
      return await createProjectAfterPreparation({
        prepareNewProjectSource: async () => {
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
          return await createNewProjectFromTutorialTemplate(
            templateUrl,
            tutorialId
          );
        },
        newProjectSetup,
        options: {
          openAllScenes: true,
        },
      });
    },
    [createProjectAfterPreparation, tutorials]
  );

  const createProjectFromCourseChapter = React.useCallback(
    async ({
      courseChapter,
      templateId,
      newProjectSetup,
    }: {|
      courseChapter: CourseChapter,
      templateId?: string,
      newProjectSetup: NewProjectSetup,
    |}): Promise<CreateProjectResult> => {
      if (courseChapter.isLocked) return { createdProject: null };
      return await createProjectAfterPreparation({
        prepareNewProjectSource: async () => {
          let templateUrl;
          if (courseChapter.templateUrl) {
            templateUrl = courseChapter.templateUrl;
          } else if (courseChapter.templates) {
            const matchingTemplate = courseChapter.templates.find(
              template => template.id === templateId
            );
            if (matchingTemplate) templateUrl = matchingTemplate.url;
          }
          if (!templateUrl) {
            throw new Error(
              `No template URL for the course chapter "${
                courseChapter.id
              }" and template id "${templateId || 'undefined'}"`
            );
          }
          return await createNewProjectFromCourseChapterTemplate(
            templateUrl,
            courseChapter.id
          );
        },
        newProjectSetup,
        options: {
          openAllScenes: true,
        },
      });
    },
    [createProjectAfterPreparation]
  );

  return {
    createEmptyProject,
    createProjectFromExample,
    createProjectFromPrivateGameTemplate,
    createProjectFromInAppTutorial,
    createProjectFromTutorial,
    createProjectFromCourseChapter,
  };
};

export default useCreateProject;
