// @flow
import * as React from 'react';
import optionalRequire from './OptionalRequire';
import URLSearchParams from 'url-search-params';
import { isWindows } from './Platform';
import debounce from 'lodash/debounce';
import { hexToRGBColor, isLightRgbColor } from './ColorTransformer';
const electron = optionalRequire('electron');
const remote = optionalRequire('@electron/remote');
const shell = electron ? electron.shell : null;
const dialog = remote ? remote.dialog : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

export type AppArguments = { [string]: any };
type YesNoCancelDialogChoice = 'yes' | 'no' | 'cancel';

/**
 * The name of the key, in AppArguments, containing the array of
 * positional arguments (i.e: `["file1", "file2"]` in `ls file1 file2`).
 */
export const POSITIONAL_ARGUMENTS_KEY = '_';

let currentTitleBarColor: ?string = null;

/**
 * Listen to the changes to the window controls provided by the operating system:
 *
 * - An installed PWA can have window controls displayed as overlay. If supported,
 * we set up a listener to detect any change and notify the caller.
 * - On Electron, the window controls are always integrated in the app - so this does nothing.
 */
export const useWindowControlsOverlayWatcher = ({
  onChanged,
}: {|
  onChanged: () => void,
|}) => {
  // $FlowFixMe - this API is not handled by Flow.
  const { windowControlsOverlay } = navigator;

  React.useEffect(
    () => {
      let listenerCallback = null;
      if (windowControlsOverlay) {
        listenerCallback = debounce(() => {
          onChanged();
        }, 50);
        windowControlsOverlay.addEventListener(
          'geometrychange',
          listenerCallback
        );
      }
      return () => {
        if (listenerCallback) {
          windowControlsOverlay.removeEventListener(
            'geometrychange',
            listenerCallback
          );
        }
      };
    },
    [onChanged, windowControlsOverlay]
  );
};

/**
 * Various utilities related to the app window management.
 */
export default class Window {
  static setTitle(title: string) {
    if (remote) {
      try {
        const browserWindow = remote.getCurrentWindow();
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
    if (currentTitleBarColor === newColor) {
      // Avoid potentially expensive DOM query/modification if no changes needed.
      return;
    }

    if (ipcRenderer) {
      // Update the window controls colors on Windows.
      ipcRenderer.invoke('titlebar-set-overlay-options', {
        color: newColor,
        symbolColor: isLightRgbColor(hexToRGBColor(newColor))
          ? '#000000'
          : '#ffffff',
      });
      currentTitleBarColor = newColor;
    }

    // Update the PWA titlebar/controls color (if it's an installed PWA).
    const metaElement = document.querySelector('meta[name="theme-color"]');
    if (metaElement) {
      metaElement.setAttribute('content', newColor);
      currentTitleBarColor = newColor;
    }
  }

  static setBounds(x: number, y: number, width: number, height: number) {
    if (!remote) return;

    let scaleFactor = 1;
    if (isWindows()) {
      // setBounds need to be called with the scale factor of the screen
      // on Windows.
      const rect = { x, y, width, height };
      const display = remote.screen.getDisplayMatching(rect);
      scaleFactor = display.scaleFactor;
    }

    const browserWindow = remote.getCurrentWindow();
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
    if (!remote) return;

    const electronApp = remote.app;
    electronApp.quit();
  }

  static show() {
    if (!remote) return;

    const browserWindow = remote.getCurrentWindow();
    browserWindow.showInactive();
    browserWindow.setAlwaysOnTop(true);
  }

  static hide(forceHide: boolean = false) {
    if (!remote) return;

    const browserWindow = remote.getCurrentWindow();
    if (!browserWindow.isFocused() || forceHide) {
      browserWindow.setAlwaysOnTop(false);
      browserWindow.hide();
    }
  }

  static onFocus(cb: () => void) {
    if (!remote) return;

    return remote.getCurrentWindow().on('focus', cb);
  }

  static onBlur(cb: () => void) {
    if (!remote) return;

    return remote.getCurrentWindow().on('blur', cb);
  }

  static onClose(cb: () => void) {
    if (!remote) return;

    return remote.getCurrentWindow().on('close', cb);
  }

  /**
   * Return the arguments passed to the IDE, either from Electron
   * or from the web-app URL. The resulting object will have a key "_"
   * containing an array of string, representing all the arguments that
   * didn't have an option associated with them (see https://github.com/substack/minimist).
   * (On the web-app, this is emulated using the "project" argument).
   */
  static getArguments(): AppArguments {
    if (remote) {
      return remote.getGlobal('args');
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

  /**
   * On web, removes a list of query params from the URL.
   */
  static removeArguments(argumentNames: string[]) {
    // On Electron, we don't have a way to modify global args.
    if (remote) return;

    const url = new URL(window.location.href);
    for (const argumentName of argumentNames) {
      url.searchParams.delete(argumentName);
    }
    window.history.replaceState({}, document.title, url.toString());
  }

  static addArguments(argumentNamesAndValues: { [key: string]: string }) {
    // On Electron, we don't have a way to modify global args.
    if (remote) return;

    const url = new URL(window.location.href);
    for (const argumentName in argumentNamesAndValues) {
      url.searchParams.set(argumentName, argumentNamesAndValues[argumentName]);
    }
    window.history.replaceState({}, document.title, url.toString());
  }

  static showMessageBox(
    message: string,
    type?: 'none' | 'info' | 'error' | 'question' | 'warning'
  ) {
    if (!dialog || !electron) {
      alert(message);
      return;
    }

    const browserWindow = remote.getCurrentWindow();
    dialog.showMessageBoxSync(browserWindow, {
      message,
      type,
      buttons: ['OK'],
    });
  }

  static showYesNoCancelDialog(
    message: string,
    type?: 'none' | 'info' | 'error' | 'question' | 'warning'
  ): YesNoCancelDialogChoice {
    if (!dialog || !electron) {
      // TODO: Find a way to display an alert with 3 buttons (not possible with the 3 native js method confirm, alert and prompt)
      // eslint-disable-next-line
      const answer = confirm(message);
      if (answer) return 'yes';
      return 'no';
    }

    const browserWindow = remote.getCurrentWindow();
    const answer = dialog.showMessageBoxSync(browserWindow, {
      message,
      type,
      cancelId: 1,
      buttons: ['Yes', 'Cancel', 'No'], // TODO: Check on Windows and Linux how these buttons are displayed.
      // On Mac, they are displayed vertically in the order Yes, No and Cancel from top to bottom.
    });
    switch (answer) {
      case 0:
        return 'yes';
      case 1:
        return 'cancel';
      case 2:
        return 'no';
      default:
        return 'cancel';
    }
  }

  static showConfirmDialog(
    message: string,
    type?: 'none' | 'info' | 'error' | 'question' | 'warning'
  ) {
    if (!dialog || !electron) {
      // eslint-disable-next-line
      return confirm(message);
    }

    const browserWindow = remote.getCurrentWindow();
    const answer = dialog.showMessageBoxSync(browserWindow, {
      message,
      type,
      cancelId: 1,
      buttons: ['OK', 'Cancel'],
    });
    return answer === 0;
  }

  static setUpContextMenu() {
    const textEditorSelectors = 'textarea, input, [contenteditable="true"]';

    if (electron) {
      // `remote.require` since `Menu` is a main-process module.
      var buildEditorContextMenu = remote.require(
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
          menu.popup({ window: remote.getCurrentWindow() });
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
    if (!url) return;

    if (electron) {
      if (shell) shell.openExternal(url);
      return;
    }

    window.open(url, '_blank');
  }

  static getOrientation(): 'portrait' | 'landscape' {
    try {
      return window.screen.orientation.type.split('-')[0];
    } catch (error) {
      console.warn('An error occurred when reading screen orientation', error);
      return 'landscape';
    }
  }

  static hasMainMenu() {
    return !!electron;
  }

  static isDev(): boolean {
    if (!electron || !remote)
      return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

    try {
      const isDev = remote.require('electron-is').dev();
      return isDev;
    } catch (err) {
      // This rarely, but sometimes happen that require throw ("missing remote object").
      // Catch the error in the hope that things will continue to work.
      console.error(
        "Caught an error while calling remote.require('electron-is').dev",
        err
      );
      return false; // Assume we're not in development mode. Might be incorrect but better not consider production as development.
    }
  }
}
