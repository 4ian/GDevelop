import createReactContext, { type Context } from 'create-react-context';

export type PreferencesValues = {|
  autoDownloadUpdates: boolean,
  themeName: string,
  codeEditorThemeName: string,
  showEventsFunctionsExtensions: boolean,
|};

export type Preferences = {|
  values: PreferencesValues,
  setThemeName: (themeName: string) => void,
  setCodeEditorThemeName: (codeEditorThemeName: string) => void,
  setAutoDownloadUpdates: (enabled: boolean) => void,
  checkUpdates: (forceDownload?: boolean) => void,
  setShowEventsFunctionsExtensions: (enabled: boolean) => void,
|};

export const initialPreferences = {
  values: {
    autoDownloadUpdates: true,
    themeName: 'GDevelop default',
    codeEditorThemeName: 'vs-dark',
    showEventsFunctionsExtensions: false,
  },
  setThemeName: () => {},
  setCodeEditorThemeName: () => {},
  setAutoDownloadUpdates: () => {},
  checkUpdates: () => {},
  setShowEventsFunctionsExtensions: () => {},
};

const PreferencesContext: Context<Preferences> = createReactContext(
  initialPreferences
);

export default PreferencesContext;
