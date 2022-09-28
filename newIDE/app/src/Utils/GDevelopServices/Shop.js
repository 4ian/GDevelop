// @flow
import axios from 'axios';
import { GDevelopShopApi } from './ApiConfigs';
// import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

const client = axios.create({
  baseURL: GDevelopShopApi.baseUrl,
});

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
|};

export const listListedPrivateAssetPacks = async (): Promise<
  Array<PrivateAssetPackListingData>
> => {
  const response = await client.get('/asset-pack');
  return response.data;
};

type Purchase = {|
  id: string,
  productId: string,
  buyerId: string,
  receiverId: string,
  createdAt: string,
  cancelledAt?: string,
|};

// export const getCredentialsForPrivateAssets = async (
//   authenticatedUser: AuthenticatedUser
// ): Promise<?string> => {
//   const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
//   if (!firebaseUser) return null;

//   const { uid: userId } = firebaseUser;
//   const authorizationHeader = await getAuthorizationHeader();
//   const response = await axios.post(
//     `${GDevelopShopApi.baseUrl}/asset-pack/action/authorize`,
//     {},
//     {
//       headers: { Authorization: authorizationHeader },
//       params: { userId },
//     }
//   );
//   return response.data;
// };

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
  const response = await axios.get(`${GDevelopShopApi.baseUrl}/purchase`, {
    headers: { Authorization: authorizationHeader },
    params: { userId, productType, role },
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
  const response = await axios.post(
    `${GDevelopShopApi.baseUrl}/asset-pack/action/authorize`,
    {},
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};
