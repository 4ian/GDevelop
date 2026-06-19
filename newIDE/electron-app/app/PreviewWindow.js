const {
  BrowserWindow, // Module to create native browser window.
  ipcMain,
  shell,
  screen,
  powerSaveBlocker,
} = require('electron');
const isDev = require('electron-is-dev');
const { load } = require('./Utils/UrlLoader');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// Map of preview windows with their parent window ID: { previewWindow, parentWindowId }
let previewWindows = [];
let debuggerPopOutWindows = new Map();

let openDevToolsByDefault = false;

// While ANY preview is open we hold a power-save blocker. macOS suspends the
// entire renderer process of an OCCLUDED window (not just its requestAnimationFrame
// loop) — which kills the debugger websocket pump, so run_frames /
// inspect_running_preview / capture_preview_screenshot all time out on a preview
// that opened behind the editor. 'prevent-app-suspension' keeps the app (and its
// renderer processes' JS event loops) alive so those debugger-channel tools keep
// working even when the preview is not foreground. Ref-counted to the number of
// open previews. (backgroundThrottling:false alone does NOT cover occlusion.)
let powerSaveBlockerId = null;
const updatePowerSaveBlocker = () => {
  const shouldBlock = previewWindows.length > 0;
  if (shouldBlock && powerSaveBlockerId === null) {
    try {
      powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');
    } catch (error) {
      console.warn('Could not start power save blocker for preview:', error);
      powerSaveBlockerId = null;
    }
  } else if (!shouldBlock && powerSaveBlockerId !== null) {
    try {
      if (powerSaveBlocker.isStarted(powerSaveBlockerId)) {
        powerSaveBlocker.stop(powerSaveBlockerId);
      }
    } catch (error) {
      console.warn('Could not stop power save blocker for preview:', error);
    }
    powerSaveBlockerId = null;
  }
};

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const getLatestPreviewWindow = parentWindowId => {
  for (let i = previewWindows.length - 1; i >= 0; i--) {
    if (previewWindows[i].parentWindowId !== parentWindowId) continue;
    const previewWindow = previewWindows[i].previewWindow;
    if (previewWindow && !previewWindow.isDestroyed()) return previewWindow;
  }

  return null;
};

const showWithoutStealingFocus = window => {
  if (typeof window.showInactive === 'function') window.showInactive();
  else window.show();
};

const keepParentWindowVisibleAfterChildClose = (
  parentWindowId,
  parentWasMinimizedBeforeChildClose
) => {
  if (parentWindowId === null || parentWasMinimizedBeforeChildClose) return;

  const restoreParentWindow = () => {
    const parentWindow = BrowserWindow.fromId(parentWindowId);
    if (!parentWindow || parentWindow.isDestroyed()) return;

    try {
      if (parentWindow.isMinimized()) parentWindow.restore();
      showWithoutStealingFocus(parentWindow);
    } catch (error) {
      console.warn(
        'Ignoring exception when restoring parent editor window:',
        error
      );
    }
  };

  setTimeout(restoreParentWindow, 0);
  setTimeout(restoreParentWindow, 100);
};

const arrangeDebuggerPopOutWithLatestPreview = parentWindowId => {
  const previewWindow = getLatestPreviewWindow(parentWindowId);
  const debuggerWindow = debuggerPopOutWindows.get(parentWindowId);

  if (
    !previewWindow ||
    !debuggerWindow ||
    previewWindow.isDestroyed() ||
    debuggerWindow.isDestroyed()
  ) {
    return false;
  }

  try {
    if (previewWindow.isMinimized()) previewWindow.restore();
    if (debuggerWindow.isMinimized()) debuggerWindow.restore();

    const previewBounds = previewWindow.getBounds();
    const workArea = screen.getDisplayMatching(previewBounds).workArea;
    const preferredDebuggerWidth = 640;
    const minimumDebuggerWidth = 420;
    const availableWidthNextToPreview = workArea.width - previewBounds.width;
    const debuggerWidth =
      availableWidthNextToPreview >= minimumDebuggerWidth
        ? Math.min(preferredDebuggerWidth, availableWidthNextToPreview)
        : Math.min(
            preferredDebuggerWidth,
            Math.max(minimumDebuggerWidth, Math.floor(workArea.width * 0.35))
          );
    const debuggerHeight = Math.min(previewBounds.height, workArea.height);
    const combinedWidth = previewBounds.width + debuggerWidth;
    const maxPreviewX = workArea.x + workArea.width - combinedWidth;
    const previewX =
      maxPreviewX >= workArea.x
        ? clamp(previewBounds.x, workArea.x, maxPreviewX)
        : workArea.x;
    const previewY =
      previewBounds.height <= workArea.height
        ? clamp(
            previewBounds.y,
            workArea.y,
            workArea.y + workArea.height - previewBounds.height
          )
        : workArea.y;

    previewWindow.setPosition(Math.round(previewX), Math.round(previewY));
    debuggerWindow.setBounds({
      x: Math.round(
        Math.min(
          previewX + previewBounds.width,
          workArea.x + workArea.width - debuggerWidth
        )
      ),
      y: Math.round(previewY),
      width: Math.round(debuggerWidth),
      height: Math.round(debuggerHeight),
    });

    showWithoutStealingFocus(previewWindow);
    showWithoutStealingFocus(debuggerWindow);
    if (typeof previewWindow.moveTop === 'function') previewWindow.moveTop();
    if (typeof debuggerWindow.moveTop === 'function') debuggerWindow.moveTop();
    return true;
  } catch (error) {
    console.warn(
      'Ignoring exception when arranging debugger and preview windows:',
      error
    );
    return false;
  }
};

const setDebuggerPopOutWindow = (parentWindowId, debuggerWindow) => {
  debuggerPopOutWindows.set(parentWindowId, debuggerWindow);
  arrangeDebuggerPopOutWithLatestPreview(parentWindowId);

  debuggerWindow.on('closed', () => {
    if (debuggerPopOutWindows.get(parentWindowId) === debuggerWindow) {
      debuggerPopOutWindows.delete(parentWindowId);
    }
  });
};

const sendDebuggerPopOutCloseRequested = parentWindowId => {
  const parentWindow =
    parentWindowId !== null ? BrowserWindow.fromId(parentWindowId) : null;
  if (
    parentWindow &&
    !parentWindow.isDestroyed() &&
    parentWindow.webContents &&
    !parentWindow.webContents.isDestroyed()
  ) {
    parentWindow.webContents.send('debugger-popout-close-requested');
  }
};

const closeDebuggerPopOutWindow = (
  parentWindowId,
  parentWasMinimizedBeforePreviewClose
) => {
  sendDebuggerPopOutCloseRequested(parentWindowId);

  const debuggerWindow = debuggerPopOutWindows.get(parentWindowId);
  if (!debuggerWindow || debuggerWindow.isDestroyed()) return;

  try {
    if (typeof debuggerWindow.setParentWindow === 'function') {
      debuggerWindow.setParentWindow(null);
    }

    setImmediate(() => {
      try {
        if (!debuggerWindow.isDestroyed()) debuggerWindow.close();
      } catch (error) {
        console.warn('Ignoring exception when closing debugger window:', error);
      }

      keepParentWindowVisibleAfterChildClose(
        parentWindowId,
        parentWasMinimizedBeforePreviewClose
      );
    });
  } catch (error) {
    console.warn('Ignoring exception when closing debugger window:', error);
  }
};

/**
 * Open 1 or multiple windows running a preview of an exported game.
 */
const openPreviewWindow = ({
  parentWindow,
  previewBrowserWindowOptions,
  previewGameIndexHtmlPath,
  alwaysOnTop,
  hideMenuBar,
  numberOfWindows,
  captureOptions,
  openEvent,
}) => {
  // If opening multiple windows at once, place them across the screen.
  const screenSize = screen.getPrimaryDisplay().workAreaSize;
  const screenWidth = screenSize.width;
  const screenHeight = screenSize.height;
  const positions = {
    // top-left
    1: { x: 0, y: 0 },
    // top-right
    2: { x: screenWidth / 2, y: 0 },
    // bottom-left
    3: { x: 0, y: screenHeight / 2 },
    // bottom-right
    4: { x: screenWidth / 2, y: screenHeight / 2 },
  };
  for (let i = 0; i < numberOfWindows; i++) {
    const parentWindowId = parentWindow ? parentWindow.id : null;
    const browserWindowOptions = {
      ...previewBrowserWindowOptions,
      parent: alwaysOnTop ? parentWindow : null,
      x: numberOfWindows > 1 ? positions[i + 1].x : undefined,
      y: numberOfWindows > 1 ? positions[i + 1].y : undefined,
    };

    let previewWindow = new BrowserWindow(browserWindowOptions);
    let parentWasMinimizedBeforePreviewClose = parentWindow
      ? parentWindow.isMinimized()
      : false;

    previewWindow.setMenuBarVisibility(hideMenuBar);
    previewWindow.webContents.on('devtools-opened', () => {
      openDevToolsByDefault = true;
    });
    previewWindow.webContents.on('devtools-closed', () => {
      openDevToolsByDefault = false;
    });

    if (openDevToolsByDefault) previewWindow.openDevTools();

    // Enable `@electron/remote` module for renderer process
    require('@electron/remote/main').enable(previewWindow.webContents);

    // Open external link in the OS default browser
    previewWindow.webContents.setWindowOpenHandler(details => {
      shell.openExternal(details.url);
      return { action: 'deny' };
    });

    previewWindow.loadURL(previewGameIndexHtmlPath);

    previewWindow.on('close', () => {
      parentWasMinimizedBeforePreviewClose =
        !!parentWindow &&
        !parentWindow.isDestroyed() &&
        parentWindow.isMinimized();

      if (typeof previewWindow.setParentWindow === 'function') {
        previewWindow.setParentWindow(null);
      }
    });

    // Track this preview window with its parent
    previewWindows.push({
      previewWindow: previewWindow,
      parentWindowId,
    });
    updatePowerSaveBlocker();
    arrangeDebuggerPopOutWithLatestPreview(parentWindowId);

    previewWindow.on('closed', closeEvent => {
      previewWindows = previewWindows.filter(
        entry => entry.previewWindow !== previewWindow
      );
      updatePowerSaveBlocker();
      if (
        previewWindows.some(
          entry =>
            entry.parentWindowId === parentWindowId &&
            entry.previewWindow &&
            !entry.previewWindow.isDestroyed()
        )
      ) {
        arrangeDebuggerPopOutWithLatestPreview(parentWindowId);
      } else {
        closeDebuggerPopOutWindow(
          parentWindowId,
          parentWasMinimizedBeforePreviewClose
        );
      }
      keepParentWindowVisibleAfterChildClose(
        parentWindowId,
        parentWasMinimizedBeforePreviewClose
      );
      // Only send message if the parent window still exists
      if (openEvent.sender && !openEvent.sender.isDestroyed()) {
        openEvent.sender.send('preview-window-closed');
      }
      previewWindow = null;
    });
  }
};

const closePreviewWindow = windowId => {
  const entry = previewWindows.find(
    entry => entry.previewWindow.id === windowId
  );
  if (entry && entry.previewWindow) {
    entry.previewWindow.close();
  }
};

const closePreviewWindowsForParent = parentWindowId => {
  const entriesToClose = previewWindows.filter(
    entry => entry.parentWindowId === parentWindowId
  );
  entriesToClose.forEach(entry => {
    try {
      if (entry.previewWindow && !entry.previewWindow.isDestroyed()) {
        entry.previewWindow.close();
      }
    } catch (error) {
      console.warn('Ignoring exception when closing preview window:', error);
    }
  });
};

const closeAllPreviewWindows = () => {
  previewWindows.forEach(entry => {
    try {
      if (entry.previewWindow && !entry.previewWindow.isDestroyed()) {
        entry.previewWindow.close();
      }
    } catch (error) {
      console.warn('Ignoring exception when closing preview window:', error);
    }
  });
};

const focusAllPreviewWindows = () => {
  previewWindows.forEach(entry => {
    const win = entry.previewWindow;
    try {
      if (win && !win.isDestroyed()) {
        // De-occlude as aggressively as possible so Chromium resumes the
        // window's requestAnimationFrame loop (it throttles/pauses rAF for
        // occluded/backgrounded windows even with backgroundThrottling:false).
        // show() reveals/un-minimizes, moveTop() raises in the z-order,
        // focus() gives input focus. The transient alwaysOnTop toggle forces
        // the window above other app windows on macOS where focus() alone may
        // not change occlusion.
        if (win.isMinimized()) win.restore();
        win.show();
        if (typeof win.moveTop === 'function') win.moveTop();
        win.setAlwaysOnTop(true);
        win.focus();
        win.setAlwaysOnTop(false);
      }
    } catch (error) {
      console.warn('Ignoring exception when focusing preview window:', error);
    }
  });
  return previewWindows.length;
};

// Capture a PNG of a preview window's content from the MAIN process via
// webContents.capturePage(). Unlike the renderer-side canvas.toDataURL path,
// this does NOT execute any JS in the (possibly OS-suspended) renderer, so it
// works for a preview that opened behind the editor. Returns a base64 PNG data
// URL plus size, or { error }. If windowId is omitted, captures the most
// recently opened preview (last in the list = newest).
const capturePreviewPage = async windowId => {
  let entry = null;
  if (windowId !== undefined && windowId !== null) {
    entry = previewWindows.find(e => e.previewWindow.id === windowId);
  } else if (previewWindows.length) {
    entry = previewWindows[previewWindows.length - 1];
  }
  if (!entry || !entry.previewWindow || entry.previewWindow.isDestroyed()) {
    return { error: 'No preview window available to capture.' };
  }
  try {
    const image = await entry.previewWindow.webContents.capturePage();
    const size = image.getSize();
    return {
      dataUrl: image.toDataURL(),
      width: size.width,
      height: size.height,
      windowId: entry.previewWindow.id,
    };
  } catch (error) {
    return { error: 'capturePage failed: ' + (error.message || String(error)) };
  }
};

module.exports = {
  openPreviewWindow,
  closePreviewWindow,
  closePreviewWindowsForParent,
  closeAllPreviewWindows,
  focusAllPreviewWindows,
  capturePreviewPage,
  setDebuggerPopOutWindow,
};
