const FiveServer = require('five-server').default;
const httpsConfiguration = require('./Utils/DevServerHttpsConfiguration.js');
const { getAvailablePort } = require('./Utils/AvailablePortFinder');

/** @type {import("five-server").default} */
let serverInstance = null;
/** @type {import("five-server").LiveServerParams} */
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

    // Shutdown existing server if any
    if (serverInstance) {
      serverInstance.shutdown().catch(() => {
        // Ignore shutdown errors
      });
    }

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

        serverInstance = new FiveServer();
        serverInstance
          .start(currentServerParams)
          .then(() => {
            onDone(null, currentServerParams);
          })
          .catch(err => {
            onDone(err);
          });
      },
      err => onDone(err)
    );
  },

  /**
   * Stop any running server
   */
  stopServer: onDone => {
    if (serverInstance) {
      serverInstance
        .shutdown()
        .then(() => {
          serverInstance = null;
          currentServerParams = null;
          onDone();
        })
        .catch(err => {
          serverInstance = null;
          currentServerParams = null;
          onDone(err);
        });
    } else {
      currentServerParams = null;
      onDone();
    }
  },
};
