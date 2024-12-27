// @flow
import * as React from 'react';
import { type PreviewDebuggerServer } from '../ExportAndShare/PreviewLauncher.flow';

type SwitchToPreviewOptions = {|
  previewIndexHtmlLocation: string,
|};

type SwitchToSceneEditionOptions = {|
  sceneName: string,
|};

let onSwitchToPreview: null | (SwitchToPreviewOptions => void) = null;
let onSwitchToSceneEdition: null | (SwitchToSceneEditionOptions => void) = null;

export const switchToPreview = ({
  previewIndexHtmlLocation,
}: SwitchToPreviewOptions) => {
  if (!onSwitchToPreview) throw new Error('No EmbeddedGameFrame registered.');
  onSwitchToPreview({ previewIndexHtmlLocation });
};

export const switchToSceneEdition = ({
  sceneName,
}: SwitchToSceneEditionOptions) => {
  if (!onSwitchToSceneEdition)
    throw new Error('No EmbeddedGameFrame registered.');
  onSwitchToSceneEdition({ sceneName });
};

type Props = {|
  previewDebuggerServer: PreviewDebuggerServer | null,
|};

export const EmbeddedGameFrame = ({ previewDebuggerServer }: Props) => {
  const [
    previewIndexHtmlLocation,
    setPreviewIndexHtmlLocation,
  ] = React.useState<string>('');
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  // TODO: display a loader when the preview is being loaded.

  React.useEffect(() => {
    // TODO: use a real context for this?
    onSwitchToPreview = (options: SwitchToPreviewOptions) => {
      setPreviewIndexHtmlLocation(options.previewIndexHtmlLocation);
      if (iframeRef.current) {
        iframeRef.current.contentWindow.focus();
      }
    };
    onSwitchToSceneEdition = (options: SwitchToSceneEditionOptions) => {
      if (!previewDebuggerServer) return;

      console.log('TODO: switch to scene edition', options);
      previewDebuggerServer.getExistingDebuggerIds().forEach(debuggerId => {
        previewDebuggerServer.sendMessage(debuggerId, {
          command: 'requestSceneChange',
          sceneName: options.sceneName,
        });
      });
    };
  }, [previewDebuggerServer]);

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
