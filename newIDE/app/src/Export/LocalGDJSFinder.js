// @flow

import optionalRequire from '../Utils/OptionalRequire.js';
import path from 'path';
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

  const cwd = process.cwd();
  const releaseFolder = isWin
    ? 'Release_Windows'
    : isDarwin ? 'Release_Darwin' : 'Release_Linux';
  tryPath(path.join(cwd, 'JsPlatform'), cb, () => {
    tryPath(path.join(cwd, '..', 'JsPlatform'), cb, () => {
      const devPath = path.join(
        cwd,
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
