// @flow
// Note: this file don't use export/imports nor Flow to allow its usage from Node.js

const optionalRequire = require('../Utils/OptionalRequire');
const remote = optionalRequire('@electron/remote');
const app = remote ? remote.app : null;
const fs = optionalRequire('fs');
const path = optionalRequire('path');
const process = optionalRequire('process');
var isDarwin = process && /^darwin/.test(process.platform);

const tryPath = (
  path /*: string*/,
  onExists /*: string => void*/,
  onNoAccess /*: Function*/
) =>
  fs.access(path, fs.constants.R_OK, err => {
    if (!err) onExists(path);
    else onNoAccess();
  });

const findGDJS = () /*: Promise<{|gdjsRoot: string|}> */ => {
  if (!path || !process || !fs) return Promise.reject(new Error('Unsupported'));

  const appPath = app ? app.getAppPath() : process.cwd();

  // The app path is [...]/*.app/Contents/Resources/app.asar on macOS
  // and [...]/resources/app.asar on other OSes.
  const pathToRoot = isDarwin ? '../../../../' : path.join('..', '..');
  const rootPath = path.join(appPath, pathToRoot);

  return new Promise((resolve, reject) => {
    const onFound = gdjsRoot => resolve({ gdjsRoot });
    const onNotFound = () => reject(new Error('Could not find GDJS'));

    // First try to find GDJS in the parent folder (when newIDE is inside IDE)
    tryPath(path.join(rootPath, '..', 'JsPlatform'), onFound, () => {
      // Or in the resources (for a standalone newIDE)
      tryPath(path.join(appPath, '..', 'GDJS'), onFound, () => {
        // Or in the resources when developing with Electron
        const devPath = path.join(
          appPath,
          '..',
          '..',
          'app',
          'resources',
          'GDJS'
        );
        tryPath(devPath, onFound, onNotFound);
      });
    });
  });
};

module.exports = {
  findGDJS,
};
