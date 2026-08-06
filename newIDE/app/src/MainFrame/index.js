// @flow

import * as React from 'react';
import { type State } from './MainFrameState';
import {
  beginPreviewFileWriting,
  canReleaseCancelledPreviewPreparation,
  type PreviewLaunchPhase,
} from './PreviewLaunchCancellation';
import './MainFrame.css';
import Snackbar from '@material-ui/core/Snackbar';
import HomeIcon from '../UI/CustomSvgIcons/Home';
import AddCircleIcon from '../UI/CustomSvgIcons/AddCircle';
import AddCommentIcon from '../UI/CustomSvgIcons/AddComment';
import DebuggerIcon from '../UI/CustomSvgIcons/Debug';
import ProjectResourcesIcon from '../UI/CustomSvgIcons/ProjectResources';
import ConstantsIcon from '../UI/CustomSvgIcons/Constants';
import GlobalVariableIcon from '../UI/CustomSvgIcons/GlobalVariable';
import MenuIcon from '../UI/CustomSvgIcons/Menu';
import ObjectIcon from '../UI/CustomSvgIcons/Object';
import BehaviorIcon from '../UI/CustomSvgIcons/Behavior';
import SettingsIcon from '../UI/CustomSvgIcons/Settings';
import ShareIcon from '../UI/CustomSvgIcons/Share';
import SceneIcon from '../UI/CustomSvgIcons/Scene';
import EventsIcon from '../UI/CustomSvgIcons/Events';
import ExternalEventsIcon from '../UI/CustomSvgIcons/ExternalEvents';
import ExternalLayoutIcon from '../UI/CustomSvgIcons/ExternalLayout';
import ExtensionIcon from '../UI/CustomSvgIcons/Extension';
import SearchIcon from '../UI/CustomSvgIcons/Search';
import SparkleIcon from '../UI/CustomSvgIcons/Sparkle';
import PlayIcon from '../UI/CustomSvgIcons/Play';
import RefreshIcon from '../UI/CustomSvgIcons/Refresh';
import ProjectTitlebar from './ProjectTitlebar';
import StickyNotes, { type StickyNotesInterface } from './StickyNotes';
import PreferencesDialog from './Preferences/PreferencesDialog';
import AboutDialog from './AboutDialog';
import ProjectManager, {
  type ProjectManagerInterface,
  type ProjectManagerCreateItemKind,
  getProjectManagerItemId,
  getProjectManagerTreeViewItemIdForEditorTab,
  globalVariablesItemId,
  globalObjectsItemId,
} from '../ProjectManager';
import LoaderModal from '../UI/LoaderModal';
import {
  cleanupLeakedOverlaysAfterPopOutClose,
  captureMaterialUiOverlayCleanupCandidates,
  reportPotentialInputBlockers,
} from '../UI/MaterialUISpecificUtil';
import CloseConfirmDialog from '../UI/CloseConfirmDialog';
import ProfileDialog from '../Profile/ProfileDialog';
import PurchaseClaimDialog from '../Profile/PurchaseClaimDialog';
import Window from '../Utils/Window';
import { showErrorBox } from '../UI/Messages/MessageBox';
import EditorTabsPane, {
  type EditorTabsPaneCommonProps,
} from './EditorTabsPane';
import PoppedOutWindows from './PoppedOutWindows';
import RecentEditorSwitcher, {
  type RecentEditorSwitcherEntry,
  type RecentEditorSwitcherSideMenuItem,
  type RecentEditorSwitcherActionItem,
} from './RecentEditorSwitcher';
import {
  getEditorTabsInitialState,
  openEditorTab,
  closeProjectTabs,
  closeLayoutTabs,
  closeExternalLayoutTabs,
  closeExternalEventsTabs,
  closeEventsFunctionsExtensionTabs,
  closeCustomObjectTab,
  closeEventsBasedObjectVariantTab,
  renameEditorTabs,
  saveUiSettings,
  type EditorTab,
  type EditorTabsState,
  type EditorOpeningOptions,
  type EditorKind,
  getEventsFunctionsExtensionEditor,
  getEventsBasedBehaviorDetailEditor,
  getEventsFunctionDetailEditor,
  getPrefabDetailEditor,
  notifyPreviewOrExportWillStart,
  getCurrentTabForPane,
  getOpenedAskAiEditor,
  getEditorTabOpenedWithKey,
  changeCurrentTab,
  getAllEditorTabs,
  hasEditorsInPane,
  closeEditorTab,
  popOutTab,
  popInTab,
  moveTabToPosition,
} from './EditorTabs/EditorTabsHandler';
import {
  getRenamedLayoutTabProjectItemName,
  getRenamedExternalLayoutTabProjectItemName,
  getRenamedExternalEventsTabProjectItemName,
  getRenamedExtensionTabProjectItemName,
} from './EditorTabs/EditorTabsRenaming';
import { renderDebuggerEditorContainer } from './EditorContainers/DebuggerEditorContainer';
import { renderEventsEditorContainer } from './EditorContainers/EventsEditorContainer';
import { renderExternalEventsEditorContainer } from './EditorContainers/ExternalEventsEditorContainer';
import { renderSceneEditorContainer } from './EditorContainers/SceneEditorContainer';
import { renderExternalLayoutEditorContainer } from './EditorContainers/ExternalLayoutEditorContainer';
import { renderEventsFunctionsExtensionEditorContainer } from './EditorContainers/EventsFunctionsExtensionEditorContainer';
import {
  renderBehaviorDetailEditorContainer,
  renderFunctionDetailEditorContainer,
} from './EditorContainers/ExtensionItemDetailEditorContainer';
import { renderPrefabDetailEditorContainer } from './EditorContainers/PrefabDetailEditorContainer';
import PrefabDetailEditor from '../PrefabDetailEditor';
import EventsFunctionsExtensionEditor from '../EventsFunctionsExtensionEditor';
import { renderCustomObjectEditorContainer } from './EditorContainers/CustomObjectEditorContainer';
import { renderHomePageContainer } from './EditorContainers/HomePage';
import { type OpenAskAiOptions } from '../AiGeneration/Utils';
import { exceptionallyGuardAgainstDeadObject } from '../Utils/IsNullPtr';
import { renderAskAiEditorContainer } from '../AiGeneration/AskAiEditorContainer';
import { createMcpEditorBridge } from '../Mcp/McpEditorBridge';
import { saveProjectAfterPendingSave } from '../Mcp/McpSaveCoordinator';
import { type EditorCallbacks } from '../EditorFunctions';
import { renderResourcesEditorContainer } from './EditorContainers/ResourcesEditorContainer';
import { renderConstantsEditorContainer } from './EditorContainers/ConstantsEditorContainer';
import { renderGlobalEventsSearchEditorContainer } from './EditorContainers/GlobalEventsSearchEditorContainer';
import { getProjectRootPath } from '../ResourcesEditor/ProjectFilesPanel';
import {
  type RenderEditorContainerPropsWithRef,
  type SceneEventsOutsideEditorChanges,
  type InstancesOutsideEditorChanges,
  type ObjectsOutsideEditorChanges,
  type ObjectGroupsOutsideEditorChanges,
} from './EditorContainers/BaseEditor';
import { type EditorId as SceneEditorPanelId } from '../SceneEditor/utils';
import {
  type ProjectItemRenamedOutsideEditorChanges,
  type WillDeleteSceneChanges,
  type WillDeleteObjectChanges,
} from '../EditorFunctions/OutsideEditorChanges';
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
  type ResourceManagementProps,
} from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor';
import { type JsExtensionsLoader } from '../JsExtensionsLoader';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import optionalRequire from '../Utils/OptionalRequire';
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
  type SaveProjectOptions,
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
  installCliInPath,
  isCliInPathInstallSupported,
} from '../Utils/InstallCliInPath';
import { useImportExtension } from '../AssetStore/ExtensionStore/InstallExtension';
import CommandPalette, {
  type CommandPaletteInterface,
} from '../CommandPalette/CommandPalette';
import WindowCommandsProvider from '../CommandPalette/WindowCommandsProvider';
import {
  type ImportExtension,
  type SaveProject,
} from './LocalCliCommandRunner';
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
import useNewResourceDialog from '../ResourcesList/useNewResourceDialog';
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
import {
  useStableUpToDateCallback,
  useStableUpToDateRef,
} from '../Utils/UseStableUpToDateCallback';
import { emptyStorageProvider } from '../ProjectsStorage/ProjectStorageProviders';
import CustomDragLayer from '../UI/DragAndDrop/CustomDragLayer';
import CloudProjectRecoveryDialog from '../ProjectsStorage/CloudStorageProvider/CloudProjectRecoveryDialog';
import CloudProjectSaveChoiceDialog from '../ProjectsStorage/CloudStorageProvider/CloudProjectSaveChoiceDialog';
import CloudStorageProvider from '../ProjectsStorage/CloudStorageProvider';
import useCreateProject, {
  type UseCreateProjectReturnType,
} from '../Utils/UseCreateProject';
import newNameGenerator from '../Utils/NewNameGenerator';
import { ensureProjectHasDefaultScene } from '../ProjectCreation/CreateProject';
import { type NewProjectSetup } from '../ProjectCreation/NewProjectSetupDialog';
import { listAllExamples } from '../Utils/GDevelopServices/Example';
import UrlStorageProvider from '../ProjectsStorage/UrlStorageProvider';
import { findEmptyPathInWorkspaceFolder } from '../ProjectsStorage/LocalFileStorageProvider/LocalPathFinder';
import useEditorTabsStateSaving from './EditorTabs/UseEditorTabsStateSaving';
import PixiResourcesLoader from '../ObjectsRendering/PixiResourcesLoader';
import useResourcesWatcher from './ResourcesWatcher';
import useLocalProjectChangesWatcher, {
  showLocalProjectFilesChangedDialog,
} from './LocalProjectChangesWatcher';
import { localFileStorageProviderInternalName } from '../ProjectsStorage/LocalFileStorageProvider/LocalFileStorageProviderInternalName';
import { writeProjectSourceCatalogs } from '../ProjectsStorage/LocalFileStorageProvider/LocalProjectWriter';
import { getLocalProjectLastModifiedDateSync } from '../ProjectsStorage/LocalFileStorageProvider/LocalProjectFileModificationTime';
import { openMultiFileProject } from '../ProjectsStorage/LocalFileStorageProvider/LocalMultiFileProject';
import {
  MULTI_FILE_ENTRY_NAME,
  areLegacyProjectsEquivalent,
} from '../ProjectsStorage/MultiFileProjectFormat';
import { serializeToJSObject } from '../Utils/Serializer';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';
import { type CourseChapter } from '../Utils/GDevelopServices/Asset';
import useVersionHistory from '../VersionHistory/UseVersionHistory';
import { ProjectManagerDrawer } from '../ProjectManager/ProjectManagerDrawer';
import DiagnosticReportDialog from '../ExportAndShare/DiagnosticReportDialog';
import MemoryTrackedRegistryDialog from './MemoryTrackedRegistryDialog';
import { scanProjectForValidationErrors } from '../Utils/EventsValidationScanner';
import { hasInvalidConstantPlaceholderValidationError } from '../Utils/ConstantPlaceholderDiagnostics';
import { useMultiplayerLobbyConfigurator } from './UseMultiplayerLobbyConfigurator';
import { useAuthenticatedPlayer } from './UseAuthenticatedPlayer';
import ListIcon from '../UI/ListIcon';
import { QuickCustomizationDialog } from '../QuickCustomization/QuickCustomizationDialog';
import { type ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import useGamesList from '../GameDashboard/UseGamesList';
import useCapturesManager from './UseCapturesManager';
import {
  readProjectSettings,
  type ResourceCustomPropertyConfig,
} from '../Utils/ProjectSettingsReader';
import { renameLayoutInProject } from '../Utils/Layout';
import useNpmScriptRunner from './NpmScriptRunner/useNpmScriptRunner';
import { applyProjectPreferences } from '../Utils/ApplyProjectPreferences';
import {
  EmbeddedGameFrame,
  setEditorHotReloadNeeded,
  isEditorHotReloadNeeded,
} from '../EmbeddedGame/EmbeddedGameFrame';
import { useActiveEmbeddedGameFrameHoleCount } from '../EmbeddedGame/EmbeddedGameFrameHole';
import useHomePageSwitch from './useHomePageSwitch';
import { useNavigationToEvent } from './UseNavigationToEvent';
import useNavigateFromGlobalSearch from './UseNavigateFromGlobalSearch';
import RobotIcon from '../ProjectCreation/RobotIcon';
import PublicProfileContext from '../Profile/PublicProfileContext';
import { useGamesPlatformFrame } from './EditorContainers/HomePage/PlaySection/UseGamesPlatformFrame';
import { useExtensionLoadErrorDialog } from '../Utils/UseExtensionLoadErrorDialog';
import { PanesContainer } from './PanesContainer';
import { tryAutoOpenMostRecentProjectAtStartup } from './StartupAutoOpen';
import { useEnsureExtensionInstalled } from '../AiGeneration/UseEnsureExtensionInstalled';
import { useGenerateEvents } from '../AiGeneration/UseGenerateEvents';
import { useSearchAndInstallAsset } from '../AiGeneration/UseSearchAndInstallAsset';
import { useSearchAndInstallResource } from '../AiGeneration/UseSearchAndInstallResource';
import { ObjectStoreContext } from '../AssetStore/ObjectStoreContext';
import {
  registerOnResourceExternallyChangedCallback,
  unregisterOnResourceExternallyChangedCallback,
  shouldHardReloadForExternallyChangedResource,
} from '../MainFrame/ResourcesWatcher';
import {
  type EditorCameraState,
  type PreviewInGameEditorTarget,
  type HotReloadSteps,
} from '../EmbeddedGame/EmbeddedGameFrame';
import StandaloneDialog from './StandAloneDialog';
import { useInGameEditorSettings } from '../EmbeddedGame/InGameEditorSettings';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { useAutomatedRegularInGameEditorRestart } from '../EmbeddedGame/UseAutomatedRegularInGameEditorRestart';
import { enumerateFunctionsInFolder } from '../EventsFunctionsList/EnumerateFunctionFolderOrFunction';

const gamePropertiesItemId = getProjectManagerItemId('game-properties');
const gameExtensionsItemId = getProjectManagerItemId('game-extensions');
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const remote = optionalRequire('@electron/remote');
const electronApp = remote ? remote.app : null;
const ipcRendererForUpdates = ipcRenderer;

const GD_STARTUP_TIMES = global.GD_STARTUP_TIMES || [];

const gd: libGDevelop = global.gd;

type ResourceToolLauncherKind =
  | 'image-extender'
  | 'ai-game-workbench'
  | 'gorest-spritesheet'
  | 'advanced-tween-editor';

const editorKindToRenderer: {
  [key: EditorKind]: (props: RenderEditorContainerPropsWithRef) => React.Node,
} = {
  debugger: renderDebuggerEditorContainer,
  'layout events': renderEventsEditorContainer,
  'external events': renderExternalEventsEditorContainer,
  layout: renderSceneEditorContainer,
  'external layout': renderExternalLayoutEditorContainer,
  'events functions extension': renderEventsFunctionsExtensionEditorContainer,
  'behavior detail': renderBehaviorDetailEditorContainer,
  'function detail': renderFunctionDetailEditorContainer,
  'prefab detail': renderPrefabDetailEditorContainer,
  'custom object': renderCustomObjectEditorContainer,
  'start page': renderHomePageContainer,
  resources: renderResourcesEditorContainer,
  constants: renderConstantsEditorContainer,
  'global-search': renderGlobalEventsSearchEditorContainer,
  'ask-ai': renderAskAiEditorContainer,
};

const movePrefabDetailTabAfterCustomObjectTab = (
  editorTabs: EditorTabsState,
  customObjectTabKey: string,
  prefabDetailTabKey: string
): EditorTabsState => {
  const customObjectTab = getEditorTabOpenedWithKey(
    editorTabs,
    customObjectTabKey
  );
  const prefabDetailTab = getEditorTabOpenedWithKey(
    editorTabs,
    prefabDetailTabKey
  );

  if (
    !customObjectTab ||
    !prefabDetailTab ||
    customObjectTab.paneIdentifier !== prefabDetailTab.paneIdentifier
  ) {
    return editorTabs;
  }

  if (prefabDetailTab.tabIndex === customObjectTab.tabIndex + 1) {
    return editorTabs;
  }

  return moveTabToPosition(
    editorTabs,
    prefabDetailTab.paneIdentifier,
    prefabDetailTab.tabIndex,
    prefabDetailTab.tabIndex < customObjectTab.tabIndex
      ? customObjectTab.tabIndex
      : customObjectTab.tabIndex + 1
  );
};

const defaultSnackbarAutoHideDuration = 3000;
const ignoreToolbarUpdate = (_toolbar: ?React.Node) => {};

const findStorageProviderFor = (
  i18n: I18n,
  storageProviders: Array<StorageProvider>,
  fileMetadataAndStorageProviderName: FileMetadataAndStorageProviderName
): ?StorageProvider => {
  const {
    storageProviderName,
    fileMetadata,
  } = fileMetadataAndStorageProviderName;
  let storageProvider = storageProviders.filter(
    storageProvider => storageProvider.internalName === storageProviderName
  )[0];

  // Older or interrupted project-creation flows could persist a recent local
  // file without its provider name. Recover only unambiguous absolute local
  // paths; other missing/unknown providers must still surface an error.
  const isAbsoluteLocalPath = /^(?:[a-zA-Z]:[\\/]|[\\/]{2}|\/)/.test(
    fileMetadata.fileIdentifier
  );
  if (!storageProvider && !storageProviderName && isAbsoluteLocalPath) {
    storageProvider = storageProviders.find(
      provider => provider.internalName === localFileStorageProviderInternalName
    );
  }

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

const initialPreviewState: PreviewState = {
  previewLayoutName: null,
  previewExternalLayoutName: null,
  isPreviewOverriden: false,
  overridenPreviewLayoutName: null,
  overridenPreviewExternalLayoutName: null,
};

type PreviewLaunchKind = 'standard' | 'in-game-edition';

const usePreviewLoadingState = () => {
  const forceUpdate = useForceUpdate();
  const previewLoadingRef = React.useRef<
    null | 'preview' | 'hot-reload-for-in-game-edition'
  >(null);

  return {
    previewLoadingRef,
    setPreviewLoading: React.useCallback(
      (previewLoading: null | 'preview' | 'hot-reload-for-in-game-edition') => {
        previewLoadingRef.current = previewLoading;
        forceUpdate();
      },
      [forceUpdate]
    ),
  };
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
    // $FlowFixMe[prop-missing]
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
  useCliCommandRunner: ({|
    project: ?gdProject,
    i18n: I18n,
    fileIdentifier: ?string,
    commandPaletteRef: {| current: ?CommandPaletteInterface |},
    importExtension: ImportExtension,
    onWillInstallExtension: (extensionNames: Array<string>) => void,
    onExtensionInstalled: (extensionNames: Array<string>) => void,
    saveProject: SaveProject,
    ensureProjectSettingsApplied: () => Promise<void>,
  |}) => void,
  onExportHtml5External?: (project: gdProject, i18n: I18n) => Promise<void>,
|};

const saveProjectStaleTimeoutMs = 5 * 60 * 1000;

const MainFrame = (props: Props): React.MixedElement => {
  const preferences = React.useContext(PreferencesContext);
  const {
    setHasProjectOpened,
    setProjectManagerPinned: setProjectManagerPinnedPreference,
  } = preferences;
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
      toolbarButtons: [],
    }: State)
  );
  const [
    resourceCustomPropertyConfigs,
    setResourceCustomPropertyConfigs,
  ] = React.useState<Array<ResourceCustomPropertyConfig>>([]);
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
  const { onChooseResource, renderNewResourceDialog } = useNewResourceDialog();
  const _previewLauncher = React.useRef((null: ?PreviewLauncherInterface));
  const forceUpdate = useForceUpdate();
  const [isLoadingProject, setIsLoadingProject] = React.useState<boolean>(
    false
  );
  const [isSavingProject, setIsSavingProject] = React.useState<boolean>(false);
  const [projectManagerOpen, openProjectManager] = React.useState<boolean>(
    false
  );
  const [
    isProjectManagerPinned,
    setProjectManagerPinned,
  ] = React.useState<boolean>(preferences.values.isProjectManagerPinned);
  const [
    standalonePrefabSettingsDialog,
    setStandalonePrefabSettingsDialog,
  ] = React.useState<?{|
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventsBasedObject: gdEventsBasedObject,
  |}>(null);
  const [
    standaloneBehaviorSettingsDialog,
    setStandaloneBehaviorSettingsDialog,
  ] = React.useState<?{|
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventsBasedBehavior: gdEventsBasedBehavior,
  |}>(null);
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
    setIsProjectClosedSoAvoidReloadingExtensionsState,
  ] = React.useState<boolean>(false);
  // React state is not updated synchronously. Keep a ref in sync so extension
  // editor unmount callbacks cannot enqueue work for a project after closing
  // it has started but before the state update has rendered.
  const isProjectClosedSoAvoidReloadingExtensionsRef = React.useRef<boolean>(
    false
  );
  const setIsProjectClosedSoAvoidReloadingExtensions = React.useCallback(
    (isProjectClosed: boolean) => {
      isProjectClosedSoAvoidReloadingExtensionsRef.current = isProjectClosed;
      setIsProjectClosedSoAvoidReloadingExtensionsState(isProjectClosed);
    },
    []
  );
  const [shareDialogOpen, setShareDialogOpen] = React.useState<boolean>(false);
  const [
    shareDialogInitialTab,
    setShareDialogInitialTab,
  ] = React.useState<?ShareTab>(null);
  const [
    standaloneDialogOpen,
    setStandaloneDialogOpen,
  ] = React.useState<boolean>(false);
  const {
    showConfirmation,
    showAlert,
    showDeleteConfirmation,
  } = useAlertDialog();
  const { previewLoadingRef, setPreviewLoading } = usePreviewLoadingState();
  const previewLaunchInProgressRef = React.useRef<boolean>(false);
  const [
    isPreviewLaunchInProgress,
    setIsPreviewLaunchInProgress,
  ] = React.useState<boolean>(false);
  const setPreviewLaunchInProgress = React.useCallback(
    (isInProgress: boolean) => {
      previewLaunchInProgressRef.current = isInProgress;
      setIsPreviewLaunchInProgress(isInProgress);
    },
    []
  );
  // Opening the debugger for an MCP preview changes the editor tabs. In 3D
  // edition mode, that tab change would otherwise start an embedded preview
  // before the explicitly requested MCP preview can acquire the launch lock.
  const mcpPreviewLaunchInProgressRef = React.useRef<boolean>(false);
  const [
    isMcpPreviewLaunchInProgress,
    setIsMcpPreviewLaunchInProgress,
  ] = React.useState<boolean>(false);
  const setMcpPreviewLaunchInProgress = React.useCallback(
    (isInProgress: boolean) => {
      mcpPreviewLaunchInProgressRef.current = isInProgress;
      setIsMcpPreviewLaunchInProgress(isInProgress);
    },
    []
  );
  const mcpPreviewLaunchSequenceInProgressRef = React.useRef<boolean>(false);
  const [
    isMcpPreviewLaunchSequenceInProgress,
    setIsMcpPreviewLaunchSequenceInProgress,
  ] = React.useState<boolean>(false);
  const beginMcpPreviewLaunchSequence = React.useCallback(() => {
    if (
      mcpPreviewLaunchSequenceInProgressRef.current ||
      mcpPreviewLaunchInProgressRef.current
    ) {
      return false;
    }
    mcpPreviewLaunchSequenceInProgressRef.current = true;
    setIsMcpPreviewLaunchSequenceInProgress(true);
    return true;
  }, []);
  const endMcpPreviewLaunchSequence = React.useCallback(() => {
    mcpPreviewLaunchSequenceInProgressRef.current = false;
    setIsMcpPreviewLaunchSequenceInProgress(false);
  }, []);
  const inGameEditionPreviewLaunchInProgressRef = React.useRef<boolean>(false);
  const previewLaunchIdRef = React.useRef<number>(0);
  const activePreviewLaunchIdRef = React.useRef<?number>(null);
  const activePreviewLaunchKindRef = React.useRef<?PreviewLaunchKind>(null);
  const cancelledPreviewLaunchIdsRef = React.useRef<Set<number>>(new Set());
  const previewLaunchPhaseRef = React.useRef<PreviewLaunchPhase>('idle');
  const saveProjectRef = React.useRef<?(options?: {|
    skipNewVersionWarning: boolean,
  |}) => Promise<?FileMetadata>>(null);
  const isSavingProjectRef = React.useRef<boolean>(false);
  const saveProjectStartedAtRef = React.useRef<?number>(null);
  const shortcutMap = useShortcutMap();
  const [
    diagnosticReportDialogOpen,
    setDiagnosticReportDialogOpen,
  ] = React.useState<boolean>(false);
  const [
    memoryTrackerRegistryDialogOpen,
    setMemoryTrackedRegistryDialogOpen,
  ] = React.useState<boolean>(false);

  /**
   * Checks for diagnostic errors in the project if blocking is enabled.
   * Returns true if there are errors and the action should be blocked.
   */
  const checkDiagnosticErrorsAndIfShouldBlock = React.useCallback(
    async (
      project: ?gdProject,
      actionType: 'preview' | 'export'
    ): Promise<boolean> => {
      if (!project) {
        return false;
      }

      try {
        const shouldBlockAllDiagnosticErrors = preferences.getBlockPreviewAndExportOnDiagnosticErrors();
        const validationErrors = scanProjectForValidationErrors(project);
        const unsafeExternalLayoutCreationErrors = validationErrors.filter(
          error => error.type === 'unsafe-external-layout-creation'
        );
        const unconditionedActionErrors = validationErrors.filter(
          error => error.type === 'unconditioned-action'
        );
        const mustBlockForInvalidConstantPlaceholder = hasInvalidConstantPlaceholderValidationError(
          validationErrors
        );
        const mustBlockForUnsafeExternalLayoutCreation =
          unsafeExternalLayoutCreationErrors.length > 0;
        const mustBlockForUnconditionedActions =
          unconditionedActionErrors.length > 0;
        const mustBlockForSpecificValidationErrors =
          mustBlockForInvalidConstantPlaceholder ||
          mustBlockForUnsafeExternalLayoutCreation ||
          mustBlockForUnconditionedActions;

        if (mustBlockForInvalidConstantPlaceholder) {
          setDiagnosticReportDialogOpen(true);
          return true;
        }

        if (
          mustBlockForSpecificValidationErrors ||
          (shouldBlockAllDiagnosticErrors && validationErrors.length > 0)
        ) {
          const title = mustBlockForUnsafeExternalLayoutCreation
            ? t`External layout action needs a condition`
            : mustBlockForUnconditionedActions
            ? t`Action needs a condition`
            : t`Diagnostic errors found`;
          const message = mustBlockForUnsafeExternalLayoutCreation
            ? actionType === 'preview'
              ? t`This preview cannot run because an event creates objects from an external layout without any condition. Add a condition, for example "At the beginning of the scene", before launching a preview.`
              : t`This export cannot run because an event creates objects from an external layout without any condition. Add a condition, for example "At the beginning of the scene", before exporting.`
            : mustBlockForUnconditionedActions
            ? actionType === 'preview'
              ? t`This preview cannot run because one or more events have actions without any enabled condition, so they would run every frame. Add a condition, for example "At the beginning of the scene", before launching a preview.`
              : t`This export cannot run because one or more events have actions without any enabled condition, so they would run every frame. Add a condition, for example "At the beginning of the scene", before exporting.`
            : actionType === 'preview'
            ? t`Your project has ${
                validationErrors.length
              } diagnostic error(s). Please fix them before launching a preview.`
            : t`Your project has ${
                validationErrors.length
              } diagnostic error(s). Please fix them before exporting.`;
          let shouldIgnoreDiagnosticErrors = false;
          const openReport = await showConfirmation({
            title,
            message,
            dismissButtonLabel: t`Close`,
            confirmButtonLabel: t`Open report`,
            ...(actionType === 'preview'
              ? {
                  secondaryActionButtonLabel: t`Ignore and run`,
                  secondaryActionButtonColor: 'danger',
                  onClickSecondaryAction: () => {
                    shouldIgnoreDiagnosticErrors = true;
                  },
                }
              : {}),
          });
          if (openReport) {
            setDiagnosticReportDialogOpen(true);
          }
          return !shouldIgnoreDiagnosticErrors;
        }
      } catch (error) {
        console.error('Error scanning project for validation errors:', error);
      }

      return false;
    },
    [preferences, showConfirmation, setDiagnosticReportDialogOpen]
  );
  const [previewState, setPreviewState] = React.useState(initialPreviewState);
  const [
    displayCollisionMaskInPreview,
    setDisplayCollisionMaskInPreview,
  ] = React.useState<boolean>(false);
  const [
    displaySignalAnimationsInPreview,
    setDisplaySignalAnimationsInPreview,
  ] = React.useState<boolean>(false);
  const [
    isStickyNotesManagerShown,
    setStickyNotesManagerShown,
  ] = React.useState<boolean>(false);
  const commandPaletteRef = React.useRef((null: ?CommandPaletteInterface));
  const stickyNotesRef = React.useRef((null: ?StickyNotesInterface));
  const [
    recentEditorSwitcherOpen,
    setRecentEditorSwitcherOpen,
  ] = React.useState<boolean>(false);
  const [
    recentNavigationEntryIds,
    setRecentNavigationEntryIds,
  ] = React.useState<Array<string>>([]);
  const [
    recentNavigationEntryUseCounts,
    setRecentNavigationEntryUseCounts,
  ] = React.useState<{ [string]: number }>({});
  const [
    poppedOutEditorFocusRequest,
    setPoppedOutEditorFocusRequest,
  ] = React.useState<{| editorKey: ?string, requestId: number |}>({
    editorKey: null,
    requestId: 0,
  });
  const lastProjectSettingsPromise = React.useRef<?Promise<void>>(null);
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
    nonEditionPreviewsCount,
    gameHotReloadLogs,
    editorHotReloadLogs,
    editorUncaughtError,
    clearGameHotReloadLogs,
    clearEditorHotReloadLogs,
    clearEditorUncaughtError,
    hardReloadAllPreviews,
    clearPreviewDebuggerStatuses,
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
    getChangesCount,
    getTimeOfFirstChangeSinceLastSave,
  } = unsavedChanges;

  const setSavingProjectInProgress = React.useCallback((isSaving: boolean) => {
    isSavingProjectRef.current = isSaving;
    saveProjectStartedAtRef.current = isSaving ? Date.now() : null;
    setIsSavingProject(isSaving);
  }, []);

  const isSaveProjectInProgress = React.useCallback(
    (): boolean => {
      if (!isSavingProjectRef.current) return false;

      const saveProjectStartedAt = saveProjectStartedAtRef.current;
      if (
        saveProjectStartedAt &&
        Date.now() - saveProjectStartedAt > saveProjectStaleTimeoutMs
      ) {
        console.warn(
          'Project save state was still active after the stale timeout. Resetting the save guard so saving can be retried.'
        );
        setSavingProjectInProgress(false);
        return false;
      }

      return true;
    },
    [setSavingProjectInProgress]
  );

  React.useEffect(
    () => {
      if (!isSavingProject) return;

      const intervalId = setInterval(() => {
        isSaveProjectInProgress();
      }, 10000);

      return () => clearInterval(intervalId);
    },
    [isSavingProject, isSaveProjectInProgress]
  );
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
  const { setPendingEventNavigation } = useNavigationToEvent({
    editorTabs: state.editorTabs,
  });
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

  const [gameEditorMode, setGameEditorMode] = React.useState<
    'embedded-game' | 'instances-editor'
  >('instances-editor');
  const activeEmbeddedGameFrameHoleCount = useActiveEmbeddedGameFrameHoleCount();

  // This is just for testing, to check if we're getting the right state
  // and gives us an idea about the number of re-renders.
  // React.useEffect(() => {
  //   console.log(state);
  // });

  const { currentFileMetadata, updateStatus } = state;
  const currentProject = exceptionallyGuardAgainstDeadObject(
    state.currentProject
  );
  React.useEffect(
    () => {
      if (!currentProject) setStickyNotesManagerShown(false);
    },
    [currentProject]
  );
  const isProjectManagerPinnedForCurrentProject =
    !!currentProject && isProjectManagerPinned;

  const fileIdentifier = currentFileMetadata
    ? currentFileMetadata.fileIdentifier
    : null;

  const {
    triggerNpmScript,
    renderNpmScriptConfirmDialog,
    projectPath,
  } = useNpmScriptRunner({
    fileIdentifier,
    toolbarButtons: state.toolbarButtons,
    previewCount: nonEditionPreviewsCount,
  });

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
    useCliCommandRunner,
    onExportHtml5External,
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
  const markGameAsSavedIfRelevant = React.useCallback(
    (gameId: string) => {
      // The project is already saved on disk when this is called. Do not block
      // the save UI on an optional online status update.
      gamesList.markGameAsSavedIfRelevant(gameId).catch(error => {
        console.error('Error while marking game as saved:', error);
      });
    },
    [gamesList]
  );

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
  const editorTabsRef = useStableUpToDateRef(state.editorTabs);

  React.useEffect(
    () => {
      const editorTabs = state.editorTabs;
      const allEditorKeys = getAllEditorTabs(editorTabs).map(
        editorTab => editorTab.key
      );
      const focusedEditorKeys: Array<string> = [];
      ['center', 'left', 'right', 'external'].forEach(paneIdentifier => {
        if (!editorTabs.panes[paneIdentifier]) return;
        const currentTab = getCurrentTabForPane(editorTabs, paneIdentifier);
        if (currentTab && !focusedEditorKeys.includes(currentTab.key)) {
          focusedEditorKeys.push(currentTab.key);
        }
      });

      setRecentNavigationEntryIds(previousIds => {
        const newlyOpenedKeys = allEditorKeys.filter(
          key => !previousIds.includes(key) && !focusedEditorKeys.includes(key)
        );
        const nextIds = [
          ...focusedEditorKeys,
          ...newlyOpenedKeys,
          ...previousIds.filter(
            id =>
              !focusedEditorKeys.includes(id) && !newlyOpenedKeys.includes(id)
          ),
        ].slice(0, 80);

        if (
          previousIds.length === nextIds.length &&
          previousIds.every((id, index) => id === nextIds[index])
        ) {
          return previousIds;
        }

        return nextIds;
      });
    },
    [state.editorTabs]
  );

  const projectManagerRef = React.useRef<?ProjectManagerInterface>(null);
  const lastSelectedProjectManagerItemIdRef = React.useRef<?string>(null);
  const forceRefreshProjectManagerList = React.useCallback(() => {
    const refresh = () => {
      if (projectManagerRef.current) {
        projectManagerRef.current.forceUpdateList();
      }
    };

    // The debugger pop-out is closed by Electron while React is also removing
    // its external tab. Refresh immediately and once more after the browser has
    // processed the focus/resize work caused by the child window closing.
    setTimeout(refresh, 0);
    setTimeout(refresh, 50);
    setTimeout(refresh, 150);
    setTimeout(refresh, 500);
  }, []);

  // WindowPortal synchronously unmounts its React/MUI portals before the child
  // document is destroyed. Keep this scoped cleanup as a fallback for older
  // Electron teardown edge cases, inspecting only the overlays that existed
  // when the actual editor/debugger pop-out started closing.
  const healMainWindowAfterPopOutClose = React.useCallback(() => {
    if (typeof window.focus === 'function') window.focus();
    const cleanupCandidates = captureMaterialUiOverlayCleanupCandidates();
    const heal = () => {
      cleanupLeakedOverlaysAfterPopOutClose(cleanupCandidates);
      // Diagnostic: if anything is still covering the editor after cleanup,
      // log exactly what it is so the remaining cause can be pinned down.
      reportPotentialInputBlockers();
    };
    heal();
    [0, 60, 200, 550].forEach(delay => {
      setTimeout(heal, delay);
    });
  }, []);

  // Expose the input-blocker diagnostic so it can be run from the devtools
  // console at the exact moment the UI becomes unresponsive:
  //   window.gdReportInputBlockers()
  // and a manual heal:
  //   window.gdHealMainWindow()
  React.useEffect(() => {
    // $FlowFixMe[prop-missing] - debug handles.
    window.gdReportInputBlockers = reportPotentialInputBlockers;
    // $FlowFixMe[prop-missing]
    window.gdHealMainWindow = cleanupLeakedOverlaysAfterPopOutClose;
    return () => {
      // $FlowFixMe[prop-missing]
      delete window.gdReportInputBlockers;
      // $FlowFixMe[prop-missing]
      delete window.gdHealMainWindow;
    };
  }, []);

  const isPreviewLaunchCancelled = React.useCallback(
    (previewLaunchId: number) =>
      activePreviewLaunchIdRef.current !== previewLaunchId ||
      cancelledPreviewLaunchIdsRef.current.has(previewLaunchId),
    []
  );

  const clearPreviewLoadingForLaunch = React.useCallback(
    (previewLaunchId: number) => {
      if (activePreviewLaunchIdRef.current !== previewLaunchId) return;
      if (previewLoadingRef.current) {
        setPreviewLoading(null);
      }
    },
    [previewLoadingRef, setPreviewLoading]
  );

  const cancelPendingPreviewLaunchAfterWindowClosed = React.useCallback(
    (reason: string) => {
      const previewLaunchId = activePreviewLaunchIdRef.current;

      if (previewLaunchId == null) {
        if (previewLaunchInProgressRef.current) {
          setPreviewLaunchInProgress(false);
          previewLaunchPhaseRef.current = 'idle';
          activePreviewLaunchKindRef.current = null;
        }
        if (previewLoadingRef.current) {
          setPreviewLoading(null);
        }
        return;
      }

      cancelledPreviewLaunchIdsRef.current.add(previewLaunchId);
      if (previewLoadingRef.current) {
        setPreviewLoading(null);
      }

      console.info(
        `Cancelling preview launch #${previewLaunchId} because ${reason}.`
      );
      // Keep the shared lock owned by this launch until its finally block
      // runs. Releasing it here would let another launch read/write preview
      // files while the cancelled async launch is still unwinding.
    },
    [previewLoadingRef, setPreviewLoading, setPreviewLaunchInProgress]
  );

  const releaseCancelledPreviewPreparation = React.useCallback(
    (reason: string): boolean => {
      const previewLaunchId = activePreviewLaunchIdRef.current;
      if (
        !canReleaseCancelledPreviewPreparation({
          launchInProgress: previewLaunchInProgressRef.current,
          activePreviewLaunchId: previewLaunchId,
          isActivePreviewLaunchCancelled:
            previewLaunchId != null &&
            cancelledPreviewLaunchIdsRef.current.has(previewLaunchId),
          launchPhase: previewLaunchPhaseRef.current,
        })
      ) {
        return false;
      }

      console.warn(
        `Releasing cancelled preview preparation #${String(
          previewLaunchId
        )} because ${reason}. Its pending preparation step may still finish, but cancellation checks prevent it from launching a preview.`
      );
      activePreviewLaunchIdRef.current = null;
      setPreviewLaunchInProgress(false);
      previewLaunchPhaseRef.current = 'idle';
      activePreviewLaunchKindRef.current = null;
      if (previewLoadingRef.current) {
        setPreviewLoading(null);
      }
      return true;
    },
    [previewLoadingRef, setPreviewLoading, setPreviewLaunchInProgress]
  );

  const resetPreviewLaunchStateForProjectChange = React.useCallback(
    (reason: string) => {
      const previewLaunchId = activePreviewLaunchIdRef.current;
      if (previewLaunchId != null || previewLaunchInProgressRef.current) {
        console.warn(
          'Resetting preview launch state' +
            (previewLaunchId == null
              ? ''
              : ' for launch #' + previewLaunchId) +
            ' because ' +
            reason +
            '.'
        );
      }

      // Changing projects is a hard ownership boundary. Any launcher that was
      // awaiting asynchronous preparation now sees a mismatched active id and
      // exits at its cancellation/file-write gates before touching the new
      // project or its preview output.
      activePreviewLaunchIdRef.current = null;
      setPreviewLaunchInProgress(false);
      previewLaunchPhaseRef.current = 'idle';
      activePreviewLaunchKindRef.current = null;
      inGameEditionPreviewLaunchInProgressRef.current = false;
      cancelledPreviewLaunchIdsRef.current.clear();
      if (previewLoadingRef.current) {
        setPreviewLoading(null);
      }
    },
    [previewLoadingRef, setPreviewLoading, setPreviewLaunchInProgress]
  );

  const getPreviewLaunchStateForMcp = React.useCallback(
    () => {
      const isMcpPreviewLaunchInProgress =
        mcpPreviewLaunchInProgressRef.current;
      return {
        previewLoading: previewLoadingRef.current,
        launchInProgress:
          isMcpPreviewLaunchInProgress || previewLaunchInProgressRef.current,
        launchPhase:
          isMcpPreviewLaunchInProgress &&
          previewLaunchPhaseRef.current === 'idle'
            ? 'preparing'
            : previewLaunchPhaseRef.current,
        activePreviewLaunchId: activePreviewLaunchIdRef.current,
        cancelledPreviewLaunchCount: cancelledPreviewLaunchIdsRef.current.size,
      };
    },
    [previewLoadingRef]
  );

  React.useEffect(
    () => {
      if (!ipcRenderer) return;

      const onPreviewWindowClosed = (
        event: any,
        {
          remainingPreviewWindowsForParent,
        }: { remainingPreviewWindowsForParent?: number } = {}
      ) => {
        const isLastPreviewWindowClosed =
          remainingPreviewWindowsForParent === 0;
        if (isLastPreviewWindowClosed) {
          if (previewDebuggerServer) {
            previewDebuggerServer.closeAllPreviewConnections();
          }
          clearPreviewDebuggerStatuses();
        }
        if (isLastPreviewWindowClosed || !hasNonEditionPreviewsRunning) {
          cancelPendingPreviewLaunchAfterWindowClosed(
            'a preview window was closed'
          );
        }
      };

      ipcRenderer.on('preview-window-closed', onPreviewWindowClosed);
      return () =>
        ipcRenderer.removeListener(
          'preview-window-closed',
          onPreviewWindowClosed
        );
    },
    [
      cancelPendingPreviewLaunchAfterWindowClosed,
      clearPreviewDebuggerStatuses,
      hasNonEditionPreviewsRunning,
      previewDebuggerServer,
    ]
  );

  const getEditorOpeningOptions = React.useCallback(
    ({
      kind,
      name,
      dontFocusTab,
      project,
      paneIdentifier,
      continueProcessingFunctionCallsOnMount,
      scenePanelToOpen,
    }: {
      kind: EditorKind,
      name: string,
      dontFocusTab?: boolean,
      project?: ?gdProject,
      paneIdentifier?: 'left' | 'center' | 'right',
      continueProcessingFunctionCallsOnMount?: boolean,
      scenePanelToOpen?: ?SceneEditorPanelId,
    }) => {
      const label =
        kind === 'resources'
          ? i18n._(t`Resources`)
          : kind === 'constants'
          ? i18n._(t`Constants`)
          : kind === 'global-search'
          ? i18n._(t`Global search`)
          : kind === 'ask-ai'
          ? i18n._(t`Ask AI`)
          : kind === 'start page'
          ? undefined
          : kind === 'debugger'
          ? i18n._(t`Debugger`)
          : kind === 'layout events'
          ? name + ` ${i18n._(t`(Events)`)}`
          : kind === 'behavior detail'
          ? name.split('::')[1] + ` ${i18n._(t`(Behavior)`)}`
          : kind === 'function detail'
          ? name.split('::')[1] + ` ${i18n._(t`(Function)`)}`
          : kind === 'prefab detail'
          ? name.split('::')[1] + ` ${i18n._(t`(Prefab)`)}`
          : kind === 'custom object'
          ? name.split('::')[2] || name.split('::')[1] + ` ${i18n._(t`(UI)`)}`
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
        'behavior detail',
        'function detail',
        'prefab detail',
        'custom object',
      ].includes(kind)
        ? `${kind} ${name}`
        : kind;

      let customIconUrl = '';
      if (
        kind === 'events functions extension' ||
        kind === 'behavior detail' ||
        kind === 'function detail' ||
        kind === 'prefab detail' ||
        kind === 'custom object'
      ) {
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
        ) : kind === 'constants' ? (
          <ConstantsIcon />
        ) : kind === 'global-search' ? (
          <SearchIcon />
        ) : kind === 'layout' ? (
          <SceneIcon />
        ) : kind === 'layout events' ? (
          <EventsIcon />
        ) : kind === 'external events' ? (
          <ExternalEventsIcon />
        ) : kind === 'external layout' ? (
          <ExternalLayoutIcon />
        ) : kind === 'events functions extension' ||
          kind === 'behavior detail' ||
          kind === 'function detail' ||
          kind === 'prefab detail' ||
          kind === 'custom object' ? (
          <ExtensionIcon />
        ) : kind === 'ask-ai' ? (
          <RobotIcon size={16} />
        ) : null;

      const closable = kind !== 'start page';
      const extraEditorProps =
        kind === 'start page'
          ? { storageProviders: props.storageProviders }
          : kind === 'ask-ai'
          ? {
              continueProcessingFunctionCallsOnMount,
            }
          : kind === 'layout' && scenePanelToOpen
          ? {
              scenePanelToOpen,
              scenePanelToOpenRequestId: Date.now(),
            }
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
        paneIdentifier: paneIdentifier || 'center',
      };
    },
    [i18n, props.storageProviders]
  );

  const setEditorTabs = React.useCallback(
    // $FlowFixMe[missing-local-annot]
    newEditorTabs => {
      setState(state => ({
        ...state,
        editorTabs: newEditorTabs,
      }));
    },
    [setState]
  );

  const onPopOutTab = React.useCallback(
    (editorTab: EditorTab) => {
      setState(prevState => ({
        ...prevState,
        editorTabs: popOutTab(prevState.editorTabs, editorTab.key),
      }));
    },
    [setState]
  );

  const onPopInTab = React.useCallback(
    (editorTab: EditorTab) => {
      setState(prevState => ({
        ...prevState,
        editorTabs: popInTab(prevState.editorTabs, editorTab.key),
      }));
    },
    [setState]
  );

  const onExternalWindowClose = React.useCallback(
    (editorTab: EditorTab) => {
      setState(prevState => ({
        ...prevState,
        editorTabs: closeEditorTab(prevState.editorTabs, editorTab),
      }));
      // A popped-out editor window just closed: clear any Material-UI overlay
      // state it may have leaked into the main window (see
      // healMainWindowAfterPopOutClose).
      healMainWindowAfterPopOutClose();
    },
    [setState, healMainWindowAfterPopOutClose]
  );

  React.useEffect(
    () => {
      if (!ipcRenderer) return;

      const onDebuggerPopOutCloseRequested = () => {
        cancelPendingPreviewLaunchAfterWindowClosed(
          'the debugger window was closed'
        );
        setState(prevState => {
          const debuggerTab = getEditorTabOpenedWithKey(
            prevState.editorTabs,
            'debugger'
          );
          if (!debuggerTab) return prevState;

          return {
            ...prevState,
            editorTabs: closeEditorTab(
              prevState.editorTabs,
              debuggerTab.editorTab
            ),
          };
        });
        forceRefreshProjectManagerList();
        healMainWindowAfterPopOutClose();
      };

      ipcRenderer.on(
        'debugger-popout-close-requested',
        onDebuggerPopOutCloseRequested
      );
      return () =>
        ipcRenderer.removeListener(
          'debugger-popout-close-requested',
          onDebuggerPopOutCloseRequested
        );
    },
    [
      setState,
      forceRefreshProjectManagerList,
      healMainWindowAfterPopOutClose,
      cancelPendingPreviewLaunchAfterWindowClosed,
    ]
  );

  const {
    hasAPreviousSaveForEditorTabsState,
    openEditorTabsFromPersistedState,
  } = useEditorTabsStateSaving({
    currentProjectId: currentProject ? currentProject.getProjectUuid() : null,
    editorTabs: state.editorTabs,
    setEditorTabs: setEditorTabs,
    // $FlowFixMe[incompatible-type]
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
    async (initialTab?: ShareTab) => {
      if (
        await checkDiagnosticErrorsAndIfShouldBlock(currentProject, 'export')
      ) {
        return;
      }

      notifyPreviewOrExportWillStart(state.editorTabs);

      setShareDialogInitialTab(initialTab || null);
      setShareDialogOpen(true);
    },
    [state.editorTabs, currentProject, checkDiagnosticErrorsAndIfShouldBlock]
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
    const state = await openFromFileMetadata(initialFileMetadataToOpen, {
      ignoreAutoSave: Window.isRunningCommandFromCli(),
    });
    if (state)
      openSceneOrProjectManager({
        currentProject: state.currentProject,
        editorTabs: state.editorTabs,
      });
  };

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

  const openAskAi = React.useCallback(
    (options: ?OpenAskAiOptions) => {
      const {
        aiRequestId,
        paneIdentifier,
        continueProcessingFunctionCallsOnMount,
      } = options || {};
      const newPaneIdentifier =
        paneIdentifier || (currentProject ? 'right' : 'center');

      setState(state => {
        let openedEditor = getOpenedAskAiEditor(state.editorTabs);
        let newEditorTabs = state.editorTabs;
        if (openedEditor) {
          if (openedEditor.paneIdentifier !== newPaneIdentifier) {
            // The editor is opened, but not at the right position, close it.
            // It will re-open in the right pane.
            // Tell the editor not to suspend the AI request on close, since
            // we're just repositioning it, not intentionally closing it.
            if (openedEditor.askAiEditor) {
              openedEditor.askAiEditor.prepareToReposition();
            }
            newEditorTabs = closeEditorTab(
              newEditorTabs,
              openedEditor.editorTab
            );
            newEditorTabs = openEditorTab(
              newEditorTabs,
              // $FlowFixMe[incompatible-type]
              getEditorOpeningOptions({
                kind: 'ask-ai',
                name: '',
                paneIdentifier: newPaneIdentifier,
                continueProcessingFunctionCallsOnMount,
              })
            );
          }
        }

        newEditorTabs = openEditorTab(
          newEditorTabs,
          // $FlowFixMe[incompatible-type]
          getEditorOpeningOptions({
            kind: 'ask-ai',
            name: '',
            paneIdentifier: newPaneIdentifier,
            continueProcessingFunctionCallsOnMount,
          })
        );

        return {
          ...state,
          editorTabs: newEditorTabs,
        };
      }).then(state => {
        // Wait for the state to be updated before starting/opening the chat,
        // as the editor needs to be mounted.
        const params = aiRequestId === undefined ? undefined : { aiRequestId };
        const openedEditor = getOpenedAskAiEditor(state.editorTabs);
        if (!openedEditor) {
          console.error(
            'No Ask AI editor found after opening it. This should not happen.'
          );
          return;
        }
        if (openedEditor.askAiEditor) {
          openedEditor.askAiEditor.startOrOpenChat(params);
        }
      });
    },
    [setState, getEditorOpeningOptions, currentProject]
  );

  const closeAskAi = React.useCallback(
    () => {
      setState(state => {
        const openedEditor = getOpenedAskAiEditor(state.editorTabs);
        if (!openedEditor) return state;

        return {
          ...state,
          editorTabs: closeEditorTab(state.editorTabs, openedEditor.editorTab),
        };
      });
    },
    [setState]
  );

  const closeProject = React.useCallback(
    async (options?: {|
      reportProgress?: (phase: string) => void,
    |}): Promise<void> => {
      const reportProgress = (phase: string) => {
        if (options && options.reportProgress) {
          options.reportProgress(phase);
        }
      };
      reportProgress('old-project-closing-previews');
      resetPreviewLaunchStateForProjectChange(
        'the project was closed or replaced'
      );
      setHasProjectOpened(false);
      setPreviewState(initialPreviewState);

      console.info('Closing project...');
      const previewLauncher = _previewLauncher.current;
      if (previewLauncher && previewLauncher.closeAllPreviews) {
        previewLauncher.closeAllPreviews();
      }
      if (previewDebuggerServer) {
        previewDebuggerServer.closeAllConnections();
      }

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
      reportProgress('old-project-state-clearing');
      await setState(state => ({
        ...state,
        currentProject: null,
        currentFileMetadata: null,
        editorTabs: closeProjectTabs(state.editorTabs, currentProject),
        toolbarButtons: [],
      }));
      setResourceCustomPropertyConfigs([]);
      reportProgress('old-project-state-cleared');

      // Delete the project from memory. All references to it have been dropped previously
      // by the setState.
      console.info('Deleting project from memory...');
      // Wait for any in-progress load to complete before unloading, otherwise the
      // pending load would re-add the old project's extensions after we remove them.
      reportProgress('old-extensions-waiting');
      await eventsFunctionsExtensionsState.ensureLoadFinished(currentProject);
      reportProgress('old-extensions-unloading');
      eventsFunctionsExtensionsState.unloadProjectEventsFunctionsExtensions(
        currentProject
      );
      currentProject.delete();
      reportProgress('old-project-deleted');
      sealUnsavedChanges();
      console.info('Project closed.');

      // If AIEditor is opened on a side panel, then reposition it on the center.
      const openedAskAIEditor = getOpenedAskAiEditor(state.editorTabs);
      if (openedAskAIEditor && openedAskAIEditor.paneIdentifier !== 'center') {
        openAskAi({
          paneIdentifier: 'center',
        });
      }
    },
    [
      previewDebuggerServer,
      resetPreviewLaunchStateForProjectChange,
      currentProjectRef,
      eventsFunctionsExtensionsState,
      setHasProjectOpened,
      setState,
      setIsProjectClosedSoAvoidReloadingExtensions,
      sealUnsavedChanges,
      openAskAi,
      state.editorTabs,
    ]
  );

  const ensureProjectSettingsApplied = React.useCallback((): Promise<void> => {
    return lastProjectSettingsPromise.current || Promise.resolve();
  }, []);

  const loadProjectSettings = React.useCallback(
    (fileMetadata: ?FileMetadata): Promise<void> => {
      if (!fileMetadata) return Promise.resolve();

      const currentPromise: Promise<void> = (async () => {
        try {
          const parsedProjectSettings = await readProjectSettings(
            fileMetadata.fileIdentifier
          );
          if (parsedProjectSettings) {
            applyProjectPreferences(parsedProjectSettings, preferences);
            await setState(currentState => ({
              ...currentState,
              toolbarButtons: parsedProjectSettings.toolbarButtons || [],
            }));
            setResourceCustomPropertyConfigs(
              parsedProjectSettings.resourceCustomProperties || []
            );
          }
        } catch (error) {
          console.warn(
            '[MainFrame] Failed to read project settings:',
            error.message
          );
        } finally {
          // Only clear the ref if no newer load has been queued since.
          if (lastProjectSettingsPromise.current === currentPromise) {
            lastProjectSettingsPromise.current = null;
          }
        }
      })();

      lastProjectSettingsPromise.current = currentPromise;
      return currentPromise;
    },
    [preferences, setState]
  );

  const loadFromProject = React.useCallback(
    async (
      project: gdProject,
      fileMetadata: ?FileMetadata,
      reportProgress?: (phase: string) => void
    ): Promise<State> => {
      let updatedFileMetadata: ?FileMetadata = fileMetadata
        ? // $FlowFixMe[incompatible-type]
          updateFileMetadataWithOpenedProject(fileMetadata, project)
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
        // Also skip this when running a headless CLI command (`--run-command`):
        // such projects are opened programmatically (e.g. for automated exports)
        // and shouldn't pollute the "recent projects" list shown in the regular UI.
        if (onSaveProject && !Window.isRunningCommandFromCli()) {
          preferences.insertRecentProjectFile({
            fileMetadata: updatedFileMetadata,
            storageProviderName: storageProvider.internalName,
          });
        }
      }

      await closeProject({ reportProgress });

      // Make sure that the ResourcesLoader cache is emptied, so that
      // the URL to a resource with a name in the old project is not re-used
      // for another resource with the same name in the new project.
      ResourcesLoader.burstAllUrlsCache();
      PixiResourcesLoader.burstCache();

      // Set the on-disk path before exposing the project via state so that
      // consumers (like the CLI command dispatcher) can call getProjectFile()
      // immediately after the re-render triggered by setState.
      if (updatedFileMetadata) {
        project.setProjectFile(updatedFileMetadata.fileIdentifier);
      }

      // Start extension code generation before exposing the project via state.
      // This ensures that when the CLI useEffect fires (triggered by the
      // setState below), ensureLoadFinished(project) will see the pending promise
      // and wait for generation to complete.
      eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
        project
      );
      if (reportProgress) reportProgress('new-extensions-started');

      if (reportProgress) reportProgress('new-project-state-publishing');
      // Likewise, start reading the project's `gdevelop-settings.yaml` before
      // exposing the project via state, so `ensureProjectSettingsApplied()`
      // sees the pending promise as soon as the CLI useEffect fires.
      loadProjectSettings(updatedFileMetadata);
      const state = await setState(state => ({
        ...state,
        currentProject: project,
        currentFileMetadata: updatedFileMetadata,
      }));
      if (reportProgress) reportProgress('new-project-state-published');

      if (updatedFileMetadata) {
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
        if (reportProgress) reportProgress('resources-loading');
        await ensureResourcesAreFetched(() => ({
          project,
          fileMetadata: updatedFileMetadata,
          storageProvider,
          storageProviderOperations,
          authenticatedUser,
        }));
        if (reportProgress) reportProgress('resources-loaded');

        // Apply the preview layout override stored in the project file
        // (set via "Use this scene to start all previews").
        const previewLayoutName = project.getPreviewLayout();
        if (previewLayoutName && project.hasLayoutNamed(previewLayoutName)) {
          setPreviewState(previewState => ({
            ...previewState,
            isPreviewOverriden: true,
            overridenPreviewLayoutName: previewLayoutName,
            overridenPreviewExternalLayoutName: null,
          }));
        }

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
      setIsProjectClosedSoAvoidReloadingExtensions,
      loadProjectSettings,
    ]
  );

  const loadFromSerializedProject = React.useCallback(
    (
      serializedProject: gdSerializerElement,
      constants: Object,
      fileMetadata: ?FileMetadata,
      reportProgress?: (phase: string) => void
    ): Promise<State> => {
      if (reportProgress) reportProgress('project-unserializing');
      const startTime = Date.now();
      const newProject = gd.ProjectHelper.createNewGDJSProject();
      newProject.unserializeFrom(serializedProject);
      newProject.setConstantsJson(JSON.stringify(constants));
      if (reportProgress) reportProgress('project-unserialized');
      const duration = Date.now() - startTime;
      console.info(`Unserialization took ${duration.toFixed(2)} ms`);

      return loadFromProject(newProject, fileMetadata, reportProgress);
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
      options?: {|
        openingMessage?: ?MessageDescriptor,
        ignoreAutoSave?: boolean,
        suppressOpenErrorAlert?: boolean,
        doNotTrackAsProjectOpened?: boolean,
        reportProgress?: (phase: string) => void,
      |}
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
        if (
          !getAutoSaveCreationDate ||
          !onGetAutoSave ||
          (options && options.ignoreAutoSave)
        ) {
          return fileMetadata;
        }

        const autoSaveCreationDate = await getAutoSaveCreationDate(
          fileMetadata,
          true
        );
        if (!autoSaveCreationDate) return fileMetadata;

        await delay(200); // Ensure confirmation is shown on top of the loader.
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
        if (
          !getAutoSaveCreationDate ||
          !onGetAutoSave ||
          (options && options.ignoreAutoSave)
        ) {
          return null;
        }

        const autoSaveCreationDate = await getAutoSaveCreationDate(
          fileMetadata,
          false
        );
        if (!autoSaveCreationDate) return null;

        await delay(200); // Ensure confirmation is shown on top of the loader.
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
        await delay(50);
        let content;
        let constants = {};
        let effectiveFileMetadata = fileMetadata;
        let openingError: Error | null = null;
        try {
          const autoSaveFileMetadata = await checkForAutosave();
          if (options && options.reportProgress) {
            options.reportProgress('disk-reading');
          }
          const result = await onOpen(
            autoSaveFileMetadata,
            setLoaderModalProgress
          );
          content = result.content;
          constants = result.constants || {};
          if (options && options.reportProgress) {
            options.reportProgress('disk-read');
          }
          if (result.fileMetadata) {
            effectiveFileMetadata = result.fileMetadata;
          }
        } catch (error) {
          openingError = error;
          // onOpen failed, try to find again an autosave.
          const autoSaveAfterFailureFileMetadata = await checkForAutosaveAfterFailure();
          if (autoSaveAfterFailureFileMetadata) {
            const result = await onOpen(autoSaveAfterFailureFileMetadata);
            content = result.content;
            constants = result.constants || {};
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
            constants,
            // Autosaves keep the originally requested metadata. A storage adapter may
            // explicitly redirect a migrated legacy project to project.gdevelop.
            effectiveFileMetadata,
            options && options.reportProgress
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
          if (!(options && options.suppressOpenErrorAlert)) {
            const errorMessage = getOpenErrorMessage
              ? getOpenErrorMessage(error)
              : t`Ensure that you are connected to internet and that the URL used is correct, then try again.`;

            await showAlert({
              title: t`Unable to open the project`,
              message: errorMessage,
            });
          }
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
  }: UseCreateProjectReturnType = useCreateProject({
    beforeCreatingProject: () => {
      setIsProjectOpening(true);
    },
    getStorageProviderOperations,
    afterCreatingProject: async ({
      project,
      editorTabs,
      oldProjectId,
      fileMetadata,
      options,
    }) => {
      // Update the currentFileMetadata based on the updated project, as
      // it can have been updated in the meantime (gameId, project name, etc...).
      if (fileMetadata) {
        // $FlowFixMe[incompatible-type]
        const newFileMetadata: FileMetadata = updateFileMetadataWithOpenedProject(
          fileMetadata,
          project
        );
        setState(state => ({
          ...state,
          currentFileMetadata: newFileMetadata,
        }));
      }
      closeNewProjectDialog();
      if (options.openQuickCustomizationDialog) {
        setQuickCustomizationDialogOpenedFromGameId(oldProjectId);
      } else {
        // Replace leaderboards and configure multiplayer lobbies if needed.
        // In the case of quick customization, this will be done later.
        openLeaderboardReplacerDialogIfNeeded(project, oldProjectId);
        configureMultiplayerLobbiesIfNeeded(project, oldProjectId);
      }
      options.openAllScenes || options.openQuickCustomizationDialog
        ? openAllScenes({
            currentProject: project,
            editorTabs,
          })
        : openSceneOrProjectManager({
            currentProject: project,
            editorTabs,
          });
      // If Ask AI editor was opened, reposition it.
      const openedAskAIEditor = getOpenedAskAiEditor(editorTabs);
      if (openedAskAIEditor || options.forceOpenAskAiEditor) {
        openAskAi({
          paneIdentifier: 'right',
          continueProcessingFunctionCallsOnMount: true,
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
    ensureProjectExtensionsLoaded:
      eventsFunctionsExtensionsState.ensureLoadFinished,
    ensureResourcesAreMoved,
    onGameRegistered: gamesList.fetchGames,
  });

  const onOpenProfileDialog = React.useCallback(
    () => {
      openProfileDialog(true);
    },
    [openProfileDialog]
  );

  const closeApp = React.useCallback((): void => {
    return Window.quit();
  }, []);

  const closeProjectManagerOverlay = React.useCallback(
    () => {
      openProjectManager(false);
    },
    [openProjectManager]
  );

  const closePinnedProjectManager = React.useCallback(
    () => {
      openProjectManager(false);
      setProjectManagerPinned(false);
      setProjectManagerPinnedPreference(false);
    },
    [openProjectManager, setProjectManagerPinnedPreference]
  );

  const pinProjectManager = React.useCallback(
    () => {
      openProjectManager(false);
      setProjectManagerPinned(true);
      setProjectManagerPinnedPreference(true);
    },
    [openProjectManager, setProjectManagerPinnedPreference]
  );

  const keepPinnedProjectManagerOpen = React.useCallback(() => {}, []);

  const toggleProjectManager = React.useCallback(
    () => {
      if (isProjectManagerPinnedForCurrentProject) {
        closePinnedProjectManager();
        return;
      }

      openProjectManager(projectManagerOpen => !projectManagerOpen);
    },
    [
      closePinnedProjectManager,
      isProjectManagerPinnedForCurrentProject,
      openProjectManager,
    ]
  );

  const showProjectManager = React.useCallback(
    () => {
      if (isProjectManagerPinnedForCurrentProject) return;
      openProjectManager(true);
    },
    [isProjectManagerPinnedForCurrentProject, openProjectManager]
  );

  const activateProjectManagerItemFromSwitcher = React.useCallback(
    (itemId: string) => {
      const projectManager = projectManagerRef.current;
      if (projectManager) {
        projectManager.activateItemFromId(itemId);
        return;
      }

      setTimeout(() => {
        const projectManager = projectManagerRef.current;
        if (projectManager) projectManager.activateItemFromId(itemId);
      }, 0);
    },
    []
  );

  const openProjectVariablesFromSwitcher = React.useCallback(() => {
    const projectManager = projectManagerRef.current;
    if (projectManager) {
      projectManager.openProjectVariables();
      return;
    }

    setTimeout(() => {
      const projectManager = projectManagerRef.current;
      if (projectManager) projectManager.openProjectVariables();
    }, 0);
  }, []);

  const createProjectItemFromSwitcher = React.useCallback(
    (itemKind: ProjectManagerCreateItemKind) => {
      const projectManager = projectManagerRef.current;
      if (projectManager) {
        projectManager.createProjectItem(itemKind);
        return;
      }

      setTimeout(() => {
        const projectManager = projectManagerRef.current;
        if (projectManager) projectManager.createProjectItem(itemKind);
      }, 0);
    },
    []
  );

  const isProjectManagerVisible =
    projectManagerOpen || isProjectManagerPinnedForCurrentProject;

  const selectProjectManagerItemFromId = React.useCallback(
    (itemId: string, options?: {| force?: boolean |}) => {
      if (!isProjectManagerVisible) return;

      const projectManager = projectManagerRef.current;
      if (!projectManager) return;

      const force = !!(options && options.force);
      if (!force && lastSelectedProjectManagerItemIdRef.current === itemId) {
        return;
      }

      lastSelectedProjectManagerItemIdRef.current = itemId;
      projectManager.selectAndScrollToItemFromId(itemId);
    },
    [isProjectManagerVisible]
  );

  const selectProjectManagerItemForEditorTab = React.useCallback(
    (editorTab: EditorTab, options?: {| force?: boolean |}) => {
      const project = currentProjectRef.current;
      if (!project) return;

      const itemId = getProjectManagerTreeViewItemIdForEditorTab(
        project,
        editorTab.kind,
        editorTab.projectItemName
      );
      if (!itemId) return;

      selectProjectManagerItemFromId(itemId, options);
    },
    [currentProjectRef, selectProjectManagerItemFromId]
  );

  const recordRecentNavigationEntry = React.useCallback((id: string) => {
    setRecentNavigationEntryIds(previousIds =>
      [id, ...previousIds.filter(previousId => previousId !== id)].slice(0, 80)
    );
    setRecentNavigationEntryUseCounts(previousUseCounts => ({
      ...previousUseCounts,
      [id]: (previousUseCounts[id] || 0) + 1,
    }));
  }, []);

  const activateRecentEditorSwitcherEntry = React.useCallback(
    (entry: RecentEditorSwitcherEntry) => {
      if (!entry.editorTab) return;

      const openedEditor = getEditorTabOpenedWithKey(
        state.editorTabs,
        entry.id
      );
      if (!openedEditor) return;

      setRecentEditorSwitcherOpen(false);
      recordRecentNavigationEntry(openedEditor.editorTab.key);

      if (openedEditor.paneIdentifier === 'external') {
        setPoppedOutEditorFocusRequest({
          editorKey: openedEditor.editorTab.key,
          requestId: Date.now(),
        });
        return;
      }

      setState(prevState => {
        const currentOpenedEditor = getEditorTabOpenedWithKey(
          prevState.editorTabs,
          openedEditor.editorTab.key
        );
        if (!currentOpenedEditor) return prevState;

        return {
          ...prevState,
          editorTabs: changeCurrentTab(
            prevState.editorTabs,
            currentOpenedEditor.paneIdentifier,
            currentOpenedEditor.tabIndex
          ),
        };
      });

      selectProjectManagerItemForEditorTab(openedEditor.editorTab, {
        force: true,
      });

      if (openedEditor.editorTab.editorRef) {
        openedEditor.editorTab.editorRef.forceUpdateEditor();
      }
    },
    [
      selectProjectManagerItemForEditorTab,
      setState,
      state.editorTabs,
      setPoppedOutEditorFocusRequest,
      recordRecentNavigationEntry,
    ]
  );

  const activateRecentEditorSwitcherSideMenuItem = React.useCallback(
    (item: RecentEditorSwitcherSideMenuItem) => {
      setRecentEditorSwitcherOpen(false);
      recordRecentNavigationEntry(item.id);
      item.activate();
    },
    [recordRecentNavigationEntry]
  );

  const activateRecentEditorSwitcherActionItem = React.useCallback(
    (item: RecentEditorSwitcherActionItem) => {
      setRecentEditorSwitcherOpen(false);
      recordRecentNavigationEntry(item.id);
      item.activate();
    },
    [recordRecentNavigationEntry]
  );

  // When the project manager is shown, highlight and scroll to the item
  // matching the currently focused editor page (e.g. the open scene), so the
  // user immediately sees where they are in the project tree.
  React.useEffect(
    () => {
      if (!isProjectManagerVisible) return;

      const project = currentProjectRef.current;
      const editorTabs = editorTabsRef.current;
      if (!project || !editorTabs) return;

      // Find the focused tab, preferring the center pane (the main editor),
      // then any other non-external pane that maps to a project tree item.
      const paneIdentifiers = [
        'center',
        ...Object.keys(editorTabs.panes).filter(
          paneIdentifier =>
            paneIdentifier !== 'center' && paneIdentifier !== 'external'
        ),
      ];
      let itemId = null;
      for (const paneIdentifier of paneIdentifiers) {
        if (!editorTabs.panes[paneIdentifier]) continue;
        const currentTab = getCurrentTabForPane(editorTabs, paneIdentifier);
        if (!currentTab) continue;
        itemId = getProjectManagerTreeViewItemIdForEditorTab(
          project,
          currentTab.kind,
          currentTab.projectItemName
        );
        if (itemId) break;
      }
      if (!itemId) return;
      const itemIdToSelect = itemId;

      // The project manager tree view needs a moment to (re)render its rows
      // when it is shown before we can select and scroll to the item.
      const timeoutId = setTimeout(() => {
        selectProjectManagerItemFromId(itemIdToSelect, { force: true });
      }, 150);
      return () => clearTimeout(timeoutId);
    },
    [
      isProjectManagerVisible,
      currentProjectRef,
      editorTabsRef,
      selectProjectManagerItemFromId,
    ]
  );

  const deleteLayout = (layout: gdLayout) => {
    const project = currentProject;
    const { i18n } = props;
    if (!project) return;

    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to remove this scene? This can't be undone.`
      )
    );
    if (!answer) return;

    setState(state => ({
      ...state,
      editorTabs: closeLayoutTabs(state.editorTabs, layout),
    })).then(() => {
      if (!isCurrentProjectFresh(currentProjectRef, project)) return;
      if (project.getFirstLayout() === layout.getName())
        project.setFirstLayout('');
      project.removeLayout(layout.getName());
      _onProjectItemModified();
    });
  };

  const deleteExternalLayout = (externalLayout: gdExternalLayout) => {
    const project = currentProject;
    const { i18n } = props;
    if (!project) return;

    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to remove this external layout? This can't be undone.`
      )
    );
    if (!answer) return;

    setState(state => ({
      ...state,
      editorTabs: closeExternalLayoutTabs(state.editorTabs, externalLayout),
    })).then(() => {
      if (!isCurrentProjectFresh(currentProjectRef, project)) return;
      project.removeExternalLayout(externalLayout.getName());
      _onProjectItemModified();
    });
  };

  const deleteExternalEvents = (externalEvents: gdExternalEvents) => {
    const { i18n } = props;
    const project = currentProject;
    if (!project) return;

    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to remove these external events? This can't be undone.`
      )
    );
    if (!answer) return;

    setState(state => ({
      ...state,
      editorTabs: closeExternalEventsTabs(state.editorTabs, externalEvents),
    })).then(() => {
      if (!isCurrentProjectFresh(currentProjectRef, project)) return;
      project.removeExternalEvents(externalEvents.getName());
      _onProjectItemModified();
    });
  };

  const deleteEventsFunctionsExtension = async (
    eventsFunctionsExtension: gdEventsFunctionsExtension
  ) => {
    const { currentProject } = state;
    const { i18n } = props;
    if (!currentProject) return;

    const dependentExtensionNames = gd.UsedExtensionsFinder.findExtensionsDependentOn(
      currentProject,
      eventsFunctionsExtension
    ).toJSArray();

    const deleteAnswer = await showDeleteConfirmation({
      title: t`Remove the extension`,
      message: t`${
        dependentExtensionNames.length > 0
          ? i18n._(
              `This extension is used by the following extensions:${'\n\n' +
                dependentExtensionNames
                  .map(
                    extensionName =>
                      `- ${(currentProject.hasEventsFunctionsExtensionNamed(
                        extensionName
                      )
                        ? currentProject
                            .getEventsFunctionsExtension(extensionName)
                            .getFullName()
                        : extensionName) || extensionName}\n`
                  )
                  .join('') +
                '\n'}`
            )
          : ''
      }Are you sure you want to remove this extension? This can't be undone.`,
    });
    if (!deleteAnswer) return;

    const extensionName = eventsFunctionsExtension.getName();
    const hasCustomObject =
      eventsFunctionsExtension.getEventsBasedObjects().size() > 0;
    setState(state => ({
      ...state,
      editorTabs: closeEventsFunctionsExtensionTabs(
        state.editorTabs,
        extensionName
      ),
    })).then(async state => {
      // Ensure no other previous call to this method is happening on an
      // outdated extension list.
      await eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
        currentProject
      );

      // Unload the Platform extension that was generated from the events
      // functions extension.
      eventsFunctionsExtensionsState.unloadProjectEventsFunctionsExtension(
        currentProject,
        extensionName
      );
      currentProject.removeEventsFunctionsExtension(extensionName);

      // Reload extensions to make sure any extension that would have been relying
      // on the unloaded extension is updated.
      await eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions(
        currentProject
      );

      if (hasCustomObject) {
        notifyChangesToInGameEditor({
          shouldReloadProjectData: true,
          shouldReloadLibraries: true,
          shouldReloadResources: false,
          shouldHardReload: true,
          reasons: ['deleted-extension-with-custom-object'],
        });
      } else {
        notifyChangesToInGameEditor({
          shouldReloadProjectData: true,
          shouldReloadLibraries: true,
          shouldReloadResources: false,
          shouldHardReload: false,
          reasons: ['deleted-extension-without-custom-object'],
        });
      }
      _onProjectItemModified();
    });
  };

  const onWillInstallExtension = React.useCallback(
    (extensionNames: Array<string>) => {
      const currentProject = state.currentProject;
      if (!currentProject) return;

      for (const extensionName of extensionNames) {
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
      }
    },
    [state.currentProject, setState]
  );

  const notifyChangesToInGameEditor = React.useCallback(
    (hotReloadSteps: HotReloadSteps) => {
      let hasReloadIfNeeded = false;
      for (const paneIdentifier in state.editorTabs.panes) {
        const currentTab = getCurrentTabForPane(
          state.editorTabs,
          paneIdentifier
        );
        const editorRef = currentTab ? currentTab.editorRef : null;
        if (editorRef) {
          editorRef.notifyChangesToInGameEditor(hotReloadSteps);
          hasReloadIfNeeded = true;
        }
      }
      if (!hasReloadIfNeeded) {
        setEditorHotReloadNeeded(hotReloadSteps);
      }
    },
    [state.editorTabs]
  );

  const onExtensionInstalled = React.useCallback(
    (extensionNames: Array<string>) => {
      const currentProject = state.currentProject;
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
        notifyChangesToInGameEditor({
          shouldReloadProjectData: true,
          shouldReloadLibraries: true,
          shouldReloadResources: false,
          shouldHardReload: false,
          reasons: ['installed-extension-with-custom-object'],
        });
      }
    },
    [state.currentProject, notifyChangesToInGameEditor, setState]
  );

  const importExtension = useImportExtension();

  const onImportExtension = React.useCallback(
    async () => {
      const currentProject = state.currentProject;
      if (!currentProject) return;
      await importExtension({
        i18n,
        project: currentProject,
        onWillInstallExtension,
        onExtensionInstalled,
      });
    },
    [
      state.currentProject,
      importExtension,
      i18n,
      onWillInstallExtension,
      onExtensionInstalled,
    ]
  );

  const triggerHotReloadInGameEditorIfNeeded = React.useCallback(
    () => {
      notifyChangesToInGameEditor({
        shouldReloadProjectData: false,
        shouldReloadLibraries: false,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['triggered-if-needed'],
      });
    },
    [notifyChangesToInGameEditor]
  );

  const [
    showRestartInGameEditorAfterErrorButton,
    setShowRestartInGameEditorAfterErrorButton,
  ] = React.useState(false);
  const onRestartInGameEditor = React.useCallback(
    (reason: string) => {
      setShowRestartInGameEditorAfterErrorButton(false);
      notifyChangesToInGameEditor({
        shouldReloadProjectData: true,
        shouldReloadLibraries: true,
        shouldReloadResources: true,
        shouldHardReload: true,
        reasons: [reason],
      });
    },
    [notifyChangesToInGameEditor]
  );

  React.useEffect(
    () => {
      if (gameEditorMode === 'embedded-game') {
        // The in-game editor is never hot-reloaded:
        // - in 2D mode
        // - from a tab without 3D editor
        //
        // It triggers required hot-reload level when users:
        // - switch to 3D mode
        // - switch to a 3D editor tab
        //
        // Hot-reloads are triggered right away from a 3D editor.
        // Which means this call won't do any hot-reload when switching between
        // 2 3D editors but only switch the scene.
        notifyChangesToInGameEditor({
          shouldReloadProjectData: false,
          shouldReloadLibraries: false,
          shouldReloadResources: false,
          shouldHardReload: false,
          reasons: ['switched-tab-while-using-3d-editor'],
        });
      } else {
        // Switch the 3D editor to the same scene as the 2D one.
        // It allows to keep the 3D editor up to date for a fast switch
        // between 2D and 3D.
        for (const paneIdentifier in state.editorTabs.panes) {
          const currentTab = getCurrentTabForPane(
            state.editorTabs,
            paneIdentifier
          );
          const editorRef = currentTab ? currentTab.editorRef : null;
          if (editorRef) {
            editorRef.switchInGameEditorIfNoHotReloadIsNeeded();
          }
        }
      }
    },
    [gameEditorMode, state.editorTabs, notifyChangesToInGameEditor]
  );

  useAutomatedRegularInGameEditorRestart({
    onRestartInGameEditor,
    gameEditorMode,
  });

  const onExternalAssociationChanged = React.useCallback(
    () => {
      triggerUnsavedChanges();
      forceUpdate();
      if (projectManagerRef.current) {
        projectManagerRef.current.forceUpdateList();
      }
      notifyChangesToInGameEditor({
        shouldReloadProjectData: true,
        shouldReloadLibraries: false,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['external-association-changed'],
      });
    },
    [forceUpdate, notifyChangesToInGameEditor, triggerUnsavedChanges]
  );

  const onResourceExternallyChanged = React.useCallback(
    (resourceInfo: {| identifier: string |}) => {
      console.info(
        'Resource externally changed: notifying changes to in-game editor.'
      );
      const shouldHardReload = shouldHardReloadForExternallyChangedResource(
        resourceInfo.identifier
      );
      notifyChangesToInGameEditor({
        shouldReloadProjectData: true, // A resource file might have been changed.
        shouldReloadLibraries: false,
        shouldReloadResources: true,
        // In-place 3D model hot reload temporarily retains both the previous
        // parsed model/live clones and the replacement. Reload the embedded
        // game document so large animated models cannot spike the editor
        // renderer heap and take the whole Electron UI down.
        shouldHardReload,
        reasons: [
          shouldHardReload
            ? '3d-model-resource-externally-changed'
            : 'resource-externally-changed',
        ],
      });
    },
    [notifyChangesToInGameEditor]
  );

  const onResourceUsageChanged = React.useCallback(
    () => {
      console.info(
        'Resource usage changed: notifying changes to in-game editor.'
      );
      if (isEditorHotReloadNeeded()) {
        notifyChangesToInGameEditor({
          shouldReloadProjectData: true,
          shouldReloadLibraries: false,
          shouldReloadResources: true,
          shouldHardReload: false,
          reasons: ['resource-usage-changed'],
        });
      } else {
        notifyChangesToInGameEditor({
          shouldReloadProjectData: true,
          shouldReloadLibraries: false,
          shouldReloadResources: true,
          shouldHardReload: false,
          reasons: ['resource-usage-changed'],
        });
      }
    },
    [notifyChangesToInGameEditor]
  );

  const onSceneAdded = React.useCallback(
    () => {
      notifyChangesToInGameEditor({
        shouldReloadProjectData: true,
        shouldReloadLibraries: false,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['scene-added'],
      });
    },
    [notifyChangesToInGameEditor]
  );

  const onExternalLayoutAdded = React.useCallback(
    () => {
      notifyChangesToInGameEditor({
        shouldReloadProjectData: true,
        shouldReloadLibraries: false,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['external-layout-added'],
      });
    },
    [notifyChangesToInGameEditor]
  );

  const onEffectAdded = React.useCallback(
    () => {
      // Ensure the effect implementation is exported.
      notifyChangesToInGameEditor({
        shouldReloadProjectData: true,
        shouldReloadLibraries: true,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['effect-added'],
      });
    },
    [notifyChangesToInGameEditor]
  );

  const onObjectListsModified = React.useCallback(
    ({ isNewObjectTypeUsed }: { isNewObjectTypeUsed: boolean }) => {
      notifyChangesToInGameEditor({
        shouldReloadProjectData: true,
        shouldReloadLibraries: isNewObjectTypeUsed,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['object-lists-modified'],
      });
    },
    [notifyChangesToInGameEditor]
  );

  // Rename matching tabs in place instead of closing them: the stable `id` keeps
  // the editor mounted (selection/zoom preserved); only name-derived fields are
  // recomputed. (Restored from upstream PR #8756.)
  const getEditorTabsWithRenamedProjectItem = (
    editorTabs: EditorTabsState,
    project: gdProject,
    getNewProjectItemName: (tab: {|
      +kind: EditorKind,
      +projectItemName: ?string,
    |}) => ?string
  ): EditorTabsState =>
    renameEditorTabs(editorTabs, editorTab => {
      const newProjectItemName = getNewProjectItemName({
        kind: editorTab.kind,
        projectItemName: editorTab.projectItemName,
      });
      if (!newProjectItemName) return null;
      // $FlowFixMe[incompatible-type] - same Flow invariance as the openEditorTab calls.
      const newOptions: EditorOpeningOptions = getEditorOpeningOptions({
        kind: editorTab.kind,
        name: newProjectItemName,
        project,
      });
      return {
        key: newOptions.key,
        label: newOptions.label,
        projectItemName: newOptions.projectItemName,
        tabOptions: newOptions.tabOptions,
        icon: newOptions.icon,
        renderCustomIcon: newOptions.renderCustomIcon,
      };
    });

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

    renameLayoutInProject(currentProject, oldName, uniqueNewName);
    if (inAppTutorialOrchestratorRef.current) {
      inAppTutorialOrchestratorRef.current.changeData(oldName, uniqueNewName);
    }

    // Rename matching tabs in place instead of closing them.
    setState(state => ({
      ...state,
      editorTabs: getEditorTabsWithRenamedProjectItem(
        state.editorTabs,
        currentProject,
        editorTab =>
          getRenamedLayoutTabProjectItemName(editorTab, oldName, uniqueNewName)
      ),
    })).then(() => {
      notifyChangesToInGameEditor({
        shouldReloadProjectData: true,
        shouldReloadLibraries: false,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['renamed-scene'],
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
    externalLayout.setName(uniqueNewName);
    gd.WholeProjectRefactorer.renameExternalLayout(
      currentProject,
      oldName,
      uniqueNewName
    );

    // Rename matching tabs in place instead of closing them.
    setState(state => ({
      ...state,
      editorTabs: getEditorTabsWithRenamedProjectItem(
        state.editorTabs,
        currentProject,
        editorTab =>
          getRenamedExternalLayoutTabProjectItemName(
            editorTab,
            oldName,
            uniqueNewName
          )
      ),
    })).then(() => {
      notifyChangesToInGameEditor({
        shouldReloadProjectData: true,
        shouldReloadLibraries: false,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['renamed-external-layout'],
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
    externalEvents.setName(uniqueNewName);
    gd.WholeProjectRefactorer.renameExternalEvents(
      currentProject,
      oldName,
      uniqueNewName
    );

    // Rename matching tabs in place instead of closing them.
    setState(state => ({
      ...state,
      editorTabs: getEditorTabsWithRenamedProjectItem(
        state.editorTabs,
        currentProject,
        editorTab =>
          getRenamedExternalEventsTabProjectItemName(
            editorTab,
            oldName,
            uniqueNewName
          )
      ),
    })).then(() => {
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

    // Rename matching tabs in place instead of closing them (the extension tab
    // and any custom-object tab belonging to this extension).
    setState(state => ({
      ...state,
      editorTabs: getEditorTabsWithRenamedProjectItem(
        state.editorTabs,
        currentProject,
        editorTab =>
          getRenamedExtensionTabProjectItemName(
            editorTab,
            oldName,
            safeAndUniqueNewName
          )
      ),
    })).then(async state => {
      await eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions(
        currentProject
      );
      notifyChangesToInGameEditor({
        shouldReloadProjectData: false,
        shouldReloadLibraries: true,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['renamed-extension'],
      });
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
    })).then(state => {
      notifyChangesToInGameEditor({
        shouldReloadProjectData: true,
        shouldReloadLibraries: true,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['renamed-custom-object'],
      });
    });
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
    })).then(state => {
      notifyChangesToInGameEditor({
        shouldReloadProjectData: true,
        shouldReloadLibraries: true,
        shouldReloadResources: false,
        shouldHardReload: true,
        reasons: ['deleted-custom-object'],
      });
    });
  };

  const onRenamedEventsBasedObjectVariant = (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventBasedObject: gdEventsBasedObject,
    oldName: string,
    newName: string
  ): void => {
    if (oldName === newName) return;

    setState(state => ({
      ...state,
      editorTabs: closeEventsBasedObjectVariantTab(
        state.editorTabs,
        eventsFunctionsExtension.getName(),
        eventBasedObject.getName(),
        oldName
      ),
    })).then(state => {
      notifyChangesToInGameEditor({
        shouldReloadProjectData: true,
        shouldReloadLibraries: true,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['renamed-custom-object-variant'],
      });
    });
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
    })).then(state => {
      notifyChangesToInGameEditor({
        shouldReloadProjectData: true,
        shouldReloadLibraries: true,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['deleted-custom-object-variant'],
      });
    });
  };

  const setPreviewedLayout = ({
    layoutName,
    externalLayoutName,
  }: {
    layoutName: string | null,
    externalLayoutName: string | null,
  }) => {
    setPreviewState(
      previewState =>
        ({
          ...previewState,
          previewLayoutName: layoutName,
          previewExternalLayoutName: externalLayoutName,
        }: PreviewState)
    );
  };

  // $FlowFixMe[missing-local-annot]
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

    // Persist the preview layout override on the project (like firstLayout),
    // so it is restored when the project is re-opened.
    if (currentProject) {
      const persistedLayoutName =
        isPreviewOverriden && overridenPreviewLayoutName
          ? overridenPreviewLayoutName
          : '';
      if (currentProject.getPreviewLayout() !== persistedLayoutName) {
        currentProject.setPreviewLayout(persistedLayoutName);
        triggerUnsavedChanges();
      }
    }
  };

  const autosaveProjectIfNeeded = React.useCallback(
    async (): Promise<?FileMetadata> => {
      if (!currentProject || !currentFileMetadata) return null;

      if (!hasUnsavedChanges) {
        return currentFileMetadata;
      }

      if (saveProjectRef.current) {
        // Use the normal save path so preview persists the project file.
        return (await saveProjectRef.current()) || null;
      }

      const storageProviderOperations = getStorageProviderOperations();
      if (storageProviderOperations.onAutoSaveProject) {
        try {
          await storageProviderOperations.onAutoSaveProject(
            currentProject,
            currentFileMetadata
          );
          return currentFileMetadata;
        } catch (err) {
          console.error('Error while auto-saving the project: ', err);
          _showSnackMessage(
            i18n._(
              t`There was an error while making an auto-save of the project. Verify that you have permissions to write in the project folder.`
            )
          );
        }
      }

      return null;
    },
    [
      i18n,
      _showSnackMessage,
      currentProject,
      currentFileMetadata,
      hasUnsavedChanges,
      getStorageProviderOperations,
    ]
  );

  const loadProjectFromSavedFileForPreview = React.useCallback(
    async (fileMetadata: FileMetadata): Promise<?gdProject> => {
      const { onOpen } = getStorageProviderOperations();

      if (!onOpen) {
        console.warn(
          'Unable to load the saved project for preview: the storage provider does not support opening files.'
        );
        return null;
      }

      let serializedProject: ?gdSerializerElement = null;
      let previewProject: ?gdProject = null;
      try {
        const { content, constants = {} } = await onOpen(fileMetadata);
        if (!verifyProjectContent(i18n, content)) {
          return null;
        }

        serializedProject = gd.Serializer.fromJSObject(content);
        previewProject = gd.ProjectHelper.createNewGDJSProject();
        previewProject.unserializeFrom(serializedProject);
        previewProject.setConstantsJson(JSON.stringify(constants));
        previewProject.setProjectFile(fileMetadata.fileIdentifier);
        return previewProject;
      } catch (error) {
        console.warn(
          'Unable to load the saved project for preview. Falling back to the in-memory project.',
          error
        );
        if (previewProject) {
          previewProject.delete();
        }
        return null;
      } finally {
        if (serializedProject) {
          serializedProject.delete();
        }
      }
    },
    [getStorageProviderOperations, i18n]
  );

  const inGameEditorSettings = useInGameEditorSettings();

  const _launchPreview = React.useCallback(
    async ({
      networkPreview,
      forcedPreviewLayoutName,
      numberOfWindows,
      hotReload,
      shouldReloadProjectData,
      shouldReloadLibraries,
      shouldGenerateScenesEventsCode,
      shouldReloadResources,
      shouldHardReload,
      fullLoadingScreen,
      forceDiagnosticReport,
      skipDiagnosticErrorBlocking,
      forceAlwaysOnTopInPreview,
      launchCaptureOptions,
      isForInGameEdition,
    }: LaunchPreviewOptions): Promise<boolean> => {
      if (!currentProject) return false;
      if (currentProject.getLayoutsCount() === 0) return false;

      if (previewLaunchInProgressRef.current || previewLoadingRef.current) {
        const launchIdToWaitFor = activePreviewLaunchIdRef.current;
        const shouldWaitForInGameEditionPreview =
          !isForInGameEdition &&
          (activePreviewLaunchKindRef.current === 'in-game-edition' ||
            previewLoadingRef.current === 'hot-reload-for-in-game-edition');
        if (shouldWaitForInGameEditionPreview) {
          const waitDeadline = Date.now() + 10000;
          while (
            (previewLaunchInProgressRef.current || previewLoadingRef.current) &&
            activePreviewLaunchIdRef.current === launchIdToWaitFor &&
            Date.now() < waitDeadline
          ) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        if (previewLaunchInProgressRef.current || previewLoadingRef.current) {
          console.info(
            'Skipping a duplicate preview request because another preview launch still owns the pipeline.'
          );
          return false;
        }
      }

      let previewProjectLoadedFromFile: ?gdProject = null;
      const previewLaunchId = previewLaunchIdRef.current + 1;
      previewLaunchIdRef.current = previewLaunchId;
      activePreviewLaunchIdRef.current = previewLaunchId;
      activePreviewLaunchKindRef.current = isForInGameEdition
        ? 'in-game-edition'
        : 'standard';
      cancelledPreviewLaunchIdsRef.current.delete(previewLaunchId);
      setPreviewLaunchInProgress(true);
      previewLaunchPhaseRef.current = 'preparing';
      try {
        if (!isForInGameEdition && !skipDiagnosticErrorBlocking) {
          const shouldBlockPreview = await checkDiagnosticErrorsAndIfShouldBlock(
            currentProject,
            'preview'
          );
          if (isPreviewLaunchCancelled(previewLaunchId)) {
            return false;
          }
          if (shouldBlockPreview) {
            return false;
          }
        }

        console.info(
          `Launching a new ${
            isForInGameEdition ? 'in-game edition preview' : 'preview'
          } with options:`,
          {
            networkPreview,
            numberOfWindows,
            hotReload,
            shouldReloadProjectData,
            shouldReloadLibraries,
            shouldGenerateScenesEventsCode,
            shouldReloadResources,
            shouldHardReload,
            displayCollisionMaskInPreview,
            displaySignalAnimationsInPreview,
            fullLoadingScreen,
            forceDiagnosticReport,
            skipDiagnosticErrorBlocking,
            forceAlwaysOnTopInPreview,
            launchCaptureOptions,
            isForInGameEdition,
          }
        );

        const previewLauncher = _previewLauncher.current;
        if (!previewLauncher) {
          console.error('Preview launcher not found.');
          return false;
        }

        if (previewLoadingRef.current) {
          console.info(
            'Skipping a duplicate preview request because preview loading started before this launch could continue.'
          );
          // Note that in an ideal situation, each previewed game could continue to load
          // without being impacted by a new preview being worked on.
          // The main issue currently is files being erased/copied by the second preview,
          // which can break the game of the first preview,
          // when the game is loading its resources or reading files.
          return false;
        }

        // Open the preview windows immediately, if required by the preview launcher.
        // This is because some browsers (like Safari or Firefox) will block the
        // window opening if done after an asynchronous operation.
        const previewWindows = previewLauncher.immediatelyPreparePreviewWindows
          ? previewLauncher.immediatelyPreparePreviewWindows({
              project: currentProject,
              hotReload: !!hotReload,
              numberOfWindows: numberOfWindows || 1,
              isForInGameEdition: !!isForInGameEdition,
            })
          : null;

        notifyPreviewOrExportWillStart(state.editorTabs);

        let savedFileMetadataForPreview: ?FileMetadata = null;
        if (!isForInGameEdition) {
          try {
            savedFileMetadataForPreview = await autosaveProjectIfNeeded();
          } catch (err) {
            console.error(
              'Error while auto-saving the project. Ignoring.',
              err
            );
          }
        }
        if (isPreviewLaunchCancelled(previewLaunchId)) {
          return false;
        }

        // Mark the preview as loading after the optional save. The
        // `previewLaunchInProgressRef` above prevents duplicate launches while
        // saving without displaying the preview loader over save dialogs.
        setPreviewLoading(
          isForInGameEdition && hotReload
            ? 'hot-reload-for-in-game-edition'
            : 'preview'
        );

        let projectForPreview = currentProject;
        if (!isForInGameEdition && savedFileMetadataForPreview) {
          const loadedProject = await loadProjectFromSavedFileForPreview(
            savedFileMetadataForPreview
          );
          if (isPreviewLaunchCancelled(previewLaunchId)) {
            if (loadedProject) {
              loadedProject.delete();
            }
            return false;
          }
          if (loadedProject) {
            if (loadedProject.getLayoutsCount() === 0) {
              console.warn(
                'Saved project loaded for preview has no scene. Falling back to the in-memory project.'
              );
              loadedProject.delete();
            } else {
              previewProjectLoadedFromFile = loadedProject;
              projectForPreview = loadedProject;
            }
          }
        }

        // A forced layout name (e.g. from MCP) takes precedence over the
        // editor's active/previewed tab, so a preview can be launched on a
        // specific scene without the corresponding tab being focused. When
        // forced, there is no associated external layout.
        const hasForcedPreviewLayout =
          !isForInGameEdition &&
          !!forcedPreviewLayoutName &&
          projectForPreview.hasLayoutNamed(forcedPreviewLayoutName);
        const sceneName = isForInGameEdition
          ? isForInGameEdition.forcedSceneName
          : hasForcedPreviewLayout
          ? forcedPreviewLayoutName
          : previewState.isPreviewOverriden
          ? previewState.overridenPreviewLayoutName
          : previewState.previewLayoutName;
        const externalLayoutName = isForInGameEdition
          ? isForInGameEdition.forcedExternalLayoutName
          : hasForcedPreviewLayout
          ? null
          : previewState.isPreviewOverriden
          ? previewState.overridenPreviewExternalLayoutName
          : previewState.previewExternalLayoutName;

        const fallbackAuthor = authenticatedUser.profile
          ? {
              username: authenticatedUser.profile.username || '',
              id: authenticatedUser.profile.id,
            }
          : null;

        const [authenticatedPlayer, captureOptions] = await Promise.all([
          isForInGameEdition ? null : getAuthenticatedPlayerForPreview(),
          isForInGameEdition
            ? null
            : createCaptureOptionsForPreview(launchCaptureOptions),
        ]);
        if (isPreviewLaunchCancelled(previewLaunchId)) {
          return false;
        }

        try {
          await eventsFunctionsExtensionsState.ensureLoadFinished(
            currentProject
          );
          if (isPreviewLaunchCancelled(previewLaunchId)) {
            return false;
          }
          if (projectForPreview !== currentProject) {
            await eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
              projectForPreview
            );
            if (isPreviewLaunchCancelled(previewLaunchId)) {
              return false;
            }
          }

          // Note that in the future, this kind of checks could be done
          // and stored in a "diagnostic report", rather than hiding errors
          // from the user.
          findAndLogProjectPreviewErrors(projectForPreview);

          const startTime = Date.now();
          let inAppTutorialMessageInPreview = { message: '', position: '' };
          if (inAppTutorialOrchestratorRef.current) {
            inAppTutorialMessageInPreview =
              inAppTutorialOrchestratorRef.current.getPreviewMessage() ||
              inAppTutorialMessageInPreview;
          }
          await previewLauncher.launchPreview({
            project: projectForPreview,
            sceneName: sceneName || projectForPreview.getLayoutAt(0).getName(),
            externalLayoutName: externalLayoutName || null,
            eventsBasedObjectType: isForInGameEdition
              ? isForInGameEdition.eventsBasedObjectType
              : null,
            eventsBasedObjectVariantName: isForInGameEdition
              ? isForInGameEdition.eventsBasedObjectVariantName
              : null,
            networkPreview: !!networkPreview,
            hotReload: !!hotReload,
            shouldReloadProjectData:
              shouldReloadProjectData === undefined
                ? true
                : shouldReloadProjectData,
            shouldReloadLibraries:
              shouldReloadLibraries === undefined
                ? true
                : shouldReloadLibraries,
            shouldGenerateScenesEventsCode:
              shouldGenerateScenesEventsCode === undefined
                ? true
                : shouldGenerateScenesEventsCode,
            shouldReloadResources: !!shouldReloadResources,
            shouldHardReload: !!shouldHardReload,
            displayCollisionMask: displayCollisionMaskInPreview,
            displaySignalAnimations: displaySignalAnimationsInPreview,
            fullLoadingScreen: !!fullLoadingScreen,
            forceAlwaysOnTopInPreview: !!forceAlwaysOnTopInPreview,
            fallbackAuthor,
            authenticatedPlayer,
            getIsMenuBarHiddenInPreview:
              preferences.getIsMenuBarHiddenInPreview,
            getIsAlwaysOnTopInPreview: preferences.getIsAlwaysOnTopInPreview,
            numberOfWindows:
              numberOfWindows === undefined ? 1 : numberOfWindows,
            isForInGameEdition: !!isForInGameEdition,
            editorId: isForInGameEdition ? isForInGameEdition.editorId : '',
            editorCameraState3D: isForInGameEdition
              ? isForInGameEdition.editorCameraState3D
              : null,
            inGameEditorSettings: isForInGameEdition
              ? inGameEditorSettings
              : null,
            inAppTutorialMessageInPreview:
              inAppTutorialMessageInPreview.message,
            inAppTutorialMessagePositionInPreview:
              inAppTutorialMessageInPreview.position,
            captureOptions,
            onCaptureFinished,

            isLaunchCancelled: () =>
              isPreviewLaunchCancelled(previewLaunchId),

            // Preview launchers can do asynchronous setup before they start
            // writing the shared preview output. Keep the launch in the
            // releasable "preparing" phase until this exact boundary. If a
            // cancelled setup is released in the meantime, the stale launcher
            // must stop here instead of racing a newer launch's file writes.
            onWillWritePreviewFiles: () =>
              beginPreviewFileWriting({
                isLaunchCancelled: () =>
                  isPreviewLaunchCancelled(previewLaunchId),
                onBeginWriting: () => {
                  previewLaunchPhaseRef.current = 'launching';
                },
              }),

            previewWindows,
          });
          if (isPreviewLaunchCancelled(previewLaunchId)) {
            return false;
          }

          clearPreviewLoadingForLaunch(previewLaunchId);

          if (!isForInGameEdition)
            sendPreviewStarted({
              quickCustomizationGameId:
                quickCustomizationDialogOpenedFromGameId || null,
              networkPreview: !!networkPreview,
              hotReload: !!hotReload,
              projectDataOnlyExport:
                shouldGenerateScenesEventsCode === undefined
                  ? false
                  : !shouldGenerateScenesEventsCode,
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
              !isForInGameEdition &&
              (forceDiagnosticReport ||
                preferences.values.openDiagnosticReportAutomatically) &&
              wholeProjectDiagnosticReport.hasAnyIssue()
            ) {
              setDiagnosticReportDialogOpen(true);
            }
          }
          return true;
        } catch (error) {
          clearPreviewLoadingForLaunch(previewLaunchId);
          console.error(
            'Error caught while launching preview, this should never happen.',
            error
          );
          return false;
        }
      } finally {
        if (previewProjectLoadedFromFile) {
          previewProjectLoadedFromFile.delete();
        }
        cancelledPreviewLaunchIdsRef.current.delete(previewLaunchId);
        if (activePreviewLaunchIdRef.current === previewLaunchId) {
          activePreviewLaunchIdRef.current = null;
          setPreviewLaunchInProgress(false);
          previewLaunchPhaseRef.current = 'idle';
          activePreviewLaunchKindRef.current = null;
          // Always clear the preview loader here, even if an exception was
          // thrown (or an early return happened) after `setPreviewLoading`.
          // When a newer launch is active, this old launch must not touch it.
          if (previewLoadingRef.current) {
            setPreviewLoading(null);
          }
        }
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
      displayCollisionMaskInPreview,
      displaySignalAnimationsInPreview,
      autosaveProjectIfNeeded,
      loadProjectFromSavedFileForPreview,
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
      inGameEditorSettings,
      previewLoadingRef,
      setPreviewLoading,
      setPreviewLaunchInProgress,
      checkDiagnosticErrorsAndIfShouldBlock,
      isPreviewLaunchCancelled,
      clearPreviewLoadingForLaunch,
    ]
  );

  const launchPreviewAndReport = addCreateBadgePreHookIfNotClaimed(
    authenticatedUser,
    TRIVIAL_FIRST_PREVIEW,
    _launchPreview
  );
  const launchPreview = React.useCallback(
    async (options: LaunchPreviewOptions): Promise<void> => {
      await launchPreviewAndReport(options);
    },
    [launchPreviewAndReport]
  );

  const launchNewPreview = React.useCallback(
    // $FlowFixMe[missing-local-annot]
    async options => {
      const launchCaptureOptions =
        currentProject && !hasNonEditionPreviewsRunning
          ? // TODO Rename it getPreviewLaunchCaptureOptions
            getHotReloadPreviewLaunchCaptureOptions(
              currentProject.getProjectUuid()
            )
          : undefined;

      const numberOfWindows = options ? options.numberOfWindows : 1;
      await launchPreview({
        networkPreview: false,
        numberOfWindows,
        forceAlwaysOnTopInPreview: !!(
          options && options.forceAlwaysOnTopInPreview
        ),
        skipDiagnosticErrorBlocking: !!(
          options && options.skipDiagnosticErrorBlocking
        ),
        launchCaptureOptions,
      });
    },
    [
      currentProject,
      launchPreview,
      getHotReloadPreviewLaunchCaptureOptions,
      hasNonEditionPreviewsRunning,
    ]
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
    async ({
      editorId,
      sceneName,
      externalLayoutName,
      eventsBasedObjectType,
      eventsBasedObjectVariantName,
      shouldReloadProjectData,
      shouldReloadLibraries,
      shouldReloadResources,
      shouldHardReload,
      editorCameraState3D,
    }: {|
      ...PreviewInGameEditorTarget,
      ...HotReloadSteps,
      editorCameraState3D: EditorCameraState | null,
    |}) => {
      if (
        mcpPreviewLaunchInProgressRef.current ||
        mcpPreviewLaunchSequenceInProgressRef.current
      ) {
        console.info(
          'Skipping in-game edition preview launch while an explicit MCP preview launch is being prepared.'
        );
        return;
      }

      inGameEditionPreviewLaunchInProgressRef.current = true;
      try {
        await _launchPreview({
          networkPreview: false,
          hotReload: true,
          shouldReloadProjectData,
          shouldReloadLibraries,
          shouldGenerateScenesEventsCode: false,
          shouldReloadResources,
          shouldHardReload,
          forceDiagnosticReport: false,
          isForInGameEdition: {
            editorId,
            forcedSceneName: sceneName,
            forcedExternalLayoutName: externalLayoutName,
            eventsBasedObjectType,
            eventsBasedObjectVariantName,
            editorCameraState3D,
          },
          numberOfWindows: 0,
        });
      } finally {
        inGameEditionPreviewLaunchInProgressRef.current = false;
      }
    },
    [_launchPreview]
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
        shouldGenerateScenesEventsCode: false,
      }),
    [launchPreview]
  );

  const hotReloadPreviewButtonProps: HotReloadPreviewButtonProps = React.useMemo(
    () => ({
      hasPreviewsRunning: hasNonEditionPreviewsRunning,
      launchProjectWithLoadingScreenPreview: () =>
        launchPreview({ fullLoadingScreen: true }),
      launchProjectDataOnlyPreview: () =>
        launchPreview({
          hotReload: true,
          shouldGenerateScenesEventsCode: false,
        }),
      launchProjectCodeAndDataPreview: () =>
        launchPreview({
          hotReload: true,
          shouldGenerateScenesEventsCode: true,
        }),
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
        scenePanelToOpen,
      }: {|
        openEventsEditor: boolean,
        openSceneEditor: boolean,
        focusWhenOpened:
          | 'scene-or-events-otherwise'
          | 'scene'
          | 'events'
          | 'none',
        scenePanelToOpen?: ?SceneEditorPanelId,
      |}
    ): EditorTabsState => {
      const sceneEditorOptions = getEditorOpeningOptions({
        kind: 'layout',
        name,
        scenePanelToOpen,
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
        ? // $FlowFixMe[incompatible-type]
          openEditorTab(editorTabs, sceneEditorOptions)
        : editorTabs;
      return openEventsEditor
        ? // $FlowFixMe[incompatible-type]
          openEditorTab(tabsWithSceneEditor, eventsEditorOptions)
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
        scenePanelToOpen?: ?SceneEditorPanelId,
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
            scenePanelToOpen: options.scenePanelToOpen,
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
          // $FlowFixMe[incompatible-type]
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
          // $FlowFixMe[incompatible-type]
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
      const editorTabs = state.editorTabs;
      if (
        currentProject &&
        currentProject.hasEventsFunctionsExtensionNamed(name)
      ) {
        const eventsFunctionsExtension = currentProject.getEventsFunctionsExtension(
          name
        );
        if (initiallyFocusedBehaviorName && !initiallyFocusedObjectName) {
          const eventsBasedBehaviors = eventsFunctionsExtension.getEventsBasedBehaviors();
          if (eventsBasedBehaviors.has(initiallyFocusedBehaviorName)) {
            const eventsBasedBehavior = eventsBasedBehaviors.get(
              initiallyFocusedBehaviorName
            );
            const foundBehaviorTab = getEventsBasedBehaviorDetailEditor(
              editorTabs,
              eventsFunctionsExtension,
              eventsBasedBehavior
            );
            if (foundBehaviorTab) {
              if (initiallyFocusedFunctionName) {
                foundBehaviorTab.editor.selectEventsFunctionByName(
                  initiallyFocusedFunctionName,
                  initiallyFocusedBehaviorName,
                  null
                );
              } else {
                foundBehaviorTab.editor.selectEventsBasedBehaviorByName(
                  initiallyFocusedBehaviorName
                );
              }
              setState(state => ({
                ...state,
                editorTabs: changeCurrentTab(
                  editorTabs,
                  foundBehaviorTab.paneIdentifier,
                  foundBehaviorTab.tabIndex
                ),
              }));
              return;
            }

            setState(state => ({
              ...state,
              // $FlowFixMe[incompatible-type]
              editorTabs: openEditorTab(state.editorTabs, {
                ...getEditorOpeningOptions({
                  kind: 'behavior detail',
                  name: name + '::' + initiallyFocusedBehaviorName,
                  project: currentProject,
                }),
                extraEditorProps: {
                  initiallyFocusedFunctionName,
                  initiallyFocusedBehaviorName,
                  initiallyFocusedObjectName: null,
                },
              }),
            }));
            return;
          }
        }

        if (
          initiallyFocusedFunctionName &&
          !initiallyFocusedBehaviorName &&
          !initiallyFocusedObjectName
        ) {
          const eventsFunctions = eventsFunctionsExtension.getEventsFunctions();
          if (
            eventsFunctions.hasEventsFunctionNamed(initiallyFocusedFunctionName)
          ) {
            const eventsFunction = eventsFunctions.getEventsFunction(
              initiallyFocusedFunctionName
            );
            const foundFunctionTab = getEventsFunctionDetailEditor(
              editorTabs,
              eventsFunctionsExtension,
              eventsFunction
            );
            if (foundFunctionTab) {
              foundFunctionTab.editor.selectEventsFunctionByName(
                initiallyFocusedFunctionName,
                null,
                null
              );
              setState(state => ({
                ...state,
                editorTabs: changeCurrentTab(
                  editorTabs,
                  foundFunctionTab.paneIdentifier,
                  foundFunctionTab.tabIndex
                ),
              }));
              return;
            }

            setState(state => ({
              ...state,
              // $FlowFixMe[incompatible-type]
              editorTabs: openEditorTab(state.editorTabs, {
                ...getEditorOpeningOptions({
                  kind: 'function detail',
                  name: name + '::' + initiallyFocusedFunctionName,
                  project: currentProject,
                }),
                extraEditorProps: {
                  initiallyFocusedFunctionName,
                  initiallyFocusedBehaviorName: null,
                  initiallyFocusedObjectName: null,
                },
              }),
            }));
            return;
          }
        }

        const foundTab = getEventsFunctionsExtensionEditor(
          editorTabs,
          eventsFunctionsExtension
        );
        if (foundTab) {
          if (initiallyFocusedFunctionName) {
            foundTab.editor.selectEventsFunctionByName(
              initiallyFocusedFunctionName,
              initiallyFocusedBehaviorName,
              initiallyFocusedObjectName
            );
          } else if (initiallyFocusedBehaviorName) {
            foundTab.editor.selectEventsBasedBehaviorByName(
              initiallyFocusedBehaviorName
            );
          } else if (initiallyFocusedObjectName) {
            foundTab.editor.selectEventsBasedObjectByName(
              initiallyFocusedObjectName
            );
          }
          setState(state => ({
            ...state,
            editorTabs: changeCurrentTab(
              editorTabs,
              foundTab.paneIdentifier,
              foundTab.tabIndex
            ),
          }));
          return;
        }
      }

      setState(state => ({
        ...state,
        // $FlowFixMe[incompatible-type]
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
    [currentProject, setState, state.editorTabs, getEditorOpeningOptions]
  );

  const openResources = React.useCallback(
    () => {
      setState(state => ({
        ...state,
        editorTabs: popOutTab(
          openEditorTab(
            state.editorTabs,
            // $FlowFixMe[incompatible-type]
            getEditorOpeningOptions({
              kind: 'resources',
              name: '',
              dontFocusTab: true,
            })
          ),
          'resources'
        ),
      }));
    },
    [getEditorOpeningOptions, setState]
  );

  const openResourceToolFromSwitcher = React.useCallback(
    (tool: ResourceToolLauncherKind) => {
      const { i18n } = props;

      const openTool = async () => {
        if (!ipcRenderer) {
          showErrorBox({
            message: i18n._(
              t`This resource tool is only available in the desktop app.`
            ),
            rawError: new Error('Electron IPC renderer is not available.'),
            errorId: 'resource-tool-desktop-only',
            doNotReport: true,
          });
          return;
        }

        try {
          if (tool === 'image-extender') {
            await ipcRenderer.invoke('image-extender-load');
            return;
          }

          if (tool === 'ai-game-workbench') {
            await ipcRenderer.invoke('ai-game-workbench-load');
            return;
          }

          if (tool === 'gorest-spritesheet') {
            await ipcRenderer.invoke('gorest-spritesheet-load');
            return;
          }

          const project = currentProjectRef.current;
          if (!project) {
            showErrorBox({
              message: i18n._(t`Open a project before using this tool.`),
              rawError: new Error('No project is open.'),
              errorId: 'resource-tool-no-project',
              doNotReport: true,
            });
            return;
          }

          const projectRootPath = getProjectRootPath(project);
          if (!projectRootPath) {
            showErrorBox({
              message: i18n._(
                t`Save the project before opening AdvancedTween Editor.`
              ),
              rawError: new Error('The project has no local root path.'),
              errorId: 'advanced-tween-editor-project-not-saved',
              doNotReport: true,
            });
            return;
          }

          await ipcRenderer.invoke('advanced-tween-editor-load', {
            projectRootPath,
            gameResolutionWidth: project.getGameResolutionWidth(),
            gameResolutionHeight: project.getGameResolutionHeight(),
          });
        } catch (error) {
          showErrorBox({
            message: i18n._(t`Unable to open this resource tool.`),
            rawError: error,
            errorId: `resource-tool-${tool}-open-error`,
          });
        }
      };

      openTool();
    },
    [currentProjectRef, props]
  );

  const openStickyNotesManager = React.useCallback(
    () => {
      setStickyNotesManagerShown(true);
    },
    [setStickyNotesManagerShown]
  );

  const createStickyNoteFromTitlebar = React.useCallback(() => {
    const stickyNotes = stickyNotesRef.current;
    if (!stickyNotes) return;

    stickyNotes.createNote({ showManager: false });
  }, []);

  const openConstants = React.useCallback(
    () => {
      setState(state => ({
        ...state,
        editorTabs: popOutTab(
          openEditorTab(
            state.editorTabs,
            // $FlowFixMe[incompatible-type]
            getEditorOpeningOptions({
              kind: 'constants',
              name: '',
              dontFocusTab: true,
            })
          ),
          'constants'
        ),
      }));
    },
    [getEditorOpeningOptions, setState]
  );

  const openGlobalSearch = React.useCallback(
    () => {
      setState(state => ({
        ...state,
        editorTabs: openEditorTab(
          state.editorTabs,
          // $FlowFixMe[incompatible-type]
          getEditorOpeningOptions({ kind: 'global-search', name: '' })
        ),
      }));
      // Focus the search bar when re-opening an already opened tab.
      const existingEditor = getEditorTabOpenedWithKey(
        state.editorTabs,
        'global-search'
      );
      if (existingEditor) {
        const { editorRef } = existingEditor.editorTab;
        // $FlowFixMe[prop-missing] - focusInitialField is optionally implemented by editors.
        if (editorRef && editorRef.focusInitialField) {
          // $FlowFixMe[not-a-function]
          editorRef.focusInitialField();
        }
      }
    },
    [getEditorOpeningOptions, setState, state.editorTabs]
  );

  const {
    navigateToEventFromGlobalSearch,
    clearGlobalSearchHighlightsInEditorTabs,
  } = useNavigateFromGlobalSearch({
    editorTabs: state.editorTabs,
    setState,
    setPendingEventNavigation,
    openLayout,
    openExternalEvents,
    openEventsFunctionsExtension,
  });

  const onEditorTabClosing = React.useCallback(
    (editorTab: EditorTab) => {
      if (editorTab.kind === 'global-search') {
        clearGlobalSearchHighlightsInEditorTabs(state.editorTabs);
      }
    },
    [clearGlobalSearchHighlightsInEditorTabs, state.editorTabs]
  );

  const openHomePage = React.useCallback(
    () => {
      setState(state => ({
        ...state,
        editorTabs: openEditorTab(
          state.editorTabs,
          // $FlowFixMe[incompatible-type]
          getEditorOpeningOptions({ kind: 'start page', name: '' })
        ),
      }));
    },
    [setState, getEditorOpeningOptions]
  );

  const closeDialogsToOpenHomePage = React.useCallback(() => {
    setShareDialogOpen(false);
  }, []);

  const openStandaloneDialog = React.useCallback(
    () => {
      setStandaloneDialogOpen(true);
    },
    [setStandaloneDialogOpen]
  );

  const { navigateToRoute } = useHomePageSwitch({
    openHomePage,
    closeDialogs: closeDialogsToOpenHomePage,
  });

  const _openDebugger = React.useCallback(
    async (): Promise<boolean> => {
      if (
        await checkDiagnosticErrorsAndIfShouldBlock(currentProject, 'preview')
      ) {
        return false;
      }

      setState(state => {
        const editorTabsWithDebugger = openEditorTab(
          state.editorTabs,
          // $FlowFixMe[incompatible-type]
          getEditorOpeningOptions({
            kind: 'debugger',
            name: '',
            dontFocusTab: true,
          })
        );

        return {
          ...state,
          editorTabs: popOutTab(editorTabsWithDebugger, 'debugger'),
        };
      });

      return true;
    },
    [
      checkDiagnosticErrorsAndIfShouldBlock,
      currentProject,
      getEditorOpeningOptions,
      setState,
    ]
  );

  const openDebugger = addCreateBadgePreHookIfNotClaimed(
    authenticatedUser,
    TRIVIAL_FIRST_DEBUG,
    _openDebugger
  );

  const launchDebuggerAndPreview = React.useCallback(
    async () => {
      const didOpenDebugger = await openDebugger();
      if (!didOpenDebugger) {
        return;
      }

      launchNewPreview({
        forceAlwaysOnTopInPreview: true,
        skipDiagnosticErrorBlocking: true,
      });
    },
    [openDebugger, launchNewPreview]
  );

  // Launch a preview of a specific scene (used by MCP). Opens the debugger so
  // the preview is attachable, and forces the layout regardless of which editor
  // tab is currently focused. When sceneName is empty/unknown, falls back to
  // the editor's normal scene selection.
  const launchPreviewForScene = React.useCallback(
    async (sceneName: ?string) => {
      const launchState = getPreviewLaunchStateForMcp();
      const isInGameEditionPreviewLaunch =
        inGameEditionPreviewLaunchInProgressRef.current ||
        launchState.previewLoading === 'hot-reload-for-in-game-edition';
      const isCancelledPreviewLaunch =
        launchState.activePreviewLaunchId != null &&
        cancelledPreviewLaunchIdsRef.current.has(
          launchState.activePreviewLaunchId
        );
      if (
        (launchState.launchInProgress || launchState.previewLoading) &&
        !isInGameEditionPreviewLaunch &&
        !isCancelledPreviewLaunch
      ) {
        return {
          accepted: false,
          reason: 'preview-launch-already-in-progress',
          launchState,
        };
      }

      setMcpPreviewLaunchInProgress(true);
      let accepted = false;
      let reason: ?string = null;
      try {
        // Reloading a project can automatically start an embedded 3D preview.
        // Wait for that launch to release the shared preview files before
        // starting the explicit MCP preview. The MCP reservation above keeps
        // editor-tab effects from starting another embedded launch meanwhile.
        if (isInGameEditionPreviewLaunch || isCancelledPreviewLaunch) {
          const waitDeadline = Date.now() + 10000;
          while (
            (inGameEditionPreviewLaunchInProgressRef.current ||
              previewLaunchInProgressRef.current ||
              previewLoadingRef.current) &&
            Date.now() < waitDeadline
          ) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          releaseCancelledPreviewPreparation(
            'it did not unwind before the MCP preview launch timeout'
          );
        }

        if (previewLaunchInProgressRef.current || previewLoadingRef.current) {
          reason = 'preview-launch-already-in-progress';
        }

        const launchCaptureOptions =
          currentProject && !hasNonEditionPreviewsRunning
            ? getHotReloadPreviewLaunchCaptureOptions(
                currentProject.getProjectUuid()
              )
            : undefined;
        if (!reason) {
          const didOpenDebugger = await openDebugger();
          if (!didOpenDebugger) {
            reason = 'debugger-window-could-not-open';
          } else {
            const didLaunch = await launchPreviewAndReport({
              networkPreview: false,
              forcedPreviewLayoutName: sceneName || null,
              numberOfWindows: 1,
              forceAlwaysOnTopInPreview: true,
              skipDiagnosticErrorBlocking: true,
              launchCaptureOptions,
            });
            accepted = !!didLaunch;
            reason = didLaunch ? null : 'preview-launch-was-not-accepted';
          }
        }
      } finally {
        setMcpPreviewLaunchInProgress(false);
      }
      return {
        accepted,
        reason: reason || undefined,
        launchState: getPreviewLaunchStateForMcp(),
      };
    },
    [
      currentProject,
      openDebugger,
      launchPreviewAndReport,
      getHotReloadPreviewLaunchCaptureOptions,
      hasNonEditionPreviewsRunning,
      getPreviewLaunchStateForMcp,
      previewLoadingRef,
      releaseCancelledPreviewPreparation,
      setMcpPreviewLaunchInProgress,
    ]
  );

  const cancelPreviewLaunchForMcp = React.useCallback(
    (reason: string) => {
      cancelPendingPreviewLaunchAfterWindowClosed(reason);
      const releasedPreviewPreparation = releaseCancelledPreviewPreparation(
        reason
      );
      // launchPreviewForScene normally clears this in its finally block. MCP
      // also needs a way to release its reservation when an underlying editor
      // or preview preparation promise never settles.
      setMcpPreviewLaunchInProgress(false);
      return {
        cancelled: true,
        releasedMcpLaunchReservation: true,
        releasedPreviewPreparation,
        launchState: getPreviewLaunchStateForMcp(),
      };
    },
    [
      cancelPendingPreviewLaunchAfterWindowClosed,
      getPreviewLaunchStateForMcp,
      releaseCancelledPreviewPreparation,
      setMcpPreviewLaunchInProgress,
    ]
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

      if (eventBasedObjectName) {
        const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
        const eventsBasedObject = eventsBasedObjects.get(eventBasedObjectName);
        openPrefabDetailEditor(
          eventsFunctionsExtension,
          eventsBasedObject,
          functionName.name
        );
        return;
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
          editorTabs: changeCurrentTab(
            editorTabs,
            foundTab.paneIdentifier,
            foundTab.tabIndex
          ),
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
      const { currentProject } = state;
      if (!currentProject) return;

      const prefabDetailName =
        eventsFunctionsExtension.getName() + '::' + eventsBasedObject.getName();
      const customObjectName =
        prefabDetailName +
        (eventsBasedObject.getVariants().hasVariantNamed(variantName)
          ? '::' + variantName
          : '');
      const customObjectOpeningOptions = getEditorOpeningOptions({
        kind: 'custom object',
        name: customObjectName,
        project: currentProject,
      });
      const prefabDetailOpeningOptions = getEditorOpeningOptions({
        kind: 'prefab detail',
        name: prefabDetailName,
        project: currentProject,
        dontFocusTab: true,
      });

      setState(state => {
        let editorTabs = openEditorTab(
          state.editorTabs,
          // $FlowFixMe[incompatible-type]
          customObjectOpeningOptions
        );
        editorTabs = openEditorTab(
          editorTabs,
          // $FlowFixMe[incompatible-type]
          prefabDetailOpeningOptions
        );
        editorTabs = movePrefabDetailTabAfterCustomObjectTab(
          editorTabs,
          customObjectOpeningOptions.key,
          prefabDetailOpeningOptions.key
        );

        return {
          ...state,
          editorTabs,
        };
      });
    },
    [getEditorOpeningOptions, setState, state]
  );

  const openPrefabDetailEditor = React.useCallback(
    (
      eventsFunctionsExtension: gdEventsFunctionsExtension,
      eventsBasedObject: gdEventsBasedObject,
      initiallyFocusedFunctionName?: ?string
    ) => {
      const { currentProject, editorTabs } = state;
      if (!currentProject) return;

      const foundTab = getPrefabDetailEditor(
        editorTabs,
        eventsFunctionsExtension,
        eventsBasedObject
      );
      if (foundTab) {
        if (initiallyFocusedFunctionName) {
          foundTab.editor.selectEventsFunctionByName(
            initiallyFocusedFunctionName
          );
        } else {
          foundTab.editor.selectEventsBasedObjectByName(
            eventsBasedObject.getName()
          );
        }
        setState(state => ({
          ...state,
          editorTabs: changeCurrentTab(
            editorTabs,
            foundTab.paneIdentifier,
            foundTab.tabIndex
          ),
        }));
      } else {
        setState(state => ({
          ...state,
          // $FlowFixMe[incompatible-type]
          editorTabs: openEditorTab(state.editorTabs, {
            ...getEditorOpeningOptions({
              kind: 'prefab detail',
              name:
                eventsFunctionsExtension.getName() +
                '::' +
                eventsBasedObject.getName(),
              project: currentProject,
            }),
            extraEditorProps: {
              initiallyFocusedFunctionName,
            },
          }),
        }));
      }
    },
    [getEditorOpeningOptions, setState, state]
  );

  const openPrefabSettings = React.useCallback(
    (
      eventsFunctionsExtension: gdEventsFunctionsExtension,
      eventsBasedObject: gdEventsBasedObject
    ) => {
      setStandalonePrefabSettingsDialog({
        eventsFunctionsExtension,
        eventsBasedObject,
      });
    },
    [setStandalonePrefabSettingsDialog]
  );

  const openBehaviorSettings = React.useCallback(
    (
      eventsFunctionsExtension: gdEventsFunctionsExtension,
      eventsBasedBehavior: gdEventsBasedBehavior
    ) => {
      setStandaloneBehaviorSettingsDialog({
        eventsFunctionsExtension,
        eventsBasedBehavior,
      });
    },
    [setStandaloneBehaviorSettingsDialog]
  );

  const openCustomObjectAndExtensionEditors = React.useCallback(
    (
      eventsFunctionsExtension: gdEventsFunctionsExtension,
      eventsBasedObject: gdEventsBasedObject,
      variantName: string
    ) => {
      const { currentProject } = state;
      if (!currentProject) return;

      // Open both tabs at the same time to avoid the prefab detail tab to
      // trigger code generation when it loses the focus. The UI tab is opened
      // first and kept focused, with the prefab settings tab next to it.
      const prefabDetailName =
        eventsFunctionsExtension.getName() + '::' + eventsBasedObject.getName();
      const customObjectName =
        prefabDetailName +
        (eventsBasedObject.getVariants().hasVariantNamed(variantName)
          ? '::' + variantName
          : '');
      const customObjectOpeningOptions = getEditorOpeningOptions({
        kind: 'custom object',
        name: customObjectName,
        project: currentProject,
      });
      const prefabDetailOpeningOptions = {
        ...getEditorOpeningOptions({
          kind: 'prefab detail',
          name: prefabDetailName,
          project: currentProject,
          dontFocusTab: true,
        }),
        extraEditorProps: {
          initiallyFocusedFunctionName: null,
        },
      };

      setState(state => {
        let editorTabs = openEditorTab(
          state.editorTabs,
          // $FlowFixMe[incompatible-type]
          customObjectOpeningOptions
        );
        editorTabs = openEditorTab(
          editorTabs,
          // $FlowFixMe[incompatible-type]
          prefabDetailOpeningOptions
        );
        editorTabs = movePrefabDetailTabAfterCustomObjectTab(
          editorTabs,
          customObjectOpeningOptions.key,
          prefabDetailOpeningOptions.key
        );

        return {
          ...state,
          editorTabs,
        };
      });
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
      const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
      if (!eventsBasedObjects.has(objectName)) {
        return;
      }
      const eventsBasedObject = eventsBasedObjects.get(objectName);

      const foundTab = getPrefabDetailEditor(
        editorTabs,
        eventsFunctionsExtension,
        eventsBasedObject
      );
      if (foundTab) {
        // Open the prefab configuration and focus the tab.
        foundTab.editor.selectEventsBasedObjectByName(objectName);
        setState(state => ({
          ...state,
          editorTabs: changeCurrentTab(
            editorTabs,
            foundTab.paneIdentifier,
            foundTab.tabIndex
          ),
        }));
      } else {
        openPrefabDetailEditor(eventsFunctionsExtension, eventsBasedObject);
      }
    } else {
      // It's not an events functions extension, we should not be here.
      console.warn(
        `Extension with name=${extensionName} can not be opened (no editor for this)`
      );
    }
  };

  const openBehaviorEvents = (extensionName: string, behaviorName: string) => {
    const { currentProject } = state;
    if (!currentProject) return;

    if (currentProject.hasEventsFunctionsExtensionNamed(extensionName)) {
      openEventsFunctionsExtension(extensionName, null, behaviorName, null);
    } else {
      // It's not an events functions extension, we should not be here.
      console.warn(
        `Extension with name=${extensionName} can not be opened (no editor for this)`
      );
    }
  };

  const onExtractAsExternalLayout = React.useCallback(
    (name: string) => {
      notifyChangesToInGameEditor({
        shouldReloadProjectData: true,
        shouldReloadLibraries: false,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['extracted-instances-to-external-layout'],
      });
      openExternalLayout(name);
    },
    [notifyChangesToInGameEditor, openExternalLayout]
  );

  const _onReloadEventsFunctionsExtensionsAsync = React.useCallback(
    async () => {
      if (isProjectClosedSoAvoidReloadingExtensionsRef.current) {
        return;
      }
      await eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions(
        currentProject
      );
      notifyChangesToInGameEditor({
        shouldReloadProjectData: false,
        shouldReloadLibraries: true,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['reloaded-extensions'],
      });
    },
    [
      currentProject,
      eventsFunctionsExtensionsState,
      notifyChangesToInGameEditor,
    ]
  );

  const onReloadEventsFunctionsExtensions = React.useCallback(
    () => {
      _onReloadEventsFunctionsExtensionsAsync();
    },
    [_onReloadEventsFunctionsExtensionsAsync]
  );

  // TODO Check why we don't always use `onReloadEventsFunctionsExtensions`.
  /**
   * It's the same as `onReloadEventsFunctionsExtensions` but extensions are
   * not unloaded first.
   */
  const onLoadEventsFunctionsExtensions = React.useCallback(
    async ({ shouldHotReloadEditor }: {| shouldHotReloadEditor: boolean |}) => {
      if (isProjectClosedSoAvoidReloadingExtensionsRef.current) {
        return;
      }
      await eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
        currentProject
      );
      if (shouldHotReloadEditor) {
        notifyChangesToInGameEditor({
          shouldReloadProjectData: false,
          shouldReloadLibraries: true,
          shouldReloadResources: false,
          shouldHardReload: false,
          reasons: ['loaded-extensions'],
        });
      }
    },
    [
      currentProject,
      eventsFunctionsExtensionsState,
      notifyChangesToInGameEditor,
    ]
  );

  const _onOpenEventBasedObjectEditorAsync = React.useCallback(
    async (extensionName: string, eventsBasedObjectName: string) => {
      if (
        !currentProject ||
        !currentProject.hasEventsFunctionsExtensionNamed(extensionName)
      ) {
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

      // Trigger reloading of extensions as an extension was modified (or even added)
      // to create the custom object.
      await eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
        currentProject
      );
      setEditorHotReloadNeeded({
        shouldReloadProjectData: false,
        shouldReloadLibraries: true,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['opened-custom-object-editor'],
      });

      openCustomObjectAndExtensionEditors(
        eventsFunctionsExtension,
        eventsBasedObject,
        ''
      );
    },
    [
      currentProject,
      openCustomObjectAndExtensionEditors,
      eventsFunctionsExtensionsState,
    ]
  );

  const onOpenEventBasedObjectEditor = React.useCallback(
    (extensionName: string, eventsBasedObjectName: string) => {
      _onOpenEventBasedObjectEditorAsync(extensionName, eventsBasedObjectName);
    },
    [_onOpenEventBasedObjectEditorAsync]
  );

  const onEventBasedObjectTypeChanged = React.useCallback(
    () => {
      notifyChangesToInGameEditor({
        shouldReloadProjectData: true,
        shouldReloadLibraries: true,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['changed-custom-object-type'],
      });
    },
    [notifyChangesToInGameEditor]
  );

  const _onExtractAsEventBasedObjectAsync = React.useCallback(
    async (extensionName: string, eventsBasedObjectName: string) => {
      // This method already trigger an hot-reload of the libraries after
      // generation extension code.
      await _onOpenEventBasedObjectEditorAsync(
        extensionName,
        eventsBasedObjectName
      );
    },
    [_onOpenEventBasedObjectEditorAsync]
  );

  const onExtractAsEventBasedObject = React.useCallback(
    (extensionName: string, eventsBasedObjectName: string) => {
      _onExtractAsEventBasedObjectAsync(extensionName, eventsBasedObjectName);
    },
    [_onExtractAsEventBasedObjectAsync]
  );

  const _onOpenEventBasedObjectVariantEditorAsync = React.useCallback(
    async (
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

      // Trigger reloading of extensions as an extension was modified (or even added)
      // to create the custom object.
      await eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
        currentProject
      );
      setEditorHotReloadNeeded({
        shouldReloadProjectData: false,
        shouldReloadLibraries: true,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['opened-custom-object-variant-editor'],
      });
      openCustomObjectEditor(
        eventsFunctionsExtension,
        eventsBasedObject,
        variantName
      );
    },
    [currentProject, openCustomObjectEditor, eventsFunctionsExtensionsState]
  );

  const onOpenEventBasedObjectVariantEditor = React.useCallback(
    (
      extensionName: string,
      eventsBasedObjectName: string,
      variantName: string
    ) => {
      _onOpenEventBasedObjectVariantEditorAsync(
        extensionName,
        eventsBasedObjectName,
        variantName
      );
    },
    [_onOpenEventBasedObjectVariantEditorAsync]
  );

  const onEventsBasedObjectChildrenEdited = React.useCallback(
    (eventsBasedObject: gdEventsBasedObject) => {
      const project = currentProject;
      if (!project) {
        return;
      }
      gd.EventsBasedObjectVariantHelper.complyVariantsToEventsBasedObject(
        project,
        eventsBasedObject
      );

      for (const editor of getAllEditorTabs(state.editorTabs)) {
        const { editorRef } = editor;
        if (editorRef) {
          editorRef.onEventsBasedObjectChildrenEdited();
        }
      }
    },
    [currentProject, state.editorTabs]
  );

  const forceUpdateOpenedEditors = React.useCallback(
    () => {
      for (const editor of getAllEditorTabs(state.editorTabs)) {
        const editorRefAny: any = editor.editorRef;
        if (
          editorRefAny &&
          typeof editorRefAny.forceUpdateEditor === 'function'
        ) {
          editorRefAny.forceUpdateEditor();
        }
      }
      forceUpdate();
    },
    [forceUpdate, state.editorTabs]
  );

  const onStandaloneSettingsEdited = React.useCallback(
    async () => {
      try {
        await onLoadEventsFunctionsExtensions({
          shouldHotReloadEditor: true,
        });
      } catch (error) {
        console.warn(
          'Error while loading events functions extensions after editing prefab or behavior settings.',
          error
        );
      }
      forceUpdateOpenedEditors();
    },
    [forceUpdateOpenedEditors, onLoadEventsFunctionsExtensions]
  );

  const onSceneObjectEdited = React.useCallback(
    (scene: gdLayout, objectWithContext: ObjectWithContext) => {
      for (const editor of getAllEditorTabs(state.editorTabs)) {
        const { editorRef } = editor;
        if (editorRef) {
          editorRef.onSceneObjectEdited(scene, objectWithContext);
        }
      }
    },
    [state.editorTabs]
  );

  const onGlobalObjectEdited = React.useCallback(
    (object: gdObject) => {
      const project = currentProject;
      if (!project || project.getLayoutsCount() === 0) return;

      onSceneObjectEdited(project.getLayoutAt(0), {
        object,
        global: true,
      });

      for (const editor of getAllEditorTabs(state.editorTabs)) {
        const editorRefAny: any = editor.editorRef;
        if (
          editorRefAny &&
          typeof editorRefAny.forceUpdateEditor === 'function'
        ) {
          editorRefAny.forceUpdateEditor();
        }
      }
    },
    [onSceneObjectEdited, currentProject, state.editorTabs]
  );

  const onSceneObjectsDeleted = React.useCallback(
    (scene: gdLayout) => {
      for (const editor of getAllEditorTabs(state.editorTabs)) {
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
      for (const editor of getAllEditorTabs(state.editorTabs)) {
        const { editorRef } = editor;
        if (editorRef) {
          editorRef.onSceneEventsModifiedOutsideEditor(changes);
        }
      }
    },
    [state.editorTabs]
  );

  const onInstancesModifiedOutsideEditor = React.useCallback(
    (changes: InstancesOutsideEditorChanges) => {
      for (const editor of getAllEditorTabs(state.editorTabs)) {
        const { editorRef } = editor;
        if (editorRef) {
          editorRef.onInstancesModifiedOutsideEditor(changes);
        }
      }
    },
    [state.editorTabs]
  );

  const onObjectsModifiedOutsideEditor = React.useCallback(
    (changes: ObjectsOutsideEditorChanges) => {
      for (const editor of getAllEditorTabs(state.editorTabs)) {
        const { editorRef } = editor;
        if (editorRef) {
          editorRef.onObjectsModifiedOutsideEditor(changes);
        }
      }
      onObjectListsModified({
        isNewObjectTypeUsed: changes.isNewObjectTypeUsed,
      });
    },
    [state.editorTabs, onObjectListsModified]
  );

  const onObjectGroupsModifiedOutsideEditor = React.useCallback(
    (changes: ObjectGroupsOutsideEditorChanges) => {
      for (const editor of getAllEditorTabs(state.editorTabs)) {
        const { editorRef } = editor;
        if (editorRef) {
          editorRef.onObjectGroupsModifiedOutsideEditor(changes);
        }
      }
    },
    [state.editorTabs]
  );

  // The project model is already renamed (e.g. by an AI editor function). The
  // matching layout tab is closed to avoid it holding a stale project-item name
  // (mirrors our own `renameLayout` flow, which closes tabs on rename).
  const onProjectItemRenamedOutsideEditor = (
    changes: ProjectItemRenamedOutsideEditorChanges
  ) => {
    const { kind, newName } = changes;
    const { currentProject } = state;
    if (!currentProject) return;
    if (kind === 'scene' && currentProject.hasLayoutNamed(newName)) {
      setState(state => ({
        ...state,
        editorTabs: closeLayoutTabs(
          state.editorTabs,
          currentProject.getLayout(newName)
        ),
      }));
    }
  };

  // Called before the scene is actually deleted from the project, so the
  // gdLayout is still valid for the tab-matching in `closeLayoutTabs`
  // (mirrors the manual delete flow, which closes tabs before removing).
  // The caller MUST await this: `setState` (`useStateWithCallback`) resolves
  // once the tab-closing update is applied, and closing tabs requires
  // reading the layout via `getLayout()` — which only works while the scene
  // still exists in the project.
  const onWillDeleteScene = async (
    changes: WillDeleteSceneChanges
  ): Promise<void> => {
    await setState(state => ({
      ...state,
      editorTabs: closeLayoutTabs(state.editorTabs, changes.scene),
    }));
  };

  // Called before the object is actually deleted from the project, so any
  // open editor can still safely read it (e.g. to close a dialog/panel
  // referring to it) without risking a dangling reference.
  const onWillDeleteObject = React.useCallback(
    (changes: WillDeleteObjectChanges) => {
      for (const editor of getAllEditorTabs(state.editorTabs)) {
        const { editorRef } = editor;
        if (editorRef) {
          editorRef.onWillDeleteObject(changes);
        }
      }
    },
    [state.editorTabs]
  );

  const selectAllInActiveEditors = React.useCallback(
    () => {
      for (const paneIdentifier in state.editorTabs.panes) {
        const currentTab = getCurrentTabForPane(
          state.editorTabs,
          paneIdentifier
        );
        const editorRef = currentTab ? currentTab.editorRef : null;
        if (editorRef) {
          editorRef.selectAllInsideEditor();
        }
      }
    },
    [state.editorTabs]
  );

  // An MCP tool reloaded an extension wholesale (its C++ child objects were
  // freed and rebuilt). Close that extension's open editor tabs so they release
  // stale wrappers (a render against a freed InitialInstancesContainer would
  // crash), then reload extensions so dependent editors see fresh data.
  const onExtensionModifiedOutsideEditor = React.useCallback(
    (extensionName: string) => {
      if (!currentProject) return;
      setState(state => ({
        ...state,
        editorTabs: closeEventsFunctionsExtensionTabs(
          state.editorTabs,
          extensionName
        ),
      }));
      eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions(
        currentProject
      );
    },
    [currentProject, eventsFunctionsExtensionsState, setState]
  );

  const _onProjectItemModified = () => {
    triggerUnsavedChanges();
    forceUpdate();
  };

  const onCreateEventsFunction = async (
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
    await eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
      currentProject
    );
    setEditorHotReloadNeeded({
      shouldReloadProjectData: false,
      shouldReloadLibraries: true,
      shouldReloadResources: false,
      shouldHardReload: false,
      reasons: ['created-events-function'],
    });
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

      ensureProjectHasDefaultScene(currentProject);
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
    [openLayout]
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
        ignoreAutoSave?: boolean,
        openingMessage?: ?MessageDescriptor,
        suppressOpenErrorAlert?: boolean,
        rethrowOpenError?: boolean,
        reportProgress?: (phase: string) => void,
      |}
    ): Promise<?State> => {
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
      return openFromFileMetadata(fileMetadata, {
        openingMessage: (options && options.openingMessage) || null,
        ignoreAutoSave: (options && options.ignoreAutoSave) || false,
        suppressOpenErrorAlert:
          (options && options.suppressOpenErrorAlert) || false,
        reportProgress: options && options.reportProgress,
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
            // If AIEditor is opened in the center, ensure we reposition it on the side.
            const openedAskAIEditor = getOpenedAskAiEditor(state.editorTabs);
            if (
              openedAskAIEditor &&
              openedAskAIEditor.paneIdentifier === 'center'
            ) {
              openAskAi({
                paneIdentifier: 'right',
              });
            }
          }
          return state;
        })
        .catch(error => {
          if (options && options.rethrowOpenError) throw error;
          /* Ignore error, it was already surfaced to the user unless explicitly suppressed. */
          return null;
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
      openAskAi,
    ]
  );

  const onOpenCloudProjectOnSpecificVersion = React.useCallback(
    ({
      fileMetadata,
      versionId,
      ignoreUnsavedChanges,
      ignoreAutoSave,
      openingMessage,
    }: {|
      fileMetadata: FileMetadata,
      versionId: string,
      ignoreUnsavedChanges: boolean,
      ignoreAutoSave: boolean,
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
        { ignoreUnsavedChanges, ignoreAutoSave, openingMessage }
      );
    },
    [openFromFileMetadataWithStorageProvider]
  );

  const reloadProjectAfterGitAction = React.useCallback(
    async (): Promise<void> => {
      if (!currentProject || !currentFileMetadata) return;

      const storageProviderName = getStorageProvider().internalName;
      await openFromFileMetadataWithStorageProvider(
        {
          fileMetadata: currentFileMetadata,
          storageProviderName,
        },
        {
          ignoreUnsavedChanges: true,
          ignoreAutoSave: true,
          openingMessage: t`Reloading project...`,
        }
      );
    },
    [
      currentProject,
      currentFileMetadata,
      getStorageProvider,
      openFromFileMetadataWithStorageProvider,
    ]
  );

  const {
    renderVersionHistoryPanel,
    openVersionHistoryPanel,
    closeVersionHistoryPanel,
    checkedOutVersionStatus,
    onQuitVersionHistory,
    onCheckoutVersion,
    getOrLoadProjectVersion,
  } = useVersionHistory({
    getStorageProvider,
    isSavingProject,
    project: currentProject,
    fileMetadata: currentFileMetadata,
    onOpenCloudProjectOnSpecificVersion,
    onReloadProject: reloadProjectAfterGitAction,
  });

  const closeTemporarySideMenusOnEditorClick = React.useCallback(
    () => {
      closeProjectManagerOverlay();
      closeVersionHistoryPanel();
    },
    [closeProjectManagerOverlay, closeVersionHistoryPanel]
  );

  const openSaveToStorageProviderDialog = React.useCallback(
    (open: boolean = true) => {
      if (open) {
        // Ensure the project manager is closed as Google Drive storage provider
        // display a picker that does not play nice with material-ui's overlays.
        openProjectManager(false);
      }
      setState(state => ({
        ...state,
        saveToStorageProviderDialogOpen: open,
      }));
    },
    [setState]
  );

  const saveProjectAsWithStorageProvider = React.useCallback(
    async (
      options: ?{|
        requestedStorageProvider?: StorageProvider,
        forcedSavedAsLocation?: SaveAsLocation,
        createdProject?: gdProject,
      |}
    ): Promise<?FileMetadata> => {
      // In some cases (ex: when a project is created by the AI), the project in
      // the mainframe state is not updated yet, so we use the provided one.
      const upToDateProject =
        options && options.createdProject
          ? options.createdProject
          : currentProject;
      if (!upToDateProject) return;
      // Prevent saving if there are errors in the extension modules, as
      // this can lead to corrupted projects.
      if (hasExtensionLoadErrors) return;

      saveUiSettings(state.editorTabs);

      // Protect against concurrent saves, which can trigger issues with the
      // file system.
      if (isSaveProjectInProgress()) {
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

      setSavingProjectInProgress(true);

      // At the end of the promise below, currentProject and storageProvider
      // may have changed (if the user opened another project). So we read and
      // store their values in variables now.
      const storageProviderInternalName = newStorageProvider.internalName;

      try {
        // Project extensions are loaded in two passes and their registered
        // metadata is replaced between these passes. Do not serialize the
        // project (or generate its source catalogs) while this replacement is
        // still in progress, as catalog generation could otherwise access
        // invalid behavior metadata.
        await eventsFunctionsExtensionsState.ensureLoadFinished(
          upToDateProject
        );

        let newSaveAsLocation: ?SaveAsLocation =
          options && options.forcedSavedAsLocation;
        let newSaveAsOptions: ?SaveAsOptions = null;
        if (onChooseSaveProjectAsLocation && !newSaveAsLocation) {
          const {
            saveAsLocation,
            saveAsOptions,
          } = await onChooseSaveProjectAsLocation({
            project: upToDateProject,
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
          originalProjectUuid = upToDateProject.getProjectUuid();
          upToDateProject.resetProjectUuid();
        }
        let originalProjectName = null;
        const newProjectName =
          newSaveAsLocation && newSaveAsLocation.name
            ? newSaveAsLocation.name
            : null;
        if (newProjectName) {
          originalProjectName = upToDateProject.getName();
          upToDateProject.setName(newProjectName);
        }

        const { wasSaved, fileMetadata } = await onSaveProjectAs(
          upToDateProject,
          newSaveAsLocation,
          {
            onStartSaving: () =>
              _replaceSnackMessage(i18n._(t`Saving...`), null),
            onMoveResources: async ({ newFileMetadata }) => {
              if (currentFileMetadata)
                await ensureResourcesAreMoved({
                  project: upToDateProject,
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
          if (originalProjectName) upToDateProject.setName(originalProjectName);
          if (originalProjectUuid)
            upToDateProject.setProjectUuid(originalProjectUuid);
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
          markGameAsSavedIfRelevant(fileMetadata.gameId);
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

        if (isCurrentProjectFresh(currentProjectRef, upToDateProject)) {
          // We do not want to change the current file metadata if the
          // project has changed since the beginning of the save, which
          // can happen if another project was loaded in the meantime.
          setState(state => ({
            ...state,
            currentFileMetadata: fileMetadata,
          }));
        }

        return fileMetadata;
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
        setSavingProjectInProgress(false);
      }
    },
    [
      i18n,
      isSaveProjectInProgress,
      setSavingProjectInProgress,
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
      markGameAsSavedIfRelevant,
      hasExtensionLoadErrors,
      eventsFunctionsExtensionsState,
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

  // const saveWithBackgroundSerializer =
  //   preferences.values.useBackgroundSerializerForSaving;
  // Hardcode to false for now as libGD.js is not loaded properly by the worker in production (file:// protocol).
  const saveWithBackgroundSerializer = false;
  const saveProject = React.useCallback(
    async (options?: {|
      skipNewVersionWarning?: boolean,
      rethrowSaveError?: boolean,
    |}): Promise<?FileMetadata> => {
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
      const { onSaveProject } = storageProviderOperations;
      if (!onSaveProject) {
        return saveProjectAs();
      }

      saveUiSettings(state.editorTabs);

      // Protect against concurrent saves, which can trigger issues with the
      // file system.
      if (isSaveProjectInProgress()) {
        console.info('Project is already being saved, not triggering save.');
        return;
      }

      if (checkedOutVersionStatus) {
        const shouldRestoreCheckedOutVersion = await showConfirmation({
          title: t`Restore this version`,
          message: t`You're trying to save changes made to a previous version of your project. If you continue, it will be used as the new latest version.`,
        });
        if (!shouldRestoreCheckedOutVersion) return;
      }

      _showSnackMessage(i18n._(t`Saving...`), null);
      setSavingProjectInProgress(true);

      try {
        const saveStartTime = performance.now();

        // Keep saving synchronized with the two-pass project extension loader.
        // The settings catalog reads registered behavior metadata, which must
        // not be replaced while the project is being serialized.
        await eventsFunctionsExtensionsState.ensureLoadFinished(currentProject);

        // At the end of the promise below, currentProject and storageProvider
        // may have changed (if the user opened another project). So we read and
        // store their values in variables now.
        const storageProviderInternalName = getStorageProvider().internalName;

        const saveOptions: SaveProjectOptions = {
          useBackgroundSerializer: saveWithBackgroundSerializer,
          skipNewVersionWarning:
            !!checkedOutVersionStatus ||
            (options && options.skipNewVersionWarning),
          canonicalEventSerialization:
            preferences.values.canonicalEventSerialization,
        };
        if (cloudProjectRecoveryOpenedVersionId) {
          saveOptions.previousVersion = cloudProjectRecoveryOpenedVersionId;
        } else {
          saveOptions.previousVersion = currentFileMetadata.version;
        }
        if (checkedOutVersionStatus) {
          saveOptions.restoredFromVersionId =
            checkedOutVersionStatus.version.id;
        }
        const { wasSaved, fileMetadata } = await onSaveProject(
          currentProject,
          currentFileMetadata,
          saveOptions,
          {
            showAlert,
            showConfirmation,
          }
        );

        if (wasSaved) {
          console.info(
            `Project saved in ${performance.now() - saveStartTime}ms.`
          );
          // If project was saved, and a game is registered, ensure the game is
          // marked as saved.
          if (fileMetadata.gameId) {
            markGameAsSavedIfRelevant(fileMetadata.gameId);
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

          // Return the new file metadata, to allow further operations,
          // without having to wait for the state to be updated.
          return fileMetadata;
        }
      } catch (error) {
        console.error('Unable to save the project:', error);
        if (options && options.rethrowSaveError) throw error;
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
        setSavingProjectInProgress(false);
      }
    },
    [
      saveWithBackgroundSerializer,
      isSaveProjectInProgress,
      setSavingProjectInProgress,
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
      markGameAsSavedIfRelevant,
      hasExtensionLoadErrors,
      eventsFunctionsExtensionsState,
    ]
  );

  React.useEffect(
    () => {
      saveProjectRef.current = saveProject;
    },
    [saveProject]
  );

  const autoSaveConstants = React.useCallback(
    async (constants: Object): Promise<boolean> => {
      if (!currentProject || !currentFileMetadata) return false;

      const { onAutoSaveConstants } = getStorageProviderOperations();
      if (!onAutoSaveConstants) return false;

      try {
        const projectFile = currentProject.getProjectFile();
        const constantsFileMetadata = projectFile
          ? { ...currentFileMetadata, fileIdentifier: projectFile }
          : currentFileMetadata;
        return await onAutoSaveConstants(constants, constantsFileMetadata);
      } catch (error) {
        console.error('Unable to auto-save Constants:', error);
        _showSnackMessage(
          i18n._(
            t`Constants could not be written to constants.toml. Use the project Save button to try again.`
          ),
          null
        );
        return false;
      }
    },
    [
      currentProject,
      currentFileMetadata,
      getStorageProviderOperations,
      _showSnackMessage,
      i18n,
    ]
  );

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

  const dismissLocalProjectFilesChangedDialogRef = React.useRef<?() => void>(
    null
  );
  const reloadProjectInProgressRef = React.useRef<?Promise<void>>(null);
  const reloadProject = React.useCallback(
    async (options?: {
      skipUnsavedChangesConfirmation?: boolean,
      rethrowOpenError?: boolean,
      reportProgress?: (phase: string) => void,
    }): Promise<void> => {
      if (!currentProject || !currentFileMetadata) return;
      if (reloadProjectInProgressRef.current) {
        if (dismissLocalProjectFilesChangedDialogRef.current) {
          dismissLocalProjectFilesChangedDialogRef.current();
        }
        return reloadProjectInProgressRef.current;
      }

      if (
        hasUnsavedChanges &&
        !(options && options.skipUnsavedChangesConfirmation)
      ) {
        const answer = Window.showConfirmDialog(
          i18n._(
            t`Reload the project? Any changes that have not been saved will be lost.`
          )
        );
        if (!answer) return;
      }

      // Every reload path comes through this function, including the
      // reload_project MCP tool. Close an active disk-changes warning before
      // replacing the in-memory project.
      if (dismissLocalProjectFilesChangedDialogRef.current) {
        dismissLocalProjectFilesChangedDialogRef.current();
      }

      const storageProviderName = getStorageProvider().internalName;
      const reloadPromise = (async () => {
        await openFromFileMetadataWithStorageProvider(
          {
            fileMetadata: currentFileMetadata,
            storageProviderName,
          },
          {
            ignoreUnsavedChanges: true,
            ignoreAutoSave: true,
            rethrowOpenError: !!(options && options.rethrowOpenError),
            reportProgress: options && options.reportProgress,
          }
        );
      })();
      reloadProjectInProgressRef.current = reloadPromise;
      try {
        await reloadPromise;
      } finally {
        if (reloadProjectInProgressRef.current === reloadPromise) {
          reloadProjectInProgressRef.current = null;
        }
      }
    },
    [
      currentProject,
      currentFileMetadata,
      hasUnsavedChanges,
      i18n,
      getStorageProvider,
      openFromFileMetadataWithStorageProvider,
    ]
  );

  const backupCurrentProjectToLocalFolder = React.useCallback(
    async (): Promise<void> => {
      const localFileStorageProvider = props.storageProviders.find(
        storageProvider =>
          storageProvider.internalName === localFileStorageProviderInternalName
      );
      if (!localFileStorageProvider) return;

      await saveProjectAsWithStorageProvider({
        requestedStorageProvider: localFileStorageProvider,
      });
    },
    [props.storageProviders, saveProjectAsWithStorageProvider]
  );

  const onLocalProjectFilesChanged = React.useCallback(
    async (
      dismissSignal: AbortSignal,
      dismissDialog: () => void
    ): Promise<void> => {
      const dismissTrackedDialog = () => {
        dismissDialog();
        if (
          dismissLocalProjectFilesChangedDialogRef.current ===
          dismissTrackedDialog
        ) {
          dismissLocalProjectFilesChangedDialogRef.current = null;
        }
      };
      dismissLocalProjectFilesChangedDialogRef.current = dismissTrackedDialog;
      try {
        await showLocalProjectFilesChangedDialog({
          showConfirmation,
          onReloadProject: () =>
            reloadProject({ skipUnsavedChangesConfirmation: true }),
          onBackupProject: backupCurrentProjectToLocalFolder,
          dismissSignal,
          dismissDialog: dismissTrackedDialog,
        });
      } finally {
        if (
          dismissLocalProjectFilesChangedDialogRef.current ===
          dismissTrackedDialog
        ) {
          dismissLocalProjectFilesChangedDialogRef.current = null;
        }
      }
    },
    [backupCurrentProjectToLocalFolder, reloadProject, showConfirmation]
  );

  const areLocalProjectFilesSameAsMemory = React.useCallback(
    async (): Promise<boolean> => {
      if (!currentFileMetadata) return false;
      const fileIdentifier = currentFileMetadata.fileIdentifier;
      const project = currentProjectRef.current;
      if (!project) return false;
      const diskProject = await openMultiFileProject(fileIdentifier);
      if (!isCurrentProjectFresh(currentProjectRef, project)) return false;

      return areLegacyProjectsEquivalent(
        serializeToJSObject(project, 'serializeTo'),
        diskProject
      );
    },
    [currentFileMetadata, currentProjectRef]
  );

  useLocalProjectChangesWatcher({
    enabled:
      !!currentProject &&
      !isProjectOpening &&
      !isSavingProject &&
      getStorageProvider().internalName ===
        localFileStorageProviderInternalName,
    fileIdentifier: currentFileMetadata
      ? currentFileMetadata.fileIdentifier
      : null,
    lastKnownModificationTime: currentFileMetadata
      ? currentFileMetadata.lastModifiedDate || null
      : null,
    areProjectFilesSameAsMemory: areLocalProjectFilesSameAsMemory,
    onProjectFilesChanged: onLocalProjectFilesChanged,
  });

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
    openStandaloneDialog,
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
    // $FlowFixMe[incompatible-type]
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
        ignoreAutoSave: true,
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

  const setElectronUpdateStatus = (updateStatus: ElectronUpdateStatus) => {
    setState(state => ({ ...state, updateStatus }));

    if (updateStatus.status === 'update-downloaded') {
      // Update is ready: offer a one-click restart instead of a generic notification.
      const version = updateStatus.info && updateStatus.info.version;
      const restartNotification = new window.Notification(
        version
          ? i18n._(t`GDevelop update ready (${version})`)
          : i18n._(t`GDevelop update ready`),
        { body: i18n._(t`Click to restart and install the update now.`) }
      );
      restartNotification.onclick = () => {
        if (ipcRendererForUpdates)
          ipcRendererForUpdates.send('updates-install-and-quit');
      };
    } else {
      const notificationTitle = getElectronUpdateNotificationTitle(
        updateStatus,
        i18n
      );
      const notificationBody = getElectronUpdateNotificationBody(
        updateStatus,
        i18n,
        preferences.values.autoDownloadUpdates
      );
      if (notificationTitle) {
        const notification = new window.Notification(notificationTitle, {
          body: notificationBody,
        });
        notification.onclick = () => openAboutDialog(true);
      }
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
          creationSource: 'in-app-tutorial',
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
      const newProjectSetup: NewProjectSetup = {
        storageProvider: emptyStorageProvider,
        saveAsLocation: null,
        creationSource: 'course-chapter',
        // Remaining will be set by the template.
      };
      try {
        await createProjectFromCourseChapter({
          courseChapter,
          templateId,
          newProjectSetup,
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
              creationSource: 'in-app-tutorial',
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

  /**
   * Similar to `currentProjectRef`, a fresh reference (fresh=value of the last render)
   * to the latest `currentFileMetadata`. Only use this reference in fetchNewlyAddedResources.
   * Anywhere else, pass the currentFileMetadata directly as argument.
   */
  const currentFileMetadataRef = useStableUpToDateRef(currentFileMetadata);
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
  // $FlowFixMe[underconstrained-implicit-instantiation]
  const onFetchNewlyAddedResources = useStableUpToDateCallback(
    fetchNewlyAddedResources
  );

  const onNewResourcesAdded = React.useCallback(
    () => {
      notifyChangesToInGameEditor({
        shouldReloadProjectData: true,
        shouldReloadLibraries: false,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['added-new-resources'],
      });
    },
    [notifyChangesToInGameEditor]
  );

  useKeyboardShortcuts({
    previewDebuggerServer,
    onRunCommand: React.useCallback(commandName => {
      if (!commandPaletteRef.current) return;
      commandPaletteRef.current.launchCommand(commandName);
    }, []),
  });

  const openCommandPalette = React.useCallback(() => {
    if (commandPaletteRef.current) {
      commandPaletteRef.current.open();
    }
  }, []);

  const openRecentEditorSwitcher = React.useCallback(() => {
    setRecentEditorSwitcherOpen(true);
  }, []);

  const recentEditorSwitcherSideMenuItems: Array<RecentEditorSwitcherSideMenuItem> = [];
  const addRecentEditorSwitcherSideMenuItem = (
    id: string,
    title: string,
    subtitle: string,
    icon: ?React.Node,
    activate: () => void
  ) => {
    recentEditorSwitcherSideMenuItems.push({
      id,
      title,
      subtitle,
      icon,
      activate,
    });
  };
  const recentEditorSwitcherActionItems: Array<RecentEditorSwitcherActionItem> = [];
  const addRecentEditorSwitcherActionItem = (
    id: string,
    title: string,
    subtitle: string,
    icon: ?React.Node,
    searchTerms: string,
    activate: () => void
  ) => {
    recentEditorSwitcherActionItems.push({
      id,
      title,
      subtitle,
      icon,
      searchTerms,
      activate,
    });
  };

  addRecentEditorSwitcherSideMenuItem(
    'project-manager',
    i18n._(t`Project menu`),
    i18n._(t`Side menu`),
    <MenuIcon />,
    showProjectManager
  );
  addRecentEditorSwitcherSideMenuItem(
    'start page',
    i18n._(t`Home`),
    i18n._(t`Main editor`),
    <HomeIcon titleAccess="Home" />,
    openHomePage
  );
  addRecentEditorSwitcherSideMenuItem(
    'ask-ai',
    i18n._(t`Ask AI`),
    i18n._(t`Assistant`),
    <RobotIcon size={16} />,
    () => openAskAi(null)
  );
  addRecentEditorSwitcherSideMenuItem(
    'preferences',
    i18n._(t`Preferences`),
    i18n._(t`Window`),
    <SettingsIcon />,
    () => openPreferencesDialog(true)
  );

  addRecentEditorSwitcherActionItem(
    'action:create-new-game',
    i18n._(t`Create new game`),
    i18n._(t`Project action`),
    <AddCircleIcon />,
    'new game create game create project new project',
    () => setNewProjectSetupDialogOpen(true)
  );

  if (currentProject) {
    addRecentEditorSwitcherActionItem(
      'action:reload-project',
      i18n._(t`Reload project`),
      i18n._(t`Project action`),
      <RefreshIcon />,
      'reload project refresh project reopen disk cloud file',
      () => {
        reloadProject();
      }
    );
    addRecentEditorSwitcherActionItem(
      'action:create-scene',
      i18n._(t`Create a scene`),
      i18n._(t`Project action`),
      <SceneIcon />,
      'new scene add scene layout level',
      () => createProjectItemFromSwitcher('scene')
    );
    addRecentEditorSwitcherActionItem(
      'action:create-prefab',
      i18n._(t`Create a prefab`),
      i18n._(t`Project action`),
      <ObjectIcon />,
      'new prefab add prefab custom object events based object',
      () => createProjectItemFromSwitcher('prefab')
    );
    addRecentEditorSwitcherActionItem(
      'action:create-behavior',
      i18n._(t`Create a behavior`),
      i18n._(t`Project action`),
      <BehaviorIcon />,
      'new behavior add behavior events based behavior',
      () => createProjectItemFromSwitcher('behavior')
    );
    addRecentEditorSwitcherActionItem(
      'action:create-function',
      i18n._(t`Create a function`),
      i18n._(t`Project action`),
      <SettingsIcon />,
      'new function add function action condition expression extension function',
      () => createProjectItemFromSwitcher('function')
    );
    addRecentEditorSwitcherActionItem(
      'action:install-extension',
      i18n._(t`Install extension`),
      i18n._(t`Project action`),
      <ExtensionIcon />,
      'search import install add extension behavior object function store',
      () => createProjectItemFromSwitcher('install-extension')
    );
    addRecentEditorSwitcherActionItem(
      'action:create-note',
      i18n._(t`Create a note`),
      i18n._(t`Project action`),
      <AddCommentIcon />,
      'new note create note sticky note comment',
      createStickyNoteFromTitlebar
    );
    addRecentEditorSwitcherActionItem(
      'action:create-external',
      i18n._(t`Create external events/layout`),
      i18n._(t`Project action`),
      <ExternalEventsIcon />,
      'new external add external events external layout linked scene',
      () => createProjectItemFromSwitcher('external')
    );
    addRecentEditorSwitcherActionItem(
      'action:open-image-extender',
      i18n._(t`Open Image Extender`),
      i18n._(t`Resource tool`),
      <SparkleIcon />,
      'open image extender resource tool ai image expand',
      () => {
        openResourceToolFromSwitcher('image-extender');
      }
    );
    addRecentEditorSwitcherActionItem(
      'action:open-ai-game-workbench',
      i18n._(t`Open AI Game Workbench`),
      i18n._(t`Resource tool`),
      <SparkleIcon />,
      'open ai game workbench resource tool image character extension',
      () => {
        openResourceToolFromSwitcher('ai-game-workbench');
      }
    );
    addRecentEditorSwitcherActionItem(
      'action:open-gorest-spritesheet',
      i18n._(t`Open Gorest Spritesheet`),
      i18n._(t`Resource tool`),
      <SparkleIcon />,
      'open gorest spritesheet resource tool image animation spritesheet',
      () => {
        openResourceToolFromSwitcher('gorest-spritesheet');
      }
    );
    addRecentEditorSwitcherActionItem(
      'action:open-advanced-tween-editor',
      i18n._(t`Open AdvancedTween Editor`),
      i18n._(t`Resource tool`),
      <PlayIcon />,
      'open advanced tween editor resource tool animation tween',
      () => {
        openResourceToolFromSwitcher('advanced-tween-editor');
      }
    );

    addRecentEditorSwitcherSideMenuItem(
      gamePropertiesItemId,
      i18n._(t`Properties & Icons`),
      i18n._(t`Project window`),
      <SettingsIcon />,
      () => activateProjectManagerItemFromSwitcher(gamePropertiesItemId)
    );
    addRecentEditorSwitcherSideMenuItem(
      'resources',
      i18n._(t`Resources`),
      i18n._(t`Project window`),
      <ProjectResourcesIcon />,
      openResources
    );
    addRecentEditorSwitcherSideMenuItem(
      gameExtensionsItemId,
      i18n._(t`Extensions`),
      i18n._(t`Project window`),
      <ExtensionIcon />,
      () => activateProjectManagerItemFromSwitcher(gameExtensionsItemId)
    );
    addRecentEditorSwitcherSideMenuItem(
      'export-share',
      i18n._(t`Export & Share`),
      i18n._(t`Project window`),
      <ShareIcon />,
      () => {
        openShareDialog('publish');
      }
    );
    addRecentEditorSwitcherSideMenuItem(
      'sticky-notes',
      i18n._(t`Sticky notes`),
      i18n._(t`Project tools`),
      <AddCommentIcon />,
      openStickyNotesManager
    );
    addRecentEditorSwitcherSideMenuItem(
      'constants',
      i18n._(t`Constants`),
      i18n._(t`Game settings`),
      <ConstantsIcon />,
      openConstants
    );
    addRecentEditorSwitcherSideMenuItem(
      globalVariablesItemId,
      i18n._(t`Global variables`),
      i18n._(t`Globals`),
      <GlobalVariableIcon />,
      openProjectVariablesFromSwitcher
    );
    addRecentEditorSwitcherSideMenuItem(
      globalObjectsItemId,
      i18n._(t`Global objects`),
      i18n._(t`Globals`),
      <ObjectIcon />,
      () => activateProjectManagerItemFromSwitcher(globalObjectsItemId)
    );
    addRecentEditorSwitcherSideMenuItem(
      'global-search',
      i18n._(t`Global search`),
      i18n._(t`Search in project`),
      <SearchIcon />,
      openGlobalSearch
    );

    for (
      let sceneIndex = 0;
      sceneIndex < currentProject.getLayoutsCount();
      sceneIndex++
    ) {
      const layout = currentProject.getLayoutAt(sceneIndex);
      const layoutName = layout.getName();
      addRecentEditorSwitcherSideMenuItem(
        `layout ${layoutName}`,
        layoutName,
        i18n._(t`Scene editor`),
        <SceneIcon />,
        () =>
          openLayout(layoutName, {
            openEventsEditor: false,
            openSceneEditor: true,
            focusWhenOpened: 'scene',
          })
      );
      addRecentEditorSwitcherSideMenuItem(
        `layout events ${layoutName}`,
        `${layoutName} ${i18n._(t`(Events)`)}`,
        i18n._(t`Events sheet`),
        <EventsIcon />,
        () =>
          openLayout(layoutName, {
            openEventsEditor: true,
            openSceneEditor: false,
            focusWhenOpened: 'events',
          })
      );
    }

    for (
      let externalLayoutIndex = 0;
      externalLayoutIndex < currentProject.getExternalLayoutsCount();
      externalLayoutIndex++
    ) {
      const externalLayout = currentProject.getExternalLayoutAt(
        externalLayoutIndex
      );
      const externalLayoutName = externalLayout.getName();
      addRecentEditorSwitcherSideMenuItem(
        `external layout ${externalLayoutName}`,
        externalLayoutName,
        i18n._(t`External layout`),
        <ExternalLayoutIcon />,
        () => openExternalLayout(externalLayoutName)
      );
    }

    for (
      let externalEventsIndex = 0;
      externalEventsIndex < currentProject.getExternalEventsCount();
      externalEventsIndex++
    ) {
      const externalEvents = currentProject.getExternalEventsAt(
        externalEventsIndex
      );
      const externalEventsName = externalEvents.getName();
      addRecentEditorSwitcherSideMenuItem(
        `external events ${externalEventsName}`,
        externalEventsName,
        i18n._(t`External events`),
        <ExternalEventsIcon />,
        () => openExternalEvents(externalEventsName)
      );
    }

    for (
      let extensionIndex = 0;
      extensionIndex < currentProject.getEventsFunctionsExtensionsCount();
      extensionIndex++
    ) {
      const eventsFunctionsExtension = currentProject.getEventsFunctionsExtensionAt(
        extensionIndex
      );
      const extensionName = eventsFunctionsExtension.getName();
      addRecentEditorSwitcherSideMenuItem(
        `events functions extension ${extensionName}`,
        extensionName,
        i18n._(t`Extension`),
        <ExtensionIcon />,
        () => openEventsFunctionsExtension(extensionName)
      );

      const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
      for (
        let objectIndex = 0;
        objectIndex < eventsBasedObjects.size();
        objectIndex++
      ) {
        const eventsBasedObject = eventsBasedObjects.at(objectIndex);
        const objectName = eventsBasedObject.getName();
        addRecentEditorSwitcherSideMenuItem(
          `custom object ${extensionName}::${objectName}`,
          objectName,
          `${extensionName} - ${i18n._(t`Visual editor`)}`,
          <ObjectIcon />,
          () =>
            openCustomObjectEditor(
              eventsFunctionsExtension,
              eventsBasedObject,
              ''
            )
        );
        addRecentEditorSwitcherSideMenuItem(
          `prefab detail ${extensionName}::${objectName}`,
          `${objectName} ${i18n._(t`(Prefab)`)}`,
          `${extensionName} - ${i18n._(t`Prefab events`)}`,
          <ObjectIcon />,
          () =>
            openPrefabDetailEditor(eventsFunctionsExtension, eventsBasedObject)
        );

        const variants = eventsBasedObject.getVariants();
        for (
          let variantIndex = 0;
          variantIndex < variants.getVariantsCount();
          variantIndex++
        ) {
          const variant = variants.getVariantAt(variantIndex);
          const variantName = variant.getName();
          if (!variantName) continue;
          addRecentEditorSwitcherSideMenuItem(
            `custom object ${extensionName}::${objectName}::${variantName}`,
            variantName,
            `${objectName} - ${i18n._(t`Variant`)}`,
            <ObjectIcon />,
            () =>
              openCustomObjectEditor(
                eventsFunctionsExtension,
                eventsBasedObject,
                variantName
              )
          );
        }
      }

      const eventsBasedBehaviors = eventsFunctionsExtension.getEventsBasedBehaviors();
      for (
        let behaviorIndex = 0;
        behaviorIndex < eventsBasedBehaviors.size();
        behaviorIndex++
      ) {
        const eventsBasedBehavior = eventsBasedBehaviors.at(behaviorIndex);
        const behaviorName = eventsBasedBehavior.getName();
        addRecentEditorSwitcherSideMenuItem(
          `behavior detail ${extensionName}::${behaviorName}`,
          behaviorName,
          `${extensionName} - ${i18n._(t`Behavior`)}`,
          <BehaviorIcon />,
          () => openBehaviorEvents(extensionName, behaviorName)
        );
      }

      const eventsFunctions = enumerateFunctionsInFolder(
        eventsFunctionsExtension.getEventsFunctions().getRootFolder()
      );
      for (
        let functionIndex = 0;
        functionIndex < eventsFunctions.length;
        functionIndex++
      ) {
        const eventsFunction = eventsFunctions[functionIndex];
        const functionName = eventsFunction.getName();
        addRecentEditorSwitcherSideMenuItem(
          `function detail ${extensionName}::${functionName}`,
          functionName,
          `${extensionName} - ${i18n._(t`Function`)}`,
          <SettingsIcon />,
          () => openEventsFunctionsExtension(extensionName, functionName)
        );
      }
    }
  }

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
          } else {
            await tryAutoOpenMostRecentProjectAtStartup({
              preferences: {
                getAutoOpenMostRecentProject,
                getRecentProjectFiles,
                hadProjectOpenedDuringLastSession,
                setHasProjectOpened: preferences.setHasProjectOpened,
              },
              storageProviders: props.storageProviders,
              getStorageProviderOperations,
              ensureInteractionHappened,
              openFromFileMetadataWithStorageProvider,
            });
          }

          configureNewProjectActionsForProfile({
            fetchAndOpenNewProjectSetupDialogForExample,
          });
        })
        .catch(() => {
          /* Ignore errors */
        });
    },
    // We want to run this effect only when the component did mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Register the onResourceExternallyChanged with an up to date context.
  React.useEffect(
    () => {
      const callbackId = registerOnResourceExternallyChangedCallback(
        onResourceExternallyChanged
      );
      return () => {
        unregisterOnResourceExternallyChangedCallback(callbackId);
      };
    },
    [onResourceExternallyChanged]
  );

  useMainFrameCommands({
    i18n,
    project: currentProject,
    previewEnabled: !!currentProject && currentProject.getLayoutsCount() > 0,
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
    onOpenDiagnosticReport: () => setDiagnosticReportDialogOpen(true),
    onOpenHomePage: openHomePage,
    onCreateProject: () => setNewProjectSetupDialogOpen(true),
    onOpenProject: () => openOpenFromStorageProviderDialog(),
    onSaveProject: saveProject,
    onSaveProjectAs: saveProjectAs,
    onCloseApp: closeApp,
    onCloseProject: async () => {
      askToCloseProject();
    },
    onReloadProject: reloadProject,
    onExportGame: () => {
      openShareDialog('publish');
    },
    onExportHtml5External: async () => {
      const project = currentProject;
      if (!project || !onExportHtml5External) return;
      try {
        await onExportHtml5External(project, i18n);
      } catch (error) {
        console.error('Headless HTML5 export failed:', error);
      }
    },
    onInviteCollaborators: () => {
      openShareDialog('invite');
    },
    onOpenLayout: name => {
      openLayout(name);
    },
    onOpenExternalEvents: openExternalEvents,
    onOpenExternalLayout: openExternalLayout,
    onOpenEventsFunctionsExtension: openEventsFunctionsExtension,
    onOpenCommandPalette: openCommandPalette,
    onOpenRecentEditorSwitcher: openRecentEditorSwitcher,
    onOpenProfile: onOpenProfileDialog,
    onRestartInGameEditor,
    onOpenGlobalSearch: openGlobalSearch,
    onOpenMemoryTrackerRegistry: () => setMemoryTrackedRegistryDialogOpen(true),
    onImportExtension,
    canInstallCliInPath: isCliInPathInstallSupported(),
    onInstallCliInPath: async () => {
      const result = await installCliInPath();
      // Main-process message isn't localized but carries OS-specific nuance
      // (e.g. "open a new terminal" on Windows) that a generic string would drop.
      _showSnackMessage(
        result.status === 'success'
          ? result.message
          : i18n._(t`Couldn't set up the GDevelop CLI: ${result.message}`)
      );
    },
  });

  useCliCommandRunner({
    project: currentProject,
    i18n,
    fileIdentifier,
    commandPaletteRef,
    importExtension,
    onWillInstallExtension,
    onExtensionInstalled,
    saveProject,
    ensureProjectSettingsApplied,
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
      onNewResourcesAdded,
      onResourceUsageChanged,
      resourceCustomPropertyConfigs,
    }),
    [
      resourceSources,
      onChooseResource,
      resourceExternalEditors,
      getStorageProvider,
      onFetchNewlyAddedResources,
      getStorageProviderResourceOperations,
      canInstallPrivateAsset,
      onNewResourcesAdded,
      onResourceUsageChanged,
      resourceCustomPropertyConfigs,
    ]
  );

  const { ensureExtensionInstalled } = useEnsureExtensionInstalled({
    project: currentProject,
    i18n,
  });
  const { generateEvents } = useGenerateEvents({ project: currentProject });
  const { searchAndInstallAsset } = useSearchAndInstallAsset({
    project: currentProject,
    resourceManagementProps,
    onWillInstallExtension,
    onExtensionInstalled,
  });
  const { searchAndInstallResources } = useSearchAndInstallResource({
    project: currentProject,
    resourceManagementProps,
  });
  const { translatedObjectShortHeadersByType, fetchObjects } = React.useContext(
    ObjectStoreContext
  );
  React.useEffect(
    () => {
      fetchObjects();
    },
    [fetchObjects]
  );
  const getAssetStoreTagForNewObject = React.useCallback(
    (objectType: string): string | null => {
      const header = translatedObjectShortHeadersByType[objectType];
      return (header && header.assetStoreTag) || null;
    },
    [translatedObjectShortHeadersByType]
  );

  const onCreateProjectFromMcp = React.useCallback(
    async ({
      name,
      exampleSlug,
    }: {|
      name: string,
      exampleSlug: string | null,
    |}) => {
      // On desktop, create the project with the local-file storage provider and
      // a default path so it is WRITTEN to disk immediately (createProject calls
      // the provider's onSaveProjectAs). On web there is no local provider, so
      // fall back to the in-memory Url provider (project opens but is not saved).
      const localFileStorageProvider = props.storageProviders.find(
        provider => provider.internalName === 'LocalFile'
      );
      let storageProvider = UrlStorageProvider;
      let saveAsLocation = null;
      if (
        localFileStorageProvider &&
        localFileStorageProvider.getProjectLocation
      ) {
        // A fresh, unique subfolder under the user's "GDevelop projects" folder,
        // matching the editor's own new-project flow so repeated AI creations
        // don't overwrite each other.
        const newProjectsDefaultFolder = electronApp
          ? findEmptyPathInWorkspaceFolder(
              electronApp,
              preferences.values.newProjectsDefaultFolder || ''
            )
          : preferences.values.newProjectsDefaultFolder || '';
        storageProvider = localFileStorageProvider;
        saveAsLocation = localFileStorageProvider.getProjectLocation({
          projectName: name,
          saveAsLocation: null,
          newProjectsDefaultFolder,
        });
      }

      const newProjectSetup: NewProjectSetup = {
        projectName: name,
        storageProvider,
        saveAsLocation,
        creationSource: 'ai-agent-request',
      };

      if (exampleSlug) {
        const { exampleShortHeaders } = await listAllExamples();
        const exampleShortHeader = exampleShortHeaders.find(
          header => header.slug === exampleSlug
        );
        if (exampleShortHeader) {
          const { createdProject } = await createProjectFromExample({
            exampleShortHeader,
            newProjectSetup,
            i18n,
          });
          return { exampleSlug, createdProject };
        }
      }

      const { createdProject } = await createEmptyProject(newProjectSetup);
      return { exampleSlug: null, createdProject };
    },
    [
      createProjectFromExample,
      createEmptyProject,
      i18n,
      props.storageProviders,
      preferences,
    ]
  );

  const mcpEditorCallbacks: EditorCallbacks = React.useMemo(
    () => ({
      onOpenLayout: (sceneName, options) => openLayout(sceneName, options),
      onCloseLayout: (sceneName: string) => {
        const currentProject = currentProjectRef.current;
        if (!currentProject || !currentProject.hasLayoutNamed(sceneName))
          return;
        const layout = currentProject.getLayout(sceneName);
        setState(state => ({
          ...state,
          editorTabs: closeLayoutTabs(state.editorTabs, layout),
        }));
      },
      onCreateProject: onCreateProjectFromMcp,
    }),
    [openLayout, onCreateProjectFromMcp, currentProjectRef, setState]
  );

  const getMcpEditorSelection = React.useCallback(
    () => {
      const editorTabs = editorTabsRef.current;
      const selections = [];

      for (const paneIdentifier of Object.keys(editorTabs.panes)) {
        if (paneIdentifier === 'external') continue;

        const editorTab = getCurrentTabForPane(editorTabs, paneIdentifier);
        if (!editorTab || !editorTab.editorRef) continue;

        const editorRef: any = editorTab.editorRef;
        if (typeof editorRef.getEditorSelectionSnapshot !== 'function') {
          continue;
        }

        const selection = editorRef.getEditorSelectionSnapshot();
        if (!selection) continue;

        selections.push({
          paneIdentifier,
          tabKey: editorTab.key,
          editorKind: editorTab.kind,
          projectItemName: editorTab.projectItemName,
          ...selection,
        });
      }

      const primarySelection =
        selections.find(selection => selection.paneIdentifier === 'center') ||
        selections[0] ||
        null;

      return {
        hasActiveSelectionProvider: selections.length > 0,
        primarySelection,
        selections,
      };
    },
    [editorTabsRef]
  );

  const saveProjectForMcpAndWait = React.useCallback(
    (): Promise<Object> =>
      saveProjectAfterPendingSave({
        isSaveProjectInProgress,
        saveProject: () => saveProject({ rethrowSaveError: true }),
        hasExtensionLoadErrors,
      }),
    [hasExtensionLoadErrors, isSaveProjectInProgress, saveProject]
  );
  const launchPreviewForSceneRef = useStableUpToDateRef(launchPreviewForScene);

  const mcpEditorBridge = React.useMemo(
    () =>
      createMcpEditorBridge({
        getProject: () => currentProjectRef.current,
        getPermissions: () => ({
          allowWriteTools: preferences.values.mcpAllowWriteTools,
          allowCommandTools: preferences.values.mcpAllowCommandTools,
        }),
        i18n,
        editorCallbacks: mcpEditorCallbacks,
        triggerUnsavedChanges,
        openProjectAndWait: async ({
          projectPath,
          discardUnsavedChanges,
          reportProgress,
        }) => {
          const hasUnsavedInMemoryChanges = getChangesCount() > 0;
          if (hasUnsavedInMemoryChanges && !discardUnsavedChanges) {
            return {
              opened: false,
              code: 'MCP_OPEN_PROJECT_UNSAVED_CHANGES',
              reason:
                'The current project has unsaved in-memory changes. Save them first or retry with discard_unsaved_changes:true.',
            };
          }

          if (reportProgress) reportProgress({ phase: 'open-requested' });
          const openedState = await openFromFileMetadataWithStorageProvider(
            {
              fileMetadata: { fileIdentifier: projectPath },
              storageProviderName: localFileStorageProviderInternalName,
            },
            {
              ignoreUnsavedChanges: true,
              ignoreAutoSave: true,
              suppressOpenErrorAlert: true,
              rethrowOpenError: true,
              reportProgress: phase => {
                if (reportProgress) reportProgress({ phase });
              },
            }
          );
          const openedProject = openedState && openedState.currentProject;
          if (!openedProject) {
            return {
              opened: false,
              code: 'MCP_OPEN_PROJECT_FAILED',
              reason:
                'The requested project did not become the active project.',
            };
          }

          if (reportProgress) reportProgress({ phase: 'extensions-waiting' });
          await eventsFunctionsExtensionsState.ensureLoadFinished(
            openedProject
          );
          await ensureProjectSettingsApplied();
          if (reportProgress) reportProgress({ phase: 'open-complete' });
          return {
            opened: true,
            projectName: openedProject.getName(),
            projectFile: openedProject.getProjectFile() || projectPath,
          };
        },
        runCommand: commandName => {
          if (!commandPaletteRef.current) return false;
          commandPaletteRef.current.launchCommand((commandName: any));
          return true;
        },
        getPreviewLaunchState: getPreviewLaunchStateForMcp,
        beginPreviewLaunchSequence: beginMcpPreviewLaunchSequence,
        endPreviewLaunchSequence: endMcpPreviewLaunchSequence,
        getLaunchPreviewForScene: () => launchPreviewForSceneRef.current,
        cancelPreviewLaunch: cancelPreviewLaunchForMcp,
        reloadProjectAndWait: async reportProgress => {
          if (!currentFileMetadata) {
            return {
              reloaded: false,
              reason: 'The current project has no disk location.',
            };
          }
          const reportReloadProgress = (phase: string) => {
            if (reportProgress) reportProgress({ phase });
          };
          const fileIdentifier = currentFileMetadata.fileIdentifier;
          const storageProviderName = getStorageProvider().internalName;
          reportReloadProgress('reload-requested');
          await reloadProject({
            skipUnsavedChangesConfirmation: true,
            rethrowOpenError: true,
            reportProgress: reportReloadProgress,
          });
          reportReloadProgress('editor-loaded');
          const reloadedProject = currentProjectRef.current;
          const reloadedProjectFile = reloadedProject
            ? reloadedProject.getProjectFile()
            : '';
          const isLocalMultiFileProject =
            storageProviderName === localFileStorageProviderInternalName &&
            !!reloadedProject &&
            (reloadedProjectFile.toLowerCase() === MULTI_FILE_ENTRY_NAME ||
              reloadedProjectFile
                .toLowerCase()
                .endsWith(`/${MULTI_FILE_ENTRY_NAME}`) ||
              reloadedProjectFile
                .toLowerCase()
                .endsWith(`\\${MULTI_FILE_ENTRY_NAME}`));
          if (!isLocalMultiFileProject || !reloadedProject) {
            return {
              reloaded: true,
              fileIdentifier,
              catalogsRegenerated: false,
            };
          }

          const projectRootPath = getProjectRootPath(reloadedProject);
          if (!projectRootPath) {
            throw new Error(
              'Unable to resolve the local project root for catalog regeneration.'
            );
          }
          reportReloadProgress('extensions-loading');
          await eventsFunctionsExtensionsState.ensureLoadFinished(
            reloadedProject
          );
          reportReloadProgress('catalogs-generating');
          const catalogs = await writeProjectSourceCatalogs(
            reloadedProject,
            projectRootPath,
            { reportProgress: reportReloadProgress }
          );
          reportReloadProgress('catalogs-modification-time-reading');
          const lastModifiedDate = getLocalProjectLastModifiedDateSync(
            reloadedProject.getProjectFile()
          );
          if (lastModifiedDate !== null) {
            await setState(state => {
              if (
                state.currentProject !== reloadedProject ||
                !state.currentFileMetadata
              ) {
                return state;
              }
              return {
                ...state,
                currentFileMetadata: {
                  ...state.currentFileMetadata,
                  lastModifiedDate,
                },
              };
            });
          }
          reportReloadProgress('catalogs-modification-time-acknowledged');
          reportReloadProgress('catalogs-complete');
          return {
            reloaded: true,
            fileIdentifier,
            catalogsRegenerated: true,
            catalogs,
          };
        },
        saveProjectAndWait: saveProjectForMcpAndWait,
        getPersistenceState: () => ({
          hasUnsavedChanges: getChangesCount() > 0,
          changesCount: getChangesCount(),
          timeOfFirstChangeSinceLastSave: getTimeOfFirstChangeSinceLastSave(),
        }),
        getEditorSelection: getMcpEditorSelection,
        getPreviewDebuggerServer: () =>
          _previewLauncher.current
            ? _previewLauncher.current.getPreviewDebuggerServer()
            : null,
        closeAllPreviews: async () => {
          // An embedded 3D preview can be preparing without owning a native
          // preview window yet. Cancel it explicitly, then allow queued window
          // close notifications to settle before the MCP workflow launches a
          // fresh preview.
          cancelPendingPreviewLaunchAfterWindowClosed(
            'all previews were closed through MCP'
          );
          const previewLauncher = _previewLauncher.current;
          if (previewLauncher && previewLauncher.closeAllPreviews) {
            let closeResult = await previewLauncher.closeAllPreviews();
            const waitDeadline = Date.now() + 10000;
            while (
              previewLaunchInProgressRef.current &&
              Date.now() < waitDeadline
            ) {
              await new Promise(resolve => setTimeout(resolve, 50));
            }
            releaseCancelledPreviewPreparation(
              'it did not unwind after all previews were closed through MCP'
            );
            // A cancelled launch may have created its native window while it
            // was unwinding. Close once more after the lock is released so no
            // stale debugger connection can race the next explicit launch.
            closeResult = await previewLauncher.closeAllPreviews();
            return closeResult;
          }
        },
        focusAllPreviews: () => {
          const previewLauncher = _previewLauncher.current;
          if (previewLauncher && previewLauncher.focusAllPreviews) {
            previewLauncher.focusAllPreviews();
          }
        },
        injectPreviewClickUserGesture: inputs => {
          const previewLauncher = _previewLauncher.current;
          if (
            previewLauncher &&
            previewLauncher.injectPreviewClickUserGesture
          ) {
            return previewLauncher.injectPreviewClickUserGesture(inputs);
          }
          return Promise.resolve({
            success: false,
            attempted: true,
            supported: false,
            error: 'Native preview input injection is unavailable.',
          });
        },
        capturePreviewPage: windowId => {
          const previewLauncher = _previewLauncher.current;
          if (previewLauncher && previewLauncher.capturePreviewPage) {
            return previewLauncher.capturePreviewPage(windowId);
          }
          return Promise.resolve(null);
        },
        generateEvents,
        onSceneEventsModifiedOutsideEditor,
        onInstancesModifiedOutsideEditor,
        onObjectsModifiedOutsideEditor,
        onObjectGroupsModifiedOutsideEditor,
        onExtensionModifiedOutsideEditor,
        ensureExtensionInstalled,
        onWillInstallExtension,
        onExtensionInstalled,
        searchAndInstallAsset,
        searchAndInstallResources,
        getAssetStoreTagForNewObject,
      }),
    [
      currentProjectRef,
      preferences.values.mcpAllowWriteTools,
      preferences.values.mcpAllowCommandTools,
      i18n,
      mcpEditorCallbacks,
      triggerUnsavedChanges,
      openFromFileMetadataWithStorageProvider,
      ensureProjectSettingsApplied,
      getChangesCount,
      getTimeOfFirstChangeSinceLastSave,
      saveProjectForMcpAndWait,
      reloadProject,
      currentFileMetadata,
      getStorageProvider,
      setState,
      eventsFunctionsExtensionsState,
      getPreviewLaunchStateForMcp,
      beginMcpPreviewLaunchSequence,
      endMcpPreviewLaunchSequence,
      cancelPendingPreviewLaunchAfterWindowClosed,
      releaseCancelledPreviewPreparation,
      cancelPreviewLaunchForMcp,
      launchPreviewForSceneRef,
      getMcpEditorSelection,
      generateEvents,
      onSceneEventsModifiedOutsideEditor,
      onInstancesModifiedOutsideEditor,
      onObjectsModifiedOutsideEditor,
      onObjectGroupsModifiedOutsideEditor,
      onExtensionModifiedOutsideEditor,
      ensureExtensionInstalled,
      onWillInstallExtension,
      onExtensionInstalled,
      searchAndInstallAsset,
      searchAndInstallResources,
      getAssetStoreTagForNewObject,
    ]
  );
  const mcpEditorBridgeRef = useStableUpToDateRef(mcpEditorBridge);

  React.useEffect(
    () => {
      if (!ipcRenderer) return;

      const handleMcpRendererRequest = (event: any, request: any) => {
        const requestId = request && request.id;
        const operationId = request && request.operationId;
        const reportProgress = (progress: {| phase: string |}) => {
          if (!operationId) return;
          ipcRenderer.send('mcp-renderer-progress', {
            id: requestId,
            operationId,
            progress: {
              ...progress,
              correlationId: operationId,
            },
          });
        };
        reportProgress({ phase: 'renderer-acknowledged' });
        mcpEditorBridgeRef.current
          .handleRendererMcpRequest({
            method: request && request.method,
            params: request && request.params,
            reportProgress,
          })
          .then(result => {
            reportProgress({ phase: 'receipt-persisting' });
            ipcRenderer.send('mcp-renderer-response', {
              id: requestId,
              result,
            });
          })
          .catch(error => {
            ipcRenderer.send('mcp-renderer-response', {
              id: requestId,
              error: {
                message:
                  error && error.message
                    ? error.message
                    : 'Unable to process MCP request.',
              },
            });
          });
      };

      ipcRenderer.on('mcp-renderer-request', handleMcpRendererRequest);
      return () => {
        ipcRenderer.removeListener(
          'mcp-renderer-request',
          handleMcpRendererRequest
        );
      };
    },
    [mcpEditorBridgeRef]
  );

  const projectScopedContainersAccessor: ProjectScopedContainersAccessor | null = React.useMemo(
    () =>
      currentProject
        ? new ProjectScopedContainersAccessor({ project: currentProject })
        : null,
    [currentProject]
  );

  const {
    onSelectExampleShortHeader,
    onSelectPrivateGameTemplateListingData,
    renderNewProjectDialog,
    fetchAndOpenNewProjectSetupDialogForExample,
    openNewProjectDialog,
    closeNewProjectDialog,
  } = useNewProjectDialog({
    project: currentProject,
    fileMetadata: currentFileMetadata,
    isProjectOpening,
    newProjectSetupDialogOpen,
    setNewProjectSetupDialogOpen,
    createEmptyProject,
    createProjectFromExample,
    createProjectFromPrivateGameTemplate,
    closeAskAi,
    storageProviders: props.storageProviders,
    storageProvider: getStorageProvider(),
    resourceManagementProps,
    onOpenLayout: (
      name: string,
      options?: {|
        openEventsEditor: boolean,
        openSceneEditor: boolean,
        focusWhenOpened:
          | 'scene-or-events-otherwise'
          | 'scene'
          | 'events'
          | 'none',
        scenePanelToOpen?: ?SceneEditorPanelId,
      |}
    ) => openLayout(name, options),
    onWillInstallExtension,
    onExtensionInstalled,
  });

  const gamesPlatformFrameTools = useGamesPlatformFrame({
    fetchAndOpenNewProjectSetupDialogForExample,
    onOpenProfileDialog,
  });

  const previewLoading = previewLoadingRef.current;
  const hideAskAi =
    !!authenticatedUser.limits &&
    !!authenticatedUser.limits.capabilities.classrooms &&
    authenticatedUser.limits.capabilities.classrooms.hideAskAi;
  const showLoaderAfterDelay =
    previewLoading === 'hot-reload-for-in-game-edition';
  const showLoaderImmediately =
    isProjectOpening || isLoadingProject || previewLoading === 'preview';

  const buildMainMenuProps = {
    i18n: i18n,
    project: currentProject,
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
    onReloadProject: reloadProject,
    onShowVersionHistory: openVersionHistoryPanel,
    onCloseProject: askToCloseProject,
    onCloseApp: closeApp,
    onExportProject: () => {
      openShareDialog('publish');
    },
    onInviteCollaborators: () => {
      openShareDialog('invite');
    },
    onCreateProject: () => setNewProjectSetupDialogOpen(true),
    onOpenProjectManager: showProjectManager,
    onOpenHomePage: openHomePage,
    onOpenDebugger: openDebugger,
    onOpenStickyNotes: openStickyNotesManager,
    onOpenGlobalSearch: openGlobalSearch,
    onOpenAbout: () => openAboutDialog(true),
    onOpenPreferences: () => openPreferencesDialog(true),
    onOpenLanguage: () => openLanguageDialog(true),
    onOpenProfile: onOpenProfileDialog,
    onOpenAskAi: openAskAi,
    onSelectAll: selectAllInActiveEditors,
    setElectronUpdateStatus: setElectronUpdateStatus,
  };

  const isProjectOwnedBySomeoneElse =
    !!currentFileMetadata && !!currentFileMetadata.ownerId;
  const canSave =
    !!currentProject &&
    !isSavingProject &&
    (!currentFileMetadata || !isProjectOwnedBySomeoneElse);

  const editorTabsPaneProps: EditorTabsPaneCommonProps = {
    gameEditorMode,
    setGameEditorMode,
    editorTabs: state.editorTabs,
    currentProject: currentProject,
    currentFileMetadata: currentFileMetadata,
    canSave: canSave,
    isSavingProject: isSavingProject,
    isSharingEnabled:
      !checkedOutVersionStatus && !cloudProjectRecoveryOpenedVersionId,
    hasPreviewsRunning: hasNonEditionPreviewsRunning,
    isPreviewLaunchInProgress:
      isPreviewLaunchInProgress ||
      isMcpPreviewLaunchInProgress ||
      isMcpPreviewLaunchSequenceInProgress,
    previewState: previewState,
    checkedOutVersionStatus: checkedOutVersionStatus,
    canDoNetworkPreview:
      !!_previewLauncher.current &&
      _previewLauncher.current.canDoNetworkPreview(),
    gamesPlatformFrameTools: gamesPlatformFrameTools,
    toggleProjectManager: toggleProjectManager,
    isProjectManagerPinned: isProjectManagerPinnedForCurrentProject,
    setEditorTabs: setEditorTabs,
    onFocusedEditorTabChange: selectProjectManagerItemForEditorTab,
    saveProject: saveProject,
    autoSaveConstants: autoSaveConstants,
    saveProjectAsWithStorageProvider: saveProjectAsWithStorageProvider,
    onCheckoutVersion: onCheckoutVersion,
    getOrLoadProjectVersion: getOrLoadProjectVersion,
    openShareDialog: tab => {
      openShareDialog(tab);
    },
    launchDebuggerAndPreview: launchDebuggerAndPreview,
    launchNewPreview: launchNewPreview,
    launchNetworkPreview: launchNetworkPreview,
    launchHotReloadPreview: launchHotReloadPreview,
    launchPreviewWithDiagnosticReport: launchPreviewWithDiagnosticReport,
    setPreviewOverride: setPreviewOverride,
    displayCollisionMaskInPreview,
    setDisplayCollisionMaskInPreview,
    displaySignalAnimationsInPreview,
    setDisplaySignalAnimationsInPreview,
    openVersionHistoryPanel: openVersionHistoryPanel,
    onQuitVersionHistory: onQuitVersionHistory,
    onOpenAskAi: openAskAi,
    onCloseAskAi: closeAskAi,
    onCreateStickyNote: createStickyNoteFromTitlebar,
    isStickyNotesManagerShown,
    getStorageProvider: getStorageProvider,
    // $FlowFixMe[incompatible-type]
    setPreviewedLayout: setPreviewedLayout,
    openExternalEvents: openExternalEvents,
    openLayout: openLayout,
    openTemplateFromTutorial: openTemplateFromTutorial,
    openTemplateFromCourseChapter: openTemplateFromCourseChapter,
    previewDebuggerServer: previewDebuggerServer,
    hotReloadPreviewButtonProps: hotReloadPreviewButtonProps,
    resourceManagementProps: resourceManagementProps,
    onCreateEventsFunction: onCreateEventsFunction,
    openInstructionOrExpression: openInstructionOrExpression,
    onOpenCustomObjectEditor: openCustomObjectEditor,
    onOpenPrefabDetailEditor: openPrefabDetailEditor,
    onOpenPrefabSettings: openPrefabSettings,
    onOpenEventsFunctionsExtension: openEventsFunctionsExtension,
    onRenamedEventsBasedObject: onRenamedEventsBasedObject,
    onDeletedEventsBasedObject: onDeletedEventsBasedObject,
    openObjectEvents: openObjectEvents,
    onNavigateToEventFromGlobalSearch: navigateToEventFromGlobalSearch,
    onEditorTabClosing: onEditorTabClosing,
    canOpen: !!props.storageProviders.filter(
      ({ hiddenInOpenDialog }) => !hiddenInOpenDialog
    ).length,
    openOpenFromStorageProviderDialog: openOpenFromStorageProviderDialog,
    openFromFileMetadataWithStorageProvider: openFromFileMetadataWithStorageProvider,
    openNewProjectDialog: openNewProjectDialog,
    openProjectManager: openProjectManager,
    askToCloseProject: askToCloseProject,
    closeProject: closeProject,
    onSelectExampleShortHeader: onSelectExampleShortHeader,
    onSelectPrivateGameTemplateListingData: onSelectPrivateGameTemplateListingData,
    createEmptyProject: createEmptyProject,
    createProjectFromExample: createProjectFromExample,
    onOpenProfileDialog: onOpenProfileDialog,
    openLanguageDialog: openLanguageDialog,
    openPreferencesDialog: openPreferencesDialog,
    openAboutDialog: openAboutDialog,
    selectInAppTutorial: selectInAppTutorial,
    eventsFunctionsExtensionsState: eventsFunctionsExtensionsState,
    isProjectClosedSoAvoidReloadingExtensions: isProjectClosedSoAvoidReloadingExtensions,
    renameResourcesInProject: renameResourcesInProject,
    openBehaviorEvents: openBehaviorEvents,
    onExtractAsExternalLayout: onExtractAsExternalLayout,
    onExtractAsEventBasedObject: onExtractAsEventBasedObject,
    onEventBasedObjectTypeChanged: onEventBasedObjectTypeChanged,
    onOpenEventBasedObjectEditor: onOpenEventBasedObjectEditor,
    onOpenEventBasedObjectVariantEditor: onOpenEventBasedObjectVariantEditor,
    deleteEventsBasedObjectVariant: deleteEventsBasedObjectVariant,
    onEventsBasedObjectChildrenEdited: onEventsBasedObjectChildrenEdited,
    onLoadEventsFunctionsExtensions: onLoadEventsFunctionsExtensions,
    onSceneObjectEdited: onSceneObjectEdited,
    onSceneObjectsDeleted: onSceneObjectsDeleted,
    onSceneEventsModifiedOutsideEditor: onSceneEventsModifiedOutsideEditor,
    onInstancesModifiedOutsideEditor: onInstancesModifiedOutsideEditor,
    onObjectsModifiedOutsideEditor: onObjectsModifiedOutsideEditor,
    onObjectGroupsModifiedOutsideEditor: onObjectGroupsModifiedOutsideEditor,
    onProjectItemRenamedOutsideEditor: onProjectItemRenamedOutsideEditor,
    onWillDeleteScene: onWillDeleteScene,
    onWillDeleteObject: onWillDeleteObject,
    onWillInstallExtension: onWillInstallExtension,
    onExtensionInstalled: onExtensionInstalled,
    onEffectAdded: onEffectAdded,
    onObjectListsModified: onObjectListsModified,
    onExternalAssociationChanged,
    gamesList: gamesList,
    triggerHotReloadInGameEditorIfNeeded,
    onRestartInGameEditor,
    showRestartInGameEditorAfterErrorButton,
    toolbarButtons: state.toolbarButtons,
    projectPath,
    triggerNpmScript,
  };

  const hasEditorsInLeftPane = hasEditorsInPane(state.editorTabs, 'left');
  const hasEditorsInRightPane = hasEditorsInPane(state.editorTabs, 'right');
  const projectManagerTitle = currentProject
    ? currentProject.getName()
    : i18n._(t`Menu`);
  const projectManagerNode = (
    <ProjectManager
      ref={projectManagerRef}
      project={currentProject}
      onChangeProjectName={onChangeProjectName}
      onSaveProjectProperties={onSaveProjectProperties}
      onOpenExternalEvents={openExternalEvents}
      onOpenLayout={(name, options) => openLayout(name, options)}
      onOpenExternalLayout={openExternalLayout}
      onOpenEventsFunctionsExtension={openEventsFunctionsExtension}
      onOpenCustomObjectEditor={openCustomObjectEditor}
      onOpenPrefabDetailEditor={openPrefabDetailEditor}
      onOpenPrefabSettings={openPrefabSettings}
      onOpenBehaviorSettings={openBehaviorSettings}
      openBehaviorEvents={openBehaviorEvents}
      onOpenEventBasedObjectEditor={onOpenEventBasedObjectEditor}
      onOpenEventBasedObjectVariantEditor={onOpenEventBasedObjectVariantEditor}
      onGlobalObjectEdited={onGlobalObjectEdited}
      onRenamedEventsBasedObject={onRenamedEventsBasedObject}
      onDeletedEventsBasedObject={onDeletedEventsBasedObject}
      onRenamedEventsBasedObjectVariant={onRenamedEventsBasedObjectVariant}
      onDeletedEventsBasedObjectVariant={deleteEventsBasedObjectVariant}
      onEventsBasedObjectChildrenEdited={onEventsBasedObjectChildrenEdited}
      onEventBasedObjectTypeChanged={onEventBasedObjectTypeChanged}
      onObjectGroupsModifiedOutsideEditor={onObjectGroupsModifiedOutsideEditor}
      onObjectListsModified={onObjectListsModified}
      onSceneObjectEdited={onSceneObjectEdited}
      onDeleteLayout={deleteLayout}
      onDeleteExternalLayout={deleteExternalLayout}
      onDeleteEventsFunctionsExtension={deleteEventsFunctionsExtension}
      onDeleteExternalEvents={deleteExternalEvents}
      onRenameLayout={renameLayout}
      onRenameExternalLayout={renameExternalLayout}
      onRenameEventsFunctionsExtension={renameEventsFunctionsExtension}
      onRenameExternalEvents={renameExternalEvents}
      onOpenResources={openResources}
      onOpenConstants={openConstants}
      onReloadEventsFunctionsExtensions={onReloadEventsFunctionsExtensions}
      onWillInstallExtension={onWillInstallExtension}
      onExtensionInstalled={onExtensionInstalled}
      onSceneAdded={onSceneAdded}
      onExternalLayoutAdded={onExternalLayoutAdded}
      onEffectAdded={onEffectAdded}
      triggerHotReloadInGameEditorIfNeeded={
        triggerHotReloadInGameEditorIfNeeded
      }
      isOpen={isProjectManagerVisible}
      hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
      resourceManagementProps={resourceManagementProps}
      projectScopedContainersAccessor={projectScopedContainersAccessor}
      gamesList={gamesList}
      onOpenHomePage={openHomePage}
      closeProjectManager={
        isProjectManagerPinnedForCurrentProject
          ? keepPinnedProjectManagerOpen
          : closeProjectManagerOverlay
      }
      mainMenuCallbacks={mainMenuCallbacks}
      // $FlowFixMe[incompatible-type]
      buildMainMenuProps={buildMainMenuProps}
    />
  );

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
            onExport: () => {
              openShareDialog('publish');
            },
            onInvalidConstantPlaceholder: () => {
              setDiagnosticReportDialogOpen(true);
            },
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
      {!isProjectManagerPinnedForCurrentProject && (
        <ProjectManagerDrawer
          projectManagerOpen={projectManagerOpen}
          closeProjectManager={closeProjectManagerOverlay}
          onPinProjectManager={pinProjectManager}
          title={projectManagerTitle}
        >
          {projectManagerNode}
        </ProjectManagerDrawer>
      )}
      {// Render games platform frame before the editors, so the editor have priority
      // in what to display (ex: Loader of play section)
      gamesPlatformFrameTools.renderGamesPlatformFrame()}
      <PoppedOutWindows
        {...editorTabsPaneProps}
        onClose={onExternalWindowClose}
        onPopIn={onPopInTab}
        focusRequest={poppedOutEditorFocusRequest}
      />
      {/* Editors of the main window register their commands in their own
      command manager, so that they stay separated from the ones of the popped
      out windows (rendered above, outside of this provider): a keyboard
      shortcut must always run the command of the window where it was pressed. */}
      <WindowCommandsProvider>
        <div className="main-frame-content">
          {isProjectManagerPinnedForCurrentProject && (
            <ProjectManagerDrawer
              isPinned
              projectManagerOpen={false}
              closeProjectManager={closePinnedProjectManager}
              onPinProjectManager={pinProjectManager}
              title={projectManagerTitle}
            >
              {projectManagerNode}
            </ProjectManagerDrawer>
          )}
          <div
            className="main-frame-editors-content"
            onClickCapture={closeTemporarySideMenusOnEditorClick}
            style={
              gameEditorMode === 'embedded-game' &&
              activeEmbeddedGameFrameHoleCount > 0
                ? { pointerEvents: 'none' }
                : undefined
            }
          >
            <LeaderboardProvider
              gameId={currentProject ? currentProject.getProjectUuid() : ''}
            >
              {renderNpmScriptConfirmDialog()}
              <PanesContainer
                hasEditorsInLeftPane={hasEditorsInLeftPane}
                hasEditorsInRightPane={hasEditorsInRightPane}
                renderPane={({
                  paneIdentifier,
                  isLeftMostPane,
                  isRightMostPane,
                  isDrawer,
                  areSidePanesDrawers,
                  onSetPointerEventsNone,
                  onSetPaneDrawerState,
                  onRequestPaneClose,
                  drawerState,
                  rightPaneDrawerOpen,
                }) => (
                  <EditorTabsPane
                    {...editorTabsPaneProps}
                    paneIdentifier={paneIdentifier}
                    isLeftMostPane={isLeftMostPane}
                    isRightMostPane={isRightMostPane}
                    isDrawer={isDrawer}
                    areSidePanesDrawers={areSidePanesDrawers}
                    onSetPointerEventsNone={onSetPointerEventsNone}
                    onSetPaneDrawerState={onSetPaneDrawerState}
                    onPopOutTab={onPopOutTab}
                    onRequestPaneClose={onRequestPaneClose}
                    drawerState={drawerState}
                    rightPaneDrawerOpen={rightPaneDrawerOpen}
                  />
                )}
              />
            </LeaderboardProvider>
            {currentProject && (
              <StickyNotes
                ref={stickyNotesRef}
                project={currentProject}
                isManagerShown={isStickyNotesManagerShown}
                onManagerShownChange={setStickyNotesManagerShown}
              />
            )}
          </div>
        </div>
        {currentProject && standalonePrefabSettingsDialog && (
          <PrefabDetailEditor
            key={`prefab-settings-dialog-${
              standalonePrefabSettingsDialog.eventsBasedObject.ptr
            }`}
            dialogOnly
            project={currentProject}
            eventsFunctionsExtension={
              standalonePrefabSettingsDialog.eventsFunctionsExtension
            }
            eventsBasedObject={standalonePrefabSettingsDialog.eventsBasedObject}
            setToolbar={ignoreToolbarUpdate}
            resourceManagementProps={resourceManagementProps}
            openInstructionOrExpression={openInstructionOrExpression}
            openBehaviorEvents={openBehaviorEvents}
            onCreateEventsFunction={onCreateEventsFunction}
            initiallyFocusedFunctionName={null}
            initiallyOpenSettingsDialog
            onPrefabSettingsDialogClose={() =>
              setStandalonePrefabSettingsDialog(null)
            }
            onObjectEdited={onStandaloneSettingsEdited}
            onFunctionEdited={onStandaloneSettingsEdited}
            unsavedChanges={unsavedChanges}
            onOpenCustomObjectEditor={eventsBasedObject => {
              openCustomObjectEditor(
                standalonePrefabSettingsDialog.eventsFunctionsExtension,
                eventsBasedObject,
                ''
              );
            }}
            hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
            onEventsBasedObjectChildrenEdited={
              onEventsBasedObjectChildrenEdited
            }
            onWillInstallExtension={onWillInstallExtension}
            onExtensionInstalled={onExtensionInstalled}
            onEventBasedObjectTypeChanged={onEventBasedObjectTypeChanged}
          />
        )}
        {currentProject && standaloneBehaviorSettingsDialog && (
          <EventsFunctionsExtensionEditor
            key={`behavior-settings-dialog-${
              standaloneBehaviorSettingsDialog.eventsBasedBehavior.ptr
            }`}
            dialogOnly
            project={currentProject}
            eventsFunctionsExtension={
              standaloneBehaviorSettingsDialog.eventsFunctionsExtension
            }
            setToolbar={ignoreToolbarUpdate}
            resourceManagementProps={resourceManagementProps}
            openInstructionOrExpression={openInstructionOrExpression}
            onCreateEventsFunction={onCreateEventsFunction}
            onBehaviorEdited={onStandaloneSettingsEdited}
            onObjectEdited={onStandaloneSettingsEdited}
            onFunctionEdited={onStandaloneSettingsEdited}
            initiallyFocusedFunctionName={null}
            initiallyFocusedBehaviorName={standaloneBehaviorSettingsDialog.eventsBasedBehavior.getName()}
            initiallyFocusedObjectName={null}
            focusedEventsBasedBehavior={
              standaloneBehaviorSettingsDialog.eventsBasedBehavior
            }
            focusedEventsFunction={null}
            initiallyOpenSettingsDialog
            onBehaviorSettingsDialogClose={() =>
              setStandaloneBehaviorSettingsDialog(null)
            }
            unsavedChanges={unsavedChanges}
            onOpenCustomObjectEditor={eventsBasedObject => {
              openCustomObjectEditor(
                standaloneBehaviorSettingsDialog.eventsFunctionsExtension,
                eventsBasedObject,
                ''
              );
            }}
            hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
            onEventsBasedObjectChildrenEdited={
              onEventsBasedObjectChildrenEdited
            }
            onRenamedEventsBasedObject={onRenamedEventsBasedObject}
            onDeletedEventsBasedObject={onDeletedEventsBasedObject}
            onEventBasedObjectTypeChanged={onEventBasedObjectTypeChanged}
            onWillInstallExtension={onWillInstallExtension}
            onExtensionInstalled={onExtensionInstalled}
          />
        )}
        <CommandPalette ref={commandPaletteRef} />
        <RecentEditorSwitcher
          open={recentEditorSwitcherOpen}
          editorTabs={state.editorTabs}
          sideMenuItems={recentEditorSwitcherSideMenuItems}
          actionItems={recentEditorSwitcherActionItems}
          recentNavigationEntryIds={recentNavigationEntryIds}
          recentNavigationEntryUseCounts={recentNavigationEntryUseCounts}
          shortcut={shortcutMap['OPEN_RECENT_EDITOR']}
          onClose={() => setRecentEditorSwitcherOpen(false)}
          onActivate={activateRecentEditorSwitcherEntry}
          onActivateSideMenuItem={activateRecentEditorSwitcherSideMenuItem}
          onActivateActionItem={activateRecentEditorSwitcherActionItem}
        />
      </WindowCommandsProvider>
      <LoaderModal
        showImmediately={showLoaderImmediately}
        showAfterDelay={showLoaderAfterDelay}
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
          project: currentProject,
          onSaveProject: saveProject,
          isSavingProject: isSavingProject,
          fileMetadata: currentFileMetadata,
          storageProvider: getStorageProvider(),
          initialTab: shareDialogInitialTab,
          gamesList,
        })}
      {renderNewResourceDialog({
        project: currentProject,
        fileMetadata: currentFileMetadata,
        getStorageProvider,
        i18n,
        resourceSources,
      })}
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
      {authenticatedUser.claimedProductOptions && (
        // PurchaseClaimDialog is dependent on SubscriptionContext,
        // which is defined after the AuthenticatedUserProvider in Providers.js.
        // So it cannot be rendered inside the AuthenticatedUserProvider.
        <PurchaseClaimDialog
          claimedProductOptions={authenticatedUser.claimedProductOptions}
          onClose={authenticatedUser.onClosePurchaseClaimDialog}
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
      {renderExtensionLoadErrorDialog()}
      <CloseConfirmDialog
        shouldPrompt={!!currentProject}
        i18n={props.i18n}
        language={props.i18n.language}
        hasUnsavedChanges={hasUnsavedChanges}
      />
      {!Window.isRunningCommandFromCli() && <ChangelogDialogContainer />}
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
      {gameHotReloadLogs.length > 0 && (
        <HotReloadLogsDialog
          logs={gameHotReloadLogs}
          onClose={clearGameHotReloadLogs}
          onLaunchNewPreview={() => {
            clearGameHotReloadLogs();
            launchNewPreview();
          }}
        />
      )}
      {(editorHotReloadLogs.length > 0 || editorUncaughtError !== null) && (
        <HotReloadLogsDialog
          isForEditor
          logs={
            editorUncaughtError
              ? [
                  ...editorHotReloadLogs,
                  { kind: 'error', message: editorUncaughtError.message },
                ]
              : editorHotReloadLogs
          }
          onClose={() => {
            clearEditorHotReloadLogs();
            clearEditorUncaughtError();
            setShowRestartInGameEditorAfterErrorButton(true);
          }}
          onLaunchNewPreview={() => {
            clearEditorHotReloadLogs();
            clearEditorUncaughtError();
            onRestartInGameEditor(
              'relaunched-after-uncaught-error-or-hot-reload-error'
            );
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
          project={currentProject}
          wholeProjectDiagnosticReport={currentProject.getWholeProjectDiagnosticReport()}
          onClose={() => setDiagnosticReportDialogOpen(false)}
          onNavigateToLayoutEvent={(layoutName, eventPath) => {
            setPendingEventNavigation({
              name: layoutName,
              locationType: 'layout',
              eventPath,
            });
            openLayout(layoutName, {
              openEventsEditor: true,
              openSceneEditor: false,
              focusWhenOpened: 'events',
            });
          }}
          onNavigateToExternalEventsEvent={(externalEventsName, eventPath) => {
            setPendingEventNavigation({
              name: externalEventsName,
              locationType: 'external-events',
              eventPath,
            });
            openExternalEvents(externalEventsName);
          }}
          onNavigateToExtensionEvent={({
            extensionName,
            functionName,
            behaviorName,
            objectName,
            eventPath,
          }) => {
            setPendingEventNavigation({
              name: extensionName,
              locationType: 'extension',
              eventPath,
              functionName,
              behaviorName,
              objectName,
            });
            openEventsFunctionsExtension(
              extensionName,
              functionName,
              behaviorName,
              objectName
            );
          }}
        />
      )}
      {standaloneDialogOpen && (
        <StandaloneDialog onClose={() => setStandaloneDialogOpen(false)} />
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
          onWillInstallExtension={onWillInstallExtension}
          onExtensionInstalled={onExtensionInstalled}
        />
      )}
      {memoryTrackerRegistryDialogOpen && (
        <MemoryTrackedRegistryDialog
          onClose={() => setMemoryTrackedRegistryDialogOpen(false)}
        />
      )}
      <CustomDragLayer />
    </div>
  );
};

export default MainFrame;
