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
const EMBEDDED_GAME_FRAME_DEBUGGER_ID: DebuggerId = 'embedded-game-frame';
let isMessageListenerAdded: boolean = false;

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

// Handle postMessage from the embedded game frame
const handleEmbeddedGameFrameMessage = (event: MessageEvent) => {
  // Only accept messages from the registered embedded game frame window
  if (!embeddedGameFrameWindow || event.source !== embeddedGameFrameWindow) {
    return;
  }

  let parsedMessage = null;
  try {
    // The message might be a string (JSON) or already an object
    parsedMessage =
      typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
  } catch (e) {
    console.warn(
      'Error while parsing message received from embedded game frame:',
      e
    );
    return;
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
    onHandleParsedMessage({ id: EMBEDDED_GAME_FRAME_DEBUGGER_ID, parsedMessage })
  );
};

/**
 * A debugger server implemented using Electron (this one is just a bridge to it,
 * communicating through events with it).
 */
class LocalPreviewDebuggerServer {
  startServer() {
    if (!ipcRenderer) return Promise.reject();
    if (debuggerServerState === 'started') return Promise.resolve();

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
    // If this is the embedded game frame, use postMessage instead of websocket
    if (id === EMBEDDED_GAME_FRAME_DEBUGGER_ID) {
      if (!embeddedGameFrameWindow) {
        console.warn(
          'Cannot send message to embedded game frame - not registered.'
        );
        return;
      }

      try {
        embeddedGameFrameWindow.postMessage(message, '*');
      } catch (error) {
        console.error(
          'Unable to send a message to the embedded game frame:',
          error
        );
      }
      return;
    }

    // For regular preview windows, use websocket via Electron IPC
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
    for (const id of this.getExistingDebuggerIds()) {
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
    return [
      ...(embeddedGameFrameWindow ? [EMBEDDED_GAME_FRAME_DEBUGGER_ID] : []),
      ...debuggerIds,
    ];
  }
  registerCallbacks(callbacks: PreviewDebuggerServerCallbacks) {
    callbacksList.push(callbacks);

    return () => {
      const callbacksIndex = callbacksList.indexOf(callbacks);
      if (callbacksIndex !== -1) callbacksList.splice(callbacksIndex, 1);
    };
  }
  registerEmbeddedGameFrame(iframeWindow: WindowProxy) {
    if (iframeWindow === embeddedGameFrameWindow) return;

    console.info(
      'Registered the embedded game frame window in the local preview debugger server.'
    );
    embeddedGameFrameWindow = iframeWindow;

    // Set up message listener for postMessage communication on the editor's window
    // (the iframe will send messages to the parent window)
    // Use globalThis to access the editor's window (not the iframe's window parameter)
    if (!isMessageListenerAdded) {
      const editorWindow = typeof globalThis !== 'undefined' ? globalThis.window : typeof window !== 'undefined' ? window : null;
      if (editorWindow && editorWindow.addEventListener) {
        editorWindow.addEventListener('message', handleEmbeddedGameFrameMessage);
        isMessageListenerAdded = true;
      }
    }

    // Notify that a connection was opened
    callbacksList.forEach(({ onConnectionOpened }) =>
      onConnectionOpened({
        id: EMBEDDED_GAME_FRAME_DEBUGGER_ID,
        debuggerIds: this.getExistingDebuggerIds(),
      })
    );
  }
  unregisterEmbeddedGameFrame(iframeWindow: WindowProxy) {
    if (embeddedGameFrameWindow !== iframeWindow) {
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

    // Remove message listener from the editor's window
    if (isMessageListenerAdded) {
      const editorWindow = typeof globalThis !== 'undefined' ? globalThis.window : typeof window !== 'undefined' ? window : null;
      if (editorWindow && editorWindow.removeEventListener) {
        editorWindow.removeEventListener('message', handleEmbeddedGameFrameMessage);
        isMessageListenerAdded = false;
      }
    }

    embeddedGameFrameWindow = null;

    // Notify that the connection was closed
    callbacksList.forEach(({ onConnectionClosed }) =>
      onConnectionClosed({
        id: EMBEDDED_GAME_FRAME_DEBUGGER_ID,
        debuggerIds: this.getExistingDebuggerIds(),
      })
    );
  }
  closeAllConnections() {
    const previousDebuggerIds = [...debuggerIds];
    debuggerIds.length = 0;

    previousDebuggerIds.forEach(id => {
      callbacksList.forEach(({ onConnectionClosed }) =>
        onConnectionClosed({
          id,
          debuggerIds: this.getExistingDebuggerIds(),
        })
      );
    });

    // Unregister embedded game frame if it exists
    if (embeddedGameFrameWindow) {
      embeddedGameFrameWindow = null;
      // Remove message listener from the editor's window
      if (isMessageListenerAdded) {
        const editorWindow = typeof globalThis !== 'undefined' ? globalThis.window : typeof window !== 'undefined' ? window : null;
        if (editorWindow && editorWindow.removeEventListener) {
          editorWindow.removeEventListener('message', handleEmbeddedGameFrameMessage);
          isMessageListenerAdded = false;
        }
      }
      callbacksList.forEach(({ onConnectionClosed }) =>
        onConnectionClosed({
          id: EMBEDDED_GAME_FRAME_DEBUGGER_ID,
          debuggerIds: this.getExistingDebuggerIds(),
        })
      );
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
