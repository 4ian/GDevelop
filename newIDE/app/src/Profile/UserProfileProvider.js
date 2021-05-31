// @flow

import * as React from 'react';
import {
  getUserUsages,
  getUserSubscription,
  getUserLimits,
} from '../Utils/GDevelopServices/Usage';
import Authentification, {
  type Profile,
  type LoginForm,
  type LoginError,
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
  loginError: ?LoginError,
  resetPasswordDialogOpen: boolean,
  forgotPasswordInProgress: boolean,
|};

export default class UserProfileProvider extends React.Component<Props, State> {
  state: State = {
    userProfile: initialUserProfile,
    loginDialogOpen: false,
    createAccountDialogOpen: false,
    loginInProgress: false,
    createAccountInProgress: false,
    loginError: null,
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

  _fetchUserProfile: () => void = () => {
    const { authentification } = this.props;

    authentification.getUserProfile((err, profile: ?Profile) => {
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
      } else if (err || !profile) {
        console.log('Unable to fetch user profile', err);
        return;
      }

      this.setState(
        {
          userProfile: {
            ...this.state.userProfile,
            authenticated: true,
            profile,
          },
        },
        () => {
          if (!profile) return;

          getUserUsages(
            authentification.getAuthorizationHeader,
            profile.uid
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
            profile.uid
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
            profile.uid
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
    });
  };

  _doLogout: () => void = () => {
    if (this.props.authentification) this.props.authentification.logout();
    this._resetUserProfile();
  };

  _doLogin: (form: LoginForm) => void = (form: LoginForm) => {
    const { authentification } = this.props;
    if (!authentification) return;

    watchPromiseInState(this, 'loginInProgress', () =>
      authentification.login(form).then(
        () => {
          this._fetchUserProfile();
          this.openLoginDialog(false);
        },
        (loginError: LoginError) => {
          this.setState({
            loginError,
          });
        }
      )
    );
  };

  _doCreateAccount: (form: LoginForm) => void = (form: LoginForm) => {
    const { authentification } = this.props;
    if (!authentification) return;

    watchPromiseInState(this, 'createAccountInProgress', () =>
      authentification.createAccount(form).then(
        () => {
          this._fetchUserProfile();
          this.openLoginDialog(false);
          sendSignupDone(form.email);
        },
        (loginError: LoginError) => {
          this.setState({
            loginError,
          });
        }
      )
    );
  };

  _doForgotPassword: (form: LoginForm) => void = (form: LoginForm) => {
    const { authentification } = this.props;
    if (!authentification) return;

    watchPromiseInState(this, 'forgotPasswordInProgress', () =>
      authentification.forgotPassword(form).then(
        () => {
          this.openResetPassword(true);
        },
        (loginError: LoginError) => {
          this.setState({
            loginError,
          });
          showWarningBox(
            "Unable to send you an email to reset your password. Please double-check that the email address that you've entered is valid."
          );
        }
      )
    );
  };

  openResetPassword: (open?: boolean) => void = (open: boolean = true) => {
    this.setState({
      resetPasswordDialogOpen: open,
    });
  };

  openLoginDialog: (open?: boolean) => void = (open: boolean = true) => {
    this.setState({
      loginDialogOpen: open,
      createAccountDialogOpen: false,
    });
  };

  openCreateAccountDialog: (open?: boolean) => void = (
    open: boolean = true
  ) => {
    this.setState({
      loginDialogOpen: false,
      createAccountDialogOpen: open,
    });
  };

  render(): React.Node {
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
            error={this.state.loginError}
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
            error={this.state.loginError}
          />
        )}
      </React.Fragment>
    );
  }
}
