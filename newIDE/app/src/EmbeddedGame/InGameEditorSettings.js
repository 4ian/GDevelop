// @flow
import * as React from 'react';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';

export type InGameEditorSettings = {
  theme: {
    iconButtonSelectedBackgroundColor: string,
    iconButtonSelectedColor: string,
    toolbarBackgroundColor: string,
    toolbarSeparatorColor: string,
    textColorPrimary: string,
  },
};

/**
 * Generate the settings sent to the in-game editor, either at preview launch
 * or when there is a change in the settings.
 */
export const useInGameEditorSettings = (): InGameEditorSettings => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const iconButtonSelectedBackgroundColor =
    gdevelopTheme.iconButton.selectedBackgroundColor;
  const iconButtonSelectedColor = gdevelopTheme.iconButton.selectedColor;
  const toolbarBackgroundColor = gdevelopTheme.toolbar.backgroundColor;
  const toolbarSeparatorColor = gdevelopTheme.toolbar.separatorColor;
  const textColorPrimary = gdevelopTheme.text.color.primary;

  const inGameEditorSettings = React.useMemo<InGameEditorSettings>(
    () => ({
      theme: {
        iconButtonSelectedBackgroundColor,
        iconButtonSelectedColor,
        toolbarBackgroundColor,
        toolbarSeparatorColor,
        textColorPrimary,
      },
    }),
    [
      iconButtonSelectedBackgroundColor,
      iconButtonSelectedColor,
      toolbarBackgroundColor,
      toolbarSeparatorColor,
      textColorPrimary,
    ]
  );

  return inGameEditorSettings;
};
