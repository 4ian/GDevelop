import optionalRequire from './OptionalRequire.js';
const electron = optionalRequire('electron');

export default class Window {
  static setBounds(x, y, width, height) {
    if (!electron) return;

    console.log({ x, y, width, height });
    const browserWindow = electron.remote.getCurrentWindow();
    browserWindow.setBounds({ x, y, width, height });
    this.show();
  }

  static show() {
    if (!electron) return;

    const browserWindow = electron.remote.getCurrentWindow();
    browserWindow.showInactive();
    browserWindow.setAlwaysOnTop(true);
  }

  static hide() {
    if (!electron) return;

    const browserWindow = electron.remote.getCurrentWindow();
    if (!browserWindow.isFocused()) {
      browserWindow.setAlwaysOnTop(false);
      browserWindow.hide();
    }
  }

  static onFocus(cb) {
    if (!electron) return;

    return electron.remote.getCurrentWindow().on('focus', cb);
  }

  static onBlur(cb) {
    if (!electron) return;

    return electron.remote.getCurrentWindow().on('blur', cb);
  }

  static onClose(cb) {
    if (!electron) return;

    return electron.remote.getCurrentWindow().on('close', cb);
  }

  static getArguments() {
    if (!electron) {
      console.warn('Unable to get arguments, electron not defined');
      return {};
    }

    return electron.remote.getGlobal('args');
  }

  static isDev() {
    if (!electron) return true;

    return electron.remote.require('electron-is-dev');
  }

};
