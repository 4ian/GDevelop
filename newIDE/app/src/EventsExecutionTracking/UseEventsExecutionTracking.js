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
  // In an effect of its own: closing the debugger makes the store forget what
  // it shows, which must not happen while the editor renders. The dependencies
  // of the main effect are left alone, so that the callbacks of the server are
  // not registered again every time the debugger is opened.
  React.useEffect(
    () => {
      store.setDebuggerOpened(isDebuggerOpened);
    },
    [store, isDebuggerOpened]
  );

  // Read by the callbacks registered once on the server, without re-registering.
  const playSpeedRef = React.useRef(playSpeed);
  playSpeedRef.current = playSpeed;

  // The previews already asked to report what they execute. In the browser,
  // the editor registers the preview window as soon as it asks it to load the
  // game: the game is not listening yet, and the command sent then is lost.
  // It is sent again on the first sign of life of the game, which is the
  // status it sends once its first scene is loaded.
  const trackedDebuggerIdsRef = React.useRef<Set<DebuggerId>>(new Set());

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
            trackedDebuggerIdsRef.current.delete(id);
            sendTrackingCommand(id);
          }
        },
        onConnectionClosed: ({ id }) => {
          trackedDebuggerIdsRef.current.delete(id);
          // The last frame of a closed game stays shown, like the frame of a
          // paused game: nothing else runs until another preview starts. It is
          // only kept while somebody looks at it, which the store decides.
          if (
            previewDebuggerServer.getExistingPreviewDebuggerIds().length === 0
          ) {
            store.onAllPreviewsClosed();
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
            // The game answers: it is listening now, so the command it may
            // have missed while it was loading is sent again.
            if (!trackedDebuggerIdsRef.current.has(id)) {
              trackedDebuggerIdsRef.current.add(id);
              sendTrackingCommand(id);
            }
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
