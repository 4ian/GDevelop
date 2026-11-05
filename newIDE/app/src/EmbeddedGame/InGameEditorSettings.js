// @flow
import * as React from 'react';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { useShortcutMap } from '../KeyboardShortcuts';
import {
  getCommandNamesHandledByInGameEditor,
  type CommandName,
} from '../CommandPalette/CommandsList';

export type InGameEditorSettings = {
  theme: {
    iconButtonSelectedBackgroundColor: string,
    iconButtonSelectedColor: string,
    toolbarBackgroundColor: string,
    toolbarSeparatorColor: string,
    textColorPrimary: string,
  },
  /**
   * The shortcuts handled by the in-game editor, by command name, in the same
   * format as the IDE shortcuts (for example "Shift+KeyW"). An empty string
   * means that the command has no shortcut.
   */
  shortcuts: { [CommandName]: string },
  /**
   * When disabled, the in-game editor is only used as the 3D editor,
   * whatever the editor mode of the scene settings.
   */
  isRealTime2DEditorEnabled: boolean,
};

const commandNamesHandledByInGameEditor = getCommandNamesHandledByInGameEditor();

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
  const isRealTime2DEditorEnabled = React.useContext(PreferencesContext).values
    .useRealTime2DEditor;

  const shortcutMap = useShortcutMap();
  const shortcuts = React.useMemo(
    () =>
      commandNamesHandledByInGameEditor.reduce(
        (shortcuts: { [CommandName]: string }, commandName) => {
          shortcuts[commandName] = shortcutMap[commandName] || '';
          return shortcuts;
        },
        {}
      ),
    [shortcutMap]
  );

  const inGameEditorSettings = React.useMemo<InGameEditorSettings>(
    () => ({
      theme: {
        iconButtonSelectedBackgroundColor,
        iconButtonSelectedColor,
        toolbarBackgroundColor,
        toolbarSeparatorColor,
        textColorPrimary,
      },
      shortcuts,
      isRealTime2DEditorEnabled,
    }),
    [
      iconButtonSelectedBackgroundColor,
      iconButtonSelectedColor,
      toolbarBackgroundColor,
      toolbarSeparatorColor,
      textColorPrimary,
      shortcuts,
      isRealTime2DEditorEnabled,
    ]
  );

  return inGameEditorSettings;
};
