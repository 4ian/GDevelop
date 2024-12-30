// @flow
import * as React from 'react';
import {
  type PreviewDebuggerServer,
  type DebuggerId,
  type HotReloaderLog,
} from '../ExportAndShare/PreviewLauncher.flow';

/** Represents what should be run when a preview is launched */
export type PreviewState = {|
  /** The previewed layout name, set by the current editor. */
  previewLayoutName: ?string,
  /** The previewed external layout name, set by the current editor. */
  previewExternalLayoutName: ?string,

  /** If true, the previewed layout/external layout is overriden, */
  isPreviewOverriden: boolean,
  /** The layout name to be used instead of the one set by the current editor. */
  overridenPreviewLayoutName: ?string,
  /** The external layout name to be used instead of the one set by the current editor. */
  overridenPreviewExternalLayoutName: ?string,
|};

type DebuggerStatus = {|
  isPaused: boolean,
  isInGameEdition: boolean,
|};

type PreviewDebuggerServerWatcherResults = {|
  hasNonEditionPreviewsRunning: boolean,
  hotReloadLogs: Array<HotReloaderLog>,
  clearHotReloadLogs: () => void,
|};

/**
 * Return the status of the debuggers being run, watching for changes (new
 * debugger launched or existing one closed).
 */
export const usePreviewDebuggerServerWatcher = (
  previewDebuggerServer: ?PreviewDebuggerServer
): PreviewDebuggerServerWatcherResults => {
  const [debuggerStatus, setDebuggerStatus] = React.useState<{
    [DebuggerId]: DebuggerStatus,
  }>({});
  const [hotReloadLogs, setHotReloadLogs] = React.useState<
    Array<HotReloaderLog>
  >([]);
  React.useEffect(
    () => {
      if (!previewDebuggerServer) {
        setDebuggerStatus({});
        return;
      }

      const unregisterCallbacks = previewDebuggerServer.registerCallbacks({
        onErrorReceived: err => {
          // Nothing to do.
        },
        onConnectionClosed: ({ id, debuggerIds }) => {
          // Remove the debugger status.
          setDebuggerStatus(debuggerStatus => {
            const {
              [id]: closedDebuggerStatus,
              ...otherDebuggerStatus
            } = debuggerStatus;
            console.info(
              `Connection closed with preview #${id}. Last status was:`,
              closedDebuggerStatus
            );

            return otherDebuggerStatus;
          });
        },
        onConnectionOpened: ({ id, debuggerIds }) => {
          // Ask the new debugger client for its status (but don't assume anything
          // at this stage).
          previewDebuggerServer.sendMessage(id, { command: 'getStatus' });
        },
        onConnectionErrored: ({ id }) => {
          // Nothing to do (onConnectionClosed is called if necessary).
        },
        onServerStateChanged: () => {
          // Nothing to do.
        },
        onHandleParsedMessage: ({ id, parsedMessage }) => {
          if (parsedMessage.command === 'hotReloader.logs') {
            setHotReloadLogs(parsedMessage.payload);
          } else if (parsedMessage.command === 'status') {
            setDebuggerStatus(debuggerStatus => ({
              ...debuggerStatus,
              [id]: {
                isPaused: !!parsedMessage.payload.isPaused,
                isInGameEdition: !!parsedMessage.payload.isInGameEdition,
              },
            }));
          }
        },
      });
      return () => {
        unregisterCallbacks();
      };
    },
    [previewDebuggerServer]
  );
  const clearHotReloadLogs = React.useCallback(() => setHotReloadLogs([]), [
    setHotReloadLogs,
  ]);

  const hasNonEditionPreviewsRunning = Object.keys(debuggerStatus).some(
    key => !debuggerStatus[+key].isInGameEdition
  );

  return { hasNonEditionPreviewsRunning, hotReloadLogs, clearHotReloadLogs };
};
