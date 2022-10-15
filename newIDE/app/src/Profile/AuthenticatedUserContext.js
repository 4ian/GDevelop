// @flow
import * as React from 'react';
import { type Profile } from '../Utils/GDevelopServices/Authentication';
import { type CloudProjectWithUserAccessInfo } from '../Utils/GDevelopServices/Project';
import { User as FirebaseUser } from 'firebase/auth';
import { type Badge } from '../Utils/GDevelopServices/Badge';
import {
  type Limits,
  type Usages,
  type Subscription,
} from '../Utils/GDevelopServices/Usage';
import {
  type AssetShortHeader,
  type PrivateAssetPack,
} from '../Utils/GDevelopServices/Asset';

export type AuthenticatedUser = {|
  authenticated: boolean,
  firebaseUser: ?FirebaseUser,
  profile: ?Profile,
  loginState: null | 'loggingIn' | 'done',
  badges: ?Array<Badge>,
  cloudProjects: ?Array<CloudProjectWithUserAccessInfo>,
  receivedAssetPacks: ?Array<PrivateAssetPack>,
  receivedAssetShortHeaders: ?Array<AssetShortHeader>,
  limits: ?Limits,
  usages: ?Usages,
  subscription: ?Subscription,
  onLogout: () => void,
  onLogin: () => void,
  onEdit: () => void,
  onChangeEmail: () => void,
  onCreateAccount: () => void,
  onBadgesChanged: () => Promise<void>,
  onCloudProjectsChanged: () => Promise<void>,
  onRefreshUserProfile: () => Promise<void>,
  onRefreshFirebaseProfile: () => Promise<void>,
  onSendEmailVerification: () => Promise<void>,
  onAcceptGameStatsEmail: () => Promise<void>,
  getAuthorizationHeader: () => Promise<string>,
|};

export const initialAuthenticatedUser = {
  authenticated: false,
  firebaseUser: null,
  profile: null,
  loginState: null,
  badges: null,
  cloudProjects: null,
  receivedAssetPacks: null,
  receivedAssetShortHeaders: null,
  subscription: null,
  usages: null,
  limits: null,
  onLogout: () => {},
  onLogin: () => {},
  onEdit: () => {},
  onChangeEmail: () => {},
  onCreateAccount: () => {},
  onBadgesChanged: async () => {},
  onCloudProjectsChanged: async () => {},
  onRefreshUserProfile: async () => {},
  onRefreshFirebaseProfile: async () => {},
  onSendEmailVerification: async () => {},
  onAcceptGameStatsEmail: async () => {},
  getAuthorizationHeader: () => Promise.reject(new Error('Unimplemented')),
};

const AuthenticatedUserContext = React.createContext<AuthenticatedUser>(
  initialAuthenticatedUser
);

export default AuthenticatedUserContext;
