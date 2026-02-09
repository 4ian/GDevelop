// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import CreateAccountDialog from '../../../Profile/CreateAccountDialog';

export default {
  title: 'Profile/CreateAccountDialog',
  component: CreateAccountDialog,
  decorators: [paperDecorator],
};

const defaultProps = {
  onClose: () => action('onClose')(),
  onGoToLogin: action('onGoToLogin'),
  onCreateAccount: action('onCreateAccount'),
  onLoginWithProvider: action('onLoginWithProvider'),
  createAccountInProgress: false,
  error: null,
};
export const Default = (): renders* => <CreateAccountDialog {...defaultProps} />;

export const PasswordErrorFromBackend = (): renders* => (
  <CreateAccountDialog
    {...defaultProps}
    error={{ code: 'auth/weak-password' }}
  />
);

export const EmailErrorFromBackend = (): renders* => (
  <CreateAccountDialog
    {...defaultProps}
    error={{ code: 'auth/invalid-email' }}
  />
);

export const AccountExists = (): renders* => (
  <CreateAccountDialog
    {...defaultProps}
    error={{ code: 'auth/account-exists-with-different-credential' }}
  />
);

export const Submitting = (): renders* => (
  <CreateAccountDialog {...defaultProps} createAccountInProgress />
);
