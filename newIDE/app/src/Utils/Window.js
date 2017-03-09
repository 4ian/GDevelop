import optionalRequire from './OptionalRequire.js';
const electron = optionalRequire('electron');

export default {
  setBounds: (x, y, width, height) => {
    if (!electron) return;

    electron.remote.getCurrentWindow().setBounds({ x, y, width, height });
    electron.remote.getCurrentWindow().showInactive();
  },
  show: () => {
    if (!electron) return;

    electron.remote.getCurrentWindow().showInactive();
  },
  onFocus: cb => {
    if (!electron) return;

    return electron.remote.getCurrentWindow().on('focus', cb);
  },
  onBlur: cb => {
    if (!electron) return;

    return electron.remote.getCurrentWindow().on('blur', cb);
  },
  onClose: cb => {
    if (!electron) return;

    return electron.remote.getCurrentWindow().on('close', cb);
  },
  getArguments: () => {
    if (!electron) {
      console.warn('Unable to get arguments, electron not defined');
      return {};
    }

    return electron.remote.getGlobal('args');
  },
  isDev: () => {
    if (!electron) return true;

    return electron.remote.require('electron-is-dev');
  },
};
