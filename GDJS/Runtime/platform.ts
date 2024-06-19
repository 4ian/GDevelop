/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * The `gdjs` namespace contains all classes and objects of the game engine.
 * @namespace gdjs
 */
namespace gdjs {
  /**
   * Helper function to get information about the platform running the game.
   */
  export const getPlatformInfo = () => ({
    // @ts-ignore
    isCordova: !!window.cordova,
    devicePlatform:
      // @ts-ignore
      typeof device !== 'undefined' ? device.platform || '' : '',
    navigatorPlatform:
      typeof navigator !== 'undefined' ? navigator.platform : '',
    hasTouch:
      typeof navigator !== 'undefined'
        ? !!navigator.maxTouchPoints && navigator.maxTouchPoints > 2
        : false,
  });
}
