// @flow
import * as React from 'react';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import CreateAccountDialog from '../../../Profile/CreateAccountDialog';

export default {
  title: 'Profile/CreateAccountDialog',
  component: CreateAccountDialog,
  decorators: [paperDecorator, muiDecorator],
};

const defaultProps = {
  onClose: () => {},
  onGoToLogin: () => {},
  createAccountInProgress: false,
  onCreateAccount: async () => {},
  error: null,
};
export const Default = () => <CreateAccountDialog {...defaultProps} />;

export const PasswordErrorFromBackend = () => (
  <CreateAccountDialog
    {...defaultProps}
    error={{ code: 'auth/weak-password' }}
  />
);

export const EmailErrorFromBackend = () => (
  <CreateAccountDialog
    {...defaultProps}
    error={{ code: 'auth/invalid-email' }}
  />
);

export const Submitting = () => (
  <CreateAccountDialog {...defaultProps} createAccountInProgress />
);
