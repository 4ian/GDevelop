// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import { AssetStoreStateProvider } from '../../../AssetStore/AssetStoreContext';
import { CustomObjectPackResults } from '../../../AssetStore/NewObjectFromScratch';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';

export default {
  title: 'AssetStore/CustomObjectPackResults',
  component: CustomObjectPackResults,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <FixedHeightFlexContainer height={400}>
    <AssetStoreStateProvider>
      <CustomObjectPackResults
        packTag="multitouch joysticks"
        onAssetSelect={action('onAssetSelect')}
        onBack={action('onBack')}
        isAssetBeingInstalled={false}
      />
    </AssetStoreStateProvider>
  </FixedHeightFlexContainer>
);

export const Installing = () => (
  <FixedHeightFlexContainer height={400}>
    <AssetStoreStateProvider>
      <CustomObjectPackResults
        packTag="multitouch joysticks"
        onAssetSelect={action('onAssetSelect')}
        onBack={action('onBack')}
        isAssetBeingInstalled
      />
    </AssetStoreStateProvider>
  </FixedHeightFlexContainer>
);
