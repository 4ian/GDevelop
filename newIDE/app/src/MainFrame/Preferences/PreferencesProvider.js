// @flow

import * as React from 'react';
import PreferencesContext, {
  initialPreferences,
  type Preferences,
  type AlertMessageIdentifier,
} from './PreferencesContext';
import optionalRequire from '../../Utils/OptionalRequire';
import { getIDEVersion } from '../../Version';
import type { PreferencesValues } from './PreferencesContext';
import type { ResourceKind } from '../../ResourcesList/ResourceSource.flow';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

type Props = {|
  children: React.Node,
  disableCheckForUpdates: boolean,
|};

type State = Preferences;
const LocalStorageItem = 'gd-preferences';

export default class PreferencesProvider extends React.Component<Props, State> {
  state = {
    values: this._loadPreferencesValues() || initialPreferences.values,
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
    loadLatestPath: this._loadLatestPath.bind(this),
    saveLatestPath: this._saveLatestPath.bind(this),
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
      () => this._savePreferencesValues(this.state.values)
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
      () => this._savePreferencesValues(this.state.values)
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
      () => this._savePreferencesValues(this.state.values)
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
      () => this._savePreferencesValues(this.state.values)
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
      () => this._savePreferencesValues(this.state.values)
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
      () => this._savePreferencesValues(this.state.values)
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
      () => this._savePreferencesValues(this.state.values)
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
      () => this._savePreferencesValues(this.state.values)
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
      () => this._savePreferencesValues(this.state.values)
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
      () => this._savePreferencesValues(this.state.values)
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
      () => this._savePreferencesValues(this.state.values)
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
      () => this._savePreferencesValues(this.state.values)
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
      () => this._savePreferencesValues(this.state.values)
    );
  }

  _loadPreferencesValues(): ?PreferencesValues {
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

  _savePreferencesValues(values: PreferencesValues) {
    try {
      localStorage.setItem(LocalStorageItem, JSON.stringify(values));
    } catch (e) {
      console.warn('Unable to persist preferences', e);
    }
  }

  _loadLatestPath(project: gdProject, kind: ResourceKind) {
    try {
      const projectName = project.getName();
      const values = this._loadPreferencesValues();
      if (values) {
        const curProjectPaths = values.latestPath[projectName];
        if (curProjectPaths) {
          console.log(curProjectPaths, curProjectPaths[kind]);
          return curProjectPaths[kind];
        }
      }
    } catch (e) {
      console.warn('Unable to load latest path', e);
    }
  }

  _saveLatestPath(project: gdProject, kind: ResourceKind, path: string) {
    try {
      const projectName = project.getName();
      let values = this._loadPreferencesValues();
      if (values) {
        if (values.latestPath[projectName])
          values.latestPath[projectName][kind] = path;
        else {
          values.latestPath[projectName] = { [kind]: path };
        }
        this._savePreferencesValues(values);
      }
    } catch (e) {
      console.warn('Unable to save latest path', e);
    }
  }

  render() {
    return (
      <PreferencesContext.Provider value={this.state}>
        {this.props.children}
      </PreferencesContext.Provider>
    );
  }
}
