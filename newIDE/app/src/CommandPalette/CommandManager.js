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

  registerCommand = (cmdName: string, cmdOpts: Command) => {
    if (this.commands[cmdName])
      return console.warn(`Command ${cmdName} is already registered.`);
    this.commands[cmdName] = cmdOpts;
    console.warn(`Command ${cmdName} registered!`);
  };

  deregisterCommand = (cmdName: string) => {
    if (!this.commands[cmdName])
      return console.warn(`Command ${cmdName} is not registered.`);
    delete this.commands[cmdName];
    console.warn(`Command ${cmdName} unregistered!`);
  };

  getAllNamedCommands = () => {
    return Object.keys(this.commands).map<NamedCommand>(cmdName => {
      const cmd = this.commands[cmdName];
      return { ...cmd, name: cmdName };
    });
  };
}
