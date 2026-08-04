// @flow
import CommandManager, { type SimpleCommand } from './CommandManager';
import { ScopedCommandManager } from './CommandsScopedContext';

/**
 * Each fake command has its own handler, so that the handler identity tells
 * which command was found by a manager.
 */
const createFakeCommand = (): SimpleCommand => ({
  handler: () => {},
});

describe('ScopedCommandManager', () => {
  it('does not remove the command of another scope when deactivated', () => {
    const centralManager = new CommandManager();
    const firstScope = new ScopedCommandManager(centralManager);
    const secondScope = new ScopedCommandManager(centralManager);

    // Two editors registering the same command are active at the same time
    // (for example, two events editors in two panes of the same window).
    const firstScopeCommand = createFakeCommand();
    firstScope.setActive(true);
    firstScope.registerCommand('ADD_STANDARD_EVENT', firstScopeCommand);
    secondScope.setActive(true);
    // This registration is refused by the central manager (first one wins).
    secondScope.registerCommand('ADD_STANDARD_EVENT', createFakeCommand());

    // The second scope is deactivated (its tab is no longer the current one):
    // it must not remove the command registered by the first scope.
    secondScope.setActive(false);
    secondScope.deregisterAllCommandsFromCentralManager();

    const namedCommand = centralManager.getNamedCommand('ADD_STANDARD_EVENT');
    expect(namedCommand && namedCommand.handler).toBe(
      firstScopeCommand.handler
    );
  });

  it('removes its own command from the central manager when deactivated', () => {
    const centralManager = new CommandManager();
    const scope = new ScopedCommandManager(centralManager);

    scope.setActive(true);
    scope.registerCommand('ADD_STANDARD_EVENT', createFakeCommand());

    scope.setActive(false);
    scope.deregisterAllCommandsFromCentralManager();

    expect(centralManager.getNamedCommand('ADD_STANDARD_EVENT')).toBeNull();
  });

  it('does not deregister a command owned by someone else', () => {
    const centralManager = new CommandManager();
    const scope = new ScopedCommandManager(centralManager);

    const scopeCommand = createFakeCommand();
    scope.setActive(true);
    scope.registerCommand('ADD_STANDARD_EVENT', scopeCommand);

    // A stale command object (from a previous render for example) must not
    // remove the currently registered one.
    scope.deregisterCommand('ADD_STANDARD_EVENT', createFakeCommand());

    const namedCommand = scope.getNamedCommand('ADD_STANDARD_EVENT');
    expect(namedCommand && namedCommand.handler).toBe(scopeCommand.handler);

    // Deregistering without a command object still removes it, in the scope
    // and in the central manager.
    scope.deregisterCommand('ADD_STANDARD_EVENT');
    expect(centralManager.getNamedCommand('ADD_STANDARD_EVENT')).toBeNull();
  });
});
