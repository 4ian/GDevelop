// @flow

import * as React from 'react';
import {
  getUserUsages,
  getUserSubscription,
  getUserLimits,
} from '../Utils/GDevelopServices/Usage';
import Authentification, {
  type FirebaseProfile,
  type LoginForm,
  type RegisterForm,
  type ForgotPasswordForm,
  type AuthError,
} from '../Utils/GDevelopServices/Authentification';
import LoginDialog from './LoginDialog';
import { watchPromiseInState } from '../Utils/WatchPromiseInState';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { sendSignupDone } from '../Utils/Analytics/EventSender';
import UserProfileContext, {
  initialUserProfile,
  type UserProfile,
} from './UserProfileContext';
import CreateAccountDialog from './CreateAccountDialog';

type Props = {
  authentification: Authentification,
  children: React.Node,
};

type State = {|
  userProfile: UserProfile,
  loginDialogOpen: boolean,
  createAccountDialogOpen: boolean,
  loginInProgress: boolean,
  createAccountInProgress: boolean,
  authError: ?AuthError,
  resetPasswordDialogOpen: boolean,
  forgotPasswordInProgress: boolean,
|};

export default class UserProfileProvider extends React.Component<Props, State> {
  state = {
    userProfile: initialUserProfile,
    loginDialogOpen: false,
    createAccountDialogOpen: false,
    loginInProgress: false,
    createAccountInProgress: false,
    authError: null,
    resetPasswordDialogOpen: false,
    forgotPasswordInProgress: false,
  };

  componentDidMount() {
    this._resetUserProfile();
    this.props.authentification.onUserChange(this._fetchUserProfile);
  }

  _resetUserProfile() {
    this.setState({
      userProfile: {
        ...initialUserProfile,
        onLogout: this._doLogout,
        onLogin: () => this.openLoginDialog(true),
        onCreateAccount: () => this.openCreateAccountDialog(true),
        onRefreshUserProfile: this._fetchUserProfile,
        getAuthorizationHeader: () =>
          this.props.authentification.getAuthorizationHeader(),
      },
    });
  }

  _fetchUserProfile = () => {
    const { authentification } = this.props;

    authentification.getUserFirebaseProfile(
      (err, firebaseProfile: ?FirebaseProfile) => {
        if (err && err.unauthenticated) {
          return this.setState({
            userProfile: {
              ...this.state.userProfile,
              authenticated: false,
              profile: null,
              usages: null,
              limits: null,
              subscription: null,
            },
          });
        } else if (err || !firebaseProfile) {
          console.log('Unable to fetch user profile', err);
          return;
        }

        this.setState(
          {
            userProfile: {
              ...this.state.userProfile,
              authenticated: true,
              firebaseProfile,
            },
          },
          () => {
            if (!firebaseProfile) return;

            authentification
              .getUserProfile(authentification.getAuthorizationHeader)
              .then(user =>
                this.setState({
                  userProfile: {
                    ...this.state.userProfile,
                    profile: user,
                  },
                })
              );
            getUserUsages(
              authentification.getAuthorizationHeader,
              firebaseProfile.uid
            ).then(usages =>
              this.setState({
                userProfile: {
                  ...this.state.userProfile,
                  usages,
                },
              })
            );
            getUserSubscription(
              authentification.getAuthorizationHeader,
              firebaseProfile.uid
            ).then(subscription =>
              this.setState({
                userProfile: {
                  ...this.state.userProfile,
                  subscription,
                },
              })
            );
            getUserLimits(
              authentification.getAuthorizationHeader,
              firebaseProfile.uid
            ).then(limits =>
              this.setState({
                userProfile: {
                  ...this.state.userProfile,
                  limits,
                },
              })
            );
          }
        );
      }
    );
  };

  _doLogout = () => {
    if (this.props.authentification) this.props.authentification.logout();
    this._resetUserProfile();
  };

  _doLogin = (form: LoginForm) => {
    const { authentification } = this.props;
    if (!authentification) return;

    watchPromiseInState(this, 'loginInProgress', () =>
      authentification.login(form).then(
        () => {
          this._fetchUserProfile();
          this.openLoginDialog(false);
        },
        (authError: AuthError) => {
          this.setState({
            authError,
          });
        }
      )
    );
  };

  _doCreateAccount = (form: RegisterForm) => {
    const { authentification } = this.props;
    if (!authentification) return;

    watchPromiseInState(this, 'createAccountInProgress', () =>
      authentification.createFirebaseAccount(form).then(
        () => {
          authentification
            .createUser(authentification.getAuthorizationHeader, form)
            .then(() => {
              this._fetchUserProfile();
              this.openLoginDialog(false);
              sendSignupDone(form.email);
            });
        },
        (authError: AuthError) => {
          this.setState({
            authError,
          });
        }
      )
    );
  };

  _doForgotPassword = (form: ForgotPasswordForm) => {
    const { authentification } = this.props;
    if (!authentification) return;

    watchPromiseInState(this, 'forgotPasswordInProgress', () =>
      authentification.forgotPassword(form).then(
        () => {
          this.openResetPassword(true);
        },
        (authError: AuthError) => {
          this.setState({
            authError,
          });
          showWarningBox(
            "Unable to send you an email to reset your password. Please double-check that the email address that you've entered is valid."
          );
        }
      )
    );
  };

  openResetPassword = (open: boolean = true) => {
    this.setState({
      resetPasswordDialogOpen: open,
    });
  };

  openLoginDialog = (open: boolean = true) => {
    this.setState({
      loginDialogOpen: open,
      createAccountDialogOpen: false,
    });
  };

  openCreateAccountDialog = (open: boolean = true) => {
    this.setState({
      loginDialogOpen: false,
      createAccountDialogOpen: open,
    });
  };

  render() {
    return (
      <React.Fragment>
        <UserProfileContext.Provider value={this.state.userProfile}>
          {this.props.children}
        </UserProfileContext.Provider>
        {this.state.loginDialogOpen && (
          <LoginDialog
            onClose={() => this.openLoginDialog(false)}
            onGoToCreateAccount={() => this.openCreateAccountDialog(true)}
            onLogin={this._doLogin}
            loginInProgress={this.state.loginInProgress}
            error={this.state.authError}
            onForgotPassword={this._doForgotPassword}
            resetPasswordDialogOpen={this.state.resetPasswordDialogOpen}
            onCloseResetPasswordDialog={() => this.openResetPassword(false)}
            forgotPasswordInProgress={this.state.forgotPasswordInProgress}
          />
        )}
        {this.state.createAccountDialogOpen && (
          <CreateAccountDialog
            onClose={() => this.openCreateAccountDialog(false)}
            onGoToLogin={() => this.openLoginDialog(true)}
            onCreateAccount={this._doCreateAccount}
            createAccountInProgress={this.state.createAccountInProgress}
            error={this.state.authError}
          />
        )}
      </React.Fragment>
    );
  }
}
