import optionalRequire from './OptionalRequire.js';
const electron = optionalRequire('electron');
const process = optionalRequire('process');

let _isWindows = false;
if (electron) {
  _isWindows = electron.remote.require('electron-is').windows();
}
const _isMacLike =
  typeof navigator !== 'undefined' &&
  navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)
    ? true
    : false;

const _isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : ''
);

const getUserAgent = (): string => {
  return navigator.userAgent;
};

const getArch = (): string => {
  return process.arch;
};

const getSystemVersion = (): string => {
  return process.getSystemVersion;
};

export const getOperatingSystemDescriptiveName = (): string => {
  if (process === null) {
    //not an native application, so we are on a web-app
    return getUserAgent();
  } else {
    let platformString;
    if (process.platform === 'darwin') {
      platformString = 'macOS';
    } else {
      platformString = process.platform;
    }
    return platformString + ', ' + getSystemVersion() + ', ' + getArch();
  }
};

export const isWindows = () => _isWindows;
export const isMacLike = () => _isMacLike;
export const isMobile = () => _isMobile;
