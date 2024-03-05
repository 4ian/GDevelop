// @flow
import { ThemeProvider } from '@material-ui/core';
import { StylesProvider, jssPreset } from '@material-ui/core/styles';
import * as React from 'react';
import { getFullTheme } from '.';
import { create } from 'jss';
import rtl from 'jss-rtl';
import GDevelopThemeContext from './GDevelopThemeContext';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { useResponsiveWindowSize } from '../Responsive/ResponsiveWindowMeasurer';

// Add the rtl plugin to the JSS instance to support RTL languages in material-ui components.
const jss = create({
  plugins: [...jssPreset().plugins, rtl()],
});

type Props = {|
  children: React.Node,
  forcedThemeName?: string,
|};

export const FullThemeProvider = ({ children, forcedThemeName }: Props) => {
  const { values } = React.useContext(PreferencesContext);
  const { themeName, language } = values;
  const { isMobile } = useResponsiveWindowSize();

  const theme = React.useMemo(
    () =>
      getFullTheme({
        themeName: forcedThemeName || themeName,
        language,
        isMobile,
      }),
    [forcedThemeName, themeName, language, isMobile]
  );

  return (
    <GDevelopThemeContext.Provider value={theme.gdevelopTheme}>
      <StylesProvider jss={jss}>
        <ThemeProvider theme={theme.muiTheme}>{children}</ThemeProvider>
      </StylesProvider>
    </GDevelopThemeContext.Provider>
  );
};
