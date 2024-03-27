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

  const themeNameToUse = forcedThemeName || themeName;

  const theme = React.useMemo(
    () => {
      const fullTheme = getFullTheme({
        themeName: themeNameToUse,
        language,
        isMobile,
      });

      try {
        const { body } = document;
        if (!body) throw new Error('Document has no body.');
        body.className = fullTheme.gdevelopTheme.uiRootClassName;
      } catch (error) {
        console.error('An error occurred while changing global theme:', error);
      }

      return fullTheme;
    },
    [themeNameToUse, language, isMobile]
  );

  return (
    <GDevelopThemeContext.Provider value={theme.gdevelopTheme}>
      <StylesProvider jss={jss}>
        <ThemeProvider theme={theme.muiTheme}>{children}</ThemeProvider>
      </StylesProvider>
    </GDevelopThemeContext.Provider>
  );
};
