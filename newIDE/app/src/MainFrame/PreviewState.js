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

type PreviewDebuggerServerWatcherResults = {|
  previewDebuggerIds: Array<DebuggerId>,
  hotReloadLogs: Array<HotReloaderLog>,
  clearHotReloadLogs: () => void,
|};

/**
 * Return the ids of the debuggers being run, watching for changes (new
 * debugger launched or existing one closed).
 */
export const usePreviewDebuggerServerWatcher = (
  previewDebuggerServer: ?PreviewDebuggerServer
): PreviewDebuggerServerWatcherResults => {
  const [debuggerIds, setDebuggerIds] = React.useState<Array<DebuggerId>>([]);
  const [hotReloadLogs, setHotReloadLogs] = React.useState<
    Array<HotReloaderLog>
  >([]);
  React.useEffect(
    () => {
      if (!previewDebuggerServer) {
        setDebuggerIds([]);
        return;
      }

      const unregisterCallbacks = previewDebuggerServer.registerCallbacks({
        onErrorReceived: err => {
          // Nothing to do.
        },
        onConnectionClosed: ({ id, debuggerIds }) => {
          setDebuggerIds([...debuggerIds]);
        },
        onConnectionOpened: ({ id, debuggerIds }) => {
          setDebuggerIds([...debuggerIds]);
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

  return { previewDebuggerIds: debuggerIds, hotReloadLogs, clearHotReloadLogs };
};
