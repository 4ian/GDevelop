// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import {
  fakeAuthenticatedUserWithNoSubscription,
  fakeNotAuthenticatedUser,
  fakeSilverAuthenticatedUser,
  fakeGoldAuthenticatedUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import SimplifiedSubscriptionDialog from '../../../../Profile/Subscription/SubscriptionDialog/SimplifiedSubscriptionDialog';
import AlertProvider from '../../../../UI/Alert/AlertProvider';
import {
  SubscriptionContext,
  SubscriptionProvider,
} from '../../../../Profile/Subscription/SubscriptionContext';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';

export default {
  title: 'Subscription/SimplifiedSubscriptionDialog',
  component: SimplifiedSubscriptionDialog,
  decorators: [paperDecorator],
  argTypes: {
    userState: {
      control: 'radio',
      options: [
        'Not Authenticated',
        'No Subscription',
        'Silver Subscription',
        'Gold Subscription',
      ],
    },
    availableSubscriptionPlansWithPrices: {
      table: { disable: true },
    },
    onClose: {
      table: { disable: true },
    },
    onOpenPendingDialog: {
      table: { disable: true },
    },
  },
};

const getUserFromState = (userState: string) => {
  switch (userState) {
    case 'Not Authenticated':
      return fakeNotAuthenticatedUser;
    case 'Silver Subscription':
      return fakeSilverAuthenticatedUser;
    case 'Gold Subscription':
      return fakeGoldAuthenticatedUser;
    case 'No Subscription':
    default:
      return fakeAuthenticatedUserWithNoSubscription;
  }
};

export const Default = ({ userState }: { userState: string }): React.Node => {
  const Component = () => {
    const { getSubscriptionPlansWithPricingSystems } = React.useContext(
      SubscriptionContext
    );
    const subscriptionPlansWithPricingSystems = getSubscriptionPlansWithPricingSystems();

    if (!subscriptionPlansWithPricingSystems) {
      return <PlaceholderLoader />;
    }

    return (
      <SimplifiedSubscriptionDialog
        availableSubscriptionPlansWithPrices={
          subscriptionPlansWithPricingSystems
        }
        onClose={() => action('on close')()}
        onOpenPendingDialog={() => action('on open pending dialog')()}
      />
    );
  };

  const authenticatedUser = getUserFromState(userState);

  return (
    <AlertProvider>
      {/* $FlowFixMe[incompatible-type] */}
      <AuthenticatedUserContext.Provider value={authenticatedUser}>
        <SubscriptionProvider>
          <Component />
        </SubscriptionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};

Default.args = {
  userState: 'No Subscription',
};
