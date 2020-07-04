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

export default class CommandManager {
  commands: { [string]: Command };

  constructor() {
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
