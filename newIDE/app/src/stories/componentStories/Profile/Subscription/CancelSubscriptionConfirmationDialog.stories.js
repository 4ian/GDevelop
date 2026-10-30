// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import MockAdapter from 'axios-mock-adapter';

import paperDecorator from '../../../PaperDecorator';
import CancelSubscriptionConfirmationDialog from '../../../../Profile/Subscription/CancelSubscriptionConfirmationDialog';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../../../../Profile/AuthenticatedUserContext';
import {
  fakeGoldAuthenticatedUser,
  subscriptionForGoldUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import {
  fakeGoldMonthlyPricingSystem,
  fakeGoldSubscriptionPlanWithPricingSystems,
  fakeGoldYearlyPricingSystem,
} from '../../../../fixtures/GDevelopServicesTestData/FakeSubscriptionPlans';
import { client as shopApiClient } from '../../../../Utils/GDevelopServices/Shop';
import {
  claimableAssetPackListingData,
  claimableGameTemplateListingData,
  nextMonthAssetPackListingData,
  nextMonthGameTemplateListingData,
} from '../../AssetStore/ClaimableProducts/ClaimableProductsFixtures';

export default {
  title: 'Subscription/CancelSubscriptionConfirmationDialog',
  component: CancelSubscriptionConfirmationDialog,
  decorators: [paperDecorator],
};

const getMonth = (monthOffset: number): string => {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`;
};

const mockShopApi = ({ delayResponse }: {| delayResponse?: number |}) => {
  const shopServiceMock = new MockAdapter(shopApiClient, {
    delayResponse: delayResponse || 250,
  });
  shopServiceMock
    .onGet('/asset-pack')
    .reply(200, [claimableAssetPackListingData, nextMonthAssetPackListingData])
    .onGet('/game-template')
    .reply(200, [
      claimableGameTemplateListingData,
      nextMonthGameTemplateListingData,
    ])
    .onGet('/given-away-product')
    .reply(200, [
      {
        month: getMonth(0),
        productType: 'ASSET_PACK',
        productId: claimableAssetPackListingData.id,
      },
      {
        month: getMonth(0),
        productType: 'GAME_TEMPLATE',
        productId: claimableGameTemplateListingData.id,
      },
      {
        month: getMonth(1),
        productType: 'ASSET_PACK',
        productId: nextMonthAssetPackListingData.id,
      },
      {
        month: getMonth(1),
        productType: 'GAME_TEMPLATE',
        productId: nextMonthGameTemplateListingData.id,
      },
    ])
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });
};

const monthlyGoldAuthenticatedUser: AuthenticatedUser = {
  ...fakeGoldAuthenticatedUser,
  subscription: {
    ...subscriptionForGoldUser,
    pricingSystemId: fakeGoldMonthlyPricingSystem.id,
  },
  receivedGameTemplates: [],
};

const yearlyGoldAuthenticatedUser: AuthenticatedUser = {
  ...monthlyGoldAuthenticatedUser,
  subscription: {
    ...subscriptionForGoldUser,
    pricingSystemId: fakeGoldYearlyPricingSystem.id,
  },
};

const DialogWithUser = ({
  authenticatedUser,
}: {|
  authenticatedUser: AuthenticatedUser,
|}) => (
  <AuthenticatedUserContext.Provider value={authenticatedUser}>
    <CancelSubscriptionConfirmationDialog
      userSubscriptionPlanEvenIfLegacy={
        fakeGoldSubscriptionPlanWithPricingSystems
      }
      onConfirm={action('onConfirm')}
      onClose={action('onClose')}
    />
  </AuthenticatedUserContext.Provider>
);

export const MonthlyWithUnclaimedProducts = (): React.Node => {
  mockShopApi({});
  return <DialogWithUser authenticatedUser={monthlyGoldAuthenticatedUser} />;
};

export const MonthlyWithEverythingClaimed = (): React.Node => {
  mockShopApi({});
  return (
    <DialogWithUser
      authenticatedUser={{
        ...monthlyGoldAuthenticatedUser,
        receivedAssetPacks: [
          // $FlowFixMe[incompatible-type] - Only the id is used.
          { id: claimableAssetPackListingData.id },
        ],
        receivedGameTemplates: [
          // $FlowFixMe[incompatible-type] - Only the id is used.
          { id: claimableGameTemplateListingData.id },
        ],
      }}
    />
  );
};

export const YearlyWithUnclaimedProducts = (): React.Node => {
  mockShopApi({});
  return <DialogWithUser authenticatedUser={yearlyGoldAuthenticatedUser} />;
};

export const Loading = (): React.Node => {
  mockShopApi({ delayResponse: 100000 });
  return <DialogWithUser authenticatedUser={monthlyGoldAuthenticatedUser} />;
};
