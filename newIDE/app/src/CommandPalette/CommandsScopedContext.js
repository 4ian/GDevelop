// @flow
import * as React from 'react';
import {
  CommandManagerInterface,
  type Command,
  type NamedCommand,
} from './CommandManager';
import CommandsContext from './CommandsContext';
import useRefInit from './UseRefInitHook';

class ScopedCommandManager implements CommandManagerInterface {
  commands: { [string]: Command };
  _centralManager: CommandManagerInterface;
  _isActive: boolean;

  constructor(centralCommandManager) {
    this.commands = {};
    this._isActive = false;
    this._centralManager = centralCommandManager;
  }

  setActive = (active: boolean) => {
    this._isActive = active;
  };

  registerCommand = (commandName: string, command: Command) => {
    this.commands[commandName] = command;
    if (this._isActive)
      this._centralManager.registerCommand(commandName, command);
  };

  deregisterCommand = (commandName: string) => {
    delete this.commands[commandName];
    if (this._isActive) this._centralManager.deregisterCommand(commandName);
  };

  registerAllCommandsToCentralManager = () => {
    Object.keys(this.commands).forEach(commandName => {
      this._centralManager.registerCommand(
        commandName,
        this.commands[commandName]
      );
    });
  };

  deregisterAllCommandsFromCentralManager = () => {
    Object.keys(this.commands).forEach(commandName => {
      this._centralManager.deregisterCommand(commandName);
    });
  };

  getAllNamedCommands = () => {
    return Object.keys(this.commands).map<NamedCommand>(commandName => {
      const cmd = this.commands[commandName];
      return { ...cmd, name: commandName };
    });
  };
}

type Props = {|
  children: React.Node,
  active: boolean,
|};

const CommandsContextScopedProvider = (props: Props) => {
  const centralManager = React.useContext(CommandsContext);
  const scopedManager = useRefInit(
    () => new ScopedCommandManager(centralManager)
  );

  React.useEffect(
    () => {
      if (!props.active) return;
      scopedManager.setActive(true);
      scopedManager.registerAllCommandsToCentralManager();
      return () => {
        scopedManager.setActive(false);
        scopedManager.deregisterAllCommandsFromCentralManager();
      };
    },
    [props.active, scopedManager]
  );

  return (
    <CommandsContext.Provider value={scopedManager}>
      {props.children}
    </CommandsContext.Provider>
  );
};

export default CommandsContextScopedProvider;
