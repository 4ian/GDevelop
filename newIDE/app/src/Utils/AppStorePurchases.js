// @flow
export type AppStoreProduct = {|
  type: 'RENEWING_SUBSCRIPTION' | 'NON_CONSUMABLE',
  name: string,

  productId: string,
  vendorId: string,

  price: string,

  hasIntroductoryPrice: boolean,
  introPrice: string,
  introPeriod: string,
  introDuration: string,
|};

// Subscriptions:
/**
 * Check if the user has subscription bought on the app store.
 */
export const hasAppStoreUserSubscription = () => {
  return false;
};

// Products:

export const shouldUseAppStoreProduct = () => false;

export const getAppStoreProduct = (
  productId: string | null
): ?AppStoreProduct => {
  return null;
};

export const purchaseAppStoreProduct = async (
  productId: string | null
): Promise<void> => {};
