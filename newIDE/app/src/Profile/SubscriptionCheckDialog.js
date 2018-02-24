// @flow

import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Dialog from '../UI/Dialog';
import UserProfileContext, { type UserProfile } from './UserProfileContext';
import { Column, Line } from '../UI/Grid';

type Props = {};

type State = {|
  open: boolean,
|};

export default class SubscriptionCheckDialog extends Component<Props, State> {
  state = { open: false };

  checkHasSubscription() {
      return true; // TODO
    // const { subscription } = this.props;
    // console.log(subscription);
    // if (subscription) {
    //   const hasPlan = !!subscription.planId;
    //   if (hasPlan) {
    //     this.setState({
    //       open: false,
    //     });
    //   }

    //   return true;
    // }

    // this.setState({
    //   open: true,
    // });
    // return false;
  }

  _closeDialog = () => this.setState({ open: false });

  render() {
    const { open } = this.state;
    if (!open) return null;

    return (
      <UserProfileContext.Consumer>
        {(userProfile: UserProfile) => (
          <Dialog
            actions={[
              <FlatButton
                label="Get a subscription or login"
                key="subscribe"
                primary
                onClick={() => {
                  /*TODO*/
                }}
              />,
            ]}
            secondaryActions={[
              <FlatButton
                label="Close"
                key="close"
                primary={false}
                onClick={this._closeDialog}
              />,
            ]}
            onRequestClose={this._closeDialog}
            open={open}
            autoScrollBodyContent
          >
            <Column>
              <Line>
                <p>
                  Get a subscription to TODO. You're also supporting the
                  development of GDevelop, an open-source software!
                </p>
              </Line>
            </Column>
          </Dialog>
        )}
      </UserProfileContext.Consumer>
    );
  }
}
