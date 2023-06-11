// @flow
import axios from 'axios';
import path from 'path';
import { GDevelopShopApi } from './ApiConfigs';

const client = axios.create({
  baseURL: GDevelopShopApi.baseUrl,
});

type StripePrice = {|
  value: number,
  name: 'default',
  stripePriceId: string,
|};

export type PrivateAssetPackListingData = {|
  id: string,
  sellerId: string,
  productType: 'ASSET_PACK',
  listing: 'ASSET_PACK',
  name: string,
  description: string,
  categories: Array<string>,
  updatedAt: string,
  createdAt: string,
  thumbnailUrls: string[],
  prices: StripePrice[],

  /** The id of the product on the app stores - if any. */
  appStoreProductId: string | null,
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

export const listSellerProducts = async ({
  sellerId,
  productType,
}: {|
  sellerId: string,
  productType: 'asset-pack',
|}): Promise<Array<PrivateAssetPackListingData>> => {
  const response = await client.get(`/user/${sellerId}/product`, {
    params: {
      productType,
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
    productType: 'asset-pack',
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

export const createProductAuthorizedUrl = (
  url: string,
  token: string
): string => {
  return url.indexOf('?') !== -1
    ? `${url}&token=${token}`
    : `${url}?token=${encodeURIComponent(token)}`;
};

export const isProductAuthorizedResourceUrl = (url: string): boolean =>
  url.startsWith('https://private-assets.gdevelop.io/') ||
  url.startsWith('https://private-assets-dev.gdevelop.io/');

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
    stripePriceId,
    userId,
    customerEmail,
    password,
  }: {|
    stripePriceId: string,
    userId: string,
    customerEmail: string,
    password?: string,
  |}
): Promise<string> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.post(
    '/purchase/action/create-stripe-checkout-session',
    {
      stripePriceId,
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
