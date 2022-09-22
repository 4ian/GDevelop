// @flow
import axios from 'axios';
import { GDevelopShopApi } from './ApiConfigs';

const client = axios.create({
  baseURL: GDevelopShopApi.baseUrl,
});

export type PrivateAssetPack = {|
  id: string,
  sellerId: string,
  productType: 'ASSET_PACK',
  listing: 'ASSET_PACK',
  name: string,
  description: string,
  updatedAt: string,
  createdAt: string,
  thumbnailUrls: string[],
|};

export const listListedPrivateAssetPacks = async (): Promise<
  Array<PrivateAssetPack>
> => {
  const response = await client.get('/asset-pack', {});
  return response.data;
};
