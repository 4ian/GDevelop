var app = require('electron').app;  // Module to control application life.
var BrowserWindow = require('electron').BrowserWindow;  // Module to create native browser window.
var parseArgs = require('minimist');

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

console.log(process.argv[2]);

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
    }
  });

  //Expose program arguments
  global['args'] = args;

  // and load the index.html of the app.
  // Produciton (with npm run build)
  // mainWindow.loadURL('file://' + __dirname + '/www/index.html');

  // Development (with npm start)
  mainWindow.loadURL('http://localhost:3000');

  // Open the DevTools.
  mainWindow.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
