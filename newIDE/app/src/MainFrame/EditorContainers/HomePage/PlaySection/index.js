// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import SectionContainer, { SectionRow } from '../SectionContainer';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import PlaceholderError from '../../../../UI/PlaceholderError';
import { sendPlaySectionOpened } from '../../../../Utils/Analytics/EventSender';
import { type GamesPlatformFrameTools } from './UseGamesPlatformFrame';

type Props = {|
  gamesPlatformFrameTools: GamesPlatformFrameTools,
|};

const PlaySection = ({ gamesPlatformFrameTools }: Props) => {
  const {
    iframeLoaded,
    iframeErrored,
    loadIframeOrRemoveTimeout,
    updateIframePosition,
  } = gamesPlatformFrameTools;

  // At each render, communicate the iframe position to the games frame.
  const iframePositionRef = React.useRef<?HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (iframePositionRef.current) {
      const rect = iframePositionRef.current.getBoundingClientRect();
      updateIframePosition({
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
    <div
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      ref={iframePositionRef}
    />
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
