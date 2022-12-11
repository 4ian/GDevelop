// @flow
import * as React from 'react';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import { AssetDetails } from '../../../../AssetStore/AssetDetails';
import { fakeAssetShortHeader1 } from '../../../../fixtures/GDevelopServicesTestData';
import { AssetStoreStateProvider } from '../../../../AssetStore/AssetStoreContext';

export default {
  title: 'AssetStore/AssetStore/AssetDetails',
  component: AssetDetails,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <AssetStoreStateProvider>
    <AssetDetails
      onTagSelection={() => {}}
      assetShortHeader={fakeAssetShortHeader1}
      onOpenDetails={assetShortHeader => {}}
    />
  </AssetStoreStateProvider>
);
