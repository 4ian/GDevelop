// @flow

import * as React from 'react';
import './MainFrame.css';
import Snackbar from '@material-ui/core/Snackbar';
import HomeIcon from '../UI/CustomSvgIcons/Home';
import DebuggerIcon from '../UI/CustomSvgIcons/Debug';
import ProjectResourcesIcon from '../UI/CustomSvgIcons/ProjectResources';
import SceneIcon from '../UI/CustomSvgIcons/Scene';
import EventsIcon from '../UI/CustomSvgIcons/Events';
import ExternalEventsIcon from '../UI/CustomSvgIcons/ExternalEvents';
import ExternalLayoutIcon from '../UI/CustomSvgIcons/ExternalLayout';
import ExtensionIcon from '../UI/CustomSvgIcons/Extension';
import Toolbar, { type ToolbarInterface } from './Toolbar';
import ProjectTitlebar from './ProjectTitlebar';
import PreferencesDialog from './Preferences/PreferencesDialog';
import AboutDialog from './AboutDialog';
import ProjectManager from '../ProjectManager';
import LoaderModal from '../UI/LoaderModal';
import CloseConfirmDialog from '../UI/CloseConfirmDialog';
import ProfileDialog from '../Profile/ProfileDialog';
import Window from '../Utils/Window';
import { showErrorBox } from '../UI/Messages/MessageBox';
import { TabContentContainer } from '../UI/ClosableTabs';
import { DraggableEditorTabs } from './EditorTabs/DraggableEditorTabs';
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
  closeCustomObjectTab,
  closeEventsBasedObjectVariantTab,
  saveUiSettings,
  type EditorTabsState,
  type EditorTab,
  type EditorKind,
  getEventsFunctionsExtensionEditor,
  notifyPreviewOrExportWillStart,
  moveTabToTheRightOfHoveredTab,
  getCustomObjectEditor,
  hasEditorTabOpenedWithKey,
  getOpenedAskAiEditor,
} from './EditorTabs/EditorTabsHandler';
import { renderDebuggerEditorContainer } from './EditorContainers/DebuggerEditorContainer';
import { renderEventsEditorContainer } from './EditorContainers/EventsEditorContainer';
import { renderExternalEventsEditorContainer } from './EditorContainers/ExternalEventsEditorContainer';
import { renderSceneEditorContainer } from './EditorContainers/SceneEditorContainer';
import { renderExternalLayoutEditorContainer } from './EditorContainers/ExternalLayoutEditorContainer';
import { renderEventsFunctionsExtensionEditorContainer } from './EditorContainers/EventsFunctionsExtensionEditorContainer';
import { renderCustomObjectEditorContainer } from './EditorContainers/CustomObjectEditorContainer';
import { renderHomePageContainer } from './EditorContainers/HomePage';
import { renderAskAiEditorContainer } from '../AiGeneration/AskAiEditorContainer';
import { renderResourcesEditorContainer } from './EditorContainers/ResourcesEditorContainer';
import {
  type RenderEditorContainerPropsWithRef,
  type SceneEventsOutsideEditorChanges,
} from './EditorContainers/BaseEditor';
import ErrorBoundary, {
  getEditorErrorBoundaryProps,
} from '../UI/ErrorBoundary';
import { type Exporter } from '../ExportAndShare/ShareDialog';
import ResourcesLoader from '../ResourcesLoader/index';
import {
  type PreviewLauncherInterface,
  type PreviewLauncherProps,
  type PreviewLauncherComponent,
  type LaunchPreviewOptions,
} from '../ExportAndShare/PreviewLauncher.flow';
import {
  type ResourceSource,
  type ChooseResourceFunction,
  type ChooseResourceOptions,
  type ResourceManagementProps,
} from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor';
import { type JsExtensionsLoader } from '../JsExtensionsLoader';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import {
  getElectronUpdateNotificationTitle,
  getElectronUpdateNotificationBody,
  type ElectronUpdateStatus,
} from './UpdaterTools';
import ChangelogDialogContainer from './Changelog/ChangelogDialogContainer';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { getNotNullTranslationFunction } from '../Utils/i18n/getTranslationFunction';
import { type I18n } from '@lingui/core';
import { t } from '@lingui/macro';
import LanguageDialog from './Preferences/LanguageDialog';
import PreferencesContext, {
  type InAppTutorialUserProgress,
} from './Preferences/PreferencesContext';
import { getFunctionNameFromType } from '../EventsFunctionsExtensionsLoader';
import {
  type ShareDialogWithoutExportsProps,
  type ShareTab,
} from '../ExportAndShare/ShareDialog';
import { getStartupTimesSummary } from '../Utils/StartupTimes';
import {
  type StorageProvider,
  type StorageProviderOperations,
  type FileMetadata,
  type SaveAsLocation,
  type SaveAsOptions,
  type FileMetadataAndStorageProviderName,
  type ResourcesActionsMenuBuilder,
} from '../ProjectsStorage';
import OpenFromStorageProviderDialog from '../ProjectsStorage/OpenFromStorageProviderDialog';
import SaveToStorageProviderDialog from '../ProjectsStorage/SaveToStorageProviderDialog';
import { useOpenConfirmDialog } from '../ProjectsStorage/OpenConfirmDialog';
import verifyProjectContent from '../ProjectsStorage/ProjectContentChecker';
import UnsavedChangesContext from './UnsavedChangesContext';
import {
  type BuildMainMenuProps,
  type MainMenuCallbacks,
  type MainMenuExtraCallbacks,
} from './MainMenu';
import useForceUpdate from '../Utils/UseForceUpdate';
import useStateWithCallback from '../Utils/UseSetStateWithCallback';
import { useKeyboardShortcuts, useShortcutMap } from '../KeyboardShortcuts';
import useMainFrameCommands from './MainFrameCommands';
import {
  CommandPaletteWithAlgoliaSearch,
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
import { delay } from '../Utils/Delay';
import useNewProjectDialog from './UseNewProjectDialog';
import { findAndLogProjectPreviewErrors } from '../Utils/ProjectErrorsChecker';
import { renameResourcesInProject } from '../ResourcesList/ResourceUtils';
import { NewResourceDialog } from '../ResourcesList/NewResourceDialog';
import {
  addCreateBadgePreHookIfNotClaimed,
  TRIVIAL_FIRST_DEBUG,
  TRIVIAL_FIRST_PREVIEW,
} from '../Utils/GDevelopServices/Badge';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import StartInAppTutorialDialog from './EditorContainers/HomePage/InAppTutorials/StartInAppTutorialDialog';
import LeaderboardProvider from '../Leaderboard/LeaderboardProvider';
import {
  sendInAppTutorialStarted,
  sendEventsExtractedAsFunction,
  sendPreviewStarted,
} from '../Utils/Analytics/EventSender';
import { useLeaderboardReplacer } from '../Leaderboard/UseLeaderboardReplacer';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import {
  useResourceMover,
  type ResourceMover,
} from '../ProjectsStorage/ResourceMover';
import {
  useResourceFetcher,
  type ResourceFetcher,
} from '../ProjectsStorage/ResourceFetcher';
import QuitInAppTutorialDialog from '../InAppTutorial/QuitInAppTutorialDialog';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import useOpenInitialDialog from '../Utils/UseOpenInitialDialog';
import { type InAppTutorialOrchestratorInterface } from '../InAppTutorial/InAppTutorialOrchestrator';
import useInAppTutorialOrchestrator from '../InAppTutorial/useInAppTutorialOrchestrator';
import TabsTitlebar from './TabsTitlebar';
import {
  useStableUpToDateCallback,
  useStableUpToDateRef,
} from '../Utils/UseStableUpToDateCallback';
import { emptyStorageProvider } from '../ProjectsStorage/ProjectStorageProviders';
import CustomDragLayer from '../UI/DragAndDrop/CustomDragLayer';
import CloudProjectRecoveryDialog from '../ProjectsStorage/CloudStorageProvider/CloudProjectRecoveryDialog';
import CloudProjectSaveChoiceDialog from '../ProjectsStorage/CloudStorageProvider/CloudProjectSaveChoiceDialog';
import CloudStorageProvider from '../ProjectsStorage/CloudStorageProvider';
import useCreateProject from '../Utils/UseCreateProject';
import newNameGenerator from '../Utils/NewNameGenerator';
import { addDefaultLightToAllLayers } from '../ProjectCreation/CreateProject';
import useEditorTabsStateSaving from './EditorTabs/UseEditorTabsStateSaving';
import PixiResourcesLoader from '../ObjectsRendering/PixiResourcesLoader';
import useResourcesWatcher from './ResourcesWatcher';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';
import { type CourseChapter } from '../Utils/GDevelopServices/Asset';
import useVersionHistory from '../VersionHistory/UseVersionHistory';
import { ProjectManagerDrawer } from '../ProjectManager/ProjectManagerDrawer';
import DiagnosticReportDialog from '../ExportAndShare/DiagnosticReportDialog';
import useSaveReminder from './UseSaveReminder';
import { useMultiplayerLobbyConfigurator } from './UseMultiplayerLobbyConfigurator';
import { useAuthenticatedPlayer } from './UseAuthenticatedPlayer';
import ListIcon from '../UI/ListIcon';
import { QuickCustomizationDialog } from '../QuickCustomization/QuickCustomizationDialog';
import { type ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import useGamesList from '../GameDashboard/UseGamesList';
import useCapturesManager from './UseCapturesManager';
import useHomepageWitchForRouting from './UseHomepageWitchForRouting';
import {
  EmbeddedGameFrame,
  setEditorHotReloadNeeded,
} from '../EmbeddedGame/EmbeddedGameFrame';
import RobotIcon from '../ProjectCreation/RobotIcon';
import PublicProfileContext from '../Profile/PublicProfileContext';
import { useGamesPlatformFrame } from './EditorContainers/HomePage/PlaySection/UseGamesPlatformFrame';
import { useExtensionLoadErrorDialog } from '../Utils/UseExtensionLoadErrorDialog';
import { registerOnResourceExternallyChangedCallback } from '../MainFrame/ResourcesWatcher';

const GD_STARTUP_TIMES = global.GD_STARTUP_TIMES || [];

const gd: libGDevelop = global.gd;

const editorKindToRenderer: {
  [key: EditorKind]: (props: RenderEditorContainerPropsWithRef) => React.Node,
} = {
  debugger: renderDebuggerEditorContainer,
  'layout events': renderEventsEditorContainer,
  'external events': renderExternalEventsEditorContainer,
  layout: renderSceneEditorContainer,
  'external layout': renderExternalLayoutEditorContainer,
  'events functions extension': renderEventsFunctionsExtensionEditorContainer,
  'custom object': renderCustomObjectEditorContainer,
  'start page': renderHomePageContainer,
  resources: renderResourcesEditorContainer,
  'ask-ai': renderAskAiEditorContainer,
};

const defaultSnackbarAutoHideDuration = 3000;

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

const shouldRemovePointerEvents = (
  kind: EditorKind,
  gameEditorMode: 'embedded-game' | 'instances-editor'
) => {
  if (gameEditorMode === 'embedded-game') {
    // Scene editors can have an embedded game, so they redefine manually
    // which components can have clicks/touches.
    return (
      kind === 'layout' ||
      kind === 'external layout' ||
      kind === 'custom object'
    );
  }
  return false;
};

/**
 * Compares a React reference to the current project (truth source)
 * and a project stored in a variable (coming probably from a React state).
 * It is useful to detect if the project stored in a variable is still
 * valid (still currently opened). If it's not, it means the variable is "stale".
 */
const isCurrentProjectFresh = (
  currentProjectRef: {| current: ?gdProject |},
  currentProject: gdProject
) =>
  currentProjectRef.current &&
  currentProject.ptr === currentProjectRef.current.ptr;

/**
 * When a project is created or opened, the fileMetadata is not aware of some project
 * properties like the projectUuid or the name, until the project is deserialized.
 * This function returns a new fileMetadata with the latest project properties,
 * allowing the editor to have the latest information.
 */
const updateFileMetadataWithOpenedProject = (
  fileMetadata: FileMetadata,
  project: gdProject
) => ({
  ...fileMetadata,
  gameId: project.getProjectUuid(),
  name: project.getName(),
});

export type State = {|
  currentProject: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  editorTabs: EditorTabsState,
  snackMessage: string,
  snackMessageOpen: boolean,
  snackDuration: ?number,
  updateStatus: ElectronUpdateStatus,
  openFromStorageProviderDialogOpen: boolean,
  saveToStorageProviderDialogOpen: boolean,
  gdjsDevelopmentWatcherEnabled: boolean,
|};

const initialPreviewState: PreviewState = {
  previewLayoutName: null,
  previewExternalLayoutName: null,
  isPreviewOverriden: false,
  overridenPreviewLayoutName: null,
  overridenPreviewExternalLayoutName: null,
  eventsBasedObjectType: null,
  eventsBasedObjectVariantName: null,
};

export type Props = {|
  renderMainMenu?: (
    BuildMainMenuProps,
    MainMenuCallbacks,
    MainMenuExtraCallbacks
  ) => React.Node,
  renderPreviewLauncher?: (
    props: PreviewLauncherProps,
    ref: (previewLauncher: ?PreviewLauncherInterface) => void
  ) => React.Element<PreviewLauncherComponent>,
  onEditObject?: gdObject => void,
  storageProviders: Array<StorageProvider>,
  resourceMover: ResourceMover,
  resourceFetcher: ResourceFetcher,
  getStorageProviderOperations: (
    storageProvider?: ?StorageProvider
  ) => StorageProviderOperations,
  getStorageProviderResourceOperations: () => ?ResourcesActionsMenuBuilder,
  getStorageProvider: () => StorageProvider,
  resourceSources: Array<ResourceSource>,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  requestUpdate?: () => void,
  renderShareDialog: ShareDialogWithoutExportsProps => React.Node,
  renderGDJSDevelopmentWatcher?: ?({|
    onGDJSUpdated: () => Promise<void> | void,
  |}) => React.Node,
  extensionsLoader?: JsExtensionsLoader,
  initialFileMetadataToOpen: ?FileMetadata,
  initialExampleSlugToOpen: ?string,
  quickPublishOnlineWebExporter: Exporter,
  i18n: I18n,
|};

const MainFrame = (props: Props) => {
  const [state, setState]: [
    State,
    ((State => State) | State) => Promise<State>,
  ] = useStateWithCallback(
    ({
      currentProject: null,
      currentFileMetadata: null,
      editorTabs: getEditorTabsInitialState(),
      snackMessage: '',
      snackMessageOpen: false,
      snackDuration: defaultSnackbarAutoHideDuration,
      updateStatus: { message: '', status: 'unknown' },
      openFromStorageProviderDialogOpen: false,
      saveToStorageProviderDialogOpen: false,
      gdjsDevelopmentWatcherEnabled: false,
    }: State)
  );
  const toolbar = React.useRef<?ToolbarInterface>(null);
  const [
    tabsTitleBarAndEditorToolbarHidden,
    setTabsTitleBarAndEditorToolbarHidden,
  ] = React.useState(false);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const [
    cloudProjectFileMetadataToRecover,
    setCloudProjectFileMetadataToRecover,
  ] = React.useState<?FileMetadata>(null);
  const [
    cloudProjectRecoveryOpenedVersionId,
    setCloudProjectRecoveryOpenedVersionId,
  ] = React.useState<?string>(null);
  const [
    cloudProjectSaveChoiceOpen,
    setCloudProjectSaveChoiceOpen,
  ] = React.useState<boolean>(false);
  const [
    chooseResourceOptions,
    setChooseResourceOptions,
  ] = React.useState<?ChooseResourceOptions>(null);
  const [onResourceChosen, setOnResourceChosen] = React.useState<?({|
    selectedResources: Array<gdResource>,
    selectedSourceName: string,
  |}) => void>(null);
  const _previewLauncher = React.useRef((null: ?PreviewLauncherInterface));
  const forceUpdate = useForceUpdate();
  const [isLoadingProject, setIsLoadingProject] = React.useState<boolean>(
    false
  );
  const [isSavingProject, setIsSavingProject] = React.useState<boolean>(false);
  const [projectManagerOpen, openProjectManager] = React.useState<boolean>(
    false
  );
  const [languageDialogOpen, openLanguageDialog] = React.useState<boolean>(
    false
  );
  const [aboutDialogOpen, openAboutDialog] = React.useState<boolean>(false);
  const [profileDialogOpen, openProfileDialog] = React.useState<boolean>(false);
  const [
    preferencesDialogOpen,
    openPreferencesDialog,
  ] = React.useState<boolean>(false);
  const [
    newProjectSetupDialogOpen,
    setNewProjectSetupDialogOpen,
  ] = React.useState<boolean>(false);

  const [isProjectOpening, setIsProjectOpening] = React.useState<boolean>(
    false
  );
  const [
    isProjectClosedSoAvoidReloadingExtensions,
    setIsProjectClosedSoAvoidReloadingExtensions,
  ] = React.useState<boolean>(false);
  const [shareDialogOpen, setShareDialogOpen] = React.useState<boolean>(false);
  const [
    shareDialogInitialTab,
    setShareDialogInitialTab,
  ] = React.useState<?ShareTab>(null);
  const { showConfirmation, showAlert } = useAlertDialog();
  const preferences = React.useContext(PreferencesContext);
  const { setHasProjectOpened } = preferences;
  const [previewLoading, setPreviewLoading] = React.useState<boolean>(false);
  const [previewState, setPreviewState] = React.useState(initialPreviewState);
  const commandPaletteRef = React.useRef((null: ?CommandPaletteInterface));
  const inAppTutorialOrchestratorRef = React.useRef<?InAppTutorialOrchestratorInterface>(
    null
  );
  const [
    loaderModalOpeningMessage,
    setLoaderModalOpeningMessage,
  ] = React.useState<?MessageDescriptor>(null);

  const eventsFunctionsExtensionsContext = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const previewDebuggerServer =
    _previewLauncher.current &&
    _previewLauncher.current.getPreviewDebuggerServer();
  const {
    hasNonEditionPreviewsRunning,
    hotReloadLogs,
    clearHotReloadLogs,
    hardReloadAllPreviews,
  } = usePreviewDebuggerServerWatcher(previewDebuggerServer);
  const {
    ensureInteractionHappened,
    renderOpenConfirmDialog,
  } = useOpenConfirmDialog();
  const {
    openLeaderboardReplacerDialogIfNeeded,
    renderLeaderboardReplacerDialog,
  } = useLeaderboardReplacer();
  const {
    configureMultiplayerLobbiesIfNeeded,
  } = useMultiplayerLobbyConfigurator();
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const unsavedChanges = React.useContext(UnsavedChangesContext);
  const {
    hasUnsavedChanges,
    sealUnsavedChanges,
    triggerUnsavedChanges,
  } = unsavedChanges;
  const {
    currentlyRunningInAppTutorial,
    getInAppTutorialShortHeader,
    endTutorial: doEndTutorial,
    startTutorial,
    startStepIndex,
    startProjectData,
  } = React.useContext(InAppTutorialContext);
  const [
    selectedInAppTutorialInfo,
    setSelectedInAppTutorialInfo,
  ] = React.useState<null | {|
    tutorialId: string,
    userProgress: ?InAppTutorialUserProgress,
  |}>(null);
  const {
    InAppTutorialOrchestrator,
    orchestratorProps,
  } = useInAppTutorialOrchestrator({ editorTabs: state.editorTabs });
  const [
    quitInAppTutorialDialogOpen,
    setQuitInAppTutorialDialogOpen,
  ] = React.useState<boolean>(false);
  const [
    diagnosticReportDialogOpen,
    setDiagnosticReportDialogOpen,
  ] = React.useState<boolean>(false);
  const [
    fileMetadataOpeningProgress,
    setFileMetadataOpeningProgress,
  ] = React.useState<?number>(null);
  const [
    fileMetadataOpeningMessage,
    setFileMetadataOpeningMessage,
  ] = React.useState<?MessageDescriptor>(null);
  const [
    quickCustomizationDialogOpenedFromGameId,
    setQuickCustomizationDialogOpenedFromGameId,
  ] = React.useState<?string>(null);

  // TODO: move to a preference.
  const [gameEditorMode, setGameEditorMode] = React.useState<
    'embedded-game' | 'instances-editor'
  >('embedded-game');

  // This is just for testing, to check if we're getting the right state
  // and gives us an idea about the number of re-renders.
  // React.useEffect(() => {
  //   console.log(state);
  // });

  const { currentProject, currentFileMetadata, updateStatus } = state;
  const {
    renderShareDialog,
    resourceSources,
    renderPreviewLauncher,
    resourceExternalEditors,
    resourceMover,
    resourceFetcher,
    getStorageProviderOperations,
    getStorageProviderResourceOperations,
    getStorageProvider,
    initialFileMetadataToOpen,
    initialExampleSlugToOpen,
    i18n,
    renderGDJSDevelopmentWatcher,
    renderMainMenu,
    quickPublishOnlineWebExporter,
  } = props;

  const {
    ensureResourcesAreMoved,
    renderResourceMoverDialog,
  } = useResourceMover({ resourceMover });
  const {
    ensureResourcesAreFetched,
    renderResourceFetcherDialog,
  } = useResourceFetcher({ resourceFetcher });
  useResourcesWatcher({
    getStorageProvider,
    fileMetadata: currentFileMetadata,
    isProjectSplitInMultipleFiles: currentProject
      ? currentProject.isFolderProject()
      : false,
  });

  const gamesList = useGamesList();

  const {
    createCaptureOptionsForPreview,
    onCaptureFinished,
    onGameScreenshotsClaimed,
    getGameUnverifiedScreenshotUrls,
    getHotReloadPreviewLaunchCaptureOptions,
  } = useCapturesManager({ project: currentProject, gamesList });

  const { getAuthenticatedPlayerForPreview } = useAuthenticatedPlayer({
    project: currentProject,
    gamesList,
  });

  const {
    setExtensionLoadingResults,
    hasExtensionLoadErrors,
    renderExtensionLoadErrorDialog,
  } = useExtensionLoadErrorDialog();

  /**
   * This reference is useful to get the current opened project,
   * even in the callback of a hook/promise - without risking to read "stale" data.
   * This can be different from the `currentProject` (coming from the state)
   * that an effect or a callback manipulates when a promise resolves for instance.
   * See `isCurrentProjectFresh`.
   */
  const currentProjectRef = useStableUpToDateRef(currentProject);

  /**
   * Similar to `currentProjectRef`, an always fresh reference to the latest `currentFileMetadata`.
   */
  const currentFileMetadataRef = useStableUpToDateRef(currentFileMetadata);

  const getEditorOpeningOptions = React.useCallback(
    ({
      kind,
      name,
      dontFocusTab,
      project,
    }: {
      kind: EditorKind,
      name: string,
      dontFocusTab?: boolean,
      project?: ?gdProject,
    }) => {
      const label =
        kind === 'resources'
          ? i18n._(t`Resources`)
          : kind === 'ask-ai'
          ? i18n._(t`Ask AI`)
          : kind === 'start page'
          ? undefined
          : kind === 'debugger'
          ? i18n._(t`Debugger`)
          : kind === 'layout events'
          ? name + ` ${i18n._(t`(Events)`)}`
          : kind === 'custom object'
          ? name.split('::')[2] ||
            name.split('::')[1] + ` ${i18n._(t`(Object)`)}`
          : name;
      const tabOptions =
        kind === 'layout'
          ? { data: { scene: name, type: 'layout' } }
          : kind === 'layout events'
          ? { data: { scene: name, type: 'layout-events' } }
          : undefined;
      const key = [
        'layout',
        'layout events',
        'external events',
        'external layout',
        'events functions extension',
        'custom object',
      ].includes(kind)
        ? `${kind} ${name}`
        : kind;

      let customIconUrl = '';
      if (kind === 'events functions extension' || kind === 'custom object') {
        const extensionName = name.split('::')[0];
        if (
          project &&
          project.hasEventsFunctionsExtensionNamed(extensionName)
        ) {
          const eventsFunctionsExtension = project.getEventsFunctionsExtension(
            extensionName
          );
          customIconUrl = eventsFunctionsExtension.getIconUrl();
        }
      }
      const icon =
        kind === 'start page' ? (
          <HomeIcon titleAccess="Home" />
        ) : kind === 'debugger' ? (
          <DebuggerIcon />
        ) : kind === 'resources' ? (
          <ProjectResourcesIcon />
        ) : kind === 'layout' ? (
          <SceneIcon />
        ) : kind === 'layout events' ? (
          <EventsIcon />
        ) : kind === 'external events' ? (
          <ExternalEventsIcon />
        ) : kind === 'external layout' ? (
          <ExternalLayoutIcon />
        ) : kind === 'events functions extension' ||
          kind === 'custom object' ? (
          <ExtensionIcon />
        ) : kind === 'ask-ai' ? (
          <RobotIcon size={16} />
        ) : null;

      const closable = kind !== 'start page';
      const extraEditorProps =
        kind === 'start page'
          ? { storageProviders: props.storageProviders }
          : undefined;
      return {
        icon,
        renderCustomIcon: customIconUrl
          ? (brightness: number) => (
              <ListIcon
                iconSize={20}
                src={customIconUrl}
                brightness={brightness}
              />
            )
          : null,
        closable,
        label,
        projectItemName: name,
        tabOptions,
        kind,
        renderEditorContainer: editorKindToRenderer[kind],
        extraEditorProps,
        key,
        dontFocusTab,
      };
    },
    [i18n, props.storageProviders]
  );

  const setEditorTabs = React.useCallback(
    newEditorTabs => {
      setState(state => ({
        ...state,
        editorTabs: newEditorTabs,
      }));
    },
    [setState]
  );

  const {
    hasAPreviousSaveForEditorTabsState,
    openEditorTabsFromPersistedState,
  } = useEditorTabsStateSaving({
    currentProjectId: state.currentProject
      ? state.currentProject.getProjectUuid()
      : null,
    editorTabs: state.editorTabs,
    setEditorTabs: setEditorTabs,
    getEditorOpeningOptions,
  });

  const _closeSnackMessage = React.useCallback(
    () => {
      setState(state => ({
        ...state,
        snackMessageOpen: false,
        snackDuration: defaultSnackbarAutoHideDuration, // Reset to default when closing the snackbar.
      }));
    },
    [setState]
  );

  const _showSnackMessage = React.useCallback(
    (snackMessage: string, autoHideDuration?: number | null) => {
      setState(state => ({
        ...state,
        snackMessage,
        snackMessageOpen: true,
        snackDuration:
          autoHideDuration !== undefined
            ? autoHideDuration // Allow setting null, for infinite duration.
            : defaultSnackbarAutoHideDuration,
      }));
    },
    [setState]
  );

  const _replaceSnackMessage = React.useCallback(
    (snackMessage: string, autoHideDuration?: number | null) => {
      _closeSnackMessage();
      setTimeout(() => _showSnackMessage(snackMessage, autoHideDuration), 200);
    },
    [_closeSnackMessage, _showSnackMessage]
  );

  const openShareDialog = React.useCallback(
    (initialTab?: ShareTab) => {
      notifyPreviewOrExportWillStart(state.editorTabs);

      setShareDialogInitialTab(initialTab || null);
      setShareDialogOpen(true);
    },
    [state.editorTabs]
  );

  const closeShareDialog = React.useCallback(
    () => {
      setShareDialogOpen(false);
      setShareDialogInitialTab(null);
    },
    [setShareDialogOpen, setShareDialogInitialTab]
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
    console.info('Language changed, reloading extensions...');
    gd.MeasurementUnit.applyTranslation();
    gd.JsPlatform.get().reloadBuiltinExtensions();
    eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions(
      currentProject
    );
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
      .then(
        ({
          expectedNumberOfJSExtensionModulesLoaded,
          results: loadingResults,
        }) => {
          const successLoadingResults = loadingResults.filter(
            loadingResult => !loadingResult.result.error
          );
          console.info(
            `Loaded ${
              successLoadingResults.length
            }/${expectedNumberOfJSExtensionModulesLoaded} JS extensions.`
          );

          setExtensionLoadingResults({
            expectedNumberOfJSExtensionModulesLoaded,
            results: loadingResults,
          });
        }
      );
  };

  useDiscordRichPresence(currentProject);

  const closeProject = React.useCallback(
    async (): Promise<void> => {
      setHasProjectOpened(false);
      setPreviewState(initialPreviewState);

      console.info('Closing project...');
      // TODO Remove this state
      // Instead:
      // - Move the EventsFunctionsExtensionsLoader to Core
      // - Add a dirty flag system to refresh on demand.
      setIsProjectClosedSoAvoidReloadingExtensions(true);

      // While not strictly necessary, use `currentProjectRef` to be 100%
      // sure to have the latest project (avoid risking any stale variable to an old
      // `currentProject` from the state in case someone kept an old reference to `closeProject`
      // somewhere).
      const currentProject = currentProjectRef.current;
      if (!currentProject) return;

      // Close the editors related to this project.
      await setState(state => ({
        ...state,
        currentProject: null,
        currentFileMetadata: null,
        editorTabs: closeProjectTabs(state.editorTabs, currentProject),
      }));

      // Delete the project from memory. All references to it have been dropped previously
      // by the setState.
      console.info('Deleting project from memory...');
      eventsFunctionsExtensionsState.unloadProjectEventsFunctionsExtensions(
        currentProject
      );
      await eventsFunctionsExtensionsState.ensureLoadFinished();
      currentProject.delete();
      sealUnsavedChanges();
      console.info('Project closed.');
    },
    [
      currentProjectRef,
      eventsFunctionsExtensionsState,
      setHasProjectOpened,
      setState,
      sealUnsavedChanges,
    ]
  );

  const loadFromProject = React.useCallback(
    async (project: gdProject, fileMetadata: ?FileMetadata): Promise<State> => {
      let updatedFileMetadata: ?FileMetadata = fileMetadata
        ? updateFileMetadataWithOpenedProject(fileMetadata, project)
        : null;

      if (updatedFileMetadata) {
        const storageProvider = getStorageProvider();
        const storageProviderOperations = getStorageProviderOperations(
          storageProvider
        );
        const { onSaveProject } = storageProviderOperations;

        // Only save the project in the recent files if the storage provider
        // is able to save. Otherwise, it means nothing to consider this as
        // a recent file: we must wait for the user to save in a "real" storage
        // (like locally or on Google Drive).
        if (onSaveProject) {
          preferences.insertRecentProjectFile({
            fileMetadata: updatedFileMetadata,
            storageProviderName: storageProvider.internalName,
          });
        }
      }

      await closeProject();

      // Make sure that the ResourcesLoader cache is emptied, so that
      // the URL to a resource with a name in the old project is not re-used
      // for another resource with the same name in the new project.
      ResourcesLoader.burstAllUrlsCache();
      PixiResourcesLoader.burstCache();

      const state = await setState(state => ({
        ...state,
        currentProject: project,
        currentFileMetadata: updatedFileMetadata,
      }));

      // Load all the EventsFunctionsExtension when the game is loaded. If they are modified,
      // their editor will take care of reloading them.
      eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
        project
      );

      if (updatedFileMetadata) {
        project.setProjectFile(updatedFileMetadata.fileIdentifier);

        const storageProvider = getStorageProvider();
        const storageProviderOperations = getStorageProviderOperations(
          storageProvider
        );

        // Fetch the resources if needed, for example:
        // - if opening a local file, with resources stored as URL
        //   (which can happen after downloading it from the web-app),
        //   in which case URLs will be downloaded.
        // - if opening from a URL, with resources that are relative
        //   to this base URL and which will be converted to full URLs.
        // ...
        // See `ResourceFetcher` for all the cases.
        await ensureResourcesAreFetched(() => ({
          project,
          fileMetadata: updatedFileMetadata,
          storageProvider,
          storageProviderOperations,
          authenticatedUser,
        }));

        setIsProjectClosedSoAvoidReloadingExtensions(false);
      }

      return state;
    },
    [
      setState,
      closeProject,
      preferences,
      eventsFunctionsExtensionsState,
      getStorageProvider,
      getStorageProviderOperations,
      ensureResourcesAreFetched,
      authenticatedUser,
    ]
  );

  const loadFromSerializedProject = React.useCallback(
    (
      serializedProject: gdSerializerElement,
      fileMetadata: ?FileMetadata
    ): Promise<State> => {
      const startTime = Date.now();
      const newProject = gd.ProjectHelper.createNewGDJSProject();
      newProject.unserializeFrom(serializedProject);
      const duration = Date.now() - startTime;
      console.info(`Unserialization took ${duration.toFixed(2)} ms`);

      return loadFromProject(newProject, fileMetadata);
    },
    [loadFromProject]
  );

  const setLoaderModalProgress = (
    progress: ?number,
    message: ?MessageDescriptor
  ) => {
    setFileMetadataOpeningProgress(progress);
    setFileMetadataOpeningMessage(message);
  };

  const openFromFileMetadata = React.useCallback(
    async (
      fileMetadata: FileMetadata,
      options?: {| openingMessage?: ?MessageDescriptor |}
    ): Promise<?State> => {
      const storageProviderOperations = getStorageProviderOperations();

      const {
        getAutoSaveCreationDate,
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
        return;
      }

      const checkForAutosave = async (): Promise<FileMetadata> => {
        if (!getAutoSaveCreationDate || !onGetAutoSave) {
          return fileMetadata;
        }

        const autoSaveCreationDate = await getAutoSaveCreationDate(
          fileMetadata,
          true
        );
        if (!autoSaveCreationDate) return fileMetadata;

        const answer = await showConfirmation({
          title: t`This project has an auto-saved version`,
          message: t`GDevelop automatically saved a newer version of this project on ${new Date(
            autoSaveCreationDate
          ).toLocaleString()}. This new version might differ from the one that you manually saved. Which version would you like to open?`,
          dismissButtonLabel: t`My manual save`,
          confirmButtonLabel: t`GDevelop auto-save`,
        });

        if (!answer) return fileMetadata;
        return onGetAutoSave(fileMetadata);
      };

      const checkForAutosaveAfterFailure = async (): Promise<?FileMetadata> => {
        if (!getAutoSaveCreationDate || !onGetAutoSave) {
          return null;
        }

        const autoSaveCreationDate = await getAutoSaveCreationDate(
          fileMetadata,
          false
        );
        if (!autoSaveCreationDate) return null;

        const answer = await showConfirmation({
          title: t`This project cannot be opened`,
          message: t`The project file appears to be corrupted, but an autosave file exists (backup made automatically by GDevelop on ${new Date(
            autoSaveCreationDate
          ).toLocaleString()}). Would you like to try to load it instead?`,
          confirmButtonLabel: t`Load autosave`,
        });
        if (!answer) return null;
        return onGetAutoSave(fileMetadata);
      };

      if (options && options.openingMessage) {
        setLoaderModalOpeningMessage(options.openingMessage);
      }
      setIsLoadingProject(true);

      // Try to find an autosave (and ask user if found)
      try {
        await delay(150);
        let content;
        let openingError: Error | null = null;
        try {
          const autoSaveFileMetadata = await checkForAutosave();
          const result = await onOpen(
            autoSaveFileMetadata,
            setLoaderModalProgress
          );
          content = result.content;
        } catch (error) {
          openingError = error;
          // onOpen failed, try to find again an autosave.
          const autoSaveAfterFailureFileMetadata = await checkForAutosaveAfterFailure();
          if (autoSaveAfterFailureFileMetadata) {
            const result = await onOpen(autoSaveAfterFailureFileMetadata);
            content = result.content;
          }
        } finally {
          setIsLoadingProject(false);
          setLoaderModalOpeningMessage(null);
          setLoaderModalProgress(null, null);
        }
        if (!content) {
          throw openingError ||
            new Error(
              'The project file content could not be read. It might be corrupted/malformed.'
            );
        }
        if (!verifyProjectContent(i18n, content)) {
          // The content is not recognized and the user was warned. Abort the opening.
          return;
        }

        const serializedProject = gd.Serializer.fromJSObject(content);

        try {
          const state = loadFromSerializedProject(
            serializedProject,
            // Note that fileMetadata is the original, unchanged one, even if we're loading
            // an autosave. If we're for some reason loading an autosave, we still consider
            // that we're opening the file that was originally requested by the user.
            fileMetadata
          );
          return state;
        } finally {
          sealUnsavedChanges();
          serializedProject.delete();
        }
      } catch (error) {
        if (error.name === 'CloudProjectReadingError') {
          setCloudProjectFileMetadataToRecover(fileMetadata);
        } else {
          console.error('Failed to open the project:', error);
          const errorMessage = getOpenErrorMessage
            ? getOpenErrorMessage(error)
            : t`Ensure that you are connected to internet and that the URL used is correct, then try again.`;

          await showAlert({
            title: t`Unable to open the project`,
            message: errorMessage,
          });
          throw error;
        }
      }
    },
    [
      i18n,
      getStorageProviderOperations,
      loadFromSerializedProject,
      showConfirmation,
      showAlert,
      sealUnsavedChanges,
    ]
  );

  const {
    createEmptyProject,
    createProjectFromExample,
    createProjectFromPrivateGameTemplate,
    createProjectFromInAppTutorial,
    createProjectFromTutorial,
    createProjectFromCourseChapter,
  } = useCreateProject({
    beforeCreatingProject: () => {
      setIsProjectOpening(true);
    },
    getStorageProviderOperations,
    getStorageProvider,
    afterCreatingProject: async ({
      project,
      editorTabs,
      oldProjectId,
      options,
    }) => {
      // Update the currentFileMetadata based on the updated project, as
      // it can have been updated in the meantime (gameId, project name, etc...).
      // Use the ref here to be sure to have the latest file metadata.
      if (currentFileMetadataRef.current) {
        const newFileMetadata: FileMetadata = updateFileMetadataWithOpenedProject(
          currentFileMetadataRef.current,
          project
        );
        setState(state => ({
          ...state,
          currentFileMetadata: newFileMetadata,
        }));
      }
      setNewProjectSetupDialogOpen(false);
      if (options.openQuickCustomizationDialog) {
        setQuickCustomizationDialogOpenedFromGameId(oldProjectId);
      } else {
        // Replace leaderboards and configure multiplayer lobbies if needed.
        // In the case of quick customization, this will be done later.
        openLeaderboardReplacerDialogIfNeeded(project, oldProjectId);
        configureMultiplayerLobbiesIfNeeded(project, oldProjectId);
      }
      if (!options.dontOpenAnySceneOrProjectManager) {
        options.openAllScenes || options.openQuickCustomizationDialog
          ? openAllScenes({
              currentProject: project,
              editorTabs,
            })
          : openSceneOrProjectManager({
              currentProject: project,
              editorTabs: editorTabs,
            });
      }
      setIsProjectClosedSoAvoidReloadingExtensions(false);
    },
    onError: () => {
      setIsProjectClosedSoAvoidReloadingExtensions(true);
    },
    onSuccessOrError: () => {
      // Stop the loading when we're successful or have failed.
      setIsProjectOpening(false);
      setIsLoadingProject(false);
      setLoaderModalProgress(null, null);
    },
    loadFromProject,
    openFromFileMetadata,
    onProjectSaved: fileMetadata => {
      setState(state => ({
        ...state,
        currentFileMetadata: fileMetadata,
      }));
    },
    ensureResourcesAreMoved,
    onGameRegistered: gamesList.fetchGames,
  });

  const openAskAi = React.useCallback(
    () => {
      setState(state => {
        const askAiEditor = getOpenedAskAiEditor(state.editorTabs);
        if (askAiEditor) {
          askAiEditor.startNewChat();
        }

        // Open or focus the AI editor.
        return {
          ...state,
          editorTabs: openEditorTab(
            state.editorTabs,
            getEditorOpeningOptions({ kind: 'ask-ai', name: '' })
          ),
        };
      });
    },
    [setState, getEditorOpeningOptions]
  );

  const {
    onSelectExampleShortHeader,
    onSelectPrivateGameTemplateListingData,
    renderNewProjectDialog,
    fetchAndOpenNewProjectSetupDialogForExample,
    openNewProjectDialog,
  } = useNewProjectDialog({
    isProjectOpening,
    newProjectSetupDialogOpen,
    setNewProjectSetupDialogOpen,
    createEmptyProject,
    createProjectFromExample,
    createProjectFromPrivateGameTemplate,
    openAskAi,
    storageProviders: props.storageProviders,
  });

  const onOpenProfileDialog = React.useCallback(
    () => {
      openProfileDialog(true);
    },
    [openProfileDialog]
  );

  const gamesPlatformFrameTools = useGamesPlatformFrame({
    fetchAndOpenNewProjectSetupDialogForExample,
    onOpenProfileDialog,
  });

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

    const extensionName = eventsFunctionsExtension.getName();
    setState(state => ({
      ...state,
      editorTabs: closeEventsFunctionsExtensionTabs(
        state.editorTabs,
        extensionName
      ),
    })).then(state => {
      // Unload the Platform extension that was generated from the events
      // functions extension.
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

  const onInstallExtension = (extensionName: string) => {
    const { currentProject } = state;
    if (!currentProject) return;

    // Close the extension tab before updating/reinstalling the extension.
    // This is especially important when the extension tab in selected.
    const eventsFunctionsExtensionName = extensionName;

    if (
      currentProject.hasEventsFunctionsExtensionNamed(
        eventsFunctionsExtensionName
      )
    ) {
      setState(state => ({
        ...state,
        editorTabs: closeEventsFunctionsExtensionTabs(
          state.editorTabs,
          eventsFunctionsExtensionName
        ),
      }));
    }
  };

  const onExtensionInstalled = (extensionNames: Array<string>) => {
    const { currentProject } = state;
    if (!currentProject) {
      return;
    }
    let hasEventsBasedObject = false;
    for (const extensionName of extensionNames) {
      const eventsBasedObjects = currentProject
        .getEventsFunctionsExtension(extensionName)
        .getEventsBasedObjects();
      for (let index = 0; index < eventsBasedObjects.getCount(); index++) {
        const eventsBasedObject = eventsBasedObjects.getAt(index);
        gd.EventsBasedObjectVariantHelper.complyVariantsToEventsBasedObject(
          currentProject,
          eventsBasedObject
        );
      }

      // Close extension tab because `onInstallExtension` is not necessarily
      // called when the extension tab is not selected.

      // TODO Open the closed tabs back
      // It would be safer to close the tabs before the extension is installed
      // but it would make opening them back more complicated.
      setState(state => ({
        ...state,
        editorTabs: closeEventsFunctionsExtensionTabs(
          state.editorTabs,
          extensionName
        ),
      }));

      hasEventsBasedObject =
        hasEventsBasedObject || eventsBasedObjects.getCount() > 0;
    }
    if (hasEventsBasedObject) {
      hotReloadInGameEditorIfNeeded({
        projectDataOnlyExport: false,
        shouldReloadResources: false,
      });
    }
  };

  const hotReloadInGameEditorIfNeeded = React.useCallback(
    (hotReloadProps: {|
      projectDataOnlyExport: boolean,
      shouldReloadResources: boolean,
    |}) => {
      const currentTab = getCurrentTab(state.editorTabs);
      if (!currentTab) {
        if (gameEditorMode === 'embedded-game') {
          setEditorHotReloadNeeded(hotReloadProps);
        }
        return;
      }
      const { editorRef } = currentTab;
      if (!editorRef) {
        if (gameEditorMode === 'embedded-game') {
          setEditorHotReloadNeeded(hotReloadProps);
        }
        return;
      }
      editorRef.forceInGameEditorHotReload(hotReloadProps);
    },
    [state.editorTabs, gameEditorMode]
  );

  const onSceneAdded = React.useCallback(
    () => {
      hotReloadInGameEditorIfNeeded({
        projectDataOnlyExport: true,
        shouldReloadResources: false,
      });
    },
    [hotReloadInGameEditorIfNeeded]
  );

  const onExternalLayoutAdded = React.useCallback(
    () => {
      hotReloadInGameEditorIfNeeded({
        projectDataOnlyExport: true,
        shouldReloadResources: false,
      });
    },
    [hotReloadInGameEditorIfNeeded]
  );

  const onEffectAdded = React.useCallback(
    () => {
      // Ensure the effect implementation is exported.
      hotReloadInGameEditorIfNeeded({
        projectDataOnlyExport: false,
        shouldReloadResources: false,
      });
    },
    [hotReloadInGameEditorIfNeeded]
  );

  const renameLayout = (oldName: string, newName: string) => {
    const { currentProject } = state;
    const { i18n } = props;
    if (!currentProject) return;

    if (!currentProject.hasLayoutNamed(oldName) || newName === oldName) return;

    const uniqueNewName = newNameGenerator(
      newName || i18n._(t`Unnamed`),
      tentativeNewName => {
        return currentProject.hasLayoutNamed(tentativeNewName);
      }
    );

    const layout = currentProject.getLayout(oldName);
    const shouldChangeProjectFirstLayout =
      oldName === currentProject.getFirstLayout();
    setState(state => ({
      ...state,
      editorTabs: closeLayoutTabs(state.editorTabs, layout),
    })).then(state => {
      layout.setName(uniqueNewName);
      gd.WholeProjectRefactorer.renameLayout(
        currentProject,
        oldName,
        uniqueNewName
      );
      if (inAppTutorialOrchestratorRef.current) {
        inAppTutorialOrchestratorRef.current.changeData(oldName, uniqueNewName);
      }
      if (shouldChangeProjectFirstLayout) {
        currentProject.setFirstLayout(uniqueNewName);
      }
      hotReloadInGameEditorIfNeeded({
        projectDataOnlyExport: true,
        shouldReloadResources: false,
      });
      _onProjectItemModified();
    });
  };

  const renameExternalLayout = (oldName: string, newName: string) => {
    const { currentProject } = state;
    const { i18n } = props;
    if (!currentProject) return;

    if (!currentProject.hasExternalLayoutNamed(oldName) || newName === oldName)
      return;

    const uniqueNewName = newNameGenerator(
      newName || i18n._(t`Unnamed`),
      tentativeNewName => {
        return currentProject.hasExternalLayoutNamed(tentativeNewName);
      }
    );

    const externalLayout = currentProject.getExternalLayout(oldName);
    setState(state => ({
      ...state,
      editorTabs: closeExternalLayoutTabs(state.editorTabs, externalLayout),
    })).then(state => {
      externalLayout.setName(uniqueNewName);
      gd.WholeProjectRefactorer.renameExternalLayout(
        currentProject,
        oldName,
        uniqueNewName
      );
      hotReloadInGameEditorIfNeeded({
        projectDataOnlyExport: true,
        shouldReloadResources: false,
      });
      _onProjectItemModified();
    });
  };

  const renameExternalEvents = (oldName: string, newName: string) => {
    const { currentProject } = state;
    const { i18n } = props;
    if (!currentProject) return;

    if (!currentProject.hasExternalEventsNamed(oldName) || newName === oldName)
      return;

    const uniqueNewName = newNameGenerator(
      newName || i18n._(t`Unnamed`),
      tentativeNewName => {
        return currentProject.hasExternalEventsNamed(tentativeNewName);
      }
    );

    const externalEvents = currentProject.getExternalEvents(oldName);
    setState(state => ({
      ...state,
      editorTabs: closeExternalEventsTabs(state.editorTabs, externalEvents),
    })).then(state => {
      externalEvents.setName(uniqueNewName);
      gd.WholeProjectRefactorer.renameExternalEvents(
        currentProject,
        oldName,
        uniqueNewName
      );
      _onProjectItemModified();
    });
  };

  const renameEventsFunctionsExtension = (oldName: string, newName: string) => {
    const { currentProject } = state;
    if (!currentProject) return;

    if (
      !currentProject.hasEventsFunctionsExtensionNamed(oldName) ||
      newName === oldName
    )
      return;

    const safeAndUniqueNewName = newNameGenerator(
      gd.Project.getSafeName(newName),
      tentativeNewName => {
        return isExtensionNameTaken(tentativeNewName, currentProject);
      }
    );

    const eventsFunctionsExtension = currentProject.getEventsFunctionsExtension(
      oldName
    );

    // Refactor the project to update the instructions (and later expressions)
    // of this extension:
    gd.WholeProjectRefactorer.renameEventsFunctionsExtension(
      currentProject,
      eventsFunctionsExtension,
      oldName,
      safeAndUniqueNewName
    );
    eventsFunctionsExtension.setName(safeAndUniqueNewName);
    eventsFunctionsExtensionsState.unloadProjectEventsFunctionsExtension(
      currentProject,
      oldName
    );

    // TODO Replace the tabs instead on closing them.
    setState(state => ({
      ...state,
      editorTabs: closeEventsFunctionsExtensionTabs(state.editorTabs, oldName),
    })).then(state => {
      eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions(
        currentProject
      );
      _onProjectItemModified();
    });
  };

  const onRenamedEventsBasedObject = (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    oldName: string,
    newName: string
  ) => {
    // TODO Replace the tabs instead on closing them.
    setState(state => ({
      ...state,
      editorTabs: closeCustomObjectTab(
        state.editorTabs,
        eventsFunctionsExtension.getName(),
        oldName
      ),
    }));
  };

  const onDeletedEventsBasedObject = (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    name: string
  ) => {
    setState(state => ({
      ...state,
      editorTabs: closeCustomObjectTab(
        state.editorTabs,
        eventsFunctionsExtension.getName(),
        name
      ),
    }));
  };

  const deleteEventsBasedObjectVariant = (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventBasedObject: gdEventsBasedObject,
    variant: gdEventsBasedObjectVariant
  ): void => {
    const variants = eventBasedObject.getVariants();
    const variantName = variant.getName();
    if (!variants.hasVariantNamed(variantName)) {
      return;
    }
    variants.removeVariant(variantName);

    setState(state => ({
      ...state,
      editorTabs: closeEventsBasedObjectVariantTab(
        state.editorTabs,
        eventsFunctionsExtension.getName(),
        eventBasedObject.getName(),
        variantName
      ),
    }));
  };

  const setPreviewedLayout = ({
    layoutName,
    externalLayoutName,
    eventsBasedObjectType,
    eventsBasedObjectVariantName,
  }: {
    layoutName: string | null,
    externalLayoutName: string | null,
    eventsBasedObjectType: string | null,
    eventsBasedObjectVariantName: string | null,
  }) => {
    setPreviewState(
      previewState =>
        ({
          ...previewState,
          previewLayoutName: layoutName,
          previewExternalLayoutName: externalLayoutName,
          eventsBasedObjectType,
          eventsBasedObjectVariantName,
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
        hasUnsavedChanges && // Only create an autosave if there are unsaved changes.
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
      hasUnsavedChanges,
    ]
  );

  const _launchPreview = React.useCallback(
    async ({
      networkPreview,
      numberOfWindows,
      hotReload,
      projectDataOnlyExport,
      shouldReloadResources,
      fullLoadingScreen,
      forceDiagnosticReport,
      launchCaptureOptions,
      isForInGameEdition,
    }: LaunchPreviewOptions) => {
      if (!currentProject) return;
      if (currentProject.getLayoutsCount() === 0) return;

      const previewLauncher = _previewLauncher.current;
      if (!previewLauncher) return;

      setPreviewLoading(true);
      notifyPreviewOrExportWillStart(state.editorTabs);

      const layoutName = isForInGameEdition
        ? isForInGameEdition.forcedSceneName
        : previewState.isPreviewOverriden
        ? previewState.overridenPreviewLayoutName
        : previewState.previewLayoutName;
      const externalLayoutName = isForInGameEdition
        ? isForInGameEdition.forcedExternalLayoutName
        : previewState.isPreviewOverriden
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

      await autosaveProjectIfNeeded();

      // Note that in the future, this kind of checks could be done
      // and stored in a "diagnostic report", rather than hiding errors
      // from the user.
      findAndLogProjectPreviewErrors(currentProject);

      const fallbackAuthor = authenticatedUser.profile
        ? {
            username: authenticatedUser.profile.username || '',
            id: authenticatedUser.profile.id,
          }
        : null;

      const authenticatedPlayer = await getAuthenticatedPlayerForPreview();

      const captureOptions = await createCaptureOptionsForPreview(
        launchCaptureOptions
      );

      try {
        await eventsFunctionsExtensionsState.ensureLoadFinished();

        const startTime = Date.now();
        let inAppTutorialMessageInPreview = { message: '', position: '' };
        if (inAppTutorialOrchestratorRef.current) {
          inAppTutorialMessageInPreview =
            inAppTutorialOrchestratorRef.current.getPreviewMessage() ||
            inAppTutorialMessageInPreview;
        }
        await previewLauncher.launchPreview({
          project: currentProject,
          // TODO: replace by scene name and external layout name
          layout,
          externalLayout,
          eventsBasedObjectType: isForInGameEdition
            ? previewState.eventsBasedObjectType
            : null,
          eventsBasedObjectVariantName: isForInGameEdition
            ? previewState.eventsBasedObjectVariantName
            : null,
          networkPreview: !!networkPreview,
          hotReload: !!hotReload,
          projectDataOnlyExport: !!projectDataOnlyExport,
          shouldReloadResources: !!shouldReloadResources,
          fullLoadingScreen: !!fullLoadingScreen,
          fallbackAuthor,
          authenticatedPlayer,
          getIsMenuBarHiddenInPreview: preferences.getIsMenuBarHiddenInPreview,
          getIsAlwaysOnTopInPreview: preferences.getIsAlwaysOnTopInPreview,
          numberOfWindows: numberOfWindows === undefined ? 1 : numberOfWindows,
          isForInGameEdition: !!isForInGameEdition,
          editorId: isForInGameEdition ? isForInGameEdition.editorId : '',
          inAppTutorialMessageInPreview: inAppTutorialMessageInPreview.message,
          inAppTutorialMessagePositionInPreview:
            inAppTutorialMessageInPreview.position,
          captureOptions,
          onCaptureFinished,
        });
        setPreviewLoading(false);

        if (!isForInGameEdition)
          sendPreviewStarted({
            quickCustomizationGameId:
              quickCustomizationDialogOpenedFromGameId || null,
            networkPreview: !!networkPreview,
            hotReload: !!hotReload,
            projectDataOnlyExport: !!projectDataOnlyExport,
            fullLoadingScreen: !!fullLoadingScreen,
            numberOfWindows: numberOfWindows || 1,
            forceDiagnosticReport: !!forceDiagnosticReport,
            previewLaunchDuration: Date.now() - startTime,
          });

        if (inAppTutorialOrchestratorRef.current) {
          inAppTutorialOrchestratorRef.current.onPreviewLaunch();
        }
        if (!currentlyRunningInAppTutorial) {
          const wholeProjectDiagnosticReport = currentProject.getWholeProjectDiagnosticReport();
          if (
            (forceDiagnosticReport ||
              preferences.values.openDiagnosticReportAutomatically) &&
            wholeProjectDiagnosticReport.hasAnyIssue()
          ) {
            setDiagnosticReportDialogOpen(true);
          }
        }
      } catch (error) {
        console.error(
          'Error caught while launching preview, this should never happen.',
          error
        );
      }
    },
    [
      currentProject,
      state.editorTabs,
      previewState.isPreviewOverriden,
      previewState.overridenPreviewLayoutName,
      previewState.previewLayoutName,
      previewState.overridenPreviewExternalLayoutName,
      previewState.previewExternalLayoutName,
      previewState.eventsBasedObjectType,
      previewState.eventsBasedObjectVariantName,
      autosaveProjectIfNeeded,
      authenticatedUser.profile,
      eventsFunctionsExtensionsState,
      preferences.getIsMenuBarHiddenInPreview,
      preferences.getIsAlwaysOnTopInPreview,
      preferences.values.openDiagnosticReportAutomatically,
      currentlyRunningInAppTutorial,
      getAuthenticatedPlayerForPreview,
      quickCustomizationDialogOpenedFromGameId,
      onCaptureFinished,
      createCaptureOptionsForPreview,
    ]
  );

  const launchPreview = addCreateBadgePreHookIfNotClaimed(
    authenticatedUser,
    TRIVIAL_FIRST_PREVIEW,
    _launchPreview
  );

  const launchNewPreview = React.useCallback(
    async options => {
      const numberOfWindows = options ? options.numberOfWindows : 1;
      await launchPreview({ networkPreview: false, numberOfWindows });
    },
    [launchPreview]
  );

  const launchHotReloadPreview = React.useCallback(
    async () => {
      const launchCaptureOptions = currentProject
        ? getHotReloadPreviewLaunchCaptureOptions(
            currentProject.getProjectUuid()
          )
        : undefined;
      await launchPreview({
        networkPreview: false,
        hotReload: true,
        launchCaptureOptions,
      });
    },
    [currentProject, launchPreview, getHotReloadPreviewLaunchCaptureOptions]
  );

  const launchNetworkPreview = React.useCallback(
    () => launchPreview({ networkPreview: true, hotReload: false }),
    [launchPreview]
  );

  const launchPreviewWithDiagnosticReport = React.useCallback(
    () => launchPreview({ forceDiagnosticReport: true }),
    [launchPreview]
  );

  const onLaunchPreviewForInGameEdition = React.useCallback(
    ({
      editorId,
      sceneName,
      externalLayoutName,
      eventsBasedObjectType,
      eventsBasedObjectVariantName,
      hotReload,
      projectDataOnlyExport,
      shouldReloadResources,
    }: {|
      editorId: string,
      sceneName: string | null,
      externalLayoutName: string | null,
      eventsBasedObjectType: string | null,
      eventsBasedObjectVariantName: string | null,
      hotReload: boolean,
      projectDataOnlyExport: boolean,
      shouldReloadResources: boolean,
    |}) => {
      launchPreview({
        networkPreview: false,
        hotReload,
        projectDataOnlyExport,
        shouldReloadResources,
        forceDiagnosticReport: false,
        isForInGameEdition: {
          editorId,
          forcedSceneName: sceneName,
          forcedExternalLayoutName: externalLayoutName,
          eventsBasedObjectType,
          eventsBasedObjectVariantName,
        },
        numberOfWindows: 0,
      });
    },
    [launchPreview]
  );

  const relaunchAndThenHardReloadAllPreviews = React.useCallback(
    async () => {
      // Build a new preview (so that any changes in runtime files are picked up)
      // and then ask all previews to "hard reload" themselves (i.e: refresh their page).
      await launchPreview({
        networkPreview: false,
        hotReload: false,
        forceDiagnosticReport: false,
        numberOfWindows: 0,
      });

      hardReloadAllPreviews();
    },
    [hardReloadAllPreviews, launchPreview]
  );

  const launchQuickCustomizationPreview = React.useCallback(
    () =>
      launchPreview({
        networkPreview: false,
        launchCaptureOptions: {
          screenshots: [
            { delayTimeInSeconds: 1000 }, // Take one quickly in case the user closes the preview too fast.
            { delayTimeInSeconds: 5000 }, // Take another one after longer into the game.
          ],
        },
        hotReload: true,
        projectDataOnlyExport: true,
      }),
    [launchPreview]
  );

  const hotReloadPreviewButtonProps: HotReloadPreviewButtonProps = React.useMemo(
    () => ({
      hasPreviewsRunning: hasNonEditionPreviewsRunning,
      launchProjectWithLoadingScreenPreview: () =>
        launchPreview({ fullLoadingScreen: true }),
      launchProjectDataOnlyPreview: () =>
        launchPreview({ hotReload: true, projectDataOnlyExport: true }),
      launchProjectCodeAndDataPreview: () =>
        launchPreview({ hotReload: true, projectDataOnlyExport: false }),
    }),
    [hasNonEditionPreviewsRunning, launchPreview]
  );

  const getEditorsTabStateWithScene = React.useCallback(
    (
      editorTabs: EditorTabsState,
      name: string,
      {
        openEventsEditor,
        openSceneEditor,
        focusWhenOpened,
      }: {|
        openEventsEditor: boolean,
        openSceneEditor: boolean,
        focusWhenOpened:
          | 'scene-or-events-otherwise'
          | 'scene'
          | 'events'
          | 'none',
      |}
    ): EditorTabsState => {
      const sceneEditorOptions = getEditorOpeningOptions({
        kind: 'layout',
        name,
        dontFocusTab: !(
          focusWhenOpened === 'scene' ||
          focusWhenOpened === 'scene-or-events-otherwise'
        ),
      });
      const eventsEditorOptions = getEditorOpeningOptions({
        kind: 'layout events',
        name,
        dontFocusTab: !(
          focusWhenOpened === 'events' ||
          (focusWhenOpened === 'scene-or-events-otherwise' && !openSceneEditor)
        ),
      });

      const tabsWithSceneEditor = openSceneEditor
        ? openEditorTab(editorTabs, sceneEditorOptions)
        : editorTabs;
      return openEventsEditor
        ? openEditorTab(tabsWithSceneEditor, eventsEditorOptions)
        : tabsWithSceneEditor;
    },
    [getEditorOpeningOptions]
  );

  const openLayout = React.useCallback(
    (
      name: string,
      options?: {|
        openEventsEditor: boolean,
        openSceneEditor: boolean,
        focusWhenOpened:
          | 'scene-or-events-otherwise'
          | 'scene'
          | 'events'
          | 'none',
      |} = {
        openEventsEditor: true,
        openSceneEditor: true,
        focusWhenOpened: 'scene',
      },
      editorTabs?: EditorTabsState
    ): void => {
      setState(state => ({
        ...state,
        editorTabs: getEditorsTabStateWithScene(
          editorTabs || state.editorTabs,
          name,
          {
            openEventsEditor: options.openEventsEditor,
            openSceneEditor: options.openSceneEditor,
            focusWhenOpened: options.focusWhenOpened,
          }
        ),
      }));
    },
    [setState, getEditorsTabStateWithScene]
  );

  const openExternalEvents = React.useCallback(
    (name: string) => {
      setState(state => ({
        ...state,
        editorTabs: openEditorTab(
          state.editorTabs,
          getEditorOpeningOptions({ kind: 'external events', name })
        ),
      }));
    },
    [setState, getEditorOpeningOptions]
  );

  const openExternalLayout = React.useCallback(
    (name: string) => {
      setState(state => ({
        ...state,
        editorTabs: openEditorTab(
          state.editorTabs,
          getEditorOpeningOptions({ kind: 'external layout', name })
        ),
      }));
    },
    [setState, getEditorOpeningOptions]
  );

  const openEventsFunctionsExtension = React.useCallback(
    (
      name: string,
      initiallyFocusedFunctionName?: ?string,
      initiallyFocusedBehaviorName?: ?string,
      initiallyFocusedObjectName?: ?string
    ) => {
      setState(state => ({
        ...state,
        editorTabs: openEditorTab(state.editorTabs, {
          ...getEditorOpeningOptions({
            kind: 'events functions extension',
            name,
            project: currentProject,
          }),
          extraEditorProps: {
            initiallyFocusedFunctionName,
            initiallyFocusedBehaviorName,
            initiallyFocusedObjectName,
          },
        }),
      }));
    },
    [currentProject, setState, getEditorOpeningOptions]
  );

  const openResources = React.useCallback(
    () => {
      setState(state => ({
        ...state,
        editorTabs: openEditorTab(
          state.editorTabs,
          getEditorOpeningOptions({ kind: 'resources', name: '' })
        ),
      }));
    },
    [getEditorOpeningOptions, setState]
  );

  const openHomePage = React.useCallback(
    () => {
      setState(state => ({
        ...state,
        editorTabs: openEditorTab(
          state.editorTabs,
          getEditorOpeningOptions({ kind: 'start page', name: '' })
        ),
      }));
    },
    [setState, getEditorOpeningOptions]
  );

  const closeDialogsToOpenHomePage = React.useCallback(() => {
    setShareDialogOpen(false);
  }, []);

  const { navigateToRoute } = useHomepageWitchForRouting({
    openHomePage,
    closeDialogs: closeDialogsToOpenHomePage,
  });

  const _openDebugger = React.useCallback(
    () => {
      setState(state => ({
        ...state,
        editorTabs: openEditorTab(
          state.editorTabs,
          getEditorOpeningOptions({ kind: 'debugger', name: '' })
        ),
      }));
    },
    [getEditorOpeningOptions, setState]
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
      const eventsBasedEntityName = functionName.behaviorName;

      let eventBasedBehaviorName = null;
      let eventBasedObjectName = null;
      if (eventsBasedEntityName) {
        if (
          eventsFunctionsExtension
            .getEventsBasedBehaviors()
            .has(eventsBasedEntityName)
        ) {
          eventBasedBehaviorName = eventsBasedEntityName;
        } else if (
          eventsFunctionsExtension
            .getEventsBasedObjects()
            .has(eventsBasedEntityName)
        ) {
          eventBasedObjectName = eventsBasedEntityName;
        }
      }

      const foundTab = getEventsFunctionsExtensionEditor(
        editorTabs,
        eventsFunctionsExtension
      );
      if (foundTab) {
        // Open the given function and focus the tab
        foundTab.editor.selectEventsFunctionByName(
          functionName.name,
          eventBasedBehaviorName,
          eventBasedObjectName
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
          eventBasedBehaviorName,
          eventBasedObjectName
        );
      }
    } else {
      // It's not an events functions extension, we should not be here.
      console.warn(
        `Extension with name=${extensionName} can not be opened (no editor for this)`
      );
    }
  };

  const openCustomObjectEditor = React.useCallback(
    (
      eventsFunctionsExtension: gdEventsFunctionsExtension,
      eventsBasedObject: gdEventsBasedObject,
      variantName: string
    ) => {
      const { currentProject, editorTabs } = state;
      if (!currentProject) return;

      const foundTab = getCustomObjectEditor(
        editorTabs,
        eventsFunctionsExtension,
        eventsBasedObject,
        variantName
      );
      if (foundTab) {
        setState(state => ({
          ...state,
          editorTabs: changeCurrentTab(editorTabs, foundTab.tabIndex),
        }));
      } else {
        // Open a new editor for the extension and the given function
        setState(state => ({
          ...state,
          editorTabs: openEditorTab(state.editorTabs, {
            ...getEditorOpeningOptions({
              kind: 'custom object',
              name:
                eventsFunctionsExtension.getName() +
                '::' +
                eventsBasedObject.getName() +
                (eventsBasedObject.getVariants().hasVariantNamed(variantName)
                  ? '::' + variantName
                  : ''),
              project: currentProject,
            }),
          }),
        }));
      }
    },
    [getEditorOpeningOptions, setState, state]
  );

  const openObjectEvents = (extensionName: string, objectName: string) => {
    const { currentProject, editorTabs } = state;
    if (!currentProject) return;

    if (currentProject.hasEventsFunctionsExtensionNamed(extensionName)) {
      // It's an events functions extension, open the editor for it.
      const eventsFunctionsExtension = currentProject.getEventsFunctionsExtension(
        extensionName
      );

      const foundTab = getEventsFunctionsExtensionEditor(
        editorTabs,
        eventsFunctionsExtension
      );
      if (foundTab) {
        // Open the given function and focus the tab
        foundTab.editor.selectEventsBasedBehaviorByName(objectName);
        setState(state => ({
          ...state,
          editorTabs: changeCurrentTab(editorTabs, foundTab.tabIndex),
        }));
      } else {
        // Open a new editor for the extension and the given function
        openEventsFunctionsExtension(extensionName, null, null, objectName);
      }
    } else {
      // It's not an events functions extension, we should not be here.
      console.warn(
        `Extension with name=${extensionName} can not be opened (no editor for this)`
      );
    }
  };

  const openBehaviorEvents = (extensionName: string, behaviorName: string) => {
    const { currentProject, editorTabs } = state;
    if (!currentProject) return;

    if (currentProject.hasEventsFunctionsExtensionNamed(extensionName)) {
      // It's an events functions extension, open the editor for it.
      const eventsFunctionsExtension = currentProject.getEventsFunctionsExtension(
        extensionName
      );

      const foundTab = getEventsFunctionsExtensionEditor(
        editorTabs,
        eventsFunctionsExtension
      );
      if (foundTab) {
        // Open the given function and focus the tab
        foundTab.editor.selectEventsBasedBehaviorByName(behaviorName);
        setState(state => ({
          ...state,
          editorTabs: changeCurrentTab(editorTabs, foundTab.tabIndex),
        }));
      } else {
        // Open a new editor for the extension and the given function
        openEventsFunctionsExtension(extensionName, null, behaviorName, null);
      }
    } else {
      // It's not an events functions extension, we should not be here.
      console.warn(
        `Extension with name=${extensionName} can not be opened (no editor for this)`
      );
    }
  };

  const onExtractAsExternalLayout = (name: string) => {
    hotReloadInGameEditorIfNeeded({
      projectDataOnlyExport: true,
      shouldReloadResources: false,
    });
    openExternalLayout(name);
  };

  const onOpenEventBasedObjectEditor = (
    extensionName: string,
    eventsBasedObjectName: string
  ) => {
    if (
      !currentProject ||
      !currentProject.hasEventsFunctionsExtensionNamed(extensionName)
    ) {
      return;
    }
    openEventsFunctionsExtension(
      extensionName,
      null,
      null,
      eventsBasedObjectName
    );
    const eventsFunctionsExtension = currentProject.getEventsFunctionsExtension(
      extensionName
    );
    const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
    if (!eventsBasedObjects.has(eventsBasedObjectName)) {
      return;
    }
    const eventsBasedObject = eventsBasedObjects.get(eventsBasedObjectName);
    openCustomObjectEditor(eventsFunctionsExtension, eventsBasedObject, '');

    // Trigger reloading of extensions as an extension was modified (or even added)
    // to create the custom object.
    eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
      currentProject
    );
  };

  const onEventBasedObjectTypeChanged = React.useCallback(
    () => {
      hotReloadInGameEditorIfNeeded({
        projectDataOnlyExport: false,
        shouldReloadResources: false,
      });
    },
    [hotReloadInGameEditorIfNeeded]
  );

  const onExtractAsEventBasedObject = (
    extensionName: string,
    eventsBasedObjectName: string
  ) => {
    onEventBasedObjectTypeChanged();
    onOpenEventBasedObjectEditor(extensionName, eventsBasedObjectName);
  };

  const onOpenEventBasedObjectVariantEditor = (
    extensionName: string,
    eventsBasedObjectName: string,
    variantName: string
  ) => {
    if (!currentProject) return;
    if (!currentProject.hasEventsFunctionsExtensionNamed(extensionName)) {
      return;
    }
    const eventsFunctionsExtension = currentProject.getEventsFunctionsExtension(
      extensionName
    );
    const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
    if (!eventsBasedObjects.has(eventsBasedObjectName)) {
      return;
    }
    const eventsBasedObject = eventsBasedObjects.get(eventsBasedObjectName);
    openCustomObjectEditor(
      eventsFunctionsExtension,
      eventsBasedObject,
      variantName
    );

    // Trigger reloading of extensions as an extension was modified (or even added)
    // to create the custom object.
    eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
      currentProject
    );
  };

  const onEventsBasedObjectChildrenEdited = React.useCallback(
    (eventsBasedObject: gdEventsBasedObject) => {
      const project = state.currentProject;
      if (!project) {
        return;
      }
      gd.EventsBasedObjectVariantHelper.complyVariantsToEventsBasedObject(
        project,
        eventsBasedObject
      );

      for (const editor of state.editorTabs.editors) {
        const { editorRef } = editor;
        if (editorRef) {
          editorRef.onEventsBasedObjectChildrenEdited();
        }
      }
    },
    [state.editorTabs, state.currentProject]
  );

  const onSceneObjectEdited = React.useCallback(
    (scene: gdLayout, objectWithContext: ObjectWithContext) => {
      for (const editor of state.editorTabs.editors) {
        const { editorRef } = editor;
        if (editorRef) {
          editorRef.onSceneObjectEdited(scene, objectWithContext);
        }
      }
    },
    [state.editorTabs]
  );

  const onSceneObjectsDeleted = React.useCallback(
    (scene: gdLayout) => {
      for (const editor of state.editorTabs.editors) {
        const { editorRef } = editor;
        if (editorRef) {
          editorRef.onSceneObjectsDeleted(scene);
        }
      }
    },
    [state.editorTabs]
  );

  const onSceneEventsModifiedOutsideEditor = React.useCallback(
    (changes: SceneEventsOutsideEditorChanges) => {
      for (const editor of state.editorTabs.editors) {
        const { editorRef } = editor;
        if (editorRef) {
          editorRef.onSceneEventsModifiedOutsideEditor(changes);
        }
      }
    },
    [state.editorTabs]
  );

  // TODO Register to ResourcesWatcher and make the Runtime forget about
  // already loaded resources.
  const onResourceExternallyChanged = React.useCallback(
    () => {
      // TODO editorRef is `undefined` when the window is not focused so it doesn't do anything.
      hotReloadInGameEditorIfNeeded({
        projectDataOnlyExport: true,
        shouldReloadResources: true,
      });
    },
    [hotReloadInGameEditorIfNeeded]
  );

  const onResourceUsageChanged = React.useCallback(
    () => {
      hotReloadInGameEditorIfNeeded({
        projectDataOnlyExport: true,
        shouldReloadResources: false,
      });
    },
    [hotReloadInGameEditorIfNeeded]
  );

  const _onProjectItemModified = () => {
    triggerUnsavedChanges();
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

    extension.getEventsFunctions().insertEventsFunction(eventsFunction, 0);
    eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
      currentProject
    );
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

  // When opening a project, we always open a scene to avoid confusing the user.
  // If it has no scene (new project), we create one and open it.
  // If it has one scene, we open it.
  // If it has more than one scene, we open the first one and we also open the project manager.
  const openSceneOrProjectManager = React.useCallback(
    (newState: {|
      currentProject: ?gdProject,
      editorTabs: EditorTabsState,
    |}) => {
      const { currentProject, editorTabs } = newState;
      if (!currentProject) return;

      if (currentProject.getLayoutsCount() === 0) {
        const layoutName = i18n._(t`Untitled scene`);
        currentProject.insertNewLayout(layoutName, 0);
        const layout = currentProject.getLayout(layoutName);
        addDefaultLightToAllLayers(layout);
      }
      openLayout(
        currentProject.getLayoutAt(0).getName(),
        {
          openSceneEditor: true,
          openEventsEditor: true,
          focusWhenOpened: 'scene',
        },
        editorTabs
      );
      setIsLoadingProject(false);
      setLoaderModalProgress(null, null);

      if (currentProject.getLayoutsCount() > 1) {
        openProjectManager(true);
      } else {
        openProjectManager(false);
      }
    },
    [openLayout, i18n]
  );

  const getEditorsTabStateWithAllScenes = React.useCallback(
    (newState: {|
      currentProject: ?gdProject,
      editorTabs: EditorTabsState,
    |}): EditorTabsState => {
      const { currentProject, editorTabs } = newState;
      if (!currentProject) return editorTabs;
      const layoutsCount = currentProject.getLayoutsCount();
      if (layoutsCount === 0) return editorTabs;

      let editorTabsWithAllScenes = editorTabs;
      for (let layoutIndex = 0; layoutIndex < layoutsCount; layoutIndex++) {
        editorTabsWithAllScenes = getEditorsTabStateWithScene(
          editorTabsWithAllScenes,
          currentProject.getLayoutAt(layoutIndex).getName(),
          {
            openSceneEditor: true,
            openEventsEditor: true,
            focusWhenOpened: 'scene',
          }
        );
      }
      return editorTabsWithAllScenes;
    },
    [getEditorsTabStateWithScene]
  );

  const openAllScenes = React.useCallback(
    (newState: {|
      currentProject: ?gdProject,
      editorTabs: EditorTabsState,
    |}) => {
      const { currentProject } = newState;
      if (!currentProject) return;
      const layoutsCount = currentProject.getLayoutsCount();
      if (layoutsCount === 0) return;

      setState(state => ({
        ...state,
        editorTabs: getEditorsTabStateWithAllScenes(newState),
      }));

      // Re-open first layout as this is usually the entry point for a game.
      const firstLayout =
        currentProject.getFirstLayout() || // First layout can be empty
        currentProject.getLayoutAt(0).getName();
      openLayout(firstLayout, {
        openSceneEditor: true,
        openEventsEditor: true,
        focusWhenOpened: 'scene',
      });

      setIsLoadingProject(false);
      setLoaderModalProgress(null, null);
      openProjectManager(false);
    },
    [getEditorsTabStateWithAllScenes, setState, openLayout]
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
            if (state) {
              const { currentProject } = state;
              if (
                currentProject &&
                hasAPreviousSaveForEditorTabsState(currentProject)
              ) {
                const openedEditorsCount = openEditorTabsFromPersistedState(
                  currentProject
                );
                if (openedEditorsCount === 0) {
                  openSceneOrProjectManager({
                    currentProject: currentProject,
                    editorTabs: state.editorTabs,
                  });
                } else {
                  setIsLoadingProject(false);
                  setLoaderModalProgress(null, null);
                  openProjectManager(false);
                }
              } else {
                openSceneOrProjectManager({
                  currentProject: currentProject,
                  editorTabs: state.editorTabs,
                });
              }
              const currentStorageProvider = getStorageProvider();
              if (currentStorageProvider.internalName === 'LocalFile') {
                setHasProjectOpened(true);
              }
            }
          });
        })
        .catch(error => {
          const errorMessage = storageProviderOperations.getOpenErrorMessage
            ? storageProviderOperations.getOpenErrorMessage(error)
            : t`Verify that you have the authorization for reading the file you're trying to access.`;
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
      hasAPreviousSaveForEditorTabsState,
      openEditorTabsFromPersistedState,
      getStorageProviderOperations,
      openFromFileMetadata,
      openSceneOrProjectManager,
      getStorageProvider,
      setHasProjectOpened,
    ]
  );

  const openFromFileMetadataWithStorageProvider = React.useCallback(
    async (
      fileMetadataAndStorageProviderName: FileMetadataAndStorageProviderName,
      options: ?{|
        openAllScenes?: boolean,
        ignoreUnsavedChanges?: boolean,
        openingMessage?: ?MessageDescriptor,
      |}
    ): Promise<void> => {
      if (hasUnsavedChanges && !(options && options.ignoreUnsavedChanges)) {
        const answer = Window.showConfirmDialog(
          i18n._(
            t`Open a new project? Any changes that have not been saved will be lost.`
          )
        );
        if (!answer) return;
      }

      const { fileMetadata } = fileMetadataAndStorageProviderName;
      const storageProvider = findStorageProviderFor(
        i18n,
        props.storageProviders,
        fileMetadataAndStorageProviderName
      );

      if (!storageProvider) return;

      getStorageProviderOperations(storageProvider);
      await openFromFileMetadata(fileMetadata, {
        openingMessage: (options && options.openingMessage) || null,
      })
        .then(state => {
          if (state) {
            const { currentProject } = state;
            if (options && options.openAllScenes) {
              openAllScenes({
                currentProject: currentProject,
                editorTabs: state.editorTabs,
              });
            } else if (
              currentProject &&
              hasAPreviousSaveForEditorTabsState(currentProject)
            ) {
              const openedEditorsCount = openEditorTabsFromPersistedState(
                currentProject
              );
              if (openedEditorsCount === 0) {
                openSceneOrProjectManager({
                  currentProject: currentProject,
                  editorTabs: state.editorTabs,
                });
              } else {
                setIsLoadingProject(false);
                setLoaderModalProgress(null, null);
                openProjectManager(false);
              }
            } else {
              openSceneOrProjectManager({
                currentProject: currentProject,
                editorTabs: state.editorTabs,
              });
            }
            const currentStorageProvider = getStorageProvider();
            if (currentStorageProvider.internalName === 'LocalFile') {
              setHasProjectOpened(true);
            }
          }
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
      hasUnsavedChanges,

      getStorageProvider,
      setHasProjectOpened,
      openAllScenes,
      hasAPreviousSaveForEditorTabsState,
      openEditorTabsFromPersistedState,
    ]
  );

  const onOpenCloudProjectOnSpecificVersion = React.useCallback(
    ({
      fileMetadata,
      versionId,
      ignoreUnsavedChanges,
      openingMessage,
    }: {|
      fileMetadata: FileMetadata,
      versionId: string,
      ignoreUnsavedChanges: boolean,
      openingMessage: MessageDescriptor,
    |}): Promise<void> => {
      return openFromFileMetadataWithStorageProvider(
        {
          storageProviderName: 'Cloud',
          fileMetadata: {
            ...fileMetadata,
            version: versionId,
          },
        },
        { ignoreUnsavedChanges, openingMessage }
      );
    },
    [openFromFileMetadataWithStorageProvider]
  );

  const {
    renderVersionHistoryPanel,
    openVersionHistoryPanel,
    checkedOutVersionStatus,
    onQuitVersionHistory,
  } = useVersionHistory({
    getStorageProvider,
    isSavingProject,
    fileMetadata: currentFileMetadata,
    onOpenCloudProjectOnSpecificVersion,
  });

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
    async (
      options: ?{|
        requestedStorageProvider?: StorageProvider,
        forcedSavedAsLocation?: SaveAsLocation,
      |}
    ) => {
      if (!currentProject) return;
      // Prevent saving if there are errors in the extension modules, as
      // this can lead to corrupted projects.
      if (hasExtensionLoadErrors) return;

      saveUiSettings(state.editorTabs);

      // Protect against concurrent saves, which can trigger issues with the
      // file system.
      if (isSavingProject) {
        console.info('Project is already being saved, not triggering save.');
        return;
      }

      // Remember the old storage provider, as we may need to use it to get access
      // to resources.
      const oldStorageProvider = getStorageProvider();
      const oldStorageProviderOperations = getStorageProviderOperations();

      // Get the methods to save the project using the *new* storage provider.
      const requestedStorageProvider =
        options && options.requestedStorageProvider;
      const newStorageProviderOperations = getStorageProviderOperations(
        requestedStorageProvider
      );
      const newStorageProvider = getStorageProvider();

      const {
        onSaveProjectAs,
        onChooseSaveProjectAsLocation,
        getWriteErrorMessage,
        canFileMetadataBeSafelySavedAs,
      } = newStorageProviderOperations;
      if (!onSaveProjectAs) {
        // The new storage provider can't even save as. It's strange that it was even
        // selected here.
        return;
      }

      setIsSavingProject(true);

      // At the end of the promise below, currentProject and storageProvider
      // may have changed (if the user opened another project). So we read and
      // store their values in variables now.
      const storageProviderInternalName = newStorageProvider.internalName;

      try {
        let newSaveAsLocation: ?SaveAsLocation =
          options && options.forcedSavedAsLocation;
        let newSaveAsOptions: ?SaveAsOptions = null;
        if (onChooseSaveProjectAsLocation && !newSaveAsLocation) {
          const {
            saveAsLocation,
            saveAsOptions,
          } = await onChooseSaveProjectAsLocation({
            project: currentProject,
            fileMetadata: currentFileMetadata,
            displayOptionToGenerateNewProjectUuid:
              // No need to display the option if current file metadata doesn't have
              // a gameId...
              !!currentFileMetadata &&
              !!currentFileMetadata.gameId &&
              // ... or if the project is opened from a URL.
              oldStorageProvider.internalName !== 'UrlStorageProvider',
          });
          if (!saveAsLocation) {
            // Save as was cancelled.
            // Restore former storage provider. This is useful in case a user
            // cancels the "save as" operation and then saves again. If the
            // storage provider was kept selected, it would directly save the project
            // if it's possible (LocalFile storage provider allows it).
            getStorageProviderOperations(oldStorageProvider);
            return;
          }
          newSaveAsLocation = saveAsLocation;
          newSaveAsOptions = saveAsOptions;
        }

        if (canFileMetadataBeSafelySavedAs && currentFileMetadata) {
          const canProjectBeSafelySavedAs = await canFileMetadataBeSafelySavedAs(
            currentFileMetadata,
            {
              showAlert,
              showConfirmation,
            }
          );

          if (!canProjectBeSafelySavedAs) return;
        }

        let originalProjectUuid = null;
        if (newSaveAsOptions && newSaveAsOptions.generateNewProjectUuid) {
          originalProjectUuid = currentProject.getProjectUuid();
          currentProject.resetProjectUuid();
        }
        let originalProjectName = null;
        const newProjectName =
          newSaveAsLocation && newSaveAsLocation.name
            ? newSaveAsLocation.name
            : null;
        if (newProjectName) {
          originalProjectName = currentProject.getName();
          currentProject.setName(newProjectName);
        }

        const { wasSaved, fileMetadata } = await onSaveProjectAs(
          currentProject,
          newSaveAsLocation,
          {
            onStartSaving: () =>
              _replaceSnackMessage(i18n._(t`Saving...`), null),
            onMoveResources: async ({ newFileMetadata }) => {
              if (currentFileMetadata)
                await ensureResourcesAreMoved({
                  project: currentProject,
                  newFileMetadata,
                  newStorageProvider,
                  newStorageProviderOperations,
                  oldFileMetadata: currentFileMetadata,
                  oldStorageProvider,
                  oldStorageProviderOperations,
                  authenticatedUser,
                });
            },
          }
        );

        if (!wasSaved) {
          _replaceSnackMessage(i18n._(t`An error occurred. Please try again.`));
          if (originalProjectName) currentProject.setName(originalProjectName);
          if (originalProjectUuid)
            currentProject.setProjectUuid(originalProjectUuid);
          return;
        }

        sealUnsavedChanges();
        _replaceSnackMessage(i18n._(t`Project properly saved`));
        setCloudProjectSaveChoiceOpen(false);
        setCloudProjectRecoveryOpenedVersionId(null);

        if (!fileMetadata) {
          // Some storage provider like "DownloadFile" don't have file metadata, because
          // it's more like an "export".
          return;
        }

        if (fileMetadata.gameId) {
          await gamesList.markGameAsSavedIfRelevant(fileMetadata.gameId);
        }

        // Save was done on a new file/location, so save it in the
        // recent projects and in the state.
        const fileMetadataAndStorageProviderName = {
          fileMetadata,
          storageProviderName: storageProviderInternalName,
        };
        preferences.insertRecentProjectFile(fileMetadataAndStorageProviderName);
        if (
          currentlyRunningInAppTutorial &&
          !currentlyRunningInAppTutorial.isMiniTutorial && // Don't save the progress of mini-tutorials
          inAppTutorialOrchestratorRef.current
        ) {
          preferences.saveTutorialProgress({
            tutorialId: currentlyRunningInAppTutorial.id,
            userId: authenticatedUser.profile
              ? authenticatedUser.profile.id
              : null,
            ...inAppTutorialOrchestratorRef.current.getProgress(),
            fileMetadataAndStorageProviderName,
          });
        }

        // Refresh user cloud projects in case they saved as on Cloud storage provider
        // so that it appears immediately in the list.
        authenticatedUser.onCloudProjectsChanged();

        // Ensure resources are re-loaded from their new location.
        ResourcesLoader.burstAllUrlsCache();

        if (isCurrentProjectFresh(currentProjectRef, currentProject)) {
          // We do not want to change the current file metadata if the
          // project has changed since the beginning of the save, which
          // can happen if another project was loaded in the meantime.
          setState(state => ({
            ...state,
            currentFileMetadata: fileMetadata,
          }));
        }
      } catch (rawError) {
        _closeSnackMessage();
        const errorMessage = getWriteErrorMessage
          ? getWriteErrorMessage(rawError)
          : t`An error occurred when saving the project. Please try again later.`;
        showErrorBox({
          message: i18n._(errorMessage),
          rawError,
          errorId: 'project-save-as-error',
        });
      } finally {
        setIsSavingProject(false);
      }
    },
    [
      i18n,
      isSavingProject,
      currentProject,
      currentProjectRef,
      currentFileMetadata,
      getStorageProviderOperations,
      sealUnsavedChanges,
      setState,
      state.editorTabs,
      _replaceSnackMessage,
      _closeSnackMessage,
      getStorageProvider,
      preferences,
      ensureResourcesAreMoved,
      authenticatedUser,
      currentlyRunningInAppTutorial,
      showAlert,
      showConfirmation,
      gamesList,
      hasExtensionLoadErrors,
    ]
  );

  // Prevent "save project as" when no current project or when the opened project
  // is a previous version (cloud project only) of the current project.
  const canSaveProjectAs = !!currentProject && !checkedOutVersionStatus;
  const saveProjectAs = React.useCallback(
    () => {
      if (!canSaveProjectAs) {
        return;
      }
      // Prevent saving if there are errors in the extension modules, as
      // this can lead to corrupted projects.
      if (hasExtensionLoadErrors) return;

      if (cloudProjectRecoveryOpenedVersionId && !cloudProjectSaveChoiceOpen) {
        setCloudProjectSaveChoiceOpen(true);
        return;
      }

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
      getStorageProviderOperations,
      openSaveToStorageProviderDialog,
      props.storageProviders,
      saveProjectAsWithStorageProvider,
      cloudProjectRecoveryOpenedVersionId,
      cloudProjectSaveChoiceOpen,
      canSaveProjectAs,
      hasExtensionLoadErrors,
    ]
  );

  const saveProject = React.useCallback(
    async () => {
      if (!currentProject) return;
      // Prevent saving if there are errors in the extension modules, as
      // this can lead to corrupted projects.
      if (hasExtensionLoadErrors) return;

      if (!currentFileMetadata) {
        return saveProjectAs();
      }
      const isProjectOwnedBySomeoneElse = !!currentFileMetadata.ownerId;
      if (isProjectOwnedBySomeoneElse) return;

      if (cloudProjectRecoveryOpenedVersionId && !cloudProjectSaveChoiceOpen) {
        setCloudProjectSaveChoiceOpen(true);
        return;
      }

      const storageProviderOperations = getStorageProviderOperations();
      const {
        onSaveProject,
        canFileMetadataBeSafelySaved,
      } = storageProviderOperations;
      if (!onSaveProject) {
        return saveProjectAs();
      }

      saveUiSettings(state.editorTabs);

      // Protect against concurrent saves, which can trigger issues with the
      // file system.
      if (isSavingProject) {
        console.info('Project is already being saved, not triggering save.');
        return;
      }

      if (checkedOutVersionStatus) {
        const shouldRestoreCheckedOutVersion = await showConfirmation({
          title: t`Restore this version`,
          message: t`You're trying to save changes made to a previous version of your project. If you continue, it will be used as the new latest version.`,
        });
        if (!shouldRestoreCheckedOutVersion) return;
      } else if (canFileMetadataBeSafelySaved) {
        const canProjectBeSafelySaved = await canFileMetadataBeSafelySaved(
          currentFileMetadata,
          {
            showAlert,
            showConfirmation,
          }
        );
        if (!canProjectBeSafelySaved) return;
      }

      _showSnackMessage(i18n._(t`Saving...`), null);
      setIsSavingProject(true);

      try {
        const saveStartTime = performance.now();

        // At the end of the promise below, currentProject and storageProvider
        // may have changed (if the user opened another project). So we read and
        // store their values in variables now.
        const storageProviderInternalName = getStorageProvider().internalName;

        const saveOptions = {};
        if (cloudProjectRecoveryOpenedVersionId) {
          saveOptions.previousVersion = cloudProjectRecoveryOpenedVersionId;
        }
        if (checkedOutVersionStatus) {
          saveOptions.restoredFromVersionId =
            checkedOutVersionStatus.version.id;
        }
        const { wasSaved, fileMetadata } = await onSaveProject(
          currentProject,
          currentFileMetadata,
          saveOptions
        );

        if (wasSaved) {
          console.info(
            `Project saved in ${performance.now() - saveStartTime}ms.`
          );
          // If project was saved, and a game is registered, ensure the game is
          // marked as saved.
          if (fileMetadata.gameId) {
            await gamesList.markGameAsSavedIfRelevant(fileMetadata.gameId);
          }

          setCloudProjectSaveChoiceOpen(false);
          setCloudProjectRecoveryOpenedVersionId(null);

          const fileMetadataAndStorageProviderName = {
            fileMetadata: fileMetadata,
            storageProviderName: storageProviderInternalName,
          };
          preferences.insertRecentProjectFile(
            fileMetadataAndStorageProviderName
          );
          if (
            currentlyRunningInAppTutorial &&
            !currentlyRunningInAppTutorial.isMiniTutorial && // Don't save the progress of mini-tutorials
            inAppTutorialOrchestratorRef.current
          ) {
            preferences.saveTutorialProgress({
              tutorialId: currentlyRunningInAppTutorial.id,
              userId: authenticatedUser.profile
                ? authenticatedUser.profile.id
                : null,
              ...inAppTutorialOrchestratorRef.current.getProgress(),
              fileMetadataAndStorageProviderName,
            });
          }
          if (isCurrentProjectFresh(currentProjectRef, currentProject)) {
            // We do not want to change the current file metadata if the
            // project has changed since the beginning of the save, which
            // can happen if another project was loaded in the meantime.
            setState(state => ({
              ...state,
              currentFileMetadata: fileMetadata,
            }));
          }

          sealUnsavedChanges();
          _replaceSnackMessage(i18n._(t`Project properly saved`));
        }
      } catch (error) {
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        const message =
          extractedStatusAndCode && extractedStatusAndCode.status === 403
            ? t`You don't have permissions to save this project. Please choose another location.`
            : t`An error occurred when saving the project. Please try again later.`;
        showAlert({
          title: t`Unable to save the project`,
          message,
        });
        _closeSnackMessage();
      } finally {
        setIsSavingProject(false);
      }
    },
    [
      isSavingProject,
      currentProject,
      currentProjectRef,
      currentFileMetadata,
      getStorageProviderOperations,
      _showSnackMessage,
      _closeSnackMessage,
      _replaceSnackMessage,
      i18n,
      sealUnsavedChanges,
      saveProjectAs,
      state.editorTabs,
      getStorageProvider,
      preferences,
      setState,
      authenticatedUser,
      currentlyRunningInAppTutorial,
      cloudProjectRecoveryOpenedVersionId,
      cloudProjectSaveChoiceOpen,
      showAlert,
      showConfirmation,
      checkedOutVersionStatus,
      gamesList,
      hasExtensionLoadErrors,
    ]
  );

  const renderSaveReminder = useSaveReminder({
    onSave: saveProject,
    project: currentProject,
    isInQuickCustomization: !!quickCustomizationDialogOpenedFromGameId,
  });

  /**
   * Returns true if the project has been closed and false if the user refused to close it.
   */
  const askToCloseProject = React.useCallback(
    async (): Promise<boolean> => {
      if (!currentProject) return true;

      if (hasUnsavedChanges) {
        const answer = Window.showConfirmDialog(
          i18n._(
            t`Close the project? Any changes that have not been saved will be lost.`
          )
        );
        if (!answer) return false;
      }
      await closeProject();
      return true;
    },
    [currentProject, hasUnsavedChanges, i18n, closeProject]
  );

  const _onChangeEditorTab = (value: number) => {
    setState(state => ({
      ...state,
      editorTabs: changeCurrentTab(state.editorTabs, value),
    })).then(state =>
      _onEditorTabActivated(getCurrentTab(state.editorTabs), state)
    );
  };

  const _onEditorTabActivated = (
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
    setState(state => ({
      ...state,
      editorTabs: moveTabToTheRightOfHoveredTab(
        state.editorTabs,
        fromIndex,
        toHoveredIndex
      ),
    }));
  };

  const endTutorial = React.useCallback(
    async (shouldCloseProject?: boolean) => {
      if (shouldCloseProject) {
        await closeProject();
        doEndTutorial();
      } else {
        doEndTutorial();
      }
      // Open the homepage, so that the user can start a new tutorial.
      openHomePage();
    },
    [doEndTutorial, closeProject, openHomePage]
  );

  const selectInAppTutorial = React.useCallback(
    (tutorialId: string) => {
      const userProgress = preferences.getTutorialProgress({
        tutorialId,
        userId: authenticatedUser.profile
          ? authenticatedUser.profile.id
          : undefined,
      });
      setSelectedInAppTutorialInfo({ tutorialId, userProgress });
    },
    [preferences, authenticatedUser.profile]
  );

  useOpenInitialDialog({
    openInAppTutorialDialog: selectInAppTutorial,
    openProfileDialog: onOpenProfileDialog,
    openAskAi,
  });

  const onChangeProjectName = async (newName: string): Promise<void> => {
    if (!currentProject || !currentFileMetadata) return;
    const storageProviderOperations = getStorageProviderOperations();
    let newFileMetadata = { ...currentFileMetadata, name: newName };
    if (storageProviderOperations.onChangeProjectProperty) {
      const fileMetadataNewAttributes = await storageProviderOperations.onChangeProjectProperty(
        currentProject,
        currentFileMetadata,
        { name: newName }
      );
      if (fileMetadataNewAttributes) {
        sealUnsavedChanges();
        newFileMetadata = { ...newFileMetadata, ...fileMetadataNewAttributes };
      }
    }
    await setState(state => ({
      ...state,
      currentFileMetadata: newFileMetadata,
    }));
  };

  const onSaveProjectProperties = async (options: {
    newName?: string,
  }): Promise<boolean> => {
    const storageProvider = getStorageProvider();
    if (storageProvider.internalName === 'Cloud' && options.newName) {
      return showConfirmation({
        title: t`Project name changed`,
        message: t`Your project name has changed, this will also save the whole project, continue?`,
        confirmButtonLabel: t`Save and continue`,
      });
    }
    return true;
  };

  const onOpenCloudProjectOnSpecificVersionForRecovery = React.useCallback(
    (versionId: string) => {
      if (!cloudProjectFileMetadataToRecover) return;
      onOpenCloudProjectOnSpecificVersion({
        fileMetadata: cloudProjectFileMetadataToRecover,
        versionId,
        ignoreUnsavedChanges: false,
        openingMessage: t`Recovering older version...`,
      });
      setCloudProjectFileMetadataToRecover(null);
      setCloudProjectRecoveryOpenedVersionId(versionId);
    },
    [cloudProjectFileMetadataToRecover, onOpenCloudProjectOnSpecificVersion]
  );

  const canInstallPrivateAsset = React.useCallback(
    () => {
      const storageProvider = getStorageProvider();
      // A private asset can always be installed locally, as it will be downloaded.
      // Or on the cloud if the user has saved their project as a cloud project.
      return (
        storageProvider.internalName === 'LocalFile' ||
        storageProvider.internalName === 'Cloud'
      );
    },
    [getStorageProvider]
  );

  const onChooseResource: ChooseResourceFunction = React.useCallback(
    (options: ChooseResourceOptions) => {
      return new Promise(resolve => {
        setChooseResourceOptions(options);
        const onResourceChosenSetter: () => ({|
          selectedResources: Array<gdResource>,
          selectedSourceName: string,
        |}) => void = () => resolve;

        setOnResourceChosen(onResourceChosenSetter);
      });
    },
    [setOnResourceChosen, setChooseResourceOptions]
  );

  const setElectronUpdateStatus = (updateStatus: ElectronUpdateStatus) => {
    setState(state => ({ ...state, updateStatus }));

    // TODO: use i18n to translate title and body in notification.
    // Also, find a way to use preferences to know if user deactivated auto-update.
    const notificationTitle = getElectronUpdateNotificationTitle(updateStatus);
    const notificationBody = getElectronUpdateNotificationBody(updateStatus);
    if (notificationTitle) {
      const notification = new window.Notification(notificationTitle, {
        body: notificationBody,
      });
      notification.onclick = () => openAboutDialog(true);
    }
  };

  const openTemplateFromTutorial = React.useCallback(
    async (tutorialId: string) => {
      const projectIsClosed = await askToCloseProject();
      if (!projectIsClosed) {
        return;
      }
      try {
        await createProjectFromTutorial(tutorialId, {
          storageProvider: emptyStorageProvider,
          saveAsLocation: null,
          // Remaining will be set by the template.
        });
      } catch (error) {
        showErrorBox({
          message: i18n._(
            t`Unable to create a new project for the tutorial. Try again later.`
          ),
          rawError: new Error(
            `Can't create project from template of tutorial "${tutorialId}"`
          ),
          errorId: 'cannot-create-project-from-tutorial-template',
        });
        return;
      }
    },
    [askToCloseProject, createProjectFromTutorial, i18n]
  );

  const openTemplateFromCourseChapter = React.useCallback(
    async (courseChapter: CourseChapter, templateId?: string) => {
      const projectIsClosed = await askToCloseProject();
      if (!projectIsClosed) {
        return;
      }
      try {
        await createProjectFromCourseChapter({
          courseChapter,
          templateId,
          newProjectSetup: {
            storageProvider: emptyStorageProvider,
            saveAsLocation: null,
            // Remaining will be set by the template.
          },
        });
      } catch (error) {
        showErrorBox({
          message: i18n._(
            t`Unable to create a new project for the course chapter. Try again later.`
          ),
          rawError: new Error(
            `Can't create project from template of course chapter "${
              courseChapter.id
            }"`
          ),
          errorId: 'cannot-create-project-from-course-chapter-template',
        });
        return;
      }
    },
    [askToCloseProject, createProjectFromCourseChapter, i18n]
  );

  const startSelectedTutorial = React.useCallback(
    async (scenario: 'resume' | 'startOver' | 'start') => {
      if (!selectedInAppTutorialInfo) return;
      const { userProgress, tutorialId } = selectedInAppTutorialInfo;
      const fileMetadataAndStorageProviderName = userProgress
        ? userProgress.fileMetadataAndStorageProviderName
        : null;
      if (
        userProgress &&
        scenario === 'resume' &&
        fileMetadataAndStorageProviderName // The user can only resume if the project was saved to a storage provider.
      ) {
        if (currentProject) {
          // If there's a project opened, check if this is the one we should open
          // for the stored tutorial userProgress.
          if (
            currentFileMetadata &&
            currentFileMetadata.fileIdentifier !==
              fileMetadataAndStorageProviderName.fileMetadata.fileIdentifier
          ) {
            const projectIsClosed = await askToCloseProject();
            if (!projectIsClosed) {
              return;
            }
            openFromFileMetadataWithStorageProvider(
              fileMetadataAndStorageProviderName,
              { openAllScenes: true }
            );
          } else {
            // If the current project is the same stored for the tutorial,
            // open all scenes.
            openAllScenes({ currentProject, editorTabs: state.editorTabs });
          }
        } else {
          openFromFileMetadataWithStorageProvider(
            fileMetadataAndStorageProviderName,
            { openAllScenes: true }
          );
        }
      } else {
        const projectIsClosed = await askToCloseProject();
        if (!projectIsClosed) {
          return;
        }
      }

      const selectedInAppTutorialShortHeader = getInAppTutorialShortHeader(
        tutorialId
      );
      if (!selectedInAppTutorialShortHeader) return;

      // If the tutorial has a template, create a new project from it.
      const initialTemplateUrl =
        selectedInAppTutorialShortHeader.initialTemplateUrl;
      if (initialTemplateUrl) {
        try {
          await createProjectFromInAppTutorial(
            selectedInAppTutorialShortHeader.id,
            {
              storageProvider: emptyStorageProvider,
              saveAsLocation: null,
              // Remaining will be set by the template.
            }
          );
        } catch (error) {
          showErrorBox({
            message: i18n._(
              t`Unable to create a new project for the tutorial. Try again later.`
            ),
            rawError: new Error(
              `Can't create project from template "${initialTemplateUrl}"`
            ),
            errorId: 'cannot-create-project-from-template',
          });
          return;
        }
      }

      const initialStepIndex =
        userProgress && scenario === 'resume' ? userProgress.step : 0;
      const initialProjectData =
        userProgress && scenario === 'resume'
          ? userProgress.projectData
          : selectedInAppTutorialShortHeader.initialProjectData || {};

      await startTutorial({
        tutorialId,
        initialStepIndex,
        initialProjectData,
      });
      sendInAppTutorialStarted({
        tutorialId,
        scenario,
        isUIRestricted: !!selectedInAppTutorialShortHeader.shouldRestrictUI,
      });
      setSelectedInAppTutorialInfo(null);
    },
    [
      i18n,
      getInAppTutorialShortHeader,
      createProjectFromInAppTutorial,
      askToCloseProject,
      startTutorial,
      selectedInAppTutorialInfo,
      openFromFileMetadataWithStorageProvider,
      state.editorTabs,
      currentProject,
      currentFileMetadata,
      openAllScenes,
    ]
  );

  const fetchNewlyAddedResources = React.useCallback(
    async (): Promise<void> => {
      if (!currentProjectRef.current || !currentFileMetadataRef.current) return;

      await ensureResourcesAreFetched(() => ({
        // Use the refs to the `currentProject` and `currentFileMetadata` to ensure
        // that we never fetch resources for a stale project or file metadata, even
        // if it changed in the meantime (like, a save took a long time before updating
        // the fileMetadata).
        project: currentProjectRef.current,
        fileMetadata: currentFileMetadataRef.current,
        storageProvider: getStorageProvider(),
        storageProviderOperations: getStorageProviderOperations(),
        authenticatedUser,
      }));
    },
    [
      currentProjectRef,
      currentFileMetadataRef,
      ensureResourcesAreFetched,
      getStorageProvider,
      getStorageProviderOperations,
      authenticatedUser,
    ]
  );

  /** (Stable) callback to launch the fetching of the resources of the project. */
  const onFetchNewlyAddedResources = useStableUpToDateCallback(
    fetchNewlyAddedResources
  );

  useKeyboardShortcuts(
    commandPaletteRef.current
      ? commandPaletteRef.current.launchCommand
      : () => {}
  );

  const openCommandPalette = React.useCallback(() => {
    if (commandPaletteRef.current) {
      commandPaletteRef.current.open();
    }
  }, []);

  const {
    configureNewProjectActions: configureNewProjectActionsForProfile,
  } = React.useContext(PublicProfileContext);

  React.useEffect(
    () => {
      openHomePage();
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
          } else if (initialExampleSlugToOpen) {
            await fetchAndOpenNewProjectSetupDialogForExample(
              initialExampleSlugToOpen
            );
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

            const storageProviderOperations = getStorageProviderOperations(
              storageProvider
            );
            const proceed = await ensureInteractionHappened(
              storageProviderOperations
            );
            if (proceed)
              openFromFileMetadataWithStorageProvider(
                fileMetadataAndStorageProviderName
              );
          }

          configureNewProjectActionsForProfile({
            fetchAndOpenNewProjectSetupDialogForExample,
          });

          registerOnResourceExternallyChangedCallback(
            onResourceExternallyChanged
          );
        })
        .catch(() => {
          /* Ignore errors */
        });
    },
    // We want to run this effect only when the component did mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useMainFrameCommands({
    i18n,
    project: state.currentProject,
    previewEnabled:
      !!state.currentProject && state.currentProject.getLayoutsCount() > 0,
    onOpenProjectManager: toggleProjectManager,
    hasPreviewsRunning: hasNonEditionPreviewsRunning,
    allowNetworkPreview:
      !!_previewLauncher.current &&
      _previewLauncher.current.canDoNetworkPreview(),
    onLaunchPreview: launchNewPreview,
    onHotReloadPreview: launchHotReloadPreview,
    onLaunchDebugPreview: launchDebuggerAndPreview,
    onLaunchNetworkPreview: launchNetworkPreview,
    onLaunchPreviewWithDiagnosticReport: launchPreviewWithDiagnosticReport,
    onOpenHomePage: openHomePage,
    onCreateProject: () => setNewProjectSetupDialogOpen(true),
    onOpenProject: () => openOpenFromStorageProviderDialog(),
    onSaveProject: saveProject,
    onSaveProjectAs: saveProjectAs,
    onCloseApp: closeApp,
    onCloseProject: async () => {
      askToCloseProject();
    },
    onExportGame: () => openShareDialog('publish'),
    onInviteCollaborators: () => openShareDialog('invite'),
    onOpenLayout: name => {
      openLayout(name);
    },
    onOpenExternalEvents: openExternalEvents,
    onOpenExternalLayout: openExternalLayout,
    onOpenEventsFunctionsExtension: openEventsFunctionsExtension,
    onOpenCommandPalette: openCommandPalette,
    onOpenProfile: onOpenProfileDialog,
  });

  const resourceManagementProps: ResourceManagementProps = React.useMemo(
    () => ({
      resourceSources,
      onChooseResource,
      resourceExternalEditors,
      getStorageProvider,
      onFetchNewlyAddedResources,
      getStorageProviderResourceOperations,
      canInstallPrivateAsset,
      onResourceUsageChanged,
    }),
    [
      resourceSources,
      onChooseResource,
      resourceExternalEditors,
      getStorageProvider,
      onFetchNewlyAddedResources,
      getStorageProviderResourceOperations,
      canInstallPrivateAsset,
      onResourceUsageChanged,
    ]
  );

  const hideAskAi =
    !!authenticatedUser.limits &&
    !!authenticatedUser.limits.capabilities.classrooms &&
    authenticatedUser.limits.capabilities.classrooms.hideAskAi;
  const showLoader = isProjectOpening || isLoadingProject || previewLoading;
  const shortcutMap = useShortcutMap();
  const buildMainMenuProps = {
    i18n: i18n,
    project: state.currentProject,
    canSaveProjectAs,
    recentProjectFiles: preferences.getRecentProjectFiles({ limit: 20 }),
    shortcutMap,
    isApplicationTopLevelMenu: false,
    hideAskAi,
  };
  const mainMenuCallbacks = {
    onChooseProject: () => openOpenFromStorageProviderDialog(),
    onOpenRecentFile: openFromFileMetadataWithStorageProvider,
    onSaveProject: saveProject,
    onSaveProjectAs: saveProjectAs,
    onShowVersionHistory: openVersionHistoryPanel,
    onCloseProject: askToCloseProject,
    onCloseApp: closeApp,
    onExportProject: () => openShareDialog('publish'),
    onInviteCollaborators: () => openShareDialog('invite'),
    onCreateProject: () => setNewProjectSetupDialogOpen(true),
    onOpenProjectManager: () => openProjectManager(true),
    onOpenHomePage: openHomePage,
    onOpenDebugger: openDebugger,
    onOpenAbout: () => openAboutDialog(true),
    onOpenPreferences: () => openPreferencesDialog(true),
    onOpenLanguage: () => openLanguageDialog(true),
    onOpenProfile: onOpenProfileDialog,
    onOpenAskAi: openAskAi,
    setElectronUpdateStatus: setElectronUpdateStatus,
  };

  const isProjectOwnedBySomeoneElse =
    !!currentFileMetadata && !!currentFileMetadata.ownerId;
  const canSave =
    !!state.currentProject &&
    !isSavingProject &&
    (!currentFileMetadata || !isProjectOwnedBySomeoneElse);
  const hasAskAiOpened = hasEditorTabOpenedWithKey(state.editorTabs, 'ask-ai');

  return (
    <div
      className={
        'main-frame' /* The root styling, done in CSS to read some CSS variables. */
      }
    >
      {!!renderPreviewLauncher &&
        renderPreviewLauncher(
          {
            crashReportUploadLevel:
              preferences.values.previewCrashReportUploadLevel ||
              'exclude-javascript-code-events',
            previewContext: quickCustomizationDialogOpenedFromGameId
              ? 'preview-quick-customization'
              : 'preview',
            sourceGameId: quickCustomizationDialogOpenedFromGameId || '',
            getIncludeFileHashs:
              eventsFunctionsExtensionsContext.getIncludeFileHashs,
            onExport: () => openShareDialog('publish'),
            onCaptureFinished,
          },
          (previewLauncher: ?PreviewLauncherInterface) => {
            _previewLauncher.current = previewLauncher;
          }
        )}
      <EmbeddedGameFrame
        key={currentProject ? currentProject.ptr : 0}
        enabled={gameEditorMode === 'embedded-game'}
        previewDebuggerServer={previewDebuggerServer || null}
        onLaunchPreviewForInGameEdition={onLaunchPreviewForInGameEdition}
      />
      {!!renderMainMenu &&
        renderMainMenu(
          { ...buildMainMenuProps, isApplicationTopLevelMenu: true },
          mainMenuCallbacks,
          {
            onClosePreview:
              _previewLauncher.current && _previewLauncher.current.closePreview
                ? _previewLauncher.current.closePreview
                : null,
          }
        )}
      <ProjectTitlebar
        projectName={currentProject ? currentProject.getName() : null}
        fileMetadata={currentFileMetadata}
        storageProvider={getStorageProvider()}
        i18n={i18n}
      />
      <ProjectManagerDrawer
        projectManagerOpen={projectManagerOpen}
        toggleProjectManager={toggleProjectManager}
        title={
          state.currentProject
            ? state.currentProject.getName()
            : i18n._(t`Menu`)
        }
      >
        <ProjectManager
          project={currentProject}
          onChangeProjectName={onChangeProjectName}
          onSaveProjectProperties={onSaveProjectProperties}
          onOpenExternalEvents={openExternalEvents}
          onOpenLayout={(name, options) => openLayout(name, options)}
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
          onOpenResources={openResources}
          onReloadEventsFunctionsExtensions={() => {
            if (isProjectClosedSoAvoidReloadingExtensions) {
              return;
            }
            eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions(
              currentProject
            );
          }}
          onExtensionInstalled={onExtensionInstalled}
          onSceneAdded={onSceneAdded}
          onExternalLayoutAdded={onExternalLayoutAdded}
          onShareProject={() => openShareDialog()}
          isOpen={projectManagerOpen}
          hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
          resourceManagementProps={resourceManagementProps}
          gamesList={gamesList}
          onOpenHomePage={openHomePage}
          toggleProjectManager={toggleProjectManager}
          mainMenuCallbacks={mainMenuCallbacks}
          buildMainMenuProps={buildMainMenuProps}
        />
      </ProjectManagerDrawer>
      <TabsTitlebar
        hidden={tabsTitleBarAndEditorToolbarHidden}
        toggleProjectManager={toggleProjectManager}
        renderTabs={(onEditorTabHovered, onEditorTabClosing) => (
          <DraggableEditorTabs
            hideLabels={false}
            editorTabs={state.editorTabs}
            onClickTab={(id: number) => _onChangeEditorTab(id)}
            onCloseTab={(editorTab: EditorTab) => {
              // Call onEditorTabClosing before to ensure any tooltip is removed before the tab is closed.
              onEditorTabClosing();
              _onCloseEditorTab(editorTab);
            }}
            onCloseOtherTabs={(editorTab: EditorTab) => {
              // Call onEditorTabClosing before to ensure any tooltip is removed before the tab is closed.
              onEditorTabClosing();
              _onCloseOtherEditorTabs(editorTab);
            }}
            onCloseAll={() => {
              // Call onEditorTabClosing before to ensure any tooltip is removed before the tab is closed.
              onEditorTabClosing();
              _onCloseAllEditorTabs();
            }}
            onTabActivated={(editorTab: EditorTab) =>
              _onEditorTabActivated(editorTab)
            }
            onDropTab={onDropEditorTab}
            onHoverTab={(
              editorTab: ?EditorTab,
              options: {| isLabelTruncated: boolean |}
            ) => onEditorTabHovered(editorTab, options)}
          />
        )}
        hasAskAiOpened={hasAskAiOpened}
        onOpenAskAi={openAskAi}
      />
      <Toolbar
        ref={toolbar}
        hidden={tabsTitleBarAndEditorToolbarHidden}
        showProjectButtons={
          !['start page', 'debugger', 'ask-ai', null].includes(
            getCurrentTab(state.editorTabs)
              ? getCurrentTab(state.editorTabs).key
              : null
          )
        }
        canSave={canSave}
        onSave={saveProject}
        openShareDialog={() =>
          openShareDialog(/* leave the dialog decide which tab to open */)
        }
        isSharingEnabled={
          !checkedOutVersionStatus && !cloudProjectRecoveryOpenedVersionId
        }
        onOpenDebugger={launchDebuggerAndPreview}
        hasPreviewsRunning={hasNonEditionPreviewsRunning}
        onPreviewWithoutHotReload={launchNewPreview}
        onNetworkPreview={launchNetworkPreview}
        onHotReloadPreview={launchHotReloadPreview}
        onLaunchPreviewWithDiagnosticReport={launchPreviewWithDiagnosticReport}
        canDoNetworkPreview={
          !!_previewLauncher.current &&
          _previewLauncher.current.canDoNetworkPreview()
        }
        setPreviewOverride={setPreviewOverride}
        isPreviewEnabled={
          !!currentProject && currentProject.getLayoutsCount() > 0
        }
        previewState={previewState}
        onOpenVersionHistory={openVersionHistoryPanel}
        checkedOutVersionStatus={checkedOutVersionStatus}
        onQuitVersionHistory={onQuitVersionHistory}
        canQuitVersionHistory={!isSavingProject}
      />
      {// Render games platform frame before the editors, so the editor have priority
      // in what to display (ex: Loader of play section)
      gamesPlatformFrameTools.renderGamesPlatformFrame()}
      <LeaderboardProvider
        gameId={
          state.currentProject ? state.currentProject.getProjectUuid() : ''
        }
      >
        {getEditors(state.editorTabs).map((editorTab, id) => {
          const isCurrentTab = getCurrentTabIndex(state.editorTabs) === id;
          const errorBoundaryProps = getEditorErrorBoundaryProps(editorTab.key);

          return (
            <TabContentContainer
              key={editorTab.key}
              active={isCurrentTab}
              removePointerEvents={
                // Deactivate pointer events when the play tab is active, so the iframe
                // can be interacted with.
                gamesPlatformFrameTools.iframeVisible ||
                shouldRemovePointerEvents(editorTab.kind, gameEditorMode)
              }
            >
              <CommandsContextScopedProvider active={isCurrentTab}>
                <ErrorBoundary
                  componentTitle={errorBoundaryProps.componentTitle}
                  scope={errorBoundaryProps.scope}
                >
                  {editorTab.renderEditorContainer({
                    editorId: editorTab.key,
                    gameEditorMode,
                    setGameEditorMode,
                    isActive: isCurrentTab,
                    extraEditorProps: editorTab.extraEditorProps,
                    project: currentProject,
                    fileMetadata: currentFileMetadata,
                    storageProvider: getStorageProvider(),
                    ref: editorRef => (editorTab.editorRef = editorRef),
                    setToolbar: editorToolbar =>
                      setEditorToolbar(editorToolbar, isCurrentTab),
                    hideTabsTitleBarAndEditorToolbar: setTabsTitleBarAndEditorToolbarHidden,
                    projectItemName: editorTab.projectItemName,
                    setPreviewedLayout,
                    onOpenExternalEvents: openExternalEvents,
                    onOpenEvents: (sceneName: string) => {
                      openLayout(sceneName, {
                        openEventsEditor: true,
                        openSceneEditor: false,
                        focusWhenOpened: 'events',
                      });
                    },
                    onOpenLayout: openLayout,
                    onOpenTemplateFromTutorial: openTemplateFromTutorial,
                    onOpenTemplateFromCourseChapter: openTemplateFromCourseChapter,
                    previewDebuggerServer,
                    hotReloadPreviewButtonProps,
                    resourceManagementProps,
                    onSave: saveProject,
                    canSave,
                    onCreateEventsFunction,
                    openInstructionOrExpression,
                    onOpenCustomObjectEditor: openCustomObjectEditor,
                    onRenamedEventsBasedObject: onRenamedEventsBasedObject,
                    onDeletedEventsBasedObject: onDeletedEventsBasedObject,
                    openObjectEvents,
                    unsavedChanges: unsavedChanges,
                    canOpen: !!props.storageProviders.filter(
                      ({ hiddenInOpenDialog }) => !hiddenInOpenDialog
                    ).length,
                    onChooseProject: () => openOpenFromStorageProviderDialog(),
                    onOpenRecentFile: openFromFileMetadataWithStorageProvider,
                    onOpenNewProjectSetupDialog: openNewProjectDialog,
                    onOpenProjectManager: () => openProjectManager(true),
                    onOpenVersionHistory: openVersionHistoryPanel,
                    askToCloseProject,
                    closeProject,
                    onSelectExampleShortHeader: exampleShortHeader => {
                      onSelectExampleShortHeader({
                        exampleShortHeader,
                        preventBackHome: true,
                      });
                    },
                    onSelectPrivateGameTemplateListingData: privateGameTemplateListingData => {
                      onSelectPrivateGameTemplateListingData({
                        privateGameTemplateListingData,
                        preventBackHome: true,
                      });
                    },
                    onOpenPrivateGameTemplateListingData: privateGameTemplateListingData => {
                      onSelectPrivateGameTemplateListingData({
                        privateGameTemplateListingData,
                        preventBackHome: true,
                      });
                    },
                    onCreateEmptyProject: createEmptyProject,
                    onCreateProjectFromExample: createProjectFromExample,
                    onOpenProfile: onOpenProfileDialog,
                    onOpenLanguageDialog: () => openLanguageDialog(true),
                    onOpenPreferences: () => openPreferencesDialog(true),
                    onOpenAbout: () => openAboutDialog(true),
                    selectInAppTutorial: selectInAppTutorial,
                    onLoadEventsFunctionsExtensions: async () => {
                      if (isProjectClosedSoAvoidReloadingExtensions) {
                        return;
                      }
                      return eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
                        currentProject
                      );
                    },
                    onReloadEventsFunctionsExtensionMetadata: extension => {
                      if (isProjectClosedSoAvoidReloadingExtensions) {
                        return;
                      }
                      eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensionMetadata(
                        currentProject,
                        extension
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
                      if (currentProject)
                        renameResourcesInProject(currentProject, {
                          [resource.getName()]: newName,
                        });

                      cb(true);
                    },
                    openBehaviorEvents: openBehaviorEvents,
                    onExtractAsExternalLayout: onExtractAsExternalLayout,
                    onExtractAsEventBasedObject: onExtractAsEventBasedObject,
                    onOpenEventBasedObjectEditor: onOpenEventBasedObjectEditor,
                    onOpenEventBasedObjectVariantEditor: onOpenEventBasedObjectVariantEditor,
                    onDeleteEventsBasedObjectVariant: deleteEventsBasedObjectVariant,
                    onEventsBasedObjectChildrenEdited: onEventsBasedObjectChildrenEdited,
                    onSceneObjectEdited: onSceneObjectEdited,
                    onSceneObjectsDeleted: onSceneObjectsDeleted,
                    onSceneEventsModifiedOutsideEditor: onSceneEventsModifiedOutsideEditor,
                    onExtensionInstalled: onExtensionInstalled,
                    onEventBasedObjectTypeChanged: onEventBasedObjectTypeChanged,
                    onEffectAdded: onEffectAdded,
                    gamesList,
                    gamesPlatformFrameTools,
                  })}
                </ErrorBoundary>
              </CommandsContextScopedProvider>
            </TabContentContainer>
          );
        })}
      </LeaderboardProvider>
      <CommandPaletteWithAlgoliaSearch ref={commandPaletteRef} />
      <LoaderModal
        show={showLoader}
        progress={fileMetadataOpeningProgress}
        message={
          loaderModalOpeningMessage ||
          fileMetadataOpeningMessage ||
          (previewLoading ? t`Loading preview...` : null)
        }
      />
      <Snackbar
        open={state.snackMessageOpen}
        autoHideDuration={state.snackDuration}
        onClose={_closeSnackMessage}
        ContentProps={{
          'aria-describedby': 'snackbar-message',
        }}
        message={<span id="snackbar-message">{state.snackMessage}</span>}
      />
      {shareDialogOpen &&
        renderShareDialog({
          onClose: closeShareDialog,
          onChangeSubscription: closeShareDialog,
          project: state.currentProject,
          onSaveProject: saveProject,
          isSavingProject: isSavingProject,
          fileMetadata: currentFileMetadata,
          storageProvider: getStorageProvider(),
          initialTab: shareDialogInitialTab,
          gamesList,
        })}
      {chooseResourceOptions && onResourceChosen && !!currentProject && (
        <NewResourceDialog
          project={currentProject}
          fileMetadata={currentFileMetadata}
          getStorageProvider={getStorageProvider}
          i18n={i18n}
          resourceSources={resourceSources}
          onChooseResources={resourcesOptions => {
            setOnResourceChosen(null);
            setChooseResourceOptions(null);
            onResourceChosen(resourcesOptions);
          }}
          onClose={() => {
            setOnResourceChosen(null);
            setChooseResourceOptions(null);
            onResourceChosen({
              selectedResources: [],
              selectedSourceName: '',
            });
          }}
          options={chooseResourceOptions}
        />
      )}
      {profileDialogOpen && (
        // ProfileDialog is dependent on multiple contexts,
        // which are dependent of AuthenticatedUserContext.
        // So it cannot be moved inside the AuthenticatedUserProvider,
        // otherwise, those contexts would not be correctly mounted,
        // as they are defined after the AuthenticatedUserProvider in Providers.js.
        <ProfileDialog
          onClose={() => {
            openProfileDialog(false);
          }}
        />
      )}
      {renderNewProjectDialog()}
      {cloudProjectFileMetadataToRecover && (
        <CloudProjectRecoveryDialog
          cloudProjectId={cloudProjectFileMetadataToRecover.fileIdentifier}
          onClose={() => setCloudProjectFileMetadataToRecover(null)}
          onOpenPreviousVersion={onOpenCloudProjectOnSpecificVersionForRecovery}
        />
      )}
      {cloudProjectSaveChoiceOpen && (
        <CloudProjectSaveChoiceDialog
          isLoading={isSavingProject}
          onClose={() => setCloudProjectSaveChoiceOpen(false)}
          onSaveAsMainVersion={saveProject}
          onSaveAsDuplicate={saveProjectAs}
        />
      )}
      {preferencesDialogOpen && (
        <PreferencesDialog
          i18n={props.i18n}
          onClose={options => {
            openPreferencesDialog(false);
            if (options.languageDidChange) _languageDidChange();
          }}
          onOpenQuickCustomizationDialog={() =>
            setQuickCustomizationDialogOpenedFromGameId(
              'fake-source-game-id-for-testing'
            )
          }
        />
      )}
      {languageDialogOpen && (
        <LanguageDialog
          open
          onClose={options => {
            openLanguageDialog(false);
            if (options.languageDidChange) _languageDidChange();
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
            getStorageProviderOperations(storageProvider);
            chooseProjectWithStorageProviderPicker();
          }}
        />
      )}
      {state.saveToStorageProviderDialogOpen && (
        <SaveToStorageProviderDialog
          onClose={() => openSaveToStorageProviderDialog(false)}
          storageProviders={props.storageProviders}
          onChooseProvider={storageProvider => {
            openSaveToStorageProviderDialog(false);
            saveProjectAsWithStorageProvider({
              requestedStorageProvider: storageProvider,
            });
          }}
        />
      )}
      {renderOpenConfirmDialog()}
      {renderLeaderboardReplacerDialog()}
      {renderResourceMoverDialog()}
      {renderResourceFetcherDialog()}
      {renderVersionHistoryPanel()}
      {renderSaveReminder()}
      {renderExtensionLoadErrorDialog()}
      <CloseConfirmDialog
        shouldPrompt={!!state.currentProject}
        i18n={props.i18n}
        language={props.i18n.language}
        hasUnsavedChanges={hasUnsavedChanges}
      />
      <ChangelogDialogContainer />
      {selectedInAppTutorialInfo && (
        <StartInAppTutorialDialog
          open
          tutorialCompletionStatus={
            !selectedInAppTutorialInfo.userProgress
              ? 'notStarted'
              : selectedInAppTutorialInfo.userProgress.progress.every(
                  item => item === 100
                )
              ? 'complete'
              : 'started'
          }
          tutorialId={selectedInAppTutorialInfo.tutorialId}
          startTutorial={startSelectedTutorial}
          onClose={() => {
            setSelectedInAppTutorialInfo(null);
          }}
          isProjectOpening={isProjectOpening}
        />
      )}
      {state.gdjsDevelopmentWatcherEnabled &&
        renderGDJSDevelopmentWatcher &&
        renderGDJSDevelopmentWatcher({
          onGDJSUpdated: relaunchAndThenHardReloadAllPreviews,
        })}
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
      {currentlyRunningInAppTutorial && (
        <InAppTutorialOrchestrator
          ref={inAppTutorialOrchestratorRef}
          tutorial={currentlyRunningInAppTutorial}
          startStepIndex={startStepIndex}
          startProjectData={startProjectData}
          project={currentProject}
          quitInAppTutorialDialogOpen={quitInAppTutorialDialogOpen}
          i18n={props.i18n}
          endTutorial={({
            shouldCloseProject,
            shouldWarnAboutUnsavedChanges,
          }: {|
            shouldCloseProject: boolean,
            shouldWarnAboutUnsavedChanges: boolean,
          |}) => {
            if (
              shouldWarnAboutUnsavedChanges &&
              currentProject &&
              (!currentFileMetadata || hasUnsavedChanges)
            ) {
              setQuitInAppTutorialDialogOpen(true);
            } else {
              endTutorial(shouldCloseProject);
            }
          }}
          {...orchestratorProps}
        />
      )}
      {quitInAppTutorialDialogOpen && (
        <QuitInAppTutorialDialog
          onSaveProject={saveProject}
          onClose={() => setQuitInAppTutorialDialogOpen(false)}
          isSavingProject={isSavingProject}
          canEndTutorial={!!currentFileMetadata && !hasUnsavedChanges}
          endTutorial={() => {
            endTutorial(true);
          }}
        />
      )}
      {diagnosticReportDialogOpen && currentProject && (
        <DiagnosticReportDialog
          wholeProjectDiagnosticReport={currentProject.getWholeProjectDiagnosticReport()}
          onClose={() => setDiagnosticReportDialogOpen(false)}
        />
      )}

      {quickCustomizationDialogOpenedFromGameId && currentProject && (
        <QuickCustomizationDialog
          project={currentProject}
          resourceManagementProps={resourceManagementProps}
          onLaunchPreview={launchQuickCustomizationPreview}
          onClose={async options => {
            if (hasUnsavedChanges) {
              const response = await showConfirmation({
                title: t`Leave the customization?`,
                message: t`Do you want to quit the customization? All your changes will be lost.`,
                confirmButtonLabel: t`Leave`,
              });

              if (!response) {
                return;
              }
            }

            setQuickCustomizationDialogOpenedFromGameId(null);
            await closeProject();
            openHomePage();
            if (!hasUnsavedChanges) {
              navigateToRoute('build');
            }
          }}
          onlineWebExporter={quickPublishOnlineWebExporter}
          isRequiredToSaveAsNewCloudProject={() => {
            const storageProvider = getStorageProvider();
            return storageProvider.internalName !== 'Cloud';
          }}
          onSaveProject={async () => {
            // Automatically try to save project to the cloud.
            const storageProvider = getStorageProvider();
            if (storageProvider.internalName === 'Cloud') {
              saveProject();
              return;
            }

            if (
              !['Empty', 'UrlStorageProvider'].includes(
                storageProvider.internalName
              )
            ) {
              console.error(
                `Unexpected storage provider ${
                  storageProvider.internalName
                } when saving project from quick customization dialog. Saving anyway as a new cloud project.`
              );
            }

            saveProjectAsWithStorageProvider({
              requestedStorageProvider: CloudStorageProvider,
              forcedSavedAsLocation: {
                name: currentProject.getName(),
              },
            });
            return;
          }}
          isSavingProject={isSavingProject}
          canClose
          sourceGameId={quickCustomizationDialogOpenedFromGameId}
          gameScreenshotUrls={getGameUnverifiedScreenshotUrls(
            currentProject.getProjectUuid()
          )}
          onScreenshotsClaimed={onGameScreenshotsClaimed}
          onExtensionInstalled={onExtensionInstalled}
        />
      )}
      <CustomDragLayer />
    </div>
  );
};

export default MainFrame;
