// @flow

import * as React from 'react';
import PreferencesContext, {
  initialPreferences,
  type Preferences,
  type AlertMessageIdentifier,
} from './PreferencesContext';
import optionalRequire from '../../Utils/OptionalRequire';
import { getIDEVersion } from '../../Version';
import {
  type PreferencesValues,
  type EditorMosaicName,
} from './PreferencesContext';
import type { ResourceKind } from '../../ResourcesList/ResourceSource.flow';
import { type EditorMosaicNode } from '../../UI/EditorMosaic';
import { type FileMetadataAndStorageProviderName } from '../../ProjectsStorage';
import defaultShortcuts from '../../KeyboardShortcuts/DefaultShortcuts';
import { type CommandName } from '../../CommandPalette/CommandsList';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

type Props = {|
  children: React.Node,
  disableCheckForUpdates: boolean,
|};

type State = Preferences;

const LocalStorageItem = 'gd-preferences';
const MAX_RECENT_FILES_COUNT = 20;

export default class PreferencesProvider extends React.Component<Props, State> {
  state = {
    values: this._loadValuesFromLocalStorage() || initialPreferences.values,
    setLanguage: this._setLanguage.bind(this),
    setThemeName: this._setThemeName.bind(this),
    setCodeEditorThemeName: this._setCodeEditorThemeName.bind(this),
    setAutoDownloadUpdates: this._setAutoDownloadUpdates.bind(this),
    checkUpdates: this._checkUpdates.bind(this),
    setAutoDisplayChangelog: this._setAutoDisplayChangelog.bind(this),
    showAlertMessage: this._showAlertMessage.bind(this),
    showTutorialHint: this._showTutorialHint.bind(this),
    verifyIfIsNewVersion: this._verifyIfIsNewVersion.bind(this),
    setEventsSheetShowObjectThumbnails: this._setEventsSheetShowObjectThumbnails.bind(
      this
    ),
    setAutosaveOnPreview: this._setAutosaveOnPreview.bind(this),
    setUseNewInstructionEditorDialog: this._setUseNewInstructionEditorDialog.bind(
      this
    ),
    setUseUndefinedVariablesInAutocompletion: this._setUseUndefinedVariablesInAutocompletion.bind(
      this
    ),
    setUseGDJSDevelopmentWatcher: this._setUseGDJSDevelopmentWatcher.bind(this),
    setEventsSheetUseAssignmentOperators: this._setEventsSheetUseAssignmentOperators.bind(
      this
    ),
    setShowEffectParameterNames: this._setShowEffectParameterNames.bind(this),
    getLastUsedPath: this._getLastUsedPath.bind(this),
    setLastUsedPath: this._setLastUsedPath.bind(this),
    getDefaultEditorMosaicNode: this._getDefaultEditorMosaicNode.bind(this),
    setDefaultEditorMosaicNode: this._setDefaultEditorMosaicNode.bind(this),
    getRecentProjectFiles: this._getRecentProjectFiles.bind(this),
    insertRecentProjectFile: this._insertRecentProjectFile.bind(this),
    removeRecentProjectFile: this._removeRecentProjectFile.bind(this),
    getAutoOpenMostRecentProject: this._getAutoOpenMostRecentProject.bind(this),
    setAutoOpenMostRecentProject: this._setAutoOpenMostRecentProject.bind(this),
    hadProjectOpenedDuringLastSession: this._hadProjectOpenedDuringLastSession.bind(
      this
    ),
    setHasProjectOpened: this._setHasProjectOpened.bind(this),
    setShortcutForCommand: this._setShortcutForCommand.bind(this),
    resetShortcutsToDefault: this._resetShortcutsToDefault.bind(this),
    getNewObjectDialogDefaultTab: this._getNewObjectDialogDefaultTab.bind(this),
    setNewObjectDialogDefaultTab: this._setNewObjectDialogDefaultTab.bind(this),
    getIsMenuBarHiddenInPreview: this._getIsMenuBarHiddenInPreview.bind(this),
    setIsMenuBarHiddenInPreview: this._setIsMenuBarHiddenInPreview.bind(this),
    setBackdropClickBehavior: this._setBackdropClickBehavior.bind(this),
    getIsAlwaysOnTopInPreview: this._getIsAlwaysOnTopInPreview.bind(this),
    setIsAlwaysOnTopInPreview: this._setIsAlwaysOnTopInPreview.bind(this),
    setEventsSheetCancelInlineParameter: this._setEventsSheetCancelInlineParameter.bind(
      this
    ),
  };

  componentDidMount() {
    setTimeout(() => this._checkUpdates(), 10000);
  }

  _setLanguage(language: string) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          language,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setEventsSheetShowObjectThumbnails(
    eventsSheetShowObjectThumbnails: boolean
  ) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          eventsSheetShowObjectThumbnails,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setAutosaveOnPreview(autosaveOnPreview: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          autosaveOnPreview,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setUseNewInstructionEditorDialog(useNewInstructionEditorDialog: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          useNewInstructionEditorDialog,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setUseUndefinedVariablesInAutocompletion(
    useUndefinedVariablesInAutocompletion: boolean
  ) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          useUndefinedVariablesInAutocompletion,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setUseGDJSDevelopmentWatcher(useGDJSDevelopmentWatcher: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          useGDJSDevelopmentWatcher,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setEventsSheetUseAssignmentOperators(
    eventsSheetUseAssignmentOperators: boolean
  ) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          eventsSheetUseAssignmentOperators,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setShowEffectParameterNames(showEffectParameterNames: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          showEffectParameterNames,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setThemeName(themeName: string) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          themeName,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setCodeEditorThemeName(codeEditorThemeName: string) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          codeEditorThemeName,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setAutoDownloadUpdates(autoDownloadUpdates: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          autoDownloadUpdates,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setAutoDisplayChangelog(autoDisplayChangelog: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          autoDisplayChangelog,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setEventsSheetCancelInlineParameter(
    eventsSheetCancelInlineParameter: 'apply' | 'cancel'
  ) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          eventsSheetCancelInlineParameter,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _checkUpdates(forceDownload?: boolean) {
    // Checking for updates is only done on Electron.
    // Note: This could be abstracted away later if other updates mechanisms
    // should be supported.
    const { disableCheckForUpdates } = this.props;
    if (!ipcRenderer || disableCheckForUpdates) return;

    if (!!forceDownload || this.state.values.autoDownloadUpdates) {
      ipcRenderer.send('updates-check-and-download');
    } else {
      ipcRenderer.send('updates-check');
    }
  }

  _verifyIfIsNewVersion() {
    const currentVersion = getIDEVersion();
    const { lastLaunchedVersion } = this.state.values;
    if (lastLaunchedVersion === currentVersion) {
      // This is not a new version
      return false;
    }

    // This is a new version: store the version number
    this.setState(
      state => ({
        values: {
          ...state.values,
          lastLaunchedVersion: currentVersion,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );

    if (lastLaunchedVersion === undefined) {
      // This is the first time GDevelop is launched, don't
      // warn about this version being new.
      return false;
    }

    return true;
  }

  _showAlertMessage(identifier: AlertMessageIdentifier, show: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          hiddenAlertMessages: {
            ...state.values.hiddenAlertMessages,
            // $FlowFixMe - Flow won't typecheck this because of https://medium.com/flow-type/spreads-common-errors-fixes-9701012e9d58
            [identifier]: !show,
          },
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _showTutorialHint(identifier: string, show: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          hiddenTutorialHints: {
            ...state.values.hiddenTutorialHints,
            [identifier]: !show,
          },
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _loadValuesFromLocalStorage(): ?PreferencesValues {
    try {
      const persistedState = localStorage.getItem(LocalStorageItem);
      if (!persistedState) return null;

      const values = JSON.parse(persistedState);

      // "Migrate" non existing properties to their default values
      // (useful when upgrading the preferences to a new version where
      // a new preference was added).
      for (const key in initialPreferences.values) {
        if (
          initialPreferences.values.hasOwnProperty(key) &&
          typeof values[key] === 'undefined'
        ) {
          values[key] = initialPreferences.values[key];
        }
      }

      return values;
    } catch (e) {
      return null;
    }
  }

  _persistValuesToLocalStorage(preferences: Preferences) {
    try {
      localStorage.setItem(
        LocalStorageItem,
        JSON.stringify(preferences.values)
      );
    } catch (e) {
      console.warn('Unable to persist preferences', e);
    }

    return preferences;
  }

  _getLastUsedPath(project: gdProject, kind: ResourceKind) {
    const projectPath = project.getProjectFile();
    const { values } = this.state;
    const projectPaths = values.projectLastUsedPaths[projectPath];
    if (projectPaths && projectPaths[kind]) {
      return projectPaths[kind];
    }
    if (!projectPath) return null;
  }

  _setLastUsedPath(project: gdProject, kind: ResourceKind, latestPath: string) {
    const projectPath = project.getProjectFile();

    const { values } = this.state;
    const newProjectLastUsedPaths =
      values.projectLastUsedPaths[projectPath] || {};
    newProjectLastUsedPaths[kind] = latestPath;

    this.setState(
      {
        values: {
          ...values,
          projectLastUsedPaths: {
            ...values.projectLastUsedPaths,
            [projectPath]: newProjectLastUsedPaths,
          },
        },
      },
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _getDefaultEditorMosaicNode(name: EditorMosaicName) {
    return this.state.values.defaultEditorMosaicNodes[name] || null;
  }

  _setDefaultEditorMosaicNode(name: EditorMosaicName, node: ?EditorMosaicNode) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          defaultEditorMosaicNodes: {
            ...state.values.defaultEditorMosaicNodes,
            // $FlowFixMe - Flow errors on unions in computed properties
            [name]: node,
          },
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _getRecentProjectFiles() {
    return this.state.values.recentProjectFiles;
  }

  _setRecentProjectFiles(recents: Array<FileMetadataAndStorageProviderName>) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          recentProjectFiles: recents,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _insertRecentProjectFile(newRecentFile: FileMetadataAndStorageProviderName) {
    let recentProjectFiles = this._getRecentProjectFiles();
    const isNotNewRecentFile = recentFile =>
      JSON.stringify(recentFile) !== JSON.stringify(newRecentFile);
    this._setRecentProjectFiles(
      [newRecentFile, ...recentProjectFiles.filter(isNotNewRecentFile)].slice(
        0,
        MAX_RECENT_FILES_COUNT
      )
    );
  }

  _removeRecentProjectFile(recentFile: FileMetadataAndStorageProviderName) {
    const isNotSadPathRecentFile = recentFileItem =>
      JSON.stringify(recentFileItem) !== JSON.stringify(recentFile);
    this._setRecentProjectFiles(
      [...this._getRecentProjectFiles().filter(isNotSadPathRecentFile)].slice(
        0,
        MAX_RECENT_FILES_COUNT
      )
    );
  }

  _getAutoOpenMostRecentProject() {
    return this.state.values.autoOpenMostRecentProject;
  }

  _setAutoOpenMostRecentProject(enabled: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          autoOpenMostRecentProject: enabled,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _hadProjectOpenedDuringLastSession() {
    return this.state.values.hasProjectOpened;
  }

  _setHasProjectOpened(enabled: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          hasProjectOpened: enabled,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _resetShortcutsToDefault() {
    this.setState(
      state => ({
        values: { ...state.values, userShortcutMap: {} },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setShortcutForCommand(commandName: CommandName, shortcutString: string) {
    const defaultShortcut = defaultShortcuts[commandName] || '';
    const setToDefault = defaultShortcut === shortcutString;

    const updatedShortcutMap = { ...this.state.values.userShortcutMap };
    if (setToDefault) delete updatedShortcutMap[commandName];
    else updatedShortcutMap[commandName] = shortcutString;

    this.setState(
      state => ({
        values: { ...state.values, userShortcutMap: updatedShortcutMap },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _getNewObjectDialogDefaultTab() {
    return this.state.values.newObjectDialogDefaultTab;
  }

  _setNewObjectDialogDefaultTab(
    newObjectDialogDefaultTab: 'asset-store' | 'new-object'
  ) {
    this.setState(
      state => ({
        values: { ...state.values, newObjectDialogDefaultTab },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _getIsMenuBarHiddenInPreview() {
    return this.state.values.isMenuBarHiddenInPreview;
  }

  _setIsMenuBarHiddenInPreview(enabled: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          isMenuBarHiddenInPreview: enabled,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setBackdropClickBehavior(
    backdropClickBehavior: 'nothing' | 'apply' | 'cancel'
  ) {
    this.setState(
      state => ({
        values: { ...state.values, backdropClickBehavior },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _getIsAlwaysOnTopInPreview() {
    return this.state.values.isAlwaysOnTopInPreview;
  }

  _setIsAlwaysOnTopInPreview(enabled: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          isAlwaysOnTopInPreview: enabled,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  render() {
    return (
      <PreferencesContext.Provider value={this.state}>
        {this.props.children}
      </PreferencesContext.Provider>
    );
  }
}
