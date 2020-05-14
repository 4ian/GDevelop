// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import type { ResourceKind } from '../../ResourcesList/ResourceSource.flow';
import { type EditorMosaicNode } from '../../UI/EditorMosaic';

export type AlertMessageIdentifier =
  | 'use-non-smoothed-textures'
  | 'use-nearest-scale-mode'
  | 'maximum-fps-too-low'
  | 'minimum-fps-too-low'
  | 'function-extractor-explanation'
  | 'events-based-behavior-explanation'
  | 'empty-events-based-behavior-explanation'
  | 'too-much-effects'
  | 'effects-usage'
  | 'resource-properties-panel-explanation'
  | 'instance-drag-n-drop-explanation'
  | 'objects-panel-explanation'
  | 'instance-properties-panel-explanation'
  | 'layers-panel-explanation'
  | 'instances-panel-explanation'
  | 'physics2-shape-collisions'
  | 'edit-instruction-explanation'
  | 'lifecycle-events-function-included-only-if-extension-used';

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
    key: 'too-much-effects',
    label: <Trans>Using too much effects</Trans>,
  },
  {
    key: 'effects-usage',
    label: <Trans>Using effects</Trans>,
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
  autoDisplayChangelog: boolean,
  lastLaunchedVersion: ?string,
  eventsSheetShowObjectThumbnails: boolean,
  autosaveOnPreview: boolean,
  useNewInstructionEditorDialog: boolean,
  useGDJSDevelopmentWatcher: boolean,
  eventsSheetUseAssignmentOperators: boolean,
  showEffectParameterNames: boolean,
  projectLastUsedPaths: { [string]: { [ResourceKind]: string } },
  defaultEditorMosaicNodes: { [EditorMosaicName]: ?EditorMosaicNode },
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
  verifyIfIsNewVersion: () => boolean,
  setEventsSheetShowObjectThumbnails: (enabled: boolean) => void,
  setAutosaveOnPreview: (enabled: boolean) => void,
  setUseNewInstructionEditorDialog: (enabled: boolean) => void,
  setUseGDJSDevelopmentWatcher: (enabled: boolean) => void,
  setEventsSheetUseAssignmentOperators: (enabled: boolean) => void,
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
|};

export const initialPreferences = {
  values: {
    language: 'en',
    autoDownloadUpdates: true,
    themeName: 'GDevelop default',
    codeEditorThemeName: 'vs-dark',
    hiddenAlertMessages: {},
    autoDisplayChangelog: true,
    lastLaunchedVersion: undefined,
    eventsSheetShowObjectThumbnails: true,
    autosaveOnPreview: true,
    useNewInstructionEditorDialog: true,
    useGDJSDevelopmentWatcher: true,
    eventsSheetUseAssignmentOperators: false,
    showEffectParameterNames: false,
    projectLastUsedPaths: {},
    defaultEditorMosaicNodes: {},
  },
  setLanguage: () => {},
  setThemeName: () => {},
  setCodeEditorThemeName: () => {},
  setAutoDownloadUpdates: () => {},
  checkUpdates: () => {},
  setAutoDisplayChangelog: () => {},
  showAlertMessage: (identifier: AlertMessageIdentifier, show: boolean) => {},
  verifyIfIsNewVersion: () => false,
  setEventsSheetShowObjectThumbnails: () => {},
  setAutosaveOnPreview: () => {},
  setUseNewInstructionEditorDialog: (enabled: boolean) => {},
  setUseGDJSDevelopmentWatcher: (enabled: boolean) => {},
  setEventsSheetUseAssignmentOperators: (enabled: boolean) => {},
  setShowEffectParameterNames: (enabled: boolean) => {},
  getLastUsedPath: (project: gdProject, kind: ResourceKind) => '',
  setLastUsedPath: (project: gdProject, kind: ResourceKind, path: string) => {},
  getDefaultEditorMosaicNode: (name: EditorMosaicName) => null,
  setDefaultEditorMosaicNode: (
    name: EditorMosaicName,
    node: ?EditorMosaicNode
  ) => {},
};

const PreferencesContext = React.createContext<Preferences>(initialPreferences);

export default PreferencesContext;
