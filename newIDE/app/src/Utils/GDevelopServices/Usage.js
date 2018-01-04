// @flow
import axios from 'axios';
import type Authentification from './Authentification';
import { GDevelopUsageApi } from './ApiConfigs';

export type Usage = {
  id: string,
  userId: string,
  type: string,
  createdAt: number,
};
export type Usages = Array<Usage>;

export type Subscription = {
  userId: string,
  planId: string,
  createdAt: number,
  updatedAt: number,
};

export type Limit = {
  limitReached: boolean,
  current: number,
  max: number,
};

export type Limits = {
  [string]: Limit,
};

export const getSubscriptionPlans = () => ([
  {
    planId: 'gdevelop-pro',
    name: 'GDevelop Pro',
    monthlyPriceInEuros: 7,
    smallDescription: 'Ideal for advanced game makers',
    description: 'Allow to package your game for Android up to 70 times a day.',
    moreDescription1: 'You\'ll also have access to online packaging for Windows, macOS and Linux when it\'s ready.',
  },
  {
    planId: 'gdevelop-indie',
    name: 'GDevelop Indie',
    monthlyPriceInEuros: 2,
    smallDescription: 'Ideal for beginners',
    description: 'Allow to package your game for Android up to 10 times a day.',
    moreDescription1: 'You\'ll also have access to online packaging for Windows, macOS and Linux when it\'s ready.',
  },
  {
    planId: '',
    name: 'No subscription',
    monthlyPriceInEuros: 0,
    smallDescription: '',
    description: 'You can use GDevelop for free, but online packaging for Android is limited to twice a day.'
  },
])

export const getUserUsages = (
  authentification: Authentification,
  userId: string
): Promise<Usages> => {
  return axios
    .get(`${GDevelopUsageApi.baseUrl}/usage`, {
      params: {
        userId,
      },
      headers: {
        Authorization: authentification.getAuthorizationHeader(),
      },
    })
    .then(response => response.data);
};

export const getUserSubscription = (
  authentification: Authentification,
  userId: string
): Promise<Subscription> => {
  return axios
    .get(`${GDevelopUsageApi.baseUrl}/subscription`, {
      params: {
        userId,
      },
      headers: {
        Authorization: authentification.getAuthorizationHeader(),
      },
    })
    .then(response => response.data);
};

export const getUserLimits = (
  authentification: Authentification,
  userId: string
): Promise<Limits> => {
  return axios
    .get(`${GDevelopUsageApi.baseUrl}/limits`, {
      params: {
        userId,
      },
      headers: {
        Authorization: authentification.getAuthorizationHeader(),
      },
    })
    .then(response => response.data.limits);
};
