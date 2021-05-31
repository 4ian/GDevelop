// @flow
import * as React from 'react';
import { type Profile } from '../Utils/GDevelopServices/Authentification';
import {
  type Limits,
  type Usages,
  type Subscription,
} from '../Utils/GDevelopServices/Usage';

export type UserProfile = {|
  authenticated: boolean,
  profile: ?Profile,
  limits: ?Limits,
  usages: ?Usages,
  subscription: ?Subscription,
  onLogout: () => void,
  onLogin: () => void,
  onCreateAccount: () => void,
  onRefreshUserProfile: () => void,
  getAuthorizationHeader: () => Promise<string>,
|};

export const initialUserProfile = {
  authenticated: false,
  profile: null,
  subscription: null,
  usages: null,
  limits: null,
  onLogout: () => {},
  onLogin: () => {},
  onCreateAccount: () => {},
  onRefreshUserProfile: () => {},
  getAuthorizationHeader: (): Promise<string> =>
    Promise.reject(new Error('Unimplemented')),
};

const UserProfileContext: React$Context<UserProfile> = React.createContext<UserProfile>(
  initialUserProfile
);

export default UserProfileContext;
