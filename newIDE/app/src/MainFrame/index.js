// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import './MainFrame.css';
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import Toolbar from './Toolbar';
import ProjectTitlebar from './ProjectTitlebar';
import PreferencesDialog from './Preferences/PreferencesDialog';
import AboutDialog from './AboutDialog';
import ProjectManager from '../ProjectManager';
import PlatformSpecificAssetsDialog from '../PlatformSpecificAssetsEditor/PlatformSpecificAssetsDialog';
import LoaderModal from '../UI/LoaderModal';
import EditorBar from '../UI/EditorBar';
import CloseConfirmDialog from '../UI/CloseConfirmDialog';
import ProfileDialog from '../Profile/ProfileDialog';
import Window from '../Utils/Window';
import { showErrorBox } from '../UI/Messages/MessageBox';
import {
  ClosableTabs,
  ClosableTab,
  TabContentContainer,
} from '../UI/ClosableTabs';
import {
  getEditorTabsInitialState,
  openEditorTab,
  closeEditorTab,
  closeOtherEditorTabs,
  closeAllEditorTabs,
  changeCurrentTab,
  getEditors,
  getCurrentTabIndex,
  getCurrentTab,
  closeProjectTabs,
  closeLayoutTabs,
  closeExternalLayoutTabs,
  closeExternalEventsTabs,
  closeEventsFunctionsExtensionTabs,
  saveUiSettings,
  type EditorTabsState,
  type EditorTab,
  getEventsFunctionsExtensionEditor,
  notifyPreviewWillStart,
} from './EditorTabsHandler';
import { timePromise } from '../Utils/TimeFunction';
import newNameGenerator from '../Utils/NewNameGenerator';
import HelpFinder from '../HelpFinder';
import { renderDebuggerEditorContainer } from './EditorContainers/DebuggerEditorContainer';
import { renderEventsEditorContainer } from './EditorContainers/EventsEditorContainer';
import { renderExternalEventsEditorContainer } from './EditorContainers/ExternalEventsEditorContainer';
import { renderSceneEditorContainer } from './EditorContainers/SceneEditorContainer';
import { renderExternalLayoutEditorContainer } from './EditorContainers/ExternalLayoutEditorContainer';
import { renderEventsFunctionsExtensionEditorContainer } from './EditorContainers/EventsFunctionsExtensionEditorContainer';
import { renderStartPageContainer } from './EditorContainers/StartPage';
import { renderResourcesEditorContainer } from './EditorContainers/ResourcesEditorContainer';
import ErrorBoundary from '../UI/ErrorBoundary';
import SubscriptionDialog from '../Profile/SubscriptionDialog';
import ResourcesLoader from '../ResourcesLoader/index';
import {
  type PreviewLauncherInterface,
  type PreviewLauncherProps,
  type PreviewLauncherComponent,
} from '../Export/PreviewLauncher.flow';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import { type JsExtensionsLoader } from '../JsExtensionsLoader';
import { type EventsFunctionsExtensionsState } from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import {
  getUpdateNotificationTitle,
  getUpdateNotificationBody,
  type UpdateStatus,
} from './UpdaterTools';
import { showWarningBox } from '../UI/Messages/MessageBox';
import EmptyMessage from '../UI/EmptyMessage';
import ChangelogDialogContainer from './Changelog/ChangelogDialogContainer';
import { getNotNullTranslationFunction } from '../Utils/i18n/getTranslationFunction';
import { type I18n } from '@lingui/core';
import { t } from '@lingui/macro';
import LanguageDialog from './Preferences/LanguageDialog';
import PreferencesContext from './Preferences/PreferencesContext';
import { getFunctionNameFromType } from '../EventsFunctionsExtensionsLoader';
import { type ExportDialogWithoutExportsProps } from '../Export/ExportDialog';
import { type CreateProjectDialogWithComponentsProps } from '../ProjectCreation/CreateProjectDialog';
import { getStartupTimesSummary } from '../Utils/StartupTimes';
import {
  type StorageProvider,
  type StorageProviderOperations,
  type FileMetadata,
  type FileMetadataAndStorageProviderName,
} from '../ProjectsStorage';
import OpenFromStorageProviderDialog from '../ProjectsStorage/OpenFromStorageProviderDialog';
import SaveToStorageProviderDialog from '../ProjectsStorage/SaveToStorageProviderDialog';
import OpenConfirmDialog from '../ProjectsStorage/OpenConfirmDialog';
import verifyProjectContent from '../ProjectsStorage/ProjectContentChecker';
import { type UnsavedChanges } from './UnsavedChangesContext';
import { type MainMenuProps } from './MainMenu.flow';
import useForceUpdate from '../Utils/UseForceUpdate';
import useStateWithCallback from '../Utils/UseSetStateWithCallback';
import { type PreviewState } from './PreviewState.flow';

const GD_STARTUP_TIMES = global.GD_STARTUP_TIMES || [];

const gd = global.gd;

const styles = {
  drawerContent: {
    width: 320,
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
};

export type State = {|
  createDialogOpen: boolean,
  openConfirmDialogOpen: boolean,
  currentProject: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  editorTabs: EditorTabsState,
  snackMessage: string,
  snackMessageOpen: boolean,
  updateStatus: UpdateStatus,
  openFromStorageProviderDialogOpen: boolean,
  saveToStorageProviderDialogOpen: boolean,
  eventsFunctionsExtensionsError: ?Error,
  gdjsDevelopmentWatcherEnabled: boolean,
|};

const initialPreviewState: PreviewState = {
  previewLayoutName: null,
  previewExternalLayoutName: null,
  isPreviewOverriden: false,
  overridenPreviewLayoutName: null,
  overridenPreviewExternalLayoutName: null,
};

export type Props = {
  integratedEditor?: boolean,
  introDialog?: React.Element<*>,
  renderMainMenu?: MainMenuProps => React.Node,
  renderPreviewLauncher?: (
    props: PreviewLauncherProps,
    ref: (previewLauncher: ?PreviewLauncherInterface) => void
  ) => React.Element<PreviewLauncherComponent>,
  onEditObject?: gdObject => void,
  storageProviders: Array<StorageProvider>,
  getStorageProviderOperations: (
    ?StorageProvider
  ) => Promise<StorageProviderOperations>,
  getStorageProvider: () => StorageProvider,
  resourceSources: Array<ResourceSource>,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  loading?: boolean,
  requestUpdate?: () => void,
  renderExportDialog?: ExportDialogWithoutExportsProps => React.Node,
  renderCreateDialog?: CreateProjectDialogWithComponentsProps => React.Node,
  renderGDJSDevelopmentWatcher?: ?() => React.Node,
  extensionsLoader?: JsExtensionsLoader,
  initialFileMetadataToOpen: ?FileMetadata,
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  i18n: I18n,
  unsavedChanges?: UnsavedChanges,
};

const MainFrame = (props: Props) => {
  const [state, setState]: [
    State,
    ((State => State) | State) => Promise<State>,
  ] = useStateWithCallback(
    ({
      createDialogOpen: false,
      openConfirmDialogOpen: false,
      currentProject: null,
      currentFileMetadata: null,
      editorTabs: getEditorTabsInitialState(),
      snackMessage: '',
      snackMessageOpen: false,
      updateStatus: { message: '', status: 'unknown' },
      openFromStorageProviderDialogOpen: false,
      saveToStorageProviderDialogOpen: false,
      eventsFunctionsExtensionsError: null,
      gdjsDevelopmentWatcherEnabled: false,
    }: State)
  );
  const toolbar = React.useRef<?Toolbar>(null);
  const _resourceSourceDialogs = React.useRef({});
  const _previewLauncher = React.useRef((null: ?PreviewLauncherInterface));
  const forceUpdate = useForceUpdate();
  const [isLoadingProject, setIsLoadingProject] = React.useState<boolean>(
    false
  );
  const [projectManagerOpen, openProjectManager] = React.useState<boolean>(
    false
  );
  const [introDialogOpen, openIntroDialog] = React.useState<boolean>(false);
  const [languageDialogOpen, openLanguageDialog] = React.useState<boolean>(
    false
  );
  const [helpFinderDialogOpen, openHelpFinderDialog] = React.useState<boolean>(
    false
  );
  const [
    platformSpecificAssetsDialogOpen,
    openPlatformSpecificAssetsDialog,
  ] = React.useState<boolean>(false);
  const [aboutDialogOpen, openAboutDialog] = React.useState<boolean>(false);
  const [profileDialogOpen, openProfileDialog] = React.useState<boolean>(false);
  const [
    preferencesDialogOpen,
    openPreferencesDialog,
  ] = React.useState<boolean>(false);
  const [
    subscriptionDialogOpen,
    openSubscriptionDialog,
  ] = React.useState<boolean>(false);
  const [exportDialogOpen, openExportDialog] = React.useState<boolean>(false);
  const preferences = React.useContext(PreferencesContext);
  const [previewLoading, setPreviewLoading] = React.useState<boolean>(false);
  const [previewState, setPreviewState] = React.useState(initialPreviewState);

  // This is just for testing, to check if we're getting the right state
  // and gives us an idea about the number of re-renders.
  // React.useEffect(() => {
  //   console.log(state);
  // });

  const { integratedEditor, initialFileMetadataToOpen, introDialog } = props;
  React.useEffect(
    () => {
      if (!integratedEditor) openStartPage();
      GD_STARTUP_TIMES.push(['MainFrameComponentDidMount', performance.now()]);
      _loadExtensions()
        .then(() =>
          // Enable the GDJS development watcher *after* the extensions are loaded,
          // to avoid the watcher interfering with the extension loading (by updating GDJS,
          // which could lead in the extension loading failing for some extensions as file
          // are removed/copied).
          setState(state => ({
            ...state,
            gdjsDevelopmentWatcherEnabled: true,
          }))
        )
        .then(state => {
          if (initialFileMetadataToOpen) {
            _openInitialFileMetadata(/* isAfterUserInteraction= */ false);
          } else if (introDialog && !Window.isDev()) openIntroDialog(true);

          GD_STARTUP_TIMES.push([
            'MainFrameComponentDidMountFinished',
            performance.now(),
          ]);
          console.info('Startup times:', getStartupTimesSummary());
        })
        .catch(() => {
          /* Ignore errors */
        });
    },
    // eslint-disable-next-line
    []
  );

  const _openInitialFileMetadata = (isAfterUserInteraction: boolean) => {
    const { initialFileMetadataToOpen, getStorageProviderOperations } = props;

    if (!initialFileMetadataToOpen) return;
    getStorageProviderOperations().then(storageProviderOperations => {
      if (
        !isAfterUserInteraction &&
        storageProviderOperations.doesInitialOpenRequireUserInteraction
      ) {
        _openOpenConfirmDialog(true);
        return;
      }

      openFromFileMetadata(initialFileMetadataToOpen).then(state => {
        if (state)
          openSceneOrProjectManager({
            currentProject: state.currentProject,
            editorTabs: state.editorTabs,
          });
      });
    });
  };

  const updateToolbar = React.useCallback(
    (newEditorTabs = state.editorTabs) => {
      const editorTab = getCurrentTab(newEditorTabs);
      if (!editorTab || !editorTab.editorRef) {
        setEditorToolbar(null);
        return;
      }

      editorTab.editorRef.updateToolbar();
    },
    [state.editorTabs]
  );

  React.useEffect(
    () => {
      updateToolbar();
    },
    [updateToolbar]
  );

  const _languageDidChange = () => {
    // A change in the language will automatically be applied
    // on all React components, as it's handled by GDI18nProvider.
    // We still have this method that will be called when the language
    // dialog is closed after a language change. We then reload GDevelop
    // extensions so that they declare all objects/actions/condition/etc...
    // using the new language.
    gd.JsPlatform.get().reloadBuiltinExtensions();
    _loadExtensions().catch(() => {});
  };

  const _loadExtensions = (): Promise<void> => {
    const { extensionsLoader, i18n } = props;
    if (!extensionsLoader) {
      console.info(
        'No extensions loader specified, skipping extensions loading.'
      );
      return Promise.reject(new Error('No extension loader specified.'));
    }

    return extensionsLoader
      .loadAllExtensions(getNotNullTranslationFunction(i18n))
      .then(loadingResults => {
        const successLoadingResults = loadingResults.filter(
          loadingResult => !loadingResult.result.error
        );
        const failLoadingResults = loadingResults.filter(
          loadingResult =>
            loadingResult.result.error && !loadingResult.result.dangerous
        );
        const dangerousLoadingResults = loadingResults.filter(
          loadingResult =>
            loadingResult.result.error && loadingResult.result.dangerous
        );
        console.info(`Loaded ${successLoadingResults.length} JS extensions.`);
        if (failLoadingResults.length) {
          console.error(
            `⚠️ Unable to load ${
              failLoadingResults.length
            } JS extensions. Please check these errors:`,
            failLoadingResults
          );
        }
        if (dangerousLoadingResults.length) {
          console.error(
            `💣 Dangerous exceptions while loading ${
              dangerousLoadingResults.length
            } JS extensions. 🔥 Please check these errors as they will CRASH GDevelop:`,
            dangerousLoadingResults
          );
        }
      });
  };

  const loadFromSerializedProject = (
    serializedProject: gdSerializerElement,
    fileMetadata: ?FileMetadata
  ): Promise<State> => {
    return timePromise(
      () => {
        const newProject = gd.ProjectHelper.createNewGDJSProject();
        newProject.unserializeFrom(serializedProject);

        return loadFromProject(newProject, fileMetadata);
      },
      time => console.info(`Unserialization took ${time} ms`)
    );
  };

  const loadFromProject = (
    project: gdProject,
    fileMetadata: ?FileMetadata
  ): Promise<State> => {
    const { eventsFunctionsExtensionsState, getStorageProvider } = props;

    if (fileMetadata)
      preferences.insertRecentProjectFile({
        fileMetadata,
        storageProviderName: getStorageProvider().internalName,
      });

    return closeProject().then(() => {
      // Make sure that the ResourcesLoader cache is emptied, so that
      // the URL to a resource with a name in the old project is not re-used
      // for another resource with the same name in the new project.
      ResourcesLoader.burstAllUrlsCache();
      // TODO: Pixi cache should also be burst

      return setState(state => ({
        ...state,
        currentProject: project,
        currentFileMetadata: fileMetadata,
        createDialogOpen: false,
      })).then(state => {
        // Load all the EventsFunctionsExtension when the game is loaded. If they are modified,
        // their editor will take care of reloading them.
        eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
          project
        );

        if (fileMetadata) {
          project.setProjectFile(fileMetadata.fileIdentifier);
        }

        return state;
      });
    });
  };

  const openFromFileMetadata = (
    fileMetadata: FileMetadata
  ): Promise<?State> => {
    const { i18n, getStorageProviderOperations } = props;
    return getStorageProviderOperations().then(storageProviderOperations => {
      const {
        hasAutoSave,
        onGetAutoSave,
        onOpen,
        getOpenErrorMessage,
      } = storageProviderOperations;

      if (!onOpen) {
        console.error(
          'Tried to open a file for a storage without onOpen support:',
          fileMetadata,
          storageProviderOperations
        );
        return Promise.resolve();
      }

      const checkForAutosave = (): Promise<FileMetadata> => {
        if (!hasAutoSave || !onGetAutoSave) {
          return Promise.resolve(fileMetadata);
        }

        return hasAutoSave(fileMetadata, true).then(canOpenAutosave => {
          if (!canOpenAutosave) return fileMetadata;

          const answer = Window.showConfirmDialog(
            i18n._(
              t`An autosave file (backup made automatically by GDevelop) that is newer than the project file exists. Would you like to load it instead?`
            )
          );
          if (!answer) return fileMetadata;

          return onGetAutoSave(fileMetadata);
        });
      };

      const checkForAutosaveAfterFailure = (): Promise<?FileMetadata> => {
        if (!hasAutoSave || !onGetAutoSave) {
          return Promise.resolve(null);
        }

        return hasAutoSave(fileMetadata, false).then(canOpenAutosave => {
          if (!canOpenAutosave) return null;

          const answer = Window.showConfirmDialog(
            i18n._(
              t`The project file appears to be malformed, but an autosave file exists (backup made automatically by GDevelop). Would you like to try to load it instead?`
            )
          );
          if (!answer) return null;

          return onGetAutoSave(fileMetadata);
        });
      };

      setIsLoadingProject(true);

      // Try to find an autosave (and ask user if found)
      return checkForAutosave()
        .then(fileMetadata => onOpen(fileMetadata))
        .catch(err => {
          // onOpen failed, tried to find again an autosave
          return checkForAutosaveAfterFailure().then(fileMetadata => {
            if (fileMetadata) {
              return onOpen(fileMetadata);
            }

            throw err;
          });
        })
        .then(({ content }) => {
          if (!verifyProjectContent(i18n, content)) {
            // The content is not recognized and the user was warned. Abort the opening.
            return;
          }

          const serializedProject = gd.Serializer.fromJSObject(content);
          return loadFromSerializedProject(
            serializedProject,
            // Note that fileMetadata is the original, unchanged one, even if we're loading
            // an autosave. If we're for some reason loading an autosave, we still consider
            // that we're opening the file that was originally requested by the user.
            fileMetadata
          ).then(
            state => {
              serializedProject.delete();
              return Promise.resolve(state);
            },
            err => {
              serializedProject.delete();
              throw err;
            }
          );
        })
        .catch(error => {
          const errorMessage = getOpenErrorMessage
            ? getOpenErrorMessage(error)
            : t`Check that the path/URL is correct, that you selected a file that is a game file created with GDevelop and that is was not removed.`;
          showErrorBox(
            [i18n._(t`Unable to open the project.`), i18n._(errorMessage)].join(
              '\n'
            ),
            error
          );
        });
    });
  };

  const closeApp = (): void => {
    return Window.quit();
  };

  const closeProject = (): Promise<void> => {
    const { eventsFunctionsExtensionsState } = props;

    setPreviewState(initialPreviewState);
    return setState(state => {
      const { currentProject, editorTabs } = state;

      if (!currentProject) {
        // It's important to return a new object to ensure that the promise
        // will be fired.
        return { ...state };
      }

      if (currentProject) {
        eventsFunctionsExtensionsState.unloadProjectEventsFunctionsExtensions(
          currentProject
        );
        currentProject.delete();
      }

      return {
        ...state,
        currentProject: null,
        currentFileMetadata: null,
        editorTabs: closeProjectTabs(editorTabs, currentProject),
      };
    }).then(() => {});
  };

  const toggleProjectManager = () => {
    if (toolbar.current)
      openProjectManager(projectManagerOpen => !projectManagerOpen);
  };

  const setEditorToolbar = (editorToolbar: any) => {
    if (!toolbar.current) return;

    toolbar.current.setEditorToolbar(editorToolbar);
  };

  const addLayout = () => {
    const { currentProject } = state;
    if (!currentProject) return;

    const name = newNameGenerator('New scene', name =>
      currentProject.hasLayoutNamed(name)
    );
    const newLayout = currentProject.insertNewLayout(
      name,
      currentProject.getLayoutsCount()
    );
    newLayout.updateBehaviorsSharedData(currentProject);
    _onProjectItemModified();
  };

  const addExternalLayout = () => {
    const { currentProject } = state;
    if (!currentProject) return;

    const name = newNameGenerator('NewExternalLayout', name =>
      currentProject.hasExternalLayoutNamed(name)
    );
    currentProject.insertNewExternalLayout(
      name,
      currentProject.getExternalLayoutsCount()
    );
    _onProjectItemModified();
  };

  const addExternalEvents = () => {
    const { currentProject } = state;
    if (!currentProject) return;

    const name = newNameGenerator('NewExternalEvents', name =>
      currentProject.hasExternalEventsNamed(name)
    );
    currentProject.insertNewExternalEvents(
      name,
      currentProject.getExternalEventsCount()
    );
    _onProjectItemModified();
  };

  const addEventsFunctionsExtension = () => {
    const { currentProject } = state;
    if (!currentProject) return;

    const name = newNameGenerator('NewExtension', name =>
      currentProject.hasEventsFunctionsExtensionNamed(name)
    );
    currentProject.insertNewEventsFunctionsExtension(
      name,
      currentProject.getEventsFunctionsExtensionsCount()
    );
    _onProjectItemModified();
  };

  const deleteLayout = (layout: gdLayout) => {
    const { i18n } = props;
    if (!state.currentProject) return;

    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to remove this scene? This can't be undone.`
      )
    );
    if (!answer) return;

    setState(state => ({
      ...state,
      editorTabs: closeLayoutTabs(state.editorTabs, layout),
    })).then(state => {
      if (state.currentProject)
        state.currentProject.removeLayout(layout.getName());
      _onProjectItemModified();
    });
  };

  const deleteExternalLayout = (externalLayout: gdExternalLayout) => {
    const { currentProject } = state;
    const { i18n } = props;
    if (!currentProject) return;

    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to remove this external layout? This can't be undone.`
      )
    );
    if (!answer) return;

    setState(state => ({
      ...state,
      editorTabs: closeExternalLayoutTabs(state.editorTabs, externalLayout),
    })).then(state => {
      if (state.currentProject)
        state.currentProject.removeExternalLayout(externalLayout.getName());
      _onProjectItemModified();
    });
  };

  const deleteExternalEvents = (externalEvents: gdExternalEvents) => {
    const { i18n } = props;
    if (!state.currentProject) return;

    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to remove these external events? This can't be undone.`
      )
    );
    if (!answer) return;

    setState(state => ({
      ...state,
      editorTabs: closeExternalEventsTabs(state.editorTabs, externalEvents),
    })).then(state => {
      if (state.currentProject)
        state.currentProject.removeExternalEvents(externalEvents.getName());
      _onProjectItemModified();
    });
  };

  const deleteEventsFunctionsExtension = (
    externalLayout: gdEventsFunctionsExtension
  ) => {
    const { currentProject } = state;
    const { i18n, eventsFunctionsExtensionsState } = props;
    if (!currentProject) return;

    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to remove this extension? This can't be undone.`
      )
    );
    if (!answer) return;

    setState(state => ({
      ...state,
      editorTabs: closeEventsFunctionsExtensionTabs(
        state.editorTabs,
        externalLayout
      ),
    })).then(state => {
      currentProject.removeEventsFunctionsExtension(externalLayout.getName());
      _onProjectItemModified();
    });

    // Reload extensions to make sure the deleted extension is removed
    // from the platform
    eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions(
      currentProject
    );
  };

  const renameLayout = (oldName: string, newName: string) => {
    const { currentProject } = state;
    const { i18n } = props;
    if (!currentProject) return;

    if (!currentProject.hasLayoutNamed(oldName) || newName === oldName) return;

    if (newName === '') {
      showWarningBox(
        i18n._(t`This name cannot be empty, please enter a new name.`)
      );
      return;
    }

    if (currentProject.hasLayoutNamed(newName)) {
      showWarningBox(i18n._(t`Another scene with this name already exists.`));
      return;
    }

    const layout = currentProject.getLayout(oldName);
    setState(state => ({
      ...state,
      editorTabs: closeLayoutTabs(state.editorTabs, layout),
    })).then(state => {
      layout.setName(newName);
      _onProjectItemModified();
    });
  };

  const renameExternalLayout = (oldName: string, newName: string) => {
    const { currentProject } = state;
    const { i18n } = props;
    if (!currentProject) return;

    if (!currentProject.hasExternalLayoutNamed(oldName) || newName === oldName)
      return;

    if (newName === '') {
      showWarningBox(
        i18n._(t`This name cannot be empty, please enter a new name.`)
      );
      return;
    }

    if (currentProject.hasExternalLayoutNamed(newName)) {
      showWarningBox(
        i18n._(t`Another external layout with this name already exists.`)
      );
      return;
    }

    const externalLayout = currentProject.getExternalLayout(oldName);
    setState(state => ({
      ...state,
      editorTabs: closeExternalLayoutTabs(state.editorTabs, externalLayout),
    })).then(state => {
      externalLayout.setName(newName);
      _onProjectItemModified();
    });
  };

  const renameExternalEvents = (oldName: string, newName: string) => {
    const { currentProject } = state;
    const { i18n } = props;
    if (!currentProject) return;

    if (!currentProject.hasExternalEventsNamed(oldName) || newName === oldName)
      return;

    if (newName === '') {
      showWarningBox(
        i18n._(t`This name cannot be empty, please enter a new name.`)
      );
      return;
    }

    if (currentProject.hasExternalEventsNamed(newName)) {
      showWarningBox(
        i18n._(t`Other external events with this name already exist.`)
      );
      return;
    }

    const externalEvents = currentProject.getExternalEvents(oldName);
    setState(state => ({
      ...state,
      editorTabs: closeExternalEventsTabs(state.editorTabs, externalEvents),
    })).then(state => {
      externalEvents.setName(newName);
      _onProjectItemModified();
    });
  };

  const renameEventsFunctionsExtension = (oldName: string, newName: string) => {
    const { currentProject } = state;
    const { i18n } = props;
    const { eventsFunctionsExtensionsState } = props;
    if (!currentProject) return;

    if (
      !currentProject.hasEventsFunctionsExtensionNamed(oldName) ||
      newName === oldName
    )
      return;

    if (newName === '') {
      showWarningBox(
        i18n._(t`This name cannot be empty, please enter a new name.`)
      );
      return;
    }

    if (currentProject.hasEventsFunctionsExtensionNamed(newName)) {
      showWarningBox(
        i18n._(t`Another extension with this name already exists.`)
      );
      return;
    }

    if (!gd.Project.validateName(newName)) {
      showWarningBox(
        i18n._(
          t`This name is invalid. Only use alphanumeric characters (0-9, a-z) and underscores. Digits are not allowed as the first character.`
        )
      );
      return;
    }

    const eventsFunctionsExtension = currentProject.getEventsFunctionsExtension(
      oldName
    );
    setState(state => ({
      ...state,
      editorTabs: closeEventsFunctionsExtensionTabs(
        state.editorTabs,
        eventsFunctionsExtension
      ),
    })).then(state => {
      // Refactor the project to update the instructions (and later expressions)
      // of this extension:
      gd.WholeProjectRefactorer.renameEventsFunctionsExtension(
        currentProject,
        eventsFunctionsExtension,
        oldName,
        newName
      );
      eventsFunctionsExtension.setName(newName);
      eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions(
        currentProject
      );
      _onProjectItemModified();
    });
  };

  const setPreviewedLayout = (
    previewLayoutName: ?string,
    previewExternalLayoutName?: ?string
  ) => {
    setPreviewState(
      previewState =>
        ({
          ...previewState,
          previewLayoutName,
          previewExternalLayoutName,
        }: PreviewState)
    );
  };

  const setPreviewOverride = ({
    isPreviewOverriden,
    overridenPreviewLayoutName,
    overridenPreviewExternalLayoutName,
  }) => {
    setPreviewState(previewState => ({
      ...previewState,
      isPreviewOverriden,
      overridenPreviewLayoutName,
      overridenPreviewExternalLayoutName,
    }));
  };

  const launchPreview = (networkPreview: boolean) => {
    const { eventsFunctionsExtensionsState } = props;

    if (!currentProject) return;
    if (currentProject.getLayoutsCount() === 0) return;

    setPreviewLoading(true);

    notifyPreviewWillStart(state.editorTabs);

    const layoutName = previewState.isPreviewOverriden
      ? previewState.overridenPreviewLayoutName
      : previewState.previewLayoutName;
    const externalLayoutName = previewState.isPreviewOverriden
      ? previewState.overridenPreviewExternalLayoutName
      : previewState.previewExternalLayoutName;

    const layout =
      layoutName && currentProject.hasLayoutNamed(layoutName)
        ? currentProject.getLayout(layoutName)
        : currentProject.getLayoutAt(0);
    const externalLayout =
      externalLayoutName &&
      currentProject.hasExternalLayoutNamed(externalLayoutName)
        ? currentProject.getExternalLayout(externalLayoutName)
        : null;

    const previewLauncher = _previewLauncher.current;
    if (previewLauncher) {
      return eventsFunctionsExtensionsState
        .ensureLoadFinished()
        .then(() =>
          previewLauncher.launchPreview({
            project: currentProject,
            layout,
            externalLayout,
            networkPreview,
          })
        )
        .catch(error => {
          console.error(
            'Error caught while launching preview, this should never happen.',
            error
          );
        })
        .then(() => {
          setPreviewLoading(false);
        });
    }
    autosaveProjectIfNeeded();
  };

  const openLayout = (
    name: string,
    {
      openEventsEditor = true,
      openSceneEditor = true,
    }: { openEventsEditor: boolean, openSceneEditor: boolean } = {},
    editorTabs = state.editorTabs
  ) => {
    const { i18n } = props;
    const sceneEditorOptions = {
      label: name,
      projectItemName: name,
      renderEditorContainer: renderSceneEditorContainer,
      key: 'layout ' + name,
    };
    const eventsEditorOptions = {
      label: name + ' ' + i18n._(t`(Events)`),
      projectItemName: name,
      renderEditorContainer: renderEventsEditorContainer,
      key: 'layout events ' + name,
      dontFocusTab: openSceneEditor,
    };

    const tabsWithSceneEditor = openSceneEditor
      ? openEditorTab(editorTabs, sceneEditorOptions)
      : editorTabs;
    const tabsWithSceneAndEventsEditors = openEventsEditor
      ? openEditorTab(tabsWithSceneEditor, eventsEditorOptions)
      : tabsWithSceneEditor;

    setState(state => ({
      ...state,
      editorTabs: tabsWithSceneAndEventsEditors,
    }));
    setIsLoadingProject(false);
    openProjectManager(false);
  };

  const openExternalEvents = (name: string) => {
    setState(state => ({
      ...state,
      editorTabs: openEditorTab(state.editorTabs, {
        label: name,
        projectItemName: name,
        renderEditorContainer: renderExternalEventsEditorContainer,
        key: 'external events ' + name,
      }),
    }));
    openProjectManager(false);
  };

  const openExternalLayout = (name: string) => {
    setState(state => ({
      ...state,
      editorTabs: openEditorTab(state.editorTabs, {
        label: name,
        projectItemName: name,
        renderEditorContainer: renderExternalLayoutEditorContainer,
        key: 'external layout ' + name,
      }),
    }));
    openProjectManager(false);
  };

  const openEventsFunctionsExtension = (
    name: string,
    initiallyFocusedFunctionName?: string,
    initiallyFocusedBehaviorName?: ?string
  ) => {
    const { i18n } = props;
    setState(state => ({
      ...state,
      editorTabs: openEditorTab(state.editorTabs, {
        label: name + ' ' + i18n._(t`(Extension)`),
        projectItemName: name,
        extraEditorProps: {
          initiallyFocusedFunctionName,
          initiallyFocusedBehaviorName,
        },
        renderEditorContainer: renderEventsFunctionsExtensionEditorContainer,
        key: 'events functions extension ' + name,
      }),
    }));
    openProjectManager(false);
  };

  const openResources = () => {
    const { i18n } = props;
    setState(state => ({
      ...state,
      editorTabs: openEditorTab(state.editorTabs, {
        label: i18n._(t`Resources`),
        projectItemName: null,
        renderEditorContainer: renderResourcesEditorContainer,
        key: 'resources',
      }),
    }));
  };

  const openStartPage = () => {
    const { i18n } = props;
    setState(state => ({
      ...state,
      editorTabs: openEditorTab(state.editorTabs, {
        label: i18n._(t`Start Page`),
        projectItemName: null,
        renderEditorContainer: renderStartPageContainer,
        key: 'start page',
        closable: false,
      }),
    }));
  };

  const openDebugger = () => {
    const { i18n } = props;
    setState(state => ({
      ...state,
      editorTabs: openEditorTab(state.editorTabs, {
        label: i18n._(t`Debugger`),
        projectItemName: null,
        renderEditorContainer: renderDebuggerEditorContainer,
        key: 'debugger',
      }),
    }));
  };

  const openInstructionOrExpression = (
    extension: gdPlatformExtension,
    type: string
  ) => {
    const { currentProject, editorTabs } = state;
    if (!currentProject) return;

    const extensionName = extension.getName();
    if (currentProject.hasEventsFunctionsExtensionNamed(extensionName)) {
      // It's an events functions extension, open the editor for it.
      const eventsFunctionsExtension = currentProject.getEventsFunctionsExtension(
        extensionName
      );
      const functionName = getFunctionNameFromType(type);

      const foundTab = getEventsFunctionsExtensionEditor(
        editorTabs,
        eventsFunctionsExtension
      );
      if (foundTab) {
        // Open the given function and focus the tab
        foundTab.editor.selectEventsFunctionByName(
          functionName.name,
          functionName.behaviorName
        );
        setState(state => ({
          ...state,
          editorTabs: changeCurrentTab(editorTabs, foundTab.tabIndex),
        }));
      } else {
        // Open a new editor for the extension and the given function
        openEventsFunctionsExtension(
          extensionName,
          functionName.name,
          functionName.behaviorName
        );
      }
    } else {
      // It's not an events functions extension, we should not be here.
      console.warn(
        `Extension with name=${extensionName} can not be opened (no editor for this)`
      );
    }
  };

  const _onProjectItemModified = () => {
    if (props.unsavedChanges) props.unsavedChanges.triggerUnsavedChanges();
    forceUpdate();
  };

  const onCreateEventsFunction = (
    extensionName: string,
    eventsFunction: gdEventsFunction
  ) => {
    const { currentProject } = state;
    const { eventsFunctionsExtensionsState } = props;
    if (!currentProject) return;

    // Names are assumed to be already validated
    const createNewExtension = !currentProject.hasEventsFunctionsExtensionNamed(
      extensionName
    );
    const extension = createNewExtension
      ? currentProject.insertNewEventsFunctionsExtension(extensionName, 0)
      : currentProject.getEventsFunctionsExtension(extensionName);

    if (createNewExtension) {
      extension.setFullName(extensionName);
      extension.setDescription(
        'Originally automatically extracted from events of the project'
      );
    }

    extension.insertEventsFunction(eventsFunction, 0);
    eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
      currentProject
    );
  };

  const openCreateDialog = (open: boolean = true) => {
    setState(state => ({ ...state, createDialogOpen: open }));
  };

  const chooseProject = () => {
    const { storageProviders } = props;

    if (
      storageProviders.filter(({ hiddenInOpenDialog }) => !hiddenInOpenDialog)
        .length > 1
    ) {
      openOpenFromStorageProviderDialog();
    } else {
      chooseProjectWithStorageProviderPicker();
    }
  };

  const chooseProjectWithStorageProviderPicker = () => {
    const { getStorageProviderOperations, i18n } = props;
    getStorageProviderOperations().then(storageProviderOperations => {
      if (!storageProviderOperations.onOpenWithPicker) return;

      return storageProviderOperations
        .onOpenWithPicker()
        .then(fileMetadata => {
          if (!fileMetadata) return;

          return openFromFileMetadata(fileMetadata).then(state => {
            if (state)
              openSceneOrProjectManager({
                currentProject: state.currentProject,
                editorTabs: state.editorTabs,
              });
            //addRecentFile(fileMetadata);
          });
        })
        .catch(error => {
          const errorMessage = storageProviderOperations.getOpenErrorMessage
            ? storageProviderOperations.getOpenErrorMessage(error)
            : t`Verify that you have the authorizations for reading the file you're trying to access.`;
          showErrorBox(
            [i18n._(t`Unable to open the project.`), i18n._(errorMessage)].join(
              '\n'
            ),
            error
          );
        });
    });
  };

  const openFromFileMetadataWithStorageProvider = (
    fileMetadataAndStorageProviderName: FileMetadataAndStorageProviderName
  ) => {
    const {
      fileMetadata,
      storageProviderName,
    } = fileMetadataAndStorageProviderName;
    const { storageProviders, getStorageProviderOperations } = props;

    const storageProvider = storageProviders.filter(
      storageProvider => storageProvider.internalName === storageProviderName
    )[0];

    if (storageProvider) {
      getStorageProviderOperations(storageProvider).then(() => {
        openFromFileMetadata(fileMetadata).then(state => {
          if (state)
            openSceneOrProjectManager({
              currentProject: state.currentProject,
              editorTabs: state.editorTabs,
            });
        });
      });
    }
  };

  const saveProject = () => {
    const { currentProject, currentFileMetadata } = state;
    const { i18n, getStorageProviderOperations } = props;
    if (!currentProject) return;
    if (!currentFileMetadata) {
      return saveProjectAs();
    }

    getStorageProviderOperations().then(storageProviderOperations => {
      const { onSaveProject } = storageProviderOperations;
      if (!onSaveProject) {
        return saveProjectAs();
      }

      saveUiSettings(state.editorTabs);
      _showSnackMessage(i18n._(t`Saving...`));

      onSaveProject(currentProject, currentFileMetadata).then(
        ({ wasSaved }) => {
          if (wasSaved) {
            if (props.unsavedChanges) props.unsavedChanges.sealUnsavedChanges();
            _showSnackMessage(i18n._(t`Project properly saved`));
          }
        },
        err => {
          showErrorBox(
            i18n._(
              t`Unable to save the project! Please try again by choosing another location.`
            ),
            err
          );
        }
      );
    });
  };

  const saveProjectAs = () => {
    const { currentProject } = state;
    const { storageProviders, getStorageProviderOperations } = props;
    if (!currentProject) return;

    getStorageProviderOperations().then(storageProviderOperations => {
      if (
        storageProviders.filter(({ hiddenInSaveDialog }) => !hiddenInSaveDialog)
          .length > 1 ||
        !storageProviderOperations.onSaveProjectAs
      ) {
        openSaveToStorageProviderDialog();
      } else {
        saveProjectAsWithStorageProvider();
      }
    });
  };

  const autosaveProjectIfNeeded = () => {
    const { currentProject, currentFileMetadata } = state;
    const { getStorageProviderOperations } = props;

    if (!currentProject) return;

    getStorageProviderOperations().then(storageProviderOperations => {
      if (
        preferences.values.autosaveOnPreview &&
        storageProviderOperations.onAutoSaveProject &&
        currentFileMetadata
      ) {
        storageProviderOperations.onAutoSaveProject(
          currentProject,
          currentFileMetadata
        );
      }
    });
  };

  const saveProjectAsWithStorageProvider = () => {
    const { currentProject, currentFileMetadata } = state;
    if (!currentProject) return;

    saveUiSettings(state.editorTabs);
    const { i18n, getStorageProviderOperations } = props;

    getStorageProviderOperations().then(storageProviderOperations => {
      if (!storageProviderOperations.onSaveProjectAs) {
        return;
      }

      storageProviderOperations
        .onSaveProjectAs(currentProject, currentFileMetadata)
        .then(
          ({ wasSaved, fileMetadata }) => {
            if (wasSaved) {
              if (props.unsavedChanges)
                props.unsavedChanges.sealUnsavedChanges();
              _showSnackMessage(i18n._(t`Project properly saved`));

              if (fileMetadata) {
                setState(state => ({
                  ...state,
                  currentFileMetadata: fileMetadata,
                }));
              }
            }
          },
          err => {
            showErrorBox(
              i18n._(
                t`Unable to save as the project! Please try again by choosing another location.`
              ),
              err
            );
          }
        );
    });
  };

  const askToCloseProject = (): Promise<void> => {
    const { currentProject } = state;
    const { unsavedChanges } = props;
    if (unsavedChanges && unsavedChanges.hasUnsavedChanges) {
      if (!currentProject) return Promise.resolve();

      const answer = Window.showConfirmDialog(
        i18n._(
          t`Close the project? Any changes that have not been saved will be lost.`
        )
      );
      if (!answer) return Promise.resolve();
    }
    return closeProject();
  };

  const openSceneOrProjectManager = (
    newState = {
      currentProject: state.currentProject,
      editorTabs: state.editorTabs,
    }
  ) => {
    const { currentProject, editorTabs } = newState;
    if (!currentProject) return;

    if (currentProject.getLayoutsCount() === 1) {
      openLayout(
        currentProject.getLayoutAt(0).getName(),
        {
          openSceneEditor: true,
          openEventsEditor: true,
        },
        editorTabs
      );
    } else {
      setState(state => ({
        ...state,
        currentProject,
        editorTabs,
      })).then(() => {
        setIsLoadingProject(false);
        openProjectManager(true);
      });
    }
  };

  const _openOpenConfirmDialog = (open: boolean = true) => {
    setState(state => ({ ...state, openConfirmDialogOpen: open }));
  };

  const _onChangeEditorTab = (value: number) => {
    setState(state => ({
      ...state,
      editorTabs: changeCurrentTab(state.editorTabs, value),
    })).then(state =>
      _onEditorTabActive(getCurrentTab(state.editorTabs), state)
    );
  };

  const _onEditorTabActive = (
    editorTab: EditorTab,
    newState: State = state
  ) => {
    updateToolbar(newState.editorTabs);
    // Ensure the editors shown on the screen are updated. This is for
    // example useful if global objects have been updated in another editor.
    if (editorTab.editorRef) {
      editorTab.editorRef.forceUpdateEditor();
    }
  };

  const _onCloseEditorTab = (editorTab: EditorTab) => {
    saveUiSettings(state.editorTabs);
    setState(state => ({
      ...state,
      editorTabs: closeEditorTab(state.editorTabs, editorTab),
    }));
  };

  const _onCloseOtherEditorTabs = (editorTab: EditorTab) => {
    saveUiSettings(state.editorTabs);
    setState(state => ({
      ...state,
      editorTabs: closeOtherEditorTabs(state.editorTabs, editorTab),
    }));
  };

  const _onCloseAllEditorTabs = () => {
    saveUiSettings(state.editorTabs);
    setState(state => ({
      ...state,
      editorTabs: closeAllEditorTabs(state.editorTabs),
    }));
  };

  const onChooseResource: ChooseResourceFunction = (
    sourceName: string,
    multiSelection: boolean = true
  ) => {
    const { currentProject } = state;
    const resourceSourceDialog = _resourceSourceDialogs.current[sourceName];
    if (!resourceSourceDialog) return Promise.resolve([]);

    return resourceSourceDialog.chooseResources(currentProject, multiSelection);
  };

  const openOpenFromStorageProviderDialog = (open: boolean = true) => {
    setState(state => ({ ...state, openFromStorageProviderDialogOpen: open }));
  };

  const openSaveToStorageProviderDialog = (open: boolean = true) => {
    if (open) {
      // Ensure the project manager is closed as Google Drive storage provider
      // display a picker that does not play nice with material-ui's overlays.
      openProjectManager(false);
    }
    setState(state => ({ ...state, saveToStorageProviderDialogOpen: open }));
  };

  const setUpdateStatus = (updateStatus: UpdateStatus) => {
    setState(state => ({ ...state, updateStatus }));

    const notificationTitle = getUpdateNotificationTitle(updateStatus);
    const notificationBody = getUpdateNotificationBody(updateStatus);
    if (notificationTitle) {
      const notification = new window.Notification(notificationTitle, {
        body: notificationBody,
      });
      notification.onclick = () => openAboutDialog(true);
    }
  };

  const simulateUpdateDownloaded = () =>
    setUpdateStatus({
      status: 'update-downloaded',
      message: 'update-downloaded',
      info: {
        releaseName: 'Fake update',
      },
    });

  const simulateUpdateAvailable = () =>
    setUpdateStatus({
      status: 'update-available',
      message: 'Update available',
    });

  const _showSnackMessage = (snackMessage: string) => {
    setState(state => ({
      ...state,
      snackMessage,
      snackMessageOpen: true,
    }));
  };
  const _closeSnackMessage = () => {
    setState(state => ({
      ...state,
      snackMessageOpen: false,
    }));
  };

  const {
    currentProject,
    currentFileMetadata,
    updateStatus,
    eventsFunctionsExtensionsError,
  } = state;
  const {
    renderExportDialog,
    renderCreateDialog,
    resourceSources,
    renderPreviewLauncher,
    resourceExternalEditors,
    eventsFunctionsExtensionsState,
    getStorageProviderOperations,
    i18n,
    renderGDJSDevelopmentWatcher,
    renderMainMenu,
  } = props;
  const showLoader = isLoadingProject || previewLoading || props.loading;

  return (
    <div className="main-frame">
      {!!renderMainMenu &&
        renderMainMenu({
          i18n: i18n,
          project: state.currentProject,
          onChooseProject: chooseProject,
          onOpenRecentFile: openFromFileMetadataWithStorageProvider,
          onSaveProject: saveProject,
          onSaveProjectAs: saveProjectAs,
          onCloseProject: askToCloseProject,
          onCloseApp: closeApp,
          onExportProject: () => openExportDialog(true),
          onCreateProject: openCreateDialog,
          onOpenProjectManager: () => openProjectManager(true),
          onOpenStartPage: openStartPage,
          onOpenDebugger: openDebugger,
          onOpenAbout: () => openAboutDialog(true),
          onOpenPreferences: () => openPreferencesDialog(true),
          onOpenLanguage: () => openLanguageDialog(true),
          onOpenProfile: () => openProfileDialog(true),
          setUpdateStatus: setUpdateStatus,
          recentProjectFiles: preferences.getRecentProjectFiles(),
        })}
      <ProjectTitlebar fileMetadata={currentFileMetadata} />
      <Drawer
        open={projectManagerOpen}
        PaperProps={{
          style: styles.drawerContent,
        }}
        ModalProps={{
          keepMounted: true,
        }}
        onClose={toggleProjectManager}
      >
        <EditorBar
          title={
            state.currentProject ? state.currentProject.getName() : 'No project'
          }
          displayRightCloseButton
          onClose={toggleProjectManager}
        />
        {currentProject && (
          <ProjectManager
            project={currentProject}
            onOpenExternalEvents={openExternalEvents}
            onOpenLayout={openLayout}
            onOpenExternalLayout={openExternalLayout}
            onOpenEventsFunctionsExtension={openEventsFunctionsExtension}
            onAddLayout={addLayout}
            onAddExternalLayout={addExternalLayout}
            onAddEventsFunctionsExtension={addEventsFunctionsExtension}
            onAddExternalEvents={addExternalEvents}
            onDeleteLayout={deleteLayout}
            onDeleteExternalLayout={deleteExternalLayout}
            onDeleteEventsFunctionsExtension={deleteEventsFunctionsExtension}
            onDeleteExternalEvents={deleteExternalEvents}
            onRenameLayout={renameLayout}
            onRenameExternalLayout={renameExternalLayout}
            onRenameEventsFunctionsExtension={renameEventsFunctionsExtension}
            onRenameExternalEvents={renameExternalEvents}
            onSaveProject={saveProject}
            onSaveProjectAs={saveProjectAs}
            onCloseProject={() => {
              askToCloseProject();
            }}
            onExportProject={() => openExportDialog(true)}
            onOpenPreferences={() => openPreferencesDialog(true)}
            onOpenProfile={() => openProfileDialog(true)}
            onOpenResources={() => {
              openResources();
              openProjectManager(false);
            }}
            onOpenPlatformSpecificAssets={() =>
              openPlatformSpecificAssetsDialog(true)
            }
            onChangeSubscription={() => openSubscriptionDialog(true)}
            eventsFunctionsExtensionsError={eventsFunctionsExtensionsError}
            onReloadEventsFunctionsExtensions={() => {
              // Check if load is sufficient
              eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions(
                currentProject
              );
            }}
            freezeUpdate={!projectManagerOpen}
            unsavedChanges={props.unsavedChanges}
          />
        )}
        {!state.currentProject && (
          <EmptyMessage>
            <Trans>To begin, open or create a new project.</Trans>
          </EmptyMessage>
        )}
      </Drawer>
      <Toolbar
        ref={toolbar}
        showProjectIcons={!props.integratedEditor}
        hasProject={!!currentProject}
        toggleProjectManager={toggleProjectManager}
        exportProject={() => openExportDialog(true)}
        requestUpdate={props.requestUpdate}
        simulateUpdateDownloaded={simulateUpdateDownloaded}
        simulateUpdateAvailable={simulateUpdateAvailable}
        onOpenDebugger={() => {
          openDebugger();
          launchPreview(/*networkPreview=*/ false);
        }}
        onPreview={() => {
          launchPreview(/*networkPreview=*/ false);
        }}
        onNetworkPreview={() => {
          launchPreview(/*networkPreview=*/ true);
        }}
        showNetworkPreviewButton={
          !!_previewLauncher.current &&
          _previewLauncher.current.canDoNetworkPreview()
        }
        setPreviewOverride={setPreviewOverride}
        isPreviewEnabled={
          !!currentProject && currentProject.getLayoutsCount() > 0
        }
        previewState={previewState}
      />
      <ClosableTabs hideLabels={!!props.integratedEditor}>
        {getEditors(state.editorTabs).map((editorTab, id) => {
          const isCurrentTab = getCurrentTabIndex(state.editorTabs) === id;
          return (
            <ClosableTab
              label={editorTab.label}
              key={editorTab.key}
              active={isCurrentTab}
              onClick={() => _onChangeEditorTab(id)}
              onClose={() => _onCloseEditorTab(editorTab)}
              onCloseOthers={() => _onCloseOtherEditorTabs(editorTab)}
              onCloseAll={_onCloseAllEditorTabs}
              onActivated={() => _onEditorTabActive(editorTab)}
              closable={editorTab.closable}
            />
          );
        })}
      </ClosableTabs>
      {getEditors(state.editorTabs).map((editorTab, id) => {
        const isCurrentTab = getCurrentTabIndex(state.editorTabs) === id;
        return (
          <TabContentContainer key={editorTab.key} active={isCurrentTab}>
            <ErrorBoundary>
              {editorTab.renderEditorContainer({
                isActive: isCurrentTab,
                extraEditorProps: editorTab.extraEditorProps,
                project: currentProject,
                ref: editorRef => (editorTab.editorRef = editorRef),
                setToolbar: setEditorToolbar,
                onChangeSubscription: () => openSubscriptionDialog(true),
                projectItemName: editorTab.projectItemName,
                setPreviewedLayout,
                onOpenExternalEvents: openExternalEvents,
                previewDebuggerServer:
                  _previewLauncher.current &&
                  _previewLauncher.current.getPreviewDebuggerServer(),
                onOpenLayout: name =>
                  openLayout(name, {
                    openEventsEditor: true,
                    openSceneEditor: false,
                  }),
                resourceSources: props.resourceSources,
                onChooseResource,
                resourceExternalEditors,
                onCreateEventsFunction,
                openInstructionOrExpression,
                unsavedChanges: props.unsavedChanges,
                canOpen: !!props.storageProviders.filter(
                  ({ hiddenInOpenDialog }) => !hiddenInOpenDialog
                ).length,
                onOpen: () => chooseProject(),
                onCreate: () => openCreateDialog(),
                onOpenProjectManager: () => openProjectManager(true),
                onCloseProject: () => askToCloseProject(),
                onOpenAboutDialog: () => openAboutDialog(true),
                onOpenHelpFinder: () => openHelpFinderDialog(true),
                onOpenLanguageDialog: () => openLanguageDialog(true),
                onLoadEventsFunctionsExtensions: () => {
                  eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
                    currentProject
                  );
                },
                onDeleteResource: (
                  resource: gdResource,
                  cb: boolean => void
                ) => {
                  // TODO: Project wide refactoring of objects/events using the resource
                  cb(true);
                },
                onRenameResource: (
                  resource: gdResource,
                  newName: string,
                  cb: boolean => void
                ) => {
                  // TODO: Project wide refactoring of objects/events using the resource
                  cb(true);
                },
              })}
            </ErrorBoundary>
          </TabContentContainer>
        );
      })}
      <LoaderModal show={showLoader} />
      <HelpFinder
        open={helpFinderDialogOpen}
        onClose={() => openHelpFinderDialog(false)}
      />
      <Snackbar
        open={state.snackMessageOpen}
        autoHideDuration={3000}
        onClose={_closeSnackMessage}
        ContentProps={{
          'aria-describedby': 'snackbar-message',
        }}
        message={<span id="snackbar-message">{state.snackMessage}</span>}
      />
      {!!renderExportDialog &&
        exportDialogOpen &&
        renderExportDialog({
          onClose: () => openExportDialog(false),
          onChangeSubscription: () => {
            openExportDialog(false);
            openSubscriptionDialog(true);
          },
          project: state.currentProject,
        })}
      {!!renderCreateDialog &&
        state.createDialogOpen &&
        renderCreateDialog({
          open: state.createDialogOpen,
          onClose: () => openCreateDialog(false),
          onOpen: (storageProvider, fileMetadata) => {
            setState(state => ({ ...state, createDialogOpen: false })).then(
              state => {
                // eslint-disable-next-line
                getStorageProviderOperations(storageProvider)
                  .then(storageProviderOperations =>
                    openFromFileMetadata(fileMetadata)
                  )
                  .then(state => {
                    if (state)
                      openSceneOrProjectManager({
                        currentProject: state.currentProject,
                        editorTabs: state.editorTabs,
                      });
                  });
              }
            );
          },
          onCreate: (project, storageProvider, fileMetadata) => {
            setState(state => ({ ...state, createDialogOpen: false })).then(
              state => {
                // eslint-disable-next-line
                getStorageProviderOperations(storageProvider)
                  .then(storageProviderOperations =>
                    loadFromProject(project, fileMetadata)
                  )
                  .then(state =>
                    openSceneOrProjectManager({
                      currentProject: state.currentProject,
                      editorTabs: state.editorTabs,
                    })
                  );
              }
            );
          },
        })}
      {!!introDialog &&
        introDialogOpen &&
        React.cloneElement(introDialog, {
          open: true,
          onClose: () => openIntroDialog(false),
        })}
      {!!currentProject && platformSpecificAssetsDialogOpen && (
        <PlatformSpecificAssetsDialog
          project={currentProject}
          open
          onApply={() => openPlatformSpecificAssetsDialog(false)}
          onClose={() => openPlatformSpecificAssetsDialog(false)}
          resourceSources={resourceSources}
          onChooseResource={onChooseResource}
          resourceExternalEditors={resourceExternalEditors}
        />
      )}
      {!!renderPreviewLauncher &&
        renderPreviewLauncher(
          {
            onExport: () => openExportDialog(true),
            onChangeSubscription: () => openSubscriptionDialog(true),
          },
          (previewLauncher: ?PreviewLauncherInterface) => {
            _previewLauncher.current = previewLauncher;
          }
        )}
      {resourceSources.map(
        (resourceSource, index): React.Node => {
          const Component = resourceSource.component;
          return (
            <Component
              key={resourceSource.name}
              ref={dialog =>
                (_resourceSourceDialogs.current[resourceSource.name] = dialog)
              }
              i18n={i18n}
              getLastUsedPath={preferences.getLastUsedPath}
              setLastUsedPath={preferences.setLastUsedPath}
            />
          );
        }
      )}
      {profileDialogOpen && (
        <ProfileDialog
          open
          onClose={() => openProfileDialog(false)}
          onChangeSubscription={() => openSubscriptionDialog(true)}
        />
      )}
      {subscriptionDialogOpen && (
        <SubscriptionDialog
          onClose={() => {
            openSubscriptionDialog(false);
          }}
          open
        />
      )}
      {preferencesDialogOpen && (
        <PreferencesDialog onClose={() => openPreferencesDialog(false)} />
      )}
      {languageDialogOpen && (
        <LanguageDialog
          open
          onClose={languageChanged => {
            openLanguageDialog(false);
            if (languageChanged) {
              _languageDidChange();
            }
          }}
        />
      )}
      {aboutDialogOpen && (
        <AboutDialog
          open
          onClose={() => openAboutDialog(false)}
          updateStatus={updateStatus}
        />
      )}
      {state.openFromStorageProviderDialogOpen && (
        <OpenFromStorageProviderDialog
          onClose={() => openOpenFromStorageProviderDialog(false)}
          storageProviders={props.storageProviders}
          onChooseProvider={storageProvider => {
            openOpenFromStorageProviderDialog(false);
            props.getStorageProviderOperations(storageProvider).then(() => {
              chooseProjectWithStorageProviderPicker();
            });
          }}
          onCreateNewProject={() => {
            openOpenFromStorageProviderDialog(false);
            openCreateDialog(true);
          }}
        />
      )}
      {state.saveToStorageProviderDialogOpen && (
        <SaveToStorageProviderDialog
          onClose={() => openSaveToStorageProviderDialog(false)}
          storageProviders={props.storageProviders}
          onChooseProvider={storageProvider => {
            openSaveToStorageProviderDialog(false);
            props.getStorageProviderOperations(storageProvider).then(() => {
              saveProjectAsWithStorageProvider();
            });
          }}
        />
      )}
      {state.openConfirmDialogOpen && (
        <OpenConfirmDialog
          onClose={() => {
            _openOpenConfirmDialog(false);
          }}
          onConfirm={() => {
            _openOpenConfirmDialog(false);
            _openInitialFileMetadata(/* isAfterUserInteraction= */ true);
          }}
        />
      )}
      <CloseConfirmDialog
        shouldPrompt={!!state.currentProject}
        i18n={props.i18n}
        language={props.i18n.language}
        hasUnsavedChanges={
          !!props.unsavedChanges && props.unsavedChanges.hasUnsavedChanges
        }
      />
      <ChangelogDialogContainer />
      {state.gdjsDevelopmentWatcherEnabled &&
        renderGDJSDevelopmentWatcher &&
        renderGDJSDevelopmentWatcher()}
    </div>
  );
};

export default MainFrame;
