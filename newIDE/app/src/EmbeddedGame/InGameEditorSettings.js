// @flow
import * as React from 'react';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
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
  shortcuts: { [string]: string },
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

  // The shortcut map is a new object at each render: the shortcuts handled by
  // the in-game editor are serialized so that the settings only change when
  // one of these shortcuts really changed.
  const shortcutMap = useShortcutMap();
  const inGameEditorShortcutsJson = JSON.stringify(
    getCommandNamesHandledByInGameEditor().reduce(
      (shortcuts: { [CommandName]: string }, commandName) => {
        shortcuts[commandName] = shortcutMap[commandName] || '';
        return shortcuts;
      },
      {}
    )
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
      shortcuts: JSON.parse(inGameEditorShortcutsJson),
    }),
    [
      iconButtonSelectedBackgroundColor,
      iconButtonSelectedColor,
      toolbarBackgroundColor,
      toolbarSeparatorColor,
      textColorPrimary,
      inGameEditorShortcutsJson,
    ]
  );

  return inGameEditorSettings;
};
