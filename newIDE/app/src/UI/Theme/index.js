// @flow
import { isLtr } from '../../Utils/i18n/RtlLanguages';
import DefaultTheme, {
  themeName as defaultThemeName,
  type Theme,
} from './DefaultTheme';
import DarkTheme from './DarkTheme';
import NordTheme from './NordTheme';
import SolarizedDarkTheme from './SolarizedDarkTheme';
import './Global.css';

// To add a new theme:
// * copy the folder of an existing one (DarkTheme for example),
// * import it at the top of the file
// * add it below:
export const themes = {
  [defaultThemeName]: DefaultTheme,
  Dark: DarkTheme,
  Nord: NordTheme,
  'Solarized Dark': SolarizedDarkTheme,
};

export function getTheme({ themeName, language }: {| themeName: string, language: string |}): Theme {
  // Get `Theme` associated to `themeName`
  let theme = themes[themeName];

  // If unavailable, give notice in the console and revert to default `Theme`
  if (!theme) {
    console.warn(`Theme '${themeName}' is unavailable; '${defaultThemeName}' is used`);
    theme = themes[defaultThemeName];
  }

  const { gdevelopTheme, muiTheme } = theme;
  return { gdevelopTheme, muiTheme: convertToRtl(muiTheme, language) };  
};

export type GDevelopTheme = $PropertyType<Theme, 'gdevelopTheme'>;

type MuiTheme = $Exact<typeof DefaultTheme.muiTheme>;

function convertToRtl(muiTheme: MuiTheme, language: string): MuiTheme {
  const ltr = isLtr(language);
  return { ...muiTheme, direction: ltr ? 'unset' : 'rtl' };
}
