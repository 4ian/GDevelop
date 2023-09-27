// @flow

import * as React from 'react';
import {
  getUserUsages,
  getUserSubscription,
  getUserLimits,
} from '../Utils/GDevelopServices/Usage';
import { getUserBadges } from '../Utils/GDevelopServices/User';
import Authentication, {
  type LoginForm,
  type RegisterForm,
  type EditForm,
  type ChangeEmailForm,
  type AuthError,
  type ForgotPasswordForm,
  type AdditionalUserInfoForm,
} from '../Utils/GDevelopServices/Authentication';
import { User as FirebaseUser } from 'firebase/auth';
import LoginDialog from './LoginDialog';
import {
  onUserLogoutForAnalytics,
  sendSignupDone,
  identifyUserForAnalytics,
  aliasUserForAnalyticsAfterSignUp,
} from '../Utils/Analytics/EventSender';
import AuthenticatedUserContext, {
  initialAuthenticatedUser,
  type AuthenticatedUser,
  authenticatedUserLoggedOutAttributes,
} from './AuthenticatedUserContext';
import CreateAccountDialog from './CreateAccountDialog';
import EditProfileDialog from './EditProfileDialog';
import ChangeEmailDialog from './ChangeEmailDialog';
import EmailVerificationDialog from './EmailVerificationDialog';
import PreferencesContext, {
  type PreferencesValues,
} from '../MainFrame/Preferences/PreferencesContext';
import {
  listUserCloudProjects,
  type CloudProjectWithUserAccessInfo,
} from '../Utils/GDevelopServices/Project';
import { clearCloudProjectCookies } from '../ProjectsStorage/CloudStorageProvider/CloudProjectCookies';
import {
  listReceivedAssetShortHeaders,
  listReceivedAssetPacks,
  listReceivedGameTemplates,
} from '../Utils/GDevelopServices/Asset';
import AdditionalUserInfoDialog, {
  shouldAskForAdditionalUserInfo,
} from './AdditionalUserInfoDialog';
import { Trans } from '@lingui/macro';
import Snackbar from '@material-ui/core/Snackbar';
import RequestDeduplicator from '../Utils/RequestDeduplicator';
import { burstCloudProjectAutoSaveCache } from '../ProjectsStorage/CloudStorageProvider/CloudProjectOpener';

type Props = {|
  authentication: Authentication,
  children: React.Node,
|};

type State = {|
  authenticatedUser: AuthenticatedUser,
  loginDialogOpen: boolean,
  createAccountDialogOpen: boolean,
  loginInProgress: boolean,
  createAccountInProgress: boolean,
  editProfileDialogOpen: boolean,
  editInProgress: boolean,
  deleteInProgress: boolean,
  additionalUserInfoDialogOpen: boolean,
  authError: ?AuthError,
  resetPasswordDialogOpen: boolean,
  emailVerificationDialogOpen: boolean,
  emailVerificationDialogProps: {|
    sendEmailAutomatically: boolean,
    showSendEmailButton: boolean,
  |},
  forgotPasswordInProgress: boolean,
  changeEmailDialogOpen: boolean,
  changeEmailInProgress: boolean,
  userSnackbarMessage: ?React.Node,
|};

const cleanUserTracesOnDevice = async () => {
  await Promise.all([
    clearCloudProjectCookies(),
    burstCloudProjectAutoSaveCache(),
  ]);
};

export default class AuthenticatedUserProvider extends React.Component<
  Props,
  State
> {
  state = {
    authenticatedUser: initialAuthenticatedUser,
    loginDialogOpen: false,
    createAccountDialogOpen: false,
    loginInProgress: false,
    createAccountInProgress: false,
    editProfileDialogOpen: false,
    editInProgress: false,
    deleteInProgress: false,
    additionalUserInfoDialogOpen: false,
    authError: null,
    resetPasswordDialogOpen: false,
    emailVerificationDialogOpen: false,
    emailVerificationDialogProps: {
      sendEmailAutomatically: false,
      showSendEmailButton: false,
    },
    forgotPasswordInProgress: false,
    changeEmailDialogOpen: false,
    changeEmailInProgress: false,
    userSnackbarMessage: null,
  };
  _automaticallyUpdateUserProfile = true;
  _hasNotifiedUserAboutAdditionalInfo = false;
  _hasNotifiedUserAboutEmailVerification = false;

  // Cloud projects are requested in 2 different places at app opening.
  // - First one comes from user authenticating and automatically fetching
  //   their cloud projects;
  // - Second one comes from the homepage fetching the cloud projects regularly.
  _cloudProjectListingDeduplicator = new RequestDeduplicator<
    Array<CloudProjectWithUserAccessInfo>
  >(listUserCloudProjects);

  async componentDidMount() {
    this._initializeAuthenticatedUser();

    // Those callbacks are added a bit too late (after the authentication `hasAuthChanged` has already been triggered)
    // So this is not called at the startup, but only when the user logs in or log out.

    // Listen to when the user logs out.
    // 1. Send this information to analytics, to reset the user being identified.
    // 2. Fetch the user profile, which will reset the user to an unauthenticated state.
    this.props.authentication.addUserLogoutListener(onUserLogoutForAnalytics);
    this.props.authentication.addUserLogoutListener(
      this._fetchUserProfileWithoutThrowingErrors
    );

    // When the authenticated user changes, we need to react accordingly
    // This can happen:
    // - at the login, signup, profile edit. These methods are taking care of
    //   fetching the user profile by themselves, so they will disable the automatic
    //   refresh.
    // - at any other moment (Firebase user was updated), in which case it's probably
    //   not a problem to fetch again the user profile.
    this.props.authentication.addUserUpdateListener(() => {
      if (this._automaticallyUpdateUserProfile) {
        console.info(
          'Fetching user profile as the authenticated user changed...'
        );
        this._fetchUserProfileWithoutThrowingErrors();
      } else {
        console.info(
          'The authenticated user changed, but not fetching the user profile again (deactivated).'
        );
      }
    });

    // At startup, if the provider has mounted too late and the user is already logged in with Firebase,
    // we fetch the user profile.
    if (this.props.authentication.getFirebaseUserSync()) {
      // The user is logged already: fetch its user profile (because the "user update"
      // won't trigger, as registered too late).
      console.info(
        'Fetching user profile as authenticated user found at startup...'
      );
      this._automaticallyUpdateUserProfile = false;
      await this._fetchUserProfileWithoutThrowingErrors();
      this._automaticallyUpdateUserProfile = true;
    } else {
      console.info('No authenticated user found at startup.');
      this._markAuthenticatedUserAsLoggedOut();
      // If the user is not logged, we still need to identify the user for analytics.
      // But don't do anything else, the user is already logged or being logged.
      identifyUserForAnalytics(this.state.authenticatedUser);
    }
  }

  // This should be called only on the first mount of the provider.
  _initializeAuthenticatedUser() {
    this.setState(({ authenticatedUser }) => ({
      authenticatedUser: {
        ...initialAuthenticatedUser,
        onLogout: this._doLogout,
        onBadgesChanged: this._fetchUserBadges,
        onCloudProjectsChanged: this._fetchUserCloudProjects,
        onLogin: () => this.openLoginDialog(true),
        onEdit: () => this.openEditProfileDialog(true),
        onChangeEmail: () => this.openChangeEmailDialog(true),
        onCreateAccount: () => this.openCreateAccountDialog(true),
        onRefreshUserProfile: this._fetchUserProfile,
        onRefreshFirebaseProfile: async () => {
          await this._reloadFirebaseProfile();
        },
        onSubscriptionUpdated: this._fetchUserSubscriptionLimitsAndUsages,
        onPurchaseSuccessful: this._fetchUserPurchases,
        onSendEmailVerification: this._doSendEmailVerification,
        onOpenEmailVerificationDialog: ({
          sendEmailAutomatically,
          showSendEmailButton,
        }: {|
          sendEmailAutomatically: boolean,
          showSendEmailButton: boolean,
        |}) =>
          this.openEmailVerificationDialog({
            open: true,
            sendEmailAutomatically,
            showSendEmailButton,
          }),
        onAcceptGameStatsEmail: this._doAcceptGameStatsEmail,
        getAuthorizationHeader: () =>
          this.props.authentication.getAuthorizationHeader(),
      },
    }));
    this._hasNotifiedUserAboutAdditionalInfo = false;
    this._hasNotifiedUserAboutEmailVerification = false;
  }

  // This should be called every time the user is detected as logged out.
  // - At startup, if the user is not logged in.
  // - When the user logs out.
  // - When the user deletes their account.
  _markAuthenticatedUserAsLoggedOut() {
    this.setState(({ authenticatedUser }) => ({
      authenticatedUser: {
        ...authenticatedUser,
        ...authenticatedUserLoggedOutAttributes,
      },
    }));
    this._hasNotifiedUserAboutAdditionalInfo = false;
    this._hasNotifiedUserAboutEmailVerification = false;
  }

  _reloadFirebaseProfile = async (): Promise<?FirebaseUser> => {
    const { authentication } = this.props;

    try {
      const firebaseUser = await authentication.getFirebaseUser();
      if (!firebaseUser) {
        this.setState(({ authenticatedUser }) => ({
          authenticatedUser: {
            ...authenticatedUser,
            authenticated: false,
            profile: null,
            usages: null,
            limits: null,
            subscription: null,
          },
        }));
        return null;
      }

      this.setState(({ authenticatedUser }) => ({
        authenticatedUser: {
          ...authenticatedUser,
          authenticated: true,
          firebaseUser,
        },
      }));
      return firebaseUser;
    } catch (error) {
      console.error('Unable to fetch the authenticated Firebase user:', error);
      throw error;
    }
  };

  _fetchUserProfileWithoutThrowingErrors = async () => {
    try {
      await this._fetchUserProfile();
    } catch (error) {
      console.error(
        'Error while fetching the user profile - but ignoring it.',
        error
      );
    }
  };

  _fetchUserProfile = async () => {
    const { authentication } = this.props;

    this.setState(({ authenticatedUser }) => ({
      authenticatedUser: {
        ...authenticatedUser,
        loginState: 'loggingIn',
        cloudProjectsFetchingErrorLabel: null,
      },
    }));

    // First ensure the Firebase authenticated user is up to date
    // (and let the error propagate if any).
    let firebaseUser;
    try {
      firebaseUser = await this._reloadFirebaseProfile();
      if (!firebaseUser) {
        console.info('User is not authenticated.');
        this._markAuthenticatedUserAsLoggedOut();
        return;
      }
    } catch (error) {
      console.error('Unable to fetch the authenticated Firebase user:', error);
      this._markAuthenticatedUserAsLoggedOut();
      throw error;
    }

    // Fetching user profile related information, but independently from
    // the user profile itself, to not block in case one of these calls
    // fails.
    getUserUsages(authentication.getAuthorizationHeader, firebaseUser.uid).then(
      usages =>
        this.setState(({ authenticatedUser }) => ({
          authenticatedUser: {
            ...authenticatedUser,
            usages,
          },
        })),
      error => {
        console.error('Error while loading user usages:', error);
      }
    );
    getUserSubscription(
      authentication.getAuthorizationHeader,
      firebaseUser.uid
    ).then(
      subscription =>
        this.setState(({ authenticatedUser }) => ({
          authenticatedUser: {
            ...authenticatedUser,
            subscription,
          },
        })),
      error => {
        console.error('Error while loading user subscriptions:', error);
      }
    );
    getUserLimits(authentication.getAuthorizationHeader, firebaseUser.uid).then(
      limits =>
        this.setState(({ authenticatedUser }) => ({
          authenticatedUser: {
            ...authenticatedUser,
            limits,
          },
        })),
      error => {
        console.error('Error while loading user limits:', error);
      }
    );
    this._cloudProjectListingDeduplicator
      .launchRequestOrGetOngoingPromise([
        authentication.getAuthorizationHeader,
        firebaseUser.uid,
      ])
      .then(
        cloudProjects =>
          this.setState(({ authenticatedUser }) => ({
            authenticatedUser: {
              ...authenticatedUser,
              cloudProjects,
            },
          })),
        error => {
          console.error('Error while loading user cloud projects:', error);
          this.setState(({ authenticatedUser }) => ({
            authenticatedUser: {
              ...authenticatedUser,
              cloudProjectsFetchingErrorLabel: (
                <Trans>
                  We couldn't load your cloud projects. Verify your internet
                  connection or try again later.
                </Trans>
              ),
            },
          }));
        }
      );
    listReceivedAssetPacks(authentication.getAuthorizationHeader, {
      userId: firebaseUser.uid,
    }).then(
      receivedAssetPacks =>
        this.setState(({ authenticatedUser }) => ({
          authenticatedUser: {
            ...authenticatedUser,
            receivedAssetPacks,
          },
        })),
      error => {
        console.error('Error while loading received asset packs:', error);
      }
    );
    listReceivedAssetShortHeaders(authentication.getAuthorizationHeader, {
      userId: firebaseUser.uid,
    }).then(
      receivedAssetShortHeaders =>
        this.setState(({ authenticatedUser }) => ({
          authenticatedUser: {
            ...authenticatedUser,
            receivedAssetShortHeaders,
          },
        })),
      error => {
        console.error(
          'Error while loading received asset short headers:',
          error
        );
      }
    );
    listReceivedGameTemplates(authentication.getAuthorizationHeader, {
      userId: firebaseUser.uid,
    }).then(
      receivedGameTemplates =>
        this.setState(({ authenticatedUser }) => ({
          authenticatedUser: {
            ...authenticatedUser,
            receivedGameTemplates,
          },
        })),
      error => {
        console.error('Error while loading received game templates:', error);
      }
    );
    this._fetchUserBadges();

    // Load and wait for the user profile to be fetched.
    // (and let the error propagate if any).
    const userProfile = await authentication.getUserProfile(
      authentication.getAuthorizationHeader
    );

    if (!userProfile.isCreator) {
      // If the user is not a creator, then update the profile to say they now are.
      try {
        await authentication.editUserProfile(
          authentication.getAuthorizationHeader,
          { isCreator: true }
        );
      } catch (error) {
        // Catch the error so that the user profile is still fetched.
        console.error('Error while updating the user profile:', error);
      }
    }

    this.setState(
      ({ authenticatedUser }) => ({
        authenticatedUser: {
          ...authenticatedUser,
          profile: userProfile,
          loginState: 'done',
        },
      }),
      () => {
        // We call this function every time the user is fetched, as it will
        // automatically prevent the event to be sent if the user attributes haven't changed.
        identifyUserForAnalytics(this.state.authenticatedUser);
        this._notifyUserAboutEmailVerificationAndAdditionalInfo();
      }
    );
  };

  _fetchUserSubscriptionLimitsAndUsages = async () => {
    const { authentication } = this.props;
    const firebaseUser = this.state.authenticatedUser.firebaseUser;
    if (!firebaseUser) return;

    try {
      const usages = await getUserUsages(
        authentication.getAuthorizationHeader,
        firebaseUser.uid
      );
      this.setState(({ authenticatedUser }) => ({
        authenticatedUser: {
          ...authenticatedUser,
          usages,
        },
      }));
    } catch (error) {
      console.error('Error while loading user usages:', error);
    }

    try {
      const subscription = await getUserSubscription(
        authentication.getAuthorizationHeader,
        firebaseUser.uid
      );
      this.setState(({ authenticatedUser }) => ({
        authenticatedUser: {
          ...authenticatedUser,
          subscription,
        },
      }));
    } catch (error) {
      console.error('Error while loading user subscriptions:', error);
    }

    try {
      const limits = await getUserLimits(
        authentication.getAuthorizationHeader,
        firebaseUser.uid
      );
      this.setState(({ authenticatedUser }) => ({
        authenticatedUser: {
          ...authenticatedUser,
          limits,
        },
      }));
    } catch (error) {
      console.error('Error while loading user limits:', error);
    }
  };

  _fetchUserAssetPacks = async () => {
    const { authentication } = this.props;
    const firebaseUser = this.state.authenticatedUser.firebaseUser;
    if (!firebaseUser) return;

    try {
      const receivedAssetPacks = await listReceivedAssetPacks(
        authentication.getAuthorizationHeader,
        {
          userId: firebaseUser.uid,
        }
      );

      this.setState(({ authenticatedUser }) => ({
        authenticatedUser: {
          ...authenticatedUser,
          receivedAssetPacks,
        },
      }));
    } catch (error) {
      console.error('Error while loading received asset packs:', error);
    }
  };

  _fetchUserAssetShortHeaders = async () => {
    const { authentication } = this.props;
    const firebaseUser = this.state.authenticatedUser.firebaseUser;
    if (!firebaseUser) return;

    try {
      const receivedAssetShortHeaders = await listReceivedAssetShortHeaders(
        authentication.getAuthorizationHeader,
        {
          userId: firebaseUser.uid,
        }
      );

      this.setState(({ authenticatedUser }) => ({
        authenticatedUser: {
          ...authenticatedUser,
          receivedAssetShortHeaders,
        },
      }));
    } catch (error) {
      console.error('Error while loading received asset short headers:', error);
    }
  };

  _fetchUserGameTemplates = async () => {
    const { authentication } = this.props;
    const firebaseUser = this.state.authenticatedUser.firebaseUser;
    if (!firebaseUser) return;

    try {
      const receivedGameTemplates = await listReceivedGameTemplates(
        authentication.getAuthorizationHeader,
        {
          userId: firebaseUser.uid,
        }
      );

      this.setState(({ authenticatedUser }) => ({
        authenticatedUser: {
          ...authenticatedUser,
          receivedGameTemplates,
        },
      }));
    } catch (error) {
      console.error('Error while loading received game templates:', error);
    }
  };

  _fetchUserPurchases = async () => {
    await Promise.all([
      this._fetchUserAssetPacks(),
      this._fetchUserAssetShortHeaders(),
      this._fetchUserGameTemplates(),
    ]);
  };

  _fetchUserCloudProjects = async () => {
    const { authentication } = this.props;
    const { firebaseUser } = this.state.authenticatedUser;
    if (!firebaseUser) return;

    this.setState(({ authenticatedUser }) => ({
      authenticatedUser: {
        ...authenticatedUser,
        cloudProjectsFetchingErrorLabel: null,
      },
    }));

    this._cloudProjectListingDeduplicator
      .launchRequestOrGetOngoingPromise([
        authentication.getAuthorizationHeader,
        firebaseUser.uid,
      ])
      .then(
        cloudProjects =>
          this.setState(({ authenticatedUser }) => ({
            authenticatedUser: {
              ...authenticatedUser,
              cloudProjects,
            },
          })),
        error => {
          console.error('Error while loading user cloud projects:', error);
          this.setState(({ authenticatedUser }) => ({
            authenticatedUser: {
              ...authenticatedUser,
              cloudProjectsFetchingErrorLabel: (
                <Trans>
                  We couldn't load your cloud projects. Verify your internet
                  connection or try again later.
                </Trans>
              ),
            },
          }));
        }
      );
  };

  _fetchUserBadges = async () => {
    const { firebaseUser } = this.state.authenticatedUser;
    if (!firebaseUser) return;
    try {
      const badges = await getUserBadges(firebaseUser.uid);
      this.setState(({ authenticatedUser }) => ({
        authenticatedUser: {
          ...authenticatedUser,
          badges,
        },
      }));
    } catch (error) {
      console.error('Error while loading user badges:', error);
    }
  };

  _notifyUserAboutEmailVerificationAndAdditionalInfo = () => {
    const { profile } = this.state.authenticatedUser;
    if (!profile) return;
    // If the user has not verified their email when logging in we show a dialog to do so.
    // - If they just registered, we don't send the email again as it will be sent automatically,
    // nor do we show a button to send again.
    // - If they are just logging in, we don't send the email but we show a button to send again.
    // Use a boolean to show the dialog only once.
    const accountAgeInMs = Date.now() - profile.createdAt;
    const hasJustCreatedAccount = accountAgeInMs < 1000 * 10; // 10 seconds.
    if (
      this.state.authenticatedUser.firebaseUser &&
      !this.state.authenticatedUser.firebaseUser.emailVerified &&
      !this._hasNotifiedUserAboutEmailVerification
    ) {
      setTimeout(
        () =>
          this.openEmailVerificationDialog({
            open: true,
            sendEmailAutomatically: false,
            showSendEmailButton: !hasJustCreatedAccount,
          }),
        1000
      );
    } else {
      // If the user has not filled additional info, we show a dialog to do so.
      this._notifyUserAboutAdditionalInfo();
    }
  };

  _notifyUserAboutAdditionalInfo = () => {
    const profile = this.state.authenticatedUser.profile;
    if (!profile) return;
    // If the user has not filled their additional information, show
    // the dialog to fill it, but ensure they have closed the email verification dialog first.
    // Use a boolean to show the dialog only once.
    if (
      profile &&
      !this._hasNotifiedUserAboutAdditionalInfo &&
      shouldAskForAdditionalUserInfo(profile)
    ) {
      setTimeout(() => this.openAdditionalUserInfoDialog(true), 1000);
    }
  };

  _doLogout = async () => {
    if (this.props.authentication) {
      await this.props.authentication.logout();
    }
    this._markAuthenticatedUserAsLoggedOut();
    cleanUserTracesOnDevice();
    this.showUserSnackbar({
      message: <Trans>You're now logged out</Trans>,
    });
  };

  _doLogin = async (form: LoginForm) => {
    const { authentication } = this.props;
    if (!authentication) return;

    this.setState({
      loginInProgress: true,
      authError: null,
    });
    this._automaticallyUpdateUserProfile = false;
    try {
      await authentication.login(form);
      await this._fetchUserProfileWithoutThrowingErrors();
      this.openLoginDialog(false);
      const profile = this.state.authenticatedUser.profile;
      const username = profile ? profile.username : null;
      this.showUserSnackbar({
        message: username ? (
          <Trans>👋 Good to see you {username}!</Trans>
        ) : (
          <Trans>👋 Good to see you!</Trans>
        ),
      });
    } catch (authError) {
      this.setState({ authError });
    }
    this.setState({
      loginInProgress: false,
    });
    this._automaticallyUpdateUserProfile = true;
  };

  _doEdit = async (form: EditForm, preferences: PreferencesValues) => {
    const { authentication } = this.props;
    if (!authentication) return;

    this.setState({
      editInProgress: true,
      authError: null,
    });
    this._automaticallyUpdateUserProfile = false;
    try {
      await authentication.editUserProfile(
        authentication.getAuthorizationHeader,
        {
          username: form.username,
          description: form.description,
          getGameStatsEmail: form.getGameStatsEmail,
          getNewsletterEmail: form.getNewsletterEmail,
          appLanguage: preferences.language,
          donateLink: form.donateLink,
          communityLinks: form.communityLinks,
        }
      );
      await this._fetchUserProfileWithoutThrowingErrors();
      this.openEditProfileDialog(false);
    } catch (authError) {
      this.setState({ authError });
    }
    this.setState({
      editInProgress: false,
    });
    this._automaticallyUpdateUserProfile = true;
  };

  _doCreateAccount = async (
    form: RegisterForm,
    preferences: PreferencesValues
  ) => {
    const { authentication } = this.props;
    if (!authentication) return;

    this.setState({
      createAccountInProgress: true,
      authError: null,
    });
    this._automaticallyUpdateUserProfile = false;
    try {
      await authentication.createFirebaseAccount(form);

      try {
        await authentication.createUser(
          authentication.getAuthorizationHeader,
          form,
          preferences.language
        );
      } catch (error) {
        // Ignore this error - this is a best effort call
        // and the user profile will be created on demand later
        // by the API when fetched.
      }

      await this._fetchUserProfileWithoutThrowingErrors();
      this.openCreateAccountDialog(false);
      sendSignupDone(form.email);
      const firebaseUser = this.state.authenticatedUser.firebaseUser;
      aliasUserForAnalyticsAfterSignUp(firebaseUser);
      const profile = this.state.authenticatedUser.profile;
      const username = profile ? profile.username : null;
      this.showUserSnackbar({
        message: username ? (
          <Trans>👋 Welcome to GDevelop {username}!</Trans>
        ) : (
          <Trans>👋 Welcome to GDevelop!</Trans>
        ),
      });
    } catch (authError) {
      this.setState({ authError });
    }
    this.setState({
      createAccountInProgress: false,
    });
    this._automaticallyUpdateUserProfile = true;
  };

  _doDeleteAccount = async () => {
    const { authentication } = this.props;
    if (!authentication) return;

    this.setState({
      deleteInProgress: true,
      authError: null,
    });
    this._automaticallyUpdateUserProfile = false;
    try {
      await authentication.deleteAccount(authentication.getAuthorizationHeader);
      this._markAuthenticatedUserAsLoggedOut();
      cleanUserTracesOnDevice();
      this.openEditProfileDialog(false);
      this.showUserSnackbar({
        message: <Trans>Your account has been deleted!</Trans>,
      });
    } catch (authError) {
      this.setState({ authError });
    }
    this.setState({
      deleteInProgress: false,
    });
    this._automaticallyUpdateUserProfile = true;
  };

  _doSaveAdditionalUserInfo = async (form: AdditionalUserInfoForm) => {
    const { authentication } = this.props;
    if (!authentication) return;

    this.setState({
      editInProgress: true,
    });
    this._automaticallyUpdateUserProfile = false;
    try {
      await authentication.editUserProfile(
        authentication.getAuthorizationHeader,
        {
          gdevelopUsage: form.gdevelopUsage,
          teamOrCompanySize: form.teamOrCompanySize,
          companyName: form.companyName,
          creationExperience: form.creationExperience,
          creationGoal: form.creationGoal,
          hearFrom: form.hearFrom,
        }
      );
      await this._fetchUserProfileWithoutThrowingErrors();
    } catch (authError) {
      // Do not throw error, as this is a best effort call.
      console.error('Error while saving additional user info:', authError);
    } finally {
      // Close anyway.
      this.openAdditionalUserInfoDialog(false);
      this.showUserSnackbar({
        message: <Trans>Thank you!</Trans>,
      });
    }
    this.setState({
      editInProgress: false,
    });
    this._automaticallyUpdateUserProfile = true;
  };

  _doForgotPassword = async (form: ForgotPasswordForm) => {
    const { authentication } = this.props;
    if (!authentication) return;

    try {
      await authentication.forgotPassword(form);
    } catch (authError) {
      // Do not throw error if the email is not found, as we don't want to
      // give information to the user about which email is registered.
    }
  };

  _doSendEmailVerification = async () => {
    const { authentication } = this.props;
    if (!authentication) return;

    await authentication.sendFirebaseEmailVerification();
  };

  _doAcceptGameStatsEmail = async () => {
    const { authentication } = this.props;
    if (!authentication) return;

    this.setState({
      editInProgress: true,
      authError: null,
    });
    this._automaticallyUpdateUserProfile = false;
    try {
      await authentication.acceptGameStatsEmail(
        authentication.getAuthorizationHeader
      );
      await this._fetchUserProfileWithoutThrowingErrors();
    } catch (authError) {
      this.setState({ authError });
    }
    this.setState({
      editInProgress: false,
    });
    this._automaticallyUpdateUserProfile = true;
  };

  _doChangeEmail = async (form: ChangeEmailForm) => {
    const { authentication } = this.props;
    if (!authentication) return;

    this.setState({
      changeEmailInProgress: true,
      authError: null,
    });
    this._automaticallyUpdateUserProfile = false;
    try {
      await authentication.changeEmail(
        authentication.getAuthorizationHeader,
        form
      );
      await this._fetchUserProfileWithoutThrowingErrors();
      this.openChangeEmailDialog(false);
    } catch (authError) {
      this.setState({ authError });
    }
    this.setState({
      changeEmailInProgress: false,
    });
    this._automaticallyUpdateUserProfile = true;
  };

  openEmailVerificationDialog = ({
    open = true,
    sendEmailAutomatically = false,
    showSendEmailButton = false,
  }: {|
    open?: boolean,
    sendEmailAutomatically?: boolean,
    showSendEmailButton?: boolean,
  |}) => {
    this.setState({
      emailVerificationDialogOpen: open,
      emailVerificationDialogProps: {
        sendEmailAutomatically: open ? sendEmailAutomatically : false, // reset to false when closing dialog.
        showSendEmailButton: open ? showSendEmailButton : false, // reset to false when closing dialog.
      },
    });
    // We save the fact that the user has seen the dialog when they close it.
    // And we show them the additional info dialog if they haven't seen it yet.
    if (!open) {
      this._hasNotifiedUserAboutEmailVerification = true;
      this._notifyUserAboutAdditionalInfo();
    }
  };

  openResetPassword = (open: boolean = true) => {
    this.setState({
      resetPasswordDialogOpen: open,
      authError: null,
    });
  };

  openLoginDialog = (open: boolean = true) => {
    this.setState({
      loginDialogOpen: open,
      createAccountDialogOpen: false,
      authError: null,
    });
  };

  openAdditionalUserInfoDialog = (open: boolean = true) => {
    this._hasNotifiedUserAboutAdditionalInfo = true;
    this.setState({
      additionalUserInfoDialogOpen: open,
      createAccountDialogOpen: false,
      loginDialogOpen: false,
    });
  };

  showUserSnackbar = ({ message }: { message: ?React.Node }) => {
    this.setState({
      // The message is wrapped here to prevent crashes when Google Translate
      // translates the website. See https://github.com/4ian/GDevelop/issues/3453.
      userSnackbarMessage: message ? <span>{message}</span> : null,
    });
  };

  openEditProfileDialog = (open: boolean = true) => {
    this.setState({
      editProfileDialogOpen: open,
      authError: null,
    });
  };

  openCreateAccountDialog = (open: boolean = true) => {
    this.setState({
      loginDialogOpen: false,
      createAccountDialogOpen: open,
      authError: null,
    });
  };

  openChangeEmailDialog = (open: boolean = true) => {
    this.setState({
      changeEmailDialogOpen: open,
      authError: null,
    });
  };

  render() {
    return (
      <PreferencesContext.Consumer>
        {({ values: preferences }) => (
          <React.Fragment>
            <AuthenticatedUserContext.Provider
              value={this.state.authenticatedUser}
            >
              {this.props.children}
            </AuthenticatedUserContext.Provider>
            {this.state.loginDialogOpen && (
              <LoginDialog
                onClose={() => this.openLoginDialog(false)}
                onGoToCreateAccount={() => this.openCreateAccountDialog(true)}
                onLogin={this._doLogin}
                loginInProgress={this.state.loginInProgress}
                error={this.state.authError}
                onForgotPassword={this._doForgotPassword}
              />
            )}
            {this.state.authenticatedUser.profile &&
              this.state.editProfileDialogOpen && (
                <EditProfileDialog
                  profile={this.state.authenticatedUser.profile}
                  subscription={this.state.authenticatedUser.subscription}
                  onClose={() => this.openEditProfileDialog(false)}
                  onEdit={form => this._doEdit(form, preferences)}
                  onDelete={this._doDeleteAccount}
                  actionInProgress={
                    this.state.editInProgress || this.state.deleteInProgress
                  }
                  error={this.state.authError}
                />
              )}
            {this.state.authenticatedUser.firebaseUser &&
              this.state.changeEmailDialogOpen && (
                <ChangeEmailDialog
                  firebaseUser={this.state.authenticatedUser.firebaseUser}
                  onClose={() => this.openChangeEmailDialog(false)}
                  onChangeEmail={this._doChangeEmail}
                  changeEmailInProgress={this.state.changeEmailInProgress}
                  error={this.state.authError}
                />
              )}
            {this.state.createAccountDialogOpen && (
              <CreateAccountDialog
                onClose={() => this.openCreateAccountDialog(false)}
                onGoToLogin={() => this.openLoginDialog(true)}
                onCreateAccount={form =>
                  this._doCreateAccount(form, preferences)
                }
                createAccountInProgress={this.state.createAccountInProgress}
                error={this.state.authError}
              />
            )}
            {this.state.additionalUserInfoDialogOpen &&
              this.state.authenticatedUser.profile && (
                <AdditionalUserInfoDialog
                  profile={this.state.authenticatedUser.profile}
                  onClose={() => this.openAdditionalUserInfoDialog(false)}
                  onSaveAdditionalUserInfo={form =>
                    this._doSaveAdditionalUserInfo(form)
                  }
                  updateInProgress={this.state.editInProgress}
                />
              )}
            {this.state.emailVerificationDialogOpen && (
              <EmailVerificationDialog
                authenticatedUser={this.state.authenticatedUser}
                onClose={() => {
                  this.openEmailVerificationDialog({
                    open: false,
                  });
                  this.state.authenticatedUser
                    .onRefreshFirebaseProfile()
                    .catch(() => {
                      // Ignore any error, we can't do much.
                    });
                }}
                {...this.state.emailVerificationDialogProps}
                onSendEmail={this._doSendEmailVerification}
              />
            )}
            <Snackbar
              open={!!this.state.userSnackbarMessage}
              autoHideDuration={3000}
              onClose={() => this.showUserSnackbar({ message: null })}
              ContentProps={{
                'aria-describedby': 'snackbar-message',
              }}
              message={
                <span id="snackbar-message">
                  {this.state.userSnackbarMessage}
                </span>
              }
            />
          </React.Fragment>
        )}
      </PreferencesContext.Consumer>
    );
  }
}
