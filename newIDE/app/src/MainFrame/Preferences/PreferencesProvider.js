// @flow

import * as React from 'react';
import PreferencesContext, {
  initialPreferences,
  type Preferences,
  type AlertMessageIdentifier,
  savePreferencesValues,
  loadPreferencesValues,
} from './PreferencesContext';
import optionalRequire from '../../Utils/OptionalRequire';
import { getIDEVersion } from '../../Version';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

type Props = {|
  children: React.Node,
  disableCheckForUpdates: boolean,
|};

type State = Preferences;

export default class PreferencesProvider extends React.Component<Props, State> {
  state = {
    values: loadPreferencesValues() || initialPreferences.values,
    setLanguage: this._setLanguage.bind(this),
    setThemeName: this._setThemeName.bind(this),
    setCodeEditorThemeName: this._setCodeEditorThemeName.bind(this),
    setAutoDownloadUpdates: this._setAutoDownloadUpdates.bind(this),
    checkUpdates: this._checkUpdates.bind(this),
    setAutoDisplayChangelog: this._setAutoDisplayChangelog.bind(this),
    showAlertMessage: this._showAlertMessage.bind(this),
    verifyIfIsNewVersion: this._verifyIfIsNewVersion.bind(this),
    setEventsSheetShowObjectThumbnails: this._setEventsSheetShowObjectThumbnails.bind(
      this
    ),
    setAutosaveOnPreview: this._setAutosaveOnPreview.bind(this),
    setUseNewInstructionEditorDialog: this._setUseNewInstructionEditorDialog.bind(
      this
    ),
    setUseGDJSDevelopmentWatcher: this._setUseGDJSDevelopmentWatcher.bind(this),
    setEventsSheetUseAssignmentOperators: this._setEventsSheetUseAssignmentOperators.bind(
      this
    ),
    setShowEffectParameterNames: this._setShowEffectParameterNames.bind(this),
    loadPreferencesValues: loadPreferencesValues,
    savePreferencesValues: savePreferencesValues,
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
      () => savePreferencesValues(this.state.values)
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
      () => savePreferencesValues(this.state.values)
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
      () => savePreferencesValues(this.state.values)
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
      () => savePreferencesValues(this.state.values)
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
      () => savePreferencesValues(this.state.values)
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
      () => savePreferencesValues(this.state.values)
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
      () => savePreferencesValues(this.state.values)
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
      () => savePreferencesValues(this.state.values)
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
      () => savePreferencesValues(this.state.values)
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
      () => savePreferencesValues(this.state.values)
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
      () => savePreferencesValues(this.state.values)
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
      () => savePreferencesValues(this.state.values)
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
            [identifier]: !show,
          },
        },
      }),
      () => savePreferencesValues(this.state.values)
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
