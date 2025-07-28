// @flow
import * as React from 'react';
import { type PreviewDebuggerServer } from '../ExportAndShare/PreviewLauncher.flow';
import { objectWithContextReactDndType } from '../ObjectsList';
import { makeDropTarget } from '../UI/DragAndDrop/DropTarget';
import Text from '../UI/Text';
import classes from './EmbeddedGameFrame.module.css';

type AttachToPreviewOptions = {|
  previewIndexHtmlLocation: string,
|};

type EditorContentIdentifiers = {|
  editorId: string,
  sceneName: string | null,
  externalLayoutName: string | null,
  eventsBasedObjectType: string | null,
  eventsBasedObjectVariantName: string | null,
|};

type SwitchToSceneEditionOptions = {|
  ...EditorContentIdentifiers,
  hotReload: boolean,
  projectDataOnlyExport: boolean,
  shouldReloadResources: boolean,
|};

let onAttachToPreview: null | (AttachToPreviewOptions => void) = null;
let onSwitchToSceneEdition: null | (SwitchToSceneEditionOptions => void) = null;
let onSetEditorHotReloadNeeded:
  | null
  | (({|
      projectDataOnlyExport: boolean,
      shouldReloadResources: boolean,
    |}) => void) = null;
let onSwitchInGameEditorIfNoHotReloadIsNeeded:
  | null
  | (EditorContentIdentifiers => void) = null;
let onPreventGameFramePointerEvents: null | ((enabled: boolean) => void) = null;

export const attachToPreview = ({
  previewIndexHtmlLocation,
}: AttachToPreviewOptions) => {
  if (!onAttachToPreview) throw new Error('No EmbeddedGameFrame registered.');
  onAttachToPreview({ previewIndexHtmlLocation });
};

export const switchToSceneEdition = (options: SwitchToSceneEditionOptions) => {
  if (!onSwitchToSceneEdition)
    throw new Error('No EmbeddedGameFrame registered.');
  onSwitchToSceneEdition(options);
};

export const setEditorHotReloadNeeded = (hotReloadProps: {|
  projectDataOnlyExport: boolean,
  shouldReloadResources: boolean,
|}) => {
  if (!onSetEditorHotReloadNeeded)
    throw new Error('No EmbeddedGameFrame registered.');
  onSetEditorHotReloadNeeded(hotReloadProps);
};

export const switchInGameEditorIfNoHotReloadIsNeeded = (
  editorContentIdentifiers: EditorContentIdentifiers
) => {
  if (!onSwitchInGameEditorIfNoHotReloadIsNeeded)
    throw new Error('No EmbeddedGameFrame registered.');
  onSwitchInGameEditorIfNoHotReloadIsNeeded(editorContentIdentifiers);
};

export const preventGameFramePointerEvents = (enabled: boolean) => {
  if (!onPreventGameFramePointerEvents)
    throw new Error('No EmbeddedGameFrame registered.');
  onPreventGameFramePointerEvents(enabled);
};

const logSwitchingInfo = ({
  editorId,
  sceneName,
  externalLayoutName,
  eventsBasedObjectType,
  eventsBasedObjectVariantName,
}: EditorContentIdentifiers) => {
  console.info(
    eventsBasedObjectType
      ? `Switching in-game edition preview for variant "${eventsBasedObjectVariantName ||
          ''}" of "${eventsBasedObjectType || ''}".`
      : externalLayoutName
      ? `Switching in-game edition previews to external layout "${externalLayoutName ||
          ''}" (scene: "${sceneName || ''}").`
      : `Switching in-game edition previews to scene "${sceneName || ''}".`
  );
};

type Props = {|
  previewDebuggerServer: PreviewDebuggerServer | null,
  enabled: boolean,
  onLaunchPreviewForInGameEdition: ({|
    editorId: string,
    sceneName: string | null,
    externalLayoutName: string | null,
    eventsBasedObjectType: string | null,
    eventsBasedObjectVariantName: string | null,
    hotReload: boolean,
    projectDataOnlyExport: boolean,
    shouldReloadResources: boolean,
  |}) => void,
|};

const DropTarget = makeDropTarget<{||}>(objectWithContextReactDndType);

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
  const neededHotReload = React.useRef<
    'None' | 'Data' | 'DataAndResources' | 'Full'
  >('None');

  React.useEffect(
    () => {
      // TODO: use a real context for this?
      onAttachToPreview = (options: AttachToPreviewOptions) => {
        setPreviewIndexHtmlLocation(options.previewIndexHtmlLocation);
        if (iframeRef.current) {
          iframeRef.current.contentWindow.focus();
        }
      };
      onPreventGameFramePointerEvents = (enabled: boolean) => {
        setIsPointerEventsPrevented(enabled);
      };
      onSetEditorHotReloadNeeded = ({
        projectDataOnlyExport,
        shouldReloadResources,
      }: {|
        projectDataOnlyExport: boolean,
        shouldReloadResources: boolean,
      |}) => {
        if (projectDataOnlyExport) {
          if (neededHotReload.current === 'None') {
            neededHotReload.current = 'Data';
          }
        } else {
          neededHotReload.current = 'Full';
        }
        if (shouldReloadResources) {
          if (neededHotReload.current !== 'Full') {
            neededHotReload.current = 'DataAndResources';
          }
        }
        console.log('onSetEditorHotReloadNeeded', projectDataOnlyExport);
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
          hotReload,
          projectDataOnlyExport,
          shouldReloadResources,
        } = options;

        const shouldHotReload = hotReload || neededHotReload.current !== 'None';
        if (!previewIndexHtmlLocation || shouldHotReload) {
          console.info(
            eventsBasedObjectType
              ? `Launching in-game edition preview for variant "${eventsBasedObjectVariantName ||
                  ''}" of "${eventsBasedObjectType || ''}".`
              : externalLayoutName
              ? `Launching in-game edition preview for external layout "${externalLayoutName ||
                  ''}" (scene: "${sceneName || ''}").`
              : `Launching in-game edition preview for scene "${sceneName ||
                  ''}".`
          );
          onLaunchPreviewForInGameEdition({
            editorId,
            sceneName,
            externalLayoutName,
            eventsBasedObjectType,
            eventsBasedObjectVariantName,
            hotReload: shouldHotReload,
            projectDataOnlyExport:
              projectDataOnlyExport && neededHotReload.current !== 'Full',
            shouldReloadResources:
              shouldReloadResources ||
              neededHotReload.current === 'DataAndResources' ||
              neededHotReload.current === 'Full',
          });
          neededHotReload.current = 'None';
        } else {
          logSwitchingInfo({
            editorId,
            sceneName,
            externalLayoutName,
            eventsBasedObjectType,
            eventsBasedObjectVariantName,
          });
          previewDebuggerServer.getExistingDebuggerIds().forEach(debuggerId => {
            previewDebuggerServer.sendMessage(debuggerId, {
              command: 'switchForInGameEdition',
              editorId,
              sceneName,
              externalLayoutName,
              eventsBasedObjectType,
              eventsBasedObjectVariantName,
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
      }: EditorContentIdentifiers) => {
        if (!previewDebuggerServer) return;
        if (!enabled) return;
        if (neededHotReload.current !== 'None') {
          return;
        }
        logSwitchingInfo({
          editorId,
          sceneName,
          externalLayoutName,
          eventsBasedObjectType,
          eventsBasedObjectVariantName,
        });
        previewDebuggerServer.getExistingDebuggerIds().forEach(debuggerId => {
          previewDebuggerServer.sendMessage(debuggerId, {
            command: 'switchForInGameEdition',
            editorId,
            sceneName,
            externalLayoutName,
            eventsBasedObjectType,
            eventsBasedObjectVariantName,
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

  return (
    <div
      style={{
        position: 'absolute',
        top: 31 + 40, // Height of the tabs + toolbar.
        left: 0,
        right: 0,
        bottom: 0,
      }}
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
          hover={monitor => {
            if (!previewDebuggerServer) return;

            const clientOffset = monitor.getClientOffset();
            const name = monitor.getItem().name;
            if (!name) return;

            // TODO: Move these into a helper.
            previewDebuggerServer
              .getExistingDebuggerIds()
              .forEach(debuggerId => {
                previewDebuggerServer.sendMessage(debuggerId, {
                  command: 'dragNewInstance',
                  x: clientOffset.x,
                  y: clientOffset.y,
                  name,
                  dropped: false,
                });
              });
          }}
          drop={monitor => {
            if (!previewDebuggerServer) return;

            const clientOffset = monitor.getClientOffset();
            const name = monitor.getItem().name;
            if (!name) return;

            // TODO: Move these into a helper.
            previewDebuggerServer
              .getExistingDebuggerIds()
              .forEach(debuggerId => {
                previewDebuggerServer.sendMessage(debuggerId, {
                  command: 'dragNewInstance',
                  x: clientOffset.x,
                  y: clientOffset.y,
                  name,
                  dropped: true,
                });
              });
          }}
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
              >
                {canDrop && (
                  <div className={classes.hintText}>
                    <Text color="inherit">Drag here to add to the scene</Text>
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
