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
  type ProjectSpecificPreferencesValues,
} from './PreferencesContext';
import type {
  ResourceKind,
  ResourceImportationBehavior,
} from '../../ResourcesList/ResourceSource';
import { type EditorMosaicNode } from '../../UI/EditorMosaic';
import { type FileMetadataAndStorageProviderName } from '../../ProjectsStorage';
import defaultShortcuts from '../../KeyboardShortcuts/DefaultShortcuts';
import { type CommandName } from '../../CommandPalette/CommandsList';
import { type EditorTabsPersistedState } from '../EditorTabs/EditorTabsHandler';
import {
  getBrowserLanguageOrLocale,
  setLanguageInDOM,
  selectLanguageOrLocale,
} from '../../Utils/Language';
import { type GamesDashboardOrderBy } from '../../GameDashboard/GamesList';
import { CHECK_APP_UPDATES_TIMEOUT } from '../../Utils/GlobalFetchTimeouts';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

type Props = {|
  children: React.Node,
  disableCheckForUpdates: boolean,
|};

type State = Preferences;

const localStorageItem = 'gd-preferences';

export const loadPreferencesFromLocalStorage = (): ?PreferencesValues => {
  try {
    const persistedState = localStorage.getItem(localStorageItem);
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
        // $FlowFixMe[invalid-computed-prop]
        values[key] = initialPreferences.values[key];
      }
    }

    // Migrate renamed themes.
    if (values.themeName === 'GDevelop default') {
      values.themeName = 'GDevelop default Light';
    } else if (values.themeName === 'Dark') {
      values.themeName = 'Blue Dark';
    }

    if (typeof values.showDeprecatedInstructionWarning === 'boolean') {
      values.showDeprecatedInstructionWarning = values.showDeprecatedInstructionWarning
        ? 'icon'
        : 'no';
    }

    return values;
  } catch (e) {
    return null;
  }
};

export const getInitialPreferences = (): {
  aiState: { aiRequestId: null },
  autoDisplayChangelog: boolean,
  autoDownloadUpdates: boolean,
  autoOpenMostRecentProject: boolean,
  automaticallyUseCreditsForAiRequests: boolean,
  autosaveOnPreview: boolean,
  backdropClickBehavior: string,
  blockPreviewAndExportOnDiagnosticErrors: boolean,
  codeEditorThemeName: string,
  defaultEditorMosaicNodes: {},
  disableNpmScriptConfirmation: boolean,
  displaySaveReminder: { activated: boolean },
  editorStateByProject: {},
  eventsSheetCancelInlineParameter: string,
  eventsSheetIndentScale: number,
  eventsSheetShowObjectThumbnails: boolean,
  eventsSheetUseAssignmentOperators: boolean,
  eventsSheetZoomLevel: number,
  fetchPlayerTokenForPreviewAutomatically: boolean,
  gamesDashboardOrderBy: string,
  hasProjectOpened: boolean,
  hiddenAlertMessages: {},
  hiddenAnnouncements: {},
  hiddenAskAiStandAloneForms: {},
  hiddenTutorialHints: {},
  inAppTutorialsProgress: {},
  isAlwaysOnTopInPreview: boolean,
  isMenuBarHiddenInPreview: boolean,
  language: string,
  lastLaunchedVersion: void,
  newFeaturesAcknowledgements: {},
  newObjectDialogDefaultTab: any,
  newProjectsDefaultFolder: any,
  newProjectsDefaultStorageProviderName: string,
  openDiagnosticReportAutomatically: boolean,
  previewCrashReportUploadLevel: string,
  projectLastUsedPaths: {},
  recentProjectFiles: any,
  resourcesImporationBehavior: string,
  shareDialogDefaultTab: string,
  showAiAskButtonInTitleBar: boolean,
  showBasicProfilingCounters: boolean,
  showCreateSectionByDefault: boolean,
  showDeprecatedInstructionWarning: string,
  showEffectParameterNames: boolean,
  showExperimentalExtensions: boolean,
  showInAppTutorialDeveloperMode: boolean,
  takeScreenshotOnPreview: boolean,
  themeName: any,
  use3DEditor: any,
  useBackgroundSerializerForSaving: boolean,
  useGDJSDevelopmentWatcher: boolean,
  useShortcutToClosePreviewWindow: boolean,
  userShortcutMap: {},
  watchProjectFolderFilesForLocalProjects: boolean,
} => {
  let languageOrLocale = 'en';
  const browserLanguageOrLocale = getBrowserLanguageOrLocale();
  if (browserLanguageOrLocale)
    languageOrLocale = selectLanguageOrLocale(
      browserLanguageOrLocale,
      languageOrLocale
    );

  return { ...initialPreferences.values, language: languageOrLocale };
};

const getPreferences = (): PreferencesValues => {
  const preferences =
    loadPreferencesFromLocalStorage() || getInitialPreferences();
  setLanguageInDOM(preferences.language);
  // $FlowFixMe[incompatible-type]
  return preferences;
};

export default class PreferencesProvider extends React.Component<Props, State> {
  // $FlowFixMe[missing-local-annot]
  state = {
    values: (getPreferences(): PreferencesValues),
    // $FlowFixMe[method-unbinding]
    setMultipleValues: (this._setMultipleValues.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setLanguage: (this._setLanguage.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setThemeName: (this._setThemeName.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setCodeEditorThemeName: (this._setCodeEditorThemeName.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setAutoDownloadUpdates: (this._setAutoDownloadUpdates.bind(this): any),
    // $FlowFixMe[method-unbinding]
    checkUpdates: (this._checkUpdates.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setAutoDisplayChangelog: (this._setAutoDisplayChangelog.bind(this): any),
    // $FlowFixMe[method-unbinding]
    showAlertMessage: (this._showAlertMessage.bind(this): any),
    // $FlowFixMe[method-unbinding]
    showAllAlertMessages: (this._showAllAlertMessages.bind(this): any),
    // $FlowFixMe[method-unbinding]
    showTutorialHint: (this._showTutorialHint.bind(this): any),
    // $FlowFixMe[method-unbinding]
    showAllTutorialHints: (this._showAllTutorialHints.bind(this): any),
    // $FlowFixMe[method-unbinding]
    showAnnouncement: (this._showAnnouncement.bind(this): any),
    // $FlowFixMe[method-unbinding]
    showAllAnnouncements: (this._showAllAnnouncements.bind(this): any),
    // $FlowFixMe[method-unbinding]
    showAskAiStandAloneForm: (this._showAskAiStandAloneForm.bind(this): any),
    // $FlowFixMe[method-unbinding]
    showAllAskAiStandAloneForms: (this._showAllAskAiStandAloneForms.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    verifyIfIsNewVersion: (this._verifyIfIsNewVersion.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setEventsSheetShowObjectThumbnails: (this._setEventsSheetShowObjectThumbnails.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setAutosaveOnPreview: (this._setAutosaveOnPreview.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setUseGDJSDevelopmentWatcher: (this._setUseGDJSDevelopmentWatcher.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setEventsSheetUseAssignmentOperators: (this._setEventsSheetUseAssignmentOperators.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setEventsSheetIndentScale: (this._setEventsSheetIndentScale.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setEventsSheetZoomLevel: (this._setEventsSheetZoomLevel.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setShowEffectParameterNames: (this._setShowEffectParameterNames.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    getLastUsedPath: (this._getLastUsedPath.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setLastUsedPath: (this._setLastUsedPath.bind(this): any),
    // $FlowFixMe[method-unbinding]
    getDefaultEditorMosaicNode: (this._getDefaultEditorMosaicNode.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setDefaultEditorMosaicNode: (this._setDefaultEditorMosaicNode.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    getRecentProjectFiles: (this._getRecentProjectFiles.bind(this): any),
    // $FlowFixMe[method-unbinding]
    insertRecentProjectFile: (this._insertRecentProjectFile.bind(this): any),
    // $FlowFixMe[method-unbinding]
    removeRecentProjectFile: (this._removeRecentProjectFile.bind(this): any),
    // $FlowFixMe[method-unbinding]
    getAutoOpenMostRecentProject: (this._getAutoOpenMostRecentProject.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setAutoOpenMostRecentProject: (this._setAutoOpenMostRecentProject.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    hadProjectOpenedDuringLastSession: (this._hadProjectOpenedDuringLastSession.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setHasProjectOpened: (this._setHasProjectOpened.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setShortcutForCommand: (this._setShortcutForCommand.bind(this): any),
    // $FlowFixMe[method-unbinding]
    resetShortcutsToDefault: (this._resetShortcutsToDefault.bind(this): any),
    // $FlowFixMe[method-unbinding]
    getNewObjectDialogDefaultTab: (this._getNewObjectDialogDefaultTab.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setNewObjectDialogDefaultTab: (this._setNewObjectDialogDefaultTab.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    getShareDialogDefaultTab: (this._getShareDialogDefaultTab.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setShareDialogDefaultTab: (this._setShareDialogDefaultTab.bind(this): any),
    // $FlowFixMe[method-unbinding]
    getIsMenuBarHiddenInPreview: (this._getIsMenuBarHiddenInPreview.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setIsMenuBarHiddenInPreview: (this._setIsMenuBarHiddenInPreview.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setBackdropClickBehavior: (this._setBackdropClickBehavior.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setResourcesImporationBehavior: (this._setResourcesImporationBehavior.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    getIsAlwaysOnTopInPreview: (this._getIsAlwaysOnTopInPreview.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setIsAlwaysOnTopInPreview: (this._setIsAlwaysOnTopInPreview.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setEventsSheetCancelInlineParameter: (this._setEventsSheetCancelInlineParameter.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setShowExperimentalExtensions: (this._setShowCommunityExtensions.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setShowCreateSectionByDefault: (this._setShowCreateSectionByDefault.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setShowInAppTutorialDeveloperMode: (this._setShowInAppTutorialDeveloperMode.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setOpenDiagnosticReportAutomatically: (this._setOpenDiagnosticReportAutomatically.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    getOpenDiagnosticReportAutomatically: (this._getOpenDiagnosticReportAutomatically.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setBlockPreviewAndExportOnDiagnosticErrors: (this._setBlockPreviewAndExportOnDiagnosticErrors.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    getBlockPreviewAndExportOnDiagnosticErrors: (this._getBlockPreviewAndExportOnDiagnosticErrors.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setShowDeprecatedInstructionWarning: (this._setShowDeprecatedInstructionWarning.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    getShowDeprecatedInstructionWarning: (this._getShowDeprecatedInstructionWarning.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setUse3DEditor: (this._setUse3DEditor.bind(this): any),
    // $FlowFixMe[method-unbinding]
    getUse3DEditor: (this._getUse3DEditor.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setShowBasicProfilingCounters: (this._setShowBasicProfilingCounters.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setDisableNpmScriptConfirmation: (this._setDisableNpmScriptConfirmation.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    saveTutorialProgress: (this._saveTutorialProgress.bind(this): any),
    // $FlowFixMe[method-unbinding]
    getTutorialProgress: (this._getTutorialProgress.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setNewProjectsDefaultFolder: (this._setNewProjectsDefaultFolder.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setNewProjectsDefaultStorageProviderName: (this._setNewProjectsDefaultStorageProviderName.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setUseShortcutToClosePreviewWindow: (this._setUseShortcutToClosePreviewWindow.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setWatchProjectFolderFilesForLocalProjects: (this._setWatchProjectFolderFilesForLocalProjects.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setNewFeaturesAcknowledgements: (this._setNewFeaturesAcknowledgements.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setDisplaySaveReminder: (this._setDisplaySaveReminder.bind(this): any),
    // $FlowFixMe[method-unbinding]
    getEditorStateForProject: (this._getEditorStateForProject.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setEditorStateForProject: (this._setEditorStateForProject.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setFetchPlayerTokenForPreviewAutomatically: (this._setFetchPlayerTokenForPreviewAutomatically.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setPreviewCrashReportUploadLevel: (this._setPreviewCrashReportUploadLevel.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setGamesDashboardOrderBy: (this._setGamesDashboardOrderBy.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setTakeScreenshotOnPreview: (this._setTakeScreenshotOnPreview.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setShowAiAskButtonInTitleBar: (this._setShowAiAskButtonInTitleBar.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setAiState: (this._setAiState.bind(this): any),
    // $FlowFixMe[method-unbinding]
    setAutomaticallyUseCreditsForAiRequests: (this._setAutomaticallyUseCreditsForAiRequests.bind(
      this
    ): any),
    // $FlowFixMe[method-unbinding]
    setUseBackgroundSerializerForSaving: (this._setUseBackgroundSerializerForSaving.bind(
      this
    ): any),
  };

  componentDidMount() {
    setTimeout(() => this._checkUpdates(), CHECK_APP_UPDATES_TIMEOUT);
  }

  _setMultipleValues(updates: ProjectSpecificPreferencesValues) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          ...updates,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setLanguage(language: string) {
    setLanguageInDOM(language);
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

  _saveTutorialProgress({
    tutorialId,
    userId,
    ...tutorialProgress
  }: {|
    tutorialId: string,
    userId: ?string,
    step: number,
    progress: number,
    fileMetadataAndStorageProviderName: FileMetadataAndStorageProviderName,
    projectData: {| [key: string]: string |},
  |}) {
    const userIdKey: string = userId || 'anonymous';
    this.setState(
      ({ values }) => {
        return {
          values: {
            ...values,
            inAppTutorialsProgress: {
              ...values.inAppTutorialsProgress,
              [tutorialId]: {
                ...values.inAppTutorialsProgress[tutorialId],
                // $FlowFixMe[incompatible-type]
                [userIdKey]: tutorialProgress,
              },
            },
          },
        };
      },
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _getTutorialProgress({
    tutorialId,
    userId,
  }: {|
    tutorialId: string,
    userId: ?string,
  |}): any {
    const userIdKey: string = userId || 'anonymous';
    const tutorialProgresses = this.state.values.inAppTutorialsProgress[
      tutorialId
    ];
    if (!tutorialProgresses) return undefined;
    return tutorialProgresses[userIdKey];
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

  _setEventsSheetIndentScale(eventsSheetIndentScale: number) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          eventsSheetIndentScale,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setEventsSheetZoomLevel(eventsSheetZoomLevel: number) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          eventsSheetZoomLevel,
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

  _setShowCreateSectionByDefault(showCreateSectionByDefault: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          showCreateSectionByDefault,
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

  _setUseShortcutToClosePreviewWindow(
    useShortcutToClosePreviewWindow: boolean
  ) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          useShortcutToClosePreviewWindow,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setShowCommunityExtensions(showExperimentalExtensions: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          showExperimentalExtensions,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setShowInAppTutorialDeveloperMode(showInAppTutorialDeveloperMode: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          showInAppTutorialDeveloperMode,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setOpenDiagnosticReportAutomatically(
    openDiagnosticReportAutomatically: boolean
  ) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          openDiagnosticReportAutomatically,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _getOpenDiagnosticReportAutomatically(): any {
    return this.state.values.openDiagnosticReportAutomatically;
  }

  _setBlockPreviewAndExportOnDiagnosticErrors(
    blockPreviewAndExportOnDiagnosticErrors: boolean
  ) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          blockPreviewAndExportOnDiagnosticErrors,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _getBlockPreviewAndExportOnDiagnosticErrors(): any {
    return this.state.values.blockPreviewAndExportOnDiagnosticErrors;
  }

  _setShowDeprecatedInstructionWarning(
    showDeprecatedInstructionWarning:
      | 'no'
      | 'icon'
      | 'icon-and-deprecated-warning-text'
  ) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          showDeprecatedInstructionWarning,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _getShowDeprecatedInstructionWarning():
    | 'no'
    | 'icon'
    | 'icon-and-deprecated-warning-text' {
    return this.state.values.showDeprecatedInstructionWarning;
  }

  _setUse3DEditor(use3DEditor: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          use3DEditor,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _getUse3DEditor(): any {
    return this.state.values.use3DEditor;
  }

  _setShowBasicProfilingCounters(showBasicProfilingCounters: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          showBasicProfilingCounters,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setDisableNpmScriptConfirmation(disableNpmScriptConfirmation: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          disableNpmScriptConfirmation,
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

  _verifyIfIsNewVersion(): any {
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
            // $FlowFixMe[incompatible-type] - Flow won't typecheck this because of https://medium.com/flow-type/spreads-common-errors-fixes-9701012e9d58
            [identifier]: !show,
          },
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _showAllAlertMessages() {
    this.setState(
      state => ({
        values: {
          ...state.values,
          hiddenAlertMessages: {},
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

  _showAllTutorialHints() {
    this.setState(
      state => ({
        values: {
          ...state.values,
          hiddenTutorialHints: {},
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _showAnnouncement(identifier: string, show: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          hiddenAnnouncements: {
            ...state.values.hiddenAnnouncements,
            [identifier]: !show,
          },
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _showAllAnnouncements() {
    this.setState(
      state => ({
        values: {
          ...state.values,
          hiddenAnnouncements: {},
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _showAskAiStandAloneForm(identifier: string, show: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          hiddenAskAiStandAloneForms: {
            ...state.values.hiddenAskAiStandAloneForms,
            [identifier]: !show,
          },
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _showAllAskAiStandAloneForms() {
    this.setState(
      state => ({
        values: {
          ...state.values,
          hiddenAskAiStandAloneForms: {},
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _persistValuesToLocalStorage(preferences: Preferences): any {
    try {
      localStorage.setItem(
        localStorageItem,
        JSON.stringify(preferences.values)
      );
    } catch (e) {
      console.warn('Unable to persist preferences', e);
    }

    return preferences;
  }

  _getLastUsedPath(project: gdProject, kind: ResourceKind): any {
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

  _getDefaultEditorMosaicNode(name: EditorMosaicName): any {
    return this.state.values.defaultEditorMosaicNodes[name] || null;
  }

  _setDefaultEditorMosaicNode(name: EditorMosaicName, node: ?EditorMosaicNode) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          defaultEditorMosaicNodes: {
            ...state.values.defaultEditorMosaicNodes,
            // $FlowFixMe[incompatible-type] - Flow errors on unions in computed properties
            [name]: node,
          },
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _getRecentProjectFiles(
    options: ?{| limit: number |}
  ): Array<FileMetadataAndStorageProviderName> {
    const limit = options ? options.limit : undefined;
    const recentProjectFiles = this.state.values.recentProjectFiles;
    return limit ? recentProjectFiles.slice(0, limit) : recentProjectFiles;
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
    // Do not store recent project in preferences as they will be accessible only from user account.
    if (newRecentFile.storageProviderName === 'Cloud') return;

    let recentProjectFiles = this._getRecentProjectFiles();
    // $FlowFixMe[missing-local-annot]
    const isNotNewRecentFile = recentFile =>
      recentFile.fileMetadata.fileIdentifier !==
      newRecentFile.fileMetadata.fileIdentifier;
    this._setRecentProjectFiles([
      newRecentFile,
      ...recentProjectFiles.filter(isNotNewRecentFile),
    ]);
  }

  _removeRecentProjectFile(recentFile: FileMetadataAndStorageProviderName) {
    // $FlowFixMe[missing-local-annot]
    const isNotRemovedRecentFile = recentFileItem =>
      recentFileItem.fileMetadata.fileIdentifier !==
      recentFile.fileMetadata.fileIdentifier;
    this._setRecentProjectFiles([
      ...this._getRecentProjectFiles().filter(isNotRemovedRecentFile),
    ]);
  }

  _getAutoOpenMostRecentProject(): any {
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

  _hadProjectOpenedDuringLastSession(): any {
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

  _getNewObjectDialogDefaultTab(): any {
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

  _getShareDialogDefaultTab(): any {
    return this.state.values.shareDialogDefaultTab;
  }

  _setShareDialogDefaultTab(shareDialogDefaultTab: 'invite' | 'publish') {
    this.setState(
      state => ({
        values: { ...state.values, shareDialogDefaultTab },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _getIsMenuBarHiddenInPreview(): any {
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

  _setResourcesImporationBehavior(
    resourcesImporationBehavior: ResourceImportationBehavior
  ) {
    this.setState(
      state => ({
        values: { ...state.values, resourcesImporationBehavior },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _getIsAlwaysOnTopInPreview(): any {
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

  _setNewProjectsDefaultFolder(newProjectsDefaultFolder: string) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          newProjectsDefaultFolder,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setNewProjectsDefaultStorageProviderName(newStorageProviderName: string) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          newProjectsDefaultStorageProviderName: newStorageProviderName,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setWatchProjectFolderFilesForLocalProjects(enable: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          watchProjectFolderFilesForLocalProjects: enable,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setNewFeaturesAcknowledgements(newFeaturesAcknowledgements: {
    [featureId: string]: {| dates: [number] |},
  }) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          newFeaturesAcknowledgements,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setDisplaySaveReminder(newValue: {| activated: boolean |}) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          displaySaveReminder: newValue,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setUseBackgroundSerializerForSaving(newValue: boolean) {
    this.setState(
      state => ({
        values: { ...state.values, useBackgroundSerializerForSaving: newValue },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _getEditorStateForProject(projectId: string): any {
    return this.state.values.editorStateByProject[projectId];
  }

  _setEditorStateForProject(
    projectId: string,
    editorState?: {| editorTabs: EditorTabsPersistedState |}
  ) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          editorStateByProject: {
            ...state.values.editorStateByProject,
            // $FlowFixMe[incompatible-type]
            [projectId]: editorState,
          },
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setFetchPlayerTokenForPreviewAutomatically(newValue: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          fetchPlayerTokenForPreviewAutomatically: newValue,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setPreviewCrashReportUploadLevel(newValue: string) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          previewCrashReportUploadLevel: newValue,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setGamesDashboardOrderBy(newValue: GamesDashboardOrderBy) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          gamesDashboardOrderBy: newValue,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setTakeScreenshotOnPreview(newValue: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          takeScreenshotOnPreview: newValue,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setShowAiAskButtonInTitleBar(newValue: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          showAiAskButtonInTitleBar: newValue,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setAiState(newValue: {| aiRequestId: string | null |}) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          aiState: {
            ...state.values.aiState,
            ...newValue,
          },
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  _setAutomaticallyUseCreditsForAiRequests(newValue: boolean) {
    this.setState(
      state => ({
        values: {
          ...state.values,
          automaticallyUseCreditsForAiRequests: newValue,
        },
      }),
      () => this._persistValuesToLocalStorage(this.state)
    );
  }

  render(): any {
    return (
      <PreferencesContext.Provider value={this.state}>
        {this.props.children}
      </PreferencesContext.Provider>
    );
  }
}
