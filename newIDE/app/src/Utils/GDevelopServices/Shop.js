// @flow
import axios from 'axios';
import path from 'path-browserify';
import { GDevelopShopApi } from './ApiConfigs';
import { isURL } from '../../ResourcesList/ResourceUtils';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

const client = axios.create({
  baseURL: GDevelopShopApi.baseUrl,
});

type StripePrice = {|
  value: number,
  name: 'default',
  stripePriceId: string,
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
  prices: StripePrice[],

  /** The id of the product on the app stores - if any. */
  appStoreProductId: string | null,

  includedListableProductIds?: string[],
  /** The thumbnails to use when on the app store - otherwise, use thumbnailUrls as usual. */
  appStoreThumbnailUrls?: string[] | null,
|};

export type PrivateAssetPackListingData = {|
  ...ProductListingData,
  productType: 'ASSET_PACK',
  listing: 'ASSET_PACK',
|};

export type PrivateGameTemplateListingData = {|
  ...ProductListingData,
  productType: 'GAME_TEMPLATE',
  listing: 'GAME_TEMPLATE',
|};

type Purchase = {|
  id: string,
  productId: string,
  buyerId: string,
  receiverId: string,
  createdAt: string,
  cancelledAt?: string,
  stripeCheckoutSessionId?: string,
  appStoreTransactionId?: string,
|};

export const listListedPrivateAssetPacks = async ({
  onlyAppStorePrivateAssetPacks,
}: {|
  onlyAppStorePrivateAssetPacks?: ?boolean,
|}): Promise<Array<PrivateAssetPackListingData>> => {
  const response = await client.get('/asset-pack', {
    params: {
      withAppStoreProductId: !!onlyAppStorePrivateAssetPacks,
    },
  });
  return response.data;
};

export const listListedPrivateGameTemplates = async ({
  onlyAppStorePrivateGameTemplates,
}: {|
  onlyAppStorePrivateGameTemplates?: ?boolean,
|}): Promise<Array<PrivateGameTemplateListingData>> => {
  const response = await client.get('/game-template', {
    params: {
      withAppStoreProductId: !!onlyAppStorePrivateGameTemplates,
    },
  });
  return response.data;
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
    productType: 'asset-pack' | 'game-template',
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

export const extractFilenameWithExtensionFromProductAuthorizedUrl = (
  url: string
): string => {
  const urlWithoutQueryParams = url.split('?')[0];
  const filenameWithExtension = path.basename(urlWithoutQueryParams);
  return filenameWithExtension;
};

export const getStripeCheckoutUrl = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    priceName,
    productId,
    userId,
    customerEmail,
    password,
  }: {|
    priceName: string,
    productId: string,
    userId: string,
    customerEmail: string,
    password?: string,
  |}
): Promise<string> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.post(
    '/purchase/action/create-stripe-checkout-session',
    {
      priceName,
      productId,
      customerEmail,
      password,
    },
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  if (!response.data) throw new Error('Could not create the checkout session.');
  if (!response.data.sessionUrl)
    throw new Error('Could not find the session url.');
  return response.data.sessionUrl;
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
