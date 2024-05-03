// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import {
  indieUserProfile,
  fakeSilverAuthenticatedUser,
  fakeStartupAuthenticatedUser,
  fakeAuthenticatedUserWithNoSubscription,
} from '../../../../fixtures/GDevelopServicesTestData';
import SubscriptionPendingDialog from '../../../../Profile/Subscription/SubscriptionPendingDialog';

export default {
  title: 'Subscription/SubscriptionPendingDialog',
  component: SubscriptionPendingDialog,
  decorators: [paperDecorator],
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

export const AuthenticatedUserWithSilverSubscriptionButWithoutDiscordUsername = () => (
  <SubscriptionPendingDialog
    authenticatedUser={{
      ...fakeSilverAuthenticatedUser,
      profile: fakeProfileWithoutDiscordUsername,
    }}
    onClose={action('on close')}
  />
);

export const AuthenticatedUserWithStartupSubscriptionButWithoutDiscordUsername = () => (
  <SubscriptionPendingDialog
    authenticatedUser={{
      ...fakeStartupAuthenticatedUser,
      profile: fakeProfileWithoutDiscordUsername,
    }}
    onClose={action('on close')}
  />
);
