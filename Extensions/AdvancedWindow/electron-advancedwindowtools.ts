namespace gdjs {
  export namespace evtTools {
    /**
     * Tools to manipulate the game window positioning and
     * interactions with the operating system.
     * @author arthuro555
     */
    export namespace advancedWindow {
      const getElectronBrowserWindow = (runtimeScene: gdjs.RuntimeScene) => {
        try {
          const electronRemote = runtimeScene
            .getGame()
            .getRenderer()
            .getElectronRemote();
          if (electronRemote) {
            return electronRemote.getCurrentWindow();
          }
          return null;
        } catch (error) {
          return null;
        }
      };

      const getElectron = (runtimeScene: gdjs.RuntimeScene) => {
        try {
          return runtimeScene.getGame().getRenderer().getElectron();
        } catch (error) {
          return null;
        }
      };

      const isGDevelopPreview = (runtimeScene: gdjs.RuntimeScene): boolean => {
        try {
          return !!runtimeScene.getGame().isPreview();
        } catch (error) {
          return false;
        }
      };

      const getElectronBrowserWindowBounds = (
        runtimeScene: gdjs.RuntimeScene
      ): { x: number; y: number; width: number; height: number } | null => {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (!electronBrowserWindow) return null;

        try {
          if (typeof electronBrowserWindow.getBounds === 'function') {
            return electronBrowserWindow.getBounds();
          }

          const position = electronBrowserWindow.getPosition();
          const size = electronBrowserWindow.getSize();
          return {
            x: position[0],
            y: position[1],
            width: size[0],
            height: size[1],
          };
        } catch (error) {
          return null;
        }
      };

      const getCurrentDisplayWorkArea = (
        runtimeScene: gdjs.RuntimeScene
      ): { x: number; y: number; width: number; height: number } | null => {
        const electron = getElectron(runtimeScene);
        const screen = electron ? electron.screen : null;
        if (!screen) return null;

        try {
          const bounds = getElectronBrowserWindowBounds(runtimeScene);
          const fallbackDisplay = screen.getPrimaryDisplay();
          if (!bounds) {
            return fallbackDisplay && fallbackDisplay.workArea
              ? fallbackDisplay.workArea
              : null;
          }

          const centerPoint = {
            x: bounds.x + Math.round(bounds.width / 2),
            y: bounds.y + Math.round(bounds.height / 2),
          };
          const display =
            screen.getDisplayNearestPoint(centerPoint) || fallbackDisplay;
          return display && display.workArea ? display.workArea : null;
        } catch (error) {
          return null;
        }
      };

      const computeDockedWindowPosition = (
        dockPosition: string,
        workArea: { x: number; y: number; width: number; height: number },
        bounds: { x: number; y: number; width: number; height: number },
        cornerOffsetX: float,
        cornerOffsetY: float,
        customX: float,
        customY: float
      ): { x: number; y: number } => {
        switch (dockPosition) {
          case 'TopLeft':
          case 'top-left':
            return {
              x: workArea.x + cornerOffsetX,
              y: workArea.y + cornerOffsetY,
            };
          case 'TopRight':
          case 'top-right':
            return {
              x: workArea.x + workArea.width - bounds.width - cornerOffsetX,
              y: workArea.y + cornerOffsetY,
            };
          case 'BottomLeft':
          case 'bottom-left':
            return {
              x: workArea.x + cornerOffsetX,
              y: workArea.y + workArea.height - bounds.height - cornerOffsetY,
            };
          case 'BottomRight':
          case 'bottom-right':
            return {
              x: workArea.x + workArea.width - bounds.width - cornerOffsetX,
              y: workArea.y + workArea.height - bounds.height - cornerOffsetY,
            };
          case 'Center':
          case 'center':
            return {
              x: workArea.x + Math.round((workArea.width - bounds.width) / 2),
              y: workArea.y + Math.round((workArea.height - bounds.height) / 2),
            };
          case 'Custom':
          case 'custom':
            return {
              x: customX,
              y: customY,
            };
          default:
            return {
              x: bounds.x,
              y: bounds.y,
            };
        }
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

      export const setSkipTaskbar = function (
        activate: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          if (activate && isGDevelopPreview(runtimeScene)) {
            electronBrowserWindow.setSkipTaskbar(false);
            return;
          }
          electronBrowserWindow.setSkipTaskbar(activate);
        }
      };

      export const setTaskbarVisible = function (
        visible: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        setSkipTaskbar(!visible, runtimeScene);
      };

      export const setIgnoreMouseEvents = function (
        activate: boolean,
        forward: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          if (activate) {
            electronBrowserWindow.setIgnoreMouseEvents(true, { forward });
          } else {
            electronBrowserWindow.setIgnoreMouseEvents(false);
          }
        }
      };

      export const setWindowBackgroundColor = function (
        backgroundColor: string,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          electronBrowserWindow.setBackgroundColor(backgroundColor);
        }
      };

      export const setMenuBarVisible = function (
        visible: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        if (electronBrowserWindow) {
          if (typeof electronBrowserWindow.setAutoHideMenuBar === 'function') {
            electronBrowserWindow.setAutoHideMenuBar(!visible);
          }
          if (
            typeof electronBrowserWindow.setMenuBarVisibility === 'function'
          ) {
            electronBrowserWindow.setMenuBarVisibility(visible);
          }
        }
      };

      export const dockWindow = function (
        dockPosition: string,
        cornerOffsetX: float,
        cornerOffsetY: float,
        customX: float,
        customY: float,
        runtimeScene: gdjs.RuntimeScene
      ) {
        const electronBrowserWindow = getElectronBrowserWindow(runtimeScene);
        const workArea = getCurrentDisplayWorkArea(runtimeScene);
        const bounds = getElectronBrowserWindowBounds(runtimeScene);
        if (!electronBrowserWindow || !bounds) return;

        if (!workArea) {
          if (dockPosition !== 'Custom' && dockPosition !== 'custom') return;
          electronBrowserWindow.setPosition(
            Math.round(customX),
            Math.round(customY)
          );
          return;
        }

        const targetPosition = computeDockedWindowPosition(
          dockPosition,
          workArea,
          bounds,
          cornerOffsetX,
          cornerOffsetY,
          customX,
          customY
        );

        electronBrowserWindow.setPosition(
          Math.round(targetPosition.x),
          Math.round(targetPosition.y)
        );
      };

      export const getWorkAreaX = function (
        runtimeScene: gdjs.RuntimeScene
      ): number {
        const workArea = getCurrentDisplayWorkArea(runtimeScene);
        return workArea ? workArea.x : 0;
      };

      export const getWorkAreaY = function (
        runtimeScene: gdjs.RuntimeScene
      ): number {
        const workArea = getCurrentDisplayWorkArea(runtimeScene);
        return workArea ? workArea.y : 0;
      };

      export const getWorkAreaWidth = function (
        runtimeScene: gdjs.RuntimeScene
      ): number {
        const workArea = getCurrentDisplayWorkArea(runtimeScene);
        return workArea ? workArea.width : 0;
      };

      export const getWorkAreaHeight = function (
        runtimeScene: gdjs.RuntimeScene
      ): number {
        const workArea = getCurrentDisplayWorkArea(runtimeScene);
        return workArea ? workArea.height : 0;
      };

      export const applyDesktopPetWindowMode = function (
        dockPosition: string,
        cornerOffsetX: float,
        cornerOffsetY: float,
        customX: float,
        customY: float,
        alwaysOnTop: boolean,
        showInTaskbar: boolean,
        clickThrough: boolean,
        showMenuBar: boolean,
        runtimeScene: gdjs.RuntimeScene
      ) {
        setWindowBackgroundColor('#00000000', runtimeScene);
        setAlwaysOnTop(alwaysOnTop, 'floating', runtimeScene);
        setHasShadow(false, runtimeScene);
        setTaskbarVisible(showInTaskbar, runtimeScene);
        setIgnoreMouseEvents(clickThrough, true, runtimeScene);
        setMenuBarVisible(showMenuBar, runtimeScene);
        dockWindow(
          dockPosition,
          cornerOffsetX,
          cornerOffsetY,
          customX,
          customY,
          runtimeScene
        );
      };
    }
  }
}
