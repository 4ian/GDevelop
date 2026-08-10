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
  nonEditionPreviewsCount: number,
  hasInGameEditionPreviewRunning: boolean,
  inGameEditionPreviewsCount: number,

  gameHotReloadLogs: Array<HotReloaderLog>,
  clearGameHotReloadLogs: () => void,
  editorHotReloadLogs: Array<HotReloaderLog>,
  clearEditorHotReloadLogs: () => void,
  editorUncaughtError: Error | null,
  clearEditorUncaughtError: () => void,

  hardReloadAllPreviews: () => void,
  clearPreviewDebuggerStatuses: () => void,
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
  const [
    editorUncaughtError,
    setEditorUncaughtError,
  ] = React.useState<Error | null>(null);
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
          // Remove the debugger status and synchronize with the server-side
          // list so a missed or out-of-order close event cannot leave stale
          // preview/debugger state in the editor.
          setDebuggerStatus(debuggerStatus => {
            const {
              [id]: closedDebuggerStatus,
              ...otherDebuggerStatus
            } = debuggerStatus;
            const liveDebuggerIds = new Set(debuggerIds);
            let hasRemovedDebuggerStatus = !!closedDebuggerStatus;
            const synchronizedDebuggerStatus: {
              [DebuggerId]: DebuggerStatus,
            } = {};
            for (const debuggerId in otherDebuggerStatus) {
              if (liveDebuggerIds.has(debuggerId)) {
                synchronizedDebuggerStatus[debuggerId] =
                  otherDebuggerStatus[debuggerId];
              } else {
                hasRemovedDebuggerStatus = true;
              }
            }
            if (closedDebuggerStatus) {
              console.info(
                `Connection closed with preview with id "${id}". Last status was:`,
                closedDebuggerStatus
              );
            }

            return hasRemovedDebuggerStatus
              ? synchronizedDebuggerStatus
              : debuggerStatus;
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
            if (!previewDebuggerServer.getExistingDebuggerIds().includes(id)) {
              console.warn(
                `Ignoring status from closed or unknown preview debugger id "${id}".`
              );
              return;
            }
            setDebuggerStatus(debuggerStatus => {
              const nextDebuggerStatus = {
                isPaused: !!parsedMessage.payload.isPaused,
                isInGameEdition: !!parsedMessage.payload.isInGameEdition,
                sceneName: parsedMessage.payload.sceneName,
              };
              const previousDebuggerStatus = debuggerStatus[id];
              if (
                previousDebuggerStatus &&
                previousDebuggerStatus.isPaused ===
                  nextDebuggerStatus.isPaused &&
                previousDebuggerStatus.isInGameEdition ===
                  nextDebuggerStatus.isInGameEdition &&
                previousDebuggerStatus.sceneName ===
                  nextDebuggerStatus.sceneName
              ) {
                return debuggerStatus;
              }

              return {
                ...debuggerStatus,
                [id]: nextDebuggerStatus,
              };
            });
          } else if (parsedMessage.command === 'game.crashed') {
            // Only keep the first exception.
            if (parsedMessage.payload.isInGameEdition) {
              setEditorUncaughtError(
                previousEditorUncaughtError =>
                  previousEditorUncaughtError || parsedMessage.payload.exception
              );
            }
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
  const clearEditorUncaughtError = React.useCallback(
    () => setEditorUncaughtError(null),
    [setEditorUncaughtError]
  );
  const clearPreviewDebuggerStatuses = React.useCallback(
    () => {
      setDebuggerStatus(debuggerStatus => {
        let hasRemovedDebuggerStatus = false;
        const synchronizedDebuggerStatus: {
          [DebuggerId]: DebuggerStatus,
        } = {};

        for (const debuggerId in debuggerStatus) {
          if (debuggerId === 'embedded-game-frame') {
            synchronizedDebuggerStatus[debuggerId] = debuggerStatus[debuggerId];
          } else {
            hasRemovedDebuggerStatus = true;
          }
        }

        return hasRemovedDebuggerStatus
          ? synchronizedDebuggerStatus
          : debuggerStatus;
      });
    },
    [setDebuggerStatus]
  );
  const synchronizeDebuggerStatusWithLiveDebuggerIds = React.useCallback(
    () => {
      if (!previewDebuggerServer) {
        setDebuggerStatus(debuggerStatus =>
          Object.keys(debuggerStatus).length ? {} : debuggerStatus
        );
        return;
      }

      const liveDebuggerIds = new Set(
        previewDebuggerServer.getExistingDebuggerIds()
      );
      setDebuggerStatus(debuggerStatus => {
        let hasRemovedDebuggerStatus = false;
        const synchronizedDebuggerStatus: {
          [DebuggerId]: DebuggerStatus,
        } = {};

        for (const debuggerId in debuggerStatus) {
          if (liveDebuggerIds.has(debuggerId)) {
            synchronizedDebuggerStatus[debuggerId] = debuggerStatus[debuggerId];
          } else {
            hasRemovedDebuggerStatus = true;
          }
        }

        return hasRemovedDebuggerStatus
          ? synchronizedDebuggerStatus
          : debuggerStatus;
      });
    },
    [previewDebuggerServer, setDebuggerStatus]
  );
  const requestStatusFromLivePreviewDebuggers = React.useCallback(
    () => {
      if (!previewDebuggerServer) return;

      previewDebuggerServer.getExistingPreviewDebuggerIds().forEach(id => {
        previewDebuggerServer.sendMessage(id, { command: 'getStatus' });
      });
    },
    [previewDebuggerServer]
  );

  React.useEffect(
    () => {
      if (!previewDebuggerServer || !Object.keys(debuggerStatus).length) return;

      const intervalId = setInterval(() => {
        synchronizeDebuggerStatusWithLiveDebuggerIds();
        requestStatusFromLivePreviewDebuggers();
      }, 1000);
      return () => clearInterval(intervalId);
    },
    [
      debuggerStatus,
      previewDebuggerServer,
      requestStatusFromLivePreviewDebuggers,
      synchronizeDebuggerStatusWithLiveDebuggerIds,
    ]
  );

  const hardReloadAllPreviews = React.useCallback(
    () => {
      if (!previewDebuggerServer) return;

      console.info('Hard reloading all previews...');
      previewDebuggerServer.getExistingDebuggerIds().forEach(debuggerId => {
        // The gameplay test frame is only driven by the gameplay test runner.
        if (debuggerId === 'gameplay-test-frame') return;

        previewDebuggerServer.sendMessage(debuggerId, {
          command: 'hardReload',
        });
      });
    },
    [previewDebuggerServer]
  );

  // Editor-owned frames are not native preview windows. They must not keep
  // the global Preview button in its "Update" state.
  const previewDebuggerStatusIds = Object.keys(debuggerStatus).filter(
    key => key !== 'embedded-game-frame' && key !== 'gameplay-test-frame'
  );
  const hasNonEditionPreviewsRunning = previewDebuggerStatusIds.some(
    key => !debuggerStatus[key].isInGameEdition
  );
  const nonEditionPreviewsCount = previewDebuggerStatusIds.filter(
    key => !debuggerStatus[key].isInGameEdition
  ).length;
  const hasInGameEditionPreviewRunning = Object.keys(debuggerStatus).some(
    key => debuggerStatus[key].isInGameEdition
  );
  const inGameEditionPreviewsCount = Object.keys(debuggerStatus).filter(
    key => debuggerStatus[key].isInGameEdition
  ).length;

  return {
    hasNonEditionPreviewsRunning,
    nonEditionPreviewsCount,
    hasInGameEditionPreviewRunning,
    inGameEditionPreviewsCount,
    gameHotReloadLogs,
    clearGameHotReloadLogs,
    editorHotReloadLogs,
    clearEditorHotReloadLogs,
    editorUncaughtError,
    clearEditorUncaughtError,
    hardReloadAllPreviews,
    clearPreviewDebuggerStatuses,
  };
};
