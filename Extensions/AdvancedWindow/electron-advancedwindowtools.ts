namespace gdjs {
  /**
   * A set of wrappers around the Electron windowing APIs.
   * They don't have any effect on non Electron runtimes.
   *
   * Docstrings are only used for typing here, for proper
   * documentation check the electron docs at
   * https://www.electronjs.org/docs/api.
   *
   * @filedescriptor
   * @author arthuro555
   */

  /**
   * Tools to manipulate the game window positioning and
   * interactions with the operating system.
   * @namespace
   */
  gdjs.evtTools.advancedWindow = {
    /**
     * The game's BrowserWindow instance (or null on
     * non-electron platforms).
     */
    electronBrowserWindow: null,
  };

  // @ts-ignore
  if (typeof require === 'function') {
    // @ts-ignore
    gdjs.evtTools.advancedWindow.electronBrowserWindow = require('electron').remote.getCurrentWindow();
  }
  gdjs.evtTools.advancedWindow.focus = function (activate: boolean) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      if (activate) {
        gdjs.evtTools.advancedWindow.electronBrowserWindow.focus();
      } else {
        gdjs.evtTools.advancedWindow.electronBrowserWindow.blur();
      }
    }
  };
  gdjs.evtTools.advancedWindow.isFocused = function (): boolean {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      return gdjs.evtTools.advancedWindow.electronBrowserWindow.isFocused();
    }
    return false;
  };
  gdjs.evtTools.advancedWindow.show = function (activate: boolean) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      if (activate) {
        gdjs.evtTools.advancedWindow.electronBrowserWindow.showInactive();
      } else {
        gdjs.evtTools.advancedWindow.electronBrowserWindow.hide();
      }
    }
  };
  gdjs.evtTools.advancedWindow.isVisible = function (): boolean {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      return gdjs.evtTools.advancedWindow.electronBrowserWindow.isVisible();
    }
    return false;
  };
  gdjs.evtTools.advancedWindow.maximize = function (activate: boolean) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      if (activate) {
        gdjs.evtTools.advancedWindow.electronBrowserWindow.maximize();
      } else {
        gdjs.evtTools.advancedWindow.electronBrowserWindow.unmaximize();
      }
    }
  };
  gdjs.evtTools.advancedWindow.isMaximized = function (): boolean {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      return gdjs.evtTools.advancedWindow.electronBrowserWindow.isMaximized();
    }
    return false;
  };
  gdjs.evtTools.advancedWindow.minimize = function (activate: boolean) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      if (activate) {
        gdjs.evtTools.advancedWindow.electronBrowserWindow.minimize();
      } else {
        gdjs.evtTools.advancedWindow.electronBrowserWindow.restore();
      }
    }
  };
  gdjs.evtTools.advancedWindow.isMinimized = function (): boolean {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      return gdjs.evtTools.advancedWindow.electronBrowserWindow.isMinimized();
    }
    return false;
  };
  gdjs.evtTools.advancedWindow.enable = function (activate: boolean) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.setEnabled(activate);
    }
  };
  gdjs.evtTools.advancedWindow.isEnabled = function (): boolean {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      return gdjs.evtTools.advancedWindow.electronBrowserWindow.isEnabled();
    }
    return false;
  };
  gdjs.evtTools.advancedWindow.setResizable = function (activate: boolean) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.setResizable(activate);
    }
  };
  gdjs.evtTools.advancedWindow.isResizable = function (): boolean {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      return gdjs.evtTools.advancedWindow.electronBrowserWindow.isResizable();
    }
    return false;
  };
  gdjs.evtTools.advancedWindow.setMovable = function (activate: boolean) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.setMovable(activate);
    }
  };
  gdjs.evtTools.advancedWindow.isMovable = function (): boolean {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      return gdjs.evtTools.advancedWindow.electronBrowserWindow.isMovable();
    }
    return false;
  };
  gdjs.evtTools.advancedWindow.setMaximizable = function (activate: boolean) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.setMaximizable(
        activate
      );
    }
  };
  gdjs.evtTools.advancedWindow.isMaximizable = function (): boolean {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      return gdjs.evtTools.advancedWindow.electronBrowserWindow.isMaximizable();
    }
    return false;
  };
  gdjs.evtTools.advancedWindow.setMinimizable = function (activate: boolean) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.setMinimizable(
        activate
      );
    }
  };
  gdjs.evtTools.advancedWindow.isMinimizable = function (): boolean {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      return gdjs.evtTools.advancedWindow.electronBrowserWindow.isMinimizable();
    }
    return false;
  };
  gdjs.evtTools.advancedWindow.setFullScreenable = function (
    activate: boolean
  ) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.setFullScreenable(
        activate
      );
    }
  };
  gdjs.evtTools.advancedWindow.isFullScreenable = function (): boolean {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      return gdjs.evtTools.advancedWindow.electronBrowserWindow.isFullScreenable();
    }
    return false;
  };
  gdjs.evtTools.advancedWindow.setClosable = function (activate: boolean) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.setClosable(activate);
    }
  };
  gdjs.evtTools.advancedWindow.isClosable = function (): boolean {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      return gdjs.evtTools.advancedWindow.electronBrowserWindow.isClosable();
    }
    return false;
  };
  gdjs.evtTools.advancedWindow.setAlwaysOnTop = function (
    activate: boolean,
    level:
      | 'normal'
      | 'floating'
      | 'torn-off-menu'
      | 'modal-panel'
      | 'main-menu'
      | 'status'
      | 'pop-up-menu'
      | 'screen-saver'
  ) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.setAlwaysOnTop(
        activate,
        level
      );
    }
  };
  gdjs.evtTools.advancedWindow.isAlwaysOnTop = function (): boolean {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      return gdjs.evtTools.advancedWindow.electronBrowserWindow.isAlwaysOnTop();
    }
    return false;
  };
  gdjs.evtTools.advancedWindow.setPosition = function (x: float, y: float) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      // Convert x and y to (32 bit) integers to avoid Electron errors.
      gdjs.evtTools.advancedWindow.electronBrowserWindow.setPosition(~~x, ~~y);
    }
  };
  gdjs.evtTools.advancedWindow.getPositionX = function (): number {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      return gdjs.evtTools.advancedWindow.electronBrowserWindow.getPosition()[0];
    }
    return 0;
  };
  gdjs.evtTools.advancedWindow.getPositionY = function (): number {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      return gdjs.evtTools.advancedWindow.electronBrowserWindow.getPosition()[1];
    }
    return 0;
  };
  gdjs.evtTools.advancedWindow.setKiosk = function (activate: boolean) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.setKiosk(activate);
    }
  };
  gdjs.evtTools.advancedWindow.isKiosk = function (): boolean {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      return gdjs.evtTools.advancedWindow.electronBrowserWindow.isKiosk();
    }
    return false;
  };
  gdjs.evtTools.advancedWindow.flash = function (activate: boolean) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.flashFrame(activate);
    }
  };
  gdjs.evtTools.advancedWindow.setHasShadow = function (activate: boolean) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.setHasShadow(activate);
    }
  };
  gdjs.evtTools.advancedWindow.hasShadow = function (): boolean {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      return gdjs.evtTools.advancedWindow.electronBrowserWindow.hasShadow();
    }
    return false;
  };
  gdjs.evtTools.advancedWindow.setOpacity = function (opacity: float) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.setOpacity(opacity);
    }
  };
  gdjs.evtTools.advancedWindow.getOpacity = function (): number {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      return gdjs.evtTools.advancedWindow.electronBrowserWindow.getOpacity();
    }
    return 1;
  };
  gdjs.evtTools.advancedWindow.setContentProtection = function (
    activate: boolean
  ) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.setContentProtection(
        activate
      );
    }
  };
  gdjs.evtTools.advancedWindow.setFocusable = function (activate: boolean) {
    if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.setFocusable(activate);
    }
  };
}
