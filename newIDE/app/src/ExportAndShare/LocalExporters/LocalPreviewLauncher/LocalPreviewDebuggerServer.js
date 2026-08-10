// @flow
import optionalRequire from '../../../Utils/OptionalRequire';
import {
  type PreviewDebuggerServerCallbacks,
  type PreviewDebuggerServer,
  type DebuggerId,
  type ServerAddress,
} from '../../PreviewLauncher.flow';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

let debuggerServerState: 'started' | 'stopped' = 'stopped';
let debuggerServerAddress: ?ServerAddress = null;
const callbacksList: Array<PreviewDebuggerServerCallbacks> = [];
const debuggerIds: Array<DebuggerId> = [];
const responseCallbacks = new Map<number, (value: Object) => void>();
let nextMessageWithResponseId = 1;
const recentLogsByDebuggerId: { [DebuggerId]: Array<Object> } = {};
const maxRecentLogsPerDebugger = 200;
const connectionInfoByDebuggerId: { [DebuggerId]: Object } = {};
const lastConnectionInfoByDebuggerId: { [DebuggerId]: Object } = {};

let embeddedGameFrameWindow: WindowProxy | null = null;
let gameplayTestFrameWindow: WindowProxy | null = null;
let isWindowMessageListenerRegistered = false;

const hasDebuggerId = (id: DebuggerId): boolean =>
  id === 'embedded-game-frame'
    ? !!embeddedGameFrameWindow
    : debuggerIds.indexOf(id) !== -1;

const getExistingDebuggerIds = (): Array<DebuggerId> => [
  ...getExistingEmbeddedGameFrameDebuggerIds(),
  ...getExistingGameplayTestFrameDebuggerIds(),
  ...getExistingPreviewDebuggerIds(),
];

const getExistingEmbeddedGameFrameDebuggerIds = (): Array<DebuggerId> =>
  embeddedGameFrameWindow ? ['embedded-game-frame'] : [];

const getExistingGameplayTestFrameDebuggerIds = (): Array<DebuggerId> =>
  gameplayTestFrameWindow ? ['gameplay-test-frame'] : [];

const getExistingPreviewDebuggerIds = (): Array<DebuggerId> => debuggerIds;

const handleParsedMessage = (
  id: DebuggerId,
  parsedMessage: Object | null
): void => {
  if (!parsedMessage) return;
  if (!hasDebuggerId(id)) {
    console.warn(
      `Ignoring message from closed or unknown preview debugger id "${id}".`
    );
    return;
  }
  if (connectionInfoByDebuggerId[id]) {
    connectionInfoByDebuggerId[id].lastSeenAt = new Date().toISOString();
    connectionInfoByDebuggerId[id].lastCommand = parsedMessage.command;
  }

  if (
    parsedMessage.command === 'console.log' ||
    parsedMessage.command === 'hotReloader.logs' ||
    parsedMessage.command === 'uncaughtException' ||
    parsedMessage.command === 'game.crashed'
  ) {
    const recentLogs = recentLogsByDebuggerId[id] || [];
    recentLogs.push(parsedMessage);
    if (recentLogs.length > maxRecentLogsPerDebugger) {
      recentLogs.splice(0, recentLogs.length - maxRecentLogsPerDebugger);
    }
    recentLogsByDebuggerId[id] = recentLogs;
  }

  if (parsedMessage.messageId) {
    const answerCallback = responseCallbacks.get(parsedMessage.messageId);
    if (answerCallback) {
      answerCallback(parsedMessage);
      responseCallbacks.delete(parsedMessage.messageId);
    } else {
      console.warn(
        `Discarding response for messageId=${
          parsedMessage.messageId
        } - already handled or invalid id.`
      );
    }
  }

  callbacksList.forEach(({ onHandleParsedMessage }) =>
    onHandleParsedMessage({ id, parsedMessage })
  );
};

const notifyConnectionClosed = (id: DebuggerId, reason?: ?Object) => {
  const existing = connectionInfoByDebuggerId[id] || {
    debuggerId: id,
  };
  const closedInfo = {
    ...existing,
    connected: false,
    closedAt: new Date().toISOString(),
    disconnectReason:
      (reason && (reason.errorMessage || reason.reason)) || 'connection-closed',
    ...(reason || {}),
  };
  lastConnectionInfoByDebuggerId[id] = closedInfo;
  delete connectionInfoByDebuggerId[id];
  callbacksList.forEach(({ onConnectionClosed }) =>
    onConnectionClosed({
      id,
      debuggerIds: getExistingDebuggerIds(),
      connectionInfo: closedInfo,
    })
  );
};

const removeDebuggerId = (id: DebuggerId): boolean => {
  const debuggerIdIndex = debuggerIds.indexOf(id);
  if (debuggerIdIndex === -1) return false;
  debuggerIds.splice(debuggerIdIndex, 1);
  delete recentLogsByDebuggerId[id];
  return true;
};

const removeServerListeners = () => {
  if (!ipcRenderer) return;

  ipcRenderer.removeAllListeners('debugger-send-message-done');
  ipcRenderer.removeAllListeners('debugger-error-received');
  ipcRenderer.removeAllListeners('debugger-connection-closed');
  ipcRenderer.removeAllListeners('debugger-connection-opened');
  ipcRenderer.removeAllListeners('debugger-connection-errored');
  ipcRenderer.removeAllListeners('debugger-start-server-done');
  ipcRenderer.removeAllListeners('debugger-message-received');
};

/**
 * A debugger server implemented using Electron (this one is just a bridge to it,
 * communicating through events with it).
 */
class LocalPreviewDebuggerServer {
  // $FlowFixMe[missing-local-annot]
  startServer() {
    if (!ipcRenderer) return Promise.reject();
    if (debuggerServerState === 'started') return Promise.resolve();

    if (!isWindowMessageListenerRegistered) {
      window.addEventListener('message', event => {
        const id =
          embeddedGameFrameWindow && event.source === embeddedGameFrameWindow
            ? 'embedded-game-frame'
            : gameplayTestFrameWindow &&
              event.source === gameplayTestFrameWindow
            ? 'gameplay-test-frame'
            : null;
        if (!id) return;

        let parsedMessage = null;
        try {
          parsedMessage = JSON.parse(event.data);
        } catch (error) {
          console.warn(
            'Error while parsing a message received from an embedded frame:',
            error
          );
        }

        handleParsedMessage(id, parsedMessage);
      });
      isWindowMessageListenerRegistered = true;
    }

    const serverStartPromise = new Promise((resolve, reject) => {
      let serverStartPromiseCompleted = false;
      debuggerServerState = 'stopped';
      debuggerServerAddress = null;
      removeServerListeners();

      ipcRenderer.on('debugger-error-received', (event, err) => {
        if (!serverStartPromiseCompleted) {
          reject(err);
          serverStartPromiseCompleted = true;
        }

        callbacksList.forEach(({ onErrorReceived }) => onErrorReceived(err));
      });

      ipcRenderer.on('debugger-send-message-done', (event, result) => {
        const id =
          result && typeof result === 'object' && typeof result.id === 'string'
            ? result.id
            : '';
        const errorMessage =
          result &&
          typeof result === 'object' &&
          typeof result.errorMessage === 'string'
            ? result.errorMessage
            : typeof result === 'string'
            ? result
            : null;
        if (!errorMessage) return;

        const wasConnected = id ? removeDebuggerId(id) : false;
        callbacksList.forEach(({ onConnectionErrored }) =>
          onConnectionErrored({
            id,
            errorMessage,
          })
        );
        if (id && wasConnected)
          notifyConnectionClosed(id, {
            reason: 'send-message-failed',
            errorMessage,
          });
      });

      ipcRenderer.on('debugger-connection-closed', (event, details) => {
        const { id } = details;
        removeDebuggerId(id);
        notifyConnectionClosed(id, details);
      });

      ipcRenderer.on('debugger-connection-opened', (event, details) => {
        const { id } = details;
        debuggerIds.push(id);
        recentLogsByDebuggerId[id] = [];
        connectionInfoByDebuggerId[id] = {
          ...details,
          debuggerId: id,
          connected: true,
          connectedAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        };
        callbacksList.forEach(({ onConnectionOpened }) =>
          onConnectionOpened({
            id,
            debuggerIds: getExistingDebuggerIds(),
          })
        );
      });

      ipcRenderer.on(
        'debugger-connection-errored',
        (event, { id, errorMessage }) => {
          callbacksList.forEach(({ onConnectionErrored }) =>
            onConnectionErrored({
              id,
              errorMessage,
            })
          );
        }
      );

      ipcRenderer.on('debugger-start-server-done', (event, { address }) => {
        console.info('Local preview debugger started');
        debuggerServerState = 'started';
        debuggerServerAddress = address;
        if (!serverStartPromiseCompleted) {
          resolve();
          serverStartPromiseCompleted = true;
        }

        callbacksList.forEach(({ onServerStateChanged }) =>
          onServerStateChanged()
        );
      });

      ipcRenderer.on('debugger-message-received', (event, { id, message }) => {
        let parsedMessage = null;
        try {
          parsedMessage = JSON.parse(message);
        } catch (e) {
          console.warn(
            'Error while parsing message received from debugger client:',
            e
          );
        }

        handleParsedMessage(id, parsedMessage);
      });
      ipcRenderer.send('debugger-start-server');
    });

    // Consider the start of the server as a failure if not completed/errored
    // after 5s.
    const serverStartTimeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            'Debugger server not started or errored after 5s - aborting.'
          )
        );
      }, 5000);
    });
    return Promise.race([serverStartPromise, serverStartTimeoutPromise]);
  }
  sendMessage(id: DebuggerId, message: Object) {
    if (id === 'embedded-game-frame') {
      if (!embeddedGameFrameWindow) {
        console.error(
          'Cannot send message to the embedded game frame as it is not registered.'
        );
        return;
      }

      embeddedGameFrameWindow.postMessage(message, '*');
      return;
    }
    if (id === 'gameplay-test-frame') {
      if (!gameplayTestFrameWindow) {
        console.error(
          'Cannot send message to the gameplay test frame as it is not registered.'
        );
        return;
      }

      gameplayTestFrameWindow.postMessage(message, '*');
      return;
    }

    if (!ipcRenderer) return;
    if (debuggerServerState === 'stopped') {
      console.error('Cannot send message when debugger server is stopped.');
      return;
    }

    ipcRenderer.send('debugger-send-message', {
      id,
      message: JSON.stringify(message),
    });
  }
  sendMessageWithResponse(message: Object): Promise<Object> {
    const messageId = nextMessageWithResponseId;
    nextMessageWithResponseId++;
    for (const id of getExistingDebuggerIds()) {
      this.sendMessage(id, { ...message, messageId });
    }

    const timeout = 1000;
    const promise = new Promise<Object>((resolve, reject) => {
      responseCallbacks.set(messageId, resolve);
      setTimeout(() => {
        reject(
          new Error(
            `Timeout while waiting for response from the debugger(s) for message with id ${messageId}.`
          )
        );
        responseCallbacks.delete(messageId);
      }, timeout);
    });
    return promise;
  }
  getServerState(): 'started' | 'stopped' {
    return debuggerServerState;
  }
  getExistingDebuggerIds(): Array<DebuggerId> {
    return getExistingDebuggerIds();
  }
  getExistingEmbeddedGameFrameDebuggerIds(): Array<DebuggerId> {
    return getExistingEmbeddedGameFrameDebuggerIds();
  }
  getExistingPreviewDebuggerIds(): Array<DebuggerId> {
    return getExistingPreviewDebuggerIds();
  }
  // $FlowFixMe[missing-local-annot]
  getRecentLogs(id: DebuggerId) {
    return [...(recentLogsByDebuggerId[id] || [])];
  }
  getConnectionInfo(id: DebuggerId): ?Object {
    return (
      connectionInfoByDebuggerId[id] ||
      lastConnectionInfoByDebuggerId[id] ||
      null
    );
  }
  getLastConnectionInfo(): ?Object {
    const closedConnections = Object.keys(lastConnectionInfoByDebuggerId)
      .map(id => lastConnectionInfoByDebuggerId[id])
      .filter(Boolean)
      .sort((left, right) =>
        String(right.closedAt || '').localeCompare(String(left.closedAt || ''))
      );
    return closedConnections[0] || null;
  }
  // $FlowFixMe[missing-local-annot]
  registerCallbacks(callbacks: PreviewDebuggerServerCallbacks) {
    callbacksList.push(callbacks);

    return () => {
      const callbacksIndex = callbacksList.indexOf(callbacks);
      if (callbacksIndex !== -1) callbacksList.splice(callbacksIndex, 1);
    };
  }
  registerEmbeddedGameFrame(embeddedWindow: WindowProxy) {
    if (embeddedWindow === embeddedGameFrameWindow) return;

    if (embeddedGameFrameWindow) {
      console.warn(
        'An embedded game frame window was already registered. It will be replaced by the new one.'
      );
    }

    embeddedGameFrameWindow = embeddedWindow;
    recentLogsByDebuggerId['embedded-game-frame'] = [];
    connectionInfoByDebuggerId['embedded-game-frame'] = {
      debuggerId: 'embedded-game-frame',
      connected: true,
      connectedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      windowType: 'embedded-game-frame',
    };
    callbacksList.forEach(({ onConnectionOpened }) =>
      onConnectionOpened({
        id: 'embedded-game-frame',
        debuggerIds: getExistingDebuggerIds(),
      })
    );
  }
  unregisterEmbeddedGameFrame(embeddedWindow: WindowProxy) {
    if (embeddedGameFrameWindow !== embeddedWindow) {
      if (!!embeddedGameFrameWindow) {
        console.warn(
          'The embedded game frame window to unregister is not the same as the one registered. Ignoring the unregistration.'
        );
      }
      return;
    }

    embeddedGameFrameWindow = null;
    delete recentLogsByDebuggerId['embedded-game-frame'];
    notifyConnectionClosed('embedded-game-frame', {
      reason: 'embedded-frame-unregistered',
    });
  }
  registerGameplayTestFrame(embeddedWindow: WindowProxy) {
    if (embeddedWindow === gameplayTestFrameWindow) return;

    if (gameplayTestFrameWindow) {
      console.warn(
        'A gameplay test frame window was already registered. It will be replaced by the new one.'
      );
    }

    gameplayTestFrameWindow = embeddedWindow;
    callbacksList.forEach(({ onConnectionOpened }) =>
      onConnectionOpened({
        id: 'gameplay-test-frame',
        debuggerIds: getExistingDebuggerIds(),
      })
    );
  }
  unregisterGameplayTestFrame(embeddedWindow: WindowProxy) {
    if (gameplayTestFrameWindow !== embeddedWindow) {
      if (!!gameplayTestFrameWindow) {
        console.warn(
          'The gameplay test frame window to unregister is not the same as the one registered. Ignoring the unregistration.'
        );
      }
      return;
    }

    gameplayTestFrameWindow = null;
    notifyConnectionClosed('gameplay-test-frame');
  }
  closeAllPreviewConnections() {
    const previousDebuggerIds = [...debuggerIds];
    debuggerIds.length = 0;

    previousDebuggerIds.forEach(id => {
      delete recentLogsByDebuggerId[id];
      notifyConnectionClosed(id, { reason: 'closed-by-editor' });
    });

    responseCallbacks.clear();

    // The main process can still have websocket connections even when the
    // renderer-side list is empty (for example after a renderer reload or a
    // missed close event). Always ask it to close its side of the bridge.
    if (ipcRenderer) {
      ipcRenderer.send('debugger-close-all-connections');
    }
  }

  closeAllConnections() {
    this.closeAllPreviewConnections();
    if (embeddedGameFrameWindow) {
      embeddedGameFrameWindow = null;
      delete recentLogsByDebuggerId['embedded-game-frame'];
      notifyConnectionClosed('embedded-game-frame', {
        reason: 'closed-by-editor',
      });
    }

    if (gameplayTestFrameWindow) {
      gameplayTestFrameWindow = null;
      notifyConnectionClosed('gameplay-test-frame');
    }
  }
}

export const localPreviewDebuggerServer: PreviewDebuggerServer = new LocalPreviewDebuggerServer();

export const getDebuggerServerAddress = (): ?ServerAddress =>
  debuggerServerAddress;
