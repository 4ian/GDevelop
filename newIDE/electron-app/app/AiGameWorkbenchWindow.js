const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const protocol = electron.protocol;
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const log = require('electron-log');

let aiGameWorkbenchWindow = null;
let aiGameWorkbenchParentWebContents = null;
let aiGameWorkbenchAppPromise = null;
let isAiGameWorkbenchProtocolRegistered = false;
let isAiGameWorkbenchIpcRegistered = false;
const pendingGDevelopExtensionImports = new Map();

const aiGameWorkbenchScheme = 'ai-game-workbench';
const aiGameWorkbenchOrigin = `${aiGameWorkbenchScheme}://app`;
const getBundledExternalPath = name => {
  if (app.isPackaged && process.resourcesPath) {
    const unpackedPath = path.join(
      process.resourcesPath,
      'app.asar.unpacked',
      'external',
      name
    );
    if (fs.existsSync(unpackedPath)) {
      return unpackedPath;
    }
  }

  return path.join(__dirname, 'external', name);
};

const aiGameWorkbenchBundlePath = getBundledExternalPath(
  'ai-game-workbench.asar'
);
const aiGameWorkbenchUnpackedPath = `${aiGameWorkbenchBundlePath}.unpacked`;
const aiGameWorkbenchWebPath = path.join(aiGameWorkbenchBundlePath, 'web');
const aiGameWorkbenchServerPath = path.join(
  aiGameWorkbenchBundlePath,
  'server'
);
const aiGameWorkbenchServerEntryPath = path.join(
  aiGameWorkbenchServerPath,
  'app.js'
);
const aiGameWorkbenchPreloadPath = path.join(
  __dirname,
  'AiGameWorkbenchPreload.js'
);
const aiGameWorkbenchBundledPresetsPath = path.join(
  aiGameWorkbenchServerPath,
  'presets'
);
const aiGameWorkbenchFfmpegPath = path.join(
  aiGameWorkbenchUnpackedPath,
  'bin',
  'ffmpeg.exe'
);

const serverRoutePrefixes = [
  '/api/',
  '/jobs/',
  '/characters/',
  '/module02/',
  '/exports/character-2d/',
  '/style-references/',
  '/direction-references/',
];

const getContentType = filePath => {
  switch (path.extname(filePath).toLowerCase()) {
    case '.css':
      return 'text/css; charset=utf-8';
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
      return 'text/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    case '.webp':
      return 'image/webp';
    case '.mp4':
      return 'video/mp4';
    case '.zip':
      return 'application/zip';
    case '.wasm':
      return 'application/wasm';
    default:
      return 'application/octet-stream';
  }
};

const isPathInside = (parentPath, childPath) => {
  const relativePath = path.relative(parentPath, childPath);
  return (
    relativePath === '' ||
    (!!relativePath &&
      !relativePath.startsWith('..') &&
      !path.isAbsolute(relativePath))
  );
};

const createFileResponse = async filePath => {
  const fileBuffer = await fs.promises.readFile(filePath);
  return new Response(fileBuffer, {
    headers: {
      'content-type': getContentType(filePath),
    },
  });
};

const getWebFilePath = pathname => {
  if (pathname === '/' || pathname === '/index.html') {
    return path.join(aiGameWorkbenchWebPath, 'index.html');
  }

  return path.join(aiGameWorkbenchWebPath, pathname);
};

const fileExists = filePath => {
  try {
    return fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
};

const shouldRouteToServer = pathname =>
  serverRoutePrefixes.some(prefix => pathname.startsWith(prefix));

const getAiGameWorkbenchUserDataPath = () =>
  path.join(app.getPath('userData'), 'ai-game-workbench');

const copyMissingFiles = async (sourcePath, targetPath) => {
  await fs.promises.mkdir(targetPath, { recursive: true });
  const entries = await fs.promises.readdir(sourcePath, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const sourceEntryPath = path.join(sourcePath, entry.name);
    const targetEntryPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      await copyMissingFiles(sourceEntryPath, targetEntryPath);
      continue;
    }

    if (!fileExists(targetEntryPath)) {
      await fs.promises.copyFile(sourceEntryPath, targetEntryPath);
    }
  }
};

const ensureAiGameWorkbenchApp = async () => {
  if (!aiGameWorkbenchAppPromise) {
    aiGameWorkbenchAppPromise = (async () => {
      const userDataPath = getAiGameWorkbenchUserDataPath();
      const storageDir = path.join(userDataPath, 'storage');
      const presetsDir = path.join(userDataPath, 'presets');
      const module01CharacterExportDir = path.join(
        userDataPath,
        'exports',
        'Character_2D'
      );

      await fs.promises.mkdir(storageDir, { recursive: true });
      await fs.promises.mkdir(module01CharacterExportDir, { recursive: true });
      await copyMissingFiles(aiGameWorkbenchBundledPresetsPath, presetsDir);

      const serverModule = await import(pathToFileURL(
        aiGameWorkbenchServerEntryPath
      ).href);
      const workbenchApp = serverModule.createApp({
        storageDir,
        presetsDir,
        module01CharacterExportDir,
        ffmpegPath: aiGameWorkbenchFfmpegPath,
        port: 0,
      });
      await workbenchApp.ready();
      return workbenchApp;
    })();
  }

  return aiGameWorkbenchAppPromise;
};

const createHeadersFromFastifyResponse = response => {
  const headers = new Headers();
  for (const [key, value] of Object.entries(response.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, String(item));
      }
    } else if (typeof value !== 'undefined') {
      headers.set(key, String(value));
    }
  }
  return headers;
};

const handleAiGameWorkbenchServerRequest = async (request, parsedUrl) => {
  const workbenchApp = await ensureAiGameWorkbenchApp();
  const method = request.method.toUpperCase();
  const headers = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const requestOptions = {
    method,
    url: `${parsedUrl.pathname}${parsedUrl.search}`,
    headers,
  };
  if (method !== 'GET' && method !== 'HEAD') {
    requestOptions.payload = Buffer.from(await request.arrayBuffer());
  }

  const response = await workbenchApp.inject(requestOptions);
  return new Response(response.rawPayload || response.payload, {
    status: response.statusCode,
    headers: createHeadersFromFastifyResponse(response),
  });
};

const handleAiGameWorkbenchProtocolRequest = async request => {
  try {
    const parsedUrl = new URL(request.url);
    const pathname = decodeURIComponent(parsedUrl.pathname || '/');
    const webFilePath = getWebFilePath(pathname);
    const webFileExists =
      isPathInside(aiGameWorkbenchWebPath, webFilePath) &&
      fileExists(webFilePath);

    if (shouldRouteToServer(pathname) && !webFileExists) {
      return handleAiGameWorkbenchServerRequest(request, parsedUrl);
    }

    if (!isPathInside(aiGameWorkbenchWebPath, webFilePath)) {
      return new Response('Forbidden', { status: 403 });
    }

    if (webFileExists) {
      return createFileResponse(webFilePath);
    }

    return createFileResponse(path.join(aiGameWorkbenchWebPath, 'index.html'));
  } catch (error) {
    log.error('AI Game Workbench protocol error:', error);
    return new Response('AI Game Workbench failed to load.', { status: 500 });
  }
};

const registerAiGameWorkbenchProtocol = () => {
  if (isAiGameWorkbenchProtocolRegistered) return;

  protocol.handle(aiGameWorkbenchScheme, handleAiGameWorkbenchProtocolRequest);
  isAiGameWorkbenchProtocolRegistered = true;
};

const registerAiGameWorkbenchIpc = () => {
  if (isAiGameWorkbenchIpcRegistered) return;

  ipcMain.handle(
    'ai-game-workbench-import-gdevelop-extension',
    async (event, payload) => {
      if (
        !aiGameWorkbenchWindow ||
        aiGameWorkbenchWindow.isDestroyed() ||
        event.sender !== aiGameWorkbenchWindow.webContents
      ) {
        throw new Error(
          'GDevelop extension import is only available from AI Game Workbench.'
        );
      }

      if (
        !aiGameWorkbenchParentWebContents ||
        aiGameWorkbenchParentWebContents.isDestroyed()
      ) {
        throw new Error(
          'No active GDevelop project window is available for import.'
        );
      }

      const requestId = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          pendingGDevelopExtensionImports.delete(requestId);
          reject(new Error('Timed out while importing into GDevelop.'));
        }, 120000);

        pendingGDevelopExtensionImports.set(requestId, {
          resolve,
          reject,
          timeout,
        });
        aiGameWorkbenchParentWebContents.send(
          'ai-game-workbench-import-gdevelop-extension-request',
          { requestId, payload }
        );
      });
    }
  );

  ipcMain.on(
    'ai-game-workbench-import-gdevelop-extension-response',
    (event, response) => {
      if (event.sender !== aiGameWorkbenchParentWebContents) {
        return;
      }
      const requestId = response && response.requestId;
      if (!requestId || !pendingGDevelopExtensionImports.has(requestId)) {
        return;
      }

      const pending = pendingGDevelopExtensionImports.get(requestId);
      pendingGDevelopExtensionImports.delete(requestId);
      clearTimeout(pending.timeout);
      if (response.error) {
        pending.reject(new Error(response.error));
      } else {
        pending.resolve(response.result);
      }
    }
  );

  isAiGameWorkbenchIpcRegistered = true;
};

const openAiGameWorkbenchWindow = async ({ parentWindow, devTools }) => {
  registerAiGameWorkbenchProtocol();
  registerAiGameWorkbenchIpc();
  aiGameWorkbenchParentWebContents = parentWindow
    ? parentWindow.webContents
    : null;

  if (aiGameWorkbenchWindow && !aiGameWorkbenchWindow.isDestroyed()) {
    aiGameWorkbenchWindow.focus();
    return { url: aiGameWorkbenchOrigin };
  }

  aiGameWorkbenchWindow = new BrowserWindow({
    parent: parentWindow || undefined,
    width: parentWindow ? Math.floor(parentWindow.getSize()[0] * 0.88) : 1320,
    height: parentWindow ? Math.floor(parentWindow.getSize()[1] * 0.92) : 900,
    backgroundColor: '#0f172a',
    modal: false,
    center: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: aiGameWorkbenchPreloadPath,
      webSecurity: true,
    },
  });
  aiGameWorkbenchWindow.setMenu(null);

  aiGameWorkbenchWindow.once('ready-to-show', () => {
    if (!aiGameWorkbenchWindow || aiGameWorkbenchWindow.isDestroyed()) return;
    aiGameWorkbenchWindow.show();
    if (devTools) aiGameWorkbenchWindow.webContents.openDevTools();
  });

  aiGameWorkbenchWindow.webContents.on('will-navigate', (event, nextUrl) => {
    if (nextUrl.startsWith(aiGameWorkbenchOrigin)) return;

    event.preventDefault();
    electron.shell.openExternal(nextUrl);
  });

  aiGameWorkbenchWindow.webContents.setWindowOpenHandler(details => {
    electron.shell.openExternal(details.url);
    return { action: 'deny' };
  });

  aiGameWorkbenchWindow.on('closed', () => {
    for (const pending of pendingGDevelopExtensionImports.values()) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('AI Game Workbench was closed.'));
    }
    pendingGDevelopExtensionImports.clear();
    aiGameWorkbenchWindow = null;
    aiGameWorkbenchParentWebContents = null;
  });

  await aiGameWorkbenchWindow.loadURL(`${aiGameWorkbenchOrigin}/index.html`);
  return { url: aiGameWorkbenchOrigin };
};

module.exports = {
  aiGameWorkbenchScheme,
  openAiGameWorkbenchWindow,
};
