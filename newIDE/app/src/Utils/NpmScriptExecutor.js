// @flow
import optionalRequire from './OptionalRequire';

const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

/**
 * Runs an npm script in a new terminal window.
 * Only works in Electron (desktop) environment.
 * The script name must be a valid npm script defined in the project's package.json.
 */
export const runNpmScript = (
  projectPath: string,
  npmScript: string
): boolean => {
  if (!ipcRenderer) {
    console.warn('npm scripts are only supported in the desktop app');
    return false;
  }

  ipcRenderer.send('run-npm-script', { projectPath, npmScript });
  return true;
};
