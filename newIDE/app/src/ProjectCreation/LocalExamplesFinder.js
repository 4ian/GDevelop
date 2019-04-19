// @flow

import optionalRequire from '../Utils/OptionalRequire.js';
const electron = optionalRequire('electron');
const path = optionalRequire('path');
const app = electron ? electron.remote.app : null;
const fs = optionalRequire('fs');
const process = optionalRequire('process');

export const findExamples = (cb: (?string) => void) => {
  if (!process || !fs || !path) return '';

  const tryPath = (
    path: string,
    onExists: string => void,
    onNoAccess: Function
  ) =>
    fs.access(path, fs.constants.R_OK, err => {
      if (!err) onExists(path);
      else onNoAccess();
    });

  const appPath = app ? app.getAppPath() : process.cwd();

  // First try to find examples in app resources folder
  tryPath(path.join(appPath, '..', 'examples'), cb, () => {
    tryPath(
      path.join(appPath, '..', '..', 'app', 'resources', 'examples'),
      cb,
      () => {
        cb(null);
      }
    );
  });
};
