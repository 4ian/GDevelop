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
 * Open a window running a preview of an exported game.
 */
const openPreviewWindow = ({
  parentWindow,
  previewBrowserWindowOptions,
  previewGameIndexHtmlPath,
  alwaysOnTop,
  hideMenuBar,
}) => {
  const browserWindowOptions = {
    ...previewBrowserWindowOptions,
    parent: alwaysOnTop ? parentWindow : null,
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
};

const closePreviewWindow = windowId => {
  const previewWindow = previewWindows.find(window => window.id === windowId);
  if (previewWindow) previewWindow.close();
};

module.exports = {
  openPreviewWindow,
  closePreviewWindow,
};
