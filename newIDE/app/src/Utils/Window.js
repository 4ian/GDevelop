// @flow

import optionalRequire from './OptionalRequire.js';
import URLSearchParams from 'url-search-params';
import { isWindows } from './Platform';
const electron = optionalRequire('electron');
const shell = electron ? electron.shell : null;
const dialog = electron ? electron.remote.dialog : null;

export type AppArguments = { [string]: any };

/**
 * The name of the key, in AppArguments, containing the array of
 * positional arguments (i.e: `["file1", "file2"]` in `ls file1 file2`).
 */
export const POSITIONAL_ARGUMENTS_KEY = '_';

let currentTitleBarColor: ?string = null;

/**
 * Various utilities related to the app window management.
 */
export default class Window {
  static setTitle(title: string) {
    if (electron) {
      try {
        const browserWindow = electron.remote.getCurrentWindow();
        browserWindow.setTitle(title);
      } catch (err) {
        // This rarely, but sometimes happen that setTitle throw.
        // Catch the error in the hope that things will continue to work.
        console.error(
          'Caught an error while calling browserWindow.setTitle',
          err
        );
      }
    } else {
      document.title = title;
    }
  }

  static setTitleBarColor(newColor: string) {
    if (electron) {
      // Nothing to do, the title bar is using the system window management.
      return;
    }

    if (currentTitleBarColor === newColor) {
      // Avoid potentially expensive DOM query/modification if no changes needed.
      return;
    }

    const metaElement = document.querySelector('meta[name="theme-color"]');
    if (metaElement) {
      metaElement.setAttribute('content', newColor);
      currentTitleBarColor = newColor;
    }
  }

  static setBounds(x: number, y: number, width: number, height: number) {
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

  static quit() {
    if (!electron) return;

    const electronApp = electron.remote.app;
    electronApp.quit();
  }

  static show() {
    if (!electron) return;

    const browserWindow = electron.remote.getCurrentWindow();
    browserWindow.showInactive();
    browserWindow.setAlwaysOnTop(true);
  }

  static hide(forceHide: boolean = false) {
    if (!electron) return;

    const browserWindow = electron.remote.getCurrentWindow();
    if (!browserWindow.isFocused() || forceHide) {
      browserWindow.setAlwaysOnTop(false);
      browserWindow.hide();
    }
  }

  static onFocus(cb: () => void) {
    if (!electron) return;

    return electron.remote.getCurrentWindow().on('focus', cb);
  }

  static onBlur(cb: () => void) {
    if (!electron) return;

    return electron.remote.getCurrentWindow().on('blur', cb);
  }

  static onClose(cb: () => void) {
    if (!electron) return;

    return electron.remote.getCurrentWindow().on('close', cb);
  }

  /**
   * Return the arguments passed to the IDE, either from Electron
   * or from the web-app URL. The resulting object will have a key "_"
   * containing an array of string, representing all the arguments that
   * didn't have an option associated with them (see https://github.com/substack/minimist).
   * (On the web-app, this is emulated using the "project" argument).
   */
  static getArguments(): AppArguments {
    if (electron) {
      return electron.remote.getGlobal('args');
    }

    const argumentsObject = {};
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, name) => (argumentsObject[name] = value));

    // Emulate the minimist behavior of putting the positional arguments
    // in "_".
    argumentsObject[POSITIONAL_ARGUMENTS_KEY] = argumentsObject.project
      ? [argumentsObject.project]
      : [];

    return argumentsObject;
  }

  static showMessageBox(
    message: string,
    type?: 'none' | 'info' | 'error' | 'question' | 'warning'
  ) {
    if (!dialog || !electron) {
      alert(message);
      return;
    }

    const browserWindow = electron.remote.getCurrentWindow();
    dialog.showMessageBox(browserWindow, {
      message,
      type,
      buttons: ['OK'],
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
          menu.popup({ window: electron.remote.getCurrentWindow() });
        }, 30);
      });
    } else if (document) {
      document.addEventListener('contextmenu', function(e: any) {
        // Only show the context menu in text editors.
        if (!e.target.closest(textEditorSelectors)) {
          e.preventDefault();
          return false;
        }

        return true;
      });
    }
  }

  static openExternalURL(url: string) {
    if (electron) {
      if (shell) shell.openExternal(url);
      return;
    }

    window.open(url, '_blank');
  }

  static isFullscreen() {
    // $FlowFixMe
    return !!document.fullscreenElement;
  }

  static requestFullscreen() {
    const { documentElement } = document;
    if (!documentElement) return;

    if (documentElement.requestFullscreen) {
      documentElement.requestFullscreen();
      // $FlowFixMe
    } else if (documentElement.mozRequestFullScreen) {
      /* Firefox */
      // $FlowFixMe
      documentElement.mozRequestFullScreen();
      // $FlowFixMe
    } else if (documentElement.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      // $FlowFixMe
      documentElement.webkitRequestFullscreen();
      // $FlowFixMe
    } else if (documentElement.msRequestFullscreen) {
      /* IE/Edge */
      // $FlowFixMe
      documentElement.msRequestFullscreen();
    }
  }

  static hasMainMenu() {
    return !!electron;
  }

  static isDev() {
    if (!electron)
      return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

    try {
      const isDev = electron.remote.require('electron-is').dev();
      return isDev;
    } catch (err) {
      // This rarely, but sometimes happen that require throw ("missing remote object").
      // Catch the error in the hope that things will continue to work.
      console.error(
        "Caught an error while calling electron.remote.require('electron-is').dev",
        err
      );
      return false; // Assume we're not in development mode. Might be incorrect but better not consider production as development.
    }
  }
}
