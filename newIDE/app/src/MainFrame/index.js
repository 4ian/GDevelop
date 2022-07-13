// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import './MainFrame.css';
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import HomeIcon from '../UI/CustomSvgIcons/Home';
import Toolbar, { type ToolbarInterface } from './Toolbar';
import ProjectTitlebar from './ProjectTitlebar';
import PreferencesDialog from './Preferences/PreferencesDialog';
import AboutDialog from './AboutDialog';
import ProjectManager from '../ProjectManager';
import PlatformSpecificAssetsDialog from '../PlatformSpecificAssetsEditor/PlatformSpecificAssetsDialog';
import LoaderModal from '../UI/LoaderModal';
import DrawerTopBar from '../UI/DrawerTopBar';
import CloseConfirmDialog from '../UI/CloseConfirmDialog';
import ProfileDialog from '../Profile/ProfileDialog';
import Window from '../Utils/Window';
import { showErrorBox } from '../UI/Messages/MessageBox';
import { TabContentContainer } from '../UI/ClosableTabs';
import { DraggableClosableTabs } from './EditorTabs/DraggableEditorTabs';
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
  moveTabToTheRightOfHoveredTab,
} from './EditorTabs/EditorTabsHandler';
import { timePromise } from '../Utils/TimeFunction';
import HelpFinder from '../HelpFinder';
import { renderDebuggerEditorContainer } from './EditorContainers/DebuggerEditorContainer';
import { renderEventsEditorContainer } from './EditorContainers/EventsEditorContainer';
import { renderExternalEventsEditorContainer } from './EditorContainers/ExternalEventsEditorContainer';
import { renderSceneEditorContainer } from './EditorContainers/SceneEditorContainer';
import { renderExternalLayoutEditorContainer } from './EditorContainers/ExternalLayoutEditorContainer';
import { renderEventsFunctionsExtensionEditorContainer } from './EditorContainers/EventsFunctionsExtensionEditorContainer';
import { renderHomePageContainer } from './EditorContainers/HomePage';
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
  type ChooseResourceOptions,
} from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import { type JsExtensionsLoader } from '../JsExtensionsLoader';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import {
  getUpdateNotificationTitle,
  getUpdateNotificationBody,
  type UpdateStatus,
} from './UpdaterTools';
import { showWarningBox } from '../UI/Messages/MessageBox';
import EmptyMessage from '../UI/EmptyMessage';
import ChangelogDialogContainer from './Changelog/ChangelogDialogContainer';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { getNotNullTranslationFunction } from '../Utils/i18n/getTranslationFunction';
import { type I18n } from '@lingui/core';
import { t } from '@lingui/macro';
import LanguageDialog from './Preferences/LanguageDialog';
import PreferencesContext from './Preferences/PreferencesContext';
import { getFunctionNameFromType } from '../EventsFunctionsExtensionsLoader';
import { type ExportDialogWithoutExportsProps } from '../Export/ExportDialog';
import { type CreateProjectDialogWithComponentsProps } from '../ProjectCreation/CreateProjectDialog';
import {
  type OnCreateFromExampleShortHeaderFunction,
  type OnCreateBlankFunction,
} from '../ProjectCreation/CreateProjectDialog';
import { getStartupTimesSummary } from '../Utils/StartupTimes';
import {
  type StorageProvider,
  type StorageProviderOperations,
  type FileMetadata,
  type FileMetadataAndStorageProviderName,
} from '../ProjectsStorage';
import OpenFromStorageProviderDialog from '../ProjectsStorage/OpenFromStorageProviderDialog';
import SaveToStorageProviderDialog from '../ProjectsStorage/SaveToStorageProviderDialog';
import { useOpenConfirmDialog } from '../ProjectsStorage/OpenConfirmDialog';
import verifyProjectContent from '../ProjectsStorage/ProjectContentChecker';
import UnsavedChangesContext from './UnsavedChangesContext';
import { type MainMenuProps } from './MainMenu.flow';
import useForceUpdate from '../Utils/UseForceUpdate';
import useStateWithCallback from '../Utils/UseSetStateWithCallback';
import { useKeyboardShortcuts } from '../KeyboardShortcuts';
import useMainFrameCommands from './MainFrameCommands';
import CommandPalette, {
  type CommandPaletteInterface,
} from '../CommandPalette/CommandPalette';
import CommandsContextScopedProvider from '../CommandPalette/CommandsScopedContext';
import { isExtensionNameTaken } from '../ProjectManager/EventFunctionExtensionNameVerifier';
import {
  type PreviewState,
  usePreviewDebuggerServerWatcher,
} from './PreviewState';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import HotReloadLogsDialog from '../HotReload/HotReloadLogsDialog';
import { useDiscordRichPresence } from '../Utils/UpdateDiscordRichPresence';
import { useResourceFetcher } from '../ProjectsStorage/ResourceFetcher';
import { delay } from '../Utils/Delay';
import { type ExtensionShortHeader } from '../Utils/GDevelopServices/Extension';
import { findAndLogProjectPreviewErrors } from '../Utils/ProjectErrorsChecker';
import { renameResourcesInProject } from '../ResourcesList/ResourceUtils';
import { NewResourceDialog } from '../ResourcesList/NewResourceDialog';
import {
  addCreateBadgePreHookIfNotClaimed,
  TRIVIAL_FIRST_DEBUG,
  TRIVIAL_FIRST_PREVIEW,
} from '../Utils/GDevelopServices/Badge';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import OnboardingDialog from './Onboarding/OnboardingDialog';
import LeaderboardProvider from '../Leaderboard/LeaderboardProvider';
import { sendEventsExtractedAsFunction } from '../Utils/Analytics/EventSender';
import optionalRequire from '../Utils/OptionalRequire';
import { isMobile } from '../Utils/Platform';
import { getProgramOpeningCount } from '../Utils/Analytics/LocalStats';
import { useLeaderboardReplacer } from '../Leaderboard/useLeaderboardReplacer';
const electron = optionalRequire('electron');
const isDev = Window.isDev();

const GD_STARTUP_TIMES = global.GD_STARTUP_TIMES || [];

const gd: libGDevelop = global.gd;

const styles = {
  drawerContent: {
    width: 320,
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
};

const findStorageProviderFor = (
  i18n: I18n,
  storageProviders: Array<StorageProvider>,
  fileMetadataAndStorageProviderName: FileMetadataAndStorageProviderName
): ?StorageProvider => {
  const { storageProviderName } = fileMetadataAndStorageProviderName;
  const storageProvider = storageProviders.filter(
    storageProvider => storageProvider.internalName === storageProviderName
  )[0];

  if (!storageProvider) {
    showErrorBox({
      message: i18n._(
        t`Unable to open the project because this provider is unknown: ${storageProviderName}. Try to open the project again from another location.`
      ),
      rawError: new Error(
        `Can't find storage provider called "${storageProviderName}"`
      ),
      errorId: 'unknown-storage-provider',
    });
    return;
  }

  return storageProvider;
};

export type State = {|
  createDialogOpen: boolean,
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

type LaunchPreviewOptions = {
  networkPreview?: boolean,
  hotReload?: boolean,
  projectDataOnlyExport?: boolean,
  fullLoadingScreen?: boolean,
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
    ?{
      storageProvider: StorageProvider,
      doNotKeepForNextOperations?: boolean,
    }
  ) => StorageProviderOperations,
  getStorageProvider: () => StorageProvider,
  resourceSources: Array<ResourceSource>,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  requestUpdate?: () => void,
  renderExportDialog?: ExportDialogWithoutExportsProps => React.Node,
  renderCreateDialog?: CreateProjectDialogWithComponentsProps => React.Node,
  onCreateFromExampleShortHeader: OnCreateFromExampleShortHeaderFunction,
  onCreateBlank: OnCreateBlankFunction,
  renderGDJSDevelopmentWatcher?: ?() => React.Node,
  extensionsLoader?: JsExtensionsLoader,
  initialFileMetadataToOpen: ?FileMetadata,
  i18n: I18n,
};

const MainFrame = (props: Props) => {
  const [state, setState]: [
    State,
    ((State => State) | State) => Promise<State>,
  ] = useStateWithCallback(
    ({
      createDialogOpen: false,
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
  const [customWindowTitle, setCustomWindowTitle] = React.useState<?string>(
    null
  );
  const toolbar = React.useRef<?ToolbarInterface>(null);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { loginState } = authenticatedUser;

  const [
    chooseResourceOptions,
    setChooseResourceOptions,
  ] = React.useState<?ChooseResourceOptions>(null);
  const [onResourceChosen, setOnResourceChosen] = React.useState<?(
    Array<gdResource>
  ) => void>(null);
  const _previewLauncher = React.useRef((null: ?PreviewLauncherInterface));
  const forceUpdate = useForceUpdate();
  const [isLoadingProject, setIsLoadingProject] = React.useState<boolean>(
    false
  );
  const [isSavingProject, setIsSavingProject] = React.useState<boolean>(false);
  const [projectManagerOpen, openProjectManager] = React.useState<boolean>(
    false
  );
  const [introDialogOpen, openIntroDialog] = React.useState<boolean>(false);
  const [languageDialogOpen, openLanguageDialog] = React.useState<boolean>(
    false
  );
  const [onboardingDialogOpen, openOnboardingDialog] = React.useState<boolean>(
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
  const [profileDialogInitialTab, setProfileDialogInitialTab] = React.useState<
    'profile' | 'games-dashboard'
  >('profile');
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
  const commandPaletteRef = React.useRef((null: ?CommandPaletteInterface));
  const eventsFunctionsExtensionsContext = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const previewDebuggerServer =
    _previewLauncher.current &&
    _previewLauncher.current.getPreviewDebuggerServer();
  const {
    previewDebuggerIds,
    hotReloadLogs,
    clearHotReloadLogs,
  } = usePreviewDebuggerServerWatcher(previewDebuggerServer);
  const hasPreviewsRunning = !!previewDebuggerIds.length;
  const {
    ensureInteractionHappened,
    renderOpenConfirmDialog,
  } = useOpenConfirmDialog();
  const {
    ensureResourcesAreFetched,
    renderResourceFetcherDialog,
  } = useResourceFetcher();
  const {
    findLeaderboardsToReplace,
    renderLeaderboardReplacerDialog,
  } = useLeaderboardReplacer();
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const unsavedChanges = React.useContext(UnsavedChangesContext);
  const isInitialProjectLoadingDone = React.useRef<boolean>(false);
  const [
    fileMetadataOpeningProgress,
    setFileMetadataOpeningProgress,
  ] = React.useState<number>(0);
  const [
    fileMetadataOpeningMessage,
    setFileMetadataOpeningMessage,
  ] = React.useState<?MessageDescriptor>(null);

  // This is just for testing, to check if we're getting the right state
  // and gives us an idea about the number of re-renders.
  // React.useEffect(() => {
  //   console.log(state);
  // });

  const {
    currentProject,
    currentFileMetadata,
    updateStatus,
    eventsFunctionsExtensionsError,
  } = state;
  const {
    renderExportDialog,
    renderCreateDialog,
    onCreateFromExampleShortHeader,
    onCreateBlank,
    resourceSources,
    renderPreviewLauncher,
    resourceExternalEditors,
    getStorageProviderOperations,
    getStorageProvider,
    integratedEditor,
    initialFileMetadataToOpen,
    introDialog,
    i18n,
    renderGDJSDevelopmentWatcher,
    renderMainMenu,
  } = props;

  // Open onboarding modal if this is the first time the user opens the web app.
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!electron && getProgramOpeningCount() <= 1 && !isMobile() && !isDev) {
        openOnboardingDialog(true);
      }
    }, 3000); // Timeout to avoid showing the dialog while the app is still loading.
    return () => clearTimeout(timeoutId);
  }, []);

  React.useEffect(
    () => {
      if (!integratedEditor) openHomePage();
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
        .then(async state => {
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

  React.useEffect(
    () => {
      if (isInitialProjectLoadingDone.current) return;
      const autoLoadProject = async () => {
        const {
          getAutoOpenMostRecentProject,
          getRecentProjectFiles,
          hadProjectOpenedDuringLastSession,
        } = preferences;

        if (initialFileMetadataToOpen) {
          // Open the initial file metadata (i.e: the file that was passed
          // as argument and recognized by a storage provider). Note that the storage
          // provider is assumed to be already set to the proper one.
          const storageProviderOperations = getStorageProviderOperations();
          const proceed = await ensureInteractionHappened(
            storageProviderOperations
          );
          if (proceed) openInitialFileMetadata();
        } else if (
          getAutoOpenMostRecentProject() &&
          hadProjectOpenedDuringLastSession() &&
          getRecentProjectFiles()[0]
        ) {
          // Re-open the last opened project, if any and if asked to.
          const fileMetadataAndStorageProviderName = getRecentProjectFiles()[0];
          const storageProvider = findStorageProviderFor(
            i18n,
            props.storageProviders,
            fileMetadataAndStorageProviderName
          );
          if (!storageProvider) return;
          if (storageProvider.needUserAuthentication && loginState !== 'done')
            return;

          const storageProviderOperations = getStorageProviderOperations({
            storageProvider,
          });
          const proceed = await ensureInteractionHappened(
            storageProviderOperations
          );
          if (proceed)
            openFromFileMetadataWithStorageProvider(
              fileMetadataAndStorageProviderName
            );
        } else {
          // Open the intro dialog if not opening any project.
          if (introDialog) openIntroDialog(true);
        }
        isInitialProjectLoadingDone.current = true;
      };
      autoLoadProject();
    },
    // eslint-disable-next-line
    [loginState]
  );

  const openProfileDialogWithTab = (
    profileDialogInitialTab: 'profile' | 'games-dashboard'
  ) => {
    setProfileDialogInitialTab(profileDialogInitialTab);
    openProfileDialog(true);
  };

  const _showSnackMessage = React.useCallback(
    (snackMessage: string) => {
      setState(state => ({
        ...state,
        snackMessage,
        snackMessageOpen: true,
      }));
    },
    [setState]
  );
  const _closeSnackMessage = React.useCallback(
    () => {
      setState(state => ({
        ...state,
        snackMessageOpen: false,
      }));
    },
    [setState]
  );

  const openInitialFileMetadata = async () => {
    if (!initialFileMetadataToOpen) return;

    // We use the current storage provider, as it's supposed to be able to open
    // the initial file metadata. Indeed, it's the responsibility of the `ProjectStorageProviders`
    // to set the initial storage provider if an initial file metadata is set.
    const state = await openFromFileMetadata(initialFileMetadataToOpen);
    if (state)
      openSceneOrProjectManager({
        currentProject: state.currentProject,
        editorTabs: state.editorTabs,
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

  const updateWindowTitle = React.useCallback(
    () => {
      const storageProvider = getStorageProvider();
      if (storageProvider.internalName === 'Cloud' && !!currentProject) {
        setCustomWindowTitle(currentProject.getName());
      } else {
        setCustomWindowTitle(null);
      }
    },
    [currentProject, getStorageProvider]
  );

  React.useEffect(
    () => {
      updateToolbar();
    },
    [updateToolbar]
  );

  React.useEffect(
    () => {
      updateWindowTitle();
    },
    [updateWindowTitle]
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

  useDiscordRichPresence(currentProject);

  const closeProject = React.useCallback(
    (): Promise<void> => {
      preferences.setHasProjectOpened(false);
      setPreviewState(initialPreviewState);
      return setState(state => {
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
          editorTabs: closeProjectTabs(state.editorTabs, currentProject),
        };
      }).then(() => {});
    },
    [currentProject, eventsFunctionsExtensionsState, preferences, setState]
  );

  const loadFromProject = React.useCallback(
    async (project: gdProject, fileMetadata: ?FileMetadata): Promise<State> => {
      if (fileMetadata) {
        const storageProvider = getStorageProvider();
        const storageProviderOperations = getStorageProviderOperations({
          storageProvider,
        });
        const { onSaveProject } = storageProviderOperations;

        // Only save the project in the recent files if the storage provider
        // is able to save. Otherwise, it means nothing to consider this as
        // a recent file: we must wait for the user to save in a "real" storage
        // (like locally or on Google Drive).
        if (onSaveProject) {
          preferences.insertRecentProjectFile({
            fileMetadata,
            storageProviderName: storageProvider.internalName,
          });
        }
      }

      await closeProject();

      // Make sure that the ResourcesLoader cache is emptied, so that
      // the URL to a resource with a name in the old project is not re-used
      // for another resource with the same name in the new project.
      ResourcesLoader.burstAllUrlsCache();
      // TODO: Pixi cache should also be burst

      preferences.setHasProjectOpened(true);

      const state = await setState(state => ({
        ...state,
        currentProject: project,
        currentFileMetadata: fileMetadata,
        createDialogOpen: false,
      }));

      // Load all the EventsFunctionsExtension when the game is loaded. If they are modified,
      // their editor will take care of reloading them.
      eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
        project
      );

      if (fileMetadata) {
        project.setProjectFile(fileMetadata.fileIdentifier);
      }

      // Fetch the resources if needed, for example if opening on the desktop app
      // a project made on the web-app.
      const { someResourcesWereFetched } = await ensureResourcesAreFetched(
        project
      );
      if (someResourcesWereFetched) {
        if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
      }

      return state;
    },
    [
      unsavedChanges,
      setState,
      closeProject,
      preferences,
      eventsFunctionsExtensionsState,
      getStorageProvider,
      getStorageProviderOperations,
      ensureResourcesAreFetched,
    ]
  );

  const loadFromSerializedProject = React.useCallback(
    (
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
    },
    [loadFromProject]
  );

  const onFileOpeningProgress = (
    progress: number,
    message: ?MessageDescriptor
  ) => {
    setFileMetadataOpeningProgress(progress);
    setFileMetadataOpeningMessage(message);
  };

  const openFromFileMetadata = React.useCallback(
    (fileMetadata: FileMetadata): Promise<?State> => {
      const storageProviderOperations = getStorageProviderOperations();

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
      return delay(150)
        .then(() => checkForAutosave())
        .then(fileMetadata => onOpen(fileMetadata, onFileOpeningProgress))
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
            setIsLoadingProject(false);
            onFileOpeningProgress(0, null);
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
          showErrorBox({
            message: [
              i18n._(t`Unable to open the project.`),
              i18n._(errorMessage),
            ].join('\n'),
            errorId: 'project-open-error',
            rawError: error,
          });
          setIsLoadingProject(false);
          onFileOpeningProgress(0, null);
          return Promise.reject(error);
        });
    },
    [i18n, getStorageProviderOperations, loadFromSerializedProject]
  );

  const closeApp = React.useCallback((): void => {
    return Window.quit();
  }, []);

  const toggleProjectManager = React.useCallback(
    () => {
      if (toolbar.current)
        openProjectManager(projectManagerOpen => !projectManagerOpen);
    },
    [openProjectManager]
  );

  const setEditorToolbar = (editorToolbar: any, isCurrentTab = true) => {
    if (!toolbar.current || !isCurrentTab) return;

    toolbar.current.setEditorToolbar(editorToolbar);
  };

  const onInstallExtension = (extensionShortHeader: ExtensionShortHeader) => {
    const { currentProject } = state;
    if (!currentProject) return;

    // Close the extension tab before updating/reinstalling the extension.
    const eventsFunctionsExtensionName = extensionShortHeader.name;

    if (
      currentProject.hasEventsFunctionsExtensionNamed(
        eventsFunctionsExtensionName
      )
    ) {
      const eventsFunctionsExtension = currentProject.getEventsFunctionsExtension(
        eventsFunctionsExtensionName
      );

      setState(state => ({
        ...state,
        editorTabs: closeEventsFunctionsExtensionTabs(
          state.editorTabs,
          eventsFunctionsExtension
        ),
      }));
    }
  };

  const deleteLayout = (layout: gdLayout) => {
    const { currentProject } = state;
    const { i18n } = props;
    if (!currentProject) return;

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
      if (currentProject.getFirstLayout() === layout.getName())
        currentProject.setFirstLayout('');
      currentProject.removeLayout(layout.getName());
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
    eventsFunctionsExtension: gdEventsFunctionsExtension
  ) => {
    const { currentProject } = state;
    const { i18n } = props;
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
        eventsFunctionsExtension
      ),
    })).then(state => {
      // Unload the Platform extension that was generated from the events
      // functions extension.
      const extensionName = eventsFunctionsExtension.getName();
      eventsFunctionsExtensionsState.unloadProjectEventsFunctionsExtension(
        currentProject,
        extensionName
      );

      currentProject.removeEventsFunctionsExtension(extensionName);
      _onProjectItemModified();

      // Reload extensions to make sure any extension that would have been relying
      // on the unloaded extension is updated.
      eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions(
        currentProject
      );
    });
  };

  const renameLayout = (oldName: string, newName: string) => {
    const { currentProject } = state;
    const { i18n } = props;
    if (!currentProject) return;

    if (!currentProject.hasLayoutNamed(oldName) || newName === oldName) return;

    if (newName === '') {
      showWarningBox(
        i18n._(t`This name cannot be empty, please enter a new name.`),
        { delayToNextTick: true }
      );
      return;
    }

    if (currentProject.hasLayoutNamed(newName)) {
      showWarningBox(i18n._(t`Another scene with this name already exists.`), {
        delayToNextTick: true,
      });
      return;
    }

    const layout = currentProject.getLayout(oldName);
    const shouldChangeProjectFirstLayout =
      oldName === currentProject.getFirstLayout();
    setState(state => ({
      ...state,
      editorTabs: closeLayoutTabs(state.editorTabs, layout),
    })).then(state => {
      layout.setName(newName);
      if (shouldChangeProjectFirstLayout)
        currentProject.setFirstLayout(newName);
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
        i18n._(t`This name cannot be empty, please enter a new name.`),
        { delayToNextTick: true }
      );
      return;
    }

    if (currentProject.hasExternalLayoutNamed(newName)) {
      showWarningBox(
        i18n._(t`Another external layout with this name already exists.`),
        { delayToNextTick: true }
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
        i18n._(t`This name cannot be empty, please enter a new name.`),
        { delayToNextTick: true }
      );
      return;
    }

    if (currentProject.hasExternalEventsNamed(newName)) {
      showWarningBox(
        i18n._(t`Other external events with this name already exist.`),
        { delayToNextTick: true }
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
    if (!currentProject) return;

    if (
      !currentProject.hasEventsFunctionsExtensionNamed(oldName) ||
      newName === oldName
    )
      return;

    if (newName === '') {
      showWarningBox(
        i18n._(t`This name cannot be empty, please enter a new name.`),
        { delayToNextTick: true }
      );
      return;
    }

    if (isExtensionNameTaken(newName, currentProject)) {
      showWarningBox(
        i18n._(
          t`Another extension with this name already exists (or you used a reserved extension name). Please choose another name.`
        ),
        { delayToNextTick: true }
      );
      return;
    }

    if (!gd.Project.validateName(newName)) {
      showWarningBox(
        i18n._(
          t`This name is invalid. Only use alphanumeric characters (0-9, a-z) and underscores. Digits are not allowed as the first character.`
        ),
        { delayToNextTick: true }
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
      eventsFunctionsExtensionsState.unloadProjectEventsFunctionsExtension(
        currentProject,
        oldName
      );
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

  const autosaveProjectIfNeeded = React.useCallback(
    async () => {
      if (!currentProject) return;

      const storageProviderOperations = getStorageProviderOperations();
      if (
        preferences.values.autosaveOnPreview &&
        storageProviderOperations.onAutoSaveProject &&
        currentFileMetadata
      ) {
        try {
          await storageProviderOperations.onAutoSaveProject(
            currentProject,
            currentFileMetadata
          );
        } catch (err) {
          console.error('Error while auto-saving the project: ', err);
          _showSnackMessage(
            i18n._(
              t`There was an error while making an auto-save of the project. Verify that you have permissions to write in the project folder.`
            )
          );
        }
      }
    },
    [
      i18n,
      _showSnackMessage,
      currentProject,
      currentFileMetadata,
      getStorageProviderOperations,
      preferences.values.autosaveOnPreview,
    ]
  );

  const _launchPreview = React.useCallback(
    ({
      networkPreview,
      hotReload,
      projectDataOnlyExport,
      fullLoadingScreen,
    }: LaunchPreviewOptions) => {
      if (!currentProject) return;
      if (currentProject.getLayoutsCount() === 0) return;

      const previewLauncher = _previewLauncher.current;
      if (!previewLauncher) return;

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

      autosaveProjectIfNeeded();

      // Note that in the future, this kind of checks could be done
      // and stored in a "diagnostic report", rather than hiding errors
      // from the user.
      findAndLogProjectPreviewErrors(currentProject);

      eventsFunctionsExtensionsState
        .ensureLoadFinished()
        .then(() =>
          previewLauncher.launchPreview({
            project: currentProject,
            layout,
            externalLayout,
            networkPreview: !!networkPreview,
            hotReload: !!hotReload,
            projectDataOnlyExport: !!projectDataOnlyExport,
            fullLoadingScreen: !!fullLoadingScreen,
            getIsMenuBarHiddenInPreview:
              preferences.getIsMenuBarHiddenInPreview,
            getIsAlwaysOnTopInPreview: preferences.getIsAlwaysOnTopInPreview,
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
    },
    [
      autosaveProjectIfNeeded,
      currentProject,
      eventsFunctionsExtensionsState,
      previewState,
      state.editorTabs,
      preferences.getIsMenuBarHiddenInPreview,
      preferences.getIsAlwaysOnTopInPreview,
    ]
  );

  const launchPreview = addCreateBadgePreHookIfNotClaimed(
    authenticatedUser,
    TRIVIAL_FIRST_PREVIEW,
    _launchPreview
  );

  const launchNewPreview = React.useCallback(
    () => launchPreview({ networkPreview: false }),
    [launchPreview]
  );

  const launchHotReloadPreview = React.useCallback(
    () => launchPreview({ networkPreview: false, hotReload: true }),
    [launchPreview]
  );

  const launchNetworkPreview = React.useCallback(
    () => launchPreview({ networkPreview: true, hotReload: false }),
    [launchPreview]
  );

  const hotReloadPreviewButtonProps: HotReloadPreviewButtonProps = React.useMemo(
    () => ({
      hasPreviewsRunning,
      launchProjectWithLoadingScreenPreview: () =>
        launchPreview({ fullLoadingScreen: true }),
      launchProjectDataOnlyPreview: () =>
        launchPreview({ hotReload: true, projectDataOnlyExport: true }),
    }),
    [hasPreviewsRunning, launchPreview]
  );

  const openLayout = React.useCallback(
    (
      name: string,
      {
        openEventsEditor = true,
        openSceneEditor = true,
      }: { openEventsEditor: boolean, openSceneEditor: boolean } = {},
      editorTabs = state.editorTabs
    ) => {
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
      onFileOpeningProgress(0, null);
      openProjectManager(false);
    },
    [i18n, setState, state.editorTabs]
  );

  const openExternalEvents = React.useCallback(
    (name: string) => {
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
    },
    [setState]
  );

  const openExternalLayout = React.useCallback(
    (name: string) => {
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
    },
    [setState, openProjectManager]
  );

  const openEventsFunctionsExtension = React.useCallback(
    (
      name: string,
      initiallyFocusedFunctionName?: string,
      initiallyFocusedBehaviorName?: ?string
    ) => {
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
    },
    [setState, openProjectManager, i18n]
  );

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

  const openHomePage = React.useCallback(
    () => {
      setState(state => ({
        ...state,
        editorTabs: openEditorTab(state.editorTabs, {
          icon: <HomeIcon titleAccess="Home" fontSize="small" />,
          label: i18n._(t`Home`),
          projectItemName: null,
          renderEditorContainer: renderHomePageContainer,
          key: 'start page',
          closable: false,
        }),
      }));
    },
    [setState, i18n]
  );

  const _openDebugger = React.useCallback(
    () => {
      setState(state => ({
        ...state,
        editorTabs: openEditorTab(state.editorTabs, {
          label: i18n._(t`Debugger`),
          projectItemName: null,
          renderEditorContainer: renderDebuggerEditorContainer,
          key: 'debugger',
        }),
      }));
    },
    [i18n, setState]
  );

  const openDebugger = addCreateBadgePreHookIfNotClaimed(
    authenticatedUser,
    TRIVIAL_FIRST_DEBUG,
    _openDebugger
  );

  const launchDebuggerAndPreview = React.useCallback(
    () => {
      openDebugger();
      launchHotReloadPreview();
    },
    [openDebugger, launchHotReloadPreview]
  );

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
    if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
    forceUpdate();
  };

  const onCreateEventsFunction = (
    extensionName: string,
    eventsFunction: gdEventsFunction,
    editorIdentifier:
      | 'scene-events-editor'
      | 'extension-events-editor'
      | 'external-events-editor'
  ) => {
    const { currentProject } = state;
    if (!currentProject) return;

    sendEventsExtractedAsFunction({
      step: 'end',
      parentEditor: editorIdentifier,
    });

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

  const openCreateProjectDialog = React.useCallback(
    (open: boolean = true) => {
      setState(state => ({ ...state, createDialogOpen: open }));
    },
    [setState]
  );
  const closeCreateDialog = () => {
    setState(state => ({ ...state, createDialogOpen: false }));
  };

  const openOpenFromStorageProviderDialog = React.useCallback(
    (open: boolean = true) => {
      setState(state => ({
        ...state,
        openFromStorageProviderDialogOpen: open,
      }));
    },
    [setState]
  );

  const openSceneOrProjectManager = React.useCallback(
    (newState: {|
      currentProject: ?gdProject,
      editorTabs: EditorTabsState,
    |}) => {
      const { currentProject, editorTabs } = newState;
      if (!currentProject) return;

      if (currentProject.getLayoutsCount() <= 1) {
        if (currentProject.getLayoutsCount() === 0)
          currentProject.insertNewLayout(i18n._(t`Untitled scene`), 0);

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
          onFileOpeningProgress(0, null);
          openProjectManager(true);
        });
      }
    },
    [openLayout, setState, i18n]
  );

  const chooseProjectWithStorageProviderPicker = React.useCallback(
    () => {
      const storageProviderOperations = getStorageProviderOperations();

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
          showErrorBox({
            message: [
              i18n._(t`Unable to open the project.`),
              i18n._(errorMessage),
            ].join('\n'),
            errorId: 'project-open-with-picker-error',
            rawError: error,
          });
        });
    },
    [
      i18n,
      getStorageProviderOperations,
      openFromFileMetadata,
      openSceneOrProjectManager,
    ]
  );

  const chooseProject = React.useCallback(
    () => {
      if (
        props.storageProviders.filter(
          ({ hiddenInOpenDialog }) => !hiddenInOpenDialog
        ).length > 1
      ) {
        openOpenFromStorageProviderDialog();
      } else {
        chooseProjectWithStorageProviderPicker();
      }
    },
    [
      props.storageProviders,
      openOpenFromStorageProviderDialog,
      chooseProjectWithStorageProviderPicker,
    ]
  );

  const openFromFileMetadataWithStorageProvider = React.useCallback(
    (
      fileMetadataAndStorageProviderName: FileMetadataAndStorageProviderName
    ) => {
      if (unsavedChanges && unsavedChanges.hasUnsavedChanges) {
        const answer = Window.showConfirmDialog(
          i18n._(
            t`Open a new project? Any changes that have not been saved will be lost.`
          )
        );
        if (!answer) return;
        unsavedChanges.sealUnsavedChanges();
      }

      const { fileMetadata } = fileMetadataAndStorageProviderName;
      const storageProvider = findStorageProviderFor(
        i18n,
        props.storageProviders,
        fileMetadataAndStorageProviderName
      );

      if (!storageProvider) return;

      getStorageProviderOperations({ storageProvider });
      openFromFileMetadata(fileMetadata)
        .then(state => {
          if (state)
            openSceneOrProjectManager({
              currentProject: state.currentProject,
              editorTabs: state.editorTabs,
            });
        })
        .catch(error => {
          /* Ignore error, it was already surfaced to the user. */
        });
    },
    [
      i18n,
      openFromFileMetadata,
      openSceneOrProjectManager,
      props.storageProviders,
      getStorageProviderOperations,
      unsavedChanges,
    ]
  );

  const openSaveToStorageProviderDialog = React.useCallback(
    (open: boolean = true) => {
      if (open) {
        // Ensure the project manager is closed as Google Drive storage provider
        // display a picker that does not play nice with material-ui's overlays.
        openProjectManager(false);
      }
      setState(state => ({ ...state, saveToStorageProviderDialogOpen: open }));
    },
    [setState]
  );

  const saveProjectAsWithStorageProvider = React.useCallback(
    (
      options: ?{
        context?: 'duplicateCurrentProject',
        storageProviderOperationsGetOptions?: {
          storageProvider: StorageProvider,
          doNotKeepForNextOperations?: boolean,
        },
      }
    ) => {
      if (!currentProject) return;

      saveUiSettings(state.editorTabs);

      const storageProviderOperations = getStorageProviderOperations(
        options ? options.storageProviderOperationsGetOptions : null
      );

      const { onSaveProjectAs } = storageProviderOperations;
      if (!onSaveProjectAs) {
        return;
      }

      // Protect against concurrent saves, which can trigger issues with the
      // file system.
      if (isSavingProject) {
        console.info('Project is already being saved, not triggering save.');
        return;
      }
      setIsSavingProject(true);

      onSaveProjectAs(currentProject, currentFileMetadata, {
        context: options ? options.context : undefined,
        onStartSaving: () => _showSnackMessage(i18n._(t`Saving...`)),
      })
        .then(
          ({ wasSaved, fileMetadata }) => {
            if (wasSaved) {
              if (unsavedChanges) unsavedChanges.sealUnsavedChanges();
              _showSnackMessage(i18n._(t`Project properly saved`));

              if (fileMetadata) {
                preferences.insertRecentProjectFile({
                  fileMetadata,
                  storageProviderName: getStorageProvider().internalName,
                });

                setState(state => ({
                  ...state,
                  currentFileMetadata: fileMetadata,
                }));
              }
            }
          },
          rawError => {
            showErrorBox({
              message: i18n._(
                t`Unable to save as the project! Please try again by choosing another location.`
              ),
              rawError,
              errorId: 'project-save-as-error',
            });
          }
        )
        .catch(() => {})
        .then(() => {
          setIsSavingProject(false);
          updateWindowTitle();
        });
    },
    [
      i18n,
      isSavingProject,
      currentProject,
      currentFileMetadata,
      getStorageProviderOperations,
      unsavedChanges,
      setState,
      state.editorTabs,
      _showSnackMessage,
      getStorageProvider,
      preferences,
      updateWindowTitle,
    ]
  );

  const saveProjectAs = React.useCallback(
    () => {
      if (!currentProject) return;

      const storageProviderOperations = getStorageProviderOperations();
      if (
        props.storageProviders.filter(
          ({ hiddenInSaveDialog }) => !hiddenInSaveDialog
        ).length > 1 ||
        !storageProviderOperations.onSaveProjectAs
      ) {
        openSaveToStorageProviderDialog();
      } else {
        saveProjectAsWithStorageProvider();
      }
    },
    [
      currentProject,
      getStorageProviderOperations,
      openSaveToStorageProviderDialog,
      props.storageProviders,
      saveProjectAsWithStorageProvider,
    ]
  );

  const saveProject = React.useCallback(
    async () => {
      if (!currentProject) return;
      if (!currentFileMetadata) {
        return saveProjectAs();
      }

      const storageProviderOperations = getStorageProviderOperations();
      const { onSaveProject } = storageProviderOperations;
      if (!onSaveProject) {
        return saveProjectAs();
      }

      saveUiSettings(state.editorTabs);
      _showSnackMessage(i18n._(t`Saving...`));

      // Protect against concurrent saves, which can trigger issues with the
      // file system.
      if (isSavingProject) {
        console.info('Project is already being saved, not triggering save.');
        return;
      }
      setIsSavingProject(true);

      try {
        const saveStartTime = performance.now();
        const { wasSaved, fileMetadata } = await onSaveProject(
          currentProject,
          currentFileMetadata
        );

        if (wasSaved) {
          console.info(
            `Project saved in ${performance.now() - saveStartTime}ms.`
          );
          preferences.insertRecentProjectFile({
            fileMetadata,
            storageProviderName: getStorageProvider().internalName,
          });

          setState(state => ({
            ...state,
            currentFileMetadata: fileMetadata,
          }));
          if (unsavedChanges) unsavedChanges.sealUnsavedChanges();
          _showSnackMessage(i18n._(t`Project properly saved`));
        }
      } catch (rawError) {
        showErrorBox({
          message: i18n._(
            t`Unable to save as the project! Please try again by choosing another location.`
          ),
          rawError,
          errorId: 'project-save-error',
        });
      }

      setIsSavingProject(false);
    },
    [
      isSavingProject,
      currentProject,
      currentFileMetadata,
      getStorageProviderOperations,
      _showSnackMessage,
      i18n,
      unsavedChanges,
      saveProjectAs,
      state.editorTabs,
      getStorageProvider,
      preferences,
      setState,
    ]
  );

  const askToCloseProject = React.useCallback(
    (): Promise<void> => {
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
    },
    [currentProject, unsavedChanges, i18n, closeProject]
  );

  const _onChangeEditorTab = (value: number) => {
    setState(state => ({
      ...state,
      editorTabs: changeCurrentTab(state.editorTabs, value),
    })).then(state =>
      _onEditorTabActived(getCurrentTab(state.editorTabs), state)
    );
  };

  const _onEditorTabActived = (
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

  const onDropEditorTab = (fromIndex: number, toHoveredIndex: number) => {
    setState(state => {
      return {
        ...state,
        editorTabs: moveTabToTheRightOfHoveredTab(
          state.editorTabs,
          fromIndex,
          toHoveredIndex
        ),
      };
    });
  };

  const onChangeProjectName = async (newName: string): Promise<void> => {
    if (!currentProject || !currentFileMetadata) return;
    const storageProviderOperations = getStorageProviderOperations();
    if (storageProviderOperations.onChangeProjectProperty) {
      const wasSaved = await storageProviderOperations.onChangeProjectProperty(
        currentProject,
        currentFileMetadata,
        { name: newName }
      );
      if (wasSaved && unsavedChanges) unsavedChanges.sealUnsavedChanges();
      updateWindowTitle();
    }
  };

  const onChooseResource: ChooseResourceFunction = (
    options: ChooseResourceOptions
  ) => {
    return new Promise(resolve => {
      setChooseResourceOptions(options);
      const onResourceChosenSetter: () => (
        Promise<Array<gdResource>> | Array<gdResource>
      ) => void = () => resolve;
      setOnResourceChosen(onResourceChosenSetter);
    });
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

  const onOpenProjectAfterCreation = async ({
    project,
    storageProvider,
    fileMetadata,
    projectName,
    templateSlug,
    shouldCloseDialog,
  }: {|
    project?: gdProject,
    storageProvider: ?StorageProvider,
    fileMetadata: ?FileMetadata,
    projectName?: string,
    templateSlug?: string,
    shouldCloseDialog?: boolean,
  |}) => {
    if (shouldCloseDialog)
      await setState(state => ({ ...state, createDialogOpen: false }));

    let state: ?State;
    if (project) state = await loadFromProject(project, fileMetadata);
    else if (!!fileMetadata) {
      if (storageProvider) getStorageProviderOperations({ storageProvider });
      state = await openFromFileMetadata(fileMetadata);
    }

    if (!state) return;
    const { currentProject, editorTabs } = state;
    if (!currentProject) return;
    const oldProjectId = currentProject.getProjectUuid();
    currentProject.resetProjectUuid();

    currentProject.setVersion('1.0.0');
    currentProject.getAuthorIds().clear();
    currentProject.setAuthor('');
    if (templateSlug) currentProject.setTemplateSlug(templateSlug);
    if (projectName) currentProject.setName(projectName);

    findLeaderboardsToReplace(currentProject, oldProjectId);
    openSceneOrProjectManager({
      currentProject: currentProject,
      editorTabs: editorTabs,
    });

    const storageProviderOperations = getStorageProviderOperations(
      storageProvider ? { storageProvider } : null
    );

    const { onSaveProject } = storageProviderOperations;

    if (onSaveProject && fileMetadata) {
      try {
        const { wasSaved } = await onSaveProject(currentProject, fileMetadata);

        if (wasSaved) {
          if (unsavedChanges) unsavedChanges.sealUnsavedChanges();
        }
      } catch (rawError) {
        // Do not prevent creating the project.
        console.error("Couldn't save the project after creation.", rawError);
      }
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

  useKeyboardShortcuts(
    commandPaletteRef.current
      ? commandPaletteRef.current.launchCommand
      : () => {}
  );

  const onUserflowRunningUpdate = () => {
    // Userflow dialog has a variable exported which knows if the
    // onboarding is running or not.
    // To ensure all components are aware of this variable when it changes,
    // we need to force a re-render.
    forceUpdate();
  };

  useMainFrameCommands({
    i18n,
    project: state.currentProject,
    previewEnabled:
      !!state.currentProject && state.currentProject.getLayoutsCount() > 0,
    onOpenProjectManager: toggleProjectManager,
    hasPreviewsRunning,
    allowNetworkPreview:
      !!_previewLauncher.current &&
      _previewLauncher.current.canDoNetworkPreview(),
    onLaunchPreview: launchNewPreview,
    onHotReloadPreview: launchHotReloadPreview,
    onLaunchDebugPreview: launchDebuggerAndPreview,
    onLaunchNetworkPreview: launchNetworkPreview,
    onOpenHomePage: openHomePage,
    onCreateProject: openCreateProjectDialog,
    onOpenProject: chooseProject,
    onSaveProject: saveProject,
    onSaveProjectAs: saveProjectAs,
    onCloseApp: closeApp,
    onCloseProject: askToCloseProject,
    onExportGame: React.useCallback(() => openExportDialog(true), []),
    onOpenLayout: openLayout,
    onOpenExternalEvents: openExternalEvents,
    onOpenExternalLayout: openExternalLayout,
    onOpenEventsFunctionsExtension: openEventsFunctionsExtension,
    onOpenCommandPalette: commandPaletteRef.current
      ? commandPaletteRef.current.open
      : () => {},
    onOpenProfile: React.useCallback(
      () => openProfileDialogWithTab('profile'),
      []
    ),
    onOpenGamesDashboard: React.useCallback(
      () => openProfileDialogWithTab('games-dashboard'),
      []
    ),
  });

  const showLoader = isLoadingProject || previewLoading;

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
          onCreateProject: openCreateProjectDialog,
          onOpenProjectManager: () => openProjectManager(true),
          onOpenHomePage: openHomePage,
          onOpenDebugger: openDebugger,
          onOpenAbout: () => openAboutDialog(true),
          onOpenPreferences: () => openPreferencesDialog(true),
          onOpenLanguage: () => openLanguageDialog(true),
          onOpenProfile: () => openProfileDialogWithTab('profile'),
          onOpenGamesDashboard: () =>
            openProfileDialogWithTab('games-dashboard'),
          setUpdateStatus: setUpdateStatus,
          recentProjectFiles: preferences.getRecentProjectFiles(),
        })}
      <ProjectTitlebar
        fileMetadata={currentFileMetadata}
        customTitle={customWindowTitle}
      />
      <Drawer
        open={projectManagerOpen}
        PaperProps={{
          style: styles.drawerContent,
          className: 'safe-area-aware-left-container',
        }}
        ModalProps={{
          keepMounted: true,
        }}
        onClose={toggleProjectManager}
      >
        <DrawerTopBar
          title={
            state.currentProject ? state.currentProject.getName() : 'No project'
          }
          displayRightCloseButton
          onClose={toggleProjectManager}
        />
        {currentProject && (
          <ProjectManager
            project={currentProject}
            onChangeProjectName={onChangeProjectName}
            onOpenExternalEvents={openExternalEvents}
            onOpenLayout={openLayout}
            onOpenExternalLayout={openExternalLayout}
            onOpenEventsFunctionsExtension={openEventsFunctionsExtension}
            onInstallExtension={onInstallExtension}
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
            onOpenProfile={() => openProfileDialogWithTab('profile')}
            onOpenGamesDashboard={() =>
              openProfileDialogWithTab('games-dashboard')
            }
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
            unsavedChanges={unsavedChanges}
            hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
            resourceSources={resourceSources}
            onChooseResource={onChooseResource}
            resourceExternalEditors={resourceExternalEditors}
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
        onOpenDebugger={launchDebuggerAndPreview}
        hasPreviewsRunning={hasPreviewsRunning}
        onPreviewWithoutHotReload={launchNewPreview}
        onNetworkPreview={launchNetworkPreview}
        onHotReloadPreview={launchHotReloadPreview}
        canDoNetworkPreview={
          !!_previewLauncher.current &&
          _previewLauncher.current.canDoNetworkPreview()
        }
        setPreviewOverride={setPreviewOverride}
        isPreviewEnabled={
          !!currentProject && currentProject.getLayoutsCount() > 0
        }
        previewState={previewState}
      />
      <DraggableClosableTabs
        hideLabels={!!props.integratedEditor}
        editorTabs={state.editorTabs}
        onClickTab={(id: number) => _onChangeEditorTab(id)}
        onCloseTab={(editorTab: EditorTab) => _onCloseEditorTab(editorTab)}
        onCloseOtherTabs={(editorTab: EditorTab) =>
          _onCloseOtherEditorTabs(editorTab)
        }
        onCloseAll={_onCloseAllEditorTabs}
        onTabActived={(editorTab: EditorTab) => _onEditorTabActived(editorTab)}
        onDropTab={onDropEditorTab}
      />
      <LeaderboardProvider
        gameId={
          state.currentProject ? state.currentProject.getProjectUuid() : ''
        }
      >
        {getEditors(state.editorTabs).map((editorTab, id) => {
          const isCurrentTab = getCurrentTabIndex(state.editorTabs) === id;
          return (
            <TabContentContainer key={editorTab.key} active={isCurrentTab}>
              <CommandsContextScopedProvider active={isCurrentTab}>
                <ErrorBoundary>
                  {editorTab.renderEditorContainer({
                    isActive: isCurrentTab,
                    extraEditorProps: editorTab.extraEditorProps,
                    project: currentProject,
                    ref: editorRef => (editorTab.editorRef = editorRef),
                    setToolbar: editorToolbar =>
                      setEditorToolbar(editorToolbar, isCurrentTab),
                    onChangeSubscription: () => openSubscriptionDialog(true),
                    projectItemName: editorTab.projectItemName,
                    setPreviewedLayout,
                    onOpenExternalEvents: openExternalEvents,
                    onOpenEvents: (sceneName: string) =>
                      openLayout(sceneName, {
                        openEventsEditor: true,
                        openSceneEditor: false,
                      }),
                    previewDebuggerServer,
                    hotReloadPreviewButtonProps,
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
                    unsavedChanges: unsavedChanges,
                    canOpen: !!props.storageProviders.filter(
                      ({ hiddenInOpenDialog }) => !hiddenInOpenDialog
                    ).length,
                    onOpen: () => chooseProject(),
                    onOpenRecentFile: openFromFileMetadataWithStorageProvider,
                    onCreateFromExampleShortHeader: onCreateFromExampleShortHeader,
                    onCreateBlank: onCreateBlank,
                    onOpenProjectAfterCreation: onOpenProjectAfterCreation,
                    onOpenProjectManager: () => openProjectManager(true),
                    onCloseProject: () => askToCloseProject(),
                    onCreateProject: () => openCreateProjectDialog(true),
                    onOpenProfile: () => openProfileDialogWithTab('profile'),
                    onOpenHelpFinder: () => openHelpFinderDialog(true),
                    onOpenLanguageDialog: () => openLanguageDialog(true),
                    onOpenOnboardingDialog: () => openOnboardingDialog(true),
                    onLoadEventsFunctionsExtensions: () =>
                      eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
                        currentProject
                      ),
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
                      if (currentProject)
                        renameResourcesInProject(currentProject, {
                          [resource.getName()]: newName,
                        });

                      cb(true);
                    },
                  })}
                </ErrorBoundary>
              </CommandsContextScopedProvider>
            </TabContentContainer>
          );
        })}
      </LeaderboardProvider>
      <CommandPalette ref={commandPaletteRef} />
      <LoaderModal
        show={showLoader}
        progress={fileMetadataOpeningProgress}
        message={fileMetadataOpeningMessage}
      />
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
          onSaveProject: saveProject,
        })}
      {!!renderCreateDialog &&
        state.createDialogOpen &&
        renderCreateDialog({
          open: state.createDialogOpen,
          onClose: closeCreateDialog,
          onOpen: onOpenProjectAfterCreation,
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
            getIncludeFileHashs:
              eventsFunctionsExtensionsContext.getIncludeFileHashs,
            onExport: () => openExportDialog(true),
            onChangeSubscription: () => openSubscriptionDialog(true),
          },
          (previewLauncher: ?PreviewLauncherInterface) => {
            _previewLauncher.current = previewLauncher;
          }
        )}
      {!!currentProject && chooseResourceOptions && onResourceChosen && (
        <NewResourceDialog
          project={currentProject}
          i18n={i18n}
          resourceSources={resourceSources}
          onChooseResources={resources => {
            setOnResourceChosen(null);
            setChooseResourceOptions(null);
            onResourceChosen(resources);
          }}
          onClose={() => {
            setOnResourceChosen(null);
            setChooseResourceOptions(null);
            onResourceChosen([]);
          }}
          options={chooseResourceOptions}
        />
      )}
      {profileDialogOpen && (
        <ProfileDialog
          currentProject={currentProject}
          initialTab={profileDialogInitialTab}
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
        <PreferencesDialog
          i18n={props.i18n}
          onClose={languageChanged => {
            openPreferencesDialog(false);
            if (languageChanged) _languageDidChange();
          }}
        />
      )}
      {languageDialogOpen && (
        <LanguageDialog
          open
          onClose={languageChanged => {
            openLanguageDialog(false);
            if (languageChanged) _languageDidChange();
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
            getStorageProviderOperations({ storageProvider });
            chooseProjectWithStorageProviderPicker();
          }}
        />
      )}
      {state.saveToStorageProviderDialogOpen && (
        <SaveToStorageProviderDialog
          onClose={() => openSaveToStorageProviderDialog(false)}
          storageProviders={props.storageProviders}
          onChooseProvider={storageProvider => {
            const currentStorageProvider = getStorageProvider();
            openSaveToStorageProviderDialog(false);
            saveProjectAsWithStorageProvider({
              context:
                storageProvider.internalName ===
                currentStorageProvider.internalName
                  ? 'duplicateCurrentProject'
                  : undefined,
              storageProviderOperationsGetOptions: {
                storageProvider,
                doNotKeepForNextOperations:
                  storageProvider.internalName === 'DownloadFile',
              },
            });
          }}
        />
      )}
      {renderOpenConfirmDialog()}
      {renderLeaderboardReplacerDialog()}
      {renderResourceFetcherDialog()}
      <CloseConfirmDialog
        shouldPrompt={!!state.currentProject}
        i18n={props.i18n}
        language={props.i18n.language}
        hasUnsavedChanges={!!unsavedChanges && unsavedChanges.hasUnsavedChanges}
      />
      <ChangelogDialogContainer />
      {onboardingDialogOpen && (
        <OnboardingDialog
          open
          onClose={() => {
            openOnboardingDialog(false);
          }}
          onUserflowRunningUpdate={onUserflowRunningUpdate}
        />
      )}
      {state.gdjsDevelopmentWatcherEnabled &&
        renderGDJSDevelopmentWatcher &&
        renderGDJSDevelopmentWatcher()}
      {!!hotReloadLogs.length && (
        <HotReloadLogsDialog
          logs={hotReloadLogs}
          onClose={clearHotReloadLogs}
          onLaunchNewPreview={() => {
            clearHotReloadLogs();
            launchNewPreview();
          }}
        />
      )}
    </div>
  );
};

export default MainFrame;
