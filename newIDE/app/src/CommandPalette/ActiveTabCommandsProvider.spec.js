// @flow
import CommandManager, { type SimpleCommand } from './CommandManager';
import { TabCommandManager } from './ActiveTabCommandsProvider';

/**
 * Each fake command has its own handler, so that the handler identity tells
 * which command was found by a manager.
 */
const createFakeCommand = (): SimpleCommand => ({
  handler: () => {},
});

describe('TabCommandManager', () => {
  it('does not remove the command of another tab when deactivated', () => {
    const windowCommandManager = new CommandManager();
    const firstTabManager = new TabCommandManager(windowCommandManager);
    const secondTabManager = new TabCommandManager(windowCommandManager);

    // Two editors registering the same command are active at the same time
    // (for example, two events editors in two panes of the same window).
    const firstTabCommand = createFakeCommand();
    firstTabManager.setActive(true);
    firstTabManager.registerCommand('ADD_STANDARD_EVENT', firstTabCommand);
    secondTabManager.setActive(true);
    // This registration is refused by the window manager (first one wins).
    secondTabManager.registerCommand('ADD_STANDARD_EVENT', createFakeCommand());

    // The second tab is deactivated (it's no longer the current one of its
    // pane): it must not remove the command registered by the first tab.
    secondTabManager.setActive(false);
    secondTabManager.deregisterAllCommandsFromWindowManager();

    const namedCommand = windowCommandManager.getNamedCommand(
      'ADD_STANDARD_EVENT'
    );
    expect(namedCommand && namedCommand.handler).toBe(firstTabCommand.handler);
  });

  it('removes its own command from the window manager when deactivated', () => {
    const windowCommandManager = new CommandManager();
    const tabManager = new TabCommandManager(windowCommandManager);

    tabManager.setActive(true);
    tabManager.registerCommand('ADD_STANDARD_EVENT', createFakeCommand());

    tabManager.setActive(false);
    tabManager.deregisterAllCommandsFromWindowManager();

    expect(
      windowCommandManager.getNamedCommand('ADD_STANDARD_EVENT')
    ).toBeNull();
  });

  it('does not deregister a command owned by someone else', () => {
    const windowCommandManager = new CommandManager();
    const tabManager = new TabCommandManager(windowCommandManager);

    const tabCommand = createFakeCommand();
    tabManager.setActive(true);
    tabManager.registerCommand('ADD_STANDARD_EVENT', tabCommand);

    // A stale command object (from a previous render for example) must not
    // remove the currently registered one.
    tabManager.deregisterCommand('ADD_STANDARD_EVENT', createFakeCommand());

    const namedCommand = tabManager.getNamedCommand('ADD_STANDARD_EVENT');
    expect(namedCommand && namedCommand.handler).toBe(tabCommand.handler);

    // Deregistering without a command object still removes it, in the tab
    // and in the window manager.
    tabManager.deregisterCommand('ADD_STANDARD_EVENT');
    expect(
      windowCommandManager.getNamedCommand('ADD_STANDARD_EVENT')
    ).toBeNull();
  });
});
