import optionalRequire from './OptionalRequire.js';
const electron = optionalRequire('electron');

let isWindows = false;
if (electron) {
  isWindows = electron.remote.require('electron-is').windows();
}

export default class Window {
  static setBounds(x, y, width, height) {
    if (!electron) return;

    let scaleFactor = 1;
    if (isWindows) {
      // setBounds need to be called with the scale factor of the screen
      // on Windows.
      const rect = { x, y, width, height };
      const display = electron.remote.screen.getDisplayMatching(rect);
      scaleFactor = display.scaleFactor;
    }

    const browserWindow = electron.remote.getCurrentWindow();
    try {
      browserWindow.setBounds({
        x: Math.round(x / scaleFactor),
        y: Math.round(y / scaleFactor),
        width: Math.round(width / scaleFactor),
        height: Math.round(height / scaleFactor),
      });
    } catch(err) {
      console.warn("Unable to change window bounds", err);
    }
    this.show();
  }

  static show() {
    if (!electron) return;

    const browserWindow = electron.remote.getCurrentWindow();
    browserWindow.showInactive();
    browserWindow.setAlwaysOnTop(true);
  }

  static hide(forceHide = false) {
    if (!electron) return;

    const browserWindow = electron.remote.getCurrentWindow();
    if (!browserWindow.isFocused() || forceHide) {
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

    return electron.remote.require('electron-is').dev();
  }
}
