// @flow
import createReactContext, { type Context } from 'create-react-context';

export type AlertMessageIdentifier =
  | 'use-non-smoothed-textures'
  | 'use-nearest-scale-mode';

export type PreferencesValues = {|
  language: string,
  autoDownloadUpdates: boolean,
  themeName: string,
  codeEditorThemeName: string,
  hiddenAlertMessages: { [AlertMessageIdentifier]: boolean },
  autoDisplayChangelog: boolean,
  lastLaunchedVersion: ?string,
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
  },
  setLanguage: () => {},
  setThemeName: () => {},
  setCodeEditorThemeName: () => {},
  setAutoDownloadUpdates: () => {},
  checkUpdates: () => {},
  setAutoDisplayChangelog: () => {},
  showAlertMessage: (identifier: AlertMessageIdentifier, show: boolean) => {},
  verifyIfIsNewVersion: () => false,
};

const PreferencesContext: Context<Preferences> = createReactContext(
  initialPreferences
);

export default PreferencesContext;
