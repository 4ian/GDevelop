// @flow

import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import { Tabs, Tab } from 'material-ui/Tabs';
import Dialog from '../UI/Dialog';
import { Column } from '../UI/Grid';
import CreateProfile from './CreateProfile';
import ProfileDetails from './ProfileDetails';
import EmptyMessage from '../UI/EmptyMessage';
import HelpButton from '../UI/HelpButton';
import UsagesDetails from './UsagesDetails';
import SubscriptionDetails from './SubscriptionDetails';
import UserProfileContext, { type UserProfile } from './UserProfileContext';

type Props = {|
  open: boolean,
  onClose: Function,
  onChangeSubscription: Function,
|};

type State = {|
  currentTab: string,
|};

export default class ProfileDialog extends Component<Props, State> {
  state = {
    currentTab: 'profile',
  };

  _onChangeTab = (newTab: string) =>
    this.setState({
      currentTab: newTab,
    });

  render() {
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
      <UserProfileContext.Consumer>
        {(userProfile: UserProfile) => (
          <Dialog
            actions={actions}
            secondaryActions={[
              <HelpButton key="help" helpPagePath="/interface/profile" />,
              userProfile.authenticated && userProfile.profile && (
                <FlatButton
                  label="Logout"
                  key="logout"
                  onClick={userProfile.onLogout}
                />
              ),
            ]}
            onRequestClose={onClose}
            open={open}
            noMargin
            autoScrollBodyContent
          >
            <Tabs value={this.state.currentTab} onChange={this._onChangeTab}>
              <Tab label="My Profile" value="profile">
                {userProfile.authenticated ? (
                  <Column noMargin>
                    <ProfileDetails profile={userProfile.profile} />
                    <SubscriptionDetails
                      subscription={userProfile.subscription}
                      onChangeSubscription={this.props.onChangeSubscription}
                    />
                  </Column>
                ) : (
                  <Column>
                    <CreateProfile onLogin={userProfile.onLogin} />
                  </Column>
                )}
              </Tab>
              <Tab label="Online services usage" value="usage">
                {userProfile.authenticated ? (
                  <Column noMargin>
                    <UsagesDetails usages={userProfile.usages} />
                  </Column>
                ) : (
                  <EmptyMessage>
                    Register to see the usage that you've made of the online
                    services
                  </EmptyMessage>
                )}
              </Tab>
            </Tabs>
          </Dialog>
        )}
      </UserProfileContext.Consumer>
    );
  }
}
