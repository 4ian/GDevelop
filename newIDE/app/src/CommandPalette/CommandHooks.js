// @flow
import * as React from 'react';
import { type Command, type CompoundCommand } from './CommandManager';
import CommandsContext from './CommandsContext';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';

export const useCommand = (commandName: string, command: Command) => {
  const commandManager = React.useContext(CommandsContext);
  const { displayText, enabled, handler } = command;
  React.useEffect(
    () => {
      if (!enabled) return;
      commandManager.registerCommand(commandName, {
        displayText,
        enabled,
        handler,
      });
      return () => commandManager.deregisterCommand(commandName);
    },
    [commandManager, commandName, displayText, enabled, handler]
  );
};

export const useCompoundCommand = <T>(
  commandName: string,
  command: CompoundCommand<T>
) => {
  const commandManager = React.useContext(CommandsContext);
  const { displayText, enabled, generateOptions } = command;
  React.useEffect(
    () => {
      if (!enabled) return;
      commandManager.registerCompoundCommand(commandName, {
        displayText,
        enabled,
        generateOptions,
      });
      return () => commandManager.deregisterCompoundCommand(commandName);
    },
    [commandManager, commandName, displayText, enabled, generateOptions]
  );
};

/**
 * Binds Ctrl+P(or Cmd+P) to opening the command palette
 * only if there's no dialog or overlay open on screen
 */
export const useKeyboardShortcutForCommandPalette = (onOpen: () => void) => {
  const { values } = React.useContext(PreferencesContext);
  React.useEffect(
    () => {
      const handler = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.code === 'KeyP') {
          if (!values.useCommandPalette) return;
          // Don't open browser's print dialog if palette is enabled
          e.preventDefault();
          // If currently focused element is inside MainFrame div, we can
          // be sure that no dialog or overlay is opened.
          // But clicking on some empty spaces like in properties panel leads
          // to <body> element getting focused, so we also need to check if
          // currently focused element is <body>.
          const body = document.body;
          const activeEl = document.activeElement;
          const mainFrame = document.querySelector('div.main-frame');
          const isInMainframe = mainFrame && mainFrame.contains(activeEl);
          const isBody = activeEl === body;
          if (!isBody && !isInMainframe) return;
          onOpen();
        }
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    },
    [onOpen, values.useCommandPalette]
  );
};

export const UseCommandHook = (props: {
  commandName: string,
  command: Command,
}) => {
  useCommand(props.commandName, props.command);
  return null;
};

export const UseCompoundCommandHook = <T>(props: {
  commandName: string,
  command: CompoundCommand<T>,
}) => {
  useCompoundCommand(props.commandName, props.command);
  return null;
};
