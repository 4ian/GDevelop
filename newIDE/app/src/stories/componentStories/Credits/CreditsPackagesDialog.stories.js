// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';
import CreditsPackagesDialog from '../../../Credits/CreditsPackagesDialog';
import { CreditsPackageStoreContext } from '../../../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import { type CreditsPackageListingData } from '../../../Utils/GDevelopServices/Shop';

export default {
  title: 'Credits/CreditsPackagesDialog',
  component: CreditsPackagesDialog,
  decorators: [paperDecorator],
};

const creditsPackageListingDatas: CreditsPackageListingData[] = [
  {
    id: '500_credits',
    createdAt: '2024-01-10T14:59:43.376Z',
    updatedAt: '2024-01-10T14:59:43.376Z',
    name: '500 credits',
    description:
      '500 credits for GDevelop - perfect for cloud builds, get games featuring, or unlock more leaderboards or cloud projects.',
    productType: 'CREDITS_PACKAGE',
    thumbnailUrls: [],
    sellerId: 'R0F5QGNCzgOY5w2cxGeKJOq2UaD2',
    isSellerGDevelop: true,
    listing: 'CREDITS_PACKAGE',
    categories: [],
    prices: [
      {
        stripePriceId: 'price_1O3gEK46T03ISJOcW7Nguse6',
        value: 599,
        name: 'default',
        currency: 'USD',
        usageType: 'default',
      },
    ],
    sellerStripeAccountId: 'acct_14EN2o46T03ISJOc',
    stripeProductId: 'prod_OrP2SrmGQjRcJx',
    appStoreProductId: null,
  },
  {
    id: '1000_credits',
    createdAt: '2024-01-10T14:59:43.376Z',
    updatedAt: '2024-01-10T14:59:43.376Z',
    name: '1000 credits',
    description:
      '1000 credits for GDevelop - perfect for cloud builds, get games featuring, or unlock more leaderboards or cloud projects.',
    productType: 'CREDITS_PACKAGE',
    thumbnailUrls: [],
    sellerId: 'R0F5QGNCzgOY5w2cxGeKJOq2UaD2',
    isSellerGDevelop: true,
    listing: 'CREDITS_PACKAGE',
    categories: [],
    prices: [
      {
        stripePriceId: 'price_1OKHfh46T03ISJOcpHksCgMW',
        value: 999,
        name: 'default',
        currency: 'USD',
        usageType: 'default',
      },
    ],
    sellerStripeAccountId: 'acct_14EN2o46T03ISJOc',
    stripeProductId: 'prod_P8Yn5L7ykOl1lD',
    appStoreProductId: null,
  },
  {
    id: '2000_credits',
    createdAt: '2024-01-10T14:59:43.376Z',
    updatedAt: '2024-01-10T14:59:43.376Z',
    name: '2000 credits',
    description:
      '2000 credits for GDevelop - perfect for cloud builds, get games featuring, or unlock more leaderboards or cloud projects.',
    productType: 'CREDITS_PACKAGE',
    thumbnailUrls: [],
    sellerId: 'R0F5QGNCzgOY5w2cxGeKJOq2UaD2',
    isSellerGDevelop: true,
    listing: 'CREDITS_PACKAGE',
    categories: [],
    prices: [
      {
        stripePriceId: 'price_1OKHfh46T03ISJOcpHksCgMW',
        value: 1899,
        name: 'default',
        currency: 'USD',
        usageType: 'default',
      },
    ],
    sellerStripeAccountId: 'acct_14EN2o46T03ISJOc',
    stripeProductId: 'prod_P8Yn5L7ykOl1lD',
    appStoreProductId: null,
  },
];

export const Loading = () => {
  return (
    <CreditsPackageStoreContext.Provider
      value={{
        fetchCreditsPackages: () => {},
        creditsPackageListingDatas: null,
        error: null,
        openCreditsPackageDialog: () => {},
        closeCreditsPackageDialog: () => {},
        openCreditsUsageDialog: () => {},
      }}
    >
      <CreditsPackagesDialog
        onClose={() => {}}
        suggestedPackage={null}
        missingCredits={null}
      />
    </CreditsPackageStoreContext.Provider>
  );
};

export const Loaded = () => {
  return (
    <CreditsPackageStoreContext.Provider
      value={{
        fetchCreditsPackages: () => {},
        creditsPackageListingDatas,
        error: null,
        openCreditsPackageDialog: () => {},
        closeCreditsPackageDialog: () => {},
        openCreditsUsageDialog: () => {},
      }}
    >
      <CreditsPackagesDialog
        onClose={() => {}}
        suggestedPackage={null}
        missingCredits={null}
      />
    </CreditsPackageStoreContext.Provider>
  );
};

export const WithSuggestedPackageAndMissingCredits = () => {
  return (
    <CreditsPackageStoreContext.Provider
      value={{
        fetchCreditsPackages: () => {},
        creditsPackageListingDatas,
        error: null,
        openCreditsPackageDialog: () => {},
        closeCreditsPackageDialog: () => {},
        openCreditsUsageDialog: () => {},
      }}
    >
      <CreditsPackagesDialog
        onClose={() => {}}
        suggestedPackage={creditsPackageListingDatas[1]}
        missingCredits={200}
      />
    </CreditsPackageStoreContext.Provider>
  );
};
