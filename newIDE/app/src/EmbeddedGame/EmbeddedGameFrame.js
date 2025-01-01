// @flow
import * as React from 'react';
import { type PreviewDebuggerServer } from '../ExportAndShare/PreviewLauncher.flow';

type AttachToPreviewOptions = {|
  previewIndexHtmlLocation: string,
|};

type SwitchToSceneEditionOptions = {|
  sceneName: string,
  externalLayoutName?: string,
|};

let onAttachToPreview: null | (AttachToPreviewOptions => void) = null;
let onSwitchToSceneEdition: null | (SwitchToSceneEditionOptions => void) = null;

export const attachToPreview = ({
  previewIndexHtmlLocation,
}: AttachToPreviewOptions) => {
  if (!onAttachToPreview) throw new Error('No EmbeddedGameFrame registered.');
  onAttachToPreview({ previewIndexHtmlLocation });
};

export const switchToSceneEdition = ({
  sceneName,
  externalLayoutName,
}: SwitchToSceneEditionOptions) => {
  if (!onSwitchToSceneEdition)
    throw new Error('No EmbeddedGameFrame registered.');
  onSwitchToSceneEdition({ sceneName, externalLayoutName });
};

type Props = {|
  previewDebuggerServer: PreviewDebuggerServer | null,
  onLaunchPreviewForInGameEdition: ({|
    sceneName: string,
    externalLayoutName: ?string,
  |}) => void,
|};

export const EmbeddedGameFrame = ({
  previewDebuggerServer,
  onLaunchPreviewForInGameEdition,
}: Props) => {
  const [
    previewIndexHtmlLocation,
    setPreviewIndexHtmlLocation,
  ] = React.useState<string>('');
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);

  React.useEffect(
    () => {
      // TODO: use a real context for this?
      onAttachToPreview = (options: AttachToPreviewOptions) => {
        setPreviewIndexHtmlLocation(options.previewIndexHtmlLocation);
        if (iframeRef.current) {
          iframeRef.current.contentWindow.focus();
        }
      };
      onSwitchToSceneEdition = (options: SwitchToSceneEditionOptions) => {
        if (!previewDebuggerServer) return;

        const { sceneName, externalLayoutName } = options;

        if (!previewIndexHtmlLocation) {
          console.info(
            externalLayoutName
              ? `Launching in-game edition preview for external layout "${externalLayoutName}" (scene: "${sceneName}").`
              : `Launching in-game edition preview for scene "${sceneName}".`
          );
          onLaunchPreviewForInGameEdition({ sceneName, externalLayoutName });
        } else {
          console.info(
            externalLayoutName
              ? `Switching in-game edition previews to external layout "${externalLayoutName}" (scene: "${sceneName}").`
              : `Switching in-game edition previews to scene "${sceneName}".`
          );
          previewDebuggerServer.getExistingDebuggerIds().forEach(debuggerId => {
            previewDebuggerServer.sendMessage(debuggerId, {
              command: 'switchForInGameEdition',
              sceneName,
              externalLayoutName,
            });
          });
        }
      };
    },
    [
      previewDebuggerServer,
      previewIndexHtmlLocation,
      onLaunchPreviewForInGameEdition,
    ]
  );

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
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
      </div>
    </div>
  );
};
