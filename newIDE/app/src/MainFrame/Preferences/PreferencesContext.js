import createReactContext, { type Context } from 'create-react-context';

export type PreferencesValues = {|
  autoDownloadUpdates: boolean,
  themeName: string,
  codeEditorThemeName: string,
|};

export type Preferences = {|
  values: PreferencesValues,
  setThemeName: (themeName: string) => void,
  setCodeEditorThemeName: (codeEditorThemeName: string) => void,
  setAutoDownloadUpdates: (enabled: boolean) => void,
  checkUpdates: (forceDownload?: boolean) => void,
|};

export const initialPreferences = {
  values: {
    autoDownloadUpdates: true,
    themeName: 'GDevelop default',
    codeEditorThemeName: 'vs-dark',
  },
  setThemeName: () => {},
  setCodeEditorThemeName: () => {},
  setAutoDownloadUpdates: () => {},
  checkUpdates: () => {},
};

const PreferencesContext: Context<Preferences> = createReactContext(
  initialPreferences
);

export default PreferencesContext;
