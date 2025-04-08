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
  } = gamesPlatformFrameTools;

  React.useEffect(() => {
    sendPlaySectionOpened();
  }, []);

  // Iframe will be displayed here if loaded.
  return iframeLoaded ? null : (
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
