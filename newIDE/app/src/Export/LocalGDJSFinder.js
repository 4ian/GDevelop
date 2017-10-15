// @flow

import optionalRequire from '../Utils/OptionalRequire.js';
const electron = optionalRequire('electron');
const app = electron ? electron.remote.app : null;
const fs = optionalRequire('fs');
const path = optionalRequire('path');
const process = optionalRequire('process');
var isDarwin = process && /^darwin/.test(process.platform);

const tryPath = (
  path: string,
  onExists: string => void,
  onNoAccess: Function
) =>
  fs.access(path, fs.constants.R_OK, err => {
    if (!err) onExists(path);
    else onNoAccess();
  });

export const findGDJS = (cb: (?string) => void) => {
  if (!path || !process || !fs) return '';

  const appPath = app ? app.getAppPath() : process.cwd();

  // The app path is [...]/*.app/Contents/Resources/app.asar on macOS
  // and [...]/resources/app.asar on other OSes.
  const pathToRoot = isDarwin ? '../../../../' : path.join('..', '..');
  const rootPath = path.join(appPath, pathToRoot);

  // First try to find GDJS in the parent folder (when newIDE is inside IDE)
  tryPath(path.join(rootPath, '..', 'JsPlatform'), cb, () => {
    // Or in the resources (for a standalone newIDE)
    tryPath(path.join(appPath, '..', 'GDJS'), cb, () => {
      // Or in the resources when developing with Electron
      const devPath = path.join(
        appPath,
        '..',
        '..',
        'app',
        'resources',
        'GDJS'
      );
      tryPath(devPath, cb, () => {
        cb(null);
      });
    });
  });
};
