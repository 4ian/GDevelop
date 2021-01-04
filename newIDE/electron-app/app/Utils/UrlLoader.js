const { protocol } = require('electron');
const fs = require('fs');
const path = require('path');

const developmentServerBaseUrl = 'http://localhost:3000';
const appPublicFolderBaseUrl = path.join(__dirname + '/../www');

/**
 * Load the given path, relative to the app public folder.
 */
const load = ({ isDev, devTools, path, window }) => {
  if (isDev) {
    // Development (server hosted by npm run start)
    window.loadURL(developmentServerBaseUrl + path);
    window.openDevTools();
  } else {
    // Production (with npm run build)
    window.loadURL('file://' + appPublicFolderBaseUrl + path);
    if (devTools) window.openDevTools();
  }
};

/**
 * Register gdide:// scheme to load JavaScript files in Electron.
 * Useful in particular for HTML modules support (where file:// protocol is not supported).
 */
const registerGdideProtocol = ({ isDev }) => {
  if (isDev) {
    protocol.registerHttpProtocol('gdide', (request, callback) => {
      callback({
        method: request.method,
        referrer: request.referrer,
        url: request.url.replace('gdide://', developmentServerBaseUrl + '/'),
      });
    });
  } else {
    // Production (with npm run build)
    protocol.registerBufferProtocol('gdide', (request, callback) => {
      fs.readFile(
        request.url.replace('gdide://', appPublicFolderBaseUrl + '/'),
        (error, buffer) => {
          if (error) {
            console.error('While while loading ' + request.url, error);
          }
          callback({ mimeType: 'text/javascript', data: buffer });
        }
      );
    });
  }

  const isRegistered = protocol.isProtocolRegistered('gdide');
  if (!isRegistered) console.error('Error while registering gdide protocol.');
};

module.exports = {
  load,
  registerGdideProtocol,
};
