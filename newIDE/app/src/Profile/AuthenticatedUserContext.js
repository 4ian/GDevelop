// @flow
import * as React from 'react';
import {
  type Profile,
  type LoginForm,
  type RegisterForm,
  type EditForm,
} from '../Utils/GDevelopServices/Authentication';
import { type PreferencesValues } from '../MainFrame/Preferences/PreferencesContext';
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
  type PrivateGameTemplate,
} from '../Utils/GDevelopServices/Asset';

export type AuthenticatedUser = {|
  authenticated: boolean,
  firebaseUser: ?FirebaseUser,
  profile: ?Profile,
  loginState: null | 'loggingIn' | 'done',
  creatingOrLoggingInAccount: boolean,
  badges: ?Array<Badge>,
  cloudProjects: ?Array<CloudProjectWithUserAccessInfo>,
  cloudProjectsFetchingErrorLabel: ?React.Node,
  receivedAssetPacks: ?Array<PrivateAssetPack>,
  receivedAssetShortHeaders: ?Array<AssetShortHeader>,
  receivedGameTemplates: ?Array<PrivateGameTemplate>,
  limits: ?Limits,
  usages: ?Usages,
  subscription: ?Subscription,
  onLogin: (form: LoginForm) => Promise<void>,
  onLogout: () => Promise<void>,
  onCreateAccount: (
    form: RegisterForm,
    preferences: PreferencesValues
  ) => Promise<void>,
  onEditProfile: (
    form: EditForm,
    preferences: PreferencesValues
  ) => Promise<void>,
  onOpenLoginDialog: () => void,
  onOpenEditProfileDialog: () => void,
  onOpenChangeEmailDialog: () => void,
  onOpenCreateAccountDialog: () => void,
  onBadgesChanged: () => Promise<void>,
  onCloudProjectsChanged: () => Promise<void>,
  onRefreshUserProfile: () => Promise<void>,
  onRefreshFirebaseProfile: () => Promise<void>,
  onSubscriptionUpdated: () => Promise<void>,
  onPurchaseSuccessful: () => Promise<void>,
  onSendEmailVerification: () => Promise<void>,
  onOpenEmailVerificationDialog: ({|
    sendEmailAutomatically: boolean,
    showSendEmailButton: boolean,
  |}) => void,
  onAcceptGameStatsEmail: () => Promise<void>,
  getAuthorizationHeader: () => Promise<string>,
|};

export const initialAuthenticatedUser = {
  authenticated: false,
  firebaseUser: null,
  profile: null,
  loginState: null,
  creatingOrLoggingInAccount: false,
  badges: null,
  cloudProjects: null,
  cloudProjectsFetchingErrorLabel: null,
  receivedAssetPacks: null,
  receivedAssetShortHeaders: null,
  receivedGameTemplates: null,
  subscription: null,
  usages: null,
  limits: null,
  onLogin: async () => {},
  onLogout: async () => {},
  onCreateAccount: async () => {},
  onEditProfile: async () => {},
  onOpenLoginDialog: () => {},
  onOpenEditProfileDialog: () => {},
  onOpenChangeEmailDialog: () => {},
  onOpenCreateAccountDialog: () => {},
  onBadgesChanged: async () => {},
  onCloudProjectsChanged: async () => {},
  onRefreshUserProfile: async () => {},
  onRefreshFirebaseProfile: async () => {},
  onSubscriptionUpdated: async () => {},
  onPurchaseSuccessful: async () => {},
  onSendEmailVerification: async () => {},
  onOpenEmailVerificationDialog: () => {},
  onAcceptGameStatsEmail: async () => {},
  getAuthorizationHeader: () => Promise.reject(new Error('Unimplemented')),
};

export const authenticatedUserLoggedOutAttributes = {
  authenticated: false,
  firebaseUser: null,
  profile: null,
  // A logged out user is not the same a user being loaded (which can be the case at startup).
  // Use this loginState to make sure this is understood by the app as a user logged out, and not loading.
  loginState: 'done',
  badges: null,
  cloudProjects: [], // Initialize to empty array to indicate that the loading is done.
  cloudProjectsFetchingErrorLabel: null,
  receivedAssetPacks: [], // Initialize to empty array to indicate that the loading is done.
  receivedAssetShortHeaders: [], // Initialize to empty array to indicate that the loading is done.
  receivedGameTemplates: [], // Initialize to empty array to indicate that the loading is done.
  subscription: null,
  usages: null,
  limits: null,
};

const AuthenticatedUserContext = React.createContext<AuthenticatedUser>(
  initialAuthenticatedUser
);

export default AuthenticatedUserContext;
