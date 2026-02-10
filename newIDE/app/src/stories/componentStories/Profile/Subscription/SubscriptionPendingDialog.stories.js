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

// $FlowFixMe[signature-verification-failure]
export const DefaultNoSubscription = () => (
  <SubscriptionPendingDialog
    authenticatedUser={fakeAuthenticatedUserWithNoSubscription}
    onClose={action('on close')}
    onSuccess={action('on success')}
  />
);

// $FlowFixMe[signature-verification-failure]
export const AuthenticatedUserWithSubscriptionAndDiscordUsernameAlreadyFilled = () => (
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

// $FlowFixMe[signature-verification-failure]
export const AuthenticatedUserWithSilverSubscriptionButWithoutDiscordUsername = () => (
  <SubscriptionPendingDialog
    authenticatedUser={{
      ...fakeSilverAuthenticatedUser,
      // $FlowFixMe[incompatible-type]
      profile: fakeProfileWithoutDiscordUsername,
    }}
    onClose={action('on close')}
    onSuccess={action('on success')}
  />
);

// $FlowFixMe[signature-verification-failure]
export const AuthenticatedUserWithStartupSubscriptionButWithoutDiscordUsername = () => (
  <SubscriptionPendingDialog
    authenticatedUser={{
      ...fakeStartupAuthenticatedUser,
      // $FlowFixMe[incompatible-type]
      profile: fakeProfileWithoutDiscordUsername,
    }}
    onClose={action('on close')}
    onSuccess={action('on success')}
  />
);
