// @ts-check
/**
 * A set of wrappers arround the electron APIs 
 * that don't crash the game on non-electron platforms.
 * 
 * Docstrings are only used for typing here, for propper 
 * documentation check the electron docs at
 * https://www.electronjs.org/docs/api.
 * 
 * @filedescriptor
 * @author arthuro555
 */

/**
 * Wrappers for the electron APIs.
 * @namespace
 */
gdjs.evtTools.electron = {
    /**
     * The games BrowserWindow instance (or null on 
     * non-electron platforms)
     * @type {?Object}
     */
    window: null,
};

if(typeof require === "function") {
    gdjs.evtTools.electron.window = require("electron").remote.getCurrentWindow();
}

/**
 * @param {boolean} activate 
 */
gdjs.evtTools.electron.focus = function(activate) {
    if(gdjs.evtTools.electron.window) {
        if (activate) {
            gdjs.evtTools.electron.window.focus();
        } else {
            gdjs.evtTools.electron.window.blur();
        }
    }
}

/**
 * @return {boolean}
 */
gdjs.evtTools.electron.isFocused = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isFocused();
    return false;
}

/**
 * @param {boolean} activate 
 */
gdjs.evtTools.electron.show = function(activate) {
    if(gdjs.evtTools.electron.window) {
        if (activate) {
            gdjs.evtTools.electron.window.showInactive();
        } else {
            gdjs.evtTools.electron.window.hide();
        }
    }
}

/**
 * @return {boolean}
 */
gdjs.evtTools.electron.isVisible = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isVisible();
    return false;
}

/**
 * @param {boolean} activate 
 */
gdjs.evtTools.electron.maximize = function(activate) {
    if(gdjs.evtTools.electron.window) {
        if (activate) {
            gdjs.evtTools.electron.window.maximize();
        } else {
            gdjs.evtTools.electron.window.unmaximize();
        }
    }
}

/**
 * @return {boolean}
 */
gdjs.evtTools.electron.isMaximized = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isMaximized();
    return false;
}

/**
 * @param {boolean} activate 
 */
gdjs.evtTools.electron.minimize = function(activate) {
    if(gdjs.evtTools.electron.window) {
        if (activate) {
            gdjs.evtTools.electron.window.minimize();
        } else {
            gdjs.evtTools.electron.window.restore();
        }
    }
}

/**
 * @return {boolean}
 */
gdjs.evtTools.electron.isMinimized = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isMinimized();
    return false;
}

/**
 * @param {boolean} activate 
 */
gdjs.evtTools.electron.enable = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setEnabled(activate);
}

/**
 * @return {boolean}
 */
gdjs.evtTools.electron.isEnabled = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isEnabled();
    return false;
}

/**
 * @param {boolean} activate 
 */
gdjs.evtTools.electron.setResizable = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setResizable(activate);
}

/**
 * @return {boolean}
 */
gdjs.evtTools.electron.isResizable = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isResizable();
    return false;
}

/**
 * @param {boolean} activate 
 */
gdjs.evtTools.electron.setMovable = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setMovable(activate);
}

/**
 * @return {boolean}
 */
gdjs.evtTools.electron.isMovable = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isMovable();
    return false;
}

/**
 * @param {boolean} activate 
 */
gdjs.evtTools.electron.setMaximizable = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setMaximizable(activate);
}

/**
 * @return {boolean}
 */
gdjs.evtTools.electron.isMaximizable = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isMaximizable();
    return false;
}

/**
 * @param {boolean} activate 
 */
gdjs.evtTools.electron.setMinimizable = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setMinimizable(activate);
}

/**
 * @return {boolean}
 */
gdjs.evtTools.electron.isMinimizable = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isMinimizable();
    return false;
}

/**
 * @param {boolean} activate 
 */
gdjs.evtTools.electron.setFullScreenable = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setFullScreenable(activate);
}

/**
 * @return {boolean}
 */
gdjs.evtTools.electron.isFullScreenable = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isFullScreenable();
    return false;
}

/**
 * @param {boolean} activate 
 */
gdjs.evtTools.electron.setClosable = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setClosable(activate);
}

/**
 * @return {boolean}
 */
gdjs.evtTools.electron.isClosable = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isClosable();
    return false;
}

/**
 * @param {boolean} activate 
 * @param {"normal" | "floating" | "torn-off-menu" | "modal-panel" |"main-menu" | "status" | "pop-up-menu" | "screen-saver"} level
 */
gdjs.evtTools.electron.setAlwaysOnTop = function(activate, level) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setAlwaysOnTop(activate, level);
}

/**
 * @return {boolean}
 */
gdjs.evtTools.electron.isAlwaysOnTop = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isAlwaysOnTop();
    return false;
}

gdjs.evtTools.electron.center = function() {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.center();
}

/**
 * @param {number} x
 * @param {number} y
 */
gdjs.evtTools.electron.setPosition = function(x, y) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setPosition(x, y);
}

/**
 * @return {number}
 */
gdjs.evtTools.electron.getPositionX = function() {
    if(gdjs.evtTools.electron.window) {
        return gdjs.evtTools.electron.window.getPosition()[0];
    }
    return 0;
}

/**
 * @return {number}
 */
gdjs.evtTools.electron.getPositionY = function() {
    if(gdjs.evtTools.electron.window) {
        return gdjs.evtTools.electron.window.getPosition()[1];
    }
    return 0;
}

/**
 * @param {boolean} activate 
 */
gdjs.evtTools.electron.setKiosk = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setKiosk(activate);
}

/**
 * @return {boolean}
 */
gdjs.evtTools.electron.isKiosk = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isKiosk();
    return false;
}

/**
 * @param {boolean} activate 
 */
gdjs.evtTools.electron.flash = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.flashFrame(activate);
}

/**
 * @param {boolean} activate 
 */
gdjs.evtTools.electron.setHasShadow = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setHasShadow(activate);
}

/**
 * @return {boolean}
 */
gdjs.evtTools.electron.hasShadow = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.hasShadow();
    return false;
}

/**
 * @param {number} opacity 
 */
gdjs.evtTools.electron.setOpacity = function(opacity) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setOpacity(opacity);
}

/**
 * @return {number}
 */
gdjs.evtTools.electron.getOpacity = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.getOpacity();
    return 1;
}

/**
 * @param {boolean} activate 
 */
gdjs.evtTools.electron.setContentProtection = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setContentProtection(activate);
}

/**
 * @param {boolean} activate 
 */
gdjs.evtTools.electron.setFocusable = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setFocusable(activate);
}
