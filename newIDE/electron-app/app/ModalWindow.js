const electron = require('electron');
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.
const isDev = require('electron-is').dev();
const ipcMain = electron.ipcMain;

// Generic function to load external editors in a modal window.
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let modalWindow = null;

/**
 * Open a modal window containing an external HTML5 editor
 */

const loadModalWindow = ({ onReady, devTools, parentWindow, readyChannelName, indexSubPath, relativeWidth=0.7, relativeHeight=0.9 }) => {
  if (modalWindow) {
    modalWindow.show();
    onReady(modalWindow);
  }

  const windowOptions = {
    parent: parentWindow,
    width: Math.floor(parentWindow.getSize()[0] * relativeWidth),
    height: Math.floor(parentWindow.getSize()[1] * relativeHeight),
    backgroundColor: '#000000',
    modal: true,
    center: true,
    webPreferences: {
      webSecurity: false,
    },
  };

  modalWindow = new BrowserWindow(windowOptions);
  modalWindow.setMenu(null);

  ipcMain.removeAllListeners(readyChannelName);
  ipcMain.on(readyChannelName, (event) => {
    onReady(modalWindow);
  });

  // Load the index.html of the app.
  if (isDev) {
    // Development (server hosted by npm run start)
    modalWindow.loadURL('http://localhost:3000/External/'+ indexSubPath);
    modalWindow.openDevTools();
  } else {
    // Production (with npm run build)
    modalWindow.loadURL(
      'file://' + __dirname + '/www/External/' + indexSubPath
    );
    if (devTools) modalWindow.openDevTools();
  }
  
  modalWindow.on('closed', event => {
    modalWindow = null;
  });

  modalWindow.on('close', event => {
    // use destroy as a wordaround to force window closing, which is not done properly otherwise on Windows
    modalWindow.destroy();
    modalWindow = null;
  });
};

module.exports = {
  loadModalWindow,
};
