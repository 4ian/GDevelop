const electron = require('electron');
const path = require('path');
const child_process = require('child_process');
const app = electron.app; // Module to control application life.
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.
const Menu = electron.Menu;
const Notification = electron.Notification;
const protocol = electron.protocol;
const parseArgs = require('minimist');
const isDev = require('electron-is-dev');
const ipcMain = electron.ipcMain;
const autoUpdater = require('electron-updater').autoUpdater;
const log = require('electron-log');
const { uploadLocalFile } = require('./LocalFileUploader');
const { serveFolder, stopServer, stopAllServers } = require('./ServeFolder');
const {
  startDebuggerServer,
  sendMessage,
  closeAllConnections,
  closeServer: closeDebuggerServer,
  stopAllServers: stopAllDebuggerServers,
} = require('./DebuggerServer');
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
const {
  openPreviewWindow,
  closePreviewWindow,
  closePreviewWindowsForParent,
  closeAllPreviewWindows,
} = require('./PreviewWindow');
const {
  setupLocalGDJSDevelopmentWatcher,
  closeLocalGDJSDevelopmentWatcher,
  onLocalGDJSDevelopmentWatcherRuntimeUpdated,
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

// Keep a global reference of the window objects, if you don't, the windows will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindows = new Set();
let mainWindow = null; // Primary window reference for backwards compatibility
let windowCounter = 0; // Counter for creating unique session partitions

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

// Single instance lock - prevents multiple Electron processes
// This solves Firebase IndexedDB locking issues while still allowing multiple windows
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Second instance attempted - quit immediately
  app.quit();
} else {
  // First instance - handle second-instance events by creating new windows
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // User tried to launch app again - create a new window instead
    const secondInstanceArgs = parseArgs(commandLine.slice(isDev ? 2 : 1), {
      boolean: ['dev-tools', 'disable-update-check'],
      string: '_',
    });

    // Create a new window in the existing process
    createNewWindow(secondInstanceArgs);
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // Best-effort cleanup - ignore any errors to prevent crashes during shutdown
  try {
    stopAllServers();
  } catch (e) {
    // Ignore errors during shutdown
  }
  try {
    stopAllDebuggerServers();
  } catch (e) {
    // Ignore errors during shutdown
  }
  // Close all remaining preview windows
  try {
    closeAllPreviewWindows();
  } catch (e) {
    // Ignore errors during shutdown
  }
  app.quit();
});

// Function to create a new GDevelop window
function createNewWindow(windowArgs = args) {
  const isIntegrated = windowArgs.mode === 'integrated';
  const devTools = !!windowArgs['dev-tools'];

  if (isIntegrated && app.dock) {
    app.dock.hide();
  }

  // Create the browser window.
  const options = {
    width: windowArgs.width || 800,
    height: windowArgs.height || 600,
    x: windowArgs.x,
    y: windowArgs.y,
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

  // First window (windowCounter === 0) uses default storage for backwards compatibility
  // Additional windows get unique partitions for independent auth AND separate renderer processes
  const windowNumber = windowCounter;
  if (windowCounter > 0) {
    // Create a unique partition for this window so it has independent auth state
    // Each partition gets its own storage (IndexedDB, localStorage, cookies, etc.)
    options.webPreferences.partition = `persist:gdevelop-window-${windowCounter}`;
    log.info(
      `Creating window #${windowCounter} with partition: persist:gdevelop-window-${windowCounter}`
    );
  } else {
    log.info(
      `Creating window #${windowCounter} with default partition (backwards compatibility)`
    );
  }
  windowCounter++;

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

  const newWindow = new BrowserWindow(options);
  if (!isIntegrated) newWindow.maximize();

  // Capture window ID and whether this is the primary window before it can be destroyed
  const windowId = newWindow.id;
  const isPrimaryWindow = windowNumber === 0;
  log.info(
    `Created window with Electron ID: ${windowId}, window number: ${windowNumber}, isPrimary: ${isPrimaryWindow}`
  );

  // Track this window
  mainWindows.add(newWindow);

  // Set as primary window if this is the first one
  if (isPrimaryWindow) {
    mainWindow = newWindow;
  }

  // Enable `@electron/remote` module for renderer process
  require('@electron/remote/main').enable(newWindow.webContents);

  // Log process ID to verify separate renderer processes
  newWindow.webContents.once('did-finish-load', () => {
    newWindow.webContents
      .executeJavaScript('process.pid')
      .then(pid => {
        log.info(
          `Window ${windowId} (window number ${windowNumber}) is running in renderer process PID: ${pid}`
        );
      })
      .catch(err => {
        log.warn('Could not get renderer process PID:', err);
      });
  });

  if (isDev)
    newWindow.webContents.session.loadExtension(
      path.join(__dirname, 'extensions/ReactDeveloperTools/4.24.3_0/')
    );

  // Load the index.html of the app.
  load({
    window: newWindow,
    isDev,
    path: '/index.html',
    devTools,
  });

  newWindow.on('closed', function() {
    // Remove from tracked windows
    mainWindows.delete(newWindow);

    // If this was the primary window, set a new primary
    if (isPrimaryWindow) {
      mainWindow = mainWindows.values().next().value || null;
    }

    // Close preview windows belonging to this window
    closePreviewWindowsForParent(windowId);

    // Stop the server and debugger for this window
    stopServer(windowId, () => {});
    closeDebuggerServer(windowId);
  });

  // Prevent any navigation inside the window
  newWindow.webContents.on('will-navigate', (e, url) => {
    if (url !== newWindow.webContents.getURL()) {
      console.info('Opening in browser (because of will-navigate):', url);
      e.preventDefault();
      electron.shell.openExternal(url);
    }
  });

  // Prevent opening any website or url inside Electron
  newWindow.webContents.setWindowOpenHandler(details => {
    console.info('Opening in browser (because of new window): ', details.url);
    electron.shell.openExternal(details.url);
    return { action: 'deny' };
  });

  return newWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  registerGdideProtocol({ isDev });

  // Create the first window
  createNewWindow(args);

  // Expose program arguments (to be accessed by windows)
  global['args'] = args;

  Menu.setApplicationMenu(buildPlaceholderMainMenu());

  // Set up dock menu (macOS) for creating new windows
  if (app.dock) {
    const dockMenu = Menu.buildFromTemplate([
      {
        label: 'New window',
        click: () => {
          createNewWindow(args);
        },
      },
    ]);
    app.dock.setMenu(dockMenu);
  }

  // Set up jump list tasks (Windows) for creating new windows
  if (process.platform === 'win32') {
    app.setUserTasks([
      {
        program: process.execPath,
        arguments: '',
        iconPath: process.execPath,
        iconIndex: 0,
        title: 'New window',
        description: 'Open a new GDevelop window',
      },
    ]);
  }

  ipcMain.on('set-main-menu', (event, mainMenuTemplate) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    Menu.setApplicationMenu(
      buildElectronMenuFromDeclarativeTemplate(
        window || mainWindow,
        mainMenuTemplate
      )
    );
  });

  ipcMain.handle('preview-open', async (event, options) => {
    const parentWindow = BrowserWindow.fromWebContents(event.sender);
    return openPreviewWindow({
      parentWindow: parentWindow,
      previewBrowserWindowOptions: options.previewBrowserWindowOptions,
      previewGameIndexHtmlPath: options.previewGameIndexHtmlPath,
      alwaysOnTop: options.alwaysOnTop,
      hideMenuBar: options.hideMenuBar,
      numberOfWindows: options.numberOfWindows,
      captureOptions: options.captureOptions,
      openEvent: event,
    });
  });
  ipcMain.handle('preview-close', async (event, options) => {
    return closePreviewWindow(options.windowId);
  });

  ipcMain.handle('preview-close-all', async () => {
    return closeAllPreviewWindows();
  });

  // Piskel image editor
  ipcMain.handle('piskel-load', (event, externalEditorInput) => {
    const parentWindow = BrowserWindow.fromWebContents(event.sender);
    return loadExternalEditorWindow({
      parentWindow: parentWindow,
      devTools,
      indexSubPath: 'piskel/piskel-electron-index.html',
      externalEditorInput,
    });
  });

  // JFXR sound effect generator
  ipcMain.handle('jfxr-load', (event, externalEditorInput) => {
    const parentWindow = BrowserWindow.fromWebContents(event.sender);
    return loadExternalEditorWindow({
      parentWindow: parentWindow,
      devTools,
      indexSubPath: 'jfxr/jfxr-electron-index.html',
      externalEditorInput,
    });
  });

  // Yarn Dialogue Tree Editor
  ipcMain.handle('yarn-load', (event, externalEditorInput) => {
    const parentWindow = BrowserWindow.fromWebContents(event.sender);
    return loadExternalEditorWindow({
      parentWindow: parentWindow,
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
      const window = BrowserWindow.fromWebContents(event.sender);
      if (!window) return;

      // setTitleBarOverlay seems not defined on macOS.
      if (window.setTitleBarOverlay) window.setTitleBarOverlay(overlayOptions);
      if (window.setBackgroundColor)
        window.setBackgroundColor(overlayOptions.color);
    }
  );

  // Window maximize toggle (for double-click on titlebar):
  ipcMain.handle('window-maximize-toggle', async event => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return;

    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  });

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
    const window = BrowserWindow.fromWebContents(event.sender);
    const windowId = window ? window.id : 'unknown';
    log.info(
      'Received event to server folder with options=',
      options,
      'for window',
      windowId
    );

    serveFolder({ ...options, windowId }, (err, serverParams) => {
      // Using JSON to copy the config strips unserializable properties
      // (like middleware functions) automatically.
      const configCopy = JSON.parse(JSON.stringify(serverParams));
      event.sender.send('serve-folder-done', err, configCopy);
    });
  });

  ipcMain.on('stop-server', event => {
    const window = BrowserWindow.fromWebContents(event.sender);
    const windowId = window ? window.id : 'unknown';
    log.info('Received event to stop server for window', windowId);

    stopServer(windowId, err => {
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

  onLocalGDJSDevelopmentWatcherRuntimeUpdated(() => {
    log.info(
      'Notifying all editor windows that the GDJS runtime has been updated.'
    );
    mainWindows.forEach(window => {
      window.webContents.send(
        'local-gdjs-development-watcher-runtime-updated',
        null
      );
    });
  });

  // DebuggerServer events:
  ipcMain.on('debugger-start-server', (event, options) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    const windowId = window ? window.id : 'unknown';
    log.info(
      'Received event to start debugger server with options=',
      options,
      'for window',
      windowId
    );

    startDebuggerServer(windowId, {
      onMessage: ({ id, message }) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('debugger-message-received', { id, message });
        }
      },
      onError: error => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('debugger-error-received', error);
        }
      },
      onConnectionClose: ({ id }) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('debugger-connection-closed', { id });
        }
      },
      onConnectionOpen: ({ id }) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('debugger-connection-opened', { id });
        }
      },
      onConnectionError: ({ id, errorMessage }) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('debugger-connection-errored', {
            id,
            errorMessage,
          });
        }
      },
      onListening: ({ address }) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('debugger-start-server-done', { address });
        }
      },
    });
  });

  ipcMain.on('debugger-send-message', (event, message) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    const windowId = window ? window.id : 'unknown';
    sendMessage(windowId, message, err => {
      if (!event.sender.isDestroyed()) {
        event.sender.send('debugger-send-message-done', err);
      }
    });
  });

  ipcMain.on('debugger-close-all-connections', event => {
    const window = BrowserWindow.fromWebContents(event.sender);
    const windowId = window ? window.id : 'unknown';
    closeAllConnections(windowId);
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
    mainWindows.forEach(window => {
      window.webContents.send('update-status', status);
    });
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

  // npm script execution in external terminal (cross-platform)
  ipcMain.on('run-npm-script', (event, { projectPath, npmScript }) => {
    log.info(`Running npm script "${npmScript}" in ${projectPath}`);

    const platform = process.platform;
    const npmCommand = `npm run ${npmScript}`;

    try {
      if (platform === 'win32') {
        // Windows: open cmd window that stays open after npm command
        child_process.spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', `cd ${projectPath} && ${npmCommand}`], {
          detached: true,
          stdio: 'ignore',
        }).unref();
      } else if (platform === 'darwin') {
        const escapedPath = projectPath.replace(/'/g, "'\\''");
        const script = `tell application "Terminal" to do script "cd '${escapedPath}' && ${npmCommand}"`;
        child_process.spawn('osascript', ['-e', script], {
          detached: true,
          stdio: 'ignore',
        });
      } else {
        // Linux: try common terminal emulators
        const bashCommand = `cd "${projectPath}" && ${npmCommand}; exec bash`;
        const terminals = [
          { cmd: 'x-terminal-emulator', args: ['-e', 'bash', '-c', bashCommand] },
          { cmd: 'gnome-terminal', args: ['--', 'bash', '-c', bashCommand] },
          { cmd: 'konsole', args: ['-e', 'bash', '-c', bashCommand] },
          { cmd: 'xterm', args: ['-e', 'bash', '-c', bashCommand] },
        ];

        const tryTerminal = (index) => {
          if (index >= terminals.length) {
            log.error('No terminal emulator found');
            return;
          }
          const terminal = terminals[index];
          const proc = child_process.spawn(terminal.cmd, terminal.args, {
            detached: true,
            stdio: 'ignore',
          });
          proc.on('error', () => tryTerminal(index + 1));
          proc.unref();
        };

        tryTerminal(0);
      }
    } catch (err) {
      log.error('Failed to run npm script:', err);
    }
  });
});
