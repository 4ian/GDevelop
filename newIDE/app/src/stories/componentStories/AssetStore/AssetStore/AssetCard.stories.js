// @flow
import * as React from 'react';

import paperDecorator from '../../../PaperDecorator';
import { AssetCard } from '../../../../AssetStore/AssetCard';
import { fakeAssetShortHeader1 } from '../../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'AssetStore/AssetStore/AssetCard',
  component: AssetCard,
  decorators: [paperDecorator],
};

export const Default = (): React.Node => (
  <div>
    <div style={{ width: 50, height: 50 }}>
      <AssetCard assetShortHeader={fakeAssetShortHeader1} />
    </div>
    <div style={{ width: 150, height: 50 }}>
      <AssetCard assetShortHeader={fakeAssetShortHeader1} />
    </div>
    <div style={{ width: 150, height: 150 }}>
      <AssetCard assetShortHeader={fakeAssetShortHeader1} />
    </div>
    <div style={{ width: 150, height: 200 }}>
      <AssetCard assetShortHeader={fakeAssetShortHeader1} />
    </div>
  </div>
);
