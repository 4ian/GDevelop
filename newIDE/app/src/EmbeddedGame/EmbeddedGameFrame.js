// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type PreviewDebuggerServer } from '../ExportAndShare/PreviewLauncher.flow';
import { objectWithContextReactDndType } from '../ObjectsList';
import { makeDropTarget } from '../UI/DragAndDrop/DropTarget';
import Text from '../UI/Text';
import RaisedButton from '../UI/RaisedButton';
import classes from './EmbeddedGameFrame.module.css';
import { type DropTargetMonitor } from 'react-dnd';
import { registerOpenedDialogsCountCallback } from '../UI/Dialog';
import {
  getActiveEmbeddedGameFrameHoleRect,
  registerActiveEmbeddedGameFrameHoleCountCallback,
  registerEmbeddedGameFrameHoleResizeCallback,
} from './EmbeddedGameFrameHole';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import { useInGameEditorSettings } from './InGameEditorSettings';
import { startNativeAppActivity } from '../Utils/NativeAppLifecycle';
import isUserTyping from '../KeyboardShortcuts/IsUserTyping';
import {
  registerInGameEditorQueryHandlers,
  type InGameEditorRaycastRequest,
  type InGameEditorRaycastResult,
  type InGameEditorStatus,
} from './InGameEditorQueries';

type AttachToPreviewOptions = {|
  previewIndexHtmlLocation: string,
|};

export type PreviewInGameEditorTarget = {|
  editorId: string,
  sceneName: string | null,
  externalLayoutName: string | null,
  eventsBasedObjectType: string | null,
  eventsBasedObjectVariantName: string | null,
|};

export type HotReloadSteps = {|
  /**
   * Set to `true` when the `ProjectData` must be reloaded.
   */
  shouldReloadProjectData: boolean,
  /**
   * Set to `true` when GDJS libraries must be reloaded.
   */
  shouldReloadLibraries: boolean,
  /**
   * Set to `true` when the resources must be reloaded in memory.
   */
  shouldReloadResources: boolean,
  /**
   * Set to `true` when an hard reload is needed.
   */
  shouldHardReload: boolean,

  /**
   * The reason for the hot reload. Used for debugging purposes.
   */
  reasons: Array<string>,
|};

const mergeNeededHotReloadSteps = (
  stepsA: HotReloadSteps,
  stepsB: HotReloadSteps
): HotReloadSteps => ({
  shouldReloadProjectData:
    stepsA.shouldReloadProjectData || stepsB.shouldReloadProjectData,
  shouldReloadLibraries:
    stepsA.shouldReloadLibraries || stepsB.shouldReloadLibraries,
  shouldReloadResources:
    stepsA.shouldReloadResources || stepsB.shouldReloadResources,
  shouldHardReload: stepsA.shouldHardReload || stepsB.shouldHardReload,
  reasons: [...stepsA.reasons, ...stepsB.reasons],
});

const isHotReloadNeeded = (hotReloadSteps: HotReloadSteps): boolean =>
  hotReloadSteps.shouldReloadProjectData ||
  hotReloadSteps.shouldReloadLibraries ||
  hotReloadSteps.shouldReloadResources ||
  hotReloadSteps.shouldHardReload;

type ChangeViewPositionCommand =
  | 'centerViewOnLastSelectedInstance'
  | 'zoomToInitialPosition'
  | 'zoomToFitContent'
  | 'zoomToFitSelection';

type SwitchToSceneEditionOptions = {|
  ...PreviewInGameEditorTarget,
  ...HotReloadSteps,
|};

export type EditorCameraState = {|
  cameraMode: 'free' | 'orbit',
  positionX: number,
  positionY: number,
  positionZ: number,
  rotationAngle: number,
  elevationAngle: number,
  distance: number,
|};

let onSetEmbededGameFramePreviewLocation:
  | null
  | (AttachToPreviewOptions => void) = null;
let onSwitchToSceneEdition: null | (SwitchToSceneEditionOptions => void) = null;
let onSetEditorHotReloadNeeded:
  | null
  | ((hotReloadSteps: HotReloadSteps) => void) = null;
let onIsEditorHotReloadNeeded: null | (() => boolean) = null;
let onSwitchInGameEditorIfNoHotReloadIsNeeded:
  | null
  | (PreviewInGameEditorTarget => void) = null;
let onPreventGameFramePointerEvents: null | ((enabled: boolean) => void) = null;
let onSetCameraState:
  | null
  | ((editorId: string, cameraState: EditorCameraState) => void) = null;
let onChangeViewPosition:
  | null
  | ((command: ChangeViewPositionCommand) => void) = null;

export const setEmbeddedGameFramePreviewLocation = ({
  previewIndexHtmlLocation,
}: AttachToPreviewOptions) => {
  if (!onSetEmbededGameFramePreviewLocation)
    throw new Error('No EmbeddedGameFrame registered.');
  onSetEmbededGameFramePreviewLocation({ previewIndexHtmlLocation });
};

export const switchToSceneEdition = (options: SwitchToSceneEditionOptions) => {
  if (!onSwitchToSceneEdition)
    throw new Error('No EmbeddedGameFrame registered.');
  onSwitchToSceneEdition(options);
};

export const setEditorHotReloadNeeded = (hotReloadSteps: HotReloadSteps) => {
  if (!onSetEditorHotReloadNeeded)
    throw new Error('No EmbeddedGameFrame registered.');
  onSetEditorHotReloadNeeded(hotReloadSteps);
};

export const isEditorHotReloadNeeded = (): boolean => {
  if (!onIsEditorHotReloadNeeded)
    throw new Error('No EmbeddedGameFrame registered.');
  return onIsEditorHotReloadNeeded();
};

export const setCameraState = (
  editorId: string,
  cameraState: EditorCameraState
) => {
  if (!onSetCameraState) throw new Error('No EmbeddedGameFrame registered.');
  onSetCameraState(editorId, cameraState);
};

export const switchInGameEditorIfNoHotReloadIsNeeded = (
  previewInGameEditorTarget: PreviewInGameEditorTarget
) => {
  if (!onSwitchInGameEditorIfNoHotReloadIsNeeded)
    throw new Error('No EmbeddedGameFrame registered.');
  onSwitchInGameEditorIfNoHotReloadIsNeeded(previewInGameEditorTarget);
};

export const preventGameFramePointerEvents = (enabled: boolean) => {
  if (!onPreventGameFramePointerEvents)
    throw new Error('No EmbeddedGameFrame registered.');
  onPreventGameFramePointerEvents(enabled);
};

export const changeViewPosition = (command: ChangeViewPositionCommand) => {
  if (!onChangeViewPosition) return;
  onChangeViewPosition(command);
};

const logSwitchingInfo = ({
  editorId,
  sceneName,
  externalLayoutName,
  eventsBasedObjectType,
  eventsBasedObjectVariantName,
  reasons,
}: {|
  ...PreviewInGameEditorTarget,
  reasons: Array<string>,
|}) => {
  console.info(
    eventsBasedObjectType
      ? `Switching in-game edition preview for variant "${eventsBasedObjectVariantName ||
          // $FlowFixMe[constant-condition]
          ''}" of "${eventsBasedObjectType || ''}". Reason(s): ${reasons.join(
          ', '
        )}.`
      : externalLayoutName
      ? // $FlowFixMe[constant-condition]
        `Switching in-game edition previews to external layout "${externalLayoutName ||
          ''}" (scene: "${sceneName || ''}". Reason(s): ${reasons.join(', ')}).`
      : `Switching in-game edition previews to scene "${sceneName ||
          ''}". Reason(s): ${reasons.join(', ')}.`
  );
};

type Props = {|
  previewDebuggerServer: PreviewDebuggerServer | null,
  enabled: boolean,
  // Switch the scene editors to the in-game editor.
  onEnable: () => void,
  onLaunchPreviewForInGameEdition: ({|
    ...PreviewInGameEditorTarget,
    ...HotReloadSteps,
    editorCameraState3D: EditorCameraState | null,
  |}) => Promise<void>,
  // Shown at the bottom of the game, above it (like indicators).
  children?: React.Node,
|};

const DropTarget = makeDropTarget<{||}>(objectWithContextReactDndType);

/**
 * How long the game frame is given to tell the editor that it started, before offering
 * to load it again. The game announces itself as soon as its code is loaded, before any
 * resource is loaded, so this only has to cover the loading of the game code.
 */
const GAME_FRAME_START_TIMEOUT_MS = 15000;

const noHotReloadSteps = {
  shouldReloadProjectData: false,
  shouldReloadLibraries: false,
  shouldReloadResources: false,
  shouldHardReload: false,
  reasons: [],
};

export const EmbeddedGameFrame = ({
  previewDebuggerServer,
  onLaunchPreviewForInGameEdition,
  enabled,
  onEnable,
  children,
}: Props): React.MixedElement => {
  const [
    previewIndexHtmlLocation,
    setPreviewIndexHtmlLocation,
  ] = React.useState<string>('');
  const [
    isPointerEventsPrevented,
    setIsPointerEventsPrevented,
  ] = React.useState(false);
  // The preview location is identical for every preview of a session, so it can't be
  // used on its own to navigate the iframe again: this identifies a single load of the
  // frame, and changing it is what actually reloads the game.
  const [gameFrameLoadId, setGameFrameLoadId] = React.useState<number>(0);
  const [isGameFrameStarted, setIsGameFrameStarted] = React.useState(false);
  const [
    hasGameFrameStartTimedOut,
    setHasGameFrameStartTimedOut,
  ] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  // $FlowFixMe[incompatible-type]
  const hotReloadSteps = React.useRef<HotReloadSteps>(noHotReloadSteps);
  const lastPreviewContainer = React.useRef<PreviewInGameEditorTarget | null>(
    null
  );
  const isPreviewOngoing = React.useRef<boolean>(false);
  const hasGameFrameSomethingToLoad = React.useRef<boolean>(false);
  const cameraStates = React.useRef<Map<string, EditorCameraState>>(
    new Map<string, EditorCameraState>()
  );
  const keyboardShortcuts = React.useRef<KeyboardShortcuts>(
    new KeyboardShortcuts({
      isActive: () => true,
      shortcutCallbacks: {},
    })
  );
  const hasSomeDialogOpen = React.useRef<boolean>(false);

  // Let the changes that were made while a preview was launching be applied, now that
  // the game frame settled (the game started, or it was given up on).
  const settleOngoingPreview = React.useCallback(() => {
    if (!isPreviewOngoing.current) return;
    isPreviewOngoing.current = false;

    if (
      isHotReloadNeeded(hotReloadSteps.current) &&
      lastPreviewContainer.current
    ) {
      switchToSceneEdition({
        ...lastPreviewContainer.current,
        shouldReloadProjectData: false,
        shouldReloadLibraries: false,
        shouldReloadResources: false,
        shouldHardReload: false,
        reasons: ['post-launch-preview'],
      });
    }
  }, []);

  // The game is displayed in an iframe, which is a separate document: it only receives
  // the keyboard events if it has the focus. Give it the focus as soon as it is hovered,
  // so that the in-game editor shortcuts (notably space to move the view) can be used
  // without having to click on the game first.
  const focusGameFrameOnHover = React.useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    // A dialog can be opened on top of the game, or show it through a "hole": don't
    // fight with its focus trap.
    if (hasSomeDialogOpen.current) return;

    // Nothing to do if the game is already focused, and don't interrupt the user while
    // a text is being edited (renaming an object, editing a property...).
    if (document.activeElement === iframe || isUserTyping()) return;

    iframe.contentWindow.focus();
  }, []);

  // Send the part of the game frame that is not covered by the editor panels,
  // either with a command changing the view or so that the in-game editor
  // can use it later (e.g. to focus on the selection).
  const sendVisibleScreenArea = React.useCallback(
    (command: ChangeViewPositionCommand | 'setVisibleScreenArea') => {
      const iframe = iframeRef.current;
      if (!iframe || !previewDebuggerServer) return;

      const embeddedGameFrameRect = iframe.getBoundingClientRect();
      const embeddedGameFrameHoleRect = getActiveEmbeddedGameFrameHoleRect();
      if (
        !embeddedGameFrameHoleRect ||
        !embeddedGameFrameRect.width ||
        !embeddedGameFrameRect.height
      )
        return;

      const visibleScreenArea = {
        minX:
          (embeddedGameFrameHoleRect.left - embeddedGameFrameRect.left) /
          embeddedGameFrameRect.width,
        minY:
          (embeddedGameFrameHoleRect.top - embeddedGameFrameRect.top) /
          embeddedGameFrameRect.height,
        maxX:
          (embeddedGameFrameHoleRect.right - embeddedGameFrameRect.left) /
          embeddedGameFrameRect.width,
        maxY:
          (embeddedGameFrameHoleRect.bottom - embeddedGameFrameRect.top) /
          embeddedGameFrameRect.height,
      };
      previewDebuggerServer
        .getExistingEmbeddedGameFrameDebuggerIds()
        .forEach(debuggerId => {
          previewDebuggerServer.sendMessage(debuggerId, {
            command,
            payload: { visibleScreenArea },
          });
        });
    },
    [previewDebuggerServer]
  );

  React.useEffect(
    () =>
      registerEmbeddedGameFrameHoleResizeCallback(() =>
        sendVisibleScreenArea('setVisibleScreenArea')
      ),
    [sendVisibleScreenArea]
  );

  const inGameEditorSettings = useInGameEditorSettings();
  React.useEffect(
    () => {
      if (!previewDebuggerServer) return;

      previewDebuggerServer
        .getExistingEmbeddedGameFrameDebuggerIds()
        .forEach((debuggerId: string) => {
          previewDebuggerServer.sendMessage(debuggerId, {
            command: 'setInGameEditorSettings',
            payload: { inGameEditorSettings },
          });
        });
    },
    [previewDebuggerServer, inGameEditorSettings]
  );

  React.useEffect(
    () => {
      // TODO: use a real context for this to handle several in-game editors.
      onSetEmbededGameFramePreviewLocation = (
        options: AttachToPreviewOptions
      ): void => {
        setPreviewIndexHtmlLocation(options.previewIndexHtmlLocation);
        // No game is running in the frame, so this is a new game to load rather than a
        // hot-reload: navigate the iframe again. Without this, a load that failed (a
        // navigation that never completed, files that could not be served...) would
        // stay failed forever, as the location alone never changes.
        if (!isGameFrameStarted) {
          setGameFrameLoadId(loadId => loadId + 1);
        }
        hasGameFrameSomethingToLoad.current = true;
        const iframe = iframeRef.current;
        if (iframe) {
          iframe.contentWindow.focus();
        }
      };
      onPreventGameFramePointerEvents = (enabled: boolean) => {
        setIsPointerEventsPrevented(enabled);
      };
      onSetEditorHotReloadNeeded = (addedHotReloadSteps: HotReloadSteps) => {
        hotReloadSteps.current = mergeNeededHotReloadSteps(
          hotReloadSteps.current,
          addedHotReloadSteps
        );
      };
      onIsEditorHotReloadNeeded = (): boolean => {
        return isHotReloadNeeded(hotReloadSteps.current);
      };
      onSetCameraState = (editorId: string, cameraState: EditorCameraState) => {
        cameraStates.current.set(editorId, cameraState);
      };
      onSwitchToSceneEdition = (options: SwitchToSceneEditionOptions) => {
        if (!previewDebuggerServer) return;
        if (!enabled) return;

        const {
          editorId,
          sceneName,
          externalLayoutName,
          eventsBasedObjectType,
          eventsBasedObjectVariantName,
        } = options;

        lastPreviewContainer.current = {
          editorId,
          sceneName,
          externalLayoutName,
          eventsBasedObjectType,
          eventsBasedObjectVariantName,
        };
        if (isPreviewOngoing.current) {
          const {
            shouldReloadProjectData,
            shouldReloadLibraries,
            shouldReloadResources,
            shouldHardReload,
            reasons,
          } = options;
          setEditorHotReloadNeeded({
            shouldReloadProjectData,
            shouldReloadLibraries,
            shouldReloadResources,
            shouldHardReload,
            reasons,
          });
          return;
        }

        const {
          shouldReloadProjectData,
          shouldReloadLibraries,
          shouldReloadResources,
          shouldHardReload,
          reasons,
        } = mergeNeededHotReloadSteps(hotReloadSteps.current, {
          shouldReloadProjectData: options.shouldReloadProjectData,
          shouldReloadLibraries: options.shouldReloadLibraries,
          shouldReloadResources: options.shouldReloadResources,
          shouldHardReload: options.shouldHardReload,
          reasons: options.reasons,
        });
        const hotReload = isHotReloadNeeded({
          shouldReloadProjectData,
          shouldReloadLibraries,
          shouldReloadResources,
          shouldHardReload,
          reasons,
        });
        if (!previewIndexHtmlLocation || hotReload) {
          console.info(
            eventsBasedObjectType
              ? `Launching in-game edition preview for variant "${eventsBasedObjectVariantName ||
                  // $FlowFixMe[constant-condition]
                  ''}" of "${eventsBasedObjectType ||
                  ''}". Reason(s): ${reasons.join(', ')}.`
              : externalLayoutName
              ? // $FlowFixMe[constant-condition]
                `Launching in-game edition preview for external layout "${externalLayoutName ||
                  ''}" (scene: "${sceneName || ''}"). Reason(s): ${reasons.join(
                  ', '
                )}.`
              : `Launching in-game edition preview for scene "${sceneName ||
                  ''}". Reason(s): ${reasons.join(', ')}.`
          );
          // $FlowFixMe[incompatible-type]
          hotReloadSteps.current = noHotReloadSteps;
          isPreviewOngoing.current = true;

          onLaunchPreviewForInGameEdition({
            editorId,
            sceneName,
            externalLayoutName,
            eventsBasedObjectType,
            eventsBasedObjectVariantName,
            shouldReloadProjectData,
            shouldReloadLibraries,
            shouldReloadResources,
            shouldHardReload,
            reasons,
            editorCameraState3D: cameraStates.current.get(editorId) || null,
          }).finally(() => {
            // A game that is (re)loading must tell the editor it started before
            // anything else is exported: an export erases the files it is still
            // loading, which makes it crash while starting. The preview is then
            // settled when the game starts - or when it is given up on.
            const isGameRunningInFrame = !!previewDebuggerServer.getExistingEmbeddedGameFrameDebuggerIds()
              .length;
            if (!isGameRunningInFrame && hasGameFrameSomethingToLoad.current) {
              return;
            }

            settleOngoingPreview();
          });
        } else {
          logSwitchingInfo({
            editorId,
            sceneName,
            externalLayoutName,
            eventsBasedObjectType,
            eventsBasedObjectVariantName,
            reasons,
          });
          previewDebuggerServer
            .getExistingEmbeddedGameFrameDebuggerIds()
            .forEach(debuggerId => {
              previewDebuggerServer.sendMessage(debuggerId, {
                command: 'switchForInGameEdition',
                editorId,
                sceneName,
                externalLayoutName,
                eventsBasedObjectType,
                eventsBasedObjectVariantName,
                editorCamera3D: cameraStates.current.get(editorId),
              });
            });
          sendVisibleScreenArea('setVisibleScreenArea');
        }
      };
      onSwitchInGameEditorIfNoHotReloadIsNeeded = ({
        editorId,
        sceneName,
        externalLayoutName,
        eventsBasedObjectType,
        eventsBasedObjectVariantName,
      }: PreviewInGameEditorTarget) => {
        if (!previewDebuggerServer) return;
        if (!enabled) return;
        if (isHotReloadNeeded(hotReloadSteps.current)) {
          return;
        }
        lastPreviewContainer.current = {
          editorId,
          sceneName,
          externalLayoutName,
          eventsBasedObjectType,
          eventsBasedObjectVariantName,
        };
        logSwitchingInfo({
          editorId,
          sceneName,
          externalLayoutName,
          eventsBasedObjectType,
          eventsBasedObjectVariantName,
          reasons: ['switched-editor-and-no-hot-reload-is-needed'],
        });
        previewDebuggerServer
          .getExistingEmbeddedGameFrameDebuggerIds()
          .forEach(debuggerId => {
            previewDebuggerServer.sendMessage(debuggerId, {
              command: 'switchForInGameEdition',
              editorId,
              sceneName,
              externalLayoutName,
              eventsBasedObjectType,
              eventsBasedObjectVariantName,
              cameraState3D: cameraStates.current.get(editorId),
            });
          });
        sendVisibleScreenArea('setVisibleScreenArea');
      };
      onChangeViewPosition = (command: ChangeViewPositionCommand) => {
        sendVisibleScreenArea(command);
      };
      registerInGameEditorQueryHandlers({
        enable: onEnable,
        update: (): InGameEditorStatus => {
          if (!previewDebuggerServer || !enabled) return 'disabled';
          if (isPreviewOngoing.current) return 'updating';
          if (isHotReloadNeeded(hotReloadSteps.current)) {
            // The changes wait for an editor to be shown: apply them to the
            // one shown now.
            if (lastPreviewContainer.current && onSwitchToSceneEdition) {
              onSwitchToSceneEdition({
                ...lastPreviewContainer.current,
                shouldReloadProjectData: false,
                shouldReloadLibraries: false,
                shouldReloadResources: false,
                shouldHardReload: false,
                reasons: ['in-game-editor-update-requested'],
              });
            }
            return 'updating';
          }
          return 'up-to-date';
        },
        raycast: async (
          request: InGameEditorRaycastRequest
        ): Promise<InGameEditorRaycastResult> => {
          if (!previewDebuggerServer || !enabled)
            throw new Error('The in-game editor is not used.');
          // Many rays can take seconds on a large scene.
          const answer = await previewDebuggerServer.sendMessageWithResponse(
            { command: 'raycast', payload: request },
            { timeoutMs: 10000 }
          );
          return answer.payload;
        },
      });
    },
    [
      previewDebuggerServer,
      previewIndexHtmlLocation,
      onLaunchPreviewForInGameEdition,
      enabled,
      onEnable,
      sendVisibleScreenArea,
      isGameFrameStarted,
      settleOngoingPreview,
    ]
  );

  const iframeSource = previewIndexHtmlLocation
    ? `${previewIndexHtmlLocation}?gameFrameLoadId=${gameFrameLoadId}`
    : '';

  // A new location is a new game to load: it has to announce itself again.
  React.useEffect(
    () => {
      setIsGameFrameStarted(false);
    },
    [iframeSource]
  );

  // Wait for the game to announce itself. "Started" and "waited for too long" are kept
  // separate on purpose: a game that answers late (a big project on a slow device)
  // dismisses the message by itself, without anything having to cancel the timeout.
  React.useEffect(
    () => {
      if (!iframeSource || isGameFrameStarted) return undefined;

      setHasGameFrameStartTimedOut(false);
      const timeoutId = setTimeout(() => {
        setHasGameFrameStartTimedOut(true);
        // Don't keep the editor waiting on a game that will never start.
        settleOngoingPreview();
      }, GAME_FRAME_START_TIMEOUT_MS);
      return () => clearTimeout(timeoutId);
    },
    [iframeSource, isGameFrameStarted, settleOngoingPreview]
  );

  React.useEffect(
    () => {
      if (!previewDebuggerServer) return undefined;

      return previewDebuggerServer.registerCallbacks({
        onErrorReceived: () => {},
        onServerStateChanged: () => {},
        onConnectionClosed: ({ id }) => {
          // The game left the frame (it was asked to reload itself, or it was closed):
          // it must announce itself again before the frame can be used.
          if (id === 'embedded-game-frame') setIsGameFrameStarted(false);
        },
        onConnectionOpened: () => {},
        onConnectionErrored: () => {},
        onHandleParsedMessage: ({ id, parsedMessage }) => {
          // Any status from the game proves it is running - but only if it comes from
          // the load being waited for, and not from one that is being replaced.
          if (
            id === 'embedded-game-frame' &&
            parsedMessage.command === 'status' &&
            parsedMessage.payload &&
            parsedMessage.payload.gameFrameLoadId === String(gameFrameLoadId)
          ) {
            setIsGameFrameStarted(true);
          }
        },
      });
    },
    [previewDebuggerServer, gameFrameLoadId]
  );

  React.useEffect(
    () => {
      if (previewDebuggerServer)
        previewDebuggerServer.setEmbeddedGameFrameReady(isGameFrameStarted);
      if (isGameFrameStarted) settleOngoingPreview();
    },
    [previewDebuggerServer, isGameFrameStarted, settleOngoingPreview]
  );

  const onReloadGameFrame = React.useCallback(() => {
    const lastPreviewInGameEditorTarget = lastPreviewContainer.current;
    if (!lastPreviewInGameEditorTarget) {
      setGameFrameLoadId(loadId => loadId + 1);
      return;
    }

    // Launch a whole new preview: the files served to the frame could be the problem.
    switchToSceneEdition({
      ...lastPreviewInGameEditorTarget,
      shouldReloadProjectData: true,
      shouldReloadLibraries: true,
      shouldReloadResources: true,
      shouldHardReload: true,
      reasons: ['reloaded-after-game-frame-did-not-start'],
    });
  }, []);

  // A game loaded in the frame adds its whole memory to the one used by the editor.
  React.useEffect(
    () => {
      if (!previewIndexHtmlLocation) return undefined;

      return startNativeAppActivity('embedded-in-game-editor');
    },
    [previewIndexHtmlLocation]
  );

  // Register the iframe window in the debugger as soon as the iframe is shown.
  React.useEffect(() => {
    const iframe = iframeRef.current;
    const hasSomethingLoaded = !!previewIndexHtmlLocation;
    if (previewDebuggerServer && iframe && hasSomethingLoaded)
      previewDebuggerServer.registerEmbeddedGameFrame(iframe.contentWindow);
  });

  // Unregister the iframe window in the debugger when the EmbeddedGameFrame is unmounted
  // (or in the unlikely case the previewDebuggerServer is changed).
  React.useEffect(
    () => {
      const iframe = iframeRef.current;
      const previousPreviewDebuggerServer = previewDebuggerServer;
      return () => {
        if (previousPreviewDebuggerServer && iframe) {
          previousPreviewDebuggerServer.unregisterEmbeddedGameFrame(
            iframe.contentWindow
          );
        }
      };
    },
    [previewDebuggerServer]
  );

  const [isDraggedItem3D, setDraggedItem3D] = React.useState(false);
  const dropTargetRef = React.useRef<HTMLDivElement | null>(null);

  const dragNewInstance = React.useCallback(
    ({
      monitor,
      dropped,
      isAltPressed,
    }: {
      monitor: DropTargetMonitor,
      dropped: boolean,
      isAltPressed: boolean,
    }) => {
      const dropTarget = dropTargetRef.current;
      if (!previewDebuggerServer || !dropTarget) return;

      const name = monitor.getItem().name;
      if (!name) return;

      setDraggedItem3D(!!monitor.getItem().is3D);

      const clientOffset = monitor.getClientOffset();
      const dropTargetRect = dropTarget.getBoundingClientRect();

      previewDebuggerServer
        .getExistingEmbeddedGameFrameDebuggerIds()
        .forEach(debuggerId => {
          previewDebuggerServer.sendMessage(debuggerId, {
            command: 'dragNewInstance',
            x: clientOffset.x - dropTargetRect.left,
            y: clientOffset.y - dropTargetRect.top,
            name,
            dropped,
            isAltPressed: keyboardShortcuts.current.shouldNotSnapToGrid(),
          });
        });
    },
    [previewDebuggerServer]
  );

  React.useEffect(
    () => {
      let hasSomeEmbeddedGameFrameHoleActive = false;

      const sendInGameEditorVisibleStatus = () => {
        if (previewDebuggerServer) {
          previewDebuggerServer
            .getExistingEmbeddedGameFrameDebuggerIds()
            .forEach(debuggerId => {
              previewDebuggerServer.sendMessage(debuggerId, {
                command: 'setVisibleStatus',
                visible:
                  !hasSomeDialogOpen.current &&
                  hasSomeEmbeddedGameFrameHoleActive,
              });
            });
        }
      };

      const unregisterDialogOpenCallback = registerOpenedDialogsCountCallback(
        ({ openedDialogsCount }) => {
          hasSomeDialogOpen.current = openedDialogsCount > 0;
          sendInGameEditorVisibleStatus();
        }
      );

      const unregisterEmbeddedGameFrameHoleActiveCallback = registerActiveEmbeddedGameFrameHoleCountCallback(
        ({ activeEmbeddedGameFrameHoleCount }) => {
          hasSomeEmbeddedGameFrameHoleActive =
            activeEmbeddedGameFrameHoleCount > 0;
          sendInGameEditorVisibleStatus();
        }
      );

      return () => {
        unregisterDialogOpenCallback();
        unregisterEmbeddedGameFrameHoleActiveCallback();
      };
    },
    [previewDebuggerServer]
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 38 + 40, // Height of the tabs + toolbar.
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onKeyDown={keyboardShortcuts.current.onKeyDown}
      onKeyUp={keyboardShortcuts.current.onKeyUp}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <iframe
          ref={iframeRef}
          title="Game Preview"
          src={iframeSource}
          tabIndex={0}
          // Listened on the iframe itself and not on its container, so that the overlay
          // covering it (drop target, pointer events blocker) doesn't take the focus.
          onMouseOver={focusGameFrameOnHover}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
        <DropTarget
          canDrop={() => true}
          // TODO: "isAltPressed" is hardcoded to false, but we should detect it instead.
          hover={monitor =>
            dragNewInstance({ monitor, dropped: false, isAltPressed: false })
          }
          drop={monitor =>
            dragNewInstance({ monitor, dropped: true, isAltPressed: false })
          }
        >
          {({ connectDropTarget, canDrop, isOver }) => {
            if (!isOver) {
              // TODO: Move these into a helper.
              if (previewDebuggerServer) {
                previewDebuggerServer
                  .getExistingEmbeddedGameFrameDebuggerIds()
                  .forEach(debuggerId => {
                    previewDebuggerServer.sendMessage(debuggerId, {
                      command: 'cancelDragNewInstance',
                    });
                  });
              }
            }

            return connectDropTarget(
              <div
                style={{
                  // Display the div that acts either as a drop target or as a "blocker"
                  // to avoid the iframe stealing drag/resize mouse/touch events.
                  display:
                    canDrop || isPointerEventsPrevented ? 'flex' : 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                id="embedded-game-frame-drop-target"
                ref={dropTargetRef}
              >
                {canDrop && (
                  <div className={classes.hintText}>
                    {isDraggedItem3D ? (
                      <Text color="inherit">
                        <Trans>Drag here to add to the scene</Trans>
                      </Text>
                    ) : (
                      <Text color="inherit">
                        <Trans>
                          2D objects can't be edited when in 3D mode
                        </Trans>
                      </Text>
                    )}
                  </div>
                )}
              </div>
            );
          }}
        </DropTarget>
        {enabled && children && (
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {children}
          </div>
        )}
        {hasGameFrameStartTimedOut && !isGameFrameStarted && (
          <div className={classes.notStartedOverlay}>
            <Text color="inherit" align="center">
              <Trans>The game preview did not start.</Trans>
            </Text>
            <RaisedButton
              primary
              label={<Trans>Reload</Trans>}
              onClick={onReloadGameFrame}
            />
          </div>
        )}
      </div>
    </div>
  );
};
