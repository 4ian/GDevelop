const liveServer = require('live-server');
const httpsConfiguration = require('./Utils/DevServerHttpsConfiguration.js');
const { getAvailablePort } = require('./Utils/AvailablePortFinder');

// Track servers per window ID
// Map<windowId, { serverParams, httpServer }>
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
    if (existingServer && existingServer.httpServer) {
      try {
        existingServer.httpServer.close();
      } catch (e) {
        console.warn('Error closing existing server:', e);
      }
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

        // Create a new server instance using built-in modules
        const http = serverParams.https ? require('https') : require('http');
        const fs = require('fs');
        const path = require('path');
        const url = require('url');

        const requestHandler = (req, res) => {
          // Apply no-cache middleware
          res.setHeader('Surrogate-Control', 'no-store');
          res.setHeader(
            'Cache-Control',
            'no-store, no-cache, must-revalidate, proxy-revalidate'
          );
          res.setHeader('Expires', '0');

          // Parse URL and serve file
          const parsedUrl = url.parse(req.url);
          let pathname = decodeURIComponent(parsedUrl.pathname);

          // Default to index.html for directory requests
          if (pathname.endsWith('/')) {
            pathname += 'index.html';
          }

          const filePath = path.join(root, pathname);

          fs.readFile(filePath, (err, data) => {
            if (err) {
              res.writeHead(404);
              res.end('Not Found');
              return;
            }

            // Determine content type
            const ext = path.extname(filePath);
            const contentTypes = {
              '.html': 'text/html',
              '.js': 'text/javascript',
              '.css': 'text/css',
              '.json': 'application/json',
              '.png': 'image/png',
              '.jpg': 'image/jpg',
              '.gif': 'image/gif',
              '.svg': 'image/svg+xml',
              '.wav': 'audio/wav',
              '.mp3': 'audio/mpeg',
              '.mp4': 'video/mp4',
              '.woff': 'font/woff',
              '.woff2': 'font/woff2',
              '.ttf': 'font/ttf',
            };

            res.writeHead(200, {
              'Content-Type': contentTypes[ext] || 'application/octet-stream',
            });
            res.end(data);
          });
        };

        const httpServer = serverParams.https
          ? http.createServer(serverParams.https, requestHandler)
          : http.createServer(requestHandler);

        httpServer.listen(port, err => {
          if (err) {
            onDone(err);
            return;
          }

          serversByWindow.set(windowId, { serverParams, httpServer });
          onDone(null, serverParams);
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
    if (server && server.httpServer) {
      server.httpServer.close(err => {
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
      if (server && server.httpServer) {
        try {
          // Force close all connections immediately if method exists (Node 18.2+)
          if (server.httpServer.listening) {
            if (typeof server.httpServer.closeAllConnections === 'function') {
              server.httpServer.closeAllConnections();
            }
            server.httpServer.close(() => {
              // Callback intentionally empty - we're shutting down
            });
          }
        } catch (e) {
          // Silently ignore errors during shutdown to prevent crashes
        }
      }
    });
    serversByWindow.clear();
  },
};
