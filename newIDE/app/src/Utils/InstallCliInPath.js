// @flow
import optionalRequire from './OptionalRequire';

const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

export type InstallCliInPathResult = {|
  status: 'success' | 'error',
  message: string,
|};

export const isCliInPathInstallSupported = (): boolean => !!ipcRenderer;

export const installCliInPath = async (): Promise<InstallCliInPathResult> => {
  if (!ipcRenderer) {
    return {
      status: 'error',
      message:
        'Installing the CLI in PATH is only available on the desktop app.',
    };
  }
  return ipcRenderer.invoke('install-cli-in-path');
};
