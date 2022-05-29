namespace gdjs {
  /**
   * Tools to manipulate the game window positioning and
   * interactions with the operating system.
   * @author arthuro555
   */
  export namespace evtTools {
    export namespace advancedWindow {
      const getElectronBrowserWindow = (runtimeScene: gdjs.RuntimeScene) => {
        const electronRemote = runtimeScene
          .getGame()
          .getRenderer()
          .getElectronRemote();
        if (electronRemote) {
          return electronRemote.getCurrentWindow();
        }

        return null;
      };

      export const focus = function (
        activate: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          if (activate) {
            electronBrowserWindow.focus();
          } else {
            electronBrowserWindow.blur();
          }
        }
      };

      export const isFocused = function (
        runtimeScene: gdjs.RuntimeScene
      ): boolean {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          return electronBrowserWindow.isFocused();
        }
        return false;
      };

      export const show = function (
        activate: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          if (activate) {
            electronBrowserWindow.showInactive();
          } else {
            electronBrowserWindow.hide();
          }
        }
      };

      export const isVisible = function (
        runtimeScene: gdjs.RuntimeScene
      ): boolean {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          return electronBrowserWindow.isVisible();
        }
        return false;
      };

      export const maximize = function (
        activate: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          if (activate) {
            electronBrowserWindow.maximize();
          } else {
            electronBrowserWindow.unmaximize();
          }
        }
      };

      export const isMaximized = function (
        runtimeScene: gdjs.RuntimeScene
      ): boolean {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          return electronBrowserWindow.isMaximized();
        }
        return false;
      };

      export const minimize = function (
        activate: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          if (activate) {
            electronBrowserWindow.minimize();
          } else {
            electronBrowserWindow.restore();
          }
        }
      };

      export const isMinimized = function (
        runtimeScene: gdjs.RuntimeScene
      ): boolean {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          return electronBrowserWindow.isMinimized();
        }
        return false;
      };

      export const enable = function (
        activate: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          electronBrowserWindow.setEnabled(activate);
        }
      };

      export const isEnabled = function (
        runtimeScene: gdjs.RuntimeScene
      ): boolean {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          return electronBrowserWindow.isEnabled();
        }
        return false;
      };

      export const setResizable = function (
        activate: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          electronBrowserWindow.setResizable(activate);
        }
      };

      export const isResizable = function (
        runtimeScene: gdjs.RuntimeScene
      ): boolean {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          return electronBrowserWindow.isResizable();
        }
        return false;
      };

      export const setMovable = function (
        activate: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          electronBrowserWindow.setMovable(activate);
        }
      };

      export const isMovable = function (
        runtimeScene: gdjs.RuntimeScene
      ): boolean {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          return electronBrowserWindow.isMovable();
        }
        return false;
      };

      export const setMaximizable = function (
        activate: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          electronBrowserWindow.setMaximizable(activate);
        }
      };

      export const isMaximizable = function (
        runtimeScene: gdjs.RuntimeScene
      ): boolean {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          return electronBrowserWindow.isMaximizable();
        }
        return false;
      };

      export const setMinimizable = function (
        activate: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          electronBrowserWindow.setMinimizable(activate);
        }
      };

      export const isMinimizable = function (
        runtimeScene: gdjs.RuntimeScene
      ): boolean {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          return electronBrowserWindow.isMinimizable();
        }
        return false;
      };

      export const setFullScreenable = function (
        activate: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          electronBrowserWindow.setFullScreenable(activate);
        }
      };

      export const isFullScreenable = function (
        runtimeScene: gdjs.RuntimeScene
      ): boolean {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          return electronBrowserWindow.isFullScreenable();
        }
        return false;
      };

      export const setClosable = function (
        activate: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          electronBrowserWindow.setClosable(activate);
        }
      };

      export const isClosable = function (
        runtimeScene: gdjs.RuntimeScene
      ): boolean {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
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
          | 'screen-saver',
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          electronBrowserWindow.setAlwaysOnTop(activate, level);
        }
      };

      export const isAlwaysOnTop = function (
        runtimeScene: gdjs.RuntimeScene
      ): boolean {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          return electronBrowserWindow.isAlwaysOnTop();
        }
        return false;
      };

      export const setPosition = function (
        x: float,
        y: float,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          // Convert x and y to (32 bit) integers to avoid Electron errors.
          electronBrowserWindow.setPosition(~~x, ~~y);
        }
      };

      export const getPositionX = function (
        runtimeScene: gdjs.RuntimeScene
      ): number {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          return electronBrowserWindow.getPosition()[0];
        }
        return 0;
      };

      export const getPositionY = function (
        runtimeScene: gdjs.RuntimeScene
      ): number {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          return electronBrowserWindow.getPosition()[1];
        }
        return 0;
      };

      export const setKiosk = function (
        activate: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          electronBrowserWindow.setKiosk(activate);
        }
      };

      export const isKiosk = function (
        runtimeScene: gdjs.RuntimeScene
      ): boolean {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          return electronBrowserWindow.isKiosk();
        }
        return false;
      };

      export const flash = function (
        activate: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          electronBrowserWindow.flashFrame(activate);
        }
      };

      export const setHasShadow = function (
        activate: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          electronBrowserWindow.setHasShadow(activate);
        }
      };

      export const hasShadow = function (
        runtimeScene: gdjs.RuntimeScene
      ): boolean {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          return electronBrowserWindow.hasShadow();
        }
        return false;
      };

      export const setOpacity = function (
        opacity: float,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          electronBrowserWindow.setOpacity(opacity);
        }
      };

      export const getOpacity = function (
        runtimeScene: gdjs.RuntimeScene
      ): number {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          return electronBrowserWindow.getOpacity();
        }
        return 1;
      };

      export const setContentProtection = function (
        activate: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          electronBrowserWindow.setContentProtection(activate);
        }
      };

      export const setFocusable = function (
        activate: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          electronBrowserWindow.setFocusable(activate);
        }
      };
    }
  }
}
