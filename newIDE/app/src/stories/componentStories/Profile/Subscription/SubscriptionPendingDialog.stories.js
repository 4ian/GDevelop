// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import {
  fakeIndieAuthenticatedUser,
  fakeNoSubscriptionAuthenticatedUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import SubscriptionPendingDialog from '../../../../Profile/Subscription/SubscriptionPendingDialog';

export default {
  title: 'Subscription/SubscriptionPendingDialog',
  component: SubscriptionPendingDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const DefaultNoSubscription = () => (
  <SubscriptionPendingDialog
    authenticatedUser={fakeNoSubscriptionAuthenticatedUser}
    onClose={action('on close')}
  />
);
export const AuthenticatedUserWithSubscription = () => (
  <SubscriptionPendingDialog
    authenticatedUser={fakeIndieAuthenticatedUser}
    onClose={action('on close')}
  />
);
