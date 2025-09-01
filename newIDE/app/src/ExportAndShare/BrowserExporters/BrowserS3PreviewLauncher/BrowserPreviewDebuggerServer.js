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

const getExistingDebuggerIds = () =>
  Object.keys(existingPreviewWindows).map(key => Number(key));

const getDebuggerIdForPreviewWindow = (previewWindow: any) => {
  for (const key in existingPreviewWindows) {
    const id = Number(key);
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
    for (const key in existingPreviewWindows) {
      const id = Number(key);
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

const PREVIEWS_ORIGIN = 'https://game-previews.gdevelop.io';

/**
 * A debugger server implemented using the ability to send/receive messages
 * from popup windows in the browser.
 */
class BrowserPreviewDebuggerServer {
  async startServer() {
    if (debuggerServerState === 'started') return;
    debuggerServerState = 'started';

    window.addEventListener('message', event => {
      if (event.origin !== PREVIEWS_ORIGIN) return;

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
    const previewWindow = existingPreviewWindows[id];
    if (!previewWindow) return;

    try {
      previewWindow.postMessage(message, PREVIEWS_ORIGIN);
    } catch (error) {
      console.error('Unable to send a message to the preview window:', error);
    }
  }
  sendMessageWithResponse(
    id: DebuggerId,
    message: Object,
    timeout: number = 1000
  ): Promise<Object> {
    const messageId = nextMessageWithResponseId;
    nextMessageWithResponseId++;
    this.sendMessage(id, { ...message, messageId });

    const promise = new Promise<Object>((resolve, reject) => {
      responseCallbacks.set(messageId, resolve);
      setTimeout(() => {
        reject();
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
}
export const browserPreviewDebuggerServer: PreviewDebuggerServer = new BrowserPreviewDebuggerServer();

export const registerNewPreviewWindow = (
  previewWindow: WindowProxy
): DebuggerId => {
  // Associate this window with a new debugger id.
  const id = nextDebuggerId++;
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
