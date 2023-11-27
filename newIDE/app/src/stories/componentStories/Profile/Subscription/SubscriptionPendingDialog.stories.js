// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import {
  indieUserProfile,
  fakeSilverAuthenticatedUser,
  fakeAuthenticatedUserWithNoSubscription,
} from '../../../../fixtures/GDevelopServicesTestData';
import SubscriptionPendingDialog from '../../../../Profile/Subscription/SubscriptionPendingDialog';

export default {
  title: 'Subscription/SubscriptionPendingDialog',
  component: SubscriptionPendingDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const DefaultNoSubscription = () => (
  <SubscriptionPendingDialog
    authenticatedUser={fakeAuthenticatedUserWithNoSubscription}
    onClose={action('on close')}
  />
);

export const AuthenticatedUserWithSubscriptionAndDiscordUsernameAlreadyFilled = () => (
  <SubscriptionPendingDialog
    authenticatedUser={fakeSilverAuthenticatedUser}
    onClose={action('on close')}
  />
);

const fakeProfileWithoutDiscordUsername = {
  ...indieUserProfile,
  discordUsername: '',
};

export const AuthenticatedUserWithSubscriptionButWithoutDiscordUsername = () => (
  <SubscriptionPendingDialog
    authenticatedUser={{
      ...fakeSilverAuthenticatedUser,
      profile: fakeProfileWithoutDiscordUsername,
    }}
    onClose={action('on close')}
  />
);
