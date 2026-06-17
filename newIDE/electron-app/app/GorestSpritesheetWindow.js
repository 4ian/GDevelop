const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const protocol = electron.protocol;
const fs = require('fs');
const path = require('path');
const log = require('electron-log');

let gorestSpritesheetWindow = null;
let isGorestSpritesheetProtocolRegistered = false;

const gorestSpritesheetScheme = 'gorest-spritesheet';
const gorestSpritesheetOrigin = `${gorestSpritesheetScheme}://app`;

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

const getExplicitGorestSpritesheetOverrideBundlePath = () => {
  const explicitPath = process.env.GOREST_SPRITESHEET_ASAR_PATH?.trim();
  if (!explicitPath) return undefined;

  if (fs.existsSync(explicitPath)) {
    return explicitPath;
  }

  log.warn(`Gorest Spritesheet override ASAR does not exist: ${explicitPath}`);
  return undefined;
};

const gorestSpritesheetBundlePath =
  getExplicitGorestSpritesheetOverrideBundlePath() ??
  getBundledExternalPath('gorest-spritesheet.asar');
const gorestSpritesheetWebPath = path.join(gorestSpritesheetBundlePath, 'web');
const gorestSpritesheetBundleVersion = (() => {
  try {
    return String(Math.floor(fs.statSync(gorestSpritesheetBundlePath).mtimeMs));
  } catch (error) {
    return String(Date.now());
  }
})();

log.info(`Gorest Spritesheet bundle: ${gorestSpritesheetBundlePath}`);

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

const getGorestSpritesheetUserDataPath = () =>
  path.join(app.getPath('userData'), 'gorest-spritesheet-generator');

const getGeneratedDir = () =>
  path.join(getGorestSpritesheetUserDataPath(), 'generated');

const getGameLibraryPath = () =>
  path.join(getGeneratedDir(), 'game_asset_library.json');

const getEmptyGameLibrary = () => ({
  assets: [],
  scenes: [],
  updatedTime: new Date().toISOString(),
});

const readJsonFile = async (filePath, fallback) => {
  try {
    const raw = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(raw.replace(/^\uFEFF/, ''));
  } catch (error) {
    return fallback;
  }
};

const readGameLibrary = async () => {
  const empty = getEmptyGameLibrary();
  const parsed = await readJsonFile(getGameLibraryPath(), empty);
  return {
    assets: Array.isArray(parsed.assets) ? parsed.assets : [],
    scenes: Array.isArray(parsed.scenes) ? parsed.scenes : [],
    updatedTime: parsed.updatedTime || empty.updatedTime,
  };
};

const writeGameLibrary = async library => {
  await fs.promises.mkdir(getGeneratedDir(), { recursive: true });
  const normalizedLibrary = {
    ...library,
    updatedTime: new Date().toISOString(),
  };
  await fs.promises.writeFile(
    getGameLibraryPath(),
    JSON.stringify(normalizedLibrary, null, 2),
    'utf8'
  );
  return normalizedLibrary;
};

const readRequestJson = async request => {
  try {
    return await request.json();
  } catch (error) {
    return {};
  }
};

const handleGorestSpritesheetApiRequest = async (request, parsedUrl) => {
  const method = request.method.toUpperCase();
  const pathname = parsedUrl.pathname;

  if (method === 'GET' && pathname === '/api/health') {
    return jsonResponse({
      status: 'healthy',
      time: new Date().toISOString(),
    });
  }

  if (method === 'GET' && pathname === '/api/spritesheet/latest') {
    const sprite = await readJsonFile(
      path.join(getGeneratedDir(), 'latest_sprite.json'),
      null
    );
    return jsonResponse({ sprite });
  }

  if (method === 'POST' && pathname === '/api/spritesheet/generate') {
    return jsonResponse(
      {
        error:
          'Spritesheet generation is not available in the packaged Electron wrapper yet.',
      },
      { status: 501 }
    );
  }

  if (method === 'GET' && pathname === '/api/game-library') {
    return jsonResponse(await readGameLibrary());
  }

  if (method === 'POST' && pathname === '/api/game-library/assets') {
    const body = await readRequestJson(request);
    const asset = body && body.asset;
    if (!asset || !asset.id || !asset.sprite) {
      return jsonResponse(
        { error: 'asset with id and sprite is required' },
        { status: 400 }
      );
    }

    const library = await readGameLibrary();
    const normalizedAsset = {
      ...asset,
      confirmed: true,
      savedTime: asset.savedTime || new Date().toISOString(),
      updatedTime: new Date().toISOString(),
    };
    library.assets = [
      normalizedAsset,
      ...library.assets.filter(item => item.id !== normalizedAsset.id),
    ];
    const savedLibrary = await writeGameLibrary(library);
    return jsonResponse({ asset: normalizedAsset, library: savedLibrary });
  }

  const assetMatch = pathname.match(/^\/api\/game-library\/assets\/([^/]+)$/);
  if (method === 'DELETE' && assetMatch) {
    const assetId = decodeURIComponent(assetMatch[1]);
    const library = await readGameLibrary();
    library.assets = library.assets.filter(item => item.id !== assetId);
    library.scenes = library.scenes.map(scene => ({
      ...scene,
      layers: Array.isArray(scene.layers)
        ? scene.layers.filter(layer => layer.assetId !== assetId)
        : [],
    }));
    const savedLibrary = await writeGameLibrary(library);
    return jsonResponse({ library: savedLibrary });
  }

  if (method === 'POST' && pathname === '/api/game-library/scenes') {
    const body = await readRequestJson(request);
    const scene = body && body.scene;
    if (!scene || !scene.id || !Array.isArray(scene.layers)) {
      return jsonResponse(
        { error: 'scene with id and layers is required' },
        { status: 400 }
      );
    }

    const library = await readGameLibrary();
    const normalizedScene = {
      ...scene,
      savedTime: scene.savedTime || new Date().toISOString(),
      updatedTime: new Date().toISOString(),
    };
    library.scenes = [
      normalizedScene,
      ...library.scenes.filter(item => item.id !== normalizedScene.id),
    ];
    const savedLibrary = await writeGameLibrary(library);
    return jsonResponse({ scene: normalizedScene, library: savedLibrary });
  }

  const sceneMatch = pathname.match(/^\/api\/game-library\/scenes\/([^/]+)$/);
  if (method === 'DELETE' && sceneMatch) {
    const sceneId = decodeURIComponent(sceneMatch[1]);
    const library = await readGameLibrary();
    const beforeCount = library.scenes.length;
    library.scenes = library.scenes.filter(item => item.id !== sceneId);
    if (library.scenes.length === beforeCount) {
      return jsonResponse({ error: 'Scene not found' }, { status: 404 });
    }
    const savedLibrary = await writeGameLibrary(library);
    return jsonResponse({ library: savedLibrary });
  }

  return new Response('Not found', { status: 404 });
};

const getWebFilePath = pathname => {
  if (pathname === '/' || pathname === '/index.html') {
    return path.join(gorestSpritesheetWebPath, 'index.html');
  }

  return path.join(gorestSpritesheetWebPath, pathname);
};

const getGeneratedFilePath = pathname =>
  path.join(getGeneratedDir(), pathname.replace(/^\/generated\//, ''));

const handleGorestSpritesheetProtocolRequest = async request => {
  try {
    const parsedUrl = new URL(request.url);
    const pathname = decodeURIComponent(parsedUrl.pathname || '/');

    if (pathname.startsWith('/api/')) {
      return handleGorestSpritesheetApiRequest(request, parsedUrl);
    }

    if (pathname.startsWith('/generated/')) {
      const generatedFilePath = getGeneratedFilePath(pathname);
      if (
        isPathInside(getGeneratedDir(), generatedFilePath) &&
        fileExists(generatedFilePath)
      ) {
        return createFileResponse(generatedFilePath);
      }
    }

    const webFilePath = getWebFilePath(pathname);
    if (!isPathInside(gorestSpritesheetWebPath, webFilePath)) {
      return new Response('Forbidden', { status: 403 });
    }

    if (fileExists(webFilePath)) {
      return createFileResponse(webFilePath);
    }

    return createFileResponse(path.join(gorestSpritesheetWebPath, 'index.html'));
  } catch (error) {
    log.error('Gorest Spritesheet protocol error:', error);
    return new Response('Gorest Spritesheet failed to load.', { status: 500 });
  }
};

const registerGorestSpritesheetProtocol = () => {
  if (isGorestSpritesheetProtocolRegistered) return;

  protocol.handle(gorestSpritesheetScheme, handleGorestSpritesheetProtocolRequest);
  isGorestSpritesheetProtocolRegistered = true;
};

const assertGorestSpritesheetBundleExists = () => {
  const indexPath = path.join(gorestSpritesheetWebPath, 'index.html');
  if (fileExists(indexPath)) return;

  throw new Error(
    'Gorest Spritesheet bundle was not found. Run `python scripts/build-third-party-asars.py --target gorest-spritesheet`.'
  );
};

const openGorestSpritesheetWindow = async ({ parentWindow, devTools }) => {
  assertGorestSpritesheetBundleExists();
  registerGorestSpritesheetProtocol();

  if (gorestSpritesheetWindow && !gorestSpritesheetWindow.isDestroyed()) {
    gorestSpritesheetWindow.focus();
    return { url: gorestSpritesheetOrigin };
  }

  gorestSpritesheetWindow = new BrowserWindow({
    parent: parentWindow || undefined,
    width: parentWindow ? Math.floor(parentWindow.getSize()[0] * 0.88) : 1320,
    height: parentWindow ? Math.floor(parentWindow.getSize()[1] * 0.92) : 900,
    backgroundColor: '#0b1120',
    modal: false,
    center: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });
  gorestSpritesheetWindow.setMenu(null);

  gorestSpritesheetWindow.once('ready-to-show', () => {
    if (!gorestSpritesheetWindow || gorestSpritesheetWindow.isDestroyed()) {
      return;
    }
    gorestSpritesheetWindow.show();
    if (devTools) gorestSpritesheetWindow.webContents.openDevTools();
  });

  gorestSpritesheetWindow.webContents.on('will-navigate', (event, nextUrl) => {
    if (nextUrl.startsWith(gorestSpritesheetOrigin)) return;

    event.preventDefault();
    electron.shell.openExternal(nextUrl);
  });

  gorestSpritesheetWindow.webContents.setWindowOpenHandler(details => {
    electron.shell.openExternal(details.url);
    return { action: 'deny' };
  });

  gorestSpritesheetWindow.on('closed', () => {
    gorestSpritesheetWindow = null;
  });

  try {
    await gorestSpritesheetWindow.webContents.session.clearCache();
  } catch (error) {
    log.warn('Failed to clear Gorest Spritesheet cache.', error);
  }

  await gorestSpritesheetWindow.loadURL(
    `${gorestSpritesheetOrigin}/index.html?v=${encodeURIComponent(
      gorestSpritesheetBundleVersion
    )}`
  );
  return { url: gorestSpritesheetOrigin };
};

module.exports = {
  gorestSpritesheetScheme,
  openGorestSpritesheetWindow,
};
