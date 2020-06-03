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
    console.warn('Initialised command manager');
  }

  registerCommand = (commandName: string, command: Command) => {
    if (this.commands[commandName])
      return console.warn(`Command ${commandName} is already registered.`);
    this.commands[commandName] = command;
    console.warn(`Command ${commandName} registered!`);
  };

  deregisterCommand = (commandName: string) => {
    if (!this.commands[commandName])
      return console.warn(`Command ${commandName} is not registered.`);
    delete this.commands[commandName];
    console.warn(`Command ${commandName} unregistered!`);
  };

  getAllNamedCommands = () => {
    return Object.keys(this.commands).map<NamedCommand>(commandName => {
      const cmd = this.commands[commandName];
      return { ...cmd, name: commandName };
    });
  };
}
