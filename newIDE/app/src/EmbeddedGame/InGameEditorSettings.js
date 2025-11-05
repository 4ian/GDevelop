// @flow
import * as React from 'react';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';

export type InGameEditorSettings = {
  theme: {
    iconButtonSelectedBackgroundColor: string,
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

  const inGameEditorSettings = React.useMemo<InGameEditorSettings>(
    () => ({
      theme: {
        iconButtonSelectedBackgroundColor,
      },
    }),
    [iconButtonSelectedBackgroundColor]
  );

  return inGameEditorSettings;
};
