// @flow
import axios from 'axios';
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
  updatedAt: string,
  createdAt: string,
  thumbnailUrls: string[],
  prices: StripePrice[],
|};

export const listListedPrivateAssetPacks = async (): Promise<
  Array<PrivateAssetPackListingData>
> => {
  const response = await client.get('/asset-pack');
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
  return url + '?token=' + encodeURIComponent(token);
};

export const extractFilenameFromProductAuthorizedUrl = (
  url: string
): string => {
  return url.split('?')[0].substring(url.lastIndexOf('/') + 1);
};
