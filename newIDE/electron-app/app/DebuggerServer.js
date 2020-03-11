const WebSocket = require('ws');
const log = require('electron-log');

let wsServer = null;
let webSockets = [];

const closeServer = () => {
  wsServer = null;
  webSockets = [];
};

/**
 * This module creates a WebSocket server listening for a connection
 * and simply forwards the messages.
 * Debugger logic is made inside Debugger (in newIDE) or websocket-debugger-client
 * (in GDJS).
 */
module.exports = {
  startDebuggerServer: options => {
    if (wsServer) {
      return options.onListening();
    }

    wsServer = new WebSocket.Server({ port: 3030 });
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

      options.onConnectionOpen({ id });
    });

    wsServer.on('listening', () => {
      log.info('Debugger listening for connections.');
      options.onListening();
    });

    wsServer.on('error', error => {
      log.error('Debugger server errored.');
      options.onError(error);
      closeServer();
    });
  },
  closeServer,
  sendMessage: ({ id, message }, cb) => {
    if (!webSockets[id]) return cb(`Debugger connection #${id} does not exist`);

    webSockets[id].send(message, err => {
      cb(err);
    });
  },
};