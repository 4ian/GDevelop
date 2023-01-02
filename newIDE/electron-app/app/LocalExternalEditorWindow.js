const electron = require('electron');
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.
const isDev = require('electron-is').dev();
const ipcMain = electron.ipcMain;
const { load } = require('./Utils/UrlLoader');

// Generic function to load external editors in a modal window.
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let modalWindow = null;

/**
 * Open a modal window containing an external HTML5 editor
 */
const loadExternalEditorWindow = ({
  onReady,
  devTools,
  parentWindow,
  readyChannelName,
  saveChannelName,
  indexSubPath,
  relativeWidth = 0.7,
  relativeHeight = 0.9,
  backgroundColor = 'white',
  show = false,
}) => {
  return new Promise((resolve) => {
    let externalEditorOutput = null;

    const windowOptions = {
      parent: parentWindow,
      width: Math.floor(parentWindow.getSize()[0] * relativeWidth),
      height: Math.floor(parentWindow.getSize()[1] * relativeHeight),
      backgroundColor,
      modal: true,
      center: true,
      webPreferences: {
        webSecurity: false,
        // Allow Node.js API access in renderer process, as long
        // as we've not removed dependency on it and on "@electron/remote".
        nodeIntegration: true,
        contextIsolation: false,
      },
    };

    modalWindow = new BrowserWindow(windowOptions);
    modalWindow.setMenu(null);

    // Enable `@electron/remote` module for renderer process
    require('@electron/remote/main').enable(modalWindow.webContents);

    ipcMain.removeAllListeners(readyChannelName);
    ipcMain.removeAllListeners(saveChannelName);
    ipcMain.on(readyChannelName, event => {
      onReady(modalWindow);
    });
    ipcMain.on(saveChannelName, (event, newExternalEditorOutput) => {
      externalEditorOutput = newExternalEditorOutput;
    });

    // Load the index.html of the app.
    load({
      window: modalWindow,
      isDev,
      path: '/external/' + indexSubPath,
      devTools,
    });

    //Prevent any navigation inside the modal window.
    modalWindow.webContents.on('will-navigate', (e, url) => {
      if (url !== modalWindow.webContents.getURL()) {
        console.info('Opening in browser (because of will-navigate):', url);
        e.preventDefault();
        electron.shell.openExternal(url);
      }
    });

    // Prevent opening any website or url inside Electron
    modalWindow.webContents.setWindowOpenHandler(details => {
      console.info('Opening in browser (because of new window): ', details.url);
      electron.shell.openExternal(details.url);
      return { action: 'deny' };
    });

    modalWindow.on('closed', event => {
      modalWindow = null;
      resolve(externalEditorOutput)
    });

    modalWindow.on('close', event => {
      // use destroy as a wordaround to force window closing, which is not done properly otherwise on Windows
      modalWindow.destroy();
      modalWindow = null;
    });
  })
};

module.exports = {
  loadExternalEditorWindow,
};
