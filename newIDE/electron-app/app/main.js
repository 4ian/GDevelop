const electron = require('electron');
const path = require('path');
const app = electron.app; // Module to control application life.
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.
const Menu = electron.Menu;
const Notification = electron.Notification;
const protocol = electron.protocol;
const parseArgs = require('minimist');
const isDev = require('electron-is').dev();
const ipcMain = electron.ipcMain;
const autoUpdater = require('electron-updater').autoUpdater;
const log = require('electron-log');
const { uploadLocalFile } = require('./LocalFileUploader');
const { serveFolder, stopServer } = require('./ServeFolder');
const { startDebuggerServer, sendMessage } = require('./DebuggerServer');
const {
  buildElectronMenuFromDeclarativeTemplate,
  buildPlaceholderMainMenu,
} = require('./MainMenu');
const { loadExternalEditorWindow } = require('./LocalExternalEditorWindow');
const { load, registerGdideProtocol } = require('./Utils/UrlLoader');
const throttle = require('lodash.throttle');
const { findLocalIp } = require('./Utils/LocalNetworkIpFinder');
const setUpDiscordRichPresence = require('./DiscordRichPresence');
const {
  downloadLocalFile,
  saveLocalFileFromArrayBuffer,
} = require('./LocalFileDownloader');
const { openPreviewWindow, closePreviewWindow } = require('./PreviewWindow');
const {
  setupLocalGDJSDevelopmentWatcher,
  closeLocalGDJSDevelopmentWatcher,
} = require('./LocalGDJSDevelopmentWatcher');
const { setupWatcher, disableWatcher } = require('./LocalFilesystemWatcher');

// Initialize `@electron/remote` module
require('@electron/remote/main').initialize();

log.info('GDevelop Electron app starting...');

// Logs made with electron-logs can be found
// on Linux: ~/.config/<app name>/log.log
// on OS X: ~/Library/Logs/<app name>/log.log
// on Windows: %USERPROFILE%\AppData\Roaming\<app name>\log.log
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoDownload = false;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

// Parse arguments (knowing that in dev, we run electron with an argument,
// so have to ignore one more).
const args = parseArgs(process.argv.slice(isDev ? 2 : 1), {
  // "Officially" supported arguments and their types:
  boolean: ['dev-tools', 'disable-update-check'],
  string: '_', // Files are always strings
});

// See registerGdideProtocol (used for HTML modules support)
protocol.registerSchemesAsPrivileged([{ scheme: 'gdide' }]);

// Notifications on Microsoft Windows platforms show the app user model id.
// If not set, defaults to `electron.app.{app.name}`.
if (process.platform === 'win32') {
  app.setAppUserModelId('gdevelop.ide');
}

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  const isIntegrated = args.mode === 'integrated';
  const devTools = !!args['dev-tools'];

  if (isIntegrated && app.dock) {
    app.dock.hide();
  }

  registerGdideProtocol({ isDev });

  // Create the browser window.
  const options = {
    width: args.width || 800,
    height: args.height || 600,
    x: args.x,
    y: args.y,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#000000',
      symbolColor: '#ffffff',
    },
    trafficLightPosition: { x: 12, y: 12 },
    webPreferences: {
      webSecurity: false, // Allow to access to local files,
      // Allow Node.js API access in renderer process, as long
      // as we've not removed dependency on it and on "@electron/remote".
      nodeIntegration: true,
      contextIsolation: false,
    },
    enableLargerThanScreen: true,
    backgroundColor: '#000',
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

  // Enable `@electron/remote` module for renderer process
  require('@electron/remote/main').enable(mainWindow.webContents);

  if (isDev)
    mainWindow.webContents.session.loadExtension(
      path.join(__dirname, 'extensions/ReactDeveloperTools/4.24.3_0/')
    );

  // Expose program arguments (to be accessed by mainWindow)
  global['args'] = args;

  // Load the index.html of the app.
  load({
    window: mainWindow,
    isDev,
    path: '/index.html',
    devTools,
  });

  Menu.setApplicationMenu(buildPlaceholderMainMenu());

  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    stopServer(() => {});
  });

  ipcMain.on('set-main-menu', (event, mainMenuTemplate) => {
    Menu.setApplicationMenu(
      buildElectronMenuFromDeclarativeTemplate(mainWindow, mainMenuTemplate)
    );
  });

  //Prevent any navigation inside the main window.
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      console.info('Opening in browser (because of will-navigate):', url);
      e.preventDefault();
      electron.shell.openExternal(url);
    }
  });

  // Prevent opening any website or url inside Electron
  mainWindow.webContents.setWindowOpenHandler(details => {
    console.info('Opening in browser (because of new window): ', details.url);
    electron.shell.openExternal(details.url);
    return { action: 'deny' };
  });

  ipcMain.handle('preview-open', async (event, options) => {
    return openPreviewWindow({
      parentWindow: mainWindow,
      previewBrowserWindowOptions: options.previewBrowserWindowOptions,
      previewGameIndexHtmlPath: options.previewGameIndexHtmlPath,
      alwaysOnTop: options.alwaysOnTop,
      hideMenuBar: options.hideMenuBar,
    });
  });
  ipcMain.handle('preview-close', async (event, options) => {
    return closePreviewWindow(options.windowId);
  });

  // Piskel image editor
  ipcMain.handle('piskel-load', (event, externalEditorInput) => {
    return loadExternalEditorWindow({
      parentWindow: mainWindow,
      devTools,
      indexSubPath: 'piskel/piskel-electron-index.html',
      externalEditorInput,
    });
  });

  // JFXR sound effect generator
  ipcMain.handle('jfxr-load', (event, externalEditorInput) => {
    return loadExternalEditorWindow({
      parentWindow: mainWindow,
      devTools,
      indexSubPath: 'jfxr/jfxr-electron-index.html',
      externalEditorInput,
    });
  });

  // Yarn Dialogue Tree Editor
  ipcMain.handle('yarn-load', (event, externalEditorInput) => {
    return loadExternalEditorWindow({
      parentWindow: mainWindow,
      devTools,
      indexSubPath: 'yarn/yarn-electron-index.html',
      externalEditorInput,
    });
  });

  // LocalFileUploader events:
  ipcMain.on('local-file-upload', (event, localFilePath, uploadOptions) => {
    log.info(
      'Received event local-file-upload with localFilePath=',
      localFilePath
    );

    uploadLocalFile(
      localFilePath,
      uploadOptions,
      throttle((current, max) => {
        event.sender.send('local-file-upload-progress', current, max);
      }, 300)
    ).then(
      () => {
        log.info('Local file upload successfully done');
        event.sender.send('local-file-upload-done', null);
      },
      uploadError => {
        log.error('Local file upload errored', uploadError);
        event.sender.send('local-file-upload-done', uploadError);
      }
    );
  });

  // Titlebar handling:
  ipcMain.handle(
    'titlebar-set-overlay-options',
    async (event, overlayOptions) => {
      if (!mainWindow) return;

      // setTitleBarOverlay seems not defined on macOS.
      if (mainWindow.setTitleBarOverlay)
        mainWindow.setTitleBarOverlay(overlayOptions);
    }
  );

  // LocalFileDownloader events:
  ipcMain.handle('local-file-download', async (event, url, outputPath) => {
    const result = await downloadLocalFile(url, outputPath);
    return result;
  });
  ipcMain.handle(
    'local-file-save-from-arraybuffer',
    async (event, arrayBuffer, outputPath) => {
      const result = await saveLocalFileFromArrayBuffer(
        arrayBuffer,
        outputPath
      );
      return result;
    }
  );

  // LocalFilesystemWatcher events:
  ipcMain.handle(
    'local-filesystem-watcher-setup',
    (event, folderPath, options) => {
      const subscriptionId = setupWatcher(
        folderPath,
        changedFilePath => {
          event.sender.send('project-file-changed', changedFilePath);
        },
        options
      );
      return subscriptionId;
    }
  );
  ipcMain.handle(
    'local-filesystem-watcher-disable',
    (event, subscriptionId) => {
      disableWatcher(subscriptionId);
    }
  );

  // ServeFolder events:
  ipcMain.on('serve-folder', (event, options) => {
    log.info('Received event to server folder with options=', options);

    serveFolder(options, (err, serverParams) => {
      event.sender.send('serve-folder-done', err, serverParams);
    });
  });

  ipcMain.on('stop-server', event => {
    log.info('Received event to stop server');

    stopServer(err => {
      event.sender.send('stop-server-done', err);
    });
  });

  ipcMain.on('get-local-network-ip', event => {
    event.sender.send('local-network-ip', findLocalIp());
  });

  // LocalGDJSDevelopmentWatcher events:
  ipcMain.on('setup-local-gdjs-development-watcher', event => {
    setupLocalGDJSDevelopmentWatcher();
  });

  ipcMain.on('close-local-gdjs-development-watcher', event => {
    closeLocalGDJSDevelopmentWatcher();
  });

  // DebuggerServer events:
  ipcMain.on('debugger-start-server', (event, options) => {
    log.info('Received event to start debugger server with options=', options);

    startDebuggerServer({
      onMessage: ({ id, message }) =>
        event.sender.send('debugger-message-received', { id, message }),
      onError: error => event.sender.send('debugger-error-received', error),
      onConnectionClose: ({ id }) =>
        event.sender.send('debugger-connection-closed', { id }),
      onConnectionOpen: ({ id }) =>
        event.sender.send('debugger-connection-opened', { id }),
      onConnectionError: ({ id, errorMessage }) =>
        event.sender.send('debugger-connection-errored', { id, errorMessage }),
      onListening: ({ address }) =>
        event.sender.send('debugger-start-server-done', { address }),
    });
  });

  ipcMain.on('debugger-send-message', (event, message) => {
    sendMessage(message, err =>
      event.sender.send('debugger-send-message-done', err)
    );
  });

  ipcMain.on('updates-check-and-download', event => {
    // This will immediately download an update, then install when the
    // app quits.
    log.info('Starting check for updates (with auto-download if any)');
    autoUpdater.autoDownload = true;
    autoUpdater.checkForUpdatesAndNotify();
  });

  ipcMain.on('updates-check', event => {
    log.info('Starting check for updates (without auto-download)');
    autoUpdater.autoDownload = false;
    autoUpdater.checkForUpdates();
  });

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

  setUpDiscordRichPresence(ipcMain);
});
