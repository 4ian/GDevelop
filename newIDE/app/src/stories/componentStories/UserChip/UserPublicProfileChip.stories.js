// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import { UserPublicProfileChip as UserPublicProfileChipComponent } from '../../../UI/User/UserPublicProfileChip';
import { indieUserProfile } from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'User chips/UserPublicProfileChip',
  component: UserPublicProfileChipComponent,
  decorators: [paperDecorator, muiDecorator],
};

export const UserPublicProfileChip = () => (
  <UserPublicProfileChipComponent user={{ id: '123', username: 'username' }} />
);
