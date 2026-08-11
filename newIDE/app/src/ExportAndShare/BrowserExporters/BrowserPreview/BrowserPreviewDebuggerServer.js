// @flow
import {
  type PreviewDebuggerServerCallbacks,
  type PreviewDebuggerServer,
  type DebuggerId,
} from '../../PreviewLauncher.flow';

let debuggerServerState: 'started' | 'stopped' = 'stopped';
const callbacksList: Array<PreviewDebuggerServerCallbacks> = [];
const recentLogsByDebuggerId: { [DebuggerId]: Array<Object> } = {};
const maxRecentLogsPerDebugger = 200;

let nextDebuggerId = 0;

const responseCallbacks = new Map<number, (value: Object) => void>();
let nextMessageWithResponseId = 1;

const existingPreviewWindows: {
  [DebuggerId]: WindowProxy,
} = {};

let embbededGameFrameWindow: WindowProxy | null = null;
let gameplayTestFrameWindow: WindowProxy | null = null;

const getExistingDebuggerIds = (): Array<DebuggerId> => [
  ...getExistingEmbeddedGameFrameDebuggerIds(),
  ...getExistingGameplayTestFrameDebuggerIds(),
  ...getExistingPreviewDebuggerIds(),
];

const getExistingEmbeddedGameFrameDebuggerIds = (): Array<DebuggerId> =>
  embbededGameFrameWindow ? ['embedded-game-frame'] : [];

const getExistingGameplayTestFrameDebuggerIds = (): Array<DebuggerId> =>
  gameplayTestFrameWindow ? ['gameplay-test-frame'] : [];

const getExistingPreviewDebuggerIds = (): Array<DebuggerId> =>
  Object.keys(existingPreviewWindows).map(key => key);

const getDebuggerIdForPreviewWindow = (
  previewWindow: any
): DebuggerId | null => {
  if (embbededGameFrameWindow && embbededGameFrameWindow === previewWindow) {
    return 'embedded-game-frame';
  }
  if (gameplayTestFrameWindow && gameplayTestFrameWindow === previewWindow) {
    return 'gameplay-test-frame';
  }

  for (const id in existingPreviewWindows) {
    if (existingPreviewWindows[id] === previewWindow) {
      return id;
    }
  }
  return null;
};

let windowClosedPollingIntervalId = null;

const stopWindowClosedPolling = () => {
  if (windowClosedPollingIntervalId === null) return;

  clearInterval(windowClosedPollingIntervalId);
  windowClosedPollingIntervalId = null;
};

const notifyConnectionClosed = (id: DebuggerId) => {
  delete recentLogsByDebuggerId[id];
  callbacksList.forEach(({ onConnectionClosed }) =>
    onConnectionClosed({
      id,
      debuggerIds: getExistingDebuggerIds(),
    })
  );
};

const handleParsedMessage = (
  id: DebuggerId,
  parsedMessage: Object | null
): void => {
  if (!parsedMessage) return;

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

  const answerCallback = responseCallbacks.get(parsedMessage.messageId);
  if (answerCallback) {
    answerCallback(parsedMessage);
    responseCallbacks.delete(parsedMessage.messageId);
  }

  callbacksList.forEach(({ onHandleParsedMessage }) =>
    onHandleParsedMessage({ id, parsedMessage })
  );
};

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
        notifyConnectionClosed(id);
        if (!Object.keys(existingPreviewWindows).length) {
          stopWindowClosedPolling();
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
  // $FlowFixMe[missing-local-annot]
  async startServer({ origin }) {
    if (debuggerServerState === 'started') return;
    debuggerServerState = 'started';

    previewOrigin = origin;

    window.addEventListener('message', event => {
      if (event.origin !== previewOrigin) return;

      const id = getDebuggerIdForPreviewWindow(event.source);
      if (id === null) {
        return; // Could not find the id of this preview window.
      }

      try {
        const parsedMessage = JSON.parse(event.data);
        handleParsedMessage(id, parsedMessage);
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
        : id === 'gameplay-test-frame'
        ? gameplayTestFrameWindow
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
  getConnectionInfo(id: DebuggerId): ?Object {
    return getExistingDebuggerIds().indexOf(id) !== -1
      ? { debuggerId: id, connected: true }
      : { debuggerId: id, connected: false };
  }
  getLastConnectionInfo(): ?Object {
    return null;
  }
  // $FlowFixMe[missing-local-annot]
  getRecentLogs(id: DebuggerId) {
    return [...(recentLogsByDebuggerId[id] || [])];
  }
  // $FlowFixMe[missing-local-annot]
  registerCallbacks(callbacks: PreviewDebuggerServerCallbacks) {
    callbacksList.push(callbacks);

    return () => {
      const callbacksIndex = callbacksList.indexOf(callbacks);
      if (callbacksIndex !== -1) callbacksList.splice(callbacksIndex, 1);
    };
  }
  registerEmbeddedGameFrame(window: WindowProxy) {
    if (window === embbededGameFrameWindow) return;

    console.info(
      'Registered the embedded game frame window in the debugger server.'
    );
    embbededGameFrameWindow = window;
    recentLogsByDebuggerId['embedded-game-frame'] = [];
  }
  registerGameplayTestFrame(window: WindowProxy) {
    if (window === gameplayTestFrameWindow) return;

    console.info(
      'Registered the gameplay test frame window in the debugger server.'
    );
    gameplayTestFrameWindow = window;
    callbacksList.forEach(({ onConnectionOpened }) =>
      onConnectionOpened({
        id: 'gameplay-test-frame',
        debuggerIds: getExistingDebuggerIds(),
      })
    );
  }
  unregisterGameplayTestFrame(window: WindowProxy) {
    if (gameplayTestFrameWindow !== window) {
      if (!!gameplayTestFrameWindow) {
        console.warn(
          'The gameplay test frame window to unregister is not the same as the one registered. Ignoring the unregistration.'
        );
      }
      return;
    }

    console.info(
      'Unregistered the gameplay test frame window in the debugger server.'
    );
    gameplayTestFrameWindow = null;
    notifyConnectionClosed('gameplay-test-frame');
  }
  unregisterEmbeddedGameFrame(window: WindowProxy) {
    if (embbededGameFrameWindow !== window) {
      if (!!embbededGameFrameWindow) {
        console.warn(
          'The embedded game frame window to unregister is not the same as the one registered. Ignoring the unregistration.'
        );
      }
      return;
    }

    console.info(
      'Unregistered the embedded game frame window in the debugger server.'
    );
    embbededGameFrameWindow = null;
    notifyConnectionClosed('embedded-game-frame');
  }
  closeAllPreviewConnections() {
    console.info(
      'Closing all preview window connections to the debugger server.'
    );
    Object.keys(existingPreviewWindows).forEach(id => {
      const previewWindow = existingPreviewWindows[id];
      delete existingPreviewWindows[id];

      try {
        if (previewWindow && !previewWindow.closed) previewWindow.close();
      } catch (error) {
        console.info(
          'Unable to close a preview window - ignoring the error as the project is closing:',
          error
        );
      }

      notifyConnectionClosed(id);
    });

    stopWindowClosedPolling();
    responseCallbacks.clear();
  }

  closeAllConnections() {
    this.closeAllPreviewConnections();
    if (embbededGameFrameWindow) {
      embbededGameFrameWindow = null;
      notifyConnectionClosed('embedded-game-frame');
    }

    if (gameplayTestFrameWindow) {
      gameplayTestFrameWindow = null;
      notifyConnectionClosed('gameplay-test-frame');
    }

    responseCallbacks.clear();
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
  recentLogsByDebuggerId[id] = [];

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
