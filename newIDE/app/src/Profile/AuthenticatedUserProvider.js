// @flow

import * as React from 'react';
import {
  getUserUsages,
  getUserSubscription,
  getUserLimits,
} from '../Utils/GDevelopServices/Usage';
import Authentication, {
  type LoginForm,
  type RegisterForm,
  type ForgotPasswordForm,
  type AuthError,
} from '../Utils/GDevelopServices/Authentication';
import { User as FirebaseUser } from 'firebase/auth';
import LoginDialog from './LoginDialog';
import { watchPromiseInState } from '../Utils/WatchPromiseInState';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { sendSignupDone } from '../Utils/Analytics/EventSender';
import AuthenticatedUserContext, {
  initialAuthenticatedUser,
  type AuthenticatedUser,
} from './AuthenticatedUserContext';
import CreateAccountDialog from './CreateAccountDialog';

type Props = {
  authentication: Authentication,
  children: React.Node,
};

type State = {|
  authenticatedUser: AuthenticatedUser,
  loginDialogOpen: boolean,
  createAccountDialogOpen: boolean,
  loginInProgress: boolean,
  createAccountInProgress: boolean,
  authError: ?AuthError,
  resetPasswordDialogOpen: boolean,
  forgotPasswordInProgress: boolean,
|};

export default class AuthenticatedUserProvider extends React.Component<Props, State> {
  state = {
    authenticatedUser: initialAuthenticatedUser,
    loginDialogOpen: false,
    createAccountDialogOpen: false,
    loginInProgress: false,
    createAccountInProgress: false,
    authError: null,
    resetPasswordDialogOpen: false,
    forgotPasswordInProgress: false,
  };

  componentDidMount() {
    this._resetAuthenticatedUser();
    this.props.authentication.onUserChange(this._fetchUserProfile);
  }

  _resetAuthenticatedUser() {
    this.setState({
      authenticatedUser: {
        ...initialAuthenticatedUser,
        onLogout: this._doLogout,
        onLogin: () => this.openLoginDialog(true),
        onCreateAccount: () => this.openCreateAccountDialog(true),
        onRefreshUserProfile: this._fetchUserProfile,
        getAuthorizationHeader: () =>
          this.props.authentication.getAuthorizationHeader(),
      },
    });
  }

  _fetchUserProfile = () => {
    const { authentication } = this.props;

    authentication.getFirebaseUser((err, firebaseUser: ?FirebaseUser) => {
      if (err && err.unauthenticated) {
        return this.setState({
          authenticatedUser: {
            ...this.state.authenticatedUser,
            authenticated: false,
            profile: null,
            usages: null,
            limits: null,
            subscription: null,
          },
        });
      } else if (err || !firebaseUser) {
        console.log('Unable to fetch user profile', err);
        return;
      }

      this.setState(
        {
          authenticatedUser: {
            ...this.state.authenticatedUser,
            authenticated: true,
            firebaseUser,
          },
        },
        () => {
          if (!firebaseUser) return;

          authentication
            .getUserProfile(authentication.getAuthorizationHeader)
            .then(user =>
              this.setState({
                authenticatedUser: {
                  ...this.state.authenticatedUser,
                  profile: user,
                },
              })
            );
          getUserUsages(
            authentication.getAuthorizationHeader,
            firebaseUser.uid
          ).then(usages =>
            this.setState({
              authenticatedUser: {
                ...this.state.authenticatedUser,
                usages,
              },
            })
          );
          getUserSubscription(
            authentication.getAuthorizationHeader,
            firebaseUser.uid
          ).then(subscription =>
            this.setState({
              authenticatedUser: {
                ...this.state.authenticatedUser,
                subscription,
              },
            })
          );
          getUserLimits(
            authentication.getAuthorizationHeader,
            firebaseUser.uid
          ).then(limits =>
            this.setState({
              authenticatedUser: {
                ...this.state.authenticatedUser,
                limits,
              },
            })
          );
        }
      );
    });
  };

  _doLogout = () => {
    if (this.props.authentication) this.props.authentication.logout();
    this._resetAuthenticatedUser();
  };

  _doLogin = (form: LoginForm) => {
    const { authentication } = this.props;
    if (!authentication) return;

    watchPromiseInState(this, 'loginInProgress', () =>
      authentication.login(form).then(
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
    const { authentication } = this.props;
    if (!authentication) return;

    watchPromiseInState(this, 'createAccountInProgress', () =>
      authentication.createFirebaseAccount(form).then(
        () => {
          authentication
            .createUser(authentication.getAuthorizationHeader, form)
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
    const { authentication } = this.props;
    if (!authentication) return;

    watchPromiseInState(this, 'forgotPasswordInProgress', () =>
      authentication.forgotPassword(form).then(
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
        <AuthenticatedUserContext.Provider value={this.state.authenticatedUser}>
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
