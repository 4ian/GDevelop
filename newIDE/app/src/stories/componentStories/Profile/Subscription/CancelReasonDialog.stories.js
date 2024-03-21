// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../../../../Profile/AuthenticatedUserContext';
import {
  fakeSilverAuthenticatedUser,
  fakeNotAuthenticatedUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import CancelReasonDialog from '../../../../Profile/Subscription/CancelReasonDialog';
import AlertProvider from '../../../../UI/Alert/AlertProvider';

export default {
  title: 'Subscription/CancelReasonDialog',
  component: CancelReasonDialog,
  decorators: [paperDecorator, muiDecorator],
};

const CancelReasonDialogWrapper = ({
  authenticatedUser,
}: {
  authenticatedUser: AuthenticatedUser,
}) => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider value={authenticatedUser}>
        <CancelReasonDialog
          onClose={() => action('on close')()}
          onCloseAfterSuccess={action('on close after success')}
        />
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};

export const Loading = () => (
  <CancelReasonDialogWrapper authenticatedUser={fakeNotAuthenticatedUser} />
);

export const Default = () => (
  <CancelReasonDialogWrapper authenticatedUser={fakeSilverAuthenticatedUser} />
);
