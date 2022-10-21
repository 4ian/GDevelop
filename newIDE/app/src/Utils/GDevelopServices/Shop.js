// @flow
import axios from 'axios';
import { GDevelopShopApi } from './ApiConfigs';
import optionalRequire from '../../Utils/OptionalRequire';
const path = optionalRequire('path');

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
  updatedAt: string,
  createdAt: string,
  thumbnailUrls: string[],
  prices: StripePrice[],
|};

type Purchase = {|
  id: string,
  productId: string,
  buyerId: string,
  receiverId: string,
  createdAt: string,
  cancelledAt?: string,
  stripeCheckoutSessionId?: string,
|};

export const listListedPrivateAssetPacks = async (): Promise<
  Array<PrivateAssetPackListingData>
> => {
  const response = await client.get('/asset-pack');
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

export const extractFilenameAndExtensionFromProductAuthorizedUrl = (
  url: string
): {
  filenameWithoutExtension: string,
  extension: string,
} => {
  const urlWithoutQueryParams = url.split('?')[0];
  const extension = path.extname(urlWithoutQueryParams);
  const filenameWithoutExtension = path.basename(
    urlWithoutQueryParams,
    extension
  );
  return { filenameWithoutExtension, extension };
};

export const getStripeCheckoutUrl = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    stripePriceId,
    userId,
    customerEmail,
  }: {|
    stripePriceId: string,
    userId: string,
    customerEmail: string,
  |}
): Promise<string> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.post(
    '/purchase/action/create-stripe-checkout-session',
    {
      stripePriceId,
      customerEmail,
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
