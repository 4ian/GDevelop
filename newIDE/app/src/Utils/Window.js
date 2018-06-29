import optionalRequire from './OptionalRequire.js';
import { isWindows } from './Platform';
const electron = optionalRequire('electron');
const shell = electron ? electron.shell : null;
const dialog = electron ? electron.remote.dialog : null;

export default class Window {
  static setTitle(title) {
    if (electron) {
      const browserWindow = electron.remote.getCurrentWindow();
      browserWindow.setTitle(title);
    } else {
      document.title = title;
    }
  }

  static setBounds(x, y, width, height) {
    if (!electron) return;

    let scaleFactor = 1;
    if (isWindows()) {
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
    } catch (err) {
      console.warn('Unable to change window bounds', err);
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

  static showMessageBox(message, type) {
    if (!dialog || !electron) {
      alert(message);
      return;
    }

    const browserWindow = electron.remote.getCurrentWindow();
    dialog.showMessageBox(browserWindow, {
      message,
      type,
    });
  }

  static setUpContextMenu() {
    const textEditorSelectors = 'textarea, input, [contenteditable="true"]';

    if (electron) {
      // `remote.require` since `Menu` is a main-process module.
      var buildEditorContextMenu = electron.remote.require(
        'electron-editor-context-menu'
      );

      window.addEventListener('contextmenu', function(e) {
        // Only show the context menu in text editors.
        if (!e.target.closest(textEditorSelectors)) return;

        var menu = buildEditorContextMenu();

        // The 'contextmenu' event is emitted after 'selectionchange' has fired but possibly before the
        // visible selection has changed. Try to wait to show the menu until after that, otherwise the
        // visible selection will update after the menu dismisses and look weird.
        setTimeout(function() {
          menu.popup(electron.remote.getCurrentWindow());
        }, 30);
      });
    } else if (document) {
      document.addEventListener('contextmenu', function(e) {
        // Only show the context menu in text editors.
        if (!e.target.closest(textEditorSelectors)) {
          e.preventDefault();
          return false;
        }

        return true;
      });
    }
  }

  static openExternalURL(url) {
    if (electron) {
      shell.openExternal(url);
      return;
    }

    window.open(url, '_blank');
  }

  static hasMainMenu() {
    return !!electron;
  }

  static isDev() {
    if (!electron)
      return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

    return electron.remote.require('electron-is').dev();
  }
}
