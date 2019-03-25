// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import { Card, CardActions, CardHeader } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Dialog from '../UI/Dialog';
import UserProfileContext, { UserProfile } from './UserProfileContext';
import { Column, Line } from '../UI/Grid';
import {
  getSubscriptionPlans,
  type PlanDetails,
  changeUserSubscription,
} from '../Utils/GDevelopServices/Usage';
import { StripeCheckoutConfig } from '../Utils/GDevelopServices/ApiConfigs';
import RaisedButton from 'material-ui/RaisedButton';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import EmptyMessage from '../UI/EmptyMessage';
import { showMessageBox, showErrorBox } from '../UI/Messages/MessageBox';
import LeftLoader from '../UI/LeftLoader';
import PlaceholderMessage from '../UI/PlaceholderMessage';
import {
  sendSubscriptionDialogShown,
  sendChoosePlanClicked,
} from '../Utils/Analytics/EventSender';

const styles = {
  descriptionText: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    margin: 16,
  },
  actions: {
    textAlign: 'right',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  bulletIcon: { width: 20, height: 20, marginLeft: 15, marginRight: 10 },
  bulletText: { flex: 1, marginTop: 5, marginBottom: 5 },
};

type Props = {|
  open: boolean,
  onClose: Function,
|};

type State = {|
  isLoading: boolean,
|};

export default class SubscriptionDialog extends Component<Props, State> {
  state = { isLoading: false };
  stripeCheckoutHandler: null;

  componentDidMount() {
    if (this.props.open) {
      sendSubscriptionDialogShown();
    }
  }

  componentWillReceiveProps(newProps: Props) {
    if (!this.props.open && newProps.open) {
      sendSubscriptionDialogShown();
    }
  }

  choosePlan = (userProfile: UserProfile, plan: PlanDetails) => {
    const { getAuthorizationHeader, subscription, profile } = userProfile;
    if (!profile || !subscription) return;
    sendChoosePlanClicked(plan.planId);

    if (subscription.stripeCustomerId) {
      //eslint-disable-next-line
      const answer = confirm(
        'Are you sure you want to subscribe to this new plan?'
      );
      if (!answer) return;

      // We already have a stripe customer, change the subscription without
      // asking for the user card.
      this.setState({ isLoading: true });
      changeUserSubscription(getAuthorizationHeader, profile.uid, {
        planId: plan.planId,
      }).then(
        () => this.handleNewSubscriptionSuccess(userProfile, plan),
        this.handleNewSubscriptionFailure
      );
    } else {
      // No existing customer, we need to get the user card so that the API
      // can create the customer.
      const stripeCheckout = global.StripeCheckout;
      if (stripeCheckout) {
        this.stripeCheckoutHandler = stripeCheckout.configure({
          key: StripeCheckoutConfig.key,
          image: StripeCheckoutConfig.image,
          locale: 'auto',
          token: stripeToken => {
            this.setState({ isLoading: true });
            changeUserSubscription(getAuthorizationHeader, profile.uid, {
              planId: plan.planId,
              stripeToken,
            }).then(
              () => this.handleNewSubscriptionSuccess(userProfile, plan),
              this.handleNewSubscriptionFailure
            );
          },
        });

        this.stripeCheckoutHandler.open({
          name: plan.name,
          description: 'Monthly subscription',
          currency: 'eur',
          email: profile.email,
          amount: plan.monthlyPriceInEuros * 100,
        });
      }
    }
  };

  handleNewSubscriptionSuccess = (
    userProfile: UserProfile,
    plan: PlanDetails
  ) => {
    userProfile.onRefreshUserProfile();
    this.setState({ isLoading: false });
    if (plan.planId) {
      showMessageBox(
        'Congratulations, your new subscription is now active!\n\nYou can now use the services unlocked with this plan.'
      );
    } else {
      showMessageBox(
        'Your subscription was properly cancelled. Sorry to see you go!'
      );
    }
  };

  handleNewSubscriptionFailure = (err: any) => {
    this.setState({ isLoading: false });
    showErrorBox(
      'Your subscription could not be updated. Please try again later!',
      err
    );
  };

  _renderPrice(plan: PlanDetails) {
    return !plan.monthlyPriceInEuros
      ? 'Free'
      : `${plan.monthlyPriceInEuros}€/month`;
  }

  _isLoading = (userProfile: UserProfile) =>
    !userProfile.subscription || !userProfile.profile || this.state.isLoading;

  render() {
    const { open, onClose } = this.props;

    return (
      <UserProfileContext.Consumer>
        {(userProfile: UserProfile) => (
          <Dialog
            actions={[
              <FlatButton
                label={<Trans>Close</Trans>}
                key="close"
                primary={false}
                onClick={onClose}
              />,
            ]}
            onRequestClose={onClose}
            open={open}
            noMargin
            autoScrollBodyContent
          >
            <Column>
              <Line>
                <p>
                  <Trans>
                    Get a subscription to package your games for Android,
                    Windows, macOS and Linux, use live preview over wifi and
                    more. With a subscription, you're also supporting the
                    development of GDevelop, which is an open-source software.
                  </Trans>
                </p>
              </Line>
            </Column>
            {getSubscriptionPlans().map(plan => (
              <Card key={plan.planId || ''} style={styles.card}>
                <CardHeader
                  title={
                    <span>
                      <b>{plan.name}</b> - {this._renderPrice(plan)}
                    </span>
                  }
                  subtitle={plan.smallDescription}
                />
                {plan.descriptionBullets.map((bulletText, index) => (
                  <Column key={index} expand>
                    <Line noMargin alignItems="center">
                      <CheckCircle style={styles.bulletIcon} />
                      <p style={styles.bulletText}>{bulletText}</p>
                    </Line>
                  </Column>
                ))}
                <p style={styles.descriptionText}>
                  {plan.extraDescription || ''}
                </p>
                <CardActions style={styles.actions}>
                  {userProfile.subscription &&
                  userProfile.subscription.planId === plan.planId ? (
                    <FlatButton
                      disabled
                      label={<Trans>This is your current plan</Trans>}
                      onClick={() => this.choosePlan(userProfile, plan)}
                    />
                  ) : plan.planId ? (
                    <LeftLoader isLoading={this._isLoading(userProfile)}>
                      <RaisedButton
                        primary
                        disabled={this._isLoading(userProfile)}
                        label={<Trans>Choose this plan</Trans>}
                        onClick={() => this.choosePlan(userProfile, plan)}
                      />
                    </LeftLoader>
                  ) : (
                    <LeftLoader isLoading={this._isLoading(userProfile)}>
                      <FlatButton
                        label={<Trans>Choose</Trans>}
                        onClick={() => this.choosePlan(userProfile, plan)}
                      />
                    </LeftLoader>
                  )}
                </CardActions>
              </Card>
            ))}
            <Column>
              <Line>
                <EmptyMessage>
                  <Trans>
                    Subscriptions can be stopped at any time. GDevelop uses
                    Stripe.com for secure payment. No credit card data is stored
                    by GDevelop: everything is managed by Stripe secure
                    infrastructure.
                  </Trans>
                </EmptyMessage>
              </Line>
            </Column>
            {!userProfile.authenticated && (
              <PlaceholderMessage>
                <p>
                  <Trans>
                    Create a GDevelop account to continue. It's free and you'll
                    be able to access to online services like one-click build
                    for Android:
                  </Trans>
                </p>
                <RaisedButton
                  label={<Trans>Create my account</Trans>}
                  primary
                  onClick={userProfile.onLogin}
                />
                <FlatButton
                  label={<Trans>Not now, thanks</Trans>}
                  onClick={onClose}
                />
              </PlaceholderMessage>
            )}
          </Dialog>
        )}
      </UserProfileContext.Consumer>
    );
  }
}
