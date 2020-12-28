namespace gdjs {
  /**
   * Tools to manipulate the game window positioning and
   * interactions with the operating system.
   * @author arthuro555
   */
  export namespace evtTools {
    export namespace advancedWindow {
      /**
       * The game's BrowserWindow instance (or null on
       * non-electron platforms).
       */
      let electronBrowserWindow: any = null;

      // @ts-ignore
      if (typeof require === 'function') {
        // @ts-ignore
        electronBrowserWindow = require('electron').remote.getCurrentWindow();
      }
      export const focus = function (activate: boolean) {
        if (electronBrowserWindow) {
          if (activate) {
            electronBrowserWindow.focus();
          } else {
            electronBrowserWindow.blur();
          }
        }
      };
      export const isFocused = function (): boolean {
        if (electronBrowserWindow) {
          return electronBrowserWindow.isFocused();
        }
        return false;
      };
      export const show = function (activate: boolean) {
        if (electronBrowserWindow) {
          if (activate) {
            electronBrowserWindow.showInactive();
          } else {
            electronBrowserWindow.hide();
          }
        }
      };
      export const isVisible = function (): boolean {
        if (electronBrowserWindow) {
          return electronBrowserWindow.isVisible();
        }
        return false;
      };
      export const maximize = function (activate: boolean) {
        if (electronBrowserWindow) {
          if (activate) {
            electronBrowserWindow.maximize();
          } else {
            electronBrowserWindow.unmaximize();
          }
        }
      };
      export const isMaximized = function (): boolean {
        if (electronBrowserWindow) {
          return electronBrowserWindow.isMaximized();
        }
        return false;
      };
      export const minimize = function (activate: boolean) {
        if (electronBrowserWindow) {
          if (activate) {
            electronBrowserWindow.minimize();
          } else {
            electronBrowserWindow.restore();
          }
        }
      };
      export const isMinimized = function (): boolean {
        if (electronBrowserWindow) {
          return electronBrowserWindow.isMinimized();
        }
        return false;
      };
      export const enable = function (activate: boolean) {
        if (electronBrowserWindow) {
          electronBrowserWindow.setEnabled(activate);
        }
      };
      export const isEnabled = function (): boolean {
        if (electronBrowserWindow) {
          return electronBrowserWindow.isEnabled();
        }
        return false;
      };
      export const setResizable = function (activate: boolean) {
        if (electronBrowserWindow) {
          electronBrowserWindow.setResizable(activate);
        }
      };
      export const isResizable = function (): boolean {
        if (electronBrowserWindow) {
          return electronBrowserWindow.isResizable();
        }
        return false;
      };
      export const setMovable = function (activate: boolean) {
        if (electronBrowserWindow) {
          electronBrowserWindow.setMovable(activate);
        }
      };
      export const isMovable = function (): boolean {
        if (electronBrowserWindow) {
          return electronBrowserWindow.isMovable();
        }
        return false;
      };
      export const setMaximizable = function (activate: boolean) {
        if (electronBrowserWindow) {
          electronBrowserWindow.setMaximizable(activate);
        }
      };
      export const isMaximizable = function (): boolean {
        if (electronBrowserWindow) {
          return electronBrowserWindow.isMaximizable();
        }
        return false;
      };
      export const setMinimizable = function (activate: boolean) {
        if (electronBrowserWindow) {
          electronBrowserWindow.setMinimizable(activate);
        }
      };
      export const isMinimizable = function (): boolean {
        if (electronBrowserWindow) {
          return electronBrowserWindow.isMinimizable();
        }
        return false;
      };
      export const setFullScreenable = function (activate: boolean) {
        if (electronBrowserWindow) {
          electronBrowserWindow.setFullScreenable(activate);
        }
      };
      export const isFullScreenable = function (): boolean {
        if (electronBrowserWindow) {
          return electronBrowserWindow.isFullScreenable();
        }
        return false;
      };
      export const setClosable = function (activate: boolean) {
        if (electronBrowserWindow) {
          electronBrowserWindow.setClosable(activate);
        }
      };
      export const isClosable = function (): boolean {
        if (electronBrowserWindow) {
          return electronBrowserWindow.isClosable();
        }
        return false;
      };
      export const setAlwaysOnTop = function (
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
        if (electronBrowserWindow) {
          electronBrowserWindow.setAlwaysOnTop(activate, level);
        }
      };
      export const isAlwaysOnTop = function (): boolean {
        if (electronBrowserWindow) {
          return electronBrowserWindow.isAlwaysOnTop();
        }
        return false;
      };
      export const setPosition = function (x: float, y: float) {
        if (electronBrowserWindow) {
          // Convert x and y to (32 bit) integers to avoid Electron errors.
          electronBrowserWindow.setPosition(~~x, ~~y);
        }
      };
      export const getPositionX = function (): number {
        if (electronBrowserWindow) {
          return electronBrowserWindow.getPosition()[0];
        }
        return 0;
      };
      export const getPositionY = function (): number {
        if (electronBrowserWindow) {
          return electronBrowserWindow.getPosition()[1];
        }
        return 0;
      };
      export const setKiosk = function (activate: boolean) {
        if (electronBrowserWindow) {
          electronBrowserWindow.setKiosk(activate);
        }
      };
      export const isKiosk = function (): boolean {
        if (electronBrowserWindow) {
          return electronBrowserWindow.isKiosk();
        }
        return false;
      };
      export const flash = function (activate: boolean) {
        if (electronBrowserWindow) {
          electronBrowserWindow.flashFrame(activate);
        }
      };
      export const setHasShadow = function (activate: boolean) {
        if (electronBrowserWindow) {
          electronBrowserWindow.setHasShadow(activate);
        }
      };
      export const hasShadow = function (): boolean {
        if (electronBrowserWindow) {
          return electronBrowserWindow.hasShadow();
        }
        return false;
      };
      export const setOpacity = function (opacity: float) {
        if (electronBrowserWindow) {
          electronBrowserWindow.setOpacity(opacity);
        }
      };
      export const getOpacity = function (): number {
        if (electronBrowserWindow) {
          return electronBrowserWindow.getOpacity();
        }
        return 1;
      };
      export const setContentProtection = function (activate: boolean) {
        if (electronBrowserWindow) {
          electronBrowserWindow.setContentProtection(activate);
        }
      };
      export const setFocusable = function (activate: boolean) {
        if (electronBrowserWindow) {
          electronBrowserWindow.setFocusable(activate);
        }
      };
    }
  }
}
