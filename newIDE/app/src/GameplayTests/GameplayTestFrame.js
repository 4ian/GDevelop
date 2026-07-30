// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { type PreviewDebuggerServer } from '../ExportAndShare/PreviewLauncher.flow';
import FlatButton from '../UI/FlatButton';

const styles = {
  container: {
    position: 'fixed',
    left: 8,
    bottom: 8,
    zIndex: 1500,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
    backgroundColor: 'rgba(33, 33, 33, 0.95)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 8,
  },
  statusText: {
    color: '#eeeeee',
    fontSize: 12,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 180,
  },
  iframe: {
    border: 'none',
    display: 'block',
  },
  // The iframe is kept mounted (tiny and invisible) when hidden, so that
  // the game `requestAnimationFrame` loop keeps running and the test can
  // continue in the background.
  hiddenIframe: {
    border: 'none',
    display: 'block',
    width: 1,
    height: 1,
    opacity: 0,
    pointerEvents: 'none',
  },
};

type GameplayTestFrameState = {|
  // The new location, or null to keep the current one unchanged.
  previewIndexHtmlLocation: string | null,
  statusText: string,
|};

let onSetGameplayTestFrameState: null | (GameplayTestFrameState => void) = null;

/**
 * Point the gameplay test frame to a preview (and show it).
 * Called by the preview launchers when launching a preview
 * with `isForGameplayTest`.
 */
export const setGameplayTestFramePreviewLocation = ({
  previewIndexHtmlLocation,
}: {|
  previewIndexHtmlLocation: string,
|}) => {
  if (!onSetGameplayTestFrameState)
    throw new Error('No GameplayTestFrame registered.');
  onSetGameplayTestFrameState({ previewIndexHtmlLocation, statusText: '' });
};

/**
 * Close the gameplay test frame (unloading the game running in it).
 */
export const clearGameplayTestFramePreview = () => {
  if (!onSetGameplayTestFrameState) return;
  onSetGameplayTestFrameState({ previewIndexHtmlLocation: '', statusText: '' });
};

/**
 * Update the status text displayed on the gameplay test frame.
 */
export const setGameplayTestFrameStatusText = (statusText: string) => {
  if (!onSetGameplayTestFrameState) return;
  onSetGameplayTestFrameState({ previewIndexHtmlLocation: null, statusText });
};

type Props = {|
  previewDebuggerServer: ?PreviewDebuggerServer,
  onStopRequested: () => void,
|};

/**
 * A small overlay (bottom left of the screen) showing the game while a
 * gameplay test is running, with controls to stop the test or hide the
 * frame (the test keeps running when hidden).
 */
export const GameplayTestFrame = ({
  previewDebuggerServer,
  onStopRequested,
}: Props): React.Node => {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const [
    previewIndexHtmlLocation,
    setPreviewIndexHtmlLocation,
  ] = React.useState<string>('');
  const [statusText, setStatusText] = React.useState<string>('');
  const [isHidden, setIsHidden] = React.useState<boolean>(false);

  React.useEffect(() => {
    onSetGameplayTestFrameState = (newState: GameplayTestFrameState) => {
      if (newState.previewIndexHtmlLocation !== null) {
        setPreviewIndexHtmlLocation(newState.previewIndexHtmlLocation);
        setIsHidden(false);
      }
      setStatusText(newState.statusText);
    };
    return () => {
      onSetGameplayTestFrameState = null;
    };
  }, []);

  // Register the iframe window in the debugger as soon as the iframe is shown.
  React.useEffect(() => {
    const iframe = iframeRef.current;
    if (previewDebuggerServer && iframe && !!previewIndexHtmlLocation)
      previewDebuggerServer.registerGameplayTestFrame(iframe.contentWindow);
  });

  // Unregister the iframe window when the frame is closed or unmounted.
  React.useEffect(
    () => {
      const previousPreviewDebuggerServer = previewDebuggerServer;
      return () => {
        const iframe = iframeRef.current;
        if (previousPreviewDebuggerServer && iframe) {
          previousPreviewDebuggerServer.unregisterGameplayTestFrame(
            iframe.contentWindow
          );
        }
      };
    },
    [previewDebuggerServer, previewIndexHtmlLocation]
  );

  if (!previewIndexHtmlLocation) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.statusText}>
          {statusText || <Trans>Running test...</Trans>}
        </span>
        <div style={{ display: 'flex' }}>
          <FlatButton
            label={isHidden ? <Trans>Show</Trans> : <Trans>Hide</Trans>}
            onClick={() => setIsHidden(!isHidden)}
          />
          <FlatButton label={<Trans>Stop</Trans>} onClick={onStopRequested} />
        </div>
      </div>
      <iframe
        ref={iframeRef}
        title="Gameplay Test"
        src={previewIndexHtmlLocation}
        tabIndex={-1}
        style={
          isHidden
            ? styles.hiddenIframe
            : { ...styles.iframe, width: 320, height: 180 }
        }
      />
    </div>
  );
};
