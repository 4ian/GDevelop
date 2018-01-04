// @flow

import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Dialog from '../UI/Dialog';
import {
  withUserProfile,
  type WithUserProfileProps,
} from './UserProfileContainer';
import { Column, Line } from '../UI/Grid';
import { getSubscriptionPlans } from '../Utils/GDevelopServices/Usage';
import { Card, CardActions, CardHeader } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import EmptyMessage from '../UI/EmptyMessage';

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
  },
};

type Props = {|
  open: boolean,
  onClose: Function,
|} & WithUserProfileProps;

type State = {||};

class SubscriptionDialog extends Component<Props, State> {
  state = {};

  onChoose = planId => {};

  _renderPrice(plan) {
    return plan.monthlyPriceInEuros
      ? 'Free'
      : `${plan.monthlyPriceInEuros}€/month`;
  }

  render() {
    const { open, onClose, subscription } = this.props;
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
          <Card key={plan.planId} style={styles.card}>
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
                <FlatButton disabled label="This is your current plan" />
              ) : plan.planId ? (
                <RaisedButton primary label="Choose this plan" />
              ) : (
                <FlatButton label="Choose" />
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
