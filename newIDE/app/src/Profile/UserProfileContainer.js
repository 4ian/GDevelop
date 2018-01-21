// @flow

import * as React from 'react';
import {
  getUserUsages,
  getUserSubscription,
  getUserLimits,
  type Usages,
  type Subscription,
  type Limits,
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

type Props = {
  open: boolean,
  authentification: ?Authentification,
  wrappedComponentRef?: Function,
};

type State = {|
  authenticated: boolean,
  profile: ?Profile,
  usages: ?Usages,
  subscription: ?Subscription,
  limits: ?Limits,
  loginDialogOpen: boolean,
  loginInProgress: boolean,
  createAccountInProgress: boolean,
  loginError: ?LoginError,
  resetPasswordDialogOpen: boolean,
  forgotPasswordInProgress: boolean,
|};

type Config = {
  fetchLimits?: ?boolean,
  fetchUsages?: ?boolean,
  fetchSubscription?: ?boolean,
};

export type WithUserProfileProps = {|
  authentification: ?Authentification,
  authenticated: boolean,
  profile: ?Profile,
  limits: ?Limits,
  usages: ?Usages,
  subscription: ?Subscription,
  onLogout: () => void,
  onLogin: () => void,
  onRefreshUserProfile: () => void,
|};

export const withUserProfile = (
  { fetchLimits, fetchUsages, fetchSubscription }: Config = {}
) => (WrappedComponent: any) => {
  class WithUserProfile extends React.Component<Props, State> {
    state = {
      authenticated: false,
      profile: null,
      subscription: null,
      usages: null,
      limits: null,
      loginDialogOpen: false,
      loginInProgress: false,
      createAccountInProgress: false,
      loginError: null,
      resetPasswordDialogOpen: false,
      forgotPasswordInProgress: false,
    };

    componentWillMount() {
      if (this.props.authentification) {
        this.setState({
          authenticated: this.props.authentification
            ? this.props.authentification.isAuthenticated()
            : false,
        });
      }

      if (this.props.open || typeof this.props.open === 'undefined') {
        this._fetchUserProfile();
      }
    }

    componentWillReceiveProps(newProps: Props) {
      if (
        typeof this.props.open === 'undefined' ||
        (!this.props.open && newProps.open)
      ) {
        this._fetchUserProfile();
      }
    }

    _fetchUserProfile = () => {
      const { authentification } = this.props;
      if (!authentification) return;

      authentification.getUserProfile((err, profile: ?Profile) => {
        if (err && err.unauthenticated) {
          return this.setState({
            authenticated: false,
            profile: null,
            usages: null,
            limits: null,
            subscription: null,
          });
        } else if (err || !profile) {
          console.log('Unable to fetch user profile', err);
          return;
        }

        this.setState({
          authenticated: true,
          profile,
        });

        if (fetchUsages)
          getUserUsages(authentification, profile.uid).then(usages =>
            this.setState({
              usages,
            })
          );
        if (fetchSubscription)
          getUserSubscription(
            authentification,
            profile.uid
          ).then(subscription =>
            this.setState({
              subscription,
            })
          );
        if (fetchLimits)
          getUserLimits(authentification, profile.uid).then(limits =>
            this.setState({
              limits,
            })
          );
      });
    };

    _doLogout = () => {
      if (this.props.authentification) this.props.authentification.logout();

      this.setState({
        authenticated: false,
      });
    };

    _doLogin = (form: LoginForm) => {
      const { authentification } = this.props;
      if (!authentification) return;

      watchPromiseInState(this, 'loginInProgress', () =>
        authentification.login(form).then(
          () => {
            this._fetchUserProfile();
            this.openLogin(false);
          },
          (loginError: LoginError) => {
            this.setState({
              loginError,
            });
            throw loginError;
          }
        )
      );
    };

    _doCreateAccount = (form: LoginForm) => {
      const { authentification } = this.props;
      if (!authentification) return;

      watchPromiseInState(this, 'createAccountInProgress', () =>
        authentification.createAccount(form).then(
          () => {
            this._fetchUserProfile();
            this.openLogin(false);
            sendSignupDone(form.email);
          },
          (loginError: LoginError) => {
            this.setState({
              loginError,
            });
            throw loginError;
          }
        )
      );
    };

    _doForgotPassword = (form: LoginForm) => {
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
            throw loginError;
          }
        )
      );
    };

    openResetPassword = (open: boolean = true) => {
      this.setState({
        resetPasswordDialogOpen: open,
      });
    };

    openLogin = (open: boolean = true) => {
      this.setState({
        loginDialogOpen: open,
      });
    };

    render() {
      const { wrappedComponentRef, ...otherProps } = this.props;

      return (
        <React.Fragment>
          <WrappedComponent
            ref={ref => wrappedComponentRef && wrappedComponentRef(ref)}
            authenticated={this.state.authenticated}
            profile={this.state.profile}
            subscription={this.state.subscription}
            usages={this.state.usages}
            limits={this.state.limits}
            onLogin={() => this.openLogin()}
            onLogout={this._doLogout}
            onRefreshUserProfile={this._fetchUserProfile}
            {...otherProps}
          />
          <LoginDialog
            open={this.state.loginDialogOpen}
            onClose={() => this.openLogin(false)}
            onLogin={this._doLogin}
            onCreateAccount={this._doCreateAccount}
            loginInProgress={this.state.loginInProgress}
            createAccountInProgress={this.state.createAccountInProgress}
            error={this.state.loginError}
            onForgotPassword={this._doForgotPassword}
            resetPasswordDialogOpen={this.state.resetPasswordDialogOpen}
            onCloseResetPasswordDialog={() => this.openResetPassword(false)}
            forgotPasswordInProgress={this.state.forgotPasswordInProgress}
          />
        </React.Fragment>
      );
    }
  }

  function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
  }

  WithUserProfile.displayName = `WithUserProfile(${getDisplayName(
    WrappedComponent
  )})`;
  return WithUserProfile;
};
