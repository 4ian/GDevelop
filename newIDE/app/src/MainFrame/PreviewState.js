// @flow
import * as React from 'react';
import {
  type PreviewDebuggerServer,
  type DebuggerId,
  type HotReloaderLog,
  type DebuggerStatus,
} from '../ExportAndShare/PreviewLauncher.flow';
import {
  type InGameEditorExtensionError,
  setLatestInGameEditorExtensionErrors,
} from '../InGameEditorExtensionErrors';

const MAX_IN_GAME_EDITOR_EXTENSION_ERRORS = 20;
let nextInGameEditorExtensionErrorId = 1;

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

  gameHotReloadLogs: Array<HotReloaderLog>,
  clearGameHotReloadLogs: () => void,
  editorHotReloadLogs: Array<HotReloaderLog>,
  clearEditorHotReloadLogs: () => void,
  editorUncaughtError: Error | null,
  clearEditorUncaughtError: () => void,
  // Errors of the code of extensions since the last hot reload of the
  // in-game editor, which went on working.
  inGameEditorExtensionErrors: Array<InGameEditorExtensionError>,
  clearInGameEditorExtensionErrors: () => void,

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
  const [
    editorUncaughtError,
    setEditorUncaughtError,
  ] = React.useState<Error | null>(null);
  const [
    inGameEditorExtensionErrors,
    setInGameEditorExtensionErrors,
  ] = React.useState<Array<InGameEditorExtensionError>>([]);
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
              `Connection closed with preview with id "${id}". Last status was:`,
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
              // The code may have changed: errors still there are sent again.
              setInGameEditorExtensionErrors([]);
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
          } else if (parsedMessage.command === 'inGameEditor.extensionError') {
            const { payload } = parsedMessage;
            setInGameEditorExtensionErrors(errors => {
              const existingError = errors.find(
                error => error.key === payload.key
              );
              if (existingError) {
                return errors.map(error =>
                  error === existingError
                    ? { ...error, count: payload.count }
                    : error
                );
              }
              if (errors.length >= MAX_IN_GAME_EDITOR_EXTENSION_ERRORS) {
                return errors;
              }
              return [
                ...errors,
                {
                  id: nextInGameEditorExtensionErrorId++,
                  key: payload.key,
                  extensionName: payload.extensionName || null,
                  phase: payload.phase,
                  type: payload.type || null,
                  message: payload.message,
                  stack: payload.stack,
                  count: payload.count,
                },
              ];
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
  React.useEffect(
    () => setLatestInGameEditorExtensionErrors(inGameEditorExtensionErrors),
    [inGameEditorExtensionErrors]
  );
  const clearInGameEditorExtensionErrors = React.useCallback(
    () => setInGameEditorExtensionErrors([]),
    [setInGameEditorExtensionErrors]
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

  // The gameplay test frame is not counted as a running preview: it's
  // entirely driven by the gameplay test runner (no hot-reload/update).
  const hasNonEditionPreviewsRunning = Object.keys(debuggerStatus).some(
    key => key !== 'gameplay-test-frame' && !debuggerStatus[key].isInGameEdition
  );
  const nonEditionPreviewsCount = Object.keys(debuggerStatus).filter(
    key => key !== 'gameplay-test-frame' && !debuggerStatus[key].isInGameEdition
  ).length;

  return {
    hasNonEditionPreviewsRunning,
    nonEditionPreviewsCount,
    gameHotReloadLogs,
    clearGameHotReloadLogs,
    editorHotReloadLogs,
    clearEditorHotReloadLogs,
    editorUncaughtError,
    clearEditorUncaughtError,
    inGameEditorExtensionErrors,
    clearInGameEditorExtensionErrors,
    hardReloadAllPreviews,
  };
};
