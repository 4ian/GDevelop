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
    isLocalAppOnly?: boolean,
    message: MessageDescriptor,
  |}>,
  extraDescription?: MessageDescriptor,
};

export const getSubscriptionPlans = (): Array<PlanDetails> => [
  {
    planId: 'gdevelop_pro',
    name: 'GDevelop Pro',
    monthlyPriceInEuros: 7,
    smallDescription: t`Ideal for advanced game makers`,
    descriptionBullets: [
      {
        message: t`Package your game for Android up to 70 times a day (every 24 hours).`,
      },
      {
        message: t`One-click packaging for Windows, macOS and Linux up to 70 times a day (every 24 hours).`,
      },
      {
        message: t`Immerse your players by removing GDevelop logo when the game loads.`,
      },
    ],
    extraDescription: t`You'll also have access to online packaging for iOS or other services when they are released.`,
  },
  {
    planId: 'gdevelop_indie',
    name: 'GDevelop Indie',
    monthlyPriceInEuros: 2,
    smallDescription: t`Ideal for beginners`,
    descriptionBullets: [
      {
        message: t`Package your game for Android up to 10 times a day (every 24 hours).`,
      },
      {
        message: t`One-click packaging for Windows, macOS and Linux up to 10 times a day (every 24 hours).`,
      },
      {
        message: t`Immerse your players by removing GDevelop logo when the game loads`,
      },
    ],
    extraDescription: t`You'll also have access to online packaging for iOS or other services when they are released.`,
  },
  {
    planId: null,
    name: 'No subscription',
    monthlyPriceInEuros: 0,
    descriptionBullets: [
      {
        message: t`You can use GDevelop for free! Online packaging for Android, Windows, macOS and Linux is limited to twice a day (every 24 hours) to avoid overloading the services.`,
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
