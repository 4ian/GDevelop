// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import {
  fakeSilverAuthenticatedUser,
  fakeNotAuthenticatedUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import CancelReasonDialog from '../../../../Profile/Subscription/CancelReasonDialog';

export default {
  title: 'Subscription/CancelReasonDialog',
  component: CancelReasonDialog,
  decorators: [paperDecorator],
};

export const Loading = () => (
  <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
    <CancelReasonDialog
      onClose={() => action('on close')()}
      onCloseAfterSuccess={action('on close after success')}
    />
  </AuthenticatedUserContext.Provider>
);

export const Default = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <CancelReasonDialog
      onClose={() => action('on close')()}
      onCloseAfterSuccess={action('on close after success')}
    />
  </AuthenticatedUserContext.Provider>
);
