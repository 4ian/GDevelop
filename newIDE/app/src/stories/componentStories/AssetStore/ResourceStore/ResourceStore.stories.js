// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import { getPaperDecorator } from '../../../PaperDecorator';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import { ResourceStoreStateProvider } from '../../../../AssetStore/ResourceStore/ResourceStoreContext';
import { ResourceStore } from '../../../../AssetStore/ResourceStore';

export default {
  title: 'AssetStore/ResourceStore',
  component: ResourceStore,
  decorators: [getPaperDecorator('medium')],
};

export const AudioResource = () => (
  <FixedHeightFlexContainer height={600}>
    <ResourceStoreStateProvider>
      <ResourceStore onChoose={action('onChoose')} resourceKind="audio" />
    </ResourceStoreStateProvider>
  </FixedHeightFlexContainer>
);

export const FontResource = () => (
  <FixedHeightFlexContainer height={600}>
    <ResourceStoreStateProvider>
      <ResourceStore onChoose={action('onChoose')} resourceKind="font" />
    </ResourceStoreStateProvider>
  </FixedHeightFlexContainer>
);

export const SvgResource = () => (
  <FixedHeightFlexContainer height={600}>
    <ResourceStoreStateProvider>
      <ResourceStore onChoose={action('onChoose')} resourceKind="svg" />
    </ResourceStoreStateProvider>
  </FixedHeightFlexContainer>
);
