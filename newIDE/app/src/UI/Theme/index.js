// @flow
import { createMuiTheme } from '@material-ui/core/styles';
import { isLtr } from '../../Utils/i18n/RtlLanguages';
import memoize from '../../Utils/Memoize';
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

export type GDevelopTheme = $PropertyType<Theme, 'gdevelopTheme'>;
type ActualTheme = {| gdevelopTheme: GDevelopTheme, muiTheme: Object |};
type MuiThemeOptions = $PropertyType<Theme, 'muiThemeOptions'>;

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

const createLtrTheme = memoize(
  (muiThemeOptions: MuiThemeOptions): Object => {
    return createMuiTheme(muiThemeOptions);
  }
);

const createRtlTheme = memoize(
  (muiThemeOptions: MuiThemeOptions): Object => {
    return createMuiTheme(muiThemeOptions, { overrides: rtlOverrides });
  }
);

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
  gdevelopTheme: DefaultTheme.gdevelopTheme,
  muiTheme: createLtrTheme(DefaultTheme.muiThemeOptions),
};
