// @flow
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';

type CommandHandler = () => void | Promise<void>;

export type SimpleCommand = {|
  displayText: MessageDescriptor,
  enabled: boolean,
  handler: CommandHandler,
|};

export type CommandOption<T> = {|
  value: T,
  handler: CommandHandler,
  text: string,
  iconSrc?: string,
|};

export type CommandWithOptions<T> = {|
  displayText: MessageDescriptor,
  enabled: boolean,
  generateOptions: () => Array<CommandOption<T>>,
|};

export type Command = SimpleCommand | CommandWithOptions<any>;

export type NamedCommand = {|
  name: string,
  ...Command,
|};

export type NamedCommandWithOptions<T> = {|
  name: string,
  ...CommandWithOptions<T>,
|};

export interface CommandManagerInterface {
  registerCommand: (commandName: string, command: Command) => void;
  deregisterCommand: (commandName: string) => void;
  getAllNamedCommands: () => Array<NamedCommand>;
}

export default class CommandManager implements CommandManagerInterface {
  commands: { [string]: Command };

  constructor(scoped: ?boolean) {
    this.commands = {};
  }

  registerCommand = (commandName: string, command: Command) => {
    if (this.commands[commandName])
      return console.warn(
        `Tried to register command ${commandName}, but it is already registered.`
      );
    this.commands[commandName] = command;
  };

  deregisterCommand = (commandName: string) => {
    if (!this.commands[commandName])
      return console.warn(
        `Tried to deregister command ${commandName}, but it is not registered.`
      );
    delete this.commands[commandName];
  };

  getAllNamedCommands = () => {
    return Object.keys(this.commands).map<NamedCommand>(commandName => {
      const cmd = this.commands[commandName];
      return { ...cmd, name: commandName };
    });
  };
}
