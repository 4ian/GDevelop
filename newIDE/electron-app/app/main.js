var app = require('electron').app;  // Module to control application life.
var BrowserWindow = require('electron').BrowserWindow;  // Module to create native browser window.
var parseArgs = require('minimist');
var isDev = require('electron-is-dev');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
var args = parseArgs(process.argv.slice(2));

if (args['hide-icon']) {
  app.dock.hide();
}

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    //Allow to access to local files
    webPreferences: {
      webSecurity: false
    },
    backgroundColor: '#f0f0f0',
  });

  //Expose program arguments
  global['args'] = args;

  // Load the index.html of the app.
  if (isDev) {
    // Development (server hosted by npm run start)
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.openDevTools();
  } else {
    // Production (with npm run build)
    mainWindow.loadURL('file://' + __dirname + '/www/index.html');
    // mainWindow.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
