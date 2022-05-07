/**
 * This is the file handling the startup and lifetime of the game
 * running in Electron Runtime.
 */
// Modules to control application life and create native browser window
const { app, BrowserWindow, shell, Menu } = require("electron");

// Initialize `@electron/remote` module
require('@electron/remote/main').initialize();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800 /*GDJS_WINDOW_WIDTH*/,
    height: 600 /*GDJS_WINDOW_HEIGHT*/,
    useContentSize: true,
    title: "GDJS_GAME_NAME",
    backgroundColor: '#000000',
    webPreferences: {
      // Allow Node.js API access in renderer process, as long
      // as we've not removed dependency on it and on "@electron/remote".
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // Enable `@electron/remote` module for renderer process
  require('@electron/remote/main').enable(mainWindow.webContents);

  // Open external link in the OS default browser
  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // and load the index.html of the app.
  mainWindow.loadFile("app/index.html");

  Menu.setApplicationMenu(null);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  app.quit();
});
