// @flow

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import Star from '@material-ui/icons/Star';
import Favorite from '@material-ui/icons/Favorite';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from './AuthenticatedUserContext';
import { Column, Line, Spacer } from '../UI/Grid';
import {
  sendSubscriptionCheckDialogShown,
  sendSubscriptionCheckDismiss,
} from '../Utils/Analytics/EventSender';
import { Trans } from '@lingui/macro';
import Text from '../UI/Text';

type Props = {|
  title: React.Node,
  id: string,
  onChangeSubscription?: () => void,
  mode: 'try' | 'mandatory',
|};

type DialogProps = {|
  authenticatedUser: AuthenticatedUser,
  ...$Exact<Props>,
|};

type DialogState = {|
  open: boolean,
|};

const styles = {
  icon: { width: 40, height: 40, marginRight: 20 },
  iconText: { flex: 1 },
};

export class SubscriptionCheckDialog extends React.Component<
  DialogProps,
  DialogState
> {
  state = { open: false };

  checkHasSubscription() {
    const { authenticatedUser, mode, id } = this.props;
    if (authenticatedUser.subscription) {
      const hasPlan = !!authenticatedUser.subscription.planId;
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
    sendSubscriptionCheckDialogShown({ mode, id });

    return false;
  }

  _closeDialog = () => {
    sendSubscriptionCheckDismiss();
    this.setState({ open: false });
  };

  render() {
    const { open } = this.state;
    const { onChangeSubscription, mode } = this.props;
    if (!open) return null;

    return (
      <Dialog
        title={
          mode === 'try' ? (
            <Trans>We need your support!</Trans>
          ) : (
            this.props.title
          )
        }
        actions={[
          onChangeSubscription && (
            <DialogPrimaryButton
              label={<Trans>Get a subscription or login</Trans>}
              key="subscribe"
              primary
              onClick={() => {
                this.setState({ open: false });
                onChangeSubscription();
              }}
            />
          ),
        ]}
        secondaryActions={[
          <FlatButton
            label={
              mode === 'try' ? (
                <Trans>Continue anyway</Trans>
              ) : (
                <Trans>Not now, thanks!</Trans>
              )
            }
            key="close"
            primary={false}
            onClick={this._closeDialog}
          />,
        ]}
        onRequestClose={this._closeDialog}
      >
        open={open}
        <Column noMargin>
          <Line noMargin alignItems="center">
            {mode === 'try' ? (
              <Text>
                <Trans>
                  Please get a subscription to keep GDevelop running.
                </Trans>
              </Text>
            ) : (
              <Text>
                <Trans>
                  To use this feature, we ask you to get a subscription to
                  GDevelop.
                </Trans>
              </Text>
            )}
          </Line>
          <Line noMargin alignItems="center">
            <Star style={styles.icon} />
            <Text style={styles.iconText}>
              <Trans>
                Get a subscription to gain more one-click exports, remove the
                GDevelop splashscreen and this message asking you to get a
                subscription.
              </Trans>
            </Text>
          </Line>
          <Line noMargin alignItems="center">
            <Favorite style={styles.icon} />
            <Text style={styles.iconText}>
              <Trans>
                You're also supporting the development of GDevelop, an
                open-source software! In the future, more online services will
                be available for users with a subscription.
              </Trans>
            </Text>
          </Line>
          <Spacer />
          <Spacer />
          <Spacer />
          <Spacer />
          <Text align="right">
            <b>
              <Trans>Thanks!</Trans>
            </b>
          </Text>
        </Column>
      </Dialog>
    );
  }
}

class SubscriptionChecker extends React.Component<Props, {}> {
  _dialog: ?SubscriptionCheckDialog = null;

  checkHasSubscription() {
    if (this._dialog) {
      return this._dialog.checkHasSubscription();
    }

    return false;
  }

  render() {
    return (
      <AuthenticatedUserContext.Consumer>
        {(authenticatedUser: AuthenticatedUser) => (
          <SubscriptionCheckDialog
            authenticatedUser={authenticatedUser}
            ref={dialog => (this._dialog = dialog)}
            onChangeSubscription={this.props.onChangeSubscription}
            id={this.props.id}
            title={this.props.title}
            mode={this.props.mode}
          />
        )}
      </AuthenticatedUserContext.Consumer>
    );
  }
}

export default SubscriptionChecker;
