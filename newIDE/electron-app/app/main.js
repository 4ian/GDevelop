const electron = require('electron');
const app = electron.app; // Module to control application life.
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.
const Menu = electron.Menu;
const parseArgs = require('minimist');
const isDev = require('electron-is').dev();
const ipcMain = electron.ipcMain;
const { uploadGameFolderToBucket, uploadArchiveToBucket } = require('./s3upload');
const { buildMainMenuFor } = require('./main-menu');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

const args = parseArgs(process.argv.slice(2));
const isIntegrated = args.mode === 'integrated';
const devTools = !!args['dev-tools'];

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  if (isIntegrated && app.dock) {
    app.dock.hide();
  }

  // Create the browser window.
  const options = {
    width: args.width || 800,
    height: args.height || 600,
    x: args.x,
    y: args.y,
    webPreferences: {
      webSecurity: false, // Allow to access to local files
    },
    enableLargerThanScreen: true,
    backgroundColor: '#f0f0f0',
  };

  if (isIntegrated) {
    options.acceptFirstMouse = true;
    options.skipTaskbar = true;
    options.hasShadow = false;
    options.frame = false;
    options.minimizable = false;
    options.movable = false;
    options.resizable = false;
    options.fullscreenable = false;
    options.show = false;
  }

  mainWindow = new BrowserWindow(options);
  if (!isIntegrated) mainWindow.maximize();

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
    if (devTools) mainWindow.openDevTools();
  }

  Menu.setApplicationMenu(buildMainMenuFor(mainWindow));

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  ipcMain.on('s3-folder-upload', (event, localDir) => {
    console.log('Received event s3-upload with localDir=', localDir);

    uploadGameFolderToBucket(
      localDir,
      (current, max) => {
        event.sender.send('s3-folder-upload-progress', current, max);
      },
      (err, prefix) => {
        event.sender.send('s3-folder-upload-done', err, prefix);
      }
    );
  });

  ipcMain.on('s3-file-upload', (event, localFile) => {
    console.log('Received event s3-file-upload with localFile=', localFile);

    uploadArchiveToBucket(
      localFile,
      (current, max) => {
        console.log(current, max);
        event.sender.send('s3-file-upload-progress', current, max);
      },
      (err, prefix) => {
        console.log("DONE")
        event.sender.send('s3-file-upload-done', err, prefix);
      }
    );
  });
});
