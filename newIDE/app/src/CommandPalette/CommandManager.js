// @flow
import { type Node } from 'react';
import { type CommandName } from './CommandsList';
type CommandHandler = () => void | Promise<void>;

export type SimpleCommand = {|
  handler: CommandHandler,
  icon?: Node,
|};

export type CommandOption = {|
  handler: CommandHandler,
  text: string,
  iconSrc?: string,
|};

export type CommandWithOptions = {|
  generateOptions: () => Array<CommandOption>,
|};

export type Command = SimpleCommand | CommandWithOptions;

export type NamedCommand = {|
  name: CommandName,
  ...Command,
|};

export type NamedCommandWithOptions = {|
  name: CommandName,
  ...CommandWithOptions,
|};

export interface CommandManagerInterface {
  registerCommand: (commandName: CommandName, command: Command) => void;
  deregisterCommand: (commandName: CommandName, command?: Command) => void;
  getNamedCommand: (commandName: CommandName) => ?NamedCommand;
  getAllNamedCommands: () => Array<NamedCommand>;
}

export default class CommandManager implements CommandManagerInterface {
  _commands: { [CommandName]: Command };

  constructor() {
    this._commands = {};
  }

  registerCommand = (commandName: CommandName, command: Command) => {
    // Last registration wins. This allows a newly focused editor/window to take
    // ownership of a command even if a previous scope has not finished
    // deregistering yet (focus/blur can commit in separate React updates).
    this._commands[commandName] = command;
  };

  deregisterCommand = (commandName: CommandName, command?: Command) => {
    // If a specific command object is provided, only remove it when it is still
    // the registered one. This prevents a blurred window from deleting the
    // command that a newly focused window just registered.
    if (command && this._commands[commandName] !== command) return;
    delete this._commands[commandName];
  };

  getNamedCommand = (commandName: CommandName): any => {
    const command = this._commands[commandName];
    if (command) return { name: commandName, ...(command: Command) };
    return null;
  };

  getAllNamedCommands = (): any => {
    // $FlowFixMe[missing-type-arg]
    return Object.keys(this._commands).map<NamedCommand>(commandName => {
      const command = this._commands[commandName];
      return { ...(command: Command), name: commandName };
    });
  };
}
