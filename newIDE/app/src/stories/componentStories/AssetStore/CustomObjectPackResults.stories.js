// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import { AssetStoreStateProvider } from '../../../AssetStore/AssetStoreContext';
import { CustomObjectPackResults } from '../../../AssetStore/NewObjectFromScratch';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import { AssetStoreNavigatorStateProvider } from '../../../AssetStore/AssetStoreNavigator';

export default {
  title: 'AssetStore/CustomObjectPackResults',
  component: CustomObjectPackResults,
  decorators: [paperDecorator],
};

const Wrapper = ({ children }: {| children: React.Node |}) => {
  return (
    <FixedHeightFlexContainer height={500}>
      <AssetStoreNavigatorStateProvider>
        <AssetStoreStateProvider>{children}</AssetStoreStateProvider>
      </AssetStoreNavigatorStateProvider>
    </FixedHeightFlexContainer>
  );
};

export const Default = () => (
  <Wrapper>
    <CustomObjectPackResults
      packTag="multitouch joysticks"
      onAssetSelect={action('onAssetSelect')}
      onBack={action('onBack')}
      isAssetBeingInstalled={false}
    />
  </Wrapper>
);

export const Installing = () => (
  <Wrapper>
    <CustomObjectPackResults
      packTag="multitouch joysticks"
      onAssetSelect={action('onAssetSelect')}
      onBack={action('onBack')}
      isAssetBeingInstalled
    />
  </Wrapper>
);
