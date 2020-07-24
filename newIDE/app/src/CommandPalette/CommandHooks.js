// @flow
import * as React from 'react';
import { type CommandWithOptions, type SimpleCommand } from './CommandManager';
import CommandsContext from './CommandsContext';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import isDialogOpen from '../UI/OpenedDialogChecker';
import { type CommandName } from './CommandsList';

/**
 * React hook for dynamically registering and deregistering a simple command
 */
export const useCommand = (
  commandName: CommandName,
  enabled: boolean,
  command: SimpleCommand
) => {
  const commandManager = React.useContext(CommandsContext);
  const { handler } = command;
  React.useEffect(
    () => {
      if (!enabled) return;
      commandManager.registerCommand(commandName, { handler });
      return () => commandManager.deregisterCommand(commandName);
    },
    [commandManager, commandName, enabled, handler]
  );
};

/**
 * React hook for dynamically registering and deregistering command with options
 */
export const useCommandWithOptions = (
  commandName: CommandName,
  enabled: boolean,
  command: CommandWithOptions
) => {
  const commandManager = React.useContext(CommandsContext);
  const { generateOptions } = command;
  React.useEffect(
    () => {
      if (!enabled) return;
      commandManager.registerCommand(commandName, { generateOptions });
      return () => commandManager.deregisterCommand(commandName);
    },
    [commandManager, commandName, enabled, generateOptions]
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
          if (!isDialogOpen()) onOpen();
        }
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    },
    [onOpen, values.useCommandPalette]
  );
};

/**
 * React component for using useCommand hook in
 * class components
 */
export const UseCommandHook = (props: {|
  name: CommandName,
  enabled: boolean,
  command: SimpleCommand,
|}) => {
  useCommand(props.name, props.enabled, props.command);
  return null;
};

/**
 * React component for using useCommandWithOptions
 * hook in class components
 */
export const UseCommandWithOptionsHook = (props: {|
  name: CommandName,
  enabled: boolean,
  command: CommandWithOptions,
|}) => {
  useCommandWithOptions(props.name, props.enabled, props.command);
  return null;
};
