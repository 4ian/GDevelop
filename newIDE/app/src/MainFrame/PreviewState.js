// @flow
import * as React from 'react';
import {
  type PreviewDebuggerServer,
  type DebuggerId,
  type HotReloaderLog,
  type DebuggerStatus,
} from '../ExportAndShare/PreviewLauncher.flow';

/** Represents what should be run when a preview is launched */
export type PreviewState = {|
  /** The previewed layout name, set by the current editor. */
  previewLayoutName: string | null,
  /** The previewed external layout name, set by the current editor. */
  previewExternalLayoutName: string | null,

  /** If true, the previewed layout/external layout is overriden, */
  isPreviewOverriden: boolean,
  /** The layout name to be used instead of the one set by the current editor. */
  overridenPreviewLayoutName: ?string,
  /** The external layout name to be used instead of the one set by the current editor. */
  overridenPreviewExternalLayoutName: ?string,
|};

type PreviewDebuggerServerWatcherResults = {|
  hasNonEditionPreviewsRunning: boolean,

  gameHotReloadLogs: Array<HotReloaderLog>,
  clearGameHotReloadLogs: () => void,
  editorHotReloadLogs: Array<HotReloaderLog>,
  clearEditorHotReloadLogs: () => void,

  hardReloadAllPreviews: () => void,
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
  const [gameHotReloadLogs, setGameHotReloadLogs] = React.useState<
    Array<HotReloaderLog>
  >([]);
  const [editorHotReloadLogs, setEditorHotReloadLogs] = React.useState<
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
            if (parsedMessage.payload.isInGameEdition) {
              setEditorHotReloadLogs(parsedMessage.payload.logs);
            } else {
              setGameHotReloadLogs(parsedMessage.payload.logs);
            }
          } else if (parsedMessage.command === 'status') {
            setDebuggerStatus(debuggerStatus => ({
              ...debuggerStatus,
              [id]: {
                isPaused: !!parsedMessage.payload.isPaused,
                isInGameEdition: !!parsedMessage.payload.isInGameEdition,
                sceneName: parsedMessage.payload.sceneName,
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
  const clearGameHotReloadLogs = React.useCallback(
    () => setGameHotReloadLogs([]),
    [setGameHotReloadLogs]
  );
  const clearEditorHotReloadLogs = React.useCallback(
    () => setEditorHotReloadLogs([]),
    [setEditorHotReloadLogs]
  );

  const hardReloadAllPreviews = React.useCallback(
    () => {
      if (!previewDebuggerServer) return;

      console.info('Hard reloading all previews...');
      previewDebuggerServer.getExistingDebuggerIds().forEach(debuggerId => {
        previewDebuggerServer.sendMessage(debuggerId, {
          command: 'hardReload',
        });
      });
    },
    [previewDebuggerServer]
  );

  const hasNonEditionPreviewsRunning = Object.keys(debuggerStatus).some(
    key => !debuggerStatus[+key].isInGameEdition
  );

  return {
    hasNonEditionPreviewsRunning,
    gameHotReloadLogs,
    clearGameHotReloadLogs,
    editorHotReloadLogs,
    clearEditorHotReloadLogs,
    hardReloadAllPreviews,
  };
};
