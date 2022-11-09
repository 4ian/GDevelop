// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import type { ResourceKind } from '../../ResourcesList/ResourceSource';
import { type EditorMosaicNode } from '../../UI/EditorMosaic';
import { type FileMetadataAndStorageProviderName } from '../../ProjectsStorage';
import { type ShortcutMap } from '../../KeyboardShortcuts/DefaultShortcuts';
import { type CommandName } from '../../CommandPalette/CommandsList';
import optionalRequire from '../../Utils/OptionalRequire';
const electron = optionalRequire('electron');

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
  | 'instance-drag-n-drop-explanation'
  | 'objects-panel-explanation'
  | 'instance-properties-panel-explanation'
  | 'layers-panel-explanation'
  | 'instances-panel-explanation'
  | 'physics2-shape-collisions'
  | 'edit-instruction-explanation'
  | 'lifecycle-events-function-included-only-if-extension-used'
  | 'p2p-broker-recommendation'
  | 'command-palette-shortcut'
  | 'asset-installed-explanation'
  | 'extension-installed-explanation'
  | 'project-should-have-unique-package-name';

export type EditorMosaicName =
  | 'scene-editor'
  | 'scene-editor-small'
  | 'debugger'
  | 'resources-editor'
  | 'events-functions-extension-editor';

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
    key: 'instance-drag-n-drop-explanation',
    label: <Trans>Using instance drag'n'drop</Trans>,
  },
  {
    key: 'objects-panel-explanation',
    label: <Trans>Using the objects panel</Trans>,
  },
  {
    key: 'instance-properties-panel-explanation',
    label: <Trans>Using the instance properties panel</Trans>,
  },
  {
    key: 'layers-panel-explanation',
    label: <Trans>Using the layers panel</Trans>,
  },
  {
    key: 'instances-panel-explanation',
    label: <Trans>Using the instances panel</Trans>,
  },
  {
    key: 'physics2-shape-collisions',
    label: <Trans>Collisions handling with the Physics engine</Trans>,
  },
  {
    key: 'edit-instruction-explanation',
    label: <Trans>How to edit instructions</Trans>,
  },
  {
    key: 'lifecycle-events-function-included-only-if-extension-used',
    label: <Trans>Lifecycle functions only included when extension used</Trans>,
  },
  {
    key: 'p2p-broker-recommendation',
    label: <Trans>Peer to peer broker server recommendation</Trans>,
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
  useNewInstructionEditorDialog: boolean,
  useUndefinedVariablesInAutocompletion: boolean,
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
  isMenuBarHiddenInPreview: boolean,
  isAlwaysOnTopInPreview: boolean,
  backdropClickBehavior: 'nothing' | 'apply' | 'cancel',
  eventsSheetCancelInlineParameter: 'cancel' | 'apply',
  showCommunityExtensions: boolean,
  showGetStartedSection: boolean,
  showEventBasedObjectsEditor: boolean,
  inAppTutorialsProgress: {
    [tutorialId: string]: {
      [userId: string]: {|
        step: number,
        /** Rounded progress in percentage */
        progress: number,
        fileMetadataAndStorageProviderName?: FileMetadataAndStorageProviderName,
      |},
    },
  },
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
  setUseNewInstructionEditorDialog: (enabled: boolean) => void,
  setUseUndefinedVariablesInAutocompletion: (enabled: boolean) => void,
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
  getIsMenuBarHiddenInPreview: () => boolean,
  setIsMenuBarHiddenInPreview: (enabled: boolean) => void,
  setBackdropClickBehavior: (value: string) => void,
  getIsAlwaysOnTopInPreview: () => boolean,
  setIsAlwaysOnTopInPreview: (enabled: boolean) => void,
  setEventsSheetCancelInlineParameter: (value: string) => void,
  setShowCommunityExtensions: (enabled: boolean) => void,
  setShowGetStartedSection: (enabled: boolean) => void,
  setShowEventBasedObjectsEditor: (enabled: boolean) => void,
  getShowEventBasedObjectsEditor: () => boolean,
  saveTutorialProgress: ({|
    tutorialId: string,
    userId: ?string,
    step: number,
    progress: number,
    fileMetadataAndStorageProviderName?: FileMetadataAndStorageProviderName,
  |}) => void,
  getTutorialProgress: ({|
    tutorialId: string,
    userId: ?string,
  |}) => ?{|
    step: number,
    progress: number,
    fileMetadataAndStorageProviderName?: FileMetadataAndStorageProviderName,
  |},
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
    useNewInstructionEditorDialog: true,
    useUndefinedVariablesInAutocompletion: true,
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
    isMenuBarHiddenInPreview: true,
    isAlwaysOnTopInPreview: false,
    backdropClickBehavior: 'nothing',
    eventsSheetCancelInlineParameter: 'apply',
    showCommunityExtensions: false,
    showGetStartedSection: true,
    showEventBasedObjectsEditor: false,
    inAppTutorialsProgress: {},
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
  setUseNewInstructionEditorDialog: (enabled: boolean) => {},
  setUseUndefinedVariablesInAutocompletion: (enabled: boolean) => {},
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
  getIsMenuBarHiddenInPreview: () => true,
  setIsMenuBarHiddenInPreview: () => {},
  setBackdropClickBehavior: () => {},
  getIsAlwaysOnTopInPreview: () => true,
  setIsAlwaysOnTopInPreview: () => {},
  setEventsSheetCancelInlineParameter: () => {},
  setShowCommunityExtensions: () => {},
  setShowGetStartedSection: (enabled: boolean) => {},
  setShowEventBasedObjectsEditor: (enabled: boolean) => {},
  getShowEventBasedObjectsEditor: () => false,
  saveTutorialProgress: () => {},
  getTutorialProgress: () => {},
};

const PreferencesContext = React.createContext<Preferences>(initialPreferences);

export default PreferencesContext;
