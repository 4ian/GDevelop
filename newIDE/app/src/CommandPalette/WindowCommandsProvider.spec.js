// @flow
import CommandManager, {
  type CommandManagerInterface,
  type SimpleCommand,
} from './CommandManager';
import { type CommandName } from './CommandsList';
import { WindowCommandManager } from './WindowCommandsProvider';

/**
 * Each fake command has its own handler, so that the handler identity tells
 * which command was found by a manager.
 */
const createFakeCommand = (): SimpleCommand => ({
  handler: () => {},
});

const getHandler = (
  commandManager: CommandManagerInterface,
  commandName: CommandName
): (() => void | Promise<void>) => {
  const namedCommand = commandManager.getNamedCommand(commandName);
  if (!namedCommand || !namedCommand.handler) {
    throw new Error(`Expected ${commandName} to have a handler.`);
  }
  return namedCommand.handler;
};

describe('WindowCommandManager', () => {
  it('keeps the commands of the window out of the shared command manager', () => {
    const sharedCommandManager = new CommandManager();
    const windowCommandManager = new WindowCommandManager(sharedCommandManager);

    const windowCommand = createFakeCommand();
    windowCommandManager.registerCommand('ADD_STANDARD_EVENT', windowCommand);

    // Another window would not find this command, and so would not run it.
    expect(
      sharedCommandManager.getNamedCommand('ADD_STANDARD_EVENT')
    ).toBeNull();
    expect(sharedCommandManager.getAllNamedCommands()).toHaveLength(0);

    expect(getHandler(windowCommandManager, 'ADD_STANDARD_EVENT')).toBe(
      windowCommand.handler
    );
  });

  it('finds the shared commands that are not overridden by the window', () => {
    const sharedCommandManager = new CommandManager();
    const windowCommandManager = new WindowCommandManager(sharedCommandManager);

    const saveProjectCommand = createFakeCommand();
    sharedCommandManager.registerCommand('SAVE_PROJECT', saveProjectCommand);

    expect(getHandler(windowCommandManager, 'SAVE_PROJECT')).toBe(
      saveProjectCommand.handler
    );
    expect(
      windowCommandManager.getNamedCommand('ADD_STANDARD_EVENT')
    ).toBeFalsy();
  });

  it('gives priority to the commands of the window over the shared ones', () => {
    const sharedCommandManager = new CommandManager();
    const windowCommandManager = new WindowCommandManager(sharedCommandManager);

    const sharedCommand = createFakeCommand();
    const windowCommand = createFakeCommand();
    sharedCommandManager.registerCommand('ADD_STANDARD_EVENT', sharedCommand);
    windowCommandManager.registerCommand('ADD_STANDARD_EVENT', windowCommand);

    expect(getHandler(windowCommandManager, 'ADD_STANDARD_EVENT')).toBe(
      windowCommand.handler
    );

    // The other windows are not impacted and keep running the shared command.
    expect(getHandler(sharedCommandManager, 'ADD_STANDARD_EVENT')).toBe(
      sharedCommand.handler
    );
  });

  it('lists the commands of the window and the shared ones, without duplicates', () => {
    const sharedCommandManager = new CommandManager();
    const windowCommandManager = new WindowCommandManager(sharedCommandManager);

    const windowCommand = createFakeCommand();
    sharedCommandManager.registerCommand('SAVE_PROJECT', createFakeCommand());
    sharedCommandManager.registerCommand(
      'ADD_STANDARD_EVENT',
      createFakeCommand()
    );
    windowCommandManager.registerCommand('ADD_STANDARD_EVENT', windowCommand);

    const namedCommands = windowCommandManager.getAllNamedCommands();
    expect(namedCommands.map(namedCommand => namedCommand.name).sort()).toEqual(
      ['ADD_STANDARD_EVENT', 'SAVE_PROJECT']
    );

    const listedAddStandardEvent = namedCommands.find(
      namedCommand => namedCommand.name === 'ADD_STANDARD_EVENT'
    );
    expect(listedAddStandardEvent && listedAddStandardEvent.handler).toBe(
      windowCommand.handler
    );
  });

  it('only deregisters the commands of the window', () => {
    const sharedCommandManager = new CommandManager();
    const windowCommandManager = new WindowCommandManager(sharedCommandManager);

    const sharedCommand = createFakeCommand();
    sharedCommandManager.registerCommand('ADD_STANDARD_EVENT', sharedCommand);
    windowCommandManager.registerCommand(
      'ADD_STANDARD_EVENT',
      createFakeCommand()
    );

    // Happens when the editor of the window is closed (or popped back in).
    windowCommandManager.deregisterCommand('ADD_STANDARD_EVENT');

    expect(getHandler(sharedCommandManager, 'ADD_STANDARD_EVENT')).toBe(
      sharedCommand.handler
    );

    // The window now falls back on the shared command.
    expect(getHandler(windowCommandManager, 'ADD_STANDARD_EVENT')).toBe(
      sharedCommand.handler
    );
  });
});
