// @flow
import * as React from 'react';
import {
  type Profile,
  type LoginForm,
  type RegisterForm,
  type PatchUserPayload,
  type ForgotPasswordForm,
  type AuthError,
  type IdentityProvider,
} from '../Utils/GDevelopServices/Authentication';
import { type PreferencesValues } from '../MainFrame/Preferences/PreferencesContext';
import { type CloudProjectWithUserAccessInfo } from '../Utils/GDevelopServices/Project';
import { User as FirebaseUser } from 'firebase/auth';
import { type Badge, type Achievement } from '../Utils/GDevelopServices/Badge';
import { type Recommendation } from '../Utils/GDevelopServices/User';
import { type Notification } from '../Utils/GDevelopServices/Notification';
import {
  type Limits,
  type Usages,
  type Subscription,
  type UserEarningsBalance,
} from '../Utils/GDevelopServices/Usage';
import {
  type AssetShortHeader,
  type PrivateAssetPack,
  type PrivateGameTemplate,
} from '../Utils/GDevelopServices/Asset';
import { type Purchase } from '../Utils/GDevelopServices/Shop';

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
  gameTemplatePurchases: ?Array<Purchase>,
  assetPackPurchases: ?Array<Purchase>,
  recommendations: ?Array<Recommendation>,
  notifications: ?Array<Notification>,
  userEarningsBalance: ?UserEarningsBalance,
  limits: ?Limits,
  authenticationError: ?AuthError,
  usages: ?Usages,
  subscription: ?Subscription,
  onLogin: (form: LoginForm) => Promise<void>,
  onLoginWithProvider: (provider: IdentityProvider) => Promise<void>,
  onCancelLoginOrSignUp: () => void,
  onLogout: () => Promise<void>,
  onCreateAccount: (
    form: RegisterForm,
    preferences: PreferencesValues
  ) => Promise<void>,
  onEditProfile: (
    payload: PatchUserPayload,
    preferences: PreferencesValues
  ) => Promise<void>,
  onResetPassword: ForgotPasswordForm => Promise<void>,
  onOpenLoginDialog: () => void,
  onOpenEditProfileDialog: () => void,
  onOpenChangeEmailDialog: () => void,
  onOpenCreateAccountDialog: () => void,
  onBadgesChanged: () => Promise<void>,
  onCloudProjectsChanged: () => Promise<void>,
  onRefreshUserProfile: () => Promise<void>,
  onRefreshFirebaseProfile: () => Promise<void>,
  onRefreshSubscription: () => Promise<void>,
  onRefreshLimits: () => Promise<void>,
  onRefreshGameTemplatePurchases: () => Promise<void>,
  onRefreshAssetPackPurchases: () => Promise<void>,
  onRefreshEarningsBalance: () => Promise<void>,
  onRefreshNotifications: () => Promise<void>,
  onPurchaseSuccessful: () => Promise<void>,
  onSendEmailVerification: () => Promise<void>,
  onOpenEmailVerificationDialog: ({|
    sendEmailAutomatically: boolean,
    showSendEmailButton: boolean,
  |}) => void,
  onAcceptGameStatsEmail: (value: boolean) => Promise<void>,
  getAuthorizationHeader: () => Promise<string>,
  achievements: ?Array<Achievement>,
|};

export const authenticatedUserPropertiesLoadingState = {
  cloudProjects: null,
  receivedAssetPacks: null,
  receivedAssetShortHeaders: null,
  receivedGameTemplates: null,
  badges: null,
  notifications: null,
};

export const initialAuthenticatedUser = {
  authenticated: false,
  firebaseUser: null,
  profile: null,
  loginState: null,
  creatingOrLoggingInAccount: false,
  cloudProjectsFetchingErrorLabel: null,
  gameTemplatePurchases: null,
  assetPackPurchases: null,
  recommendations: null,
  subscription: null,
  usages: null,
  userEarningsBalance: null,
  limits: null,
  ...authenticatedUserPropertiesLoadingState,
  authenticationError: null,
  onLogin: async () => {},
  onLoginWithProvider: async () => {},
  onCancelLoginOrSignUp: () => {},
  onLogout: async () => {},
  onCreateAccount: async () => {},
  onEditProfile: async () => {},
  onResetPassword: async () => {},
  onOpenLoginDialog: () => {},
  onOpenEditProfileDialog: () => {},
  onOpenChangeEmailDialog: () => {},
  onOpenCreateAccountDialog: () => {},
  onBadgesChanged: async () => {},
  onCloudProjectsChanged: async () => {},
  onRefreshUserProfile: async () => {},
  onRefreshFirebaseProfile: async () => {},
  onRefreshSubscription: async () => {},
  onRefreshLimits: async () => {},
  onRefreshGameTemplatePurchases: async () => {},
  onRefreshAssetPackPurchases: async () => {},
  onRefreshEarningsBalance: async () => {},
  onRefreshNotifications: async () => {},
  onPurchaseSuccessful: async () => {},
  onSendEmailVerification: async () => {},
  onOpenEmailVerificationDialog: () => {},
  onAcceptGameStatsEmail: async () => {},
  getAuthorizationHeader: () => Promise.reject(new Error('Unimplemented')),
  achievements: null,
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
  userEarningsBalance: null,
  usages: null,
  limits: null,
};

const AuthenticatedUserContext = React.createContext<AuthenticatedUser>(
  initialAuthenticatedUser
);

export default AuthenticatedUserContext;
