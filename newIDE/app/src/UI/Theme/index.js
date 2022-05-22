// @flow
import { createMuiTheme } from '@material-ui/core/styles';
import { isLtr } from '../../Utils/i18n/RtlLanguages';
import memoize from '../../Utils/Memoize';

import DefaultTheme from './DefaultTheme';
import { themes as themeList } from './ThemeRegistry';

import 'react-virtualized/styles.css';
// Styles
import './Global/Animation.css';
import './Global/EventsSheet.css';
import './Global/Markdown.css';
import './Global/Scrollbar.css';
import './Global/Mosaic.css';
import './Global/Table.css';

export type Theme = $Exact<typeof DefaultTheme>;
export const themes = themeList;

export type GDevelopTheme = $PropertyType<Theme, 'gdevelopTheme'>;
type ActualTheme = {| gdevelopTheme: GDevelopTheme, muiTheme: Object |};
type MuiThemeOptions = $PropertyType<Theme, 'muiThemeOptions'>;
const defaultThemeName = 'GDevelop default';

export function getTheme({
  themeName,
  language,
}: {|
  themeName: string,
  language: string,
|}): ActualTheme {
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
    muiTheme: ltr
      ? createLtrTheme(muiThemeOptions)
      : createRtlTheme(muiThemeOptions),
  };
}

const createLtrTheme = memoize((muiThemeOptions: MuiThemeOptions): Object => {
  return createMuiTheme(muiThemeOptions);
});

const createRtlTheme = memoize((muiThemeOptions: MuiThemeOptions): Object => {
  return createMuiTheme(muiThemeOptions, { overrides: rtlOverrides });
});

const rtlDirection = { direction: 'rtl' };
const rtlOrder = { order: 100 };
const rtlOverrides = {
  MuiTypography: {
    root: rtlDirection,
  },
  MuiInput: {
    root: rtlDirection,
  },
  MuiTab: {
    root: rtlDirection,
  },
  MuiButton: {
    label: rtlDirection,
  },
  MuiSvgIcon: {
    root: rtlOrder,
  },
  MuiFormControlLabel: {
    root: rtlDirection,
  },
  MuiTextField: {
    root: rtlDirection,
  },
};

export const defaultTheme: ActualTheme = {
  ...DefaultTheme,
  muiThemeOptions: createLtrTheme(DefaultTheme.muiThemeOptions),
};
