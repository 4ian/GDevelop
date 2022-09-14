// @flow
import {
  type PreviewDebuggerServerCallbacks,
  type PreviewDebuggerServer,
  type DebuggerId,
} from '../../PreviewLauncher.flow';

let debuggerServerState: 'started' | 'stopped' = 'stopped';
const callbacksList: Array<PreviewDebuggerServerCallbacks> = [];

let nextDebuggerId = 0;

const previewWindowAndTargetIds: {
  [DebuggerId]: { previewWindow: any, targetId: string },
} = {};

const getExistingDebuggerIds = () =>
  Object.keys(previewWindowAndTargetIds).map(key => Number(key));

const getDebuggerIdForPreviewWindow = (previewWindow: any) => {
  for (const key in previewWindowAndTargetIds) {
    const id = Number(key);
    if (previewWindowAndTargetIds[id].previewWindow === previewWindow) {
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
    for (const key in previewWindowAndTargetIds) {
      const id = Number(key);
      const { previewWindow } = previewWindowAndTargetIds[id];
      if (previewWindow.closed) {
        console.info('A preview window was closed, with debugger id:', id);
        delete previewWindowAndTargetIds[id];
        callbacksList.forEach(({ onConnectionClosed }) =>
          onConnectionClosed({
            id,
            debuggerIds: getExistingDebuggerIds(),
          })
        );
        if (!Object.keys(previewWindowAndTargetIds).length) {
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
export const browserPreviewDebuggerServer: PreviewDebuggerServer = {
  startServer: async () => {
    if (debuggerServerState === 'started') return;
    debuggerServerState = 'started';

    window.addEventListener('message', event => {
      if (event.origin !== PREVIEWS_ORIGIN) return;

      const id = getDebuggerIdForPreviewWindow(event.source);
      if (id === null) return; // Could not find the id of this preview window.

      try {
        const parsedMessage = JSON.parse(event.data);
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
  },
  sendMessage: (id: DebuggerId, message: Object) => {
    const { previewWindow } = previewWindowAndTargetIds[id];
    if (!previewWindow) return;

    try {
      previewWindow.postMessage(message, PREVIEWS_ORIGIN);
    } catch (error) {
      console.error('Unable to send a message to the preview window:', error);
    }
  },
  getServerState: () => debuggerServerState,
  getExistingDebuggerIds,
  registerCallbacks: (callbacks: PreviewDebuggerServerCallbacks) => {
    callbacksList.push(callbacks);

    return () => {
      const callbacksIndex = callbacksList.indexOf(callbacks);
      if (callbacksIndex !== -1) callbacksList.splice(callbacksIndex, 1);
    };
  },
};

export const registerPreviewWindow = ({
  previewWindow,
  targetId,
}: {|
  previewWindow: any,
  targetId: string,
|}) => {
  const id = nextDebuggerId++;
  const sameWindowExistingId = getDebuggerIdForPreviewWindow(previewWindow);
  if (sameWindowExistingId !== null) {
    // This window is already associated to a debugger id. This is surely
    // because a new preview was launched in an existing window, replacing the old one.
    // So we replace the existing debugger id.
    delete previewWindowAndTargetIds[sameWindowExistingId];
  }

  previewWindowAndTargetIds[id] = { previewWindow, targetId };

  setupWindowClosedPolling();

  callbacksList.forEach(({ onConnectionOpened }) =>
    onConnectionOpened({
      id,
      debuggerIds: getExistingDebuggerIds(),
    })
  );
};

export const getExistingTargetIdForDebuggerId = (id: ?DebuggerId): ?string => {
  if (id == null) return null;

  const previewWindowAndTargetId = previewWindowAndTargetIds[id];
  if (previewWindowAndTargetId) return previewWindowAndTargetId.targetId;

  return null;
};
