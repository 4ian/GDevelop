// @flow
import { createMuiTheme } from '@material-ui/core/styles';
import { isLtr } from '../../Utils/i18n/RtlLanguages';
import DefaultLightTheme from './DefaultLightTheme';
import { themes } from './ThemeRegistry';
import { rtlMuiOverrides, smallScreenMuiOverrides } from './CreateTheme';

// Static stylesheets - always imported.
import 'react-virtualized/styles.css';
import './Global/Animation.css';
import './Global/EventsSheet.css';
import './Global/Snackbar.css';
import './Global/Markdown.css';
import './Global/Scrollbar.css';
import './Global/Mosaic.css';
import './Global/Table.css';
import './Global/Font.css';

import { loadPreferencesFromLocalStorage } from '../../MainFrame/Preferences/PreferencesProvider';

type Theme = $Exact<typeof DefaultLightTheme>;
export type GDevelopTheme = typeof DefaultLightTheme.gdevelopTheme;
type FullTheme = {| gdevelopTheme: GDevelopTheme, muiTheme: Object |};
const defaultThemeName = 'GDevelop default Dark';

export function getFullTheme({
  themeName,
  language,
  isMobile,
}: {|
  themeName: string,
  language: string,
  isMobile: boolean,
|}): FullTheme {
  let theme: Theme = themes[themeName];

  if (!theme) {
    console.warn(
      `Theme '${themeName}' is unavailable; '${defaultThemeName}' is used`
    );
    theme = themes[defaultThemeName];
  }

  const ltr = isLtr(language);
  const { gdevelopTheme, muiThemeOptions } = theme;
  return {
    gdevelopTheme,
    muiTheme: createMuiTheme(
      muiThemeOptions,
      {
        ...(isMobile ? { overrides: smallScreenMuiOverrides } : {}),
      },
      { ...(ltr ? {} : { overrides: rtlMuiOverrides }) }
    ),
  };
}

/**
 * Return the window background color from the user's preferred theme
 * stored in localStorage. Falls back to a light gray if preferences
 * can't be read.
 */
export function getThemeWindowBackgroundColor(): string {
  try {
    const values = loadPreferencesFromLocalStorage();
    if (values && values.themeName) {
      const theme = getFullTheme({
        themeName: values.themeName,
        language: 'en',
        isMobile: true,
      });
      return theme.gdevelopTheme.surface.window.backgroundColor;
    }
  } catch {}
  return '#f0f0f0';
}
