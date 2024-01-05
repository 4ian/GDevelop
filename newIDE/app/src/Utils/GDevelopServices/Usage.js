// @flow
import axios from 'axios';
import { GDevelopUsageApi } from './ApiConfigs';
import { type MessageDescriptor } from '../i18n/MessageDescriptor.flow';
import { type MessageByLocale } from '../i18n/MessageByLocale';
import { extractGDevelopApiErrorStatusAndCode } from './Errors';

export type Usage = {
  id: string,
  userId: string,
  type: string,
  createdAt: number,
};
export type Usages = Array<Usage>;

export type Subscription = {|
  userId: string,
  planId: string | null,
  createdAt: number,
  updatedAt: number,
  /**
   * Id of the pricing system.
   * null when subscription is empty.
   */
  pricingSystemId:
    | 'REDEMPTION_CODE'
    | 'MANUALLY_ADDED'
    | 'TEAM_MEMBER'
    | string
    | null,
  stripeSubscriptionId?: string,
  stripeCustomerId?: string,
  paypalSubscriptionId?: string,
  paypalPayerId?: string,

  cancelAtPeriodEnd?: boolean,

  purchaselyPlan?: string,

  redemptionCode?: string | null,
  redemptionCodeValidUntil?: number | null,

  benefitsFromEducationPlan?: boolean,
|};

/**
 * This describes what a user can do on our online services.
 */
export type Capabilities = {|
  analytics: {
    sessions: boolean,
    players: boolean,
    retention: boolean,
    sessionsTimeStats: boolean,
    platforms: boolean,
  },
  cloudProjects: {
    maximumCount: number,
    canMaximumCountBeIncreased: boolean,
    maximumGuestCollaboratorsPerProject: number,
  },
  leaderboards: {
    maximumCountPerGame: number,
    canMaximumCountPerGameBeIncreased: boolean,
    themeCustomizationCapabilities: 'NONE' | 'BASIC' | 'FULL',
    canUseCustomCss: boolean,
  },
|};

export type UsagePrices = {|
  [key: string]: {|
    priceInCredits: number,
  |},
|};

export type UsagePurchasableQuantities = {|
  [key: string]: {|
    purchasableQuantity: number,
  |},
|};

export type UserBalance = {|
  amount: number,
|};

/**
 * The current Quota values made by a user of something.
 * Typically: the number of remaining builds for a user.
 */
export type Quota = {|
  limitReached: boolean,
  current: number,
  max: number,
|};

export type Quotas = {
  [string]: Quota,
};

/**
 * The limits communicated by the API for a user.
 */
export type Limits = {|
  quotas: Quotas,
  capabilities: Capabilities,
  credits: {
    userBalance: UserBalance,
    prices: UsagePrices,
    purchasableQuantities: UsagePurchasableQuantities,
  },
  message: string | typeof undefined,
|};

export type PlanDetails = {|
  planId: string | null,
  legacyPlanId?: string,
  name: string,
  monthlyPriceInEuros: number | null,
  yearlyPriceInEuros?: number | null,
  isPerUser?: true,
  smallDescription?: MessageDescriptor,
  hideInSubscriptionDialog?: boolean,
  descriptionBullets: Array<{|
    message: MessageDescriptor,
  |}>,
|};

export type SubscriptionPlanPricingSystem = {|
  id: string,
  planId: string,
  period: 'week' | 'month' | 'year',
  isPerUser?: true,
  currency: 'EUR' | 'USD',
  region: 'north' | 'south' | 'everywhere',
  amountInCents: number,
  periodCount: number,
|};

export type SubscriptionPlan = {|
  id: string,
  isLegacy: boolean,
  nameByLocale: MessageByLocale,
  descriptionByLocale: MessageByLocale,
  bulletPointsByLocale: Array<MessageByLocale>,
|};

export type SubscriptionPlanWithPricingSystems = {|
  ...SubscriptionPlan,
  pricingSystems: SubscriptionPlanPricingSystem[],
|};

export const EDUCATION_PLAN_MIN_SEATS = 5;
export const EDUCATION_PLAN_MAX_SEATS = 300;
export const apiClient = axios.create({
  baseURL: GDevelopUsageApi.baseUrl,
});

export const canPriceBeFoundInGDevelopPrices = (
  pricingSystemId: string
): boolean => {
  if (
    ['REDEMPTION_CODE', 'MANUALLY_ADDED', 'TEAM_MEMBER'].includes(
      pricingSystemId
    )
  ) {
    return false;
  }
  if (pricingSystemId.startsWith('PURCHASELY_')) return false;
  return true;
};

export const listSubscriptionPlans = async (options: {|
  includeLegacy: boolean,
|}): Promise<SubscriptionPlan[]> => {
  const response = await apiClient.get('/subscription-plan', {
    params: { includeLegacy: options.includeLegacy ? 'true' : 'false' },
  });
  return response.data;
};

export const getSubscriptionPlanPricingSystem = async (
  pricingSystemId: string
): Promise<?SubscriptionPlanPricingSystem> => {
  try {
    const response = await apiClient.get(
      `/subscription-plan-pricing-system/${pricingSystemId}`
    );
    return response.data;
  } catch (error) {
    const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(error);
    if (extractedStatusAndCode && extractedStatusAndCode.status === 404) {
      return null;
    }
    throw error;
  }
};

export const listSubscriptionPlanPricingSystems = async (
  subscriptionPlanIds?: ?(string[])
): Promise<SubscriptionPlanPricingSystem[]> => {
  const params =
    subscriptionPlanIds && subscriptionPlanIds.length > 0
      ? { subscriptionPlanIds: subscriptionPlanIds.join(',') }
      : undefined;
  const response = await apiClient.get(
    '/subscription-plan-pricing-system',
    params
  );
  return response.data;
};

export const getUserUsages = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string
): Promise<Usages> => {
  const authorizationHeader = await getAuthorizationHeader();

  const response = await apiClient.get('/usage', {
    params: {
      userId,
    },
    headers: {
      Authorization: authorizationHeader,
    },
  });
  return response.data;
};

export const getUserLimits = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string
): Promise<Limits> => {
  const authorizationHeader = await getAuthorizationHeader();

  const response = await apiClient.get('/limits', {
    params: {
      userId,
    },
    headers: {
      Authorization: authorizationHeader,
    },
  });
  return response.data;
};

export const getUserSubscription = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string
): Promise<Subscription> => {
  const authorizationHeader = await getAuthorizationHeader();

  const response = await apiClient.get('/subscription-v2', {
    params: {
      userId,
    },
    headers: {
      Authorization: authorizationHeader,
    },
  });
  return response.data;
};

export const changeUserSubscription = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  newSubscriptionDetails: {| planId: string | null, stripeToken?: any |}
): Promise<Subscription> => {
  const authorizationHeader = await getAuthorizationHeader();

  const response = await apiClient.post(
    '/subscription-v2',
    newSubscriptionDetails,
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );

  return response.data;
};

export const canSeamlesslyChangeSubscription = (
  subscription: Subscription,
  planId: string
) => {
  // If the subscription is on Stripe, it can be upgraded/downgraded seamlessly.
  // Otherwise (Paypal), it needs to be cancelled first.
  // If the user changes for an education plan and already has a subscription made with
  // Stripe, the Stripe subscription has to be cancelled first.
  return (
    !!subscription.stripeSubscriptionId &&
    !planId.startsWith('gdevelop_education')
  );
};

export const canCancelAtEndOfPeriod = (subscription: Subscription) => {
  // If the subscription is on Stripe, it can be set as cancelled and only removed at the
  // end of the period alreayd paid.
  // Otherwise (Paypal), it will be cancelled immediately.
  return !!subscription.stripeSubscriptionId;
};

export const hasMobileAppStoreSubscriptionPlan = (
  subscription: ?Subscription
): boolean => {
  return !!subscription && !!subscription.purchaselyPlan;
};

export const hasSubscriptionBeenManuallyAdded = (
  subscription: ?Subscription
): boolean => {
  return (
    !!subscription &&
    (subscription.stripeSubscriptionId === 'MANUALLY_ADDED' ||
      subscription.stripeCustomerId === 'MANUALLY_ADDED')
  );
};

export const hasValidSubscriptionPlan = (subscription: ?Subscription) => {
  const hasValidSubscription =
    !!subscription &&
    !!subscription.planId &&
    (!subscription.redemptionCodeValidUntil || // No redemption code
      subscription.redemptionCodeValidUntil > Date.now()); // Redemption code is still valid

  if (hasValidSubscription) {
    // The user has a subscription registered in the backend (classic "Registered" user).
    return true;
  }

  return false;
};

type UploadType = 'build' | 'preview';

export const getSignedUrl = async (params: {|
  uploadType: UploadType,
  key: string,
  contentType: string,
|}): Promise<{
  signedUrl: string,
}> => {
  const response = await apiClient.post('/upload-options/signed-url', params);
  return response.data;
};

export const getRedirectToSubscriptionPortalUrl = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string
): Promise<string> => {
  const authorizationHeader = await getAuthorizationHeader();

  const response = await apiClient.post(
    '/subscription-v2/action/redirect-to-portal',
    {},
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );

  const { sessionPortalUrl } = response.data;
  if (!sessionPortalUrl || typeof sessionPortalUrl !== 'string')
    throw new Error('Could not find the session portal url.');

  return sessionPortalUrl;
};

export const getRedirectToCheckoutUrl = ({
  planId,
  userId,
  userEmail,
  quantity,
}: {|
  planId: string,
  userId: string,
  userEmail: string,
  quantity?: number,
|}): string => {
  const url = new URL(
    `${GDevelopUsageApi.baseUrl}/subscription-v2/action/redirect-to-checkout`
  );
  url.searchParams.set('planId', planId);
  url.searchParams.set('userId', userId);
  url.searchParams.set('customerEmail', userEmail);
  if (quantity !== undefined && quantity > 1)
    url.searchParams.set('quantity', quantity.toString());
  return url.toString();
};

export const getRedirectToCheckoutUrlV2 = ({
  pricingSystemId,
  userId,
  userEmail,
  quantity,
}: {|
  pricingSystemId: string,
  userId: string,
  userEmail: string,
  quantity?: number,
|}): string => {
  const url = new URL(
    `${GDevelopUsageApi.baseUrl}/subscription-v2/action/redirect-to-checkout-v2`
  );
  url.searchParams.set('pricingSystemId', pricingSystemId);
  url.searchParams.set('userId', userId);
  url.searchParams.set('customerEmail', userEmail);
  if (quantity !== undefined && quantity > 1)
    url.searchParams.set('quantity', quantity.toString());
  return url.toString();
};

export const canUseCloudProjectHistory = (
  subscription: ?Subscription
): boolean => {
  if (!subscription) return false;
  return (
    ['gdevelop_business', 'gdevelop_startup', 'gdevelop_education'].includes(
      subscription.planId
    ) ||
    (subscription.planId === 'gdevelop_gold' &&
      !!subscription.benefitsFromEducationPlan)
  );
};

export const redeemCode = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  code: string
): Promise<void> => {
  const authorizationHeader = await getAuthorizationHeader();

  await apiClient.post(
    '/redemption-code/action/redeem-code',
    {
      code,
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

export const canBenefitFromDiscordRole = (subscription: ?Subscription) => {
  return (
    !!subscription &&
    ['gdevelop_education', 'gdevelop_startup', 'gdevelop_gold'].includes(
      subscription.planId
    ) &&
    !subscription.benefitsFromEducationPlan
  );
};
