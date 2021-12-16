// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import UserChip from '../../../UI/User/UserChip';
import { indieUserProfile } from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'User chips/UserChip',
  component: UserChip,
  decorators: [paperDecorator, muiDecorator],
};

export const SignedUser = () => (
  <UserChip
    profile={indieUserProfile}
    onClick={() => action('click user chip')}
    displayNotificationBadge={false}
  />
);

export const SignedUserWithNotifications = () => (
  <UserChip
    profile={indieUserProfile}
    onClick={() => action('click user chip')}
    displayNotificationBadge={true}
  />
);

export const UnsignedUser = () => (
  <UserChip
    profile={null}
    onClick={() => action('click user chip')}
    displayNotificationBadge={false}
  />
);
