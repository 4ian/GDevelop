// @flow
import CommandManager, {
  type CommandManagerInterface,
  type NamedCommand,
} from './CommandManager';
import { ScopedCommandManager } from './CommandsScopedContext';

const getHandler = (
  commandManager: CommandManagerInterface,
  commandName: 'ADD_STANDARD_EVENT' | 'SAVE_PROJECT'
): (() => void | Promise<void>) => {
  const command: ?NamedCommand = commandManager.getNamedCommand(commandName);
  if (!command || !command.handler) {
    throw new Error(`Expected ${commandName} to have a handler.`);
  }
  return command.handler;
};

describe('ScopedCommandManager', () => {
  it('keeps inactive commands local and falls back to its parent', () => {
    const parentManager = new CommandManager();
    const localManager = new ScopedCommandManager(parentManager);
    const saveProject = jest.fn();
    const addEvent = jest.fn();

    parentManager.registerCommand('SAVE_PROJECT', { handler: saveProject });
    localManager.registerCommand('ADD_STANDARD_EVENT', { handler: addEvent });

    getHandler(localManager, 'ADD_STANDARD_EVENT')();
    getHandler(localManager, 'SAVE_PROJECT')();

    expect(addEvent).toHaveBeenCalledTimes(1);
    expect(saveProject).toHaveBeenCalledTimes(1);
    expect(parentManager.getNamedCommand('ADD_STANDARD_EVENT')).toBeNull();
  });

  it('isolates commands forwarded by an active nested editor scope', () => {
    const rootManager = new CommandManager();
    const windowManager = new ScopedCommandManager(rootManager);
    const editorManager = new ScopedCommandManager(windowManager);
    const mainWindowAddEvent = jest.fn();
    const poppedOutWindowAddEvent = jest.fn();

    rootManager.registerCommand('ADD_STANDARD_EVENT', {
      handler: mainWindowAddEvent,
    });
    editorManager.setActive(true);
    editorManager.registerCommand('ADD_STANDARD_EVENT', {
      handler: poppedOutWindowAddEvent,
    });

    getHandler(windowManager, 'ADD_STANDARD_EVENT')();
    getHandler(rootManager, 'ADD_STANDARD_EVENT')();

    expect(poppedOutWindowAddEvent).toHaveBeenCalledTimes(1);
    expect(mainWindowAddEvent).toHaveBeenCalledTimes(1);

    editorManager.deregisterCommand('ADD_STANDARD_EVENT');

    getHandler(windowManager, 'ADD_STANDARD_EVENT')();
    expect(mainWindowAddEvent).toHaveBeenCalledTimes(2);
  });
});
