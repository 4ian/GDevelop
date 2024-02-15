// @flow
import axios from 'axios';
import path from 'path-browserify';
import { GDevelopShopApi } from './ApiConfigs';
import { isURL } from '../../ResourcesList/ResourceUtils';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { type MessageByLocale } from '../i18n/MessageByLocale';

const client = axios.create({
  baseURL: GDevelopShopApi.baseUrl,
});

type StripeAndPaypalPrice = {|
  value: number,
  name: string,
  usageType: string,
  stripePriceId: string,
  currency: 'USD' | 'EUR',
|};

type CreditPrice = {|
  amount: number,
  usageType: string,
|};

type ProductListingData = {|
  id: string,
  sellerId: string,
  isSellerGDevelop: boolean,
  productType: 'ASSET_PACK' | 'GAME_TEMPLATE',
  listing: 'ASSET_PACK' | 'GAME_TEMPLATE',
  name: string,
  description: string,
  categories: Array<string>,
  updatedAt: string,
  createdAt: string,
  thumbnailUrls: string[],
  includedListableProductIds?: string[],
|};

type StripeAndPaypalSellableAttributes = {|
  prices: StripeAndPaypalPrice[],
  sellerStripeAccountId: string,
  stripeProductId: string,
|};

type CreditsClaimableAttributes = {|
  creditPrices: Array<CreditPrice>,
|};

type AppStoreProductAttributes = {|
  appStoreProductId: string | null,
  /** The thumbnails to use when on the app store - otherwise, use thumbnailUrls as usual. */
  appStoreThumbnailUrls?: string[] | null,
|};

export type PrivateAssetPackListingData = {|
  ...ProductListingData,
  ...StripeAndPaypalSellableAttributes,
  ...AppStoreProductAttributes,
  ...CreditsClaimableAttributes,
  productType: 'ASSET_PACK',
  listing: 'ASSET_PACK',
|};

export type PrivateGameTemplateListingData = {|
  ...ProductListingData,
  ...StripeAndPaypalSellableAttributes,
  ...AppStoreProductAttributes,
  ...CreditsClaimableAttributes,
  productType: 'GAME_TEMPLATE',
  listing: 'GAME_TEMPLATE',
|};

export type CreditsPackageListingData = {|
  ...ProductListingData,
  ...StripeAndPaypalSellableAttributes,
  ...AppStoreProductAttributes,
  productType: 'CREDITS_PACKAGE',
  listing: 'CREDITS_PACKAGE',
|};

export type Purchase = {|
  id: string,
  productType: string,
  usageType: string,
  productId: string,
  buyerId: string,
  receiverId: string,
  createdAt: string,
  cancelledAt?: string,
  stripeCheckoutSessionId?: string,
  stripeCustomerId?: string,
  appStoreTransactionId?: string,
  paypalPayerId?: string,
  paypalOrderId?: string,
  manualGiftReason?: string,
  creditsAmount?: number,
  productType: 'ASSET_PACK' | 'GAME_TEMPLATE' | 'CREDITS_PACKAGE',
|};

type ProductLicenseType = 'personal' | 'commercial' | 'unlimited';
export type ProductLicense = {|
  id: ProductLicenseType,
  nameByLocale: MessageByLocale,
  descriptionByLocale: MessageByLocale,
|};

export const listListedPrivateAssetPacks = async (): Promise<
  Array<PrivateAssetPackListingData>
> => {
  const response = await client.get('/asset-pack');
  const assetPacks = response.data;
  if (!Array.isArray(assetPacks)) {
    throw new Error('Invalid response from the asset packs API');
  }

  return assetPacks;
};

export const listListedPrivateGameTemplates = async (): Promise<
  Array<PrivateGameTemplateListingData>
> => {
  const response = await client.get('/game-template');
  const gameTemplates = response.data;
  if (!Array.isArray(gameTemplates)) {
    throw new Error('Invalid response from the game templates API');
  }

  return gameTemplates;
};

export const listListedCreditsPackages = async (): Promise<
  Array<CreditsPackageListingData>
> => {
  const response = await client.get('/credits-package');
  const creditsPackages = response.data;
  if (!Array.isArray(creditsPackages)) {
    throw new Error('Invalid response from the credits packages API');
  }

  return creditsPackages;
};

export const listSellerAssetPacks = async ({
  sellerId,
}: {|
  sellerId: string,
|}): Promise<Array<PrivateAssetPackListingData>> => {
  const response = await client.get(`/user/${sellerId}/product`, {
    params: {
      productType: 'asset-pack',
    },
  });
  return response.data;
};

export const listSellerGameTemplates = async ({
  sellerId,
}: {|
  sellerId: string,
|}): Promise<Array<PrivateGameTemplateListingData>> => {
  const response = await client.get(`/user/${sellerId}/product`, {
    params: {
      productType: 'game-template',
    },
  });
  return response.data;
};

export const listUserPurchases = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    productType,
    role,
  }: {|
    userId: string,
    productType: 'asset-pack' | 'game-template' | 'credits-package',
    role: 'receiver' | 'buyer',
  |}
): Promise<Array<Purchase>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get('/purchase', {
    params: {
      userId,
      productType,
      role,
    },
    headers: {
      Authorization: authorizationHeader,
    },
  });
  return response.data;
};

export const getAuthorizationTokenForPrivateAssets = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
  }: {|
    userId: string,
  |}
): Promise<string> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.post(
    '/asset-pack/action/authorize',
    {},
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};

export const getAuthorizationTokenForPrivateGameTemplates = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
  }: {|
    userId: string,
  |}
): Promise<string> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.post(
    '/game-template/action/authorize',
    {},
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};

export const createProductAuthorizedUrl = (
  url: string,
  token: string
): string => {
  return url.indexOf('?') !== -1
    ? `${url}&token=${encodeURIComponent(token)}`
    : `${url}?token=${encodeURIComponent(token)}`;
};

export const isPrivateAssetResourceAuthorizedUrl = (url: string): boolean =>
  url.startsWith('https://private-assets.gdevelop.io/') ||
  url.startsWith('https://private-assets-dev.gdevelop.io/');

export const isPrivateGameTemplateResourceAuthorizedUrl = (
  url: string
): boolean =>
  url.startsWith('https://private-game-templates.gdevelop.io/') ||
  url.startsWith('https://private-game-templates-dev.gdevelop.io/');

export const isProductAuthorizedResourceUrl = (url: string): boolean =>
  isPrivateAssetResourceAuthorizedUrl(url) ||
  isPrivateGameTemplateResourceAuthorizedUrl(url);

export const extractDecodedFilenameWithExtensionFromProductAuthorizedUrl = (
  productAuthorizedUrl: string
): string => {
  const urlWithoutQueryParams = productAuthorizedUrl.split('?')[0];
  const decodedFilenameWithExtension = decodeURIComponent(
    path.basename(urlWithoutQueryParams)
  );
  return decodedFilenameWithExtension;
};

export const getPurchaseCheckoutUrl = ({
  productId,
  priceName,
  userId,
  userEmail,
  password,
}: {|
  productId: string,
  priceName: string,
  userId: string,
  userEmail: string,
  password?: string,
|}): string => {
  const url = new URL(
    `${GDevelopShopApi.baseUrl}/purchase/action/redirect-to-checkout`
  );

  url.searchParams.set('productId', productId);
  url.searchParams.set('priceName', priceName);
  url.searchParams.set('userId', userId);
  url.searchParams.set('customerEmail', userEmail);
  if (password) url.searchParams.set('password', password);

  return url.toString();
};

// Helper to fetch a token for private game templates if needed, when moving or fetching resources.
export const fetchTokenForPrivateGameTemplateAuthorizationIfNeeded = async ({
  authenticatedUser,
  allResourcePaths,
}: {|
  authenticatedUser: AuthenticatedUser,
  allResourcePaths: Array<string>,
|}): Promise<?string> => {
  const isFetchingGameTemplateAuthorizedResources = allResourcePaths.some(
    resourcePath =>
      isURL(resourcePath) &&
      isPrivateGameTemplateResourceAuthorizedUrl(resourcePath)
  );

  if (isFetchingGameTemplateAuthorizedResources) {
    const userId = authenticatedUser.profile && authenticatedUser.profile.id;
    if (!userId) {
      throw new Error(
        'Can not fetch resources from a private game template without being authenticated.'
      );
    }
    const tokenForPrivateGameTemplateAuthorization = await getAuthorizationTokenForPrivateGameTemplates(
      authenticatedUser.getAuthorizationHeader,
      { userId }
    );
    return tokenForPrivateGameTemplateAuthorization;
  }
  return null;
};

export const listProductLicenses = async ({
  productType,
}: {|
  productType: 'asset-pack' | 'game-template',
|}): Promise<ProductLicense[]> => {
  const response = await client.get('/product-license', {
    params: {
      productType,
    },
  });
  const productLicenses = response.data;

  if (!Array.isArray(productLicenses)) {
    throw new Error('Invalid response from the product licenses API');
  }

  return productLicenses;
};

export const buyProductWithCredits = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    productId,
    usageType,
    userId,
  }: {|
    productId: string,
    usageType: string,
    userId: string,
  |}
): Promise<void> => {
  const authorizationHeader = await getAuthorizationHeader();
  await client.post(
    `/product/${productId}/action/buy-with-credits`,
    {
      usageType: 'product-purchase',
      priceUsageType: usageType,
    },
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
};
