// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import { AssetCard } from '../../../../AssetStore/AssetCard';
import { fakeAssetShortHeader } from '../../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'AssetStore/AssetStore/AssetCard',
  component: AssetCard,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <AssetCard
    size={128}
    onOpenDetails={action('onOpenDetails')}
    assetShortHeader={fakeAssetShortHeader}
  />
);
