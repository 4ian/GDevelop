// @flow
import CommandManager, { type SimpleCommand } from './CommandManager';

describe('CommandManager', () => {
  test('last registration wins for the same command name', () => {
    const manager = new CommandManager();
    const first: SimpleCommand = {
      handler: () => {
        return;
      },
    };
    const second: SimpleCommand = {
      handler: () => {
        return;
      },
    };

    manager.registerCommand('ADD_STANDARD_EVENT', first);
    manager.registerCommand('ADD_STANDARD_EVENT', second);

    expect(manager.getNamedCommand('ADD_STANDARD_EVENT')).toEqual({
      name: 'ADD_STANDARD_EVENT',
      handler: second.handler,
    });
  });

  test('deregister only removes the owned command object', () => {
    const manager = new CommandManager();
    const first: SimpleCommand = {
      handler: () => {
        return;
      },
    };
    const second: SimpleCommand = {
      handler: () => {
        return;
      },
    };

    manager.registerCommand('ADD_STANDARD_EVENT', first);
    manager.registerCommand('ADD_STANDARD_EVENT', second);

    // Simulates a blurred window cleaning up after a focused window took over.
    manager.deregisterCommand('ADD_STANDARD_EVENT', first);

    expect(manager.getNamedCommand('ADD_STANDARD_EVENT')).toEqual({
      name: 'ADD_STANDARD_EVENT',
      handler: second.handler,
    });

    manager.deregisterCommand('ADD_STANDARD_EVENT', second);
    expect(manager.getNamedCommand('ADD_STANDARD_EVENT')).toBeNull();
  });

  test('deregister without a command object still removes the command', () => {
    const manager = new CommandManager();
    const command: SimpleCommand = {
      handler: () => {
        return;
      },
    };
    manager.registerCommand('ADD_STANDARD_EVENT', command);

    manager.deregisterCommand('ADD_STANDARD_EVENT');

    expect(manager.getNamedCommand('ADD_STANDARD_EVENT')).toBeNull();
  });
});
