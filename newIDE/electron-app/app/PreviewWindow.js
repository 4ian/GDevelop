const {
  BrowserWindow, // Module to create native browser window.
  ipcMain,
  shell,
  screen,
} = require('electron');
const isDev = require('electron-is-dev');
const { load } = require('./Utils/UrlLoader');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// Map of preview windows with their parent window ID: { previewWindow, parentWindowId }
let previewWindows = [];

let openDevToolsByDefault = false;

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
    const isTransparentPreviewWindow = !!previewBrowserWindowOptions.transparent;
    const isFramelessPreviewWindow =
      previewBrowserWindowOptions.frame === false;
    const browserWindowOptions = {
      ...previewBrowserWindowOptions,
      backgroundColor: previewBrowserWindowOptions.transparent
        ? '#00000000'
        : previewBrowserWindowOptions.backgroundColor,
      parent: isFramelessPreviewWindow
        ? null
        : alwaysOnTop
        ? parentWindow
        : null,
      skipTaskbar: isFramelessPreviewWindow
        ? false
        : previewBrowserWindowOptions.skipTaskbar,
      x: numberOfWindows > 1 ? positions[i + 1].x : undefined,
      y: numberOfWindows > 1 ? positions[i + 1].y : undefined,
    };

    let previewWindow = new BrowserWindow(browserWindowOptions);
    if (browserWindowOptions.transparent) {
      previewWindow.setBackgroundColor('#00000000');
    }
    if (isFramelessPreviewWindow) {
      previewWindow.setSkipTaskbar(false);
    }

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

    // Track this preview window with its parent
    previewWindows.push({
      previewWindow: previewWindow,
      parentWindowId: parentWindow ? parentWindow.id : null,
      isTransparentPreviewWindow,
      isFramelessPreviewWindow,
    });

    previewWindow.on('closed', closeEvent => {
      previewWindows = previewWindows.filter(
        entry => entry.previewWindow !== previewWindow
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

const resetPreviewWindowState = ({
  previewWindow,
  parentWindow,
  alwaysOnTop,
  hideMenuBar,
}) => {
  try {
    previewWindow.setIgnoreMouseEvents(false);
  } catch (error) {}
  try {
    previewWindow.setSkipTaskbar(false);
  } catch (error) {}
  try {
    previewWindow.setBackgroundColor('#000000');
  } catch (error) {}
  try {
    previewWindow.setHasShadow(true);
  } catch (error) {}
  try {
    previewWindow.setOpacity(1);
  } catch (error) {}
  try {
    previewWindow.setKiosk(false);
  } catch (error) {}
  try {
    previewWindow.setFullScreen(false);
  } catch (error) {}
  try {
    previewWindow.setFocusable(true);
  } catch (error) {}
  try {
    previewWindow.setEnabled(true);
  } catch (error) {}
  try {
    previewWindow.setMovable(true);
  } catch (error) {}
  try {
    previewWindow.setResizable(true);
  } catch (error) {}
  try {
    previewWindow.setMaximizable(true);
  } catch (error) {}
  try {
    previewWindow.setMinimizable(true);
  } catch (error) {}
  try {
    previewWindow.setClosable(true);
  } catch (error) {}
  try {
    previewWindow.setMenuBarVisibility(hideMenuBar);
    previewWindow.setAutoHideMenuBar(!hideMenuBar);
  } catch (error) {}
  try {
    if (typeof previewWindow.setParentWindow === 'function') {
      previewWindow.setParentWindow(alwaysOnTop ? parentWindow : null);
    }
  } catch (error) {}
  try {
    previewWindow.setAlwaysOnTop(false);
  } catch (error) {}
};

const resetPreviewWindowsForPreviewMode = ({
  parentWindow,
  alwaysOnTop,
  hideMenuBar,
  useTransparentPreviewWindow,
  useFramelessPreviewWindow,
}) => {
  const parentWindowId = parentWindow ? parentWindow.id : null;
  let closedPreviewWindows = false;
  const entriesToReset = previewWindows.filter(
    entry => entry.parentWindowId === parentWindowId
  );

  entriesToReset.forEach(entry => {
    try {
      if (!entry.previewWindow || entry.previewWindow.isDestroyed()) return;

      const shouldReopenPreviewWindow =
        entry.isTransparentPreviewWindow !== useTransparentPreviewWindow ||
        entry.isFramelessPreviewWindow !== useFramelessPreviewWindow;
      if (shouldReopenPreviewWindow) {
        // Electron can't reliably turn a transparent frameless window back
        // into a regular framed window, so reopen the preview when the mode changes.
        closedPreviewWindows = true;
        resetPreviewWindowState({
          previewWindow: entry.previewWindow,
          parentWindow,
          alwaysOnTop,
          hideMenuBar,
        });
        entry.previewWindow.close();
        return;
      }

      if (useFramelessPreviewWindow) return;

      resetPreviewWindowState({
        previewWindow: entry.previewWindow,
        parentWindow,
        alwaysOnTop,
        hideMenuBar,
      });
    } catch (error) {
      console.warn('Ignoring exception when resetting preview window:', error);
    }
  });

  return { closedPreviewWindows };
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

module.exports = {
  openPreviewWindow,
  closePreviewWindow,
  closePreviewWindowsForParent,
  closeAllPreviewWindows,
  resetPreviewWindowsForPreviewMode,
};
