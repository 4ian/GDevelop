// @flow
import * as React from 'react';
import {
  type CommandManagerInterface,
  type Command,
  type NamedCommand,
} from './CommandManager';
import { type CommandName } from './CommandsList';
import CommandsContext from './CommandsContext';
import useValueWithInit from '../Utils/UseRefInitHook';

/**
 * A command manager for the editor of a single tab.
 *
 * Editors of background tabs stay mounted, so their commands stay registered.
 * This manager keeps them parked here, and only publishes them to the command
 * manager of the window while the tab is the active one - so that a keyboard
 * shortcut or the command palette only sees the commands of the editor
 * currently displayed.
 */
export class TabCommandManager implements CommandManagerInterface {
  _commands: { [CommandName]: Command };
  _windowCommandManager: CommandManagerInterface;
  _isActive: boolean;

  constructor(windowCommandManager: CommandManagerInterface) {
    this._commands = {};
    this._isActive = false;
    this._windowCommandManager = windowCommandManager;
  }

  setActive = (active: boolean) => {
    this._isActive = active;
  };

  registerCommand = (commandName: CommandName, command: Command) => {
    this._commands[commandName] = command;
    if (this._isActive)
      this._windowCommandManager.registerCommand(commandName, command);
  };

  deregisterCommand = (commandName: CommandName, command?: Command) => {
    const registeredCommand = this._commands[commandName];
    if (command && registeredCommand !== command) return;
    delete this._commands[commandName];
    if (this._isActive && registeredCommand) {
      this._windowCommandManager.deregisterCommand(
        commandName,
        registeredCommand
      );
    }
  };

  registerAllCommandsToWindowManager = () => {
    Object.keys(this._commands).forEach(commandName => {
      this._windowCommandManager.registerCommand(
        commandName,
        this._commands[commandName]
      );
    });
  };

  deregisterAllCommandsFromWindowManager = () => {
    Object.keys(this._commands).forEach(commandName => {
      this._windowCommandManager.deregisterCommand(
        commandName,
        this._commands[commandName]
      );
    });
  };

  getAllNamedCommands = (): Array<NamedCommand> => {
    // $FlowFixMe[missing-type-arg]
    return Object.keys(this._commands).map<NamedCommand>(commandName => {
      const cmd = this._commands[commandName];
      return { ...cmd, name: commandName };
    });
  };

  getNamedCommand = (commandName: CommandName): ?NamedCommand => {
    const command = this._commands[commandName];
    if (command) return { name: commandName, ...(command: Command) };
    return this._windowCommandManager.getNamedCommand(commandName);
  };
}

type Props = {|
  children: React.Node,
  active: boolean,
|};

/**
 * Publishes the commands registered by its children (the editor of a tab) to
 * the command manager of the window, only while `active` is true (the tab is
 * the active one of its pane). See `TabCommandManager`.
 */
const ActiveTabCommandsProvider = (props: Props): React.Node => {
  const windowCommandManager = React.useContext(CommandsContext);
  const tabCommandManager = useValueWithInit(
    () => new TabCommandManager(windowCommandManager)
  );

  React.useEffect(
    () => {
      if (!props.active) return;
      tabCommandManager.setActive(true);
      tabCommandManager.registerAllCommandsToWindowManager();
      return () => {
        tabCommandManager.setActive(false);
        tabCommandManager.deregisterAllCommandsFromWindowManager();
      };
    },
    [props.active, tabCommandManager]
  );

  return (
    <CommandsContext.Provider value={tabCommandManager}>
      {props.children}
    </CommandsContext.Provider>
  );
};

export default ActiveTabCommandsProvider;
