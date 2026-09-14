// @flow
import * as React from 'react';
import {
  type PreviewDebuggerServer,
  type DebuggerId,
} from '../ExportAndShare/PreviewLauncher.flow';
import {
  getGameSpeedFactorForPlaySpeed,
  type DebuggerPlaySpeed,
} from './EventsExecutionTrackingStore';
import EventsExecutionTrackingContext from './EventsExecutionTrackingContext';

type Props = {|
  previewDebuggerServer: ?PreviewDebuggerServer,
  playSpeed: DebuggerPlaySpeed,
  /** The values of the game are only read while the debugger is opened. */
  isDebuggerOpened: boolean,
|};

/**
 * Ask the running previews to report the execution of their events, and feed
 * what they report to a store that the events sheets can read from. The
 * execution is followed as long as the game plays, at the play speed chosen
 * in the debugger.
 */
export const useEventsExecutionTracking = ({
  previewDebuggerServer,
  playSpeed,
  isDebuggerOpened,
}: Props): void => {
  const store = React.useContext(EventsExecutionTrackingContext);
  store.setDebuggerOpened(isDebuggerOpened);
  // Read by the callbacks registered once on the server, without re-registering.
  const playSpeedRef = React.useRef(playSpeed);
  playSpeedRef.current = playSpeed;

  const sendTrackingCommand = React.useCallback(
    (debuggerId: DebuggerId) => {
      if (!previewDebuggerServer) return;

      previewDebuggerServer.sendMessage(debuggerId, {
        command: 'setGameSpeedFactor',
        payload: {
          gameSpeedFactor: getGameSpeedFactorForPlaySpeed(playSpeedRef.current),
        },
      });
      previewDebuggerServer.sendMessage(debuggerId, {
        command: 'eventsExecutionTracker.start',
      });
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
            previewDebuggerServer.getExistingPreviewDebuggerIds().includes(id)
          ) {
            // What the previous game showed is replaced by this one.
            store.clear();
            store.setHighlightsPersistent(false);
            sendTrackingCommand(id);
          }
        },
        onConnectionClosed: () => {
          // The last frame of a closed game stays shown, like the frame of a
          // paused game: nothing else runs until another preview starts.
          if (
            previewDebuggerServer.getExistingPreviewDebuggerIds().length === 0
          ) {
            store.setHighlightsPersistent(true);
            store.setRunningSceneName(null);
          }
        },
        onHandleParsedMessage: ({ id, parsedMessage }) => {
          // Only previews are followed, not the games embedded in the editor.
          if (
            !previewDebuggerServer.getExistingPreviewDebuggerIds().includes(id)
          )
            return;
          const payload = parsedMessage.payload;
          if (parsedMessage.command === 'eventsExecutionTracker.output') {
            if (payload) store.ingest(payload);
          } else if (parsedMessage.command === 'status') {
            // A paused game (by the "pause" action of the game or by the
            // debugger, which then advances it frame by frame) keeps its last
            // frame highlighted, as nothing else will run.
            store.setHighlightsPersistent(!!(payload && payload.isPaused));
            if (payload && !payload.isInGameEdition) {
              store.setRunningSceneName(payload.sceneName || null);
            }
          }
        },
      });

      return () => {
        unregisterCallbacks();
        store.setPreviewDebuggerServer(null);
        store.clear();
      };
    },
    [previewDebuggerServer, store, sendTrackingCommand]
  );

  // Apply a play speed change to the previews already running.
  React.useEffect(
    () => {
      if (!previewDebuggerServer) return;

      previewDebuggerServer
        .getExistingPreviewDebuggerIds()
        .forEach(sendTrackingCommand);
    },
    [previewDebuggerServer, playSpeed, sendTrackingCommand]
  );
};
