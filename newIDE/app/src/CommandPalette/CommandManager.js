// @flow
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';

type CommandHandler = () => void | Promise<void>;

export type Command = {|
  displayText: MessageDescriptor,
  enabled: boolean,
  handler: CommandHandler,
|};

export type NamedCommand = {|
  name: string,
  ...Command,
|};

export type CompoundCommandOption<T> = {|
  value: T,
  handler: CommandHandler,
  text: string,
  iconSrc?: string,
|};

export type CompoundCommand<T> = {|
  displayText: MessageDescriptor,
  enabled: boolean,
  generateOptions: () => Array<CompoundCommandOption<T>>,
|};

export type NamedCompoundCommand<T> = {|
  name: string,
  ...CompoundCommand<T>,
|};

export default class CommandManager {
  commands: { [string]: Command };
  compoundCommands: { [string]: CompoundCommand<any> };
  _isScoped: boolean;

  constructor(scoped: ?boolean) {
    this.commands = {};
    this.compoundCommands = {};
    this._isScoped = scoped || false;
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

  registerCompoundCommand = <T>(
    commandName: string,
    command: CompoundCommand<T>
  ) => {
    if (this.compoundCommands[commandName])
      return console.warn(
        `Tried to register command ${commandName}, but it is already registered.`
      );
    this.compoundCommands[commandName] = command;
  };

  deregisterCompoundCommand = (commandName: string) => {
    if (!this.compoundCommands[commandName])
      return console.warn(
        `Tried to deregister command ${commandName}, but it is not registered.`
      );
    delete this.compoundCommands[commandName];
  };

  getAllNamedCommands = () => {
    return Object.keys(this.commands).map<NamedCommand>(commandName => {
      const cmd = this.commands[commandName];
      return { ...cmd, name: commandName };
    });
  };

  getAllNamedCompoundCommands = () => {
    return Object.keys(this.compoundCommands).map<NamedCompoundCommand<any>>(
      commandName => {
        const cmd = this.compoundCommands[commandName];
        return { ...cmd, name: commandName };
      }
    );
  };

  getAllCommands = () => {
    return [
      ...this.getAllNamedCommands(),
      ...this.getAllNamedCompoundCommands(),
    ];
  };
}
