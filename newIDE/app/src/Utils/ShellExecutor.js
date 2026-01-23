// @flow
import optionalRequire from './OptionalRequire';

const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

/**
 * Runs a shell command in a new terminal window.
 * Only works in Electron (desktop) environment.
 */
export const runShellCommand = (
  projectPath: string,
  command: string
): boolean => {
  if (!ipcRenderer) {
    console.warn('Shell commands are only supported in the desktop app');
    return false;
  }

  ipcRenderer.send('run-shell-command', { projectPath, command });
  return true;
};
