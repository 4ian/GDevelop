const FiveServer = require('five-server').default;
const httpsConfiguration = require('./Utils/DevServerHttpsConfiguration.js');
const { getAvailablePort } = require('./Utils/AvailablePortFinder');

// Track servers per window ID
// Map<windowId, { serverParams, serverInstance }>
const serversByWindow = new Map();

module.exports = {
  /**
   * Start a server to serve a folder for a specific window
   */
  serveFolder: ({ root, useHttps, windowId }, onDone) => {
    // Check if this window already has a server for the same root
    const existingServer = serversByWindow.get(windowId);
    if (existingServer && existingServer.serverParams.root === root) {
      onDone(null, existingServer.serverParams);
      return;
    }

    // Stop any existing server for this window
    if (existingServer && existingServer.serverInstance) {
      existingServer.serverInstance.shutdown().catch(() => {
        // Ignore shutdown errors
      });
    }

    getAvailablePort(2929, 4000).then(
      port => {
        const serverParams = {
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

        const serverInstance = new FiveServer();
        serverInstance
          .start(serverParams)
          .then(() => {
            serversByWindow.set(windowId, { serverParams, serverInstance });
            onDone(null, serverParams);
          })
          .catch(err => {
            onDone(err);
          });
      },
      err => onDone(err)
    );
  },

  /**
   * Stop the server for a specific window
   */
  stopServer: (windowId, onDone) => {
    const server = serversByWindow.get(windowId);
    if (server && server.serverInstance) {
      server.serverInstance
        .shutdown()
        .then(() => {
          serversByWindow.delete(windowId);
          onDone();
        })
        .catch(err => {
          serversByWindow.delete(windowId);
          onDone(err);
        });
    } else {
      serversByWindow.delete(windowId);
      onDone();
    }
  },

  /**
   * Stop all servers (for cleanup on app quit)
   */
  stopAllServers: () => {
    serversByWindow.forEach((server, windowId) => {
      if (server && server.serverInstance) {
        server.serverInstance.shutdown().catch(() => {
          // Silently ignore errors during shutdown
        });
      }
    });
    serversByWindow.clear();
  },
};
