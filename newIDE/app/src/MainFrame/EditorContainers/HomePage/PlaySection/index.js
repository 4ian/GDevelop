// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import SectionContainer, { SectionRow } from '../SectionContainer';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import PlaceholderError from '../../../../UI/PlaceholderError';
import { sendPlaySectionOpened } from '../../../../Utils/Analytics/EventSender';
import { type GamesPlatformFrameTools } from './UseGamesPlatformFrame';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';

type Props = {|
  gamesPlatformFrameTools: GamesPlatformFrameTools,
|};

const styles = {
  iframeTarget: { position: 'absolute', inset: 0, pointerEvents: 'none' },
};

const PlaySection = ({ gamesPlatformFrameTools }: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const {
    iframeLoaded,
    iframeErrored,
    loadIframeOrRemoveTimeout,
    updateIframePosition,
  } = gamesPlatformFrameTools;

  // At each render, communicate the iframe position to the games frame.
  // If on a "mobile" screen (either a real mobile, or a desktop that has a small
  // window, or an editor tab that is too narrow), communicate this so that the
  // iframe can be shown from the top of the screen.
  const iframePositionRef = React.useRef<?HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (iframePositionRef.current) {
      const rect = iframePositionRef.current.getBoundingClientRect();
      updateIframePosition({
        isMobile,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  });

  React.useEffect(() => {
    sendPlaySectionOpened();
  }, []);

  // Iframe will be displayed here if loaded.
  return iframeLoaded ? (
    <div style={styles.iframeTarget} ref={iframePositionRef} />
  ) : (
    <SectionContainer flexBody>
      <SectionRow expand>
        {iframeErrored ? (
          <PlaceholderError onRetry={loadIframeOrRemoveTimeout}>
            <Trans>
              Error while loading the Play section. Verify your internet
              connection or try again later.
            </Trans>
          </PlaceholderError>
        ) : (
          <PlaceholderLoader />
        )}
      </SectionRow>
    </SectionContainer>
  );
};

const PlaySectionWithErrorBoundary = (props: Props) => {
  return (
    <ErrorBoundary
      componentTitle={<Trans>Play section</Trans>}
      scope="start-page-play"
    >
      <PlaySection {...props} />
    </ErrorBoundary>
  );
};

export default PlaySectionWithErrorBoundary;
