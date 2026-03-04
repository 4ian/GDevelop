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

export const DefaultNoSubscription = (): React.Node => (
  <SubscriptionPendingDialog
    authenticatedUser={fakeAuthenticatedUserWithNoSubscription}
    onClose={action('on close')}
    onSuccess={action('on success')}
  />
);

export const AuthenticatedUserWithSubscriptionAndDiscordUsernameAlreadyFilled = (): React.Node => (
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

export const AuthenticatedUserWithSilverSubscriptionButWithoutDiscordUsername = (): React.Node => (
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

export const AuthenticatedUserWithStartupSubscriptionButWithoutDiscordUsername = (): React.Node => (
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
