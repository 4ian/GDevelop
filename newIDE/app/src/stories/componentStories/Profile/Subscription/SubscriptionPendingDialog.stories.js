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

export const DefaultNoSubscription = (): renders any => (
  <SubscriptionPendingDialog
    authenticatedUser={fakeAuthenticatedUserWithNoSubscription}
    onClose={action('on close')}
    onSuccess={action('on success')}
  />
);

export const AuthenticatedUserWithSubscriptionAndDiscordUsernameAlreadyFilled = (): renders any => (
  <SubscriptionPendingDialog
    authenticatedUser={fakeSilverAuthenticatedUser}
    onClose={action('on close')}
    onSuccess={action('on success')}
  />
);

const fakeProfileWithoutDiscordUsername = {
  ...indieUserProfile,
  discordUsername: '',
};

export const AuthenticatedUserWithSilverSubscriptionButWithoutDiscordUsername = (): renders any => (
  <SubscriptionPendingDialog
    authenticatedUser={{
      ...fakeSilverAuthenticatedUser,
      profile: fakeProfileWithoutDiscordUsername,
    }}
    onClose={action('on close')}
    onSuccess={action('on success')}
  />
);

export const AuthenticatedUserWithStartupSubscriptionButWithoutDiscordUsername = (): renders any => (
  <SubscriptionPendingDialog
    authenticatedUser={{
      ...fakeStartupAuthenticatedUser,
      profile: fakeProfileWithoutDiscordUsername,
    }}
    onClose={action('on close')}
    onSuccess={action('on success')}
  />
);
