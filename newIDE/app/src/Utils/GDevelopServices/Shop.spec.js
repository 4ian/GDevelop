// @flow
import {
  extractDecodedFilenameWithExtensionFromProductAuthorizedUrl,
  getClaimableProductListingDatas,
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
  type RedeemCondition,
} from './Shop';
import {
  fakePrivateAssetPack1ListingData,
  fakePrivateGameTemplateListingData,
  subscriptionForGoldUser,
  subscriptionForSilverUser,
} from '../../fixtures/GDevelopServicesTestData';

const redeemConditions: Array<RedeemCondition> = [
  {
    reason: 'subscription',
    condition: 'gdevelop_gold,gdevelop_startup',
    usageType: 'commercial',
  },
];
const claimableAssetPackListingData: PrivateAssetPackListingData = {
  ...fakePrivateAssetPack1ListingData,
  redeemConditions,
};
const claimableGameTemplateListingData: PrivateGameTemplateListingData = {
  ...fakePrivateGameTemplateListingData,
  redeemConditions,
};

describe('Shop service', () => {
  describe('extractDecodedFilenameFromProductAuthorizedUrl', () => {
    it('works if asset file has an extension', () => {
      expect(
        extractDecodedFilenameWithExtensionFromProductAuthorizedUrl(
          'https://private-assets.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/file-to-download.png?token=1234567890'
        )
      ).toStrictEqual('file-to-download.png');
    });
    it('works if game template file has an extension', () => {
      expect(
        extractDecodedFilenameWithExtensionFromProductAuthorizedUrl(
          'https://private-game-templates.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/file-to-download.png?token=1234567890'
        )
      ).toStrictEqual('file-to-download.png');
    });
    it('works if file has no extension', () => {
      expect(
        extractDecodedFilenameWithExtensionFromProductAuthorizedUrl(
          'https://private-assets.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/file-to-download?token=1234567890'
        )
      ).toStrictEqual('file-to-download');
    });
    it('works if url is encoded', () => {
      expect(
        extractDecodedFilenameWithExtensionFromProductAuthorizedUrl(
          'https://private-game-templates.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/file%20to%20download.png?token=1234567890'
        )
      ).toStrictEqual('file to download.png');
    });
  });

  describe('getClaimableProductListingDatas', () => {
    const notClaimableAssetPackListingData: PrivateAssetPackListingData = {
      ...fakePrivateAssetPack1ListingData,
      id: 'not-claimable-pack',
    };
    const listingDatas = {
      privateAssetPackListingDatas: [
        notClaimableAssetPackListingData,
        claimableAssetPackListingData,
      ],
      privateGameTemplateListingDatas: [claimableGameTemplateListingData],
    };

    it('returns the products of the month not owned yet', () => {
      expect(
        getClaimableProductListingDatas({
          subscription: subscriptionForGoldUser,
          ...listingDatas,
          receivedAssetPacks: [],
          receivedGameTemplates: [],
        })
      ).toEqual([
        claimableAssetPackListingData,
        claimableGameTemplateListingData,
      ]);
    });

    it('excludes the products already owned', () => {
      expect(
        getClaimableProductListingDatas({
          subscription: subscriptionForGoldUser,
          ...listingDatas,
          receivedAssetPacks: [{ id: claimableAssetPackListingData.id }],
          receivedGameTemplates: [],
        })
      ).toEqual([claimableGameTemplateListingData]);
      expect(
        getClaimableProductListingDatas({
          subscription: subscriptionForGoldUser,
          ...listingDatas,
          receivedAssetPacks: [{ id: claimableAssetPackListingData.id }],
          receivedGameTemplates: [{ id: claimableGameTemplateListingData.id }],
        })
      ).toEqual([]);
    });

    it('returns nothing if the subscription does not allow claiming', () => {
      expect(
        getClaimableProductListingDatas({
          subscription: subscriptionForSilverUser,
          ...listingDatas,
          receivedAssetPacks: [],
          receivedGameTemplates: [],
        })
      ).toEqual([]);
    });
  });
});
