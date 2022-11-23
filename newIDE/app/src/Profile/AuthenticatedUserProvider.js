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
import { sendSignupDone } from '../Utils/Analytics/EventSender';
import AuthenticatedUserContext, {
  initialAuthenticatedUser,
  type AuthenticatedUser,
} from './AuthenticatedUserContext';
import CreateAccountDialog from './CreateAccountDialog';
import EditProfileDialog from './EditProfileDialog';
import ChangeEmailDialog from './ChangeEmailDialog';
import EmailVerificationPendingDialog from './EmailVerificationPendingDialog';
import PreferencesContext, {
  type PreferencesValues,
} from '../MainFrame/Preferences/PreferencesContext';
import { listUserCloudProjects } from '../Utils/GDevelopServices/Project';
import { clearCloudProjectCookies } from '../ProjectsStorage/CloudStorageProvider/CloudProjectCookies';
import {
  listReceivedAssetShortHeaders,
  listReceivedAssetPacks,
} from '../Utils/GDevelopServices/Asset';
import AdditionalUserInfoDialog from './AdditionalUserInfoDialog';
import { Trans } from '@lingui/macro';
import Snackbar from '@material-ui/core/Snackbar';

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
  additionalUserInfoDialogOpen: boolean,
  authError: ?AuthError,
  resetPasswordDialogOpen: boolean,
  emailVerificationPendingDialogOpen: boolean,
  forgotPasswordInProgress: boolean,
  changeEmailDialogOpen: boolean,
  changeEmailInProgress: boolean,
  userSnackbarMessage: ?React.Node,
|};

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
    additionalUserInfoDialogOpen: false,
    authError: null,
    resetPasswordDialogOpen: false,
    emailVerificationPendingDialogOpen: false,
    forgotPasswordInProgress: false,
    changeEmailDialogOpen: false,
    changeEmailInProgress: false,
    userSnackbarMessage: null,
  };
  _automaticallyUpdateUserProfile = true;
  _hasNotifiedUserAboutAdditionalInfo = false;

  componentDidMount() {
    this._resetAuthenticatedUser();

    // Listen to when the user log out so that we reset the user profile.
    this.props.authentication.addUserLogoutListener(
      this._fetchUserProfileWithoutThrowingErrors
    );

    // When the authenticated user changes, we need to react accordingly
    // This can happen:
    // - at the startup, because the authenticated Firebase user was not ready yet
    //   when this component mounted. So we'll fetch the user profile.
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

    if (this.props.authentication.getFirebaseUserSync()) {
      // The user is logged already: fetch its user profile (because the "user update"
      // won't trigger, as registered too late).
      console.info(
        'Fetching user profile as authenticated user found at startup...'
      );
      this._automaticallyUpdateUserProfile = false;
      this._fetchUserProfileWithoutThrowingErrors();
      this._automaticallyUpdateUserProfile = true;
    } else {
      // Don't do anything. Either no user is logged (nothing to do)
      // or is being logged (the "user udpate" callback will trigger later).
    }
  }

  _resetAuthenticatedUser() {
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
        onPurchaseSuccessful: this._fetchUserAssets,
        onSendEmailVerification: this._doSendEmailVerification,
        onAcceptGameStatsEmail: this._doAcceptGameStatsEmail,
        getAuthorizationHeader: () =>
          this.props.authentication.getAuthorizationHeader(),
      },
    }));
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
      },
    }));

    // First ensure the Firebase authenticated user is up to date
    // (and let the error propagate if any).
    let firebaseUser;
    try {
      firebaseUser = await this._reloadFirebaseProfile();
      if (!firebaseUser) {
        this.setState(({ authenticatedUser }) => ({
          authenticatedUser: {
            ...authenticatedUser,
            loginState: 'done',
          },
        }));
        return;
      }
    } catch (error) {
      this.setState(({ authenticatedUser }) => ({
        authenticatedUser: {
          ...authenticatedUser,
          loginState: 'done',
        },
      }));
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
    listUserCloudProjects(
      authentication.getAuthorizationHeader,
      firebaseUser.uid
    ).then(
      cloudProjects =>
        this.setState(({ authenticatedUser }) => ({
          authenticatedUser: {
            ...authenticatedUser,
            cloudProjects,
          },
        })),
      error => {
        console.error('Error while loading user cloud projects:', error);
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

    // If the user has not filled their additional information, show
    // the dialog to fill it.
    // use a state value to show the dialog only once.
    if (
      userProfile &&
      !this._hasNotifiedUserAboutAdditionalInfo &&
      !userProfile.hearFrom &&
      !userProfile.gdevelopUsage &&
      !userProfile.creationExperience &&
      !userProfile.currentWork
    ) {
      setTimeout(() => this.openAdditionalUserInfoDialog(true), 1000);
    }

    this.setState(({ authenticatedUser }) => ({
      authenticatedUser: {
        ...authenticatedUser,
        profile: userProfile,
        loginState: 'done',
      },
    }));
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

  _fetchUserAssets = async () => {
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

  _fetchUserCloudProjects = async () => {
    const { authentication } = this.props;
    const { firebaseUser } = this.state.authenticatedUser;
    if (!firebaseUser) return;

    listUserCloudProjects(
      authentication.getAuthorizationHeader,
      firebaseUser.uid
    ).then(
      cloudProjects =>
        this.setState(({ authenticatedUser }) => ({
          authenticatedUser: {
            ...authenticatedUser,
            cloudProjects,
          },
        })),
      error => {
        console.error('Error while loading user cloud projects:', error);
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

  _doLogout = async () => {
    if (this.props.authentication) {
      await this.props.authentication.logout();
    }
    this._resetAuthenticatedUser();
    clearCloudProjectCookies();
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
    } catch (authError) {
      this.setState({ authError });
    }
    this.setState({
      createAccountInProgress: false,
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
          hearFrom: form.hearFrom,
          currentWork: form.currentWork,
          gdevelopUsage: form.gdevelopUsage,
          noCodeExperience: form.noCodeExperience,
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
    this.openEmailVerificationPendingDialog(true);
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

  openEmailVerificationPendingDialog = (open: boolean = true) => {
    this.setState({
      emailVerificationPendingDialogOpen: open,
    });
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
      userSnackbarMessage: message,
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
                  onClose={() => this.openEditProfileDialog(false)}
                  onEdit={form => this._doEdit(form, preferences)}
                  updateProfileInProgress={this.state.editInProgress}
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
            {this.state.additionalUserInfoDialogOpen && (
              <AdditionalUserInfoDialog
                onClose={() => this.openAdditionalUserInfoDialog(false)}
                onSaveAdditionalUserInfo={form =>
                  this._doSaveAdditionalUserInfo(form)
                }
                updateInProgress={this.state.editInProgress}
              />
            )}
            {this.state.emailVerificationPendingDialogOpen && (
              <EmailVerificationPendingDialog
                authenticatedUser={this.state.authenticatedUser}
                onClose={() => {
                  this.openEmailVerificationPendingDialog(false);
                  this.state.authenticatedUser
                    .onRefreshFirebaseProfile()
                    .catch(() => {
                      // Ignore any error, we can't do much.
                    });
                }}
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
