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

export type Limits = {
  [string]: {
    limitReached: boolean,
    current: number,
    max: number,
  },
};

export const getSubscriptionPlans = () => ([
  {
    planId: 'gdevelop-indie',
  },
  {
    planId: 'gdevelop-pro',
  }
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
    .then(response => response.data);
};
