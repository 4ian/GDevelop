// @flow
import optionalRequire from './OptionalRequire';
const remote = optionalRequire('@electron/remote');
const process = optionalRequire('process');

let _isWindows = false;
if (remote) {
  _isWindows = remote.require('electron-is').windows();
}
const _isMacLike =
  typeof navigator !== 'undefined' &&
  navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)
    ? true
    : false;

const _isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : ''
);

export const getUserAgent = (): string => {
  return typeof navigator !== 'undefined'
    ? navigator.userAgent || 'Unknown navigator'
    : 'Unknown (not a navigator)';
};

export const getArch = (): string => {
  return process
    ? process.arch || 'Unknown architecture'
    : 'Unknown architecture (web-app)';
};

export const getSystemVersion = (): string => {
  return process && process.getSystemVersion
    ? process.getSystemVersion() || 'Unknown system version'
    : 'Unknown system version (web-app)';
};

export const getPlatformName = (): string => {
  return process
    ? process.platform || 'Unknown platform'
    : (typeof navigator !== 'undefined' ? navigator.platform : '') ||
        'Unknown platform (web-app)';
};

export const isWindows = () => _isWindows;
export const isMacLike = () => _isMacLike;
export const isMobile = () => _isMobile;
export const isNativeMobileApp = () => false;
