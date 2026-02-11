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

type Theme = $Exact<typeof DefaultLightTheme>;
export type GDevelopTheme = $PropertyType<Theme, 'gdevelopTheme'>;
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
