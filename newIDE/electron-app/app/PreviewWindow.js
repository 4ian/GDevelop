const {
  BrowserWindow, // Module to create native browser window.
  ipcMain,
  shell,
} = require('electron');
const isDev = require('electron-is').dev();
const { load } = require('./Utils/UrlLoader');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
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
}) => {
  // If opening multiple windows at once, place them across the screen.
  const parentWindowPosition = parentWindow.getPosition();
  const screenWidth = parentWindow.getSize()[0];
  const screenHeight = parentWindow.getSize()[1];
  console.log('parentWindowPosition', parentWindowPosition);
  console.log('screenWidth', screenWidth);
  const positions = {
    // top-left
    1: {
      x: parentWindowPosition[0],
      y: parentWindowPosition[1],
    },
    // top-right
    2: {
      x: parentWindowPosition[0] + screenWidth / 2,
      y: parentWindowPosition[1],
    },
    // bottom-left
    3: {
      x: parentWindowPosition[0],
      y: parentWindowPosition[1] + screenHeight / 2,
    },
    // bottom-right
    4: {
      x: parentWindowPosition[0] + screenWidth / 2,
      y: parentWindowPosition[1] + screenHeight / 2,
    },
  };
  for (let i = 0; i < numberOfWindows; i++) {
    const browserWindowOptions = {
      ...previewBrowserWindowOptions,
      parent: alwaysOnTop ? parentWindow : null,
      x: numberOfWindows > 1 ? positions[i + 1].x : undefined,
      y: numberOfWindows > 1 ? positions[i + 1].y : undefined,
    };

    let previewWindow = new BrowserWindow(browserWindowOptions);

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

    previewWindows.push(previewWindow);

    previewWindow.on('closed', event => {
      previewWindows = previewWindows.filter(
        otherPreviewBrowserWindow => otherPreviewBrowserWindow !== previewWindow
      );
      previewWindow = null;
    });
  }
};

const closePreviewWindow = windowId => {
  const previewWindow = previewWindows.find(window => window.id === windowId);
  if (previewWindow) previewWindow.close();
};

module.exports = {
  openPreviewWindow,
  closePreviewWindow,
};
