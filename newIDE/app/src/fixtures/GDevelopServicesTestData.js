// @flow
import {
  type Usages,
  type Subscription,
  type Limits,
} from '../Utils/GDevelopServices/Usage';
import { type Profile } from '../Utils/GDevelopServices/Authentification';
import { type UserProfile } from '../Profile/UserProfileContext';

export const profileForIndieUser: Profile = {
  uid: 'indie-user',
  providerId: 'fake-provider.com',
  email: 'indie-user@example.com',
  emailVerified: true,
};

export const usagesForIndieUser: Usages = [
  {
    id: '1',
    userId: 'indie-user',
    type: 'cordova-build',
    createdAt: 1515084391000,
  },
  {
    id: '56',
    userId: 'indie-user',
    type: 'cordova-build',
    createdAt: 1515084351000,
  },
  {
    id: '75',
    userId: 'indie-user',
    type: 'cordova-build',
    createdAt: 1515084311000,
  },
];

export const subscriptionForIndieUser: Subscription = {
  planId: 'gdevelop_indie',
  createdAt: 1515084011000,
  updatedAt: 1515084011000,
  userId: 'indie-user',
};

export const noSubscription: Subscription = {
  planId: null,
  createdAt: 1515084011000,
  updatedAt: 1515084011000,
  userId: 'no-subscription-user',
};

export const limitsForIndieUser: Limits = {
  'cordova-build': {
    current: 2,
    max: 10,
    limitReached: false,
  },
};

export const limitsReached: Limits = {
  'cordova-build': {
    current: 10,
    max: 10,
    limitReached: true,
  },
};

export const fakeIndieUserProfile: UserProfile = {
  authenticated: true,
  profile: profileForIndieUser,
  subscription: subscriptionForIndieUser,
  usages: usagesForIndieUser,
  limits: limitsForIndieUser,
  onLogout: () => {},
  onLogin: () => {},
  onRefreshUserProfile: () => {},
};

export const fakeNoSubscriptionUserProfile: UserProfile = {
  authenticated: true,
  profile: profileForIndieUser,
  subscription: noSubscription,
  usages: usagesForIndieUser,
  limits: limitsForIndieUser,
  onLogout: () => {},
  onLogin: () => {},
  onRefreshUserProfile: () => {},
};

export const fakeAuthenticatedButLoadingUserProfile: UserProfile = {
  authenticated: true,
  profile: null,
  subscription: null,
  usages: null,
  limits: null,
  onLogout: () => {},
  onLogin: () => {},
  onRefreshUserProfile: () => {},
};

export const fakeNotAuthenticatedUserProfile: UserProfile = {
  authenticated: false,
  profile: null,
  subscription: null,
  usages: null,
  limits: null,
  onLogout: () => {},
  onLogin: () => {},
  onRefreshUserProfile: () => {},
};
