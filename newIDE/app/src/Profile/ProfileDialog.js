// @flow

import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import { Tabs, Tab } from 'material-ui/Tabs';
import Dialog from '../UI/Dialog';
import { Column } from '../UI/Grid';
import Authentification, {
  type Profile,
} from '../Utils/GDevelopServices/Authentification';
import CreateProfile from './CreateProfile';
import ProfileDetails from './ProfileDetails';
import {
  getUserUsages,
  type Usages,
  type Subscription,
  getUserSubscription,
} from '../Utils/GDevelopServices/Usage';
import EmptyMessage from '../UI/EmptyMessage';
import UsagesDetails from './UsagesDetails';
import SubscriptionDetails from './SubscriptionDetails';

type Props = {|
  open: boolean,
  onClose: Function,
  authentification: ?Authentification,
|};

type State = {|
  currentTab: string,
  authenticated: boolean,
  profile: ?Profile,
  usages: ?Usages,
  subscription: ?Subscription,
|};

export default class ProfileDialog extends Component<Props, State> {
  state = {
    currentTab: 'profile',
    authenticated: false,
    profile: null,
    usages: null,
    subscription: null,
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
      this.fetchUserProfile();
    }
  }

  componentWillReceiveProps(newProps: Props) {
    if (!this.props.open && newProps.open) {
      this.fetchUserProfile();
    }
  }

  _onChangeTab = (newTab: string) =>
    this.setState({
      currentTab: newTab,
    });

  fetchUserProfile() {
    const { authentification } = this.props;
    if (!authentification) return;

    authentification.getUserInfo((err, profile: ?Profile) => {
      if (err && err.unauthenticated) {
        return this.setState({
          authenticated: false,
          profile: null,
          usages: null,
        });
      } else if (err || !profile) {
        console.log('Unable to fetch user profile', err);
        return;
      }

      this.setState({
        profile,
      });

      Promise.all([
        getUserUsages(authentification, profile.sub),
        getUserSubscription(authentification, profile.sub),
      ]).then(([usages, subscription]) => {
        this.setState({
          usages,
          subscription,
        });
      });
    });
  }

  login = () => {
    if (this.props.authentification)
      this.props.authentification.login({
        onHide: () => {},
        onAuthenticated: arg => {
          this.setState({
            authenticated: true,
          });

          this.fetchUserProfile();
        },
        onAuthorizationError: () => {},
      });
  };

  logout = () => {
    if (this.props.authentification) this.props.authentification.logout();

    this.setState({
      authenticated: false,
    });
  };

  render() {
    const { authenticated, profile, usages, subscription } = this.state;
    const { open, onClose } = this.props;
    const actions = [
      <FlatButton
        label="Close"
        key="close"
        primary={false}
        onClick={onClose}
      />,
    ];

    return (
      <Dialog
        actions={actions}
        secondaryActions={
          authenticated && profile
            ? [<FlatButton label="Logout" key="logout" onClick={this.logout} />]
            : []
        }
        onRequestClose={onClose}
        open={open}
        noMargin
      >
        <Tabs value={this.state.currentTab} onChange={this._onChangeTab}>
          <Tab label="My Profile" value="profile">
            {authenticated ? (
              <Column noMargin>
                <ProfileDetails profile={profile} />
                <SubscriptionDetails subscription={subscription} />
              </Column>
            ) : (
              <CreateProfile onLogin={this.login} />
            )}
          </Tab>
          <Tab label="Online services usage" value="usage">
            {authenticated ? (
              <UsagesDetails usages={usages} />
            ) : (
              <EmptyMessage>
                Register to see the usage that you've made of the online
                services
              </EmptyMessage>
            )}
          </Tab>
        </Tabs>
      </Dialog>
    );
  }
}
