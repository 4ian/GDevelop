// @flow
import * as React from 'react';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import { AssetCard } from '../../../../AssetStore/AssetCard';
import { fakeAssetShortHeader1 } from '../../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'AssetStore/AssetStore/AssetCard',
  component: AssetCard,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <AssetCard size={128} assetShortHeader={fakeAssetShortHeader1} />
);
