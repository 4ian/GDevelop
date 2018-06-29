import optionalRequire from './OptionalRequire.js';
const electron = optionalRequire('electron');

let _isWindows = false;
if (electron) {
  _isWindows = electron.remote.require('electron-is').windows();
}
const _isMacLike = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)
  ? true
  : false;

const _isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);

export const isWindows = () => _isWindows;
export const isMacLike = () => _isMacLike;
export const isMobile = () => _isMobile;
