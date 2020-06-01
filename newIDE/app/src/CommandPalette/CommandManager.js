// @flow
type CmdHandler = () => void | Promise<void>;

export type GlobalCommand = {
  displayText: string,
  enabled: boolean,
  handler: null | CmdHandler,
};

export default class CommandManager {
  globalCommands: { [string]: GlobalCommand };

  constructor() {
    this.globalCommands = {};
    console.warn('Initialised command manager');
  }

  registerGlobal = (cmdName: string, cmdOpts: GlobalCommand) => {
    if (this.globalCommands[cmdName])
      return console.warn(`Command ${cmdName} is already registered.`);
    this.globalCommands[cmdName] = cmdOpts;
    console.warn(`Command ${cmdName} registered!`);
  };

  deregisterGlobal = (cmdName: string) => {
    if (!this.globalCommands[cmdName])
      return console.warn(`Command ${cmdName} is not registered.`);
    delete this.globalCommands[cmdName];
    console.warn(`Command ${cmdName} unregistered!`);
  };
}
