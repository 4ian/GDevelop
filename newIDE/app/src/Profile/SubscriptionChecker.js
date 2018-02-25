// @flow

import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Dialog from '../UI/Dialog';
import Star from 'material-ui/svg-icons/toggle/star';
import Favorite from 'material-ui/svg-icons/action/favorite';
import UserProfileContext, { type UserProfile } from './UserProfileContext';
import { Column, Line } from '../UI/Grid';

type DialogProps = {|
  title: string,
  userProfile: UserProfile,
  onChangeSubscription?: () => void,
|};

type DialogState = {|
  open: boolean,
|};

const styles = {
  icon: { width: 40, height: 40, marginRight: 20 },
  iconText: { flex: 1 },
  thanksText: { textAlign: 'right', marginRight: 20, marginBottom: 0 },
};

export class SubscriptionCheckDialog extends Component<
  DialogProps,
  DialogState
> {
  state = { open: false };

  checkHasSubscription() {
    const { userProfile } = this.props;
    if (userProfile.subscription) {
      const hasPlan = !!userProfile.subscription.planId;
      if (hasPlan) {
        this.setState({
          open: false,
        });
        return true;
      }
    }

    this.setState({
      open: true,
    });
    return false;
  }

  _closeDialog = () => this.setState({ open: false });

  render() {
    const { open } = this.state;
    const { onChangeSubscription } = this.props;
    if (!open) return null;

    return (
      <Dialog
        actions={[
          onChangeSubscription && (
            <RaisedButton
              label="Get a subscription or login"
              key="subscribe"
              primary
              onClick={() => {
                this._closeDialog();
                onChangeSubscription();
              }}
            />
          ),
        ]}
        secondaryActions={[
          <FlatButton
            label="Continue anyway"
            key="close"
            primary={false}
            onClick={this._closeDialog}
          />,
        ]}
        onRequestClose={this._closeDialog}
        open={open}
        autoScrollBodyContent
        title={this.props.title}
      >
        <Column noMargin>
          <Line noMargin alignItems="center">
            <p>
              You can try this feature, but if you're using it regularly, we ask
              you to get a subscription to GDevelop.
            </p>
          </Line>
          <Line noMargin alignItems="center">
            <Star style={styles.icon} />
            <p style={styles.iconText}>
              Having a subscription allows you to use the one-click export for
              Android, launch live previews over wifi, disable the GDevelop
              splashscreen during loading and more!
            </p>
          </Line>
          <Line noMargin alignItems="center">
            <Favorite style={styles.icon} />
            <p style={styles.iconText}>
              You're also supporting the development of GDevelop, an open-source
              software! In the future, more exports (iOS, Windows/Mac/Linux) and
              online services will be available for users with a subscription.
            </p>
          </Line>
          <p style={styles.thanksText}>
            <b>Thanks!</b>
          </p>
        </Column>
      </Dialog>
    );
  }
}

type Props = {|
  title: string,
  onChangeSubscription?: () => void,
|};

class SubscriptionChecker extends Component<Props, {}> {
  _dialog: ?SubscriptionCheckDialog = null;

  checkHasSubscription() {
    if (this._dialog) {
      return this._dialog.checkHasSubscription();
    }

    return false;
  }

  render() {
    return (
      <UserProfileContext.Consumer>
        {(userProfile: UserProfile) => (
          <SubscriptionCheckDialog
            userProfile={userProfile}
            ref={dialog => (this._dialog = dialog)}
            onChangeSubscription={this.props.onChangeSubscription}
            title={this.props.title}
          />
        )}
      </UserProfileContext.Consumer>
    );
  }
}

export default SubscriptionChecker;
