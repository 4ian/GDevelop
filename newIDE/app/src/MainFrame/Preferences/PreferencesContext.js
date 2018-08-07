import createReactContext, { type Context } from 'create-react-context';

export type PreferencesValues = {|
  autoDownloadUpdates: boolean,
  themeName: string,
|};

export type Preferences = {|
  values: PreferencesValues,
  setThemeName: (themeName: string) => void,
  setAutoDownloadUpdates: (enabled: boolean) => void,
  checkUpdates: (forceDownload?: boolean) => void,
|};

export const initialPreferences = {
  values: {
    autoDownloadUpdates: true,
    theme: 'GDevelop default',
  },
  setThemeName: () => {},
  setAutoDownloadUpdates: () => {},
  checkUpdates: () => {},
};

const PreferencesContext: Context<Preferences> = createReactContext(
  initialPreferences
);

export default PreferencesContext;
