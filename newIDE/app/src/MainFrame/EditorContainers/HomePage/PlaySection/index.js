// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import { GamesPlatformFrameContext } from './GamesPlatformFrameContext';
import SectionContainer, { SectionRow } from '../SectionContainer';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';

const PlaySection = () => {
  const {
    startTimeoutToUnloadIframe,
    loadIframeOrRemoveTimeout,
    iframeLoaded,
  } = React.useContext(GamesPlatformFrameContext);
  React.useEffect(
    () => {
      loadIframeOrRemoveTimeout();
      return () => startTimeoutToUnloadIframe();
    },
    [startTimeoutToUnloadIframe, loadIframeOrRemoveTimeout]
  );

  // Iframe will be displayed here if loaded.
  return iframeLoaded ? null : (
    <SectionContainer flexBody>
      <SectionRow expand>
        <PlaceholderLoader />
      </SectionRow>
    </SectionContainer>
  );
};

const PlaySectionWithErrorBoundary = () => (
  <ErrorBoundary
    componentTitle={<Trans>Play section</Trans>}
    scope="start-page-play"
  >
    <PlaySection />
  </ErrorBoundary>
);

export default PlaySectionWithErrorBoundary;
