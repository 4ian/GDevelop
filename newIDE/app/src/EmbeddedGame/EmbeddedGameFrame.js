// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type PreviewDebuggerServer } from '../ExportAndShare/PreviewLauncher.flow';
import { objectWithContextReactDndType } from '../ObjectsList';
import { makeDropTarget } from '../UI/DragAndDrop/DropTarget';
import Text from '../UI/Text';
import classes from './EmbeddedGameFrame.module.css';
import { type DropTargetMonitor } from 'react-dnd';
import { registerOpenedDialogsCountCallback } from '../UI/Dialog';
import {
  getActiveEmbeddedGameFrameHoleRect,
  registerActiveEmbeddedGameFrameHoleCountCallback,
} from './EmbeddedGameFrameHole';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';

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
          ''}" of "${eventsBasedObjectType || ''}". Reason(s): ${reasons.join(
          ', '
        )}.`
      : externalLayoutName
      ? `Switching in-game edition previews to external layout "${externalLayoutName ||
          ''}" (scene: "${sceneName || ''}". Reason(s): ${reasons.join(', ')}).`
      : `Switching in-game edition previews to scene "${sceneName ||
          ''}". Reason(s): ${reasons.join(', ')}.`
  );
};

type Props = {|
  previewDebuggerServer: PreviewDebuggerServer | null,
  enabled: boolean,
  onLaunchPreviewForInGameEdition: ({|
    ...PreviewInGameEditorTarget,
    ...HotReloadSteps,
    editorCameraState3D: EditorCameraState | null,
  |}) => Promise<void>,
|};

const DropTarget = makeDropTarget<{||}>(objectWithContextReactDndType);

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
}: Props) => {
  const [
    previewIndexHtmlLocation,
    setPreviewIndexHtmlLocation,
  ] = React.useState<string>('');
  const [
    isPointerEventsPrevented,
    setIsPointerEventsPrevented,
  ] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const hotReloadSteps = React.useRef<HotReloadSteps>(noHotReloadSteps);
  const lastPreviewContainer = React.useRef<PreviewInGameEditorTarget | null>(
    null
  );
  const isPreviewOngoing = React.useRef<boolean>(false);
  const cameraStates = React.useRef<Map<string, EditorCameraState>>(
    new Map<string, EditorCameraState>()
  );
  const keyboardShortcuts = React.useRef<KeyboardShortcuts>(
    new KeyboardShortcuts({
      isActive: () => true,
      shortcutCallbacks: {},
    })
  );

  React.useEffect(
    () => {
      // TODO: use a real context for this to handle several in-game editors.
      onSetEmbededGameFramePreviewLocation = (
        options: AttachToPreviewOptions
      ): void => {
        setPreviewIndexHtmlLocation(options.previewIndexHtmlLocation);
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
                  ''}" of "${eventsBasedObjectType ||
                  ''}". Reason(s): ${reasons.join(', ')}.`
              : externalLayoutName
              ? `Launching in-game edition preview for external layout "${externalLayoutName ||
                  ''}" (scene: "${sceneName || ''}"). Reason(s): ${reasons.join(
                  ', '
                )}.`
              : `Launching in-game edition preview for scene "${sceneName ||
                  ''}". Reason(s): ${reasons.join(', ')}.`
          );
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
          previewDebuggerServer.getExistingDebuggerIds().forEach(debuggerId => {
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
        previewDebuggerServer.getExistingDebuggerIds().forEach(debuggerId => {
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
      };
      onChangeViewPosition = (command: ChangeViewPositionCommand) => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const embeddedGameFrameRect = iframe.getBoundingClientRect();
        const embeddedGameFrameHoleRect = getActiveEmbeddedGameFrameHoleRect();
        if (!embeddedGameFrameHoleRect || !embeddedGameFrameRect) return;

        if (!previewDebuggerServer) return;
        previewDebuggerServer.getExistingDebuggerIds().forEach(debuggerId => {
          previewDebuggerServer.sendMessage(debuggerId, {
            command,
            payload: {
              visibleScreenArea: {
                minX:
                  (embeddedGameFrameHoleRect.left -
                    embeddedGameFrameRect.left) /
                  embeddedGameFrameRect.width,
                minY:
                  (embeddedGameFrameHoleRect.top - embeddedGameFrameRect.top) /
                  embeddedGameFrameRect.height,
                maxX:
                  (embeddedGameFrameHoleRect.right -
                    embeddedGameFrameRect.left) /
                  embeddedGameFrameRect.width,
                maxY:
                  (embeddedGameFrameHoleRect.bottom -
                    embeddedGameFrameRect.top) /
                  embeddedGameFrameRect.height,
              },
            },
          });
        });
      };
    },
    [
      previewDebuggerServer,
      previewIndexHtmlLocation,
      onLaunchPreviewForInGameEdition,
      enabled,
    ]
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

      previewDebuggerServer.getExistingDebuggerIds().forEach(debuggerId => {
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
      let hasSomeDialogOpen = false;
      let hasSomeEmbeddedGameFrameHoleActive = false;

      const sendInGameEditorVisibleStatus = () => {
        if (previewDebuggerServer) {
          previewDebuggerServer.getExistingDebuggerIds().forEach(debuggerId => {
            previewDebuggerServer.sendMessage(debuggerId, {
              command: 'setVisibleStatus',
              visible: !hasSomeDialogOpen && hasSomeEmbeddedGameFrameHoleActive,
            });
          });
        }
      };

      const unregisterDialogOpenCallback = registerOpenedDialogsCountCallback(
        ({ openedDialogsCount }) => {
          hasSomeDialogOpen = openedDialogsCount > 0;
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
      // TODO No key event is received probably because the focus is on the object list.
      onKeyDown={keyboardShortcuts.current.onKeyDown}
      onKeyUp={keyboardShortcuts.current.onKeyUp}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <iframe
          ref={iframeRef}
          title="Game Preview"
          src={previewIndexHtmlLocation}
          tabIndex={-1}
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
                  .getExistingDebuggerIds()
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
      </div>
    </div>
  );
};
