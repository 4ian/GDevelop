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
export const Default = (): React.Node => (
  <CreateAccountDialog {...defaultProps} />
);

export const PasswordErrorFromBackend = (): React.Node => (
  <CreateAccountDialog
    {...defaultProps}
    error={{ code: 'auth/weak-password' }}
  />
);

export const EmailErrorFromBackend = (): React.Node => (
  <CreateAccountDialog
    {...defaultProps}
    error={{ code: 'auth/invalid-email' }}
  />
);

export const AccountExists = (): React.Node => (
  <CreateAccountDialog
    {...defaultProps}
    error={{ code: 'auth/account-exists-with-different-credential' }}
  />
);

export const Submitting = (): React.Node => (
  <CreateAccountDialog {...defaultProps} createAccountInProgress />
);
