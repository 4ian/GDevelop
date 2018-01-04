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
} from '../Utils/GDevelopServices/Authentification';

type Props = {
  open: boolean,
  authentification: ?Authentification,
  wrappedComponentRef?: Function,
};

type State = {
  authenticated: boolean,
  profile: ?Profile,
  usages: ?Usages,
  subscription: ?Subscription,
  limits: ?Limits,
};

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
    };

    componentWillMount() {
      if (this.props.authentification) {
        this.setState({
          authenticated: this.props.authentification
            ? this.props.authentification.isAuthenticated()
            : false,
        });
      }

      if (this.props.open) {
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
          getUserUsages(authentification, profile.sub).then(usages =>
            this.setState({
              usages,
            })
          );
        if (fetchSubscription)
          getUserSubscription(
            authentification,
            profile.sub
          ).then(subscription =>
            this.setState({
              subscription,
            })
          );
        if (fetchLimits)
          getUserLimits(authentification, profile.sub).then(limits =>
            this.setState({
              limits,
            })
          );
      });
    }

    _login = () => {
      if (this.props.authentification)
        this.props.authentification.login({
          onHide: () => {},
          onAuthenticated: arg => {
            this._fetchUserProfile();
          },
          onAuthorizationError: () => {},
        });
    };

    _logout = () => {
      if (this.props.authentification) this.props.authentification.logout();

      this.setState({
        authenticated: false,
      });
    };

    render() {
      const { wrappedComponentRef, ...otherProps } = this.props;

      return (
        <WrappedComponent
          ref={ref => wrappedComponentRef && wrappedComponentRef(ref)}
          authenticated={this.state.authenticated}
          profile={this.state.profile}
          subscription={this.state.subscription}
          usages={this.state.usages}
          limits={this.state.limits}
          onLogin={this._login}
          onLogout={this._logout}
          onRefreshUserProfile={this._fetchUserProfile}
          {...otherProps}
        />
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
