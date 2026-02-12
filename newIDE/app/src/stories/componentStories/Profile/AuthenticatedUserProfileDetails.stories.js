// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import AuthenticatedUserProfileDetails from '../../../Profile/AuthenticatedUserProfileDetails';
import {
  fakeSilverAuthenticatedUser,
  fakeAuthenticatedUserLoggingIn,
} from '../../../fixtures/GDevelopServicesTestData';
export default {
  title: 'Profile/AuthenticatedUserProfileDetails',
  component: AuthenticatedUserProfileDetails,
  decorators: [paperDecorator],
};

export const Default = () => (
  <AuthenticatedUserProfileDetails
    authenticatedUser={fakeSilverAuthenticatedUser}
    onOpenEditProfileDialog={action('onOpenEditProfileDialog')}
    onOpenChangeEmailDialog={action('onOpenChangeEmailDialog')}
  />
);
export const Loading = () => (
  <AuthenticatedUserProfileDetails
    authenticatedUser={fakeAuthenticatedUserLoggingIn}
    onOpenEditProfileDialog={action('onOpenEditProfileDialog')}
    onOpenChangeEmailDialog={action('onOpenChangeEmailDialog')}
  />
);
