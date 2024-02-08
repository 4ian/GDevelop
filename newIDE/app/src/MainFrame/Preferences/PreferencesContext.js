// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import type {
  ResourceKind,
  ResourceImportationBehavior,
} from '../../ResourcesList/ResourceSource';
import { type EditorMosaicNode } from '../../UI/EditorMosaic';
import { type FileMetadataAndStorageProviderName } from '../../ProjectsStorage';
import { type ShortcutMap } from '../../KeyboardShortcuts/DefaultShortcuts';
import { type CommandName } from '../../CommandPalette/CommandsList';
import { type EditorTabsPersistedState } from '../EditorTabs/EditorTabsHandler';
import optionalRequire from '../../Utils/OptionalRequire';
import { findDefaultFolder } from '../../ProjectsStorage/LocalFileStorageProvider/LocalPathFinder';
import { isWebGLSupported } from '../../Utils/WebGL';

const electron = optionalRequire('electron');
const remote = optionalRequire('@electron/remote');
const app = remote ? remote.app : null;

export type AlertMessageIdentifier =
  | 'default-additional-work'
  | 'automatic-lighting-layer'
  | 'object-moved-in-lighting-layer'
  | 'use-non-smoothed-textures'
  | 'use-pixel-rounding'
  | 'use-nearest-scale-mode'
  | 'maximum-fps-too-low'
  | 'minimum-fps-too-low'
  | 'function-extractor-explanation'
  | 'events-based-behavior-explanation'
  | 'empty-events-based-behavior-explanation'
  | 'events-based-object-explanation'
  | 'empty-events-based-object-explanation'
  | 'too-much-effects'
  | 'effects-usage'
  | 'lighting-layer-usage'
  | 'resource-properties-panel-explanation'
  | 'physics2-shape-collisions'
  | 'lifecycle-events-function-included-only-if-extension-used'
  | 'p2p-is-networking'
  | 'p2p-dataloss'
  | 'command-palette-shortcut'
  | 'asset-installed-explanation'
  | 'extension-installed-explanation'
  | 'project-should-have-unique-package-name'
  | 'new-generate-project-from-prompt';

export type EditorMosaicName =
  | 'scene-editor'
  | 'scene-editor-small'
  | 'debugger'
  | 'resources-editor'
  | 'events-functions-extension-editor';

export type InAppTutorialUserProgress = {|
  step: number,
  /** Rounded progress in percentage */
  progress: Array<number>,
  fileMetadataAndStorageProviderName?: FileMetadataAndStorageProviderName,
  projectData: {| [key: string]: string |},
|};

export type InAppTutorialProgressDatabase = {
  [tutorialId: string]: {
    [userId: string]: InAppTutorialUserProgress,
  },
};

export const allAlertMessages: Array<{
  key: AlertMessageIdentifier,
  label: React.Node,
}> = [
  {
    key: 'use-non-smoothed-textures',
    label: <Trans>Using non smoothed textures</Trans>,
  },
  {
    key: 'use-pixel-rounding',
    label: <Trans>Using pixel rounding</Trans>,
  },
  {
    key: 'use-nearest-scale-mode',
    label: <Trans>Using Nearest Scale Mode</Trans>,
  },
  {
    key: 'maximum-fps-too-low',
    label: <Trans>Maximum Fps is too low</Trans>,
  },
  {
    key: 'minimum-fps-too-low',
    label: <Trans>Minimum Fps is too low</Trans>,
  },
  {
    key: 'function-extractor-explanation',
    label: <Trans>Using function extractor</Trans>,
  },
  {
    key: 'events-based-behavior-explanation',
    label: <Trans>Using events based behavior</Trans>,
  },
  {
    key: 'empty-events-based-behavior-explanation',
    label: <Trans>Using empty events based behavior</Trans>,
  },
  {
    key: 'events-based-object-explanation',
    label: <Trans>Using events based object</Trans>,
  },
  {
    key: 'empty-events-based-object-explanation',
    label: <Trans>Using empty events based object</Trans>,
  },
  {
    key: 'too-much-effects',
    label: <Trans>Using too much effects</Trans>,
  },
  {
    key: 'effects-usage',
    label: <Trans>Using effects</Trans>,
  },
  {
    key: 'lighting-layer-usage',
    label: <Trans>Using lighting layer</Trans>,
  },
  {
    key: 'automatic-lighting-layer',
    label: <Trans>Automatic creation of lighting layer</Trans>,
  },
  {
    key: 'object-moved-in-lighting-layer',
    label: <Trans>Light object automatically put in lighting layer</Trans>,
  },
  {
    key: 'resource-properties-panel-explanation',
    label: <Trans>Using the resource properties panel</Trans>,
  },
  {
    key: 'physics2-shape-collisions',
    label: <Trans>Collisions handling with the Physics engine</Trans>,
  },
  {
    key: 'lifecycle-events-function-included-only-if-extension-used',
    label: <Trans>Lifecycle functions only included when extension used</Trans>,
  },
  {
    key: 'p2p-is-networking',
    label: (
      <Trans>Peer to peer IP address leak warning/THNK recommendation</Trans>
    ),
  },
  {
    key: 'p2p-dataloss',
    label: <Trans>Peer to peer data-loss notice</Trans>,
  },
  {
    key: 'command-palette-shortcut',
    label: <Trans>Command palette keyboard shortcut</Trans>,
  },
  {
    key: 'asset-installed-explanation',
    label: (
      <Trans>Explanation after an object is installed from the store</Trans>
    ),
  },
  {
    key: 'project-should-have-unique-package-name',
    label: (
      <Trans>Project package names should not begin with com.example</Trans>
    ),
  },
  {
    key: 'new-generate-project-from-prompt',
    label: <Trans>New project generation from prompt warning</Trans>,
  },
];

/**
 * All the preferences of GDevelop. To add a new preference, add it into this
 * type and add a setter into `Preferences` type. Then, update the
 * preference dialog.
 */
export type PreferencesValues = {|
  language: string,
  autoDownloadUpdates: boolean,
  themeName: string,
  codeEditorThemeName: string,
  hiddenAlertMessages: { [AlertMessageIdentifier]: boolean },
  hiddenTutorialHints: { [string]: boolean },
  hiddenAnnouncements: { [string]: boolean },
  autoDisplayChangelog: boolean,
  lastLaunchedVersion: ?string,
  eventsSheetShowObjectThumbnails: boolean,
  autosaveOnPreview: boolean,
  useGDJSDevelopmentWatcher: boolean,
  eventsSheetUseAssignmentOperators: boolean,
  eventsSheetZoomLevel: number,
  showEffectParameterNames: boolean,
  projectLastUsedPaths: { [string]: { [ResourceKind]: string } },
  defaultEditorMosaicNodes: { [EditorMosaicName]: ?EditorMosaicNode },
  recentProjectFiles: Array<FileMetadataAndStorageProviderName>,
  autoOpenMostRecentProject: boolean,
  hasProjectOpened: boolean,
  userShortcutMap: ShortcutMap,
  newObjectDialogDefaultTab: 'asset-store' | 'new-object',
  shareDialogDefaultTab: 'invite' | 'publish',
  isMenuBarHiddenInPreview: boolean,
  isAlwaysOnTopInPreview: boolean,
  backdropClickBehavior: 'nothing' | 'apply' | 'cancel',
  resourcesImporationBehavior: ResourceImportationBehavior,
  eventsSheetCancelInlineParameter: 'cancel' | 'apply',
  showCommunityExtensions: boolean,
  showGetStartedSectionByDefault: boolean,
  showEventBasedObjectsEditor: boolean,
  showDeprecatedInstructionWarning: boolean,
  use3DEditor: boolean,
  inAppTutorialsProgress: InAppTutorialProgressDatabase,
  newProjectsDefaultFolder: string,
  newProjectsDefaultStorageProviderName: string,
  useShortcutToClosePreviewWindow: boolean,
  watchProjectFolderFilesForLocalProjects: boolean,
  newFeaturesAcknowledgements: {
    [featureId: string]: {| dates: [number] |},
  },
  editorStateByProject: { [string]: { editorTabs: EditorTabsPersistedState } },
|};

/**
 * Type containing all the preferences of GDevelop and their setters.
 */
export type Preferences = {|
  values: PreferencesValues,
  setLanguage: (language: string) => void,
  setThemeName: (themeName: string) => void,
  setCodeEditorThemeName: (codeEditorThemeName: string) => void,
  setAutoDownloadUpdates: (enabled: boolean) => void,
  checkUpdates: (forceDownload?: boolean) => void,
  setAutoDisplayChangelog: (enabled: boolean) => void,
  showAlertMessage: (identifier: AlertMessageIdentifier, show: boolean) => void,
  showAllAlertMessages: () => void,
  showTutorialHint: (identifier: string, show: boolean) => void,
  showAllTutorialHints: () => void,
  showAnnouncement: (identifier: string, show: boolean) => void,
  showAllAnnouncements: () => void,
  verifyIfIsNewVersion: () => boolean,
  setEventsSheetShowObjectThumbnails: (enabled: boolean) => void,
  setAutosaveOnPreview: (enabled: boolean) => void,
  setUseGDJSDevelopmentWatcher: (enabled: boolean) => void,
  setEventsSheetUseAssignmentOperators: (enabled: boolean) => void,
  setEventsSheetZoomLevel: (zoomLevel: number) => void,
  setShowEffectParameterNames: (enabled: boolean) => void,
  getLastUsedPath: (project: gdProject, kind: ResourceKind) => string,
  setLastUsedPath: (
    project: gdProject,
    kind: ResourceKind,
    path: string
  ) => void,
  getDefaultEditorMosaicNode: (name: EditorMosaicName) => ?EditorMosaicNode,
  setDefaultEditorMosaicNode: (
    name: EditorMosaicName,
    node: ?EditorMosaicNode
  ) => void,
  getRecentProjectFiles: () => Array<FileMetadataAndStorageProviderName>,
  insertRecentProjectFile: (
    fileMetadata: FileMetadataAndStorageProviderName
  ) => void,
  removeRecentProjectFile: (
    fileMetadata: FileMetadataAndStorageProviderName
  ) => void,
  getAutoOpenMostRecentProject: () => boolean,
  setAutoOpenMostRecentProject: (enabled: boolean) => void,
  hadProjectOpenedDuringLastSession: () => boolean,
  setHasProjectOpened: (enabled: boolean) => void,
  resetShortcutsToDefault: () => void,
  setShortcutForCommand: (commandName: CommandName, shortcut: string) => void,
  getNewObjectDialogDefaultTab: () => 'asset-store' | 'new-object',
  setNewObjectDialogDefaultTab: ('asset-store' | 'new-object') => void,
  getShareDialogDefaultTab: () => 'invite' | 'publish',
  setShareDialogDefaultTab: ('invite' | 'publish') => void,
  getIsMenuBarHiddenInPreview: () => boolean,
  setIsMenuBarHiddenInPreview: (enabled: boolean) => void,
  setBackdropClickBehavior: (value: string) => void,
  setResourcesImporationBehavior: (value: string) => void,
  getIsAlwaysOnTopInPreview: () => boolean,
  setIsAlwaysOnTopInPreview: (enabled: boolean) => void,
  setEventsSheetCancelInlineParameter: (value: string) => void,
  setShowCommunityExtensions: (enabled: boolean) => void,
  setShowGetStartedSectionByDefault: (enabled: boolean) => void,
  setShowEventBasedObjectsEditor: (enabled: boolean) => void,
  getShowEventBasedObjectsEditor: () => boolean,
  setShowDeprecatedInstructionWarning: (enabled: boolean) => void,
  getShowDeprecatedInstructionWarning: () => boolean,
  setUse3DEditor: (enabled: boolean) => void,
  getUse3DEditor: () => boolean,
  setNewProjectsDefaultStorageProviderName: (name: string) => void,
  saveTutorialProgress: ({|
    tutorialId: string,
    userId: ?string,
    ...InAppTutorialUserProgress,
  |}) => void,
  getTutorialProgress: ({|
    tutorialId: string,
    userId: ?string,
  |}) => ?InAppTutorialUserProgress,
  setNewProjectsDefaultFolder: (newProjectsDefaultFolder: string) => void,
  setUseShortcutToClosePreviewWindow: (enabled: boolean) => void,
  setWatchProjectFolderFilesForLocalProjects: (enabled: boolean) => void,
  setNewFeaturesAcknowledgements: ({
    [featureId: string]: {| dates: [number] |},
  }) => void,
  getEditorStateForProject: (
    projectId: string
  ) => ?{| editorTabs: EditorTabsPersistedState |},
  setEditorStateForProject: (
    projectId: string,
    editorState?: {| editorTabs: EditorTabsPersistedState |}
  ) => void,
|};

export const initialPreferences = {
  values: {
    language: 'en',
    autoDownloadUpdates: true,
    themeName:
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'GDevelop default Dark'
        : // TODO: Use the light theme back when it's adapted to the modern theme.
          'GDevelop default Dark',
    codeEditorThemeName: 'vs-dark',
    hiddenAlertMessages: {},
    hiddenTutorialHints: {},
    hiddenAnnouncements: {},
    autoDisplayChangelog: true,
    lastLaunchedVersion: undefined,
    eventsSheetShowObjectThumbnails: true,
    autosaveOnPreview: true,
    useGDJSDevelopmentWatcher: true,
    eventsSheetUseAssignmentOperators: false,
    eventsSheetZoomLevel: 14,
    showEffectParameterNames: false,
    projectLastUsedPaths: {},
    defaultEditorMosaicNodes: {},
    recentProjectFiles: [],
    autoOpenMostRecentProject: true,
    hasProjectOpened: false,
    userShortcutMap: {},
    newObjectDialogDefaultTab: electron ? 'new-object' : 'asset-store',
    shareDialogDefaultTab: 'publish',
    isMenuBarHiddenInPreview: true,
    isAlwaysOnTopInPreview: false,
    backdropClickBehavior: 'nothing',
    resourcesImporationBehavior: 'ask',
    eventsSheetCancelInlineParameter: 'apply',
    showCommunityExtensions: false,
    showGetStartedSectionByDefault: true,
    showEventBasedObjectsEditor: false,
    showDeprecatedInstructionWarning: false,
    use3DEditor: isWebGLSupported(),
    inAppTutorialsProgress: {},
    newProjectsDefaultFolder: app ? findDefaultFolder(app) : '',
    newProjectsDefaultStorageProviderName: 'Cloud',
    useShortcutToClosePreviewWindow: true,
    watchProjectFolderFilesForLocalProjects: true,
    newFeaturesAcknowledgements: {},
    editorStateByProject: {},
  },
  setLanguage: () => {},
  setThemeName: () => {},
  setCodeEditorThemeName: () => {},
  setAutoDownloadUpdates: () => {},
  checkUpdates: () => {},
  setAutoDisplayChangelog: () => {},
  showAlertMessage: (identifier: AlertMessageIdentifier, show: boolean) => {},
  showAllAlertMessages: () => {},
  showTutorialHint: (identifier: string, show: boolean) => {},
  showAllTutorialHints: () => {},
  showAnnouncement: (identifier: string, show: boolean) => {},
  showAllAnnouncements: () => {},
  verifyIfIsNewVersion: () => false,
  setEventsSheetShowObjectThumbnails: () => {},
  setAutosaveOnPreview: () => {},
  setUseGDJSDevelopmentWatcher: (enabled: boolean) => {},
  setEventsSheetUseAssignmentOperators: (enabled: boolean) => {},
  setEventsSheetZoomLevel: (zoomLevel: number) => {},
  setShowEffectParameterNames: (enabled: boolean) => {},
  getLastUsedPath: (project: gdProject, kind: ResourceKind) => '',
  setLastUsedPath: (project: gdProject, kind: ResourceKind, path: string) => {},
  getDefaultEditorMosaicNode: (name: EditorMosaicName) => null,
  setDefaultEditorMosaicNode: (
    name: EditorMosaicName,
    node: ?EditorMosaicNode
  ) => {},
  getRecentProjectFiles: () => [],
  insertRecentProjectFile: () => {},
  removeRecentProjectFile: () => {},
  getAutoOpenMostRecentProject: () => true,
  setAutoOpenMostRecentProject: () => {},
  hadProjectOpenedDuringLastSession: () => false,
  setHasProjectOpened: () => {},
  resetShortcutsToDefault: () => {},
  setShortcutForCommand: (commandName: CommandName, shortcut: string) => {},
  getNewObjectDialogDefaultTab: () => 'asset-store',
  setNewObjectDialogDefaultTab: () => {},
  getShareDialogDefaultTab: () => 'invite',
  setShareDialogDefaultTab: () => {},
  getIsMenuBarHiddenInPreview: () => true,
  setIsMenuBarHiddenInPreview: () => {},
  setBackdropClickBehavior: () => {},
  setResourcesImporationBehavior: () => {},
  getIsAlwaysOnTopInPreview: () => true,
  setIsAlwaysOnTopInPreview: () => {},
  setEventsSheetCancelInlineParameter: () => {},
  setShowCommunityExtensions: () => {},
  setShowGetStartedSectionByDefault: (enabled: boolean) => {},
  setShowEventBasedObjectsEditor: (enabled: boolean) => {},
  getShowEventBasedObjectsEditor: () => false,
  setShowDeprecatedInstructionWarning: (enabled: boolean) => {},
  getShowDeprecatedInstructionWarning: () => false,
  setUse3DEditor: (enabled: boolean) => {},
  getUse3DEditor: () => false,
  saveTutorialProgress: () => {},
  getTutorialProgress: () => {},
  setNewProjectsDefaultFolder: () => {},
  setNewProjectsDefaultStorageProviderName: () => {},
  setUseShortcutToClosePreviewWindow: () => {},
  setWatchProjectFolderFilesForLocalProjects: () => {},
  setNewFeaturesAcknowledgements: () => {},
  getEditorStateForProject: projectId => {},
  setEditorStateForProject: (projectId, editorState) => {},
};

const PreferencesContext = React.createContext<Preferences>(initialPreferences);

export default PreferencesContext;
