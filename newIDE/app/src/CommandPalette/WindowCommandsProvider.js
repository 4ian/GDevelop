// @flow
import * as React from 'react';
import CommandManager, {
  type CommandManagerInterface,
  type Command,
  type NamedCommand,
} from './CommandManager';
import { type CommandName } from './CommandsList';
import CommandsContext from './CommandsContext';
import useValueWithInit from '../Utils/UseRefInitHook';

/**
 * A command manager for the editors displayed in a single window (the main
 * window or a popped out editor window).
 *
 * Commands registered by the editors of this window are stored in this manager
 * only: they must not be sent to the command manager shared by all the windows.
 * Otherwise, all the windows would be sharing a single command registry, and a
 * keyboard shortcut pressed in a window could run the command of an editor
 * displayed in another window (on another screen, for instance).
 *
 * Commands that are not specific to an editor (saving the project, launching a
 * preview...) are registered on the shared command manager: they stay reachable
 * from this window thanks to a fallback on it.
 */
export class WindowCommandManager implements CommandManagerInterface {
  _windowCommands: CommandManager;
  _sharedCommandManager: CommandManagerInterface;

  constructor(sharedCommandManager: CommandManagerInterface) {
    this._windowCommands = new CommandManager();
    this._sharedCommandManager = sharedCommandManager;
  }

  registerCommand = (commandName: CommandName, command: Command) => {
    this._windowCommands.registerCommand(commandName, command);
  };

  deregisterCommand = (commandName: CommandName, command?: Command) => {
    this._windowCommands.deregisterCommand(commandName, command);
  };

  getNamedCommand = (commandName: CommandName): ?NamedCommand => {
    return (
      this._windowCommands.getNamedCommand(commandName) ||
      this._sharedCommandManager.getNamedCommand(commandName)
    );
  };

  getAllNamedCommands = (): Array<NamedCommand> => {
    const windowNamedCommands = this._windowCommands.getAllNamedCommands();
    const windowCommandNames = new Set(
      windowNamedCommands.map(namedCommand => namedCommand.name)
    );

    // Commands of this window take precedence over the shared ones.
    return [
      ...windowNamedCommands,
      ...this._sharedCommandManager
        .getAllNamedCommands()
        .filter(namedCommand => !windowCommandNames.has(namedCommand.name)),
    ];
  };
}

type Props = {|
  children: React.Node,
|};

/**
 * Isolates the commands registered by its children - and so the keyboard
 * shortcuts running them - from the commands of the other windows.
 * To be used around the editors of a window (see `WindowCommandManager`).
 */
const WindowCommandsProvider = (props: Props): React.Node => {
  const sharedCommandManager = React.useContext(CommandsContext);
  const windowCommandManager = useValueWithInit(
    () => new WindowCommandManager(sharedCommandManager)
  );

  return (
    <CommandsContext.Provider value={windowCommandManager}>
      {props.children}
    </CommandsContext.Provider>
  );
};

export default WindowCommandsProvider;
