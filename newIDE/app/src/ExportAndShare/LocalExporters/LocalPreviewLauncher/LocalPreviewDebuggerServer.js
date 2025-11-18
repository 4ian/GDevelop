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
let embeddedGameFrameWindow: WindowProxy | null = null;
let previewOrigin: string | null = null;

const getExistingDebuggerIds = (): Array<DebuggerId> => [
  ...(embeddedGameFrameWindow ? ['embedded-game-frame'] : []),
  ...debuggerIds,
];

const getDebuggerIdForPreviewWindow = (
  previewWindow: any
): DebuggerId | null => {
  if (embeddedGameFrameWindow && embeddedGameFrameWindow === previewWindow) {
    return 'embedded-game-frame';
  }
  return null;
};

const notifyConnectionClosed = (id: DebuggerId) => {
  callbacksList.forEach(({ onConnectionClosed }) =>
    onConnectionClosed({
      id,
      debuggerIds: getExistingDebuggerIds(),
    })
  );
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
  startServer({ origin }: { origin?: string } = {}) {
    if (!ipcRenderer) return Promise.reject();
    if (debuggerServerState === 'started') return Promise.resolve();

    // Store the origin for window message communication
    if (origin) {
      previewOrigin = origin;
    }

    // Set up window message listener for embedded game frame communication
    window.addEventListener('message', event => {
      // For local previews using file:// protocol, origin may be "null"
      // or for http/https it should match previewOrigin
      if (previewOrigin && event.origin !== previewOrigin && event.origin !== 'null') {
        return;
      }

      const id = getDebuggerIdForPreviewWindow(event.source);
      if (id === null) return; // Could not find the id of this preview window.

      try {
        const parsedMessage = JSON.parse(event.data);
        const answerCallback = responseCallbacks.get(parsedMessage.messageId);
        if (answerCallback) {
          answerCallback(parsedMessage);
          responseCallbacks.delete(parsedMessage.messageId);
        }
        callbacksList.forEach(({ onHandleParsedMessage }) =>
          onHandleParsedMessage({ id, parsedMessage })
        );
      } catch (error) {
        console.error(
          'Error while parsing messages coming from embedded game frame:',
          error
        );
      }
    });

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

      ipcRenderer.on('debugger-connection-closed', (event, { id }) => {
        const debuggerIdIndex = debuggerIds.indexOf(id);
        if (debuggerIdIndex !== -1) debuggerIds.splice(debuggerIdIndex, 1);

        callbacksList.forEach(({ onConnectionClosed }) =>
          onConnectionClosed({
            id,
            debuggerIds,
          })
        );
      });

      ipcRenderer.on('debugger-connection-opened', (event, { id }) => {
        debuggerIds.push(id);
        callbacksList.forEach(({ onConnectionOpened }) =>
          onConnectionOpened({
            id,
            debuggerIds,
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

        if (parsedMessage && parsedMessage.messageId) {
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
    if (debuggerServerState === 'stopped') {
      console.error('Cannot send message when debugger server is stopped.');
      return;
    }

    // Handle embedded game frame communication via postMessage
    if (id === 'embedded-game-frame' && embeddedGameFrameWindow) {
      try {
        embeddedGameFrameWindow.postMessage(message, previewOrigin || '*');
      } catch (error) {
        console.error(
          'Unable to send a message to the embedded game frame:',
          error
        );
      }
      return;
    }

    // Handle regular preview windows via websocket (through IPC)
    if (!ipcRenderer) return;
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
  getServerState() {
    return debuggerServerState;
  }
  getExistingDebuggerIds() {
    return getExistingDebuggerIds();
  }
  registerCallbacks(callbacks: PreviewDebuggerServerCallbacks) {
    callbacksList.push(callbacks);

    return () => {
      const callbacksIndex = callbacksList.indexOf(callbacks);
      if (callbacksIndex !== -1) callbacksList.splice(callbacksIndex, 1);
    };
  }
  registerEmbeddedGameFrame(window: WindowProxy) {
    if (window === embeddedGameFrameWindow) return;

    console.info(
      'Registered the embedded game frame window in the local preview debugger server.'
    );
    embeddedGameFrameWindow = window;
  }
  unregisterEmbeddedGameFrame(window: WindowProxy) {
    if (embeddedGameFrameWindow !== window) {
      if (!!embeddedGameFrameWindow) {
        console.warn(
          'The embedded game frame window to unregister is not the same as the one registered. Ignoring the unregistration.'
        );
      }
      return;
    }

    console.info(
      'Unregistered the embedded game frame window in the local preview debugger server.'
    );
    embeddedGameFrameWindow = null;
    notifyConnectionClosed('embedded-game-frame');
  }
  closeAllConnections() {
    const previousDebuggerIds = [...debuggerIds];
    debuggerIds.length = 0;

    previousDebuggerIds.forEach(id => {
      callbacksList.forEach(({ onConnectionClosed }) =>
        onConnectionClosed({
          id,
          debuggerIds: getExistingDebuggerIds(),
        })
      );
    });

    if (embeddedGameFrameWindow) {
      embeddedGameFrameWindow = null;
      notifyConnectionClosed('embedded-game-frame');
    }

    responseCallbacks.clear();

    if (ipcRenderer && previousDebuggerIds.length) {
      ipcRenderer.send('debugger-close-all-connections');
    }
  }
}

export const localPreviewDebuggerServer: PreviewDebuggerServer = new LocalPreviewDebuggerServer();

export const getDebuggerServerAddress = (): ?ServerAddress =>
  debuggerServerAddress;
