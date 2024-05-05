const liveServer = require('live-server');
const httpsConfiguration = require('./Utils/DevServerHttpsConfiguration.js');
const { getAvailablePort } = require('./Utils/AvailablePortFinder');

/** @type {import("live-server").LiveServerParams} */
let currentServerParams = null;

module.exports = {
  /**
   * Start a server to serve a folder
   */
  serveFolder: ({ root, useHttps }, onDone) => {
    if (currentServerParams && currentServerParams.root === root) {
      onDone(null, currentServerParams);
      return;
    }

    liveServer.shutdown();
    getAvailablePort(2929, 4000).then(
      port => {
        currentServerParams = {
          port,
          root,
          open: false,
          wait: 1000,
          https: useHttps ? httpsConfiguration : undefined,
          // Disable the "live-reloading" by watching nothing, because
          // the hot-reloading built into the game engine is what should
          // be used - and the user can still reload manually on its browser.
          watch: [],
          middleware: [
            // Disable caching, as it can lead to older generated code being served
            // in case preview files are proxied through a CDN (see 
            // https://github.com/4ian/GDevelop/pull/6553 for example)
            function noCache(_, res, next) {
              res.setHeader('Surrogate-Control', 'no-store');
              res.setHeader(
                'Cache-Control',
                'no-store, no-cache, must-revalidate, proxy-revalidate'
              );
              res.setHeader('Expires', '0');

              next();
            },
          ],
        };
        liveServer.start(currentServerParams);
        onDone(null, currentServerParams);
      },
      err => onDone(err)
    );
  },

  /**
   * Stop any running server
   */
  stopServer: onDone => {
    liveServer.shutdown();
    currentServerParams = null;

    onDone();
  },
};
