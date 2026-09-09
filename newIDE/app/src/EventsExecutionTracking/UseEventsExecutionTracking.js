// @flow
import * as React from 'react';
import {
  type PreviewDebuggerServer,
  type DebuggerId,
} from '../ExportAndShare/PreviewLauncher.flow';
import {
  getGameSpeedFactorForMode,
  type EventsExecutionTrackingMode,
} from './EventsExecutionTrackingStore';
import EventsExecutionTrackingContext from './EventsExecutionTrackingContext';

type Props = {|
  previewDebuggerServer: ?PreviewDebuggerServer,
  mode: EventsExecutionTrackingMode,
  /** The values of the game are only read while the debugger is opened. */
  isDebuggerOpened: boolean,
|};

/**
 * Ask the running previews to report the execution of their events according
 * to the mode, and feed what they report to a store that the events sheets
 * can read from.
 *
 * Like the other statistics of the debugger, the execution is only tracked
 * while a recording is in progress on the preview. The mode always applies to
 * the speed of the game though.
 */
export const useEventsExecutionTracking = ({
  previewDebuggerServer,
  mode,
  isDebuggerOpened,
}: Props): void => {
  const store = React.useContext(EventsExecutionTrackingContext);
  store.setDebuggerOpened(isDebuggerOpened);
  // Read by the callbacks registered once on the server, without re-registering.
  const modeRef = React.useRef(mode);
  modeRef.current = mode;

  // Whether a preview is paused (by the frame by frame mode, the "pause"
  // action of the game or the debugger): what the last frame executed then
  // stays highlighted, as nothing else will run.
  const isPreviewPausedRef = React.useRef(false);
  const updateHighlightsPersistence = React.useCallback(
    () => {
      store.setHighlightsPersistent(
        isPreviewPausedRef.current || modeRef.current === 'frame-by-frame'
      );
    },
    [store]
  );

  // Whether the previews were paused by the frame by frame mode, to resume
  // them when leaving it (and only then: the debugger can pause them too).
  const werePreviewsPausedRef = React.useRef(false);

  // The previews on which a recording is in progress (see the "Record" button
  // of the debugger).
  const recordingDebuggerIdsRef = React.useRef<Set<DebuggerId>>(new Set());

  const sendTrackingCommand = React.useCallback(
    (debuggerId: DebuggerId) => {
      if (!previewDebuggerServer) return;

      const currentMode = modeRef.current;
      previewDebuggerServer.sendMessage(debuggerId, {
        command: 'setGameSpeedFactor',
        payload: { gameSpeedFactor: getGameSpeedFactorForMode(currentMode) },
      });
      const isTracking =
        currentMode !== 'off' &&
        recordingDebuggerIdsRef.current.has(debuggerId);
      previewDebuggerServer.sendMessage(debuggerId, {
        command: isTracking
          ? 'eventsExecutionTracker.start'
          : 'eventsExecutionTracker.stop',
      });
      if (currentMode === 'frame-by-frame') {
        previewDebuggerServer.sendMessage(debuggerId, { command: 'pause' });
        werePreviewsPausedRef.current = true;
      } else if (werePreviewsPausedRef.current) {
        previewDebuggerServer.sendMessage(debuggerId, { command: 'play' });
      }
    },
    [previewDebuggerServer]
  );

  React.useEffect(
    () => {
      store.setPreviewDebuggerServer(previewDebuggerServer);
      if (!previewDebuggerServer) return;

      const unregisterCallbacks = previewDebuggerServer.registerCallbacks({
        onErrorReceived: () => {},
        onServerStateChanged: () => {},
        onConnectionErrored: () => {},
        onConnectionOpened: ({ id }) => {
          // Only previews are followed, not the games embedded in the editor.
          if (
            modeRef.current !== 'off' &&
            previewDebuggerServer.getExistingPreviewDebuggerIds().includes(id)
          ) {
            sendTrackingCommand(id);
          }
        },
        onConnectionClosed: ({ id, debuggerIds }) => {
          recordingDebuggerIdsRef.current.delete(id);
          if (debuggerIds.length === 0) store.clear();
        },
        onHandleParsedMessage: ({ id, parsedMessage }) => {
          const payload = parsedMessage.payload;
          if (
            parsedMessage.command === 'eventsExecutionTracker.output' &&
            modeRef.current !== 'off'
          ) {
            if (payload) store.ingest(payload);
          } else if (parsedMessage.command === 'status') {
            isPreviewPausedRef.current = !!(payload && payload.isPaused);
            updateHighlightsPersistence();
          } else if (parsedMessage.command === 'profiler.started') {
            recordingDebuggerIdsRef.current.add(id);
            sendTrackingCommand(id);
          } else if (parsedMessage.command === 'profiler.stopped') {
            recordingDebuggerIdsRef.current.delete(id);
            sendTrackingCommand(id);
            store.clear();
          }
        },
      });

      return () => {
        unregisterCallbacks();
        store.setPreviewDebuggerServer(null);
        store.clear();
      };
    },
    [
      previewDebuggerServer,
      store,
      sendTrackingCommand,
      updateHighlightsPersistence,
    ]
  );

  // Apply a mode change to the previews already running.
  React.useEffect(
    () => {
      if (!previewDebuggerServer) return;

      previewDebuggerServer
        .getExistingPreviewDebuggerIds()
        .forEach(sendTrackingCommand);
      if (mode !== 'frame-by-frame') werePreviewsPausedRef.current = false;
      updateHighlightsPersistence();
      if (mode === 'off') store.clear();
    },
    [
      previewDebuggerServer,
      store,
      mode,
      sendTrackingCommand,
      updateHighlightsPersistence,
    ]
  );
};
