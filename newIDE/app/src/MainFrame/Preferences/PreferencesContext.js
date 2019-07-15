// @flow
import createReactContext, { type Context } from 'create-react-context';

export type AlertMessageIdentifier =
  | 'use-non-smoothed-textures'
  | 'use-nearest-scale-mode'
  | 'maximum-fps-too-low'
  | 'minimum-fps-too-low'
  | 'function-extractor-explanation'
  | 'events-based-behavior-explanation'
  | 'empty-events-based-behavior-explanation';

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
|};

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
    useNewInstructionEditorDialog: false,
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
};

const PreferencesContext: Context<Preferences> = createReactContext(
  initialPreferences
);

export default PreferencesContext;
