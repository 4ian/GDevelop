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
