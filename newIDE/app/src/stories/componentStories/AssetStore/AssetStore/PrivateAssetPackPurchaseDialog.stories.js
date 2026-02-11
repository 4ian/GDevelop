// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import PrivateAssetPackPurchaseDialog from '../../../../AssetStore/PrivateAssets/PrivateAssetPackPurchaseDialog';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import {
  fakeSilverAuthenticatedUser,
  fakeNotAuthenticatedUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import { type PrivateAssetPackListingData } from '../../../../Utils/GDevelopServices/Shop';

export default {
  title: 'AssetStore/AssetStore/PrivateAssetPackPurchaseDialog',
  component: PrivateAssetPackPurchaseDialog,
  decorators: [paperDecorator],
  parameters: {
    initialState: {
      isBuying: true,
    },
  },
};

const privateAssetPackListingData: PrivateAssetPackListingData = {
  id: '56a50a9e-57ef-4d1d-a3f2-c918d593a6e2',
  sellerId: 'tVUYpNMz1AfsbzJtxUEpPTuu4Mn1',
  isSellerGDevelop: false,
  productType: 'ASSET_PACK',
  thumbnailUrls: [
    'https://resources.gdevelop-app.com/staging/private-assets/French Food/thumbnail1.png',
  ],
  updatedAt: '2022-09-14T12:43:51.329Z',
  createdAt: '2022-09-14T12:43:51.329Z',
  listing: 'ASSET_PACK',
  description: '5 assets',
  name: 'French Food',
  categories: ['props'],
  prices: [
    {
      value: 1500,
      name: 'commercial_USD',
      stripePriceId: 'stripePriceId',
      usageType: 'commercial',
      currency: 'USD',
    },
  ],
  creditPrices: [
    {
      amount: 1500,
      usageType: 'commercial',
    },
  ],
  appStoreProductId: null,
  sellerStripeAccountId: 'sellerStripeProductId',
  stripeProductId: 'stripeProductId',
};

export const NotLoggedIn = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
      <PrivateAssetPackPurchaseDialog
        privateAssetPackListingData={privateAssetPackListingData}
        usageType="commercial"
        onClose={() => action('close')()}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const LoggedIn = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <PrivateAssetPackPurchaseDialog
        privateAssetPackListingData={privateAssetPackListingData}
        usageType="commercial"
        onClose={() => action('close')()}
      />
    </AuthenticatedUserContext.Provider>
  );
};
