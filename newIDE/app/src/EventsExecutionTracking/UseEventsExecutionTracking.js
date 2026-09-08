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
|};

/**
 * Ask the running previews to report the execution of their events according
 * to the mode, and feed what they report to a store that the events sheets
 * can read from.
 */
export const useEventsExecutionTracking = ({
  previewDebuggerServer,
  mode,
}: Props): void => {
  const store = React.useContext(EventsExecutionTrackingContext);
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

  const sendTrackingCommand = React.useCallback(
    (debuggerId: DebuggerId) => {
      if (!previewDebuggerServer) return;

      const currentMode = modeRef.current;
      if (currentMode === 'off') {
        previewDebuggerServer.sendMessage(debuggerId, {
          command: 'eventsExecutionTracker.stop',
        });
      } else {
        previewDebuggerServer.sendMessage(debuggerId, {
          command: 'eventsExecutionTracker.start',
          payload: { gameSpeedFactor: getGameSpeedFactorForMode(currentMode) },
        });
      }
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
        onConnectionClosed: ({ debuggerIds }) => {
          if (debuggerIds.length === 0) store.clear();
        },
        onHandleParsedMessage: ({ parsedMessage }) => {
          if (
            parsedMessage.command === 'eventsExecutionTracker.output' &&
            modeRef.current !== 'off'
          ) {
            store.ingest(parsedMessage.payload);
          } else if (parsedMessage.command === 'status') {
            isPreviewPausedRef.current = !!parsedMessage.payload.isPaused;
            updateHighlightsPersistence();
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
