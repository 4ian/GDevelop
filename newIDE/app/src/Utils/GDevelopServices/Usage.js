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

export type CancelReasons = {
  [key: string]: boolean | string,
};

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
  cancelReasons?: CancelReasons,

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

export type UsagePrice = {|
  priceInCredits: number,
|};

export type UsagePrices = {|
  [key: string]: UsagePrice,
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
  period?: '1day' | '30days',
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
  region: string,
  amountInCents: number,
  periodCount: number,
|};

export type SubscriptionPlan = {|
  id: string,
  isLegacy: boolean,
  nameByLocale: MessageByLocale,
  descriptionByLocale: MessageByLocale,
  bulletPointsByLocale: Array<MessageByLocale>,
  specificRequirementByLocale?: MessageByLocale,
  targetAudiences: Array<'CASUAL' | 'PRO' | 'EDUCATION'>,
  fullFeatures: Array<{|
    featureName: string,
    pillarName: string,
    descriptionByLocale?: MessageByLocale,
    tooltipByLocale?: MessageByLocale,
    enabled?: 'yes' | 'no',
    unlimited?: true,
    upcoming?: true,
    trialLike?: true,
  |}>,

  pillarNamesPerLocale: { [key: string]: MessageByLocale },
  featureNamesByLocale: { [key: string]: MessageByLocale },
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

export const listSubscriptionPlanPricingSystems = async (options: {|
  subscriptionPlanIds?: ?(string[]),
  includeLegacy: boolean,
|}): Promise<SubscriptionPlanPricingSystem[]> => {
  const params: {| includeLegacy: string, subscriptionPlanIds?: string |} = {
    includeLegacy: options.includeLegacy ? 'true' : 'false',
  };
  if (options.subscriptionPlanIds && options.subscriptionPlanIds.length > 0) {
    params.subscriptionPlanIds = options.subscriptionPlanIds.join(',');
  }
  const response = await apiClient.get('/subscription-plan-pricing-system', {
    params,
  });
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
  newSubscriptionDetails: {| planId: string | null |},
  options: {| cancelImmediately: boolean, cancelReasons: CancelReasons |}
): Promise<Subscription> => {
  const authorizationHeader = await getAuthorizationHeader();

  const response = await apiClient.post(
    '/subscription-v2',
    {
      ...newSubscriptionDetails,
      prohibitSeamlessUpdate: true,
      cancelImmediately: options.cancelImmediately,
      cancelReasons: options.cancelReasons,
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

  return response.data;
};

export const canSeamlesslyChangeSubscription = (
  subscription: Subscription,
  planId: string
) => {
  // Bringing prices with different currencies prevents subscriptions to be changed seamlessly
  // on Stripe.
  // TODO: When the backend allows it, make it possible to seamlessly change subscription
  // if the currencies of the current and requested subscriptions match.
  return false;
};

export const canCancelAtEndOfPeriod = (subscription: Subscription) => {
  // If the subscription is on Stripe, it can be set as cancelled and only removed at the
  // end of the period already paid.
  // Otherwise (Paypal), it will be cancelled immediately.
  // TODO: When the backend allows it, remove this payment provider condition.
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
  return !!subscription && subscription.pricingSystemId === 'MANUALLY_ADDED';
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
    ['gdevelop_startup', 'gdevelop_education'].includes(subscription.planId) ||
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

export const canUpgradeSubscription = (subscription: ?Subscription) => {
  return (
    !!subscription &&
    !['gdevelop_education', 'gdevelop_startup'].includes(subscription.planId) &&
    !subscription.benefitsFromEducationPlan
  );
};
