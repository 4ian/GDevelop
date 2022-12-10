// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import SectionContainer, { SectionRow } from '../SectionContainer';
import { AssetStore } from '../../../../AssetStore';

const CommunitySection = () => {
  return (
    <SectionContainer flexBody>
      <AssetStore />
    </SectionContainer>
  );
};

export default CommunitySection;
