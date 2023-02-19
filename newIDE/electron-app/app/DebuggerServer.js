const WebSocket = require('ws');
const { getAvailablePort } = require('./Utils/AvailablePortFinder');
const log = require('electron-log');
const { findLocalIp } = require('./Utils/LocalNetworkIpFinder');

let wsServer = null;
let webSockets = [];

const closeServer = () => {
  wsServer = null;
  webSockets = [];
};

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
  startDebuggerServer: options => {
    if (wsServer) {
      return options.onListening({ address: getServerAddress(wsServer) });
    }

    getAvailablePort(3030, 4000).then(
      port => {
        wsServer = new WebSocket.Server({ port });
        webSockets = [];

        wsServer.on('connection', function connection(newWebSocket) {
          const id = webSockets.length;
          webSockets.push(newWebSocket);
          log.info(`Debugger connection #${id} opened.`);

          newWebSocket.on('message', message => {
            log.info(`Debugger connection #${id} received message.`);
            options.onMessage({ id, message });
          });

          newWebSocket.on('close', () => {
            log.info(`Debugger connection #${id} closed.`);
            webSockets[id] = null;
            options.onConnectionClose({ id });
          });

          newWebSocket.on('error', error => {
            const errorMessage = error.message || 'Unknown error';
            log.error(`Error in debugger connection #${id}: ${errorMessage}.`);
            options.onConnectionError({ id, errorMessage });
          });

          options.onConnectionOpen({ id });
        });

        wsServer.on('listening', () => {
          log.info('Debugger listening for connections.');
          options.onListening({ address: getServerAddress(wsServer) });
        });

        wsServer.on('error', error => {
          log.error('Debugger server errored.');
          options.onError(error);
          closeServer();
        });
      },
      err => {
        log.error('Could not find a port for the Debugger server.');
        options.onError(err);
      }
    );
  },
  closeServer,
  sendMessage: ({ id, message }, cb) => {
    if (!webSockets[id]) return cb(`Debugger connection #${id} does not exist`);

    webSockets[id].send(message, err => {
      cb(err);
    });
  },
};
