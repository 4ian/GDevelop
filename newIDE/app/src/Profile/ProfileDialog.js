// @flow
import { Trans } from '@lingui/macro';

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
        label={<Trans>Close</Trans>}
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
                  label={<Trans>Logout</Trans>}
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
              <Tab label={<Trans>My Profile</Trans>} value="profile">
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
              <Tab label={<Trans>Online services usage</Trans>} value="usage">
                {userProfile.authenticated ? (
                  <Column noMargin>
                    <UsagesDetails usages={userProfile.usages} />
                  </Column>
                ) : (
                  <EmptyMessage>
                    <Trans>
                      Register to see the usage that you've made of the online
                      services
                    </Trans>
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
