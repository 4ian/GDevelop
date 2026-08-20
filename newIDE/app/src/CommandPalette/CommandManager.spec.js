// @flow
import CommandManager, { type SimpleCommand } from './CommandManager';

/**
 * Each fake command has its own handler, so that the handler identity tells
 * which command was found by the manager.
 */
const createFakeCommand = (): SimpleCommand => ({
  handler: () => {},
});

describe('CommandManager', () => {
  it('keeps the first registered command for a given name', () => {
    const manager = new CommandManager();
    const firstCommand = createFakeCommand();
    const secondCommand = createFakeCommand();

    manager.registerCommand('ADD_STANDARD_EVENT', firstCommand);
    manager.registerCommand('ADD_STANDARD_EVENT', secondCommand);

    const namedCommand = manager.getNamedCommand('ADD_STANDARD_EVENT');
    expect(namedCommand && namedCommand.handler).toBe(firstCommand.handler);
  });

  it('does not deregister a command owned by someone else', () => {
    const manager = new CommandManager();
    const registeredCommand = createFakeCommand();
    const refusedCommand = createFakeCommand();

    manager.registerCommand('ADD_STANDARD_EVENT', registeredCommand);
    manager.registerCommand('ADD_STANDARD_EVENT', refusedCommand);

    // The component whose registration was refused is unmounted or
    // deactivated: it must not remove the command it does not own.
    manager.deregisterCommand('ADD_STANDARD_EVENT', refusedCommand);

    const namedCommand = manager.getNamedCommand('ADD_STANDARD_EVENT');
    expect(namedCommand && namedCommand.handler).toBe(
      registeredCommand.handler
    );

    // The owner can still deregister its command.
    manager.deregisterCommand('ADD_STANDARD_EVENT', registeredCommand);
    expect(manager.getNamedCommand('ADD_STANDARD_EVENT')).toBeNull();
  });

  it('deregisters a command by name when no command is given', () => {
    const manager = new CommandManager();
    manager.registerCommand('ADD_STANDARD_EVENT', createFakeCommand());

    manager.deregisterCommand('ADD_STANDARD_EVENT');

    expect(manager.getNamedCommand('ADD_STANDARD_EVENT')).toBeNull();
  });
});
