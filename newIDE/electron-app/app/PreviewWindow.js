const {
  BrowserWindow, // Module to create native browser window.
  ipcMain,
  shell,
  screen,
  powerSaveBlocker,
} = require('electron');
const isDev = require('electron-is-dev');
const { load } = require('./Utils/UrlLoader');
const {
  setPreviewWindowMenuBarVisibilityAndContentSize,
  getPreviewBrowserWindowOptionsFittingDisplay,
  getBoundsFittingDisplayHeight,
} = require('./PreviewWindowBounds');
const { injectPreviewClickUserGesture } = require('./PreviewWindowUserInput');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// Map of preview windows with their parent window ID: { previewWindow, parentWindowId }
let previewWindows = [];
let debuggerPopOutWindows = new Map();
let closingDebuggerPopOutWindowIds = new Set();

let openDevToolsByDefault = false;
const DEBUGGER_POP_OUT_FORCE_CLOSE_DELAY_MS = 17000;

// While ANY preview is open we hold a power-save blocker. macOS suspends the
// entire renderer process of an OCCLUDED window (not just its requestAnimationFrame
// loop) — which kills the debugger websocket pump, so run_frames /
// inspect_running_preview / capture_preview_screenshot all time out on a preview
// that opened behind the editor. 'prevent-app-suspension' keeps the app (and its
// renderer processes' JS event loops) alive so those debugger-channel tools keep
// working even when the preview is not foreground. Ref-counted to the number of
// open previews. (backgroundThrottling:false alone does NOT cover occlusion.)
let powerSaveBlockerId = null;
const PREVIEW_CLOSE_WAIT_TIMEOUT_MS = 8000;

const waitForWindowClosed = (
  window,
  timeoutMs = PREVIEW_CLOSE_WAIT_TIMEOUT_MS
) =>
  new Promise(resolve => {
    if (!window || window.isDestroyed()) {
      resolve({ closed: true, timedOut: false });
      return;
    }

    let timeoutId = null;
    const cleanup = () => {
      if (timeoutId !== null) clearTimeout(timeoutId);
      window.removeListener('closed', onClosed);
    };
    const onClosed = () => {
      cleanup();
      resolve({ closed: true, timedOut: false });
    };

    window.once('closed', onClosed);
    timeoutId = setTimeout(() => {
      cleanup();
      resolve({
        closed: !!window.isDestroyed(),
        timedOut: !window.isDestroyed(),
      });
    }, timeoutMs);
  });

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

const focusWindowForInput = window => {
  if (!window || window.isDestroyed()) return;

  if (window.isMinimized()) window.restore();
  window.show();
  if (typeof window.moveTop === 'function') window.moveTop();
  window.focus();

  if (
    window.webContents &&
    !window.webContents.isDestroyed() &&
    typeof window.webContents.focus === 'function'
  ) {
    window.webContents.focus();
  }
};

const getPreviewDisplayWorkArea = ({ parentWindow, x, y }) => {
  if (typeof x === 'number' && typeof y === 'number') {
    return screen.getDisplayNearestPoint({ x, y }).workArea;
  }

  if (parentWindow && !parentWindow.isDestroyed()) {
    return screen.getDisplayMatching(parentWindow.getBounds()).workArea;
  }

  return screen.getPrimaryDisplay().workArea;
};

const fitPreviewWindowToDisplayHeight = (previewWindow, displayWorkArea) => {
  try {
    if (
      !previewWindow ||
      previewWindow.isDestroyed() ||
      !displayWorkArea ||
      typeof previewWindow.getBounds !== 'function'
    ) {
      return;
    }

    const bounds = previewWindow.getBounds();

    if (
      bounds.height > displayWorkArea.height &&
      typeof previewWindow.getContentBounds === 'function' &&
      typeof previewWindow.setContentSize === 'function'
    ) {
      const contentBounds = previewWindow.getContentBounds();
      const verticalFrameSize = Math.max(
        0,
        bounds.height - contentBounds.height
      );
      const maxContentHeight = Math.max(
        1,
        Math.floor(displayWorkArea.height - verticalFrameSize)
      );

      if (contentBounds.height > maxContentHeight) {
        const scale = maxContentHeight / contentBounds.height;
        const fittedContentWidth = Math.max(
          1,
          Math.floor(contentBounds.width * scale)
        );
        previewWindow.setContentSize(fittedContentWidth, maxContentHeight);
      }
    }

    const fittedBounds = getBoundsFittingDisplayHeight(
      previewWindow.getBounds(),
      displayWorkArea
    );
    if (fittedBounds) previewWindow.setBounds(fittedBounds);
  } catch (error) {
    console.warn('Ignoring exception when fitting preview window:', error);
  }
};

// Detach every still-living child window (preview + debugger) from a parent
// editor window. On macOS a window kept as a native `parent` child is always
// stacked above its parent and can keep swallowing input even while occluded or
// mid-teardown; if such a child dies while still attached (or survives as a
// zombie), the editor is left unable to receive clicks/keys. Detaching
// synchronously here — not only from each window's own 'close' listener, which
// can be skipped on abrupt/ raced destruction — guarantees nothing stays
// stacked over the editor.
const detachChildWindowsFromParent = parentWindowId => {
  if (parentWindowId === null) return;

  const detach = win => {
    try {
      if (
        win &&
        !win.isDestroyed() &&
        typeof win.setParentWindow === 'function'
      ) {
        win.setParentWindow(null);
        // A preview can be left always-on-top if a previous focus pass threw
        // between setAlwaysOnTop(true) and setAlwaysOnTop(false). Clear it so an
        // invisible/occluded preview can never sit above the editor.
        if (typeof win.setAlwaysOnTop === 'function') win.setAlwaysOnTop(false);
      }
    } catch (error) {
      console.warn('Ignoring exception when detaching child window:', error);
    }
  };

  previewWindows.forEach(entry => {
    if (entry.parentWindowId === parentWindowId) detach(entry.previewWindow);
  });
  detach(debuggerPopOutWindows.get(parentWindowId));
};

const keepParentWindowVisibleAfterChildClose = (
  parentWindowId,
  parentWasMinimizedBeforeChildClose
) => {
  if (parentWindowId === null) return;

  // Even if the parent was minimized, make sure no closed child is left
  // attached/always-on-top over it.
  detachChildWindowsFromParent(parentWindowId);

  if (parentWasMinimizedBeforeChildClose) return;

  const restoreParentWindow = () => {
    const parentWindow = BrowserWindow.fromId(parentWindowId);
    if (!parentWindow || parentWindow.isDestroyed()) return;

    try {
      if (parentWindow.isMinimized()) parentWindow.restore();

      // Only the editor window remains, so it is safe (and necessary on macOS)
      // to actually give it key/input focus — showInactive() alone reveals the
      // window but leaves it non-key, so clicks/keys keep going to a now-dead or
      // occluded child and the editor feels frozen.
      const noOtherChildWindowsRemain =
        !previewWindows.some(
          entry =>
            entry.parentWindowId === parentWindowId &&
            entry.previewWindow &&
            !entry.previewWindow.isDestroyed()
        ) &&
        (() => {
          const debuggerWindow = debuggerPopOutWindows.get(parentWindowId);
          return (
            !debuggerWindow ||
            debuggerWindow.isDestroyed() ||
            closingDebuggerPopOutWindowIds.has(debuggerWindow.id)
          );
        })();

      if (noOtherChildWindowsRemain) {
        focusWindowForInput(parentWindow);
      } else {
        showWithoutStealingFocus(parentWindow);
      }
    } catch (error) {
      console.warn(
        'Ignoring exception when restoring parent editor window:',
        error
      );
    }
  };

  setTimeout(restoreParentWindow, 0);
  setTimeout(restoreParentWindow, 100);
  setTimeout(restoreParentWindow, 300);
  setTimeout(restoreParentWindow, 700);
  setTimeout(restoreParentWindow, 1200);
  setTimeout(restoreParentWindow, 2000);
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

  let parentWasMinimizedBeforeDebuggerClose = false;
  debuggerWindow.on('close', () => {
    closingDebuggerPopOutWindowIds.add(debuggerWindow.id);

    const parentWindow =
      parentWindowId !== null ? BrowserWindow.fromId(parentWindowId) : null;
    parentWasMinimizedBeforeDebuggerClose =
      !!parentWindow &&
      !parentWindow.isDestroyed() &&
      parentWindow.isMinimized();

    if (typeof debuggerWindow.setParentWindow === 'function') {
      debuggerWindow.setParentWindow(null);
    }
  });

  debuggerWindow.on('closed', () => {
    closingDebuggerPopOutWindowIds.delete(debuggerWindow.id);

    if (debuggerPopOutWindows.get(parentWindowId) === debuggerWindow) {
      debuggerPopOutWindows.delete(parentWindowId);
    }
    sendDebuggerPopOutCloseRequested(parentWindowId);
    closePreviewWindowsForParent(parentWindowId);
    keepParentWindowVisibleAfterChildClose(
      parentWindowId,
      parentWasMinimizedBeforeDebuggerClose
    );
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
    return true;
  }
  return false;
};

const closeDebuggerPopOutWindow = parentWindowId => {
  const parentWasNotified = sendDebuggerPopOutCloseRequested(parentWindowId);

  const debuggerWindow = debuggerPopOutWindows.get(parentWindowId);
  if (!debuggerWindow || debuggerWindow.isDestroyed()) return;

  try {
    closingDebuggerPopOutWindowIds.add(debuggerWindow.id);

    if (typeof debuggerWindow.setParentWindow === 'function') {
      debuggerWindow.setParentWindow(null);
    }

    const closeDebuggerWindow = () => {
      try {
        if (
          debuggerPopOutWindows.get(parentWindowId) === debuggerWindow &&
          !debuggerWindow.isDestroyed()
        ) {
          debuggerWindow.close();
        }
      } catch (error) {
        console.warn('Ignoring exception when closing debugger window:', error);
      }
    };

    if (parentWasNotified) {
      // The debugger pop-out is owned by WindowPortal in the renderer process.
      // Let it close itself so its Electron window-closing mutex can avoid
      // "Uncaught illegal access" while filesystem work or React portal cleanup
      // is still touching the BrowserWindow-backed document. Keep a delayed
      // fallback in case the renderer cannot process the close request.
      setTimeout(closeDebuggerWindow, DEBUGGER_POP_OUT_FORCE_CLOSE_DELAY_MS);
    } else {
      setImmediate(closeDebuggerWindow);
    }
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
  const primaryWorkArea = screen.getPrimaryDisplay().workArea;
  const screenWidth = primaryWorkArea.width;
  const screenHeight = primaryWorkArea.height;
  const positions = {
    // top-left
    1: { x: primaryWorkArea.x, y: primaryWorkArea.y },
    // top-right
    2: { x: primaryWorkArea.x + screenWidth / 2, y: primaryWorkArea.y },
    // bottom-left
    3: { x: primaryWorkArea.x, y: primaryWorkArea.y + screenHeight / 2 },
    // bottom-right
    4: {
      x: primaryWorkArea.x + screenWidth / 2,
      y: primaryWorkArea.y + screenHeight / 2,
    },
  };
  for (let i = 0; i < numberOfWindows; i++) {
    const parentWindowId = parentWindow ? parentWindow.id : null;
    const x = numberOfWindows > 1 ? positions[i + 1].x : undefined;
    const y = numberOfWindows > 1 ? positions[i + 1].y : undefined;
    const displayWorkArea = getPreviewDisplayWorkArea({
      parentWindow,
      x,
      y,
    });
    const fittedPreviewBrowserWindowOptions = getPreviewBrowserWindowOptionsFittingDisplay(
      previewBrowserWindowOptions,
      displayWorkArea
    );
    const browserWindowOptions = {
      ...fittedPreviewBrowserWindowOptions,
      parent: alwaysOnTop ? parentWindow : null,
      x,
      y,
    };

    let previewWindow = new BrowserWindow(browserWindowOptions);
    setPreviewWindowMenuBarVisibilityAndContentSize(
      previewWindow,
      fittedPreviewBrowserWindowOptions,
      hideMenuBar
    );
    fitPreviewWindowToDisplayHeight(previewWindow, displayWorkArea);
    let parentWasMinimizedBeforePreviewClose = parentWindow
      ? parentWindow.isMinimized()
      : false;

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
      const remainingPreviewWindowsForParent = previewWindows.filter(
        entry =>
          entry.parentWindowId === parentWindowId &&
          entry.previewWindow &&
          !entry.previewWindow.isDestroyed()
      ).length;
      if (remainingPreviewWindowsForParent > 0) {
        arrangeDebuggerPopOutWithLatestPreview(parentWindowId);
      } else {
        closeDebuggerPopOutWindow(parentWindowId);
      }
      keepParentWindowVisibleAfterChildClose(
        parentWindowId,
        parentWasMinimizedBeforePreviewClose
      );
      // Only send message if the parent window still exists
      if (openEvent.sender && !openEvent.sender.isDestroyed()) {
        openEvent.sender.send('preview-window-closed', {
          remainingPreviewWindowsForParent,
        });
      }
      previewWindow = null;
    });
  }
};

const closePreviewWindow = async windowId => {
  const entry = previewWindows.find(
    entry => entry.previewWindow.id === windowId
  );
  if (entry && entry.previewWindow) {
    const closePromise = waitForWindowClosed(entry.previewWindow);
    entry.previewWindow.close();
    return closePromise;
  }
};

const closePreviewWindowsForParent = async parentWindowId => {
  const entriesToClose = previewWindows.filter(
    entry => entry.parentWindowId === parentWindowId
  );
  const closePromises = entriesToClose.map(entry => {
    try {
      if (entry.previewWindow && !entry.previewWindow.isDestroyed()) {
        const closePromise = waitForWindowClosed(entry.previewWindow);
        entry.previewWindow.close();
        return closePromise;
      }
    } catch (error) {
      console.warn('Ignoring exception when closing preview window:', error);
    }
    return Promise.resolve({ closed: true, timedOut: false });
  });
  return Promise.all(closePromises);
};

const waitForDebuggerPopOutClosedForParents = async parentWindowIds => {
  const closePromises = parentWindowIds.map(parentWindowId => {
    const debuggerWindow = debuggerPopOutWindows.get(parentWindowId);
    return waitForWindowClosed(debuggerWindow);
  });
  return Promise.all(closePromises);
};

const closeAllPreviewWindows = async () => {
  const entriesToClose = previewWindows.slice();
  const parentWindowIds = Array.from(
    new Set(entriesToClose.map(entry => entry.parentWindowId))
  );

  const closePromises = entriesToClose.map(entry => {
    try {
      if (entry.previewWindow && !entry.previewWindow.isDestroyed()) {
        const closePromise = waitForWindowClosed(entry.previewWindow);
        entry.previewWindow.close();
        return closePromise;
      }
    } catch (error) {
      console.warn('Ignoring exception when closing preview window:', error);
    }
    return Promise.resolve({ closed: true, timedOut: false });
  });

  const previewCloseResults = await Promise.all(closePromises);
  const debuggerCloseResults = await waitForDebuggerPopOutClosedForParents(
    parentWindowIds
  );

  return {
    closedPreviewWindows: entriesToClose.length,
    previewCloseTimedOut: previewCloseResults.some(result => result.timedOut),
    debuggerCloseTimedOut: debuggerCloseResults.some(result => result.timedOut),
  };
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
        // The alwaysOnTop toggle must be balanced even if focus() throws:
        // otherwise the preview is left permanently always-on-top and, once its
        // renderer is OS-suspended while occluded, becomes an invisible window
        // sitting above the editor that swallows all clicks. Reset it in a
        // finally so true is always paired with false.
        try {
          win.setAlwaysOnTop(true);
          win.focus();
        } finally {
          win.setAlwaysOnTop(false);
        }
      }
    } catch (error) {
      console.warn('Ignoring exception when focusing preview window:', error);
    }
  });
  return previewWindows.length;
};

const injectPreviewUserGesture = async ({ windowId, inputs } = {}) => {
  let entry = null;
  if (windowId !== undefined && windowId !== null) {
    entry = previewWindows.find(e => e.previewWindow.id === windowId);
  } else if (previewWindows.length) {
    entry = previewWindows[previewWindows.length - 1];
  }
  if (!entry || !entry.previewWindow || entry.previewWindow.isDestroyed()) {
    return {
      success: false,
      attempted: true,
      supported: true,
      error: 'No preview window available for native input injection.',
    };
  }

  return injectPreviewClickUserGesture(entry.previewWindow, inputs);
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
  injectPreviewUserGesture,
  capturePreviewPage,
  setDebuggerPopOutWindow,
};
