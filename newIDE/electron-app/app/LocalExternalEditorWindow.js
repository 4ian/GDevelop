const electron = require('electron');
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.
const isDev = require('electron-is').dev();
const ipcMain = electron.ipcMain;
const { load } = require('./Utils/UrlLoader');

// Generic function to load external editors in a modal window.
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
/** @type {BrowserWindow | null} */
let modalWindow = null;

const relativeWidth = 0.7;
const relativeHeight = 0.9;
const backgroundColor = '#000000';

/**
 * Open a modal window containing an external HTML5 editor
 */
const loadExternalEditorWindow = ({
  devTools,
  parentWindow,
  indexSubPath,
  externalEditorInput,
}) => {
  return new Promise(resolve => {
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

    /** @param {import('electron').IpcMainEvent} event */
    const onReady = event => {
      if (!modalWindow || event.sender !== modalWindow.webContents) return;

      modalWindow.webContents.send(
        'open-external-editor-input',
        externalEditorInput
      );
      modalWindow.show();
    };

    /**
     * @param {import('electron').IpcMainEvent} event
     * @param {any} newExternalEditorOutput
     */
    const saveExternalEditorOutput = (event, newExternalEditorOutput) => {
      if (!modalWindow || event.sender !== modalWindow.webContents) return;

      externalEditorOutput = newExternalEditorOutput;
    };

    ipcMain.on('external-editor-ready', onReady);
    ipcMain.on('save-external-editor-output', saveExternalEditorOutput);

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

      ipcMain.removeListener('external-editor-ready', onReady);
      ipcMain.removeListener(
        'save-external-editor-output',
        saveExternalEditorOutput
      );
      resolve(externalEditorOutput);
    });

    modalWindow.on('close', event => {
      if (!modalWindow) return;
      // use destroy as a workaround to force window closing, which is not done properly otherwise on Windows
      modalWindow.destroy();
      modalWindow = null;
    });
  });
};

module.exports = {
  loadExternalEditorWindow,
};
