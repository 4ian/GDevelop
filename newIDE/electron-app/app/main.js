require('dotenv').config({ path: __dirname + '/.env' });
const electron = require('electron');
const app = electron.app; // Module to control application life.
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.
const Menu = electron.Menu;
const parseArgs = require('minimist');
const isDev = require('electron-is').dev();
const ipcMain = electron.ipcMain;
const autoUpdater = require('electron-updater').autoUpdater;
const log = require('electron-log');
const {
  uploadGameFolderToBucket,
  uploadArchiveToBucket,
} = require('./S3Upload');
const {
  serveFolder,
  stopServer,
  getLocalNetworkIps,
} = require('./ServeFolder');
const { buildMainMenuFor } = require('./MainMenu');
const throttle = require('lodash.throttle');

// Logs made with electron-logs can be found
// on Linux: ~/.config/<app name>/log.log
// on OS X: ~/Library/Logs/<app name>/log.log
// on Windows: %USERPROFILE%\AppData\Roaming\<app name>\log.log
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('GDevelop Electron app starting...');

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
    // Define an entry in your /etc/host and use it instead of localhost
    // to work with Auth0 authentification during development.
    // mainWindow.loadURL('http://gdevelop.local:3000');
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
    stopServer(() => {});
  });

  ipcMain.on('s3-folder-upload', (event, localDir) => {
    log.info('Received event s3-upload with localDir=', localDir);

    uploadGameFolderToBucket(
      localDir,
      throttle((current, max) => {
        event.sender.send('s3-folder-upload-progress', current, max);
      }, 200),
      (err, prefix) => {
        event.sender.send('s3-folder-upload-done', err, prefix);
      }
    );
  });

  ipcMain.on('s3-file-upload', (event, localFile) => {
    log.info('Received event s3-file-upload with localFile=', localFile);

    uploadArchiveToBucket(
      localFile,
      throttle((current, max) => {
        event.sender.send('s3-file-upload-progress', current, max);
      }, 300),
      (err, prefix) => {
        event.sender.send('s3-file-upload-done', err, prefix);
      }
    );
  });

  ipcMain.on('serve-folder', (event, options) => {
    log.info('Received event to server folder with options=', options);

    serveFolder(
      options,
      (err, serverParams) => {
        event.sender.send('serve-folder-done', err, serverParams);
      }
    );
  });

  ipcMain.on('stop-server', (event) => {
    log.info('Received event to stop server');

    stopServer(
      (err) => {
        event.sender.send('stop-server-done', err);
      }
    );
  });

  ipcMain.on('get-local-network-ips', (event) => {
    event.sender.send('local-network-ips', getLocalNetworkIps());
  });

  // This will immediately download an update, then install when the
  // app quits.
  autoUpdater.checkForUpdatesAndNotify();

  function sendUpdateStatus(status) {
    log.info(status);
    if (mainWindow) mainWindow.webContents.send('update-status', status);
  }
  autoUpdater.on('checking-for-update', () => {
    sendUpdateStatus({
      message: 'Checking for update...',
      status: 'checking-for-update',
    });
  });
  autoUpdater.on('update-available', info => {
    sendUpdateStatus({
      message: 'Update available.',
      status: 'update-available',
    });
  });
  autoUpdater.on('update-not-available', info => {
    sendUpdateStatus({
      message: 'Update not available.',
      status: 'update-not-available',
    });
  });
  autoUpdater.on('error', err => {
    sendUpdateStatus({
      message: 'Error in auto-updater. ' + err,
      status: 'error',
      err,
    });
  });
  autoUpdater.on('download-progress', progressObj => {
    let logMessage = 'Download speed: ' + progressObj.bytesPerSecond;
    logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%';
    logMessage =
      logMessage +
      ' (' +
      progressObj.transferred +
      '/' +
      progressObj.total +
      ')';
    sendUpdateStatus({
      message: logMessage,
      status: 'download-progress',
      bytesPerSecond: progressObj.bytesPerSecond,
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
    });
  });
  autoUpdater.on('update-downloaded', info => {
    sendUpdateStatus({
      message: 'Update downloaded',
      status: 'update-downloaded',
      info,
    });
  });
});
