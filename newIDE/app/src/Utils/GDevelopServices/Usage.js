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
  },
  /**
   * leaderboards is marked as optional to prevent bugs at the moment
   * the limit is enforced (endpoint deployed after the new version is released)
   */
  leaderboards?: {
    maximumCountPerGame: number,
    canMaximumCountPerGameBeIncreased: boolean,
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
  name: string,
  monthlyPriceInEuros: number,
  smallDescription?: MessageDescriptor,
  descriptionBullets: Array<{|
    message: MessageDescriptor,
  |}>,
};

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
    ],
  },
  {
    planId: 'gdevelop_gold',
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
        message: t`Immerse your players by removing GDevelop logo when the game loads.`,
      },
    ],
  },
];

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

export const canSeamlesslyChangeSubscription = (subscription: Subscription) => {
  // If the subscription is on Stripe, it can be upgraded/downgraded seamlessly.
  // Otherwise (Paypal), it needs to be cancelled first.
  return !!subscription.stripeSubscriptionId;
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

export const getRedirectToCheckoutUrl = (
  planId: string,
  userId: string,
  userEmail: string
): string => {
  return `${
    GDevelopUsageApi.baseUrl
  }/subscription-v2/action/redirect-to-checkout?planId=${encodeURIComponent(
    planId
  )}&userId=${encodeURIComponent(userId)}&customerEmail=${encodeURIComponent(
    userEmail
  )}`;
};
