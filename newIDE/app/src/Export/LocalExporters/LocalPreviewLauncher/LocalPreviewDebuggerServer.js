// @flow
import optionalRequire from '../../../Utils/OptionalRequire';
import {
  type PreviewDebuggerServerCallbacks,
  type PreviewDebuggerServer,
  type DebuggerId,
} from '../../PreviewLauncher.flow';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

let debuggerServerState: 'started' | 'stopped' = 'stopped';
const callbacksList: Array<PreviewDebuggerServerCallbacks> = [];
const debuggerIds: Array<DebuggerId> = [];

const removeServerListeners = () => {
  if (!ipcRenderer) return;

  ipcRenderer.removeAllListeners('debugger-send-message-done');
  ipcRenderer.removeAllListeners('debugger-error-received');
  ipcRenderer.removeAllListeners('debugger-connection-closed');
  ipcRenderer.removeAllListeners('debugger-connection-opened');
  ipcRenderer.removeAllListeners('debugger-start-server-done');
  ipcRenderer.removeAllListeners('debugger-message-received');
};

/**
 * A debugger server implemented using Electron (this one is just a bridge to it,
 * communicating through events with it).
 */
export const LocalPreviewDebuggerServer: PreviewDebuggerServer = {
  startServer: () => {
    if (!ipcRenderer) return;
    if (debuggerServerState === 'started') return;

    debuggerServerState = 'stopped';
    removeServerListeners();

    ipcRenderer.on('debugger-error-received', (event, err) => {
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

    ipcRenderer.on('debugger-start-server-done', event => {
      console.info('Local preview debugger started');
      debuggerServerState = 'started';
      callbacksList.forEach(({ onServerStateChanged }) =>
        onServerStateChanged()
      );
    });

    ipcRenderer.on('debugger-message-received', (event, { id, message }) => {
      console.info('Processing message received for debugger');
      try {
        const parsedMessage = JSON.parse(message);
        callbacksList.forEach(({ onHandleParsedMessage }) =>
          onHandleParsedMessage({ id, parsedMessage })
        );
      } catch (e) {
        console.warn(
          'Error while parsing message received from debugger client:',
          e
        );
      }
    });
    ipcRenderer.send('debugger-start-server');
  },
  sendMessage: (id: DebuggerId, message: Object) => {
    if (!ipcRenderer) return;
    if (debuggerServerState === 'stopped') {
      console.error('Cannot send message when debugger server is stopped.');
      return;
    }

    ipcRenderer.send('debugger-send-message', {
      id,
      message: JSON.stringify(message),
    });
  },
  getServerState: () => debuggerServerState,
  getExistingDebuggerIds: () => debuggerIds,
  registerCallbacks: (callbacks: PreviewDebuggerServerCallbacks) => {
    callbacksList.push(callbacks);

    return () => {
      const callbacksIndex = callbacksList.indexOf(callbacks);
      if (callbacksIndex !== -1) callbacksList.splice(callbacksIndex, 1);
    };
  },
};
