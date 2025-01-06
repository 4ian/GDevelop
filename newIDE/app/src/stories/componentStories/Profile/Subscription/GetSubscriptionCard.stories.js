// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { fakeNotAuthenticatedUser } from '../../../../fixtures/GDevelopServicesTestData';
import GetSubscriptionCard from '../../../../Profile/Subscription/GetSubscriptionCard';
import { Column, Line } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';

export default {
  title: 'Subscription/GetSubscriptionCard',
  component: GetSubscriptionCard,
  decorators: [paperDecorator],
};

export const Default = () => (
  <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
    <GetSubscriptionCard subscriptionDialogOpeningReason="Build limit reached">
      <Line>
        <Column noMargin>
          <Text noMargin>
            Upgrade your GDevelop subscription to unlock this packaging.
          </Text>
        </Column>
      </Line>
    </GetSubscriptionCard>
  </AuthenticatedUserContext.Provider>
);

export const CustomLabel = () => (
  <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
    <GetSubscriptionCard
      subscriptionDialogOpeningReason="Build limit reached"
      label="Upgrade your subscription"
    >
      <Line>
        <Column noMargin>
          <Text noMargin>
            Upgrade your GDevelop subscription to unlock this packaging.
          </Text>
        </Column>
      </Line>
    </GetSubscriptionCard>
  </AuthenticatedUserContext.Provider>
);

export const ButtonHidden = () => (
  <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
    <GetSubscriptionCard
      subscriptionDialogOpeningReason="Build limit reached"
      hideButton
    >
      <Line>
        <Column noMargin>
          <Text noMargin>
            Upgrade your GDevelop subscription to unlock this packaging.
          </Text>
        </Column>
      </Line>
    </GetSubscriptionCard>
  </AuthenticatedUserContext.Provider>
);

export const PayWithCreditsOptions = () => (
  <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
    <GetSubscriptionCard
      subscriptionDialogOpeningReason="Build limit reached"
      payWithCreditsOptions={{
        label: 'Purchase with 100 credits',
        onPayWithCredits: action('onPayWithCredits'),
      }}
    >
      <Line>
        <Column noMargin>
          <Text noMargin>
            Upgrade your GDevelop subscription to unlock this packaging.
          </Text>
        </Column>
      </Line>
    </GetSubscriptionCard>
  </AuthenticatedUserContext.Provider>
);

export const ForceColumnLayout = () => (
  <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
    <GetSubscriptionCard
      subscriptionDialogOpeningReason="Build limit reached"
      forceColumnLayout
    >
      <Line>
        <Column noMargin>
          <Text noMargin>
            Upgrade your GDevelop subscription to unlock this packaging.
          </Text>
        </Column>
      </Line>
    </GetSubscriptionCard>
  </AuthenticatedUserContext.Provider>
);
