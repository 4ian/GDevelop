// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import { GamesPlatformFrameContext } from './GamesPlatformFrameContext';
import SectionContainer, { SectionRow } from '../SectionContainer';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import PlaceholderError from '../../../../UI/PlaceholderError';
import { sendPlaySectionOpened } from '../../../../Utils/Analytics/EventSender';

const PlaySection = () => {
  const {
    iframeLoaded,
    iframeErrored,
    loadIframeOrRemoveTimeout,
  } = React.useContext(GamesPlatformFrameContext);

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

const PlaySectionWithErrorBoundary = () => {
  return (
    <ErrorBoundary
      componentTitle={<Trans>Play section</Trans>}
      scope="start-page-play"
    >
      <PlaySection />
    </ErrorBoundary>
  );
};

export default PlaySectionWithErrorBoundary;
