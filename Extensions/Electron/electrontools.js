gdjs.evtTools.electron = {
    window: null,
};

if(typeof require === "function") {
    gdjs.evtTools.electron.window = require("electron").remote.getCurrentWindow();
}

gdjs.evtTools.electron.focus = function(activate) {
    if(gdjs.evtTools.electron.window) {
        if (activate) {
            gdjs.evtTools.electron.window.focus();
        } else {
            gdjs.evtTools.electron.window.blur();
        }
    }
}

gdjs.evtTools.electron.isFocused = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isFocused();
    return false;
}

gdjs.evtTools.electron.show = function(activate) {
    if(gdjs.evtTools.electron.window) {
        if (activate) {
            gdjs.evtTools.electron.window.showInactive();
        } else {
            gdjs.evtTools.electron.window.hide();
        }
    }
}

gdjs.evtTools.electron.isVisible = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isVisible();
    return false;
}

gdjs.evtTools.electron.maximize = function(activate) {
    if(gdjs.evtTools.electron.window) {
        if (activate) {
            gdjs.evtTools.electron.window.maximize();
        } else {
            gdjs.evtTools.electron.window.unmaximize();
        }
    }
}

gdjs.evtTools.electron.isMaximized = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isMaximized();
    return false;
}

gdjs.evtTools.electron.minimize = function(activate) {
    if(gdjs.evtTools.electron.window) {
        if (activate) {
            gdjs.evtTools.electron.window.minimize();
        } else {
            gdjs.evtTools.electron.window.restore();
        }
    }
}

gdjs.evtTools.electron.isMinimized = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isMinimized();
    return false;
}

gdjs.evtTools.electron.enable = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setEnabled(activate);
}

gdjs.evtTools.electron.isEnabled = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isEnabled();
    return false;
}

gdjs.evtTools.electron.setResizable = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setResizable(activate);
}

gdjs.evtTools.electron.isResizable = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isResizable();
    return false;
}

gdjs.evtTools.electron.setMovable = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setMovable(activate);
}

gdjs.evtTools.electron.isMovable = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isMovable();
    return false;
}

gdjs.evtTools.electron.setMaximizable = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setMaximizable(activate);
}

gdjs.evtTools.electron.isMaximizable = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isMaximizable();
    return false;
}

gdjs.evtTools.electron.setMinimizable = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setMinimizable(activate);
}

gdjs.evtTools.electron.isMinimizable = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isMinimizable();
    return false;
}

gdjs.evtTools.electron.setFullScreenable = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setFullScreenable(activate);
}

gdjs.evtTools.electron.isFullScreenable = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isFullScreenable();
    return false;
}

gdjs.evtTools.electron.setClosable = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setClosable(activate);
}

gdjs.evtTools.electron.isClosable = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isClosable();
    return false;
}

gdjs.evtTools.electron.setAlwaysOnTop = function(activate, level) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setAlwaysOnTop(activate, level);
}

gdjs.evtTools.electron.isAlwaysOnTop = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isAlwaysOnTop();
    return false;
}

gdjs.evtTools.electron.center = function() {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.center();
}

gdjs.evtTools.electron.setPosition = function(x, y) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setPosition(x, y);
}

gdjs.evtTools.electron.getPositionX = function() {
    if(gdjs.evtTools.electron.window) {
        return gdjs.evtTools.electron.window.getPosition()[0];
    }
    return 0;
}

gdjs.evtTools.electron.getPositionY = function() {
    if(gdjs.evtTools.electron.window) {
        return gdjs.evtTools.electron.window.getPosition()[1];
    }
    return 0;
}

gdjs.evtTools.electron.setKiosk = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setKiosk(activate);
}

gdjs.evtTools.electron.isKiosk = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.isKiosk();
    return false;
}

gdjs.evtTools.electron.flash = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.flashFrame(activate);
}

gdjs.evtTools.electron.setHasShadow = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setHasShadow(activate);
}

gdjs.evtTools.electron.hasShadow = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.hasShadow();
    return false;
}

gdjs.evtTools.electron.setOpacity = function(opacity) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setOpacity(opacity);
}

gdjs.evtTools.electron.getOpacity = function() {
    if(gdjs.evtTools.electron.window) return gdjs.evtTools.electron.window.getOpacity();
    return 1;
}

gdjs.evtTools.electron.setContentProtection = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setContentProtection(activate);
}

gdjs.evtTools.electron.setFocusable = function(activate) {
    if(gdjs.evtTools.electron.window) gdjs.evtTools.electron.window.setFocusable(activate);
}
