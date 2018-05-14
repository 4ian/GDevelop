const electron = require('electron');
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.
const isDev = require('electron-is').dev();
const ipcMain = electron.ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let piskelWindow = null;

/**
 * Open a modal window containing the Piskel editor
 */
const loadPiskelWindow = ({ onReady, devTools, parentWindow }) => {
  if (piskelWindow) {
    piskelWindow.show();
    onReady(piskelWindow);
  }

  const piskelOptions = {
    parent: parentWindow,
    width: Math.floor(parentWindow.getSize()[0] * 0.7),
    height: Math.floor(parentWindow.getSize()[1] * 0.9),
    backgroundColor: '#000000',
    modal: true,
    center: true,
    webPreferences: {
      webSecurity: false,
    },
  };

  piskelWindow = new BrowserWindow(piskelOptions);
  piskelWindow.setMenu(null);

  ipcMain.on('piskel-ready', (event) => {
    onReady(piskelWindow);
  });

  // Load the index.html of the Piskel app.
  if (isDev) {
    // Development (server hosted by npm run start)
    piskelWindow.loadURL('http://localhost:3000/External/Piskel/index.html');
    piskelWindow.openDevTools();
  } else {
    // Production (with npm run build)
    piskelWindow.loadURL(
      'file://' + __dirname + '/www/External/Piskel/index.html'
    );
    if (devTools) piskelWindow.openDevTools();
  }

  piskelWindow.on('closed', event => {
    piskelWindow = null;
  });

  piskelWindow.on('close', event => {
    // use destroy as a wordaround to force window closing, which is not done properly otherwise on Windows
    piskelWindow.destroy();
    piskelWindow = null;

    parentWindow.webContents.send('piskel-reset');
  });
};

module.exports = {
  loadPiskelWindow,
};
