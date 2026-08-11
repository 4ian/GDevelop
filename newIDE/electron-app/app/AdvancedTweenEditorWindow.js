const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog;
const ipcMain = electron.ipcMain;
const protocol = electron.protocol;
const fs = require('fs');
const path = require('path');
const log = require('electron-log');

let advancedTweenEditorWindow = null;
let isAdvancedTweenEditorProtocolRegistered = false;
let isAdvancedTweenEditorIpcRegistered = false;

const advancedTweenEditorSessions = new Map();
const advancedTweenEditorScheme = 'advanced-tween-editor';
const advancedTweenEditorOrigin = `${advancedTweenEditorScheme}://app`;
const advancedTweenEditorPreloadPath = path.join(
  __dirname,
  'AdvancedTweenEditorPreload.js'
);

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

const getExplicitAdvancedTweenEditorOverrideBundlePath = () => {
  const explicitPath = process.env.ADVANCED_TWEEN_EDITOR_ASAR_PATH?.trim();
  if (!explicitPath) return undefined;

  if (fs.existsSync(explicitPath)) {
    return explicitPath;
  }

  log.warn(`AdvancedTween Editor override ASAR does not exist: ${explicitPath}`);
  return undefined;
};

const advancedTweenEditorBundlePath =
  getExplicitAdvancedTweenEditorOverrideBundlePath() ??
  getBundledExternalPath('advanced-tween-editor.asar');
const advancedTweenEditorWebPath = path.join(
  advancedTweenEditorBundlePath,
  'web'
);
const advancedTweenEditorBundleVersion = (() => {
  try {
    return String(Math.floor(fs.statSync(advancedTweenEditorBundlePath).mtimeMs));
  } catch (error) {
    return String(Date.now());
  }
})();

log.info(`AdvancedTween Editor bundle: ${advancedTweenEditorBundlePath}`);

const getContentType = filePath => {
  switch (path.extname(filePath).toLowerCase()) {
    case '.css':
      return 'text/css; charset=utf-8';
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
      return 'text/javascript; charset=utf-8';
    case '.json':
    case '.map':
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
    case '.ico':
      return 'image/x-icon';
    default:
      return 'application/octet-stream';
  }
};

const normalizeSlashes = value => value.replace(/\\/g, '/');

const isPathInside = (parentPath, childPath) => {
  const relativePath = path.relative(parentPath, childPath);
  return (
    relativePath === '' ||
    (!!relativePath &&
      !relativePath.startsWith('..') &&
      !path.isAbsolute(relativePath))
  );
};

const fileExists = filePath => {
  try {
    return fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
};

const createFileResponse = async filePath => {
  const fileBuffer = await fs.promises.readFile(filePath);
  return new Response(fileBuffer, {
    headers: {
      'content-type': getContentType(filePath),
      'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
      pragma: 'no-cache',
      expires: '0',
    },
  });
};

const jsonResponse = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init.headers || {}),
    },
  });

const getWebFilePath = pathname => {
  if (pathname === '/' || pathname === '/index.html') {
    return path.join(advancedTweenEditorWebPath, 'index.html');
  }

  return path.join(advancedTweenEditorWebPath, pathname);
};

const handleAdvancedTweenEditorProtocolRequest = async request => {
  try {
    const parsedUrl = new URL(request.url);
    const pathname = decodeURIComponent(parsedUrl.pathname || '/');

    if (pathname === '/api/health') {
      return jsonResponse({
        status: 'healthy',
        time: new Date().toISOString(),
      });
    }

    const webFilePath = getWebFilePath(pathname);
    if (!isPathInside(advancedTweenEditorWebPath, webFilePath)) {
      return new Response('Forbidden', { status: 403 });
    }

    if (fileExists(webFilePath)) {
      return createFileResponse(webFilePath);
    }

    return createFileResponse(
      path.join(advancedTweenEditorWebPath, 'index.html')
    );
  } catch (error) {
    log.error('AdvancedTween Editor protocol error:', error);
    return new Response('AdvancedTween Editor failed to load.', { status: 500 });
  }
};

const registerAdvancedTweenEditorProtocol = () => {
  if (isAdvancedTweenEditorProtocolRegistered) return;

  protocol.handle(
    advancedTweenEditorScheme,
    handleAdvancedTweenEditorProtocolRequest
  );
  isAdvancedTweenEditorProtocolRegistered = true;
};

const assertAdvancedTweenEditorBundleExists = () => {
  const indexPath = path.join(advancedTweenEditorWebPath, 'index.html');
  if (fileExists(indexPath)) return;

  throw new Error(
    'AdvancedTween Editor bundle was not found. Run `python scripts/build-third-party-asars.py --target advanced-tween-editor`.'
  );
};

const getSession = webContents => {
  const session = advancedTweenEditorSessions.get(webContents.id);
  if (!session) {
    throw new Error('AdvancedTween Editor project session was not found.');
  }
  return session;
};

const getAnimationsRelativeDirectory = () => path.join('assets', 'animations');

const getAnimationsDirectory = projectRootPath =>
  path.resolve(projectRootPath, getAnimationsRelativeDirectory());

const normalizeProjectResolution = ({
  gameResolutionWidth,
  gameResolutionHeight,
} = {}) => {
  const width = Math.round(Number(gameResolutionWidth));
  const height = Math.round(Number(gameResolutionHeight));
  if (
    Number.isFinite(width) &&
    width > 0 &&
    Number.isFinite(height) &&
    height > 0
  ) {
    return { width, height };
  }

  return { width: 800, height: 600 };
};

const getProjectInfo = session => ({
  projectRootPath: session.projectRootPath,
  animationsRelativePath: normalizeSlashes(getAnimationsRelativeDirectory()),
  gameResolutionWidth: session.gameResolutionWidth,
  gameResolutionHeight: session.gameResolutionHeight,
});

const getSafeAnimationFileName = filename => {
  const rawFileName = String(filename || 'animation.json');
  let safeFileName = path
    .basename(rawFileName)
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .trim()
    .replace(/^\.+/, '');

  if (!safeFileName) {
    safeFileName = 'animation.json';
  }

  const extension = path.extname(safeFileName).toLowerCase();
  if (extension !== '.json' && extension !== '.atproj') {
    safeFileName = `${safeFileName}.json`;
  }

  return safeFileName;
};

const getAnimationFileRelativePath = filePath =>
  normalizeSlashes(
    path.join(
      getAnimationsRelativeDirectory(),
      path.basename(getSafeAnimationFileName(filePath))
    )
  );

const readJsonFile = async filePath => {
  const raw = await fs.promises.readFile(filePath, 'utf8');
  return JSON.parse(raw.replace(/^\uFEFF/, ''));
};

const getAnimationFileProjectRelativePath = (session, filePath) =>
  normalizeSlashes(path.relative(session.projectRootPath, filePath));

const getAnimationFilePayload = async (session, selectedPath, options = {}) => {
  const kind = options && options.kind === 'project' ? 'project' : 'json';
  const expectedExtension = kind === 'project' ? '.atproj' : '.json';
  const resolvedPath = path.resolve(selectedPath);
  if (!isPathInside(session.animationsDir, resolvedPath)) {
    throw new Error(
      'Animation files must be loaded from the project assets/animations folder.'
    );
  }
  if (path.extname(resolvedPath).toLowerCase() !== expectedExtension) {
    throw new Error(
      kind === 'project'
        ? 'AdvancedTween Editor can only open project .atproj files.'
        : 'AdvancedTween Editor can only open JSON animation files.'
    );
  }
  if (!fileExists(resolvedPath)) {
    throw new Error(`Animation file does not exist: ${resolvedPath}`);
  }

  return {
    fileName: path.basename(resolvedPath),
    absolutePath: resolvedPath,
    relativePath: getAnimationFileProjectRelativePath(session, resolvedPath),
    data: await readJsonFile(resolvedPath),
  };
};

const resolveInitialJsonFilePath = (session, initialJsonFile) => {
  const rawInitialJsonFile = String(initialJsonFile || '').trim();
  if (!rawInitialJsonFile) return null;

  const normalizedInitialJsonFile = normalizeSlashes(rawInitialJsonFile);
  const resolvedPath = path.isAbsolute(normalizedInitialJsonFile)
    ? path.resolve(normalizedInitialJsonFile)
    : path.resolve(session.projectRootPath, normalizedInitialJsonFile);

  if (!isPathInside(session.animationsDir, resolvedPath)) {
    throw new Error(
      'Animation files must be loaded from the project assets/animations folder.'
    );
  }

  return resolvedPath;
};

const notifyProjectFilesChanged = (session, detail) => {
  const parentWebContents = session.parentWebContents;
  if (!parentWebContents || parentWebContents.isDestroyed()) return;

  parentWebContents.send('advanced-tween-editor-project-files-changed', detail);
};

const showOpenAnimationFileDialog = async (session, options) => {
  const kind = options && options.kind === 'project' ? 'project' : 'json';
  const extensions = kind === 'project' ? ['atproj'] : ['json'];
  await fs.promises.mkdir(session.animationsDir, { recursive: true });

  const result = await dialog.showOpenDialog({
    title:
      kind === 'project'
        ? 'Open AdvancedTween project'
        : 'Open AdvancedTween animation',
    defaultPath: session.animationsDir,
    properties: ['openFile'],
    filters: [
      {
        name:
          kind === 'project'
            ? 'AdvancedTween projects'
            : 'AdvancedTween animations',
        extensions,
      },
    ],
  });

  if (result.canceled || !result.filePaths.length) {
    return null;
  }

  const selectedPath = path.resolve(result.filePaths[0]);
  if (!isPathInside(session.animationsDir, selectedPath)) {
    throw new Error(
      'Animation files must be loaded from the project assets/animations folder.'
    );
  }

  const payload = await getAnimationFilePayload(session, selectedPath, { kind });
  if (kind === 'json') {
    session.currentJsonFilePath = payload.absolutePath;
  }
  return payload;
};

const saveAnimationFile = async (session, options) => {
  const kind = options && options.kind === 'project' ? 'project' : 'json';
  const currentJsonFilePath =
    kind === 'json' && session.currentJsonFilePath
      ? path.resolve(session.currentJsonFilePath)
      : null;
  const fileName = currentJsonFilePath
    ? path.basename(currentJsonFilePath)
    : getSafeAnimationFileName(options && options.filename);
  const destinationPath = currentJsonFilePath
    ? currentJsonFilePath
    : path.resolve(session.animationsDir, fileName);
  if (!isPathInside(session.animationsDir, destinationPath)) {
    throw new Error(`Animation file path escapes assets/animations: ${fileName}`);
  }
  if (
    kind === 'json' &&
    path.extname(destinationPath).toLowerCase() !== '.json'
  ) {
    throw new Error('AdvancedTween Editor can only save JSON animation files.');
  }

  await fs.promises.mkdir(session.animationsDir, { recursive: true });
  await fs.promises.writeFile(
    destinationPath,
    JSON.stringify(options && options.data ? options.data : {}, null, 2),
    'utf8'
  );

  const result = {
    fileName,
    absolutePath: destinationPath,
    relativePath: getAnimationFileProjectRelativePath(session, destinationPath),
  };
  if (path.extname(fileName).toLowerCase() === '.json') {
    session.currentJsonFilePath = destinationPath;
    session.lastSavedJsonFile = result;
  }
  notifyProjectFilesChanged(session, result);
  return result;
};

const registerAdvancedTweenEditorIpc = () => {
  if (isAdvancedTweenEditorIpcRegistered) return;

  ipcMain.handle('advanced-tween-editor-get-project-info', event => {
    const session = getSession(event.sender);
    return getProjectInfo(session);
  });

  ipcMain.handle(
    'advanced-tween-editor-open-animation-file',
    async (event, options) =>
      showOpenAnimationFileDialog(getSession(event.sender), options)
  );

  ipcMain.handle(
    'advanced-tween-editor-save-animation-file',
    async (event, options) => saveAnimationFile(getSession(event.sender), options)
  );

  isAdvancedTweenEditorIpcRegistered = true;
};

const installAdvancedTweenEditorBridge = async webContents => {
  const bridgeScript = `
(() => {
  if (window.__gdevelopAdvancedTweenBridgeInstalled) return;
  const bridge = window.gdevelopAdvancedTweenBridge;
  if (!bridge || !window.FileIO) return;
  window.__gdevelopAdvancedTweenBridgeInstalled = true;

  const getErrorMessage = error =>
    error && error.message ? error.message : String(error);

  window.FileIO.prototype.triggerJSONLoad = async function() {
    try {
      const result = await bridge.openAnimationFile({ kind: 'json' });
      if (!result) return;
      this.validateJSON(result.data);
      this.notifyJSONLoad(result.data, result.fileName);
    } catch (error) {
      alert('Error loading JSON: ' + getErrorMessage(error));
    }
  };

  window.FileIO.prototype.triggerAllLoad = async function() {
    try {
      const result = await bridge.openAnimationFile({ kind: 'project' });
      if (!result) return;
      this.validateAllJSON(result.data);
      this.notifyAllLoad(result.data);
    } catch (error) {
      alert('Error loading project JSON: ' + getErrorMessage(error));
    }
  };

  window.FileIO.prototype.saveJSON = async function(data, filename) {
    try {
      const cleanedData = this.cleanJSONForExport(data);
      await bridge.saveAnimationFile({
        kind: 'json',
        filename: filename || 'animation.json',
        data: cleanedData,
      });
    } catch (error) {
      alert('Error saving JSON: ' + getErrorMessage(error));
    }
  };

  window.FileIO.prototype.saveAllJSON = async function(data, filename) {
    try {
      await bridge.saveAnimationFile({
        kind: 'project',
        filename: filename || 'project.atproj',
        data,
      });
    } catch (error) {
      alert('Error saving project JSON: ' + getErrorMessage(error));
    }
  };
})();
`;

  await webContents.executeJavaScript(bridgeScript, true);
};

const applyProjectInfoInAdvancedTweenEditor = async (webContents, session) => {
  const projectInfo = getProjectInfo(session);
  const applyProjectInfoScript = `
(async () => {
  const projectInfo = ${JSON.stringify(projectInfo)};
  for (let retry = 0; retry < 100; retry++) {
    if (
      window.app &&
      typeof window.app.applyProjectInfo === 'function'
    ) {
      window.app.applyProjectInfo(projectInfo);
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
})()
`;

  await webContents.executeJavaScript(applyProjectInfoScript, true);
};

const loadInitialJsonFileInAdvancedTweenEditor = async (
  webContents,
  session,
  initialJsonFile
) => {
  const initialJsonFilePath = resolveInitialJsonFilePath(
    session,
    initialJsonFile
  );
  if (!initialJsonFilePath) return;

  const payload = await getAnimationFilePayload(session, initialJsonFilePath);
  session.currentJsonFilePath = payload.absolutePath;
  const loadScript = `
(async () => {
  const payload = ${JSON.stringify({
    fileName: payload.fileName,
    data: payload.data,
  })};
  for (let retry = 0; retry < 100; retry++) {
    if (window.app && window.app.fileIO) break;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  if (!window.app || !window.app.fileIO) {
    throw new Error('AdvancedTween Editor app is not ready.');
  }
  window.app.fileIO.validateJSON(payload.data);
  window.app.fileIO.notifyJSONLoad(payload.data, payload.fileName);
})()
`;

  await webContents.executeJavaScript(loadScript, true);
};

const openAdvancedTweenEditorWindow = async ({
  parentWindow,
  devTools,
  projectRootPath,
  waitForResult,
  initialJsonFile,
  gameResolutionWidth,
  gameResolutionHeight,
}) => {
  if (!projectRootPath) {
    throw new Error('Save the project before opening AdvancedTween Editor.');
  }

  const resolvedProjectRootPath = path.resolve(projectRootPath);
  const animationsDir = getAnimationsDirectory(resolvedProjectRootPath);
  if (!isPathInside(resolvedProjectRootPath, animationsDir)) {
    throw new Error('The animations folder must be inside the project folder.');
  }
  await fs.promises.mkdir(animationsDir, { recursive: true });
  const projectResolution = normalizeProjectResolution({
    gameResolutionWidth,
    gameResolutionHeight,
  });

  assertAdvancedTweenEditorBundleExists();
  registerAdvancedTweenEditorProtocol();
  registerAdvancedTweenEditorIpc();

  const createSession = previousSession => ({
    projectRootPath: resolvedProjectRootPath,
    animationsDir,
    parentWebContents: parentWindow ? parentWindow.webContents : null,
    lastSavedJsonFile: null,
    gameResolutionWidth: projectResolution.width,
    gameResolutionHeight: projectResolution.height,
    currentJsonFilePath: previousSession
      ? previousSession.currentJsonFilePath
      : null,
  });

  const waitForWindowResult = (editorWindow, session) =>
    new Promise(resolve => {
      if (!editorWindow || editorWindow.isDestroyed()) {
        resolve({ savedJsonFile: session.lastSavedJsonFile });
        return;
      }

      editorWindow.once('closed', () => {
        resolve({ savedJsonFile: session.lastSavedJsonFile });
      });
    });

  if (advancedTweenEditorWindow && !advancedTweenEditorWindow.isDestroyed()) {
    const session = createSession(
      advancedTweenEditorSessions.get(advancedTweenEditorWindow.webContents.id)
    );
    advancedTweenEditorSessions.set(
      advancedTweenEditorWindow.webContents.id,
      session
    );
    await installAdvancedTweenEditorBridge(advancedTweenEditorWindow.webContents);
    await applyProjectInfoInAdvancedTweenEditor(
      advancedTweenEditorWindow.webContents,
      session
    );
    await loadInitialJsonFileInAdvancedTweenEditor(
      advancedTweenEditorWindow.webContents,
      session,
      initialJsonFile
    );
    advancedTweenEditorWindow.focus();
    if (waitForResult) {
      return waitForWindowResult(advancedTweenEditorWindow, session);
    }
    return { url: advancedTweenEditorOrigin };
  }

  advancedTweenEditorWindow = new BrowserWindow({
    parent: parentWindow || undefined,
    width: parentWindow ? Math.floor(parentWindow.getSize()[0] * 0.88) : 1320,
    height: parentWindow ? Math.floor(parentWindow.getSize()[1] * 0.92) : 900,
    backgroundColor: '#111827',
    modal: false,
    center: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: advancedTweenEditorPreloadPath,
      webSecurity: true,
    },
  });
  advancedTweenEditorWindow.setMenu(null);

  const session = createSession(null);
  advancedTweenEditorSessions.set(
    advancedTweenEditorWindow.webContents.id,
    session
  );

  advancedTweenEditorWindow.once('ready-to-show', () => {
    if (!advancedTweenEditorWindow || advancedTweenEditorWindow.isDestroyed()) {
      return;
    }
    advancedTweenEditorWindow.show();
    if (devTools) advancedTweenEditorWindow.webContents.openDevTools();
  });

  advancedTweenEditorWindow.webContents.on('will-navigate', (event, nextUrl) => {
    if (nextUrl.startsWith(advancedTweenEditorOrigin)) return;

    event.preventDefault();
    electron.shell.openExternal(nextUrl);
  });

  advancedTweenEditorWindow.webContents.setWindowOpenHandler(details => {
    electron.shell.openExternal(details.url);
    return { action: 'deny' };
  });

  const onWillDownload = (event, item, webContents) => {
    if (
      !advancedTweenEditorWindow ||
      webContents !== advancedTweenEditorWindow.webContents
    ) {
      return;
    }

    const session = advancedTweenEditorSessions.get(webContents.id);
    if (!session) return;

    try {
      fs.mkdirSync(session.animationsDir, { recursive: true });
      const fileName = getSafeAnimationFileName(item.getFilename());
      const destinationPath = path.resolve(session.animationsDir, fileName);
      if (!isPathInside(session.animationsDir, destinationPath)) return;
      item.setSavePath(destinationPath);
      item.once('done', (downloadEvent, state) => {
        if (state !== 'completed') return;
        const result = {
          fileName,
          absolutePath: destinationPath,
          relativePath: getAnimationFileRelativePath(destinationPath),
        };
        if (path.extname(fileName).toLowerCase() === '.json') {
          session.lastSavedJsonFile = result;
        }
        notifyProjectFilesChanged(session, result);
      });
    } catch (error) {
      log.warn('Failed to route AdvancedTween Editor download.', error);
    }
  };
  advancedTweenEditorWindow.webContents.session.on(
    'will-download',
    onWillDownload
  );

  const currentAdvancedTweenEditorWindow = advancedTweenEditorWindow;
  const currentWebContents = currentAdvancedTweenEditorWindow.webContents;
  const currentWebContentsId = currentWebContents.id;
  const currentSession = currentWebContents.session;
  let isForceClosingAdvancedTweenEditorWindow = false;
  currentAdvancedTweenEditorWindow.on('close', event => {
    if (
      isForceClosingAdvancedTweenEditorWindow ||
      currentAdvancedTweenEditorWindow.isDestroyed()
    ) {
      return;
    }

    event.preventDefault();
    isForceClosingAdvancedTweenEditorWindow = true;
    currentAdvancedTweenEditorWindow.destroy();
  });
  currentAdvancedTweenEditorWindow.on('closed', () => {
    advancedTweenEditorSessions.delete(currentWebContentsId);
    currentSession.removeListener('will-download', onWillDownload);
    if (advancedTweenEditorWindow === currentAdvancedTweenEditorWindow) {
      advancedTweenEditorWindow = null;
    }
  });

  try {
    await advancedTweenEditorWindow.webContents.session.clearCache();
  } catch (error) {
    log.warn('Failed to clear AdvancedTween Editor cache.', error);
  }

  await advancedTweenEditorWindow.loadURL(
    `${advancedTweenEditorOrigin}/index.html?v=${encodeURIComponent(
      advancedTweenEditorBundleVersion
    )}`
  );
  await installAdvancedTweenEditorBridge(advancedTweenEditorWindow.webContents);
  await applyProjectInfoInAdvancedTweenEditor(
    advancedTweenEditorWindow.webContents,
    session
  );
  await loadInitialJsonFileInAdvancedTweenEditor(
    advancedTweenEditorWindow.webContents,
    session,
    initialJsonFile
  );
  if (waitForResult) {
    return waitForWindowResult(advancedTweenEditorWindow, session);
  }
  return { url: advancedTweenEditorOrigin };
};

module.exports = {
  advancedTweenEditorScheme,
  openAdvancedTweenEditorWindow,
};
