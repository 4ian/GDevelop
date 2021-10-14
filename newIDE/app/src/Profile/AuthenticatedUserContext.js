// @flow
import * as React from 'react';
import { type Profile } from '../Utils/GDevelopServices/Authentication';
import { User as FirebaseUser } from 'firebase/auth';
import {
  type Limits,
  type Usages,
  type Subscription,
} from '../Utils/GDevelopServices/Usage';

export type AuthenticatedUser = {|
  authenticated: boolean,
  firebaseUser: ?FirebaseUser,
  profile: ?Profile,
  limits: ?Limits,
  usages: ?Usages,
  subscription: ?Subscription,
  onLogout: () => void,
  onLogin: () => void,
  onEdit: () => void,
  onChangeEmail: () => void,
  onCreateAccount: () => void,
  onRefreshUserProfile: () => void,
  onRefreshFirebaseProfile: () => void,
  onSendEmailVerification: () => void,
  getAuthorizationHeader: () => Promise<string>,
|};

export const initialAuthenticatedUser = {
  authenticated: false,
  firebaseUser: null,
  profile: null,
  subscription: null,
  usages: null,
  limits: null,
  onLogout: () => {},
  onLogin: () => {},
  onEdit: () => {},
  onChangeEmail: () => {},
  onCreateAccount: () => {},
  onRefreshUserProfile: () => {},
  onRefreshFirebaseProfile: () => {},
  onSendEmailVerification: () => {},
  getAuthorizationHeader: () => Promise.reject(new Error('Unimplemented')),
};

const AuthenticatedUserContext = React.createContext<AuthenticatedUser>(
  initialAuthenticatedUser
);

export default AuthenticatedUserContext;
