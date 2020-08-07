// @flow
import * as React from 'react';
import { type CommandWithOptions, type SimpleCommand } from './CommandManager';
import CommandsContext from './CommandsContext';
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
