// @ts-check
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
   * @type {?Object}
   */
  electronBrowserWindow: null,
};

// @ts-ignore
if (typeof require === 'function') {
  // @ts-ignore
  gdjs.evtTools.advancedWindow.electronBrowserWindow = require('electron').remote.getCurrentWindow();
}

/**
 * @param {boolean} activate
 */
gdjs.evtTools.advancedWindow.focus = function (activate) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
    if (activate) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.focus();
    } else {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.blur();
    }
  }
};

/**
 * @return {boolean}
 */
gdjs.evtTools.advancedWindow.isFocused = function () {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    return gdjs.evtTools.advancedWindow.electronBrowserWindow.isFocused();
  return false;
};

/**
 * @param {boolean} activate
 */
gdjs.evtTools.advancedWindow.show = function (activate) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
    if (activate) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.showInactive();
    } else {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.hide();
    }
  }
};

/**
 * @return {boolean}
 */
gdjs.evtTools.advancedWindow.isVisible = function () {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    return gdjs.evtTools.advancedWindow.electronBrowserWindow.isVisible();
  return false;
};

/**
 * @param {boolean} activate
 */
gdjs.evtTools.advancedWindow.maximize = function (activate) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
    if (activate) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.maximize();
    } else {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.unmaximize();
    }
  }
};

/**
 * @return {boolean}
 */
gdjs.evtTools.advancedWindow.isMaximized = function () {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    return gdjs.evtTools.advancedWindow.electronBrowserWindow.isMaximized();
  return false;
};

/**
 * @param {boolean} activate
 */
gdjs.evtTools.advancedWindow.minimize = function (activate) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
    if (activate) {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.minimize();
    } else {
      gdjs.evtTools.advancedWindow.electronBrowserWindow.restore();
    }
  }
};

/**
 * @return {boolean}
 */
gdjs.evtTools.advancedWindow.isMinimized = function () {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    return gdjs.evtTools.advancedWindow.electronBrowserWindow.isMinimized();
  return false;
};

/**
 * @param {boolean} activate
 */
gdjs.evtTools.advancedWindow.enable = function (activate) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    gdjs.evtTools.advancedWindow.electronBrowserWindow.setEnabled(activate);
};

/**
 * @return {boolean}
 */
gdjs.evtTools.advancedWindow.isEnabled = function () {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    return gdjs.evtTools.advancedWindow.electronBrowserWindow.isEnabled();
  return false;
};

/**
 * @param {boolean} activate
 */
gdjs.evtTools.advancedWindow.setResizable = function (activate) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    gdjs.evtTools.advancedWindow.electronBrowserWindow.setResizable(activate);
};

/**
 * @return {boolean}
 */
gdjs.evtTools.advancedWindow.isResizable = function () {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    return gdjs.evtTools.advancedWindow.electronBrowserWindow.isResizable();
  return false;
};

/**
 * @param {boolean} activate
 */
gdjs.evtTools.advancedWindow.setMovable = function (activate) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    gdjs.evtTools.advancedWindow.electronBrowserWindow.setMovable(activate);
};

/**
 * @return {boolean}
 */
gdjs.evtTools.advancedWindow.isMovable = function () {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    return gdjs.evtTools.advancedWindow.electronBrowserWindow.isMovable();
  return false;
};

/**
 * @param {boolean} activate
 */
gdjs.evtTools.advancedWindow.setMaximizable = function (activate) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    gdjs.evtTools.advancedWindow.electronBrowserWindow.setMaximizable(activate);
};

/**
 * @return {boolean}
 */
gdjs.evtTools.advancedWindow.isMaximizable = function () {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    return gdjs.evtTools.advancedWindow.electronBrowserWindow.isMaximizable();
  return false;
};

/**
 * @param {boolean} activate
 */
gdjs.evtTools.advancedWindow.setMinimizable = function (activate) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    gdjs.evtTools.advancedWindow.electronBrowserWindow.setMinimizable(activate);
};

/**
 * @return {boolean}
 */
gdjs.evtTools.advancedWindow.isMinimizable = function () {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    return gdjs.evtTools.advancedWindow.electronBrowserWindow.isMinimizable();
  return false;
};

/**
 * @param {boolean} activate
 */
gdjs.evtTools.advancedWindow.setFullScreenable = function (activate) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    gdjs.evtTools.advancedWindow.electronBrowserWindow.setFullScreenable(
      activate
    );
};

/**
 * @return {boolean}
 */
gdjs.evtTools.advancedWindow.isFullScreenable = function () {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    return gdjs.evtTools.advancedWindow.electronBrowserWindow.isFullScreenable();
  return false;
};

/**
 * @param {boolean} activate
 */
gdjs.evtTools.advancedWindow.setClosable = function (activate) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    gdjs.evtTools.advancedWindow.electronBrowserWindow.setClosable(activate);
};

/**
 * @return {boolean}
 */
gdjs.evtTools.advancedWindow.isClosable = function () {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    return gdjs.evtTools.advancedWindow.electronBrowserWindow.isClosable();
  return false;
};

/**
 * @param {boolean} activate
 * @param {"normal" | "floating" | "torn-off-menu" | "modal-panel" |"main-menu" | "status" | "pop-up-menu" | "screen-saver"} level
 */
gdjs.evtTools.advancedWindow.setAlwaysOnTop = function (activate, level) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    gdjs.evtTools.advancedWindow.electronBrowserWindow.setAlwaysOnTop(
      activate,
      level
    );
};

/**
 * @return {boolean}
 */
gdjs.evtTools.advancedWindow.isAlwaysOnTop = function () {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    return gdjs.evtTools.advancedWindow.electronBrowserWindow.isAlwaysOnTop();
  return false;
};

/**
 * @param {number} x
 * @param {number} y
 */
gdjs.evtTools.advancedWindow.setPosition = function (x, y) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
    // Convert x and y to (32 bit) integers to avoid Electron errors.
    gdjs.evtTools.advancedWindow.electronBrowserWindow.setPosition(~~x, ~~y);
  }
};

/**
 * @return {number}
 */
gdjs.evtTools.advancedWindow.getPositionX = function () {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
    return gdjs.evtTools.advancedWindow.electronBrowserWindow.getPosition()[0];
  }
  return 0;
};

/**
 * @return {number}
 */
gdjs.evtTools.advancedWindow.getPositionY = function () {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow) {
    return gdjs.evtTools.advancedWindow.electronBrowserWindow.getPosition()[1];
  }
  return 0;
};

/**
 * @param {boolean} activate
 */
gdjs.evtTools.advancedWindow.setKiosk = function (activate) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    gdjs.evtTools.advancedWindow.electronBrowserWindow.setKiosk(activate);
};

/**
 * @return {boolean}
 */
gdjs.evtTools.advancedWindow.isKiosk = function () {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    return gdjs.evtTools.advancedWindow.electronBrowserWindow.isKiosk();
  return false;
};

/**
 * @param {boolean} activate
 */
gdjs.evtTools.advancedWindow.flash = function (activate) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    gdjs.evtTools.advancedWindow.electronBrowserWindow.flashFrame(activate);
};

/**
 * @param {boolean} activate
 */
gdjs.evtTools.advancedWindow.setHasShadow = function (activate) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    gdjs.evtTools.advancedWindow.electronBrowserWindow.setHasShadow(activate);
};

/**
 * @return {boolean}
 */
gdjs.evtTools.advancedWindow.hasShadow = function () {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    return gdjs.evtTools.advancedWindow.electronBrowserWindow.hasShadow();
  return false;
};

/**
 * @param {number} opacity
 */
gdjs.evtTools.advancedWindow.setOpacity = function (opacity) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    gdjs.evtTools.advancedWindow.electronBrowserWindow.setOpacity(opacity);
};

/**
 * @return {number}
 */
gdjs.evtTools.advancedWindow.getOpacity = function () {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    return gdjs.evtTools.advancedWindow.electronBrowserWindow.getOpacity();
  return 1;
};

/**
 * @param {boolean} activate
 */
gdjs.evtTools.advancedWindow.setContentProtection = function (activate) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    gdjs.evtTools.advancedWindow.electronBrowserWindow.setContentProtection(
      activate
    );
};

/**
 * @param {boolean} activate
 */
gdjs.evtTools.advancedWindow.setFocusable = function (activate) {
  if (gdjs.evtTools.advancedWindow.electronBrowserWindow)
    gdjs.evtTools.advancedWindow.electronBrowserWindow.setFocusable(activate);
};
