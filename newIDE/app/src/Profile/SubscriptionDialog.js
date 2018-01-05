// @flow

import React, { Component } from 'react';
import { Card, CardActions, CardHeader } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';
import Dialog from '../UI/Dialog';
import {
  withUserProfile,
  type WithUserProfileProps,
} from './UserProfileContainer';
import { Column, Line } from '../UI/Grid';
import {
  getSubscriptionPlans,
  type PlanDetails,
  changeUserSubscription,
} from '../Utils/GDevelopServices/Usage';
import { StripeCheckoutConfig } from '../Utils/GDevelopServices/ApiConfigs';
import RaisedButton from 'material-ui/RaisedButton';
import EmptyMessage from '../UI/EmptyMessage';
import { showMessageBox, showErrorBox } from '../UI/Messages/MessageBox';

const styles = {
  descriptionText: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    marginBottom: 5,
  },
  actions: {
    textAlign: 'right',
    display: 'flex',
    justifyContent: 'flex-end',
  },
};

type Props = {|
  open: boolean,
  onClose: Function,
|} & WithUserProfileProps;

type State = {|
  isLoading: boolean,
|};

const LeftLoader = ({ children, isLoading }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    {isLoading && <CircularProgress size={20} style={{ marginRight: 5 }} />}
    {children}
  </div>
);

class SubscriptionDialog extends Component<Props, State> {
  state = { isLoading: false };
  stripeCheckoutHandler: null;

  choosePlan = (plan: PlanDetails) => {
    const { authentification, subscription, profile } = this.props;
    if (!authentification || !profile || !subscription) return;

    if (subscription.stripeCustomerId) {
      //eslint-disable-next-line
      const answer = confirm(
        "Are you sure you want to subscribe to this new plan?"
      );
      if (!answer) return;

      // We already have a stripe customer, change the subscription without
      // asking for the user card.
      this.setState({ isLoading: true });
      changeUserSubscription(authentification, profile.sub, {
        planId: plan.planId,
      }).then(
        () => this.handleNewSubscriptionSuccess(plan),
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
          token: function(stripeToken) {
            this.setState({ isLoading: true });
            changeUserSubscription(authentification, profile.sub, {
              planId: plan.planId,
              stripeToken,
            }).then(
              () => this.handleNewSubscriptionSuccess(plan),
              this.handleNewSubscriptionFailure
            );
          },
        });

        this.stripeCheckoutHandler.open({
          name: plan.name,
          description: 'Monthly subscription',
          currency: 'eur',
          amount: plan.monthlyPriceInEuros * 100,
        });
      }
    }
  };

  handleNewSubscriptionSuccess = (plan: PlanDetails) => {
    this.props.onRefreshUserProfile();
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

  _renderPrice(plan) {
    return plan.monthlyPriceInEuros
      ? 'Free'
      : `${plan.monthlyPriceInEuros}€/month`;
  }

  render() {
    const { open, onClose, subscription, profile } = this.props;
    const actions = [
      <FlatButton
        label="Close"
        key="close"
        primary={false}
        onClick={onClose}
      />,
    ];
    const isLoading = !subscription || !profile || this.state.isLoading;

    return (
      <Dialog
        actions={actions}
        onRequestClose={onClose}
        open={open}
        noMargin
        autoScrollBodyContent
      >
        <Column>
          <Line>
            <p>
              Get a subscription to package your games for Android. With a
              subscription, you're also supporting the development of GDevelop,
              an open-source software!
            </p>
          </Line>
        </Column>
        {getSubscriptionPlans().map(plan => (
          <Card key={plan.planId || ''} style={styles.card}>
            <CardHeader
              title={
                <span>
                  <b>{plan.name}</b> - {plan.monthlyPriceInEuros}€/month
                </span>
              }
              subtitle={plan.smallDescription}
            />
            <p style={styles.descriptionText}>{plan.description || ''}</p>
            <p style={styles.descriptionText}>{plan.moreDescription1 || ''}</p>
            <CardActions style={styles.actions}>
              {subscription && subscription.planId === plan.planId ? (
                <FlatButton
                  disabled
                  label="This is your current plan"
                  onClick={() => this.choosePlan(plan)}
                />
              ) : plan.planId ? (
                <LeftLoader isLoading={isLoading}>
                  <RaisedButton
                    primary
                    disabled={isLoading}
                    label="Choose this plan"
                    onClick={() => this.choosePlan(plan)}
                  />
                </LeftLoader>
              ) : (
                <LeftLoader isLoading={isLoading}>
                  <FlatButton
                    label="Choose"
                    onClick={() => this.choosePlan(plan)}
                  />
                </LeftLoader>
              )}
            </CardActions>
          </Card>
        ))}
        <EmptyMessage>
          Subscriptions can be stopped at any time. GDevelop uses Stripe.com for
          secure payment. No credit card data is stored by GDevelop: everything
          is managed by Stripe secure infrastructure.
        </EmptyMessage>
      </Dialog>
    );
  }
}

export default withUserProfile({
  fetchSubscription: true,
})(SubscriptionDialog);
