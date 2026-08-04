// @flow
import CommandManager from './CommandManager';

describe('CommandManager', () => {
  test('last registration wins for the same command name', () => {
    const manager = new CommandManager();
    const first = { handler: () => {} };
    const second = { handler: () => {} };

    manager.registerCommand('ADD_STANDARD_EVENT', first);
    manager.registerCommand('ADD_STANDARD_EVENT', second);

    expect(manager.getNamedCommand('ADD_STANDARD_EVENT')).toEqual({
      name: 'ADD_STANDARD_EVENT',
      handler: second.handler,
    });
  });

  test('deregister only removes the owned command object', () => {
    const manager = new CommandManager();
    const first = { handler: () => {} };
    const second = { handler: () => {} };

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
    manager.registerCommand('ADD_STANDARD_EVENT', { handler: () => {} });

    manager.deregisterCommand('ADD_STANDARD_EVENT');

    expect(manager.getNamedCommand('ADD_STANDARD_EVENT')).toBeNull();
  });
});
