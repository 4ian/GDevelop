// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import { GamesPlatformFrameContext } from './GamesPlatformFrameContext';
import SectionContainer, { SectionRow } from '../SectionContainer';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';

const PlaySection = () => {
  const { iframeLoaded } = React.useContext(GamesPlatformFrameContext);

  // Iframe will be displayed here if loaded.
  return iframeLoaded ? null : (
    <SectionContainer flexBody>
      <SectionRow expand>
        <PlaceholderLoader />
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
