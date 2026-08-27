// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';
import CreditsPackagesDialog from '../../../Credits/CreditsPackagesDialog';
import {
  CreditsPackageStoreContext,
  initialCreditsPackageStoreState,
} from '../../../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import { type CreditsPackageListingData } from '../../../Utils/GDevelopServices/Shop';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { fakeAuthenticatedUserWithNoSubscriptionAndCredits } from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Credits/CreditsPackagesDialog',
  component: CreditsPackagesDialog,
  decorators: [paperDecorator],
};

const makeCreditsPackageListingData = ({
  creditsAmount,
  priceInCents,
}: {|
  creditsAmount: number,
  priceInCents: number,
|}): CreditsPackageListingData => ({
  id: `${creditsAmount}_credits`,
  createdAt: '2024-01-10T14:59:43.376Z',
  updatedAt: '2024-01-10T14:59:43.376Z',
  name: `${creditsAmount} credits`,
  description: `${creditsAmount} credits for GDevelop - perfect for cloud builds, get games featuring, or unlock more leaderboards or cloud projects.`,
  productType: 'CREDITS_PACKAGE',
  thumbnailUrls: [],
  sellerId: 'R0F5QGNCzgOY5w2cxGeKJOq2UaD2',
  isSellerGDevelop: true,
  listing: 'CREDITS_PACKAGE',
  categories: [],
  prices: [
    {
      stripePriceId: `price_for_${creditsAmount}_credits`,
      value: priceInCents,
      name: 'default',
      currency: 'USD',
      usageType: 'default',
    },
  ],
  sellerStripeAccountId: 'acct_14EN2o46T03ISJOc',
  stripeProductId: `prod_for_${creditsAmount}_credits`,
  appStoreProductId: null,
});

// The packages sold by the shop: the bigger ones give more credits for the same
// money, which the dialog is expected to make obvious.
const creditsPackageListingDatas: CreditsPackageListingData[] = [
  makeCreditsPackageListingData({ creditsAmount: 500, priceInCents: 599 }),
  makeCreditsPackageListingData({ creditsAmount: 1000, priceInCents: 999 }),
  makeCreditsPackageListingData({ creditsAmount: 2000, priceInCents: 1899 }),
  makeCreditsPackageListingData({ creditsAmount: 5000, priceInCents: 3999 }),
  makeCreditsPackageListingData({ creditsAmount: 10000, priceInCents: 6999 }),
];

const makeStoreState = ({
  creditsPackageListingDatas,
  error,
}: {|
  creditsPackageListingDatas: ?(CreditsPackageListingData[]),
  error: ?Error,
|}) => ({
  ...initialCreditsPackageStoreState,
  creditsPackageListingDatas,
  error,
});

const Wrapper = ({
  children,
  creditsPackageListingDatas: packages = creditsPackageListingDatas,
  error = null,
}: {|
  children: React.Node,
  creditsPackageListingDatas?: ?(CreditsPackageListingData[]),
  error?: ?Error,
|}) => (
  // $FlowFixMe[incompatible-type]
  <AuthenticatedUserContext.Provider
    value={fakeAuthenticatedUserWithNoSubscriptionAndCredits}
  >
    <CreditsPackageStoreContext.Provider
      value={makeStoreState({
        creditsPackageListingDatas: packages,
        error,
      })}
    >
      {children}
    </CreditsPackageStoreContext.Provider>
  </AuthenticatedUserContext.Provider>
);

export const Loading = (): React.Node => (
  <Wrapper creditsPackageListingDatas={null}>
    <CreditsPackagesDialog
      onClose={() => {}}
      suggestedPackage={null}
      missingCredits={null}
    />
  </Wrapper>
);

export const Errored = (): React.Node => (
  <Wrapper
    creditsPackageListingDatas={null}
    error={new Error('Fake network error')}
  >
    <CreditsPackagesDialog
      onClose={() => {}}
      suggestedPackage={null}
      missingCredits={null}
    />
  </Wrapper>
);

// The default: the user came to top up their balance, so the dialog explains
// what credits are for and points at the best value package.
export const Standard = (): React.Node => (
  <Wrapper>
    <CreditsPackagesDialog
      onClose={() => {}}
      suggestedPackage={null}
      missingCredits={null}
      dialogVariant="standard"
    />
  </Wrapper>
);

// Opened after running out of AI credits: same packages, told from the point of
// view of building with the AI.
export const AiVariant = (): React.Node => (
  <Wrapper>
    <CreditsPackagesDialog
      onClose={() => {}}
      suggestedPackage={null}
      missingCredits={null}
      dialogVariant="ai"
    />
  </Wrapper>
);

// The leaner variant, for users who already know what credits are.
export const CompactVariant = (): React.Node => (
  <Wrapper>
    <CreditsPackagesDialog
      onClose={() => {}}
      suggestedPackage={null}
      missingCredits={null}
      dialogVariant="compact"
    />
  </Wrapper>
);

// The user is a few credits short of a purchase: the package covering what they
// are missing is the recommended one.
export const WithSuggestedPackageAndMissingCredits = (): React.Node => (
  <Wrapper>
    <CreditsPackagesDialog
      onClose={() => {}}
      suggestedPackage={creditsPackageListingDatas[1]}
      missingCredits={800}
    />
  </Wrapper>
);

export const WithCalloutTip = (): React.Node => (
  <Wrapper>
    <CreditsPackagesDialog
      onClose={() => {}}
      suggestedPackage={null}
      missingCredits={null}
      showCalloutTip
    />
  </Wrapper>
);

// Only three packages are sold: the grid must not leave a hole.
export const WithThreePackages = (): React.Node => (
  <Wrapper creditsPackageListingDatas={creditsPackageListingDatas.slice(0, 3)}>
    <CreditsPackagesDialog
      onClose={() => {}}
      suggestedPackage={null}
      missingCredits={null}
    />
  </Wrapper>
);
