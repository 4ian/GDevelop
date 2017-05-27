// @flow

import optionalRequire from '../Utils/OptionalRequire.js';
import path from 'path';
const electron = optionalRequire('electron');
const app = electron ? electron.remote.app : null;
const fs = optionalRequire('fs');
const process = optionalRequire('process');
var isWin = process && /^win/.test(process.platform);
var isDarwin = process && /^darwin/.test(process.platform);

const tryPath = (
  path: string,
  onExists: (string) => void,
  onNoAccess: Function
) =>
  fs.access(path, fs.constants.R_OK, err => {
    if (!err) onExists(path);
    else onNoAccess();
  });

export const findGDJS = (cb: (?string) => void) => {
  if (!process || !fs) return '';

  const appPath = app ? app.getAppPath() : process.cwd();

  // The app path is [...]/*.app/Contents/Resources/app.asar on macOS
  // and [...]/resources/app.asar on other OSes.
  const pathToRoot = isDarwin ? '../../../../' : '../../';
  const rootPath = path.join(appPath, pathToRoot);

  // First try to find GDJS next to the app or in the parent folder
  tryPath(path.join(rootPath, 'JsPlatform'), cb, () => {
    tryPath(path.join(rootPath, '..', 'JsPlatform'), cb, () => {

      // Try to find GDJS in the structure of directories of GD.
      const releaseFolder = isWin
        ? 'Release_Windows'
        : isDarwin ? 'Release_Darwin' : 'Release_Linux';
      const devPath = path.join(
        appPath,
        '..',
        '..',
        '..',
        'Binaries',
        'Output',
        releaseFolder,
        'JsPlatform'
      );
      tryPath(devPath, cb, () => {
        cb(null);
      });
    });
  });
};
