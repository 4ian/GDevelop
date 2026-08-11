const assert = require('assert');
const WebSocket = require('../app/node_modules/ws');

const {
  closeAllConnections,
  sendMessage,
  startDebuggerServer,
  stopAllServers,
} = require('../app/DebuggerServer');

const makeDebuggerServerOptions = state => ({
  onMessage: ({ id, message }) => {
    state.messages.push({ id, message });
  },
  onError: error => {
    state.errors.push(error);
  },
  onConnectionClose: ({ id }) => {
    state.closedIds.push(id);
  },
  onConnectionOpen: ({ id }) => {
    state.openedIds.push(id);
    const resolve = state.connectionResolvers.shift();
    if (resolve) resolve(id);
  },
  onConnectionError: ({ id, errorMessage }) => {
    state.errors.push(new Error(`${id}: ${errorMessage}`));
  },
  onListening: ({ address }) => {
    state.address = address;
    if (state.listeningResolver) state.listeningResolver(address);
  },
});

const waitForListening = state =>
  new Promise(resolve => {
    state.listeningResolver = resolve;
  });

const waitForNextConnection = state =>
  new Promise(resolve => {
    state.connectionResolvers.push(resolve);
  });

const openWebSocket = address =>
  new Promise((resolve, reject) => {
    const webSocket = new WebSocket(
      `ws://${address.address}:${address.port}`
    );
    webSocket.on('open', () => resolve(webSocket));
    webSocket.on('error', reject);
  });

const sendDebuggerMessage = (windowId, id, message) =>
  new Promise(resolve => {
    sendMessage(windowId, { id, message }, err => resolve(err));
  });

const run = async () => {
  const windowId = 'debugger-server-regression';
  const state = {
    address: null,
    closedIds: [],
    connectionResolvers: [],
    errors: [],
    listeningResolver: null,
    messages: [],
    openedIds: [],
  };

  try {
    const listeningPromise = waitForListening(state);
    startDebuggerServer(windowId, makeDebuggerServerOptions(state));
    const address = await listeningPromise;

    const firstConnectionPromise = waitForNextConnection(state);
    const firstWebSocket = await openWebSocket(address);
    const firstId = await firstConnectionPromise;
    assert.strictEqual(firstId, 'preview-ws-0');

    closeAllConnections(windowId);
    firstWebSocket.close();

    const secondConnectionPromise = waitForNextConnection(state);
    const secondWebSocket = await openWebSocket(address);
    const secondId = await secondConnectionPromise;
    assert.strictEqual(secondId, 'preview-ws-1');

    const receivedBySecondPreview = new Promise(resolve => {
      secondWebSocket.once('message', message => resolve(String(message)));
    });

    const err = await sendDebuggerMessage(
      windowId,
      secondId,
      JSON.stringify({ command: 'getStatus', messageId: 'after-close-all' })
    );
    assert.strictEqual(err, null);

    assert.deepStrictEqual(JSON.parse(await receivedBySecondPreview), {
      command: 'getStatus',
      messageId: 'after-close-all',
    });

    secondWebSocket.close();
  } finally {
    stopAllServers();
  }
};

run();
