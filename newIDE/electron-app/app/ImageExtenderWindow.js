const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const protocol = electron.protocol;
const fs = require('fs');
const path = require('path');
const log = require('electron-log');

let imageExtenderWindow = null;
let isImageExtenderProtocolRegistered = false;

const imageExtenderScheme = 'image-extender';
const imageExtenderOrigin = `${imageExtenderScheme}://app`;
const imageExtenderBundlePath = path.join(
  __dirname,
  'external',
  'image-extender.asar'
);
const imageExtenderNextPath = path.join(imageExtenderBundlePath, '.next');
const imageExtenderStaticPath = path.join(imageExtenderNextPath, 'static');
const imageExtenderServerAppPath = path.join(
  imageExtenderNextPath,
  'server',
  'app'
);

const apiRoutes = new Map([
  ['/api/extend', 'extend'],
  ['/api/generate', 'generate'],
  ['/api/prop-brief', 'prop-brief'],
  ['/api/scene-brief', 'scene-brief'],
  ['/api/sprite-review', 'sprite-review'],
  ['/api/tile-review', 'tile-review'],
]);

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
    case '.svg':
      return 'image/svg+xml';
    case '.webp':
      return 'image/webp';
    case '.woff':
      return 'font/woff';
    case '.woff2':
      return 'font/woff2';
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

const getStaticFilePath = pathname => {
  if (pathname === '/' || pathname === '/index.html') {
    return path.join(imageExtenderServerAppPath, 'index.html');
  }

  if (pathname.startsWith('/_next/static/')) {
    const relativeStaticPath = pathname.replace('/_next/static/', '');
    return path.join(imageExtenderStaticPath, relativeStaticPath);
  }

  return path.join(imageExtenderServerAppPath, pathname);
};

const handleImageExtenderApiRequest = async (request, pathname) => {
  const routeName = apiRoutes.get(pathname);
  if (!routeName) {
    return new Response('Not found', { status: 404 });
  }

  const routePath = path.join(
    imageExtenderServerAppPath,
    'api',
    routeName,
    'route.js'
  );
  // Compiled Next route modules are bundled executable artifacts. Load them
  // lazily so opening the tool stays cheap until the first API request.
  const routeModule = require(routePath).routeModule;
  const handler = routeModule.userland[request.method.toUpperCase()];
  if (!handler) {
    return new Response('Method not allowed', { status: 405 });
  }

  return handler(request);
};

const handleImageExtenderProtocolRequest = async request => {
  try {
    const parsedUrl = new URL(request.url);
    const pathname = decodeURIComponent(parsedUrl.pathname || '/');

    if (pathname.startsWith('/api/')) {
      return handleImageExtenderApiRequest(request, pathname);
    }

    const filePath = getStaticFilePath(pathname);
    const allowedRoot = pathname.startsWith('/_next/static/')
      ? imageExtenderStaticPath
      : imageExtenderServerAppPath;

    if (!isPathInside(allowedRoot, filePath)) {
      return new Response('Forbidden', { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
      return createFileResponse(
        path.join(imageExtenderServerAppPath, '_not-found.html')
      );
    }

    return createFileResponse(filePath);
  } catch (error) {
    log.error('Image Extender protocol error:', error);
    return new Response('Image Extender failed to load.', { status: 500 });
  }
};

const registerImageExtenderProtocol = () => {
  if (isImageExtenderProtocolRegistered) return;

  protocol.handle(imageExtenderScheme, handleImageExtenderProtocolRequest);
  isImageExtenderProtocolRegistered = true;
};

const openImageExtenderWindow = async ({ parentWindow, devTools }) => {
  registerImageExtenderProtocol();

  if (imageExtenderWindow && !imageExtenderWindow.isDestroyed()) {
    imageExtenderWindow.focus();
    return { url: imageExtenderOrigin };
  }

  imageExtenderWindow = new BrowserWindow({
    parent: parentWindow || undefined,
    width: parentWindow ? Math.floor(parentWindow.getSize()[0] * 0.82) : 1200,
    height: parentWindow ? Math.floor(parentWindow.getSize()[1] * 0.9) : 860,
    backgroundColor: '#09090b',
    modal: false,
    center: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });
  imageExtenderWindow.setMenu(null);

  imageExtenderWindow.once('ready-to-show', () => {
    if (!imageExtenderWindow || imageExtenderWindow.isDestroyed()) return;
    imageExtenderWindow.show();
    if (devTools) imageExtenderWindow.webContents.openDevTools();
  });

  imageExtenderWindow.webContents.on('will-navigate', (event, nextUrl) => {
    if (nextUrl.startsWith(imageExtenderOrigin)) return;

    event.preventDefault();
    electron.shell.openExternal(nextUrl);
  });

  imageExtenderWindow.webContents.setWindowOpenHandler(details => {
    electron.shell.openExternal(details.url);
    return { action: 'deny' };
  });

  imageExtenderWindow.on('closed', () => {
    imageExtenderWindow = null;
  });

  await imageExtenderWindow.loadURL(`${imageExtenderOrigin}/index.html`);
  return { url: imageExtenderOrigin };
};

module.exports = {
  imageExtenderScheme,
  openImageExtenderWindow,
};
