// @flow
import { t } from '@lingui/macro';
import axios from 'axios';
import { GDevelopUsageApi } from './ApiConfigs';
import { type MessageDescriptor } from '../i18n/MessageDescriptor.flow';

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
 * The current usage values made by a user of something.
 * Typically: the number of remaining builds for a user.
 */
export type CurrentUsage = {|
  limitReached: boolean,
  current: number,
  max: number,
|};

/**
 * This describes what a user can do on our online services.
 */
export type Capabilities = {
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
  /**
   * leaderboards is marked as optional to prevent bugs at the moment
   * the limit is enforced (endpoint deployed after the new version is released)
   */
  leaderboards?: {
    maximumCountPerGame: number,
    canMaximumCountPerGameBeIncreased: boolean,
    themeCustomizationCapabilities: 'NONE' | 'BASIC' | 'FULL',
    canUseCustomCss: boolean,
  },
};

export type CurrentUsages = {
  [string]: CurrentUsage,
};

/**
 * The limits communicated by the API for a user.
 */
export type Limits = {
  limits: CurrentUsages,
  capabilities: Capabilities,
  message: string | typeof undefined,
};

export type PlanDetails = {
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
};

export const EDUCATION_PLAN_MIN_SEATS = 5;
export const EDUCATION_PLAN_MAX_SEATS = 300;

export const getSubscriptionPlans = (): Array<PlanDetails> => [
  {
    planId: null,
    name: 'GDevelop Free & Open-source',
    monthlyPriceInEuros: 0,
    smallDescription: t`Use GDevelop for free, forever. We also give you access to these additional online services for free.`,
    descriptionBullets: [
      {
        message: t`10 cloud projects with 50MB of resources per project and 2-days version history.`,
      },
      {
        message: t`2 packagings per day for Android and for desktop.`,
      },
      {
        message: t`3 leaderboards per game and 10 player feedback responses per game.`,
      },
    ],
  },
  {
    planId: 'gdevelop_silver',
    legacyPlanId: 'gdevelop_indie',
    name: 'GDevelop Silver',
    monthlyPriceInEuros: 4.99,
    smallDescription: t`Build more and faster.`,
    descriptionBullets: [
      {
        message: t`50 cloud projects with 250MB of resources per project and 3-month version history.`,
      },
      {
        message: t`10 packagings per day for Android and for desktop.`,
      },
      {
        message: t`Unlimited leaderboards and unlimited player feedback responses.`,
      },
      {
        message: t`Immerse your players by removing the GDevelop watermark or the GDevelop logo when the game loads.`,
      },
    ],
  },
  {
    planId: 'gdevelop_gold',
    legacyPlanId: 'gdevelop_pro',
    name: 'GDevelop Gold',
    monthlyPriceInEuros: 9.99,
    smallDescription: t`Experimented creators, ambitious games.`,
    descriptionBullets: [
      {
        message: t`100 cloud projects with 500MB of resources per project and one-year version history.`,
      },
      {
        message: t`100 packagings per day for Android and for desktop.`,
      },
      {
        message: t`Unlimited leaderboards and unlimited player feedback responses.`,
      },
      {
        message: t`Immerse your players by removing the GDevelop watermark or the GDevelop logo when the game loads.`,
      },
    ],
  },
  {
    planId: 'gdevelop_startup',
    name: 'GDevelop Startup',
    monthlyPriceInEuros: 30,
    smallDescription: t`Small game studios and startups.`,
    descriptionBullets: [
      {
        message: t`500 cloud projects with 5GB of resources per project.`,
      },
      {
        message: t`Unlimited packagings per day for Android, web and desktop.`,
      },
      {
        message: t`Unlimited leaderboards and unlimited player feedback responses.`,
      },
      {
        message: t`Immerse your players by removing the GDevelop watermark or the GDevelop logo when the game loads.`,
      },
      {
        message: t`Add 1 guest user or unlimited startup team members to collaborate on every project.`,
      },
    ],
  },
  {
    planId: 'gdevelop_education',
    name: 'GDevelop Education',
    monthlyPriceInEuros: 2.99,
    yearlyPriceInEuros: 29.99,
    isPerUser: true,
    smallDescription: t`Schools and universities.`,
    descriptionBullets: [
      {
        message: t`Students anonymity.`,
      },
      {
        message: t`Organize students per classroom.`,
      },
      {
        message: t`You and your students receive a Gold subscription.`,
      },
    ],
  },
];

export const getFormerSubscriptionPlans = (): Array<PlanDetails> => [
  {
    planId: 'gdevelop_indie',
    name: 'GDevelop Indie (Legacy)',
    monthlyPriceInEuros: 2.0,
    smallDescription: t`Build more and faster.`,
    descriptionBullets: [
      {
        message: t`50 cloud projects with 250MB of resources per project and 3-month version history.`,
      },
      {
        message: t`10 packagings per day for Android and for desktop.`,
      },
      {
        message: t`Unlimited leaderboards and unlimited player feedback responses.`,
      },
    ],
  },
  {
    planId: 'gdevelop_pro',
    name: 'GDevelop Pro (Legacy)',
    monthlyPriceInEuros: 7.0,
    smallDescription: t`Experimented creators, ambitious games.`,
    descriptionBullets: [
      {
        message: t`100 cloud projects with 500MB of resources per project and one-year version history.`,
      },
      {
        message: t`70 packagings per day for Android and for desktop.`,
      },
      {
        message: t`Unlimited leaderboards and unlimited player feedback responses.`,
      },
      {
        message: t`Immerse your players by removing GDevelop logo when the game loads.`,
      },
    ],
  },
];

export const businessPlan: PlanDetails = {
  planId: null,
  monthlyPriceInEuros: null,
  name: 'GDevelop for businesses, game studios and professionals',
  smallDescription: t`Dedicated support, branding and solutions for engaging your players.`,
  descriptionBullets: [],
};

export const getUserUsages = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string
): Promise<Usages> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.get(`${GDevelopUsageApi.baseUrl}/usage`, {
        params: {
          userId,
        },
        headers: {
          Authorization: authorizationHeader,
        },
      })
    )
    .then(response => response.data);
};

export const getUserLimits = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string
): Promise<Limits> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.get(`${GDevelopUsageApi.baseUrl}/limits`, {
        params: {
          userId,
        },
        headers: {
          Authorization: authorizationHeader,
        },
      })
    )
    .then(response => response.data);
};

export const getUserSubscription = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string
): Promise<Subscription> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.get(`${GDevelopUsageApi.baseUrl}/subscription-v2`, {
        params: {
          userId,
        },
        headers: {
          Authorization: authorizationHeader,
        },
      })
    )
    .then(response => response.data);
};

export const changeUserSubscription = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  newSubscriptionDetails: { planId: string | null, stripeToken?: any }
): Promise<Subscription> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.post(
        `${GDevelopUsageApi.baseUrl}/subscription-v2`,
        newSubscriptionDetails,
        {
          params: {
            userId,
          },
          headers: {
            Authorization: authorizationHeader,
          },
        }
      )
    )
    .then(response => response.data);
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

export const getSignedUrl = (params: {|
  uploadType: UploadType,
  key: string,
  contentType: string,
|}): Promise<{
  signedUrl: string,
}> => {
  return axios
    .post(`${GDevelopUsageApi.baseUrl}/upload-options/signed-url`, params)
    .then(response => response.data);
};

export const getRedirectToSubscriptionPortalUrl = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string
): Promise<string> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.post(
        `${GDevelopUsageApi.baseUrl}/subscription-v2/action/redirect-to-portal`,
        {},
        {
          params: {
            userId,
          },
          headers: {
            Authorization: authorizationHeader,
          },
        }
      )
    )
    .then(response => response.data)
    .then(({ sessionPortalUrl }) => {
      if (!sessionPortalUrl || typeof sessionPortalUrl !== 'string')
        throw new Error('Could not find the session portal url.');

      return sessionPortalUrl;
    });
};

export const getRedirectToCheckoutUrl = ({
  planId,
  userId,
  userEmail,
  quantity,
}: {
  planId: string,
  userId: string,
  userEmail: string,
  quantity?: number,
}): string => {
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

export const redeemCode = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  code: string
): Promise<void> => {
  const authorizationHeader = await getAuthorizationHeader();

  await axios.post(
    `${GDevelopUsageApi.baseUrl}/redemption-code/action/redeem-code`,
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
