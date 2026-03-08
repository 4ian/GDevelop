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
import {
  isLightRgbColor,
  rgbStringAndAlphaToRGBColor,
} from '../../Utils/ColorTransformer';

// Add the rtl plugin to the JSS instance to support RTL languages in material-ui components.
const jss = create({
  plugins: [...jssPreset().plugins, rtl()],
});

const setOrRemoveCssVariable = (
  root: HTMLElement,
  variableName: string,
  variableValue: ?string
) => {
  if (variableValue) root.style.setProperty(variableName, variableValue);
  else root.style.removeProperty(variableName);
};

const setEventsSheetColorVariables = (
  root: HTMLElement,
  scope: 'conditions' | 'actions',
  rgbColorValue: string
) => {
  const rgbColor = rgbStringAndAlphaToRGBColor(rgbColorValue);
  if (!rgbColor) {
    setOrRemoveCssVariable(
      root,
      `--events-sheet-user-${scope}-background-color`,
      null
    );
    setOrRemoveCssVariable(
      root,
      `--events-sheet-user-${scope}-text-color`,
      null
    );
    setOrRemoveCssVariable(
      root,
      `--events-sheet-user-${scope}-border-color`,
      null
    );
    setOrRemoveCssVariable(
      root,
      `--events-sheet-user-${scope}-accent-color`,
      null
    );
    setOrRemoveCssVariable(
      root,
      `--events-sheet-user-${scope}-hover-overlay-color`,
      null
    );
    return;
  }

  const isLightColor = isLightRgbColor(rgbColor);
  const textColor = isLightColor ? '#151917' : '#F6F4EE';
  const borderColor = isLightColor
    ? 'rgba(21, 25, 23, 0.34)'
    : 'rgba(246, 244, 238, 0.22)';
  const accentColor = isLightColor
    ? 'rgba(21, 25, 23, 0.24)'
    : 'rgba(246, 244, 238, 0.16)';
  const hoverOverlayColor = isLightColor
    ? 'rgba(21, 25, 23, 0.08)'
    : 'rgba(246, 244, 238, 0.08)';

  setOrRemoveCssVariable(
    root,
    `--events-sheet-user-${scope}-background-color`,
    `rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`
  );
  setOrRemoveCssVariable(
    root,
    `--events-sheet-user-${scope}-text-color`,
    textColor
  );
  setOrRemoveCssVariable(
    root,
    `--events-sheet-user-${scope}-border-color`,
    borderColor
  );
  setOrRemoveCssVariable(
    root,
    `--events-sheet-user-${scope}-accent-color`,
    accentColor
  );
  setOrRemoveCssVariable(
    root,
    `--events-sheet-user-${scope}-hover-overlay-color`,
    hoverOverlayColor
  );
};

type MuiThemeProviderProps = {|
  children: React.Node,
|};

/**
 * Allow to override the Material-UI theme for a specific subtree.
 * Useful for panes which are having a different "responsive window size"
 * than the rest of the application.
 */
export const MuiThemeOnlyProvider = ({
  children,
}: MuiThemeProviderProps): React.Node => {
  const { values } = React.useContext(PreferencesContext);
  const { themeName, language } = values;
  const { isMobile } = useResponsiveWindowSize();

  const theme = React.useMemo(
    () => {
      const fullTheme = getFullTheme({
        themeName,
        language,
        isMobile,
      });

      return fullTheme;
    },
    [themeName, language, isMobile]
  );

  return <ThemeProvider theme={theme.muiTheme}>{children}</ThemeProvider>;
};

type Props = {|
  children: React.Node,
  forcedThemeName?: string,
|};

export const FullThemeProvider = ({
  children,
  forcedThemeName,
}: Props): React.Node => {
  const { values } = React.useContext(PreferencesContext);
  const {
    themeName,
    language,
    eventsSheetActionsCustomColor,
    eventsSheetConditionsCustomColor,
  } = values;
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

  React.useEffect(
    () => {
      const root = document.documentElement;
      if (!root) return;

      setEventsSheetColorVariables(
        root,
        'conditions',
        eventsSheetConditionsCustomColor
      );
      setEventsSheetColorVariables(
        root,
        'actions',
        eventsSheetActionsCustomColor
      );
    },
    [eventsSheetActionsCustomColor, eventsSheetConditionsCustomColor]
  );

  return (
    <GDevelopThemeContext.Provider value={theme.gdevelopTheme}>
      <StylesProvider jss={jss}>
        <ThemeProvider theme={theme.muiTheme}>{children}</ThemeProvider>
      </StylesProvider>
    </GDevelopThemeContext.Provider>
  );
};
