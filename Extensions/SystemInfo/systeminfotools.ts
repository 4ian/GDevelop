/*
 * GDevelop - SystemInfo Extension
 * Copyright (c) 2016-present Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  export namespace evtTools {
    export namespace systemInfo {
      let cachedHasTouchScreen: boolean | null = null;

      /**
       * Check if the game runs on a mobile device (iPhone, iPad, Android).
       * Note that the distinction between what is a mobile device and what is not
       * is becoming blurry. If you use this for mobile controls,
       * prefer to check if the device has touchscreen support.
       */
      export const isMobile = (): boolean => {
        return gdjs.evtTools.common.isMobile();
      };

      /**
       * Check if the game is running as a native mobile app - which in the case
       * of an exported GDevelop game means: running packaged inside Cordova/Capacitor.js.
       *
       * Note: this could be improved to also detect running inside an embedded webview.
       *
       * @returns true if running inside Cordova (or Capacitor.js).
       */
      export const isNativeMobileApp = (): boolean => {
        return typeof window !== 'undefined' && (window as any).cordova;
      };

      /**
       * Check if the game is running as a native desktop app - which in the case
       * of an exported GDevelop game means: running packaged inside Electron.
       *
       * @param instanceContainer The current scene.
       * @returns true if running inside Electron.
       */
      export const isNativeDesktopApp = (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): boolean => {
        return !!instanceContainer.getGame().getRenderer().getElectron();
      };

      const checkHasTouchScreen = (): boolean => {
        // First check if the device is mobile, as all mobile devices have a touchscreen
        // and some older browsers don't have support for `navigator.maxTouchPoints`
        if (isMobile()) {
          return true;
        }
        return !!navigator.maxTouchPoints && navigator.maxTouchPoints > 2;
      };

      /**
       * Check if the device has a touchscreen
       */
      export const hasTouchScreen = () => {
        if (cachedHasTouchScreen !== null) {
          return cachedHasTouchScreen;
        }
        return (cachedHasTouchScreen = checkHasTouchScreen());
      };

      /**
       * Check if the the device supports WebGL.
       * @returns true if WebGL is supported
       */
      export const isWebGLSupported = (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): boolean => {
        return instanceContainer.getGame().getRenderer().isWebGLSupported();
      };

      /**
       * Check if the game is running as a preview, launched from an editor.
       * @param instanceContainer The current container.
       * @returns true if the game is running as a preview.
       */
      export const isPreview = (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): boolean => {
        return instanceContainer.getGame().isPreview();
      };
    }
  }
}
