const WebSocket = require('ws');
const { getAvailablePort } = require('./Utils/AvailablePortFinder');
const log = require('electron-log');
const { findLocalIp } = require('./Utils/LocalNetworkIpFinder');

// Track servers per window ID
// Map<windowId, { wsServer, webSockets, nextDebuggerId, callbackHandlers }>
const serversByWindow = new Map();

/** @param {WebSocket.Server} wsServer */
const getServerAddress = wsServer => ({
  address: findLocalIp() || '127.0.0.1',
  port: wsServer.address().port,
});

/**
 * This module creates a WebSocket server listening for a connection
 * and simply forwards the messages.
 * Debugger logic is made inside Debugger (in newIDE) or gdjs.AbstractDebuggerClient
 * (in GDJS).
 */
module.exports = {
  startDebuggerServer: (windowId, options) => {
    const existingServer = serversByWindow.get(windowId);

    if (existingServer) {
      // Server already exists for this window, just call onListening
      return options.onListening({
        address: getServerAddress(existingServer.wsServer),
      });
    }

    getAvailablePort(3030, 4000).then(
      port => {
        const wsServer = new WebSocket.Server({ port });
        const webSockets = {};
        let nextDebuggerId = 0;

        serversByWindow.set(windowId, {
          wsServer,
          webSockets,
          nextDebuggerId,
          callbackHandlers: options,
        });

        wsServer.on('connection', function connection(newWebSocket) {
          const id = 'preview-ws-' + nextDebuggerId++;
          webSockets[id] = newWebSocket;
          log.info(
            `Debugger connection with id "${id}" opened for window ${windowId}.`
          );

          newWebSocket.on('message', message => {
            // log.info(`Debugger connection with id "${id}" received message.`);
            options.onMessage({ id, message });
          });

          newWebSocket.on('close', () => {
            log.info(
              `Debugger connection with id "${id}" closed for window ${windowId}.`
            );
            webSockets[id] = null;
            options.onConnectionClose({ id });
          });

          newWebSocket.on('error', error => {
            const errorMessage = error.message || 'Unknown error';
            log.error(
              `Error in debugger connection with id "${id}" for window ${windowId}: ${errorMessage}.`
            );
            options.onConnectionError({ id, errorMessage });
          });

          options.onConnectionOpen({ id });
        });

        wsServer.on('listening', () => {
          log.info(
            `Debugger listening for connections for window ${windowId}.`
          );
          options.onListening({ address: getServerAddress(wsServer) });
        });

        wsServer.on('error', error => {
          log.error(`Debugger server errored for window ${windowId}.`);
          options.onError(error);
          module.exports.closeServer(windowId);
        });
      },
      err => {
        log.error(
          `Could not find a port for the Debugger server for window ${windowId}.`
        );
        options.onError(err);
      }
    );
  },

  closeServer: windowId => {
    const serverData = serversByWindow.get(windowId);
    if (serverData && serverData.wsServer) {
      try {
        serverData.wsServer.close();
      } catch (e) {
        log.warn(`Error closing debugger server for window ${windowId}:`, e);
      }
    }
    serversByWindow.delete(windowId);
  },

  closeAllConnections: windowId => {
    const serverData = serversByWindow.get(windowId);
    if (!serverData) return;

    Object.keys(serverData.webSockets).forEach(id => {
      const webSocket = serverData.webSockets[id];
      if (!webSocket) return;

      try {
        webSocket.close();
      } catch (error) {
        log.warn(
          `Unable to close debugger connection with id "${id}" for window ${windowId}: ${error.message ||
            error}`
        );
      }
    });

    serverData.webSockets = {};
  },

  sendMessage: (windowId, { id, message }, cb) => {
    const serverData = serversByWindow.get(windowId);
    if (!serverData) {
      return cb(`No debugger server for window ${windowId}`);
    }

    if (!serverData.webSockets[id]) {
      return cb(
        `Debugger connection with id "${id}" does not exist for window ${windowId}`
      );
    }

    serverData.webSockets[id].send(message, err => {
      cb(err);
    });
  },

  /**
   * Stop all debugger servers (for cleanup on app quit)
   */
  stopAllServers: () => {
    serversByWindow.forEach((serverData, windowId) => {
      if (serverData && serverData.wsServer) {
        try {
          // Close all websocket connections first
          if (serverData.webSockets) {
            Object.keys(serverData.webSockets).forEach(id => {
              const ws = serverData.webSockets[id];
              if (ws) {
                try {
                  ws.close();
                } catch (e) {
                  // Silently ignore errors during shutdown
                }
              }
            });
          }
          // Then close the server
          serverData.wsServer.close(() => {
            // Callback intentionally empty - we're shutting down
          });
        } catch (e) {
          // Silently ignore errors during shutdown to prevent crashes
        }
      }
    });
    serversByWindow.clear();
  },
};
