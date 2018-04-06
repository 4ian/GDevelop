const WebSocket = require('ws');
const log = require('electron-log');

let wsServer = null;
let webSocket = null;

const closeServer = () => {
  wsServer = null;
  webSocket = null;
}

/**
 * This module creates a WebSocket server listening for a connection
 * and simply forwards the messages.
 * Debugger logic is made inside Debugger (in newIDE) or websocket-debugger-client
 * (in GDJS).
 */
module.exports = {
  startDebuggerServer: (options) => {
    if (wsServer) {
      return options.onListening();
    }

    wsServer = new WebSocket.Server({ port: 3030 });
    webSocket = null;

    wsServer.on('connection', function connection(newWebSocket) {
      if (webSocket) {
        log.warn(
          'New connection to debugger was made while there is already one.'
        );
        log.info('Only one game is supported by the debugger server.');
        return;
      }
      webSocket = newWebSocket;

      webSocket.on('message', message => {
        log.info("Debugger received message");
        options.onMessage(message);
      });

      webSocket.on('close', () => {
        log.info('Debugger connection closed');
        options.onConnectionClose();
        webSocket = null;
      });

      options.onConnectionOpen();
    });

    wsServer.on('listening', () => {
      log.info('Debugger listening for connections');
      options.onListening();
    });

    wsServer.on('error', error => {
      log.error('Debugger server errored');
      options.onError(error);
      closeServer();
    });
  },
  closeServer,
  sendMessage: (message, cb) => {
    if (!webSocket) return cb('Debugger server not started');

    webSocket.send(message, err => {
      cb(err);
    });
  },
};
