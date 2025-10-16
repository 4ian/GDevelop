// @flow
import {
  type PreviewDebuggerServerCallbacks,
  type PreviewDebuggerServer,
  type DebuggerId,
} from '../../PreviewLauncher.flow';

let debuggerServerState: 'started' | 'stopped' = 'stopped';
const callbacksList: Array<PreviewDebuggerServerCallbacks> = [];

let nextDebuggerId = 0;

const responseCallbacks = new Map<number, (value: Object) => void>();
let nextMessageWithResponseId = 1;

const existingPreviewWindows: {
  [DebuggerId]: WindowProxy,
} = {};

let embbededGameFrameWindow: WindowProxy | null = null;

const getExistingDebuggerIds = (): Array<DebuggerId> => [
  ...(embbededGameFrameWindow ? ['embedded-game-frame'] : []),
  ...Object.keys(existingPreviewWindows).map(key => key),
];

const getDebuggerIdForPreviewWindow = (
  previewWindow: any
): DebuggerId | null => {
  if (embbededGameFrameWindow && embbededGameFrameWindow === previewWindow) {
    return 'embedded-game-frame';
  }

  for (const id in existingPreviewWindows) {
    if (existingPreviewWindows[id] === previewWindow) {
      return id;
    }
  }
  return null;
};

let windowClosedPollingIntervalId = null;

/**
 * Listen to window closing so that we can notify the debuggers
 * when a preview window is closed.
 * Polling seems the only option to do so.
 */
const setupWindowClosedPolling = () => {
  if (windowClosedPollingIntervalId !== null) return;

  windowClosedPollingIntervalId = setInterval(() => {
    for (const id in existingPreviewWindows) {
      const previewWindow = existingPreviewWindows[id];
      if (previewWindow.closed) {
        console.info('A preview window was closed, with debugger id:', id);
        delete existingPreviewWindows[id];
        callbacksList.forEach(({ onConnectionClosed }) =>
          onConnectionClosed({
            id,
            debuggerIds: getExistingDebuggerIds(),
          })
        );
        if (!Object.keys(existingPreviewWindows).length) {
          clearInterval(windowClosedPollingIntervalId);
          windowClosedPollingIntervalId = null;
        }
      }
    }
  }, 1000);
};

let previewOrigin = null;

/**
 * A debugger server implemented using the ability to send/receive messages
 * from popup windows in the browser.
 */
class BrowserPreviewDebuggerServer {
  async startServer({ origin }) {
    if (debuggerServerState === 'started') return;
    debuggerServerState = 'started';

    previewOrigin = origin;

    window.addEventListener('message', event => {
      if (event.origin !== previewOrigin) return;

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
          'Error while parsing messages coming from a preview:',
          error
        );
      }
    });

    setupWindowClosedPolling();

    callbacksList.forEach(({ onServerStateChanged }) => onServerStateChanged());
  }
  sendMessage(id: DebuggerId, message: Object) {
    const theWindow =
      id === 'embedded-game-frame'
        ? embbededGameFrameWindow
        : existingPreviewWindows[id];
    if (!theWindow) return;

    try {
      theWindow.postMessage(message, previewOrigin);
    } catch (error) {
      console.error(
        `Unable to send a message to the preview window with id "${id}":`,
        error
      );
    }
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
    embbededGameFrameWindow = window;
  }
}
export const browserPreviewDebuggerServer: PreviewDebuggerServer = new BrowserPreviewDebuggerServer();

export const registerNewPreviewWindow = (
  previewWindow: WindowProxy
): DebuggerId => {
  const existingId = getDebuggerIdForPreviewWindow(previewWindow);
  if (existingId) {
    console.warn(
      'A preview window was already registered. It has this id:',
      existingId
    );
    return existingId;
  }

  // Associate this window with a new debugger id.
  const id = 'preview-window-' + nextDebuggerId++;
  existingPreviewWindows[id] = previewWindow;

  setupWindowClosedPolling();

  // Notify the debuggers that a new preview was opened.
  callbacksList.forEach(({ onConnectionOpened }) =>
    onConnectionOpened({
      id,
      debuggerIds: getExistingDebuggerIds(),
    })
  );

  return id;
};

export const getExistingPreviewWindowForDebuggerId = (
  id: ?DebuggerId
): ?WindowProxy => {
  if (id == null) return null;

  return existingPreviewWindows[id] || null;
};
