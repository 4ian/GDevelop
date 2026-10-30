// @flow
import {
  fakePrivateAssetPack1ListingData,
  fakePrivateAssetPack2ListingData,
  fakePrivateGameTemplateListingData,
} from '../../../../fixtures/GDevelopServicesTestData';
import {
  type RedeemCondition,
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
} from '../../../../Utils/GDevelopServices/Shop';

const goldRedeemConditions: Array<RedeemCondition> = [
  {
    reason: 'subscription',
    condition: 'gdevelop_gold,gdevelop_startup',
    usageType: 'commercial',
  },
];

export const claimableAssetPackListingData: PrivateAssetPackListingData = {
  ...fakePrivateAssetPack1ListingData,
  isSellerGDevelop: true,
  redeemConditions: goldRedeemConditions,
};

export const nextMonthAssetPackListingData: PrivateAssetPackListingData = {
  ...fakePrivateAssetPack2ListingData,
  isSellerGDevelop: true,
};

export const claimableGameTemplateListingData: PrivateGameTemplateListingData = {
  ...fakePrivateGameTemplateListingData,
  id: 'claimable-game-template-id',
  name: 'Action Platformer Pixel',
  isSellerGDevelop: true,
  redeemConditions: goldRedeemConditions,
};

export const nextMonthGameTemplateListingData: PrivateGameTemplateListingData = {
  ...fakePrivateGameTemplateListingData,
  id: 'next-month-game-template-id',
  name: 'FPS 3D Multiplayer',
  isSellerGDevelop: true,
};
