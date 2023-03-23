// @flow
import { type Node } from 'react';
import { type CommandName } from './CommandsList';
import { type AlgoliaSearchHit } from '../Utils/AlgoliaSearch';
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

export type GoToWikiCommand = {|
  hit: AlgoliaSearchHit,
  handler: CommandHandler,
|};

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
  deregisterCommand: (commandName: CommandName) => void;
  getNamedCommand: (commandName: CommandName) => ?NamedCommand;
  getAllNamedCommands: () => Array<NamedCommand>;
}

export default class CommandManager implements CommandManagerInterface {
  _commands: { [CommandName]: Command };

  constructor() {
    this._commands = {};
  }

  registerCommand = (commandName: CommandName, command: Command) => {
    if (this._commands[commandName])
      return console.warn(
        `Tried to register command ${commandName}, but it is already registered.`
      );
    this._commands[commandName] = command;
  };

  deregisterCommand = (commandName: CommandName) => {
    if (!this._commands[commandName])
      return console.warn(
        `Tried to deregister command ${commandName}, but it is not registered.`
      );
    delete this._commands[commandName];
  };

  getNamedCommand = (commandName: CommandName) => {
    const command = this._commands[commandName];
    if (command) return { name: commandName, ...(command: Command) };
    return null;
  };

  getAllNamedCommands = () => {
    return Object.keys(this._commands).map<NamedCommand>(commandName => {
      const command = this._commands[commandName];
      return { ...(command: Command), name: commandName };
    });
  };
}
